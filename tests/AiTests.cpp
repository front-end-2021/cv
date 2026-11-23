#include <gtest/gtest.h>
#include <cmath>

#include "Common.h"
#include "game/Ai.h"
#include "game/GameState.h"

namespace {
    constexpr float kAggro = 200.0f;
    constexpr float kLeash = kAggro * kLeashFactor;
    constexpr float kDt = kTickDt;

    GameState MakeGame() {
        GameState g;
        g.unitTypes.LoadBuiltInDefaults();
        return g;
    }

    EntityId Add(GameState& g, Team team, float x, float y) {
        Unit& u = g.AddUnit(x, y, team, g.unitTypes.DefaultIndexFor(team));
        u.AggroRange = kAggro;
        return u.id;
    }

    Unit& U(GameState& g, EntityId id) { return *g.FindUnit(id); }
    void Kill(GameState& g, EntityId id) { U(g, id).HpValue = 0; }
}

// ===========================================================================
// FindNearestFoe
// ===========================================================================
TEST(FindNearestFoeTest, NoUnitsOtherThanSelf_ReturnsNull) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    EXPECT_EQ(FindNearestFoe(g, U(g, self), 1000.0f), nullptr);
}

TEST(FindNearestFoeTest, IgnoresSameTeam) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Player, 10, 0);
    Add(g, Team::Player, 20, 0);
    EXPECT_EQ(FindNearestFoe(g, U(g, self), 1000.0f), nullptr);
}

TEST(FindNearestFoeTest, PicksClosestOfSeveralFoes) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 150, 0);
    const EntityId closest = Add(g, Team::Enemy, 0, 60);
    Add(g, Team::Enemy, -100, -100);
    const Unit* foe = FindNearestFoe(g, U(g, self), 1000.0f);
    ASSERT_NE(foe, nullptr);
    EXPECT_EQ(foe->id, closest);
}

TEST(FindNearestFoeTest, AllyCloserThanFoe_StillReturnsFoe) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Player, 5, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    const Unit* r = FindNearestFoe(g, U(g, self), 1000.0f);
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, foe);
}

TEST(FindNearestFoeTest, SkipsDeadFoes) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId dead = Add(g, Team::Enemy, 20, 0);
    const EntityId alive = Add(g, Team::Enemy, 80, 0);
    Kill(g, dead);
    const Unit* r = FindNearestFoe(g, U(g, self), 1000.0f);
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, alive);
}

TEST(FindNearestFoeTest, OnlyDeadFoes_ReturnsNull) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Kill(g, Add(g, Team::Enemy, 20, 0));
    EXPECT_EQ(FindNearestFoe(g, U(g, self), 1000.0f), nullptr);
}

TEST(FindNearestFoeTest, FoeOutsideRadius_ReturnsNull) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 100.5f, 0);
    EXPECT_EQ(FindNearestFoe(g, U(g, self), 100.0f), nullptr);
}

TEST(FindNearestFoeTest, FoeExactlyOnRadius_IsIncluded) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 60, 80); // khoảng cách đúng 100
    const Unit* r = FindNearestFoe(g, U(g, self), 100.0f);
    EXPECT_TRUE(r != nullptr && r->id == foe);
}

TEST(FindNearestFoeTest, ZeroRadius_OnlyMatchesSamePosition) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 1, 0);
    EXPECT_EQ(FindNearestFoe(g, U(g, self), 0.0f), nullptr);
    const EntityId overlap = Add(g, Team::Enemy, 0, 0);
    const Unit* r = FindNearestFoe(g, U(g, self), 0.0f);
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, overlap);
}

TEST(FindNearestFoeTest, IgnoreParam_SkipsThatFoeAndReturnsNext) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId nearest = Add(g, Team::Enemy, 30, 0);
    const EntityId second = Add(g, Team::Enemy, 90, 0);
    const Unit* r = FindNearestFoe(g, U(g, self), 1000.0f, nearest);
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, second);
}

