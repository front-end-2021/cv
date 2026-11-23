#include "game/Simulation.h"
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>
#include "game/Ai.h"
#include "game/Movement.h"
#include "game/PathService.h"
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

        // 1. Lệnh tấn công: mục tiêu chết/biến mất thì hết lệnh; ngoài tầm thì xin đường đuổi theo.
        Unit* target = g.FindUnit(u.attackTargetId);
        if (u.HasTarget() && (!target || !target->IsAlive())) {
            u.ClearTarget();
            target = nullptr;
        }
        if (target && u.state != UnitState::Attack && !u.InAttackRange(*target)) {
            u.repathTimer -= dt;
            // Xin đường khi chưa có đường (và chưa xin), hoặc khi mục tiêu đã chạy đi chỗ khác.
            const float tx = target->x;
            const float ty = target->y;
            const bool targetMoved = std::hypot(tx - u.chaseGoalX, ty - u.chaseGoalY) > g.map.tileSize * 0.5f;
            const bool needPath = (u.path.empty() && !u.pathPending) || targetMoved;
            if (needPath && u.repathTimer <= 0.0f) {
                // Đường được tính ở đầu tick kế tiếp (xem ProcessPathRequests). Trong lúc chờ lính cứ đi tiếp
                // theo đường cũ (nếu có). Không có đường tới -> ApplyPathResult sẽ bỏ lệnh.
                RequestPath(g, u, tx, ty, PathPurpose::Chase);
                u.chaseGoalX = tx;
                u.chaseGoalY = ty;
                u.repathTimer = 0.25f;
            }
        }

        // 2. Di chuyển dọc đường đi (không di chuyển khi đang ra đòn): kiểm tra tường, phát hiện kẹt.
        MoveUnitAlongPath(g, u, dt);

        // 3. Tới tầm đánh thì dừng lại.
        bool inRange = false;
        if (target && target->IsAlive()) {
            inRange = u.InAttackRange(*target);
            if (inRange) {
                u.path.clear();
                u.CancelPathRequest(); // yêu cầu đuổi theo đang chờ (nếu có) không còn cần nữa
            }
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
}

void StepSimulation(GameState& g, float dt) {
    const float half = kSquareSize / 2.0f;

    // Ghi nhớ vị trí tick trước để nội suy khi vẽ.
    for (auto& u : g.units) u.SnapPrevToCurrent();

    // 0. Phục vụ các yêu cầu tìm đường đã xếp hàng (trong ngân sách của một tick), để lính nhận đường rồi đi luôn tick này.
    ProcessPathRequests(g);

    // 1. Mỗi Unit (cả hai phe): tự chọn mục tiêu -> lệnh/di chuyển/trạng thái (Idle/Walk/Attack/Dead)
    for (auto& u : g.units) {
        AutoAcquireTarget(g, u, dt);
        UpdateUnit(g, u, dt);
    }

    // 2. Tách va chạm để các ô không đè lên nhau, kể cả khi cùng đang đi (xem game/Movement.cpp)
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
