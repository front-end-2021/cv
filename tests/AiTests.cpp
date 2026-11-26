#include <gtest/gtest.h>
#include <cmath>

#include "Common.h"
#include "game/Ai.h"
#include "game/GameState.h"
#include "game/PathService.h"

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

// ===========================================================================
// FindFoeInReach: chỉ xét kẻ thù mà lính đánh tới được mà không phải di chuyển (dùng cho Hold position)
// ===========================================================================
namespace {
    // Hai lính cùng cỡ hitbox: đánh tới được khi tâm cách nhau tối đa Range + kSquareSize.
    float ReachCenters(const GameState& g, EntityId id) { return g.FindUnit(id)->Range + kSquareSize; }
}

TEST(FindFoeInReachTest, NoFoes_ReturnsNull) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    EXPECT_EQ(FindFoeInReach(g, U(g, self)), nullptr);
}

TEST(FindFoeInReachTest, FoeInsideReach_IsReturned) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, ReachCenters(g, self) - 5.0f, 0);
    const Unit* r = FindFoeInReach(g, U(g, self));
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, foe);
}

TEST(FindFoeInReachTest, FoeExactlyAtReach_IsIncluded) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, ReachCenters(g, self), 0);
    const Unit* r = FindFoeInReach(g, U(g, self));
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, foe);
}

TEST(FindFoeInReachTest, FoeJustOutsideReach_ReturnsNull) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, ReachCenters(g, self) + 0.5f, 0);
    EXPECT_EQ(FindFoeInReach(g, U(g, self)), nullptr);
}

TEST(FindFoeInReachTest, FoeInsideAggroButOutsideReach_OnlyFindNearestFoeSeesIt) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 120, 0);   // trong aggro (200) nhưng xa hơn tầm đánh (60)
    EXPECT_EQ(FindFoeInReach(g, U(g, self)), nullptr);
    const Unit* r = FindNearestFoe(g, U(g, self), kAggro);
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, foe);
}

TEST(FindFoeInReachTest, IgnoresSameTeamAndDeadFoes) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Player, 30, 0);
    Kill(g, Add(g, Team::Enemy, 40, 0));
    EXPECT_EQ(FindFoeInReach(g, U(g, self)), nullptr);
}

TEST(FindFoeInReachTest, PicksNearestOfSeveralInReach) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 55, 0);
    const EntityId nearest = Add(g, Team::Enemy, 0, 45);
    Add(g, Team::Enemy, 500, 0);                         // ngoài tầm: không được xét
    const Unit* r = FindFoeInReach(g, U(g, self));
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, nearest);
}

TEST(FindFoeInReachTest, IgnoreParam_SkipsThatFoe) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId nearest = Add(g, Team::Enemy, 45, 0);
    const EntityId second = Add(g, Team::Enemy, 0, 55);
    const Unit* r = FindFoeInReach(g, U(g, self), nearest);
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, second);
    EXPECT_EQ(FindFoeInReach(g, U(g, self), second)->id, nearest);
}

TEST(FindFoeInReachTest, LongerRangeReachesFurther) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 150, 0);
    EXPECT_EQ(FindFoeInReach(g, U(g, self)), nullptr);   // Range mặc định 20
    U(g, self).Range = 120.0f;                           // như lính bắn cung: 120 + 40 = 160 >= 150
    const Unit* r = FindFoeInReach(g, U(g, self));
    ASSERT_NE(r, nullptr);
    EXPECT_EQ(r->id, foe);
}

// ===========================================================================
// AutoAcquireTarget — Hold position
// ===========================================================================
TEST(AutoAcquireHoldTest, FoeInAggroButOutOfReach_IsIgnored) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 120, 0);                  // lính thường sẽ đuổi theo; lính giữ vị trí thì không
    U(g, self).OrderHold();
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_TRUE(U(g, self).IsHolding());
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(AutoAcquireHoldTest, FoeInReach_IsAttacked) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 50, 0);
    U(g, self).OrderHold();
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    EXPECT_TRUE(U(g, self).autoTarget);
    EXPECT_TRUE(U(g, self).IsHolding());          // đánh tự chọn không làm mất chế độ giữ vị trí
    EXPECT_TRUE(!U(g, self).hasMoveGoal);
}

