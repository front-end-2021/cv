#include "game/Production.h"
#include <algorithm>
#include <cmath>
#include "game/Economy.h"
#include "game/PathService.h"
#include "game/Work.h"

namespace {
    // Ô trống để đơn vị mới xuất hiện: tâm các ô bao quanh công trình, đứng được và không đè lên lính nào.
    // Ưu tiên ô gần điểm tập kết (hoặc phía dưới công trình nếu chưa đặt).
    bool FindSpawnSpot(const GameState& g, const Building& b, Waypoint& out) {
        const float ts = g.map.tileSize;
        Waypoint prefer = { b.fp.CenterX(), b.fp.bottom + 2.0f * ts };
        if (b.hasRally) prefer = b.rally;

        float best = 1e30f;
        bool found = false;
        for (int r = b.fp.row - 1; r <= b.fp.row + b.fp.h; ++r) {
            for (int c = b.fp.col - 1; c <= b.fp.col + b.fp.w; ++c) {
                const bool border = (r == b.fp.row - 1 || r == b.fp.row + b.fp.h || c == b.fp.col - 1 || c == b.fp.col + b.fp.w);
                if (!border) continue;
                const Waypoint p = { (static_cast<float>(c) + 0.5f) * ts, (static_cast<float>(r) + 0.5f) * ts };
                if (!g.map.CanBoxStandAt(p.x, p.y, kSquareSize)) continue;
                bool crowded = false;
                for (const auto& u : g.units) {
                    if (u.IsAlive() && std::hypot(u.x - p.x, u.y - p.y) < kSquareSize * 0.9f) { crowded = true; break; }
                }
                if (crowded) continue;
                const float d = std::hypot(p.x - prefer.x, p.y - prefer.y);
                if (d < best) { best = d; out = p; found = true; }
            }
        }
        return found;
    }

    void SpawnTrainedUnit(GameState& g, const Building& b, int unitType, const Waypoint& spot) {
        Unit& u = g.AddUnit(spot.x, spot.y, b.team, unitType);
        if (b.team == Team::Enemy) { // quân địch có chỗ để quay về, như lính dựng từ file map
            u.hasHome = true;
            u.home = spot;
        }
        if (!b.hasRally) return;
        if (u.IsWorker() && g.FindResource(b.rallyResourceId)) {
            OrderGather(u, b.rallyResourceId);
        }
        else {
            OrderMoveTo(g, u, b.rally.x, b.rally.y);
        }
    }
}

bool CanProduce(const GameState& g, const Building& b, int unitTypeIndex) {
    if (b.typeId < 0 || unitTypeIndex < 0 || unitTypeIndex >= g.unitTypes.Count()) return false;
    const std::string& name = g.unitTypes.Get(unitTypeIndex).name;
    for (const auto& n : g.buildingTypes.Get(b.typeId).produces) {
        if (n == name) return true;
    }
    return false;
}

EnqueueResult EnqueueUnit(GameState& g, EntityId buildingId, int unitTypeIndex) {
    Building* b = g.FindBuilding(buildingId);
    if (!b) return EnqueueResult::NoSuchBuilding;
    if (!b->complete) return EnqueueResult::NotComplete;
    if (!CanProduce(g, *b, unitTypeIndex)) return EnqueueResult::CannotProduce;
    if (static_cast<int>(b->queue.size()) >= kMaxQueueLength) return EnqueueResult::QueueFull;

    const UnitType& type = g.unitTypes.Get(unitTypeIndex);
    if (SupplyUsed(g, b->team) + type.supply > SupplyCap(g, b->team)) return EnqueueResult::NotEnoughSupply;
    if (!Spend(g, b->team, type.cost)) return EnqueueResult::NotEnoughGold;

    QueuedUnit q;
    q.unitType = unitTypeIndex;
    q.timeLeft = type.trainTime;
    q.totalTime = type.trainTime;
    b->queue.push_back(q);
    return EnqueueResult::Ok;
}

bool CancelQueuedUnit(GameState& g, EntityId buildingId, int index) {
    Building* b = g.FindBuilding(buildingId);
    if (!b || b->queue.empty()) return false;
    if (index < 0) index = static_cast<int>(b->queue.size()) - 1;
    if (index >= static_cast<int>(b->queue.size())) return false;
    Refund(g, b->team, g.unitTypes.Get(b->queue[static_cast<size_t>(index)].unitType).cost);
    b->queue.erase(b->queue.begin() + index); // slot được giải phóng vì SupplyUsed đếm theo hàng đợi
    return true;
}

void SetRallyPoint(Building& b, float x, float y, EntityId resourceId) {
    b.hasRally = true;
    b.rally = { x, y };
    b.rallyResourceId = resourceId;
}

void UpdateProduction(GameState& g, float dt) {
    for (auto& b : g.buildings) {
        if (!b.complete || b.queue.empty()) continue;
        QueuedUnit& q = b.queue.front();
        if (q.timeLeft > 0.0f) q.timeLeft -= dt;
        if (q.timeLeft > 0.0f) continue;

        Waypoint spot;
        if (!FindSpawnSpot(g, b, spot)) continue; // chưa có chỗ trống quanh công trình: đứng chờ, giữ nguyên hàng đợi
        const int unitType = q.unitType;
        b.queue.erase(b.queue.begin()); // `q` không còn dùng được từ đây
        SpawnTrainedUnit(g, b, unitType, spot);
    }
}

const char* DescribeEnqueueResult(EnqueueResult r) {
    switch (r) {
    case EnqueueResult::Ok: return "";
    case EnqueueResult::NoSuchBuilding: return "No such building";
    case EnqueueResult::NotComplete: return "Building is not finished";
    case EnqueueResult::CannotProduce: return "This building cannot train that unit";
    case EnqueueResult::QueueFull: return "Queue is full";
    case EnqueueResult::NotEnoughGold: return "Not enough gold";
    case EnqueueResult::NotEnoughSupply: return "Not enough supply: build a House";
    }
    return "";
}
