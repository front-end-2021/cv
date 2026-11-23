// Unit test cho game/Ai (FindNearestFoe, AutoAcquireTarget).
//
// Build & chạy:
//   cmake -S . -B build -DMINIRTS_BUILD_TESTS=ON
//   cmake --build build --target AiTests
//   ctest --test-dir build -R AiTests --output-on-failure   (hoặc chạy trực tiếp AiTests[.exe])
//
// Các test chỉ dựng GameState trong bộ nhớ: không cần map, không mở cửa sổ, không chạy mô phỏng.
// AutoAcquireTarget chỉ đổi trạng thái lính và (khi về nhà) xếp một yêu cầu vào g.pathQueue, nên mọi
// thứ đều kiểm tra được ngay sau một lần gọi.
#include <cmath>
#include <cstdio>
#include <cstring>
#include <functional>
#include <utility>
#include <vector>

#include "Common.h"
#include "game/Ai.h"
#include "game/GameState.h"

// ---------------------------------------------------------------------------
// Khung test tối giản
// ---------------------------------------------------------------------------
static int g_checks = 0;
static int g_failed = 0;
static int g_caseFailed = 0;

#define CHECK(cond) do { ++g_checks; if (!(cond)) { ++g_failed; ++g_caseFailed; \
    std::printf("    FAIL  %s:%d  %s\n", __FILE__, __LINE__, #cond); } } while (0)

struct TestCase { const char* name; std::function<void()> fn; };

static std::vector<TestCase>& Registry() { static std::vector<TestCase> r; return r; }
struct Registrar { Registrar(const char* n, std::function<void()> f) { Registry().push_back({ n, std::move(f) }); } };

#define TEST(name) static void name(); static Registrar reg_##name(#name, name); static void name()

// ---------------------------------------------------------------------------
// Tiện ích dựng tình huống
// ---------------------------------------------------------------------------
constexpr float kAggro = 200.0f;              // tầm phát hiện dùng trong mọi test (đặt cố định cho dễ tính)
constexpr float kLeash = kAggro * kLeashFactor;
constexpr float kDt = kTickDt;

static GameState MakeGame() {
    GameState g;
    g.unitTypes.LoadBuiltInDefaults();
    return g;
}

// Thêm lính và trả về ID (tham chiếu sẽ mất hiệu lực sau lần AddUnit kế tiếp).
static EntityId Add(GameState& g, Team team, float x, float y) {
    Unit& u = g.AddUnit(x, y, team, g.unitTypes.DefaultIndexFor(team));
    u.AggroRange = kAggro;
    return u.id;
}

static Unit& U(GameState& g, EntityId id) { return *g.FindUnit(id); }

static void Kill(GameState& g, EntityId id) { U(g, id).HpValue = 0; }

// ===========================================================================
// FindNearestFoe
// ===========================================================================
TEST(FindNearestFoe_NoUnitsOtherThanSelf_ReturnsNull) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    CHECK(FindNearestFoe(g, U(g, self), 1000.0f) == nullptr);
}

TEST(FindNearestFoe_IgnoresSameTeam) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Player, 10, 0);
    Add(g, Team::Player, 20, 0);
    CHECK(FindNearestFoe(g, U(g, self), 1000.0f) == nullptr);
}

TEST(FindNearestFoe_PicksClosestOfSeveralFoes) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 150, 0);
    const EntityId closest = Add(g, Team::Enemy, 0, 60);
    Add(g, Team::Enemy, -100, -100);
    const Unit* foe = FindNearestFoe(g, U(g, self), 1000.0f);
    CHECK(foe != nullptr && foe->id == closest);
}

TEST(FindNearestFoe_AllyCloserThanFoe_StillReturnsFoe) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Player, 5, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    const Unit* r = FindNearestFoe(g, U(g, self), 1000.0f);
    CHECK(r != nullptr && r->id == foe);
}

TEST(FindNearestFoe_SkipsDeadFoes) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId dead = Add(g, Team::Enemy, 20, 0);
    const EntityId alive = Add(g, Team::Enemy, 80, 0);
    Kill(g, dead);
    const Unit* r = FindNearestFoe(g, U(g, self), 1000.0f);
    CHECK(r != nullptr && r->id == alive);
}

TEST(FindNearestFoe_OnlyDeadFoes_ReturnsNull) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Kill(g, Add(g, Team::Enemy, 20, 0));
    CHECK(FindNearestFoe(g, U(g, self), 1000.0f) == nullptr);
}

