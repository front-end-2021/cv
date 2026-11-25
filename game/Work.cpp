#include "game/Work.h"
#include <algorithm>
#include <cmath>
#include "game/Construction.h"
#include "game/Economy.h"
#include "game/PathService.h"

namespace {
    bool IsMoving(const Unit& u) { return u.hasMoveGoal || !u.path.empty() || u.pathPending; }

    // Dừng mọi di chuyển (giữ nguyên việc đang làm).
    void StopMoving(Unit& u) {
        u.path.clear();
        u.hasMoveGoal = false;
        u.unstickCount = 0;
        u.CancelPathRequest();
    }

    bool WithinReach(const Unit& u, const Footprint& fp) {
        return fp.DistanceToPoint(u.x, u.y) - kSquareSize * 0.5f <= kWorkReach;
    }

    // Đổi chặng (đang đi mỏ -> đi kho, đổi mỏ, đổi kho...): bỏ chuyến đi dở và quên các lần thất bại của chặng cũ.
    void SwitchLeg(Unit& u) {
        StopMoving(u);
        u.job.moveIssued = false;
        u.job.failures = 0;
        u.job.retryTimer = 0.0f;
    }

    // Đưa thợ tới chỗ làm việc cạnh `fp`. true: đã tới nơi (thợ đứng yên, việc có thể làm tiếp).
    // Có thể bỏ việc (kind = None) nếu thất bại quá nhiều: người gọi phải kiểm tra lại u.job.kind.
    bool GoTo(GameState& g, Unit& u, const Footprint& fp, float dt) {
        WorkJob& j = u.job;
        if (WithinReach(u, fp)) {
            if (IsMoving(u)) StopMoving(u);
            j.moveIssued = false;
            j.failures = 0;
            j.retryTimer = 0.0f;
            return true;
        }
        if (IsMoving(u)) return false; // đang trên đường

        // Đứng yên mà chưa tới nơi. Nếu vừa đi xong một chuyến thì chuyến đó thất bại (không có đường, bị chặn...).
        if (j.moveIssued) {
            j.moveIssued = false;
            ++j.failures;
            j.retryTimer = kJobRetryDelay;
        }
        if (j.failures >= kJobMaxFailures) {
            u.CancelJob();
            return false;
        }
        if (j.retryTimer > 0.0f) {
            j.retryTimer -= dt;
            return false;
        }
        Waypoint p;
        if (!FindApproachPoint(g, u, fp, p)) {
            ++j.failures;
            j.retryTimer = kJobRetryDelay;
            return false;
        }
        OrderMoveTo(g, u, p.x, p.y);
        j.moveIssued = true;
        return false;
    }

    // Chuẩn bị nhận việc mới: bỏ việc cũ, bỏ lệnh đi / đánh đang có, dừng lại (kể cả đòn đang ra).
    void HaltForNewJob(Unit& u) {
        u.OrderMove({});
        u.CancelJob();
    }

    bool IsUsableDepot(const Building* d, Team team) {
        return d && d->complete && d->dropoff && d->team == team;
    }

    void UpdateGather(GameState& g, Unit& u, float dt) {
        WorkJob& j = u.job;

        // 1. Đang đi đào: mỏ cạn/biến mất thì tìm mỏ khác; đầy tay (hoặc hết mỏ mà còn hàng) thì chuyển sang đi nộp.
        if (!j.returning) {
            ResourceNode* mine = g.FindResource(j.target);
            if (mine && mine->Depleted()) mine = nullptr;
            if (!mine) {
                mine = FindNearestMine(g, u.x, u.y, kAutoMineRadius);
                if (mine) {
                    j.target = mine->id;
                    SwitchLeg(u);
                }
            }
            if (u.carrying >= u.carryCapacity || (!mine && u.carrying > 0)) {
                j.returning = true;
                j.depot = kNoEntity;
                SwitchLeg(u);
            }
            else if (!mine) {
                u.CancelJob(); // không còn mỏ nào để đào và tay không
                return;
            }
        }

        // 2. Đi nộp hàng.
        if (j.returning) {
            Building* depot = g.FindBuilding(j.depot);
            if (!IsUsableDepot(depot, u.team)) {
                depot = FindNearestDepot(g, u.team, u.x, u.y);
                const EntityId id = depot ? depot->id : kNoEntity;
                if (id != j.depot) { j.depot = id; SwitchLeg(u); }
            }
            if (!depot) return; // chưa có kho nào: đứng chờ, giữ hàng (có kho mới thì tự đi tiếp)
            if (GoTo(g, u, depot->fp, dt)) {
                g.Gold(u.team) += u.carrying; // vàng vào kho của phe
                u.carrying = 0;
                j.returning = false;
                SwitchLeg(u);
            }
            return;
        }

        // 3. Đào.
        ResourceNode* mine = g.FindResource(j.target);
        if (!mine) return;
        if (GoTo(g, u, mine->fp, dt)) {
            u.gatherAccum += kGatherPerSecond * static_cast<float>(u.BuildSpeed) / 100.0f * dt;
            const int want = static_cast<int>(u.gatherAccum);
            if (want > 0) {
                const int got = std::min({ want, u.carryCapacity - u.carrying, mine->amount });
                u.carrying += got;
                mine->amount -= got;
                // Phần lẻ chỉ giữ lại khi lấy đủ phần được phép; đầy tay hoặc cạn mỏ thì bỏ phần dư.
                u.gatherAccum = (got == want) ? u.gatherAccum - static_cast<float>(want) : 0.0f;
            }
        }
    }