TEST(AutoAcquireHoldTest, TargetThatLeftReach_IsDroppedWithoutChasing) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 50, 0);
    U(g, self).OrderHold();
    AutoAcquireTarget(g, U(g, self), kDt);
    ASSERT_EQ(U(g, self).attackTargetId, foe);
    U(g, foe).x = 150.0f;                         // kẻ địch lùi ra khỏi tầm đánh (vẫn trong aggro)
    U(g, self).scanTimer = 10.0f;                 // không cho quét lại trong lượt này
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_TRUE(U(g, self).path.empty());
    EXPECT_TRUE(!U(g, self).pathPending);
    EXPECT_TRUE(g.pathQueue.empty());
    EXPECT_TRUE(U(g, self).IsHolding());
}

TEST(AutoAcquireHoldTest, TargetOutOfReachDuringSwing_IsKeptUntilSwingEnds) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 50, 0);
    U(g, self).OrderHold();
    U(g, self).OrderAttack(foe, true);
    U(g, self).state = UnitState::Attack;         // đang vung đòn: bỏ mục tiêu lúc này sẽ làm mất sát thương
    U(g, foe).x = 150.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    U(g, self).state = UnitState::Idle;           // đòn đã xong
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
}

TEST(AutoAcquireHoldTest, TargetInReach_IsKept) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 50, 0);
    U(g, self).OrderHold();
    U(g, self).OrderAttack(foe, true);
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
}

TEST(AutoAcquireHoldTest, OrderHoldWhileChasing_KeepsTargetOnlyIfInReach) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId far = Add(g, Team::Enemy, 150, 0);
    U(g, self).OrderAttack(far, false);           // người chơi đang ra lệnh đuổi theo
    U(g, self).OrderHold();                       // rồi bấm H
    EXPECT_TRUE(U(g, self).autoTarget);           // thành mục tiêu "tự chọn" để bị bỏ khi ngoài tầm
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
}

TEST(AutoAcquireHoldTest, Retaliates_OnlyAgainstAttackerInReach) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 30, 0);                   // kẻ gần hơn
    const EntityId attacker = Add(g, Team::Enemy, 0, 55);
    U(g, self).OrderHold();
    U(g, self).lastAttackerId = attacker;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, attacker);   // đánh trả được ưu tiên như lính thường
}

TEST(AutoAcquireHoldTest, AttackerOutOfReach_IsNotChasedAndGrudgeForgotten) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId attacker = Add(g, Team::Enemy, 150, 0);   // ví dụ lính bắn cung đứng xa
    U(g, self).OrderHold();
    U(g, self).lastAttackerId = attacker;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_EQ(U(g, self).lastAttackerId, kNoEntity);
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(AutoAcquireHoldTest, ZeroAggroUnit_NeverAutoAttacks) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    U(g, self).AggroRange = 0.0f;                 // như thợ: không tự đánh ai
    const EntityId foe = Add(g, Team::Enemy, 45, 0);
    U(g, self).OrderHold();
    U(g, self).lastAttackerId = foe;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
}

TEST(AutoAcquireHoldTest, ScanSkipsUnreachableFoe) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId nearest = Add(g, Team::Enemy, 45, 0);
    const EntityId other = Add(g, Team::Enemy, 0, 55);
    U(g, self).OrderHold();
    U(g, self).unreachableTargetId = nearest;
    U(g, self).unreachableTimer = 4.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, other);
}

TEST(AutoAcquireHoldTest, ScanTimerNotElapsed_NoScan) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 45, 0);
    U(g, self).OrderHold();
    U(g, self).scanTimer = 1.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
}

TEST(AutoAcquireHoldTest, DeadHoldingUnit_DoesNothing) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 45, 0);
    U(g, self).OrderHold();
    Kill(g, self);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
}

// ===========================================================================
// AutoAcquireTarget — Attack-move
// ===========================================================================
namespace {
    // Lính phe ta đang theo lệnh Attack-move tới (goalX, goalY), lệnh đi đã xếp hàng chờ đường.
    EntityId AddAttackMover(GameState& g, float x, float y, float goalX, float goalY) {
        const EntityId id = Add(g, Team::Player, x, y);
        OrderAttackMoveTo(g, U(g, id), goalX, goalY);
        return id;
    }
}