TEST(FindNearestFoeTest, IgnoreOnlyFoe_ReturnsNull) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId only = Add(g, Team::Enemy, 30, 0);
    EXPECT_EQ(FindNearestFoe(g, U(g, self), 1000.0f, only), nullptr);
}

TEST(FindNearestFoeTest, WorksForEnemyTeamToo) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    Add(g, Team::Enemy, 10, 0);
    const EntityId player = Add(g, Team::Player, 50, 0);
    const Unit* r = FindNearestFoe(g, U(g, self), 1000.0f);
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, player);
}

TEST(FindNearestFoeTest, EqualDistance_ReturnsOneOfTied) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId a = Add(g, Team::Enemy, 50, 0);
    const EntityId b = Add(g, Team::Enemy, -50, 0);
    const Unit* r = FindNearestFoe(g, U(g, self), 1000.0f);
    ASSERT_NE(r, nullptr);
    EXPECT_TRUE(r->id == a || r->id == b);
}

// ===========================================================================
// AutoAcquireTarget — điều kiện thoát sớm
// ===========================================================================
TEST(AutoAcquireTest, DeadUnit_DoesNothing) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    Add(g, Team::Player, 50, 0);
    Kill(g, self);
    U(g, self).scanTimer = 0.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_EQ(U(g, self).scanTimer, 0.0f); // không chạm vào bộ đếm quét
}

TEST(AutoAcquireTest, StateDeadButHpPositive_DoesNothing) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    Add(g, Team::Player, 50, 0);
    U(g, self).state = UnitState::Dead;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
}

// ===========================================================================
// AutoAcquireTarget — bộ nhớ "mục tiêu không với tới"
// ===========================================================================
TEST(AutoAcquireTargetTest, UnreachableTimer_CountsDown) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Unit& u = U(g, self);
    u.unreachableTargetId = 99;
    u.unreachableTimer = 1.0f;
    AutoAcquireTarget(g, u, 0.25f);
    EXPECT_NEAR(u.unreachableTimer, 0.75f, 1e-5f);
    EXPECT_EQ(u.unreachableTargetId, 99u);
}

TEST(AutoAcquireTargetTest, UnreachableTimerExpires_ForgetsTarget) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Unit& u = U(g, self);
    u.unreachableTargetId = 99;
    u.unreachableTimer = 0.1f;
    AutoAcquireTarget(g, u, 0.2f);
    EXPECT_TRUE(u.unreachableTimer <= 0.0f);
    EXPECT_EQ(u.unreachableTargetId, kNoEntity);
}

TEST(AutoAcquireTargetTest, UnreachableFoeIgnoredWhileRemembered_ThenReacquiredAfterExpiry) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    Unit& u = U(g, self);
    u.unreachableTargetId = foe;
    u.unreachableTimer = 0.5f;

    AutoAcquireTarget(g, u, 0.1f);         // còn nhớ -> bỏ qua
    EXPECT_TRUE(!u.HasTarget());

    u.scanTimer = 0.0f;
    AutoAcquireTarget(g, u, 0.5f);         // hết hạn -> được chọn lại
    EXPECT_EQ(u.attackTargetId, foe);
}

TEST(AutoAcquireTargetTest, ScanSkipsUnreachableFoe_PicksAnother) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId blocked = Add(g, Team::Enemy, 40, 0);
    const EntityId other = Add(g, Team::Enemy, 150, 0);
    Unit& u = U(g, self);
    u.unreachableTargetId = blocked;
    u.unreachableTimer = kUnreachableMemory;
    AutoAcquireTarget(g, u, kDt);
    EXPECT_EQ(u.attackTargetId, other);
}

// ===========================================================================
// AutoAcquireTarget — mục tiêu hiện có
// ===========================================================================
TEST(AutoAcquireTargetTest, TargetDied_ClearsOrder) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    U(g, self).OrderAttack(foe, false);
    U(g, self).scanTimer = 10.0f; // chặn bước quét để chỉ kiểm tra việc xóa lệnh
    Kill(g, foe);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_TRUE(!U(g, self).autoTarget);
}