TEST(FindNearestFoe_FoeOutsideRadius_ReturnsNull) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 100.5f, 0);
    CHECK(FindNearestFoe(g, U(g, self), 100.0f) == nullptr);
}

TEST(FindNearestFoe_FoeExactlyOnRadius_IsIncluded) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 60, 80); // khoảng cách đúng 100
    const Unit* r = FindNearestFoe(g, U(g, self), 100.0f);
    CHECK(r != nullptr && r->id == foe);
}

TEST(FindNearestFoe_ZeroRadius_OnlyMatchesSamePosition) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 1, 0);
    CHECK(FindNearestFoe(g, U(g, self), 0.0f) == nullptr);
    const EntityId overlap = Add(g, Team::Enemy, 0, 0);
    const Unit* r = FindNearestFoe(g, U(g, self), 0.0f);
    CHECK(r != nullptr && r->id == overlap);
}

TEST(FindNearestFoe_IgnoreParam_SkipsThatFoeAndReturnsNext) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId nearest = Add(g, Team::Enemy, 30, 0);
    const EntityId second = Add(g, Team::Enemy, 90, 0);
    const Unit* r = FindNearestFoe(g, U(g, self), 1000.0f, nearest);
    CHECK(r != nullptr && r->id == second);
}

TEST(FindNearestFoe_IgnoreOnlyFoe_ReturnsNull) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId only = Add(g, Team::Enemy, 30, 0);
    CHECK(FindNearestFoe(g, U(g, self), 1000.0f, only) == nullptr);
}

TEST(FindNearestFoe_WorksForEnemyTeamToo) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    Add(g, Team::Enemy, 10, 0);
    const EntityId player = Add(g, Team::Player, 50, 0);
    const Unit* r = FindNearestFoe(g, U(g, self), 1000.0f);
    CHECK(r != nullptr && r->id == player);
}

TEST(FindNearestFoe_EqualDistance_ReturnsOneOfTied) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId a = Add(g, Team::Enemy, 50, 0);
    const EntityId b = Add(g, Team::Enemy, -50, 0);
    const Unit* r = FindNearestFoe(g, U(g, self), 1000.0f);
    CHECK(r != nullptr && (r->id == a || r->id == b));
}

// ===========================================================================
// AutoAcquireTarget — điều kiện thoát sớm
// ===========================================================================
TEST(AutoAcquire_DeadUnit_DoesNothing) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    Add(g, Team::Player, 50, 0);
    Kill(g, self);
    U(g, self).scanTimer = 0.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).HasTarget());
    CHECK(U(g, self).scanTimer == 0.0f); // không chạm vào bộ đếm quét
}

TEST(AutoAcquire_StateDeadButHpPositive_DoesNothing) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    Add(g, Team::Player, 50, 0);
    U(g, self).state = UnitState::Dead;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).HasTarget());
}

// ===========================================================================
// AutoAcquireTarget — bộ nhớ "mục tiêu không với tới"
// ===========================================================================
TEST(AutoAcquire_UnreachableTimer_CountsDown) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Unit& u = U(g, self);
    u.unreachableTargetId = 99;
    u.unreachableTimer = 1.0f;
    AutoAcquireTarget(g, u, 0.25f);
    CHECK(std::fabs(u.unreachableTimer - 0.75f) < 1e-5f);
    CHECK(u.unreachableTargetId == 99);
}

TEST(AutoAcquire_UnreachableTimerExpires_ForgetsTarget) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Unit& u = U(g, self);
    u.unreachableTargetId = 99;
    u.unreachableTimer = 0.1f;
    AutoAcquireTarget(g, u, 0.2f);
    CHECK(u.unreachableTimer <= 0.0f);
    CHECK(u.unreachableTargetId == kNoEntity);
}

TEST(AutoAcquire_UnreachableFoeIgnoredWhileRemembered_ThenReacquiredAfterExpiry) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    Unit& u = U(g, self);
    u.unreachableTargetId = foe;
    u.unreachableTimer = 0.5f;

    AutoAcquireTarget(g, u, 0.1f);         // còn nhớ -> bỏ qua
    CHECK(!u.HasTarget());

    u.scanTimer = 0.0f;
    AutoAcquireTarget(g, u, 0.5f);         // hết hạn -> được chọn lại
    CHECK(u.attackTargetId == foe);
}

TEST(AutoAcquire_ScanSkipsUnreachableFoe_PicksAnother) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId blocked = Add(g, Team::Enemy, 40, 0);
    const EntityId other = Add(g, Team::Enemy, 150, 0);
    Unit& u = U(g, self);
    u.unreachableTargetId = blocked;
    u.unreachableTimer = kUnreachableMemory;
    AutoAcquireTarget(g, u, kDt);
    CHECK(u.attackTargetId == other);
}