TEST(AutoAcquireAttackMoveTest, FoeInAggroWhileMoving_IsEngaged) {
    GameState g = MakeGame();
    const EntityId self = AddAttackMover(g, 0, 0, 500, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    ASSERT_TRUE(U(g, self).hasMoveGoal);          // đang theo lệnh đi: lính thường sẽ KHÔNG chọn mục tiêu (xem test PlayerWithMoveGoal)
    AutoAcquireTarget(g, U(g, self), kDt);
    const Unit& u = U(g, self);
    EXPECT_EQ(u.attackTargetId, foe);
    EXPECT_TRUE(u.autoTarget);
    EXPECT_TRUE(u.IsAttackMoving());
    EXPECT_TRUE(u.attackMoveEngaged);             // nhớ là đang bận giữa đường để xong còn đi tiếp
    EXPECT_TRUE(!u.hasMoveGoal);                  // OrderAttack hủy lệnh đi; đích vẫn còn trong attackMoveGoal
    EXPECT_TRUE(u.attackMoveGoal.x == 500.0f && u.attackMoveGoal.y == 0.0f);
    EXPECT_TRUE(!u.pathPending);                  // yêu cầu tìm đường tới đích bị hủy khi quay sang đánh
}

TEST(AutoAcquireAttackMoveTest, FoeOutsideAggro_IsIgnoredAndMoveContinues) {
    GameState g = MakeGame();
    const EntityId self = AddAttackMover(g, 0, 0, 500, 0);
    Add(g, Team::Enemy, kAggro + 50.0f, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_TRUE(U(g, self).hasMoveGoal);
    EXPECT_TRUE(U(g, self).IsAttackMoving());
}

TEST(AutoAcquireAttackMoveTest, PlainMoveStillIgnoresFoe_Control) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 100, 0);
    OrderMoveTo(g, U(g, self), 500, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
}

TEST(AutoAcquireAttackMoveTest, Retaliates_WhileMoving) {
    GameState g = MakeGame();
    const EntityId self = AddAttackMover(g, 0, 0, 500, 0);
    const EntityId attacker = Add(g, Team::Enemy, kAggro + 40.0f, 0);   // ngoài aggro nhưng trong leash
    U(g, self).lastAttackerId = attacker;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, attacker);
    EXPECT_TRUE(U(g, self).attackMoveEngaged);
}

TEST(AutoAcquireAttackMoveTest, ZeroAggroUnit_JustMoves) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    U(g, self).AggroRange = 0.0f;
    OrderAttackMoveTo(g, U(g, self), 500, 0);
    Add(g, Team::Enemy, 30, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_TRUE(U(g, self).hasMoveGoal);
}

TEST(AutoAcquireAttackMoveTest, EngagedTargetDied_ResumesTowardGoal) {
    GameState g = MakeGame();
    const EntityId self = AddAttackMover(g, 0, 0, 500, 300);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    ASSERT_EQ(U(g, self).attackTargetId, foe);
    g.pathQueue.clear();
    Kill(g, foe);
    AutoAcquireTarget(g, U(g, self), kDt);
    const Unit& u = U(g, self);
    EXPECT_TRUE(!u.HasTarget());
    EXPECT_TRUE(u.IsAttackMoving());
    EXPECT_TRUE(!u.attackMoveEngaged);
    EXPECT_TRUE(u.hasMoveGoal);
    EXPECT_TRUE(u.moveGoal.x == 500.0f && u.moveGoal.y == 300.0f);
    EXPECT_TRUE(u.pathPending);
    ASSERT_EQ(g.pathQueue.size(), 1);
    EXPECT_EQ(g.pathQueue.front().unit, self);
    EXPECT_EQ(g.pathQueue.front().purpose, PathPurpose::Move);
    EXPECT_TRUE(g.pathQueue.front().goalX == 500.0f && g.pathQueue.front().goalY == 300.0f);
}

TEST(AutoAcquireAttackMoveTest, EngagedTargetRemovedFromWorld_ResumesToo) {
    GameState g = MakeGame();
    const EntityId self = AddAttackMover(g, 0, 0, 500, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    ASSERT_EQ(U(g, self).attackTargetId, foe);
    g.units.erase(g.units.begin() + 1);           // kẻ địch biến mất khỏi thế giới
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(U(g, self).hasMoveGoal);
    EXPECT_TRUE(U(g, self).IsAttackMoving());
}

TEST(AutoAcquireAttackMoveTest, EngagedTargetBeyondLeash_GivesUpAndResumes) {
    GameState g = MakeGame();
    const EntityId self = AddAttackMover(g, 0, 0, 500, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    ASSERT_EQ(U(g, self).attackTargetId, foe);
    U(g, foe).x = kLeash + 60.0f;                 // kẻ địch chạy quá xa
    U(g, foe).y = 400.0f;
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).HasTarget());
    EXPECT_TRUE(U(g, self).hasMoveGoal);          // bỏ đuổi, quay lại đi tới đích
    EXPECT_TRUE(U(g, self).IsAttackMoving());
}