TEST(AutoAcquireTargetTest, TargetRemovedFromWorld_ClearsOrder) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    U(g, self).OrderAttack(12345, true); // ID không tồn tại
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
}

TEST(AutoAcquireTargetTest, TargetDied_SwitchesToNextFoeSameTick) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId dead = Add(g, Team::Player, 50, 0);
    const EntityId next = Add(g, Team::Player, 120, 0);
    U(g, self).OrderAttack(dead, true);
    Kill(g, dead);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, next);
    EXPECT_TRUE(U(g, self).autoTarget);
}

TEST(AutoAcquireTargetTest, AutoTargetWithinLeash_KeepsTargetAndSkipsScan) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId foe = Add(g, Team::Player, kLeash - 1.0f, 0);
    Add(g, Team::Player, 30, 0);             // kẻ gần hơn nhưng không được đổi mục tiêu
    U(g, self).OrderAttack(foe, true);
    U(g, self).scanTimer = 0.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    EXPECT_EQ(U(g, self).scanTimer, 0.0f);     // thoát trước bước quét
}

TEST(AutoAcquireTargetTest, AutoTargetBeyondLeash_GivesUpAndForgetsGrudge) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId foe = Add(g, Team::Player, kLeash + 1.0f, 0);
    Unit& u = U(g, self);
    u.OrderAttack(foe, true);
    u.lastAttackerId = foe;
    u.scanTimer = 10.0f;
    AutoAcquireTarget(g, u, kDt);
    EXPECT_TRUE(!u.HasTarget());
    EXPECT_EQ(u.lastAttackerId, kNoEntity);
}

TEST(AutoAcquireTargetTest, AutoTargetExactlyAtLeash_IsKept) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId foe = Add(g, Team::Player, kLeash, 0);
    U(g, self).OrderAttack(foe, true);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
}

TEST(AutoAcquireTargetTest, PlayerOrderedTargetBeyondLeash_IsKept) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, kLeash * 3.0f, 0);
    U(g, self).OrderAttack(foe, false);       // lệnh của người chơi: đuổi tới cùng
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    EXPECT_TRUE(!U(g, self).autoTarget);
}

// ===========================================================================
// AutoAcquireTarget — lính phe ta đang theo lệnh đi
// ===========================================================================
TEST(AutoAcquireTargetTest, PlayerWithMoveGoal_DoesNotAcquire) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 50, 0);
    U(g, self).StartMoveOrder(500, 500);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_TRUE(U(g, self).hasMoveGoal);
}

TEST(AutoAcquireTargetTest, PlayerWithPathOnly_DoesNotAcquire) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 50, 0);
    U(g, self).path.assign({ Waypoint{ 300, 0 } });
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
}

TEST(AutoAcquireTargetTest, PlayerWithMoveGoal_DoesNotRetaliate) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId attacker = Add(g, Team::Enemy, 50, 0);
    U(g, self).StartMoveOrder(500, 500);
    U(g, self).lastAttackerId = attacker;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_EQ(U(g, self).lastAttackerId, attacker); // mối thù vẫn được giữ cho tới khi dừng lại
}

TEST(AutoAcquireTargetTest, EnemyWithMoveGoal_StillAcquires) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId foe = Add(g, Team::Player, 50, 0);
    U(g, self).StartMoveOrder(500, 500);     // ví dụ: đang về nhà
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    EXPECT_TRUE(U(g, self).autoTarget);
    EXPECT_TRUE(!U(g, self).hasMoveGoal);          // OrderAttack hủy lệnh đi
}

TEST(AutoAcquireTargetTest, IdlePlayer_DefendsItself) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    EXPECT_TRUE(U(g, self).autoTarget);
}

// ===========================================================================
// AutoAcquireTarget — đánh trả
// ===========================================================================
TEST(AutoAcquireTargetTest, Retaliates_EvenOutsideAggroButWithinLeash) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId attacker = Add(g, Team::Player, (kAggro + kLeash) * 0.5f, 0);
    U(g, self).lastAttackerId = attacker;
    U(g, self).scanTimer = 10.0f;            // đánh trả không phụ thuộc chu kỳ quét
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, attacker);
    EXPECT_TRUE(U(g, self).autoTarget);
}