// ===========================================================================
// AutoAcquireTarget — mục tiêu hiện có
// ===========================================================================
TEST(AutoAcquire_TargetDied_ClearsOrder) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    U(g, self).OrderAttack(foe, false);
    U(g, self).scanTimer = 10.0f; // chặn bước quét để chỉ kiểm tra việc xóa lệnh
    Kill(g, foe);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).HasTarget());
    CHECK(!U(g, self).autoTarget);
}

TEST(AutoAcquire_TargetRemovedFromWorld_ClearsOrder) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    U(g, self).OrderAttack(12345, true); // ID không tồn tại
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).HasTarget());
}

TEST(AutoAcquire_TargetDied_SwitchesToNextFoeSameTick) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId dead = Add(g, Team::Player, 50, 0);
    const EntityId next = Add(g, Team::Player, 120, 0);
    U(g, self).OrderAttack(dead, true);
    Kill(g, dead);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == next);
    CHECK(U(g, self).autoTarget);
}

TEST(AutoAcquire_AutoTargetWithinLeash_KeepsTargetAndSkipsScan) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId foe = Add(g, Team::Player, kLeash - 1.0f, 0);
    Add(g, Team::Player, 30, 0);             // kẻ gần hơn nhưng không được đổi mục tiêu
    U(g, self).OrderAttack(foe, true);
    U(g, self).scanTimer = 0.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == foe);
    CHECK(U(g, self).scanTimer == 0.0f);     // thoát trước bước quét
}

TEST(AutoAcquire_AutoTargetBeyondLeash_GivesUpAndForgetsGrudge) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId foe = Add(g, Team::Player, kLeash + 1.0f, 0);
    Unit& u = U(g, self);
    u.OrderAttack(foe, true);
    u.lastAttackerId = foe;
    u.scanTimer = 10.0f;
    AutoAcquireTarget(g, u, kDt);
    CHECK(!u.HasTarget());
    CHECK(u.lastAttackerId == kNoEntity);
}

TEST(AutoAcquire_AutoTargetExactlyAtLeash_IsKept) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId foe = Add(g, Team::Player, kLeash, 0);
    U(g, self).OrderAttack(foe, true);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == foe);
}

TEST(AutoAcquire_PlayerOrderedTargetBeyondLeash_IsKept) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, kLeash * 3.0f, 0);
    U(g, self).OrderAttack(foe, false);       // lệnh của người chơi: đuổi tới cùng
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == foe);
    CHECK(!U(g, self).autoTarget);
}

// ===========================================================================
// AutoAcquireTarget — lính phe ta đang theo lệnh đi
// ===========================================================================
TEST(AutoAcquire_PlayerWithMoveGoal_DoesNotAcquire) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 50, 0);
    U(g, self).StartMoveOrder(500, 500);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).HasTarget());
    CHECK(U(g, self).hasMoveGoal);
}

TEST(AutoAcquire_PlayerWithPathOnly_DoesNotAcquire) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 50, 0);
    U(g, self).path.assign({ Waypoint{ 300, 0 } });
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).HasTarget());
}

TEST(AutoAcquire_PlayerWithMoveGoal_DoesNotRetaliate) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId attacker = Add(g, Team::Enemy, 50, 0);
    U(g, self).StartMoveOrder(500, 500);
    U(g, self).lastAttackerId = attacker;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).HasTarget());
    CHECK(U(g, self).lastAttackerId == attacker); // mối thù vẫn được giữ cho tới khi dừng lại
}

TEST(AutoAcquire_EnemyWithMoveGoal_StillAcquires) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId foe = Add(g, Team::Player, 50, 0);
    U(g, self).StartMoveOrder(500, 500);     // ví dụ: đang về nhà
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == foe);
    CHECK(U(g, self).autoTarget);
    CHECK(!U(g, self).hasMoveGoal);          // OrderAttack hủy lệnh đi
}

TEST(AutoAcquire_IdlePlayer_DefendsItself) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 100, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == foe);
    CHECK(U(g, self).autoTarget);
}

// ===========================================================================
// AutoAcquireTarget — đánh trả
// ===========================================================================
TEST(AutoAcquire_Retaliates_EvenOutsideAggroButWithinLeash) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId attacker = Add(g, Team::Player, (kAggro + kLeash) * 0.5f, 0);
    U(g, self).lastAttackerId = attacker;
    U(g, self).scanTimer = 10.0f;            // đánh trả không phụ thuộc chu kỳ quét
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == attacker);
    CHECK(U(g, self).autoTarget);
}

