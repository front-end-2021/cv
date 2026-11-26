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

Unit* FindFoeInReach(GameState& g, const Unit& self, EntityId ignore) {
    Unit* best = nullptr;
    float bestDist = 1e18f;
    for (auto& o : g.units) {
        if (o.team == self.team || !o.IsAlive() || o.id == ignore || !self.InAttackRange(o)) continue;
        const float d = self.DistanceTo(o);
        if (d < bestDist) { bestDist = d; best = &o; }
    }
    return best;
}

namespace {
    // Ra lệnh đánh một mục tiêu do bộ não tự chọn. Lính đang AttackMove thì nhớ là đang bận đánh giữa đường để xong còn đi tiếp.
    void EngageAuto(Unit& u, EntityId foeId) {
        u.OrderAttack(foeId, true);
        if (u.IsAttackMoving()) u.attackMoveEngaged = true;
    }
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
        // 1b. Giữ vị trí: mục tiêu đã bước ra khỏi tầm đánh thì thôi, không đuổi theo (đòn đang ra thì để đánh nốt).
        else if (u.IsHolding() && u.state != UnitState::Attack && !u.InAttackRange(*target)) {
            u.ClearTarget();
        }
    }
    if (u.HasTarget()) return; // đã có việc để làm

    // 1c. AttackMove: không còn mục tiêu giữa đường -> đi tiếp tới đích (đòn đang ra thì đợi đánh nốt); không đang bận đánh mà cũng hết đường đi -> đã tới nơi (hoặc không đi tiếp được): lệnh xong.
    if (u.IsAttackMoving()) {
        if (u.attackMoveEngaged) {
            if (u.state != UnitState::Attack) OrderAttackMoveTo(g, u, u.attackMoveGoal.x, u.attackMoveGoal.y);
        }
        else if (!u.hasMoveGoal && u.path.empty() && !u.pathPending) {
            u.ResetCombatMode();
        }
    }

    // 2. Lính phe ta đang theo lệnh đi (kể cả lúc còn chờ đường) hoặc đang làm việc (thợ) thì không tự ý đổi ý.
    //    AI địch thì không có lệnh nào khác. Riêng AttackMove là lệnh "vừa đi vừa đánh" nên vẫn tự chọn mục tiêu giữa đường.
    if (!aiControlled && !u.IsAttackMoving() && (u.hasMoveGoal || !u.path.empty() || u.job.kind != JobKind::None)) return;

    // Lính không tự đánh ai (AggroRange = 0, như thợ) thì giữ vị trí cũng chỉ là đứng yên.
    if (u.IsHolding() && u.AggroRange <= 0.0f) return;

    // 3. Đánh trả kẻ vừa đánh mình, miễn là nó chưa đứng quá xa (nếu không sẽ bị bỏ cuộc ngay ở bước 1). Đang giữ vị trí thì chỉ đánh trả kẻ đã lọt vào tầm đánh (không đuổi theo).
    if (u.lastAttackerId != kNoEntity) {
        const Unit* attacker = g.FindUnit(u.lastAttackerId);
        if (attacker && attacker->IsAlive() && attacker->id != u.unreachableTargetId &&
            (u.IsHolding() ? u.InAttackRange(*attacker) : u.DistanceTo(*attacker) <= u.AggroRange * kLeashFactor)) {
            EngageAuto(u, attacker->id);
            return;
        }
        u.lastAttackerId = kNoEntity;
    }

    // 4. Quét định kỳ tìm kẻ địch: trong tầm phát hiện (đang giữ vị trí thì chỉ trong tầm đánh).
    u.scanTimer -= dt;
    if (u.scanTimer > 0.0f) return;
    u.scanTimer = kScanInterval;
    const Unit* foe = u.IsHolding() ? FindFoeInReach(g, u, u.unreachableTargetId)
                                    : FindNearestFoe(g, u, u.AggroRange, u.unreachableTargetId);
    if (foe) {
        EngageAuto(u, foe->id);
        return;
    }

    // 5. Không còn việc gì: AI quay về chỗ cũ.
    if (aiControlled && u.hasHome && !u.hasMoveGoal && u.path.empty() && u.state != UnitState::Attack &&
        std::hypot(u.home.x - u.x, u.home.y - u.y) > kHomeArriveDist) {
        OrderMoveTo(g, u, u.home.x, u.home.y);
    }
}