TEST(AutoAcquireTargetTest, RetaliationPreferredOverCloserFoe) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 20, 0);
    const EntityId attacker = Add(g, Team::Enemy, 150, 0);
    U(g, self).lastAttackerId = attacker;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, attacker);
}

TEST(AutoAcquireTargetTest, AttackerBeyondLeash_ForgetsGrudge) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId attacker = Add(g, Team::Player, kLeash + 10.0f, 0);
    U(g, self).lastAttackerId = attacker;
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_EQ(U(g, self).lastAttackerId, kNoEntity);
}

TEST(AutoAcquireTargetTest, AttackerDead_ForgetsGrudgeAndScans) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId attacker = Add(g, Team::Player, 50, 0);
    const EntityId other = Add(g, Team::Player, 120, 0);
    U(g, self).lastAttackerId = attacker;
    Kill(g, attacker);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).lastAttackerId, kNoEntity);
    EXPECT_EQ(U(g, self).attackTargetId, other);
}

TEST(AutoAcquireTargetTest, AttackerMissingFromWorld_ForgetsGrudge) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    U(g, self).lastAttackerId = 4242;
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).lastAttackerId, kNoEntity);
    EXPECT_TRUE(!U(g, self).HasTarget());
}

TEST(AutoAcquireTargetTest, AttackerMarkedUnreachable_NotRetaliated) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId attacker = Add(g, Team::Player, 50, 0);
    Unit& u = U(g, self);
    u.lastAttackerId = attacker;
    u.unreachableTargetId = attacker;
    u.unreachableTimer = kUnreachableMemory;
    AutoAcquireTarget(g, u, kDt);
    EXPECT_TRUE(!u.HasTarget());
    EXPECT_EQ(u.lastAttackerId, kNoEntity);
}

TEST(AutoAcquireTargetTest, TakeDamageThenRetaliate_EndToEnd) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId attacker = Add(g, Team::Enemy, 60, 0);
    U(g, self).TakeDamage(5, attacker);
    EXPECT_EQ(U(g, self).lastAttackerId, attacker);
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, attacker);
}

// ===========================================================================
// AutoAcquireTarget — quét định kỳ
// ===========================================================================
TEST(AutoAcquireTargetTest, ScanTimerNotElapsed_NoScan) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 50, 0);
    U(g, self).scanTimer = 0.15f;
    AutoAcquireTarget(g, U(g, self), 0.1f);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_TRUE(std::fabs(U(g, self).scanTimer - 0.05f) < 1e-5f);
}

TEST(AutoAcquireTargetTest, ScanTimerElapsed_AcquiresAndResetsTimer) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 50, 0);
    U(g, self).scanTimer = 0.05f;
    AutoAcquireTarget(g, U(g, self), 0.1f);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    EXPECT_EQ(U(g, self).scanTimer, kScanInterval);
}

TEST(AutoAcquireTargetTest, ScanFindsNothing_ResetsTimer) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, kAggro + 50.0f, 0);   // ngoài tầm phát hiện
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_EQ(U(g, self).scanTimer, kScanInterval);
}

TEST(AutoAcquireTargetTest, ScanUsesUnitAggroRange) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 300, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());           // 300 > kAggro

    U(g, self).AggroRange = 400.0f;
    U(g, self).scanTimer = 0.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
}