    void UpdateBuild(GameState& g, Unit& u, float dt) {
        Building* b = g.FindBuilding(u.job.target);
        if (!b || b->team != u.team || b->complete) { // xong rồi, bị hủy rồi, hoặc không phải của mình
            u.CancelJob();
            return;
        }
        if (GoTo(g, u, b->fp, dt)) {
            if (ApplyConstructionWork(*b, u, dt)) {
                SDL_Log("Cong trinh %s da xay xong.", b->label.c_str());
            }
        }
    }
}

bool OrderGather(Unit& u, EntityId mineId) {
    if (!u.IsWorker()) return false;
    HaltForNewJob(u);
    u.job.kind = JobKind::Gather;
    u.job.target = mineId;
    return true;
}

bool OrderBuild(Unit& u, EntityId buildingId) {
    if (!u.IsWorker()) return false;
    HaltForNewJob(u);
    u.job.kind = JobKind::Build;
    u.job.target = buildingId;
    return true;
}

bool OrderReturnCargo(Unit& u, EntityId depotId) {
    if (!u.IsWorker()) return false;
    const EntityId lastMine = (u.job.kind == JobKind::Gather) ? u.job.target : kNoEntity;
    HaltForNewJob(u);
    u.job.kind = JobKind::Gather;
    u.job.target = lastMine;
    u.job.depot = depotId;
    u.job.returning = true;
    return true;
}

void UpdateWorkerJob(GameState& g, Unit& u, float dt) {
    if (u.job.kind == JobKind::None) return;
    if (!u.IsAlive() || u.state == UnitState::Dead) { u.CancelJob(); return; }
    if (!u.IsWorker()) { u.CancelJob(); return; }
    if (u.state == UnitState::Attack) return; // đang ra đòn (người chơi ra lệnh đánh sẽ hủy việc; phòng hờ)

    switch (u.job.kind) {
    case JobKind::Gather: UpdateGather(g, u, dt); break;
    case JobKind::Build:  UpdateBuild(g, u, dt); break;
    case JobKind::None:   break;
    }
}

bool FindApproachPoint(const GameState& g, const Unit& u, const Footprint& fp, Waypoint& out) {
    const float ts = g.map.tileSize;
    float best = 1e30f;
    bool found = false;
    auto consider = [&](int r, int c) {
        if (!g.map.IsWalkableTile(r, c)) return;
        const Waypoint p = { (static_cast<float>(c) + 0.5f) * ts, (static_cast<float>(r) + 0.5f) * ts };
        // Mỗi lính khác (còn sống, không phải thợ này) đang đứng quanh ô cộng thêm "phí chen chúc".
        float crowd = 0.0f;
        for (const auto& o : g.units) {
            if (o.id != u.id && o.IsAlive() && std::hypot(o.x - p.x, o.y - p.y) < ts * 0.5f) crowd += 1.0f;
        }
        const float score = std::hypot(p.x - u.x, p.y - u.y) + crowd * ts * 0.7f;
        if (score < best) { best = score; out = p; found = true; }
    };
    for (int c = fp.col; c < fp.col + fp.w; ++c) { consider(fp.row - 1, c); consider(fp.row + fp.h, c); }
    for (int r = fp.row; r < fp.row + fp.h; ++r) { consider(r, fp.col - 1); consider(r, fp.col + fp.w); }
    return found;
}

Building* FindNearestDepot(GameState& g, Team team, float x, float y) {
    Building* best = nullptr;
    float bestDist = 1e30f;
    for (auto& b : g.buildings) {
        if (!IsUsableDepot(&b, team)) continue;
        const float d = b.fp.DistanceToPoint(x, y);
        if (d < bestDist) { bestDist = d; best = &b; }
    }
    return best;
}

ResourceNode* FindNearestMine(GameState& g, float x, float y, float radius) {
    ResourceNode* best = nullptr;
    float bestDist = radius;
    for (auto& n : g.resources) {
        if (n.Depleted()) continue;
        const float d = n.fp.DistanceToPoint(x, y);
        if (d <= bestDist) { bestDist = d; best = &n; }
    }
    return best;
}
