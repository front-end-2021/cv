#include "game/Ai.h"
#include <cmath>
#include "game/PathService.h"

Unit* FindNearestFoe(GameState& g, const Unit& self, float radius, EntityId ignore) {
    Unit* best = nullptr;
    float bestDist = radius;
    for (auto& o : g.units) {
        if (o.team == self.team || !o.IsAlive() || o.id == ignore) continue;
        const float d = self.DistanceTo(o);
        if (d <= bestDist) { bestDist = d; best = &o; }
    }
    return best;
}

void AutoAcquireTarget(GameState& g, Unit& u, float dt) {
    if (!u.IsAlive() || u.state == UnitState::Dead) return;
    const bool aiControlled = (u.team == Team::Enemy);

    // Hết thời hạn "không với tới" thì cho phép chọn lại mục tiêu đó.
    if (u.unreachableTimer > 0.0f) {
        u.unreachableTimer -= dt;
        if (u.unreachableTimer <= 0.0f) u.unreachableTargetId = kNoEntity;
    }

    // 0. Mục tiêu đã chết hoặc đã biến mất khỏi thế giới -> hết lệnh.
    if (u.HasTarget()) {
        const Unit* target = g.FindUnit(u.attackTargetId);
        if (!target || !target->IsAlive()) {
            u.ClearTarget();
        }
        // 1. Mục tiêu tự chọn mà chạy quá xa -> bỏ cuộc (lệnh do người chơi ra thì đuổi tới cùng).
        else if (u.autoTarget && u.DistanceTo(*target) > u.AggroRange * kLeashFactor) {
            u.ClearTarget();
            u.lastAttackerId = kNoEntity; // bỏ luôn mối thù, nếu không sẽ bị kéo lại ngay tick sau
        }
    }
    if (u.HasTarget()) return; // đã có việc để làm

    // 2. Lính phe ta đang theo lệnh đi (kể cả lúc còn chờ đường) thì không tự ý đổi ý. AI địch thì không có lệnh nào khác.
    if (!aiControlled && (u.hasMoveGoal || !u.path.empty())) return;

    // 3. Đánh trả kẻ vừa đánh mình, miễn là nó chưa đứng quá xa (nếu không sẽ bị bỏ cuộc ngay ở bước 1).
    if (u.lastAttackerId != kNoEntity) {
        const Unit* attacker = g.FindUnit(u.lastAttackerId);
        if (attacker && attacker->IsAlive() && attacker->id != u.unreachableTargetId &&
            u.DistanceTo(*attacker) <= u.AggroRange * kLeashFactor) {
            u.OrderAttack(attacker->id, true);
            return;
        }
        u.lastAttackerId = kNoEntity;
    }

    // 4. Quét định kỳ tìm kẻ địch trong tầm phát hiện.
    u.scanTimer -= dt;
    if (u.scanTimer > 0.0f) return;
    u.scanTimer = kScanInterval;
    if (const Unit* foe = FindNearestFoe(g, u, u.AggroRange, u.unreachableTargetId)) {
        u.OrderAttack(foe->id, true);
        return;
    }

    // 5. Không còn việc gì: AI quay về chỗ cũ.
    if (aiControlled && u.hasHome && !u.hasMoveGoal && u.path.empty() && u.state != UnitState::Attack &&
        std::hypot(u.home.x - u.x, u.home.y - u.y) > kHomeArriveDist) {
        OrderMoveTo(g, u, u.home.x, u.home.y);
    }
}