TEST(AutoAcquireTargetTest, ScansAtMostEveryInterval) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    AutoAcquireTarget(g, U(g, self), kDt);    // lần quét đầu: không có ai
    EXPECT_EQ(U(g, self).scanTimer, kScanInterval);

    const EntityId foe = Add(g, Team::Enemy, 50, 0); // kẻ địch xuất hiện ngay sau đó
    int ticks = 0;
    while (!U(g, self).HasTarget() && ticks < 100) { AutoAcquireTarget(g, U(g, self), kDt); ++ticks; }
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    // Phải đợi đủ kScanInterval (khoảng 6 tick ở 30 tick/giây), không sớm hơn và không trễ quá 1 tick
    // (cho phép sai số làm tròn số thực khi trừ dần bộ đếm).
    const float waited = static_cast<float>(ticks) * kDt;
    EXPECT_TRUE(waited >= kScanInterval - 1e-4f);
    EXPECT_TRUE(waited <= kScanInterval + kDt + 1e-4f);
}

// ===========================================================================
// AutoAcquireTarget — AI quay về chỗ cũ
// ===========================================================================
static EntityId MakeEnemyAwayFromHome(GameState& g, float homeDist) {
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    Unit& u = U(g, self);
    u.hasHome = true;
    u.home = { homeDist, 0.0f };
    return self;
}

TEST(AutoAcquireTargetTest, EnemyIdleFarFromHome_OrdersMoveHome) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    AutoAcquireTarget(g, U(g, self), kDt);
    const Unit& u = U(g, self);
    EXPECT_TRUE(u.hasMoveGoal);
    EXPECT_TRUE(u.moveGoal.x == 500.0f && u.moveGoal.y == 0.0f);
    EXPECT_TRUE(u.pathPending);
    EXPECT_EQ(g.pathQueue.size(), 1);
    if (!g.pathQueue.empty()) {
        const PathRequest& req = g.pathQueue.front();
        EXPECT_EQ(req.unit, self);
        EXPECT_EQ(req.purpose, PathPurpose::Move);
        EXPECT_TRUE(req.goalX == 500.0f && req.goalY == 0.0f);
        EXPECT_EQ(req.ticket, u.pathTicket);
    }
}

TEST(AutoAcquireTargetTest, EnemyNearHome_DoesNotMove) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, kHomeArriveDist - 1.0f);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).hasMoveGoal);
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(AutoAcquireTargetTest, EnemyExactlyAtArriveDist_DoesNotMove) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, kHomeArriveDist);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(AutoAcquireTargetTest, EnemyWithoutHome_DoesNotMove) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    U(g, self).hasHome = false;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).hasMoveGoal);
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(AutoAcquireTargetTest, PlayerUnitWithHome_NeverReturnsHome) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    U(g, self).hasHome = true;
    U(g, self).home = { 500.0f, 0.0f };
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).hasMoveGoal);
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(AutoAcquireTargetTest, EnemyAlreadyHeadingHome_NoDuplicateRequest) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(g.pathQueue.size(), 1);
    for (int i = 0; i < 30; ++i) AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(g.pathQueue.size(), 1);           // hasMoveGoal = true -> không xin thêm đường
}

TEST(AutoAcquireTargetTest, EnemyFollowingPath_DoesNotRequestHome) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    U(g, self).path.assign({ Waypoint{ 100, 0 } });
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(AutoAcquireTargetTest, EnemyMidAttackAnimation_DoesNotReturnHome) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    U(g, self).state = UnitState::Attack;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(AutoAcquireTargetTest, EnemyWaitingForScan_DoesNotReturnHome) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    U(g, self).scanTimer = 1.0f;              // chưa tới lượt quét -> chưa kết luận "hết việc"
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(AutoAcquireTargetTest, EnemyFarFromHomeWithFoeInRange_AttacksInsteadOfReturning) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    const EntityId foe = Add(g, Team::Player, 80, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(AutoAcquireTargetTest, EnemyGivesUpChase_ThenHeadsHome) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    const EntityId foe = Add(g, Team::Player, kLeash + 50.0f, 0);
    U(g, self).OrderAttack(foe, true);
    AutoAcquireTarget(g, U(g, self), kDt);    // bỏ cuộc, quét không thấy ai trong tầm, về nhà
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_TRUE(U(g, self).hasMoveGoal);
    EXPECT_EQ(g.pathQueue.size(), 1);
}

// (Xóa bỏ hàm int main(...) cũ vì GTest::gtest_main đã cung cấp sẵn)
