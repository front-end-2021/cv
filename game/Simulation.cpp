#include "game/Simulation.h"
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>
#include "Pathfinder.h"
#include "game/Ai.h"
#include "game/World.h"

namespace {
    // Một tick logic cho một Unit (cả hai phe): lệnh tấn công -> di chuyển -> state machine.
    // Con trỏ `target` tra từ ID chỉ sống trong hàm này (vector units không đổi kích thước giữa chừng).
    void UpdateUnit(GameState& g, Unit& u, float dt) {
        u.hurtTimer = std::max(0.0f, u.hurtTimer - dt);

        // 0. Đã chết (hoặc vừa hết máu): chỉ chạy animation chết.
        if (u.state == UnitState::Dead || !u.IsAlive()) {
            u.UpdateState(dt, nullptr, false);
            return;
        }
        if (u.grudgeTimer > 0.0f) {
            u.grudgeTimer -= dt;
            if (u.grudgeTimer <= 0.0f) u.lastAttackerId = kNoEntity; // hết hạn đánh trả
        }

        // 1. Lệnh tấn công: mục tiêu chết/biến mất thì hết lệnh; ngoài tầm thì đuổi theo.
        Unit* target = g.FindUnit(u.attackTargetId);
        if (u.HasTarget() && (!target || !target->IsAlive())) {
            u.ClearTarget();
            target = nullptr;
        }
        if (target && u.state != UnitState::Attack && !u.InAttackRange(*target)) {
            u.repathTimer -= dt;
            // Tính lại đường khi chưa có đường, hoặc khi mục tiêu đã chạy đi chỗ khác.
            const float tx = target->x;
            const float ty = target->y;
            const bool targetMoved = std::hypot(tx - u.chaseGoalX, ty - u.chaseGoalY) > g.map.tileSize * 0.5f;
            if ((u.path.empty() || targetMoved) && u.repathTimer <= 0.0f) {
                u.path = Pathfinder::FindPath(g.map, u.x, u.y, tx, ty);
                u.chaseGoalX = tx;
                u.chaseGoalY = ty;
                // Bỏ các mốc trùng vị trí hiện tại để không bị nháy sang Walk 1 tick.
                while (!u.path.empty() && std::hypot(u.path.front().x - u.x, u.path.front().y - u.y) < 1.0f) {
                    u.path.erase(u.path.begin());
                }
                u.repathTimer = 0.25f;
                if (u.path.empty()) { // không có đường tới -> bỏ lệnh
                    u.ClearTarget();
                    target = nullptr;
                }
            }
        }

        // 2. Di chuyển lần lượt qua từng điểm mốc trong path (không di chuyển khi đang ra đòn)
        if (u.state != UnitState::Attack && !u.path.empty()) {
            const Waypoint targetWp = u.path.front();
            const float toTargetX = targetWp.x - u.x;
            const float toTargetY = targetWp.y - u.y;
            const float dist = std::sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
            const float stepDist = u.MoveSpeed * dt;

            if (dist <= stepDist) {
                u.x = targetWp.x;
                u.y = targetWp.y;
                u.path.erase(u.path.begin()); // Đã tới mốc -> chuyển sang mốc kế tiếp
            }
            else {
                u.x += (toTargetX / dist) * stepDist;
                u.y += (toTargetY / dist) * stepDist;
            }
        }

        // 3. Tới tầm đánh thì dừng lại.
        bool inRange = false;
        if (target && target->IsAlive()) {
            inRange = u.InAttackRange(*target);
            if (inRange) u.path.clear();
        }

        // 4. State machine; trả về true ở khung trúng đòn -> gây sát thương.
        if (u.UpdateState(dt, target, inRange) && target) {
            const bool wasAlive = target->IsAlive();
            target->TakeDamage(u.Damage, u.id); // truyền ID kẻ đánh để nạn nhân biết đường đánh trả
            if (wasAlive && !target->IsAlive()) {
                SDL_Log("%s bi ha guc.", target->team == Team::Enemy ? "Linh dich" : "Linh phe ta");
            }
        }
    }

    // Đẩy nhẹ các ô vuông ra nếu chúng đè lên nhau.
    // Chỉ đẩy đơn vị đang ĐỨNG YÊN (không có path: Idle hoặc đang Attack);
    // hai đơn vị cùng đang đi thì để chúng tự đi.
    void ResolveUnitCollisions(GameState& g) {
        const float minDist = kSquareSize;
        for (size_t i = 0; i < g.units.size(); ++i) {
            for (size_t j = i + 1; j < g.units.size(); ++j) {
                Unit& a = g.units[i];
                Unit& b = g.units[j];
                if (!a.IsAlive() || !b.IsAlive()) continue; // xác không va chạm
                const bool aIdle = a.path.empty();
                const bool bIdle = b.path.empty();
                if (!aIdle && !bIdle) continue; // cả hai đang đi

                // Giữ nguyên đơn vị đang đi (hoặc đơn vị i), đẩy đơn vị còn lại.
                Unit& anchor = bIdle ? a : b;
                Unit& pushed = bIdle ? b : a;

                float dx = pushed.x - anchor.x;
                float dy = pushed.y - anchor.y;
                const float distSq = dx * dx + dy * dy;
                if (minDist * minDist <= distSq) continue; // không đè nhau

                float dist;
                if (distSq < 0.001f) { dx = 1.0f; dy = 0.0f; dist = 1.0f; }
                else { dist = std::sqrt(distSq); }

                // Đẩy toàn bộ phần chồng lấn sang đơn vị bị đẩy
                const float overlap = minDist - dist;
                const float nx = dx / dist;
                const float ny = dy / dist;

                const float nextX = pushed.x + nx * overlap;
                const float nextY = pushed.y + ny * overlap;
                if (g.map.CanBoxStandAt(nextX, nextY, kSquareSize)) {
                    pushed.x = std::floor(nextX);
                    pushed.y = std::floor(nextY);
                }
            }
        }
    }
}

void StepSimulation(GameState& g, float dt) {
    const float half = kSquareSize / 2.0f;

    // Ghi nhớ vị trí tick trước để nội suy khi vẽ.
    for (auto& u : g.units) u.SnapPrevToCurrent();

    // 1. Mỗi Unit (cả hai phe): tự chọn mục tiêu -> lệnh/di chuyển/trạng thái (Idle/Walk/Attack/Dead)
    for (auto& u : g.units) {
        AutoAcquireTarget(g, u, dt);
        UpdateUnit(g, u, dt);
    }

    // 2. Xử lý tách va chạm để các ô không đè lên nhau trên đường đi
    ResolveUnitCollisions(g);

    // 3. Kẹp biên bản đồ cho từng Unit
    for (auto& u : g.units) {
        u.x = std::clamp(u.x, half, g.map.WorldW() - half);
        u.y = std::clamp(u.y, half, g.map.WorldH() - half);
    }

    // 4. Xóa hẳn xác đã tan khỏi danh sách rồi xét thắng/thua
    RemoveGoneUnits(g);
    UpdateMatchResult(g);
    ++g.tickCount;
}