TEST(AutoAcquire_RetaliationPreferredOverCloserFoe) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 20, 0);
    const EntityId attacker = Add(g, Team::Enemy, 150, 0);
    U(g, self).lastAttackerId = attacker;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == attacker);
}

TEST(AutoAcquire_AttackerBeyondLeash_ForgetsGrudge) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId attacker = Add(g, Team::Player, kLeash + 10.0f, 0);
    U(g, self).lastAttackerId = attacker;
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).HasTarget());
    CHECK(U(g, self).lastAttackerId == kNoEntity);
}

TEST(AutoAcquire_AttackerDead_ForgetsGrudgeAndScans) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId attacker = Add(g, Team::Player, 50, 0);
    const EntityId other = Add(g, Team::Player, 120, 0);
    U(g, self).lastAttackerId = attacker;
    Kill(g, attacker);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).lastAttackerId == kNoEntity);
    CHECK(U(g, self).attackTargetId == other);
}

TEST(AutoAcquire_AttackerMissingFromWorld_ForgetsGrudge) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    U(g, self).lastAttackerId = 4242;
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).lastAttackerId == kNoEntity);
    CHECK(!U(g, self).HasTarget());
}

TEST(AutoAcquire_AttackerMarkedUnreachable_NotRetaliated) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Enemy, 0, 0);
    const EntityId attacker = Add(g, Team::Player, 50, 0);
    Unit& u = U(g, self);
    u.lastAttackerId = attacker;
    u.unreachableTargetId = attacker;
    u.unreachableTimer = kUnreachableMemory;
    AutoAcquireTarget(g, u, kDt);
    CHECK(!u.HasTarget());
    CHECK(u.lastAttackerId == kNoEntity);
}

TEST(AutoAcquire_TakeDamageThenRetaliate_EndToEnd) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId attacker = Add(g, Team::Enemy, 60, 0);
    U(g, self).TakeDamage(5, attacker);
    CHECK(U(g, self).lastAttackerId == attacker);
    U(g, self).scanTimer = 10.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == attacker);
}

// ===========================================================================
// AutoAcquireTarget — quét định kỳ
// ===========================================================================
TEST(AutoAcquire_ScanTimerNotElapsed_NoScan) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, 50, 0);
    U(g, self).scanTimer = 0.15f;
    AutoAcquireTarget(g, U(g, self), 0.1f);
    CHECK(!U(g, self).HasTarget());
    CHECK(std::fabs(U(g, self).scanTimer - 0.05f) < 1e-5f);
}

TEST(AutoAcquire_ScanTimerElapsed_AcquiresAndResetsTimer) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 50, 0);
    U(g, self).scanTimer = 0.05f;
    AutoAcquireTarget(g, U(g, self), 0.1f);
    CHECK(U(g, self).attackTargetId == foe);
    CHECK(U(g, self).scanTimer == kScanInterval);
}

TEST(AutoAcquire_ScanFindsNothing_ResetsTimer) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    Add(g, Team::Enemy, kAggro + 50.0f, 0);   // ngoài tầm phát hiện
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).HasTarget());
    CHECK(U(g, self).scanTimer == kScanInterval);
}

TEST(AutoAcquire_ScanUsesUnitAggroRange) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    const EntityId foe = Add(g, Team::Enemy, 300, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).HasTarget());           // 300 > kAggro

    U(g, self).AggroRange = 400.0f;
    U(g, self).scanTimer = 0.0f;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == foe);
}

TEST(AutoAcquire_ScansAtMostEveryInterval) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    AutoAcquireTarget(g, U(g, self), kDt);    // lần quét đầu: không có ai
    CHECK(U(g, self).scanTimer == kScanInterval);

    const EntityId foe = Add(g, Team::Enemy, 50, 0); // kẻ địch xuất hiện ngay sau đó
    int ticks = 0;
    while (!U(g, self).HasTarget() && ticks < 100) { AutoAcquireTarget(g, U(g, self), kDt); ++ticks; }
    CHECK(U(g, self).attackTargetId == foe);
    // Phải đợi đủ kScanInterval (khoảng 6 tick ở 30 tick/giây), không sớm hơn và không trễ quá 1 tick (cho phép sai số làm tròn số thực khi trừ dần bộ đếm).
    const float waited = static_cast<float>(ticks) * kDt;
    CHECK(waited >= kScanInterval - 1e-4f);
    CHECK(waited <= kScanInterval + kDt + 1e-4f);
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