TEST(AutoAcquireAttackMoveTest, ResumeWaitsForSwingToFinish) {
    GameState g = MakeGame();
    const EntityId self = AddAttackMover(g, 0, 0, 500, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    g.pathQueue.clear();
    Kill(g, foe);
    U(g, self).state = UnitState::Attack;         // đòn chém vẫn đang diễn ra: đừng cắt ngang
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(U(g, self).attackMoveEngaged);
    EXPECT_TRUE(!U(g, self).hasMoveGoal);
    EXPECT_TRUE(g.pathQueue.empty());
    EXPECT_EQ(U(g, self).state, UnitState::Attack);
    U(g, self).state = UnitState::Idle;           // đòn đã xong
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(!U(g, self).attackMoveEngaged);
    EXPECT_TRUE(U(g, self).hasMoveGoal);
    EXPECT_EQ(g.pathQueue.size(), 1);
}

TEST(AutoAcquireAttackMoveTest, NextFoeFoundSameTick_StaysEngaged) {
    GameState g = MakeGame();
    const EntityId self = AddAttackMover(g, 0, 0, 500, 0);
    const EntityId first = Add(g, Team::Enemy, 100, 0);
    const EntityId second = Add(g, Team::Enemy, 0, 120);
    AutoAcquireTarget(g, U(g, self), kDt);
    ASSERT_EQ(U(g, self).attackTargetId, first);
    Kill(g, first);
    U(g, self).scanTimer = 0.0f;
    AutoAcquireTarget(g, U(g, self), kDt);        // bỏ mục tiêu chết, xin đường đi tiếp, rồi quét thấy kẻ thứ hai
    const Unit& u = U(g, self);
    EXPECT_EQ(u.attackTargetId, second);
    EXPECT_TRUE(u.attackMoveEngaged);
    EXPECT_TRUE(u.IsAttackMoving());
    EXPECT_TRUE(!u.pathPending);                  // yêu cầu đi tiếp vừa xếp đã bị hủy khi quay sang đánh kẻ thứ hai
}

TEST(AutoAcquireAttackMoveTest, StillWalking_ModeKeptAndNoDuplicateRequests) {
    GameState g = MakeGame();
    const EntityId self = AddAttackMover(g, 0, 0, 500, 0);
    ASSERT_EQ(g.pathQueue.size(), 1);
    for (int i = 0; i < 30; ++i) AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(U(g, self).IsAttackMoving());
    EXPECT_EQ(g.pathQueue.size(), 1);
}

TEST(AutoAcquireAttackMoveTest, FollowingPath_ModeKept) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    U(g, self).EnterAttackMove(500, 0);
    U(g, self).path.assign({ Waypoint{ 100, 0 } });
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(U(g, self).IsAttackMoving());
}

TEST(AutoAcquireAttackMoveTest, ReachedEnd_ReturnsToNormalAndThenDefendsLikeIdleUnit) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    U(g, self).EnterAttackMove(0, 0);             // đã tới nơi: không còn đường, không còn lệnh đi
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).combatMode, CombatMode::Normal);
    EXPECT_TRUE(!U(g, self).attackMoveEngaged);
    EXPECT_TRUE(g.pathQueue.empty());             // không xin đường mới (tránh vòng lặp vô tận khi đích không với tới)
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    U(g, self).scanTimer = 0.0f;
    AutoAcquireTarget(g, U(g, self), kDt);        // giờ chỉ là lính đứng yên tự vệ
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    EXPECT_TRUE(!U(g, self).attackMoveEngaged);
}

TEST(AutoAcquireAttackMoveTest, FinishedMoveWithFoeNearby_StillFinishesFirst) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    U(g, self).EnterAttackMove(0, 0);
    Add(g, Team::Enemy, 100, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_TRUE(U(g, self).HasTarget());          // vẫn đánh kẻ trong tầm (như lính đứng yên)
    EXPECT_EQ(U(g, self).combatMode, CombatMode::Normal); // nhưng lệnh Attack-move đã xong, không "đi tiếp" sau đó
    EXPECT_TRUE(!U(g, self).attackMoveEngaged);
}

TEST(AutoAcquireAttackMoveTest, EnemyAiNeverAffected) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId foe = Add(g, Team::Player, 100, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    EXPECT_EQ(U(g, self).attackTargetId, foe);
    EXPECT_EQ(U(g, self).combatMode, CombatMode::Normal);
    EXPECT_TRUE(!U(g, self).attackMoveEngaged);
}

// (Xóa bỏ hàm int main(...) cũ vì GTest::gtest_main đã cung cấp sẵn)