TEST(AutoAcquire_EnemyIdleFarFromHome_OrdersMoveHome) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    AutoAcquireTarget(g, U(g, self), kDt);
    const Unit& u = U(g, self);
    CHECK(u.hasMoveGoal);
    CHECK(u.moveGoal.x == 500.0f && u.moveGoal.y == 0.0f);
    CHECK(u.pathPending);
    CHECK(g.pathQueue.size() == 1);
    if (!g.pathQueue.empty()) {
        const PathRequest& req = g.pathQueue.front();
        CHECK(req.unit == self);
        CHECK(req.purpose == PathPurpose::Move);
        CHECK(req.goalX == 500.0f && req.goalY == 0.0f);
        CHECK(req.ticket == u.pathTicket);
    }
}

TEST(AutoAcquire_EnemyNearHome_DoesNotMove) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, kHomeArriveDist - 1.0f);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).hasMoveGoal);
    CHECK(g.pathQueue.empty());
}

TEST(AutoAcquire_EnemyExactlyAtArriveDist_DoesNotMove) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, kHomeArriveDist);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(g.pathQueue.empty());
}

TEST(AutoAcquire_EnemyWithoutHome_DoesNotMove) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    U(g, self).hasHome = false;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).hasMoveGoal);
    CHECK(g.pathQueue.empty());
}

TEST(AutoAcquire_PlayerUnitWithHome_NeverReturnsHome) {
    GameState g = MakeGame();
    const EntityId self = Add(g, Team::Player, 0, 0);
    U(g, self).hasHome = true;
    U(g, self).home = { 500.0f, 0.0f };
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(!U(g, self).hasMoveGoal);
    CHECK(g.pathQueue.empty());
}

TEST(AutoAcquire_EnemyAlreadyHeadingHome_NoDuplicateRequest) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(g.pathQueue.size() == 1);
    for (int i = 0; i < 30; ++i) AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(g.pathQueue.size() == 1);           // hasMoveGoal = true -> không xin thêm đường
}

TEST(AutoAcquire_EnemyFollowingPath_DoesNotRequestHome) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    U(g, self).path.assign({ Waypoint{ 100, 0 } });
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(g.pathQueue.empty());
}

TEST(AutoAcquire_EnemyMidAttackAnimation_DoesNotReturnHome) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    U(g, self).state = UnitState::Attack;
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(g.pathQueue.empty());
}

TEST(AutoAcquire_EnemyWaitingForScan_DoesNotReturnHome) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    U(g, self).scanTimer = 1.0f;              // chưa tới lượt quét -> chưa kết luận "hết việc"
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(g.pathQueue.empty());
}

TEST(AutoAcquire_EnemyFarFromHomeWithFoeInRange_AttacksInsteadOfReturning) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    const EntityId foe = Add(g, Team::Player, 80, 0);
    AutoAcquireTarget(g, U(g, self), kDt);
    CHECK(U(g, self).attackTargetId == foe);
    CHECK(g.pathQueue.empty());
}

TEST(AutoAcquire_EnemyGivesUpChase_ThenHeadsHome) {
    GameState g = MakeGame();
    const EntityId self = MakeEnemyAwayFromHome(g, 500.0f);
    const EntityId foe = Add(g, Team::Player, kLeash + 50.0f, 0);
    U(g, self).OrderAttack(foe, true);
    AutoAcquireTarget(g, U(g, self), kDt);    // bỏ cuộc, quét không thấy ai trong tầm, về nhà
    CHECK(!U(g, self).HasTarget());
    CHECK(U(g, self).hasMoveGoal);
    CHECK(g.pathQueue.size() == 1);
}

// ===========================================================================
int main(int argc, char** argv) {
    std::setvbuf(stdout, nullptr, _IONBF, 0);
    const char* filter = (argc > 1) ? argv[1] : nullptr; // AiTests <chuỗi>: chỉ chạy test có tên chứa chuỗi

    int ran = 0, casesFailed = 0;
    for (const TestCase& t : Registry()) {
        if (filter && !std::strstr(t.name, filter)) continue;
        g_caseFailed = 0;
        t.fn();
        ++ran;
        if (g_caseFailed) ++casesFailed;
        std::printf("[%s] %s\n", g_caseFailed ? "FAIL" : " OK ", t.name);
    }
    std::printf("\n%d test, %d that bai (%d kiem tra, %d that bai).\n", ran, casesFailed, g_checks, g_failed);
    return casesFailed == 0 ? 0 : 1;
}
