// Kiểm thử các lệnh chiến đấu của người chơi (bước 2): Stop (S), Hold position (H), Attack-move (A + chuột trái).
// Không cần cửa sổ / SDL thật. Gồm:
//   - Unit: OrderStop / OrderHold / EnterAttackMove, chế độ chiến đấu bị lệnh mới của người chơi hủy ra sao
//   - OrderAttackMoveTo (game/PathService.*) và IssueStopOrder / IssueHoldOrder / IssueAttackMoveOrder (game/Orders.*)
//   - phím S / H / A và chế độ chờ chọn điểm Attack-move (game/Commands.*)
//   - va chạm: lính giữ vị trí không bị đẩy lệch hẳn (game/Movement.cpp)
//   - kịch bản mô phỏng: Stop giữa đường / lúc đào mỏ, Hold không đuổi theo, Attack-move đánh dọc đường rồi tới đích
//     (kể cả khi gặp địch không với tới được), nhóm nhỏ và nhóm dùng FlowField
//   - stress ngẫu nhiên: lệnh bừa trên bản đồ bừa, kiểm các bất biến (không ai trong tường, lính Hold không bao giờ tự đi...)
// Chạy: CombatTests (thêm --gtest_filter=... để chọn). Số ván stress: biến môi trường COMBAT_STRESS_SCENARIOS (mặc định 40).
#include <gtest/gtest.h>
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <functional>
#include <set>
#include <string>
#include <vector>

#include "Pathfinder.h"
#include "TileMap.h"
#include "entity/UnitType.h"
#include "game/Ai.h"
#include "game/Commands.h"
#include "game/Construction.h"
#include "game/GameState.h"
#include "game/Movement.h"
#include "game/Orders.h"
#include "game/PathService.h"
#include "game/Render.h"
#include "game/Selection.h"
#include "game/Simulation.h"
#include "game/Work.h"
#include "game/World.h"

namespace {
    // ---------------------------------------------------------------------------
    // Dụng cụ chung
    // ---------------------------------------------------------------------------
    struct Rng {
        std::uint32_t s;
        explicit Rng(std::uint32_t seed) : s(seed ? seed : 1u) {}
        std::uint32_t Next() { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return s; }
        int Int(int lo, int hi) { return lo + static_cast<int>(Next() % static_cast<std::uint32_t>(hi - lo + 1)); }
        bool Chance(int percent) { return Int(1, 100) <= percent; }
    };

    // '.' cỏ, ',' đất, '~' nước, '#' đá.
    TileMap MakeMap(const std::vector<std::string>& rows) {
        TileMap m;
        m.rows = static_cast<int>(rows.size());
        m.cols = static_cast<int>(rows[0].size());
        m.tileSize = 64.0f;
        for (const auto& line : rows) {
            for (char c : line) m.data.push_back(c == '#' ? Tile::Rock : c == '~' ? Tile::Water : c == ',' ? Tile::Dirt : Tile::Grass);
        }
        return m;
    }

    std::vector<std::string> Blank(int rows, int cols, char fill = '.') {
        return std::vector<std::string>(static_cast<size_t>(rows), std::string(static_cast<size_t>(cols), fill));
    }

    Waypoint Center(int row, int col) { return { (static_cast<float>(col) + 0.5f) * 64.0f, (static_cast<float>(row) + 0.5f) * 64.0f }; }

    GameState MakeGame(const TileMap& map, int gold = 0) {
        GameState g;
        g.map = map;
        g.unitTypes.LoadBuiltInDefaults();
        g.buildingTypes.LoadBuiltInDefaults();
        g.economyActive = true;
        g.Gold(Team::Player) = gold;
        return g;
    }

    GameState OpenGame(int rows = 16, int cols = 24) { return MakeGame(MakeMap(Blank(rows, cols))); }

    int UnitIdx(const GameState& g, const char* name) { return g.unitTypes.IndexOf(name); }
    int BuildIdx(const GameState& g, const char* name) { return g.buildingTypes.IndexOf(name); }

    // Thêm lính và trả về ID (tham chiếu Unit mất hiệu lực ở lần AddUnit kế tiếp).
    EntityId Spawn(GameState& g, Team team, Waypoint p, const char* type) {
        return g.AddUnit(p.x, p.y, team, UnitIdx(g, type)).id;
    }
    Unit& U(GameState& g, EntityId id) { return *g.FindUnit(id); }
    bool Alive(const GameState& g, EntityId id) { const Unit* u = g.FindUnit(id); return u && u->IsAlive(); }
    float DistTo(const Unit& u, Waypoint p) { return std::hypot(u.x - p.x, u.y - p.y); }
    float Dist(const Unit& a, const Unit& b) { return std::hypot(a.x - b.x, a.y - b.y); }
    // Bản "an toàn" cho các kịch bản mô phỏng: lính có thể đã chết / bị gỡ (khi code sai), test vẫn phải thất bại gọn gàng chứ không crash.
    float DistToId(const GameState& g, EntityId id, Waypoint p) { const Unit* u = g.FindUnit(id); return u ? DistTo(*u, p) : 1e9f; }
    bool Untouched(const GameState& g, EntityId id) { const Unit* u = g.FindUnit(id); return u && u->IsAlive() && u->HpValue == u->HpMax; }

    Building& Prebuilt(GameState& g, const char* type, int row, int col, Team team = Team::Player) {
        PlaceResult r = PlaceResult::Ok;
        Building* b = PlaceBuilding(g, BuildIdx(g, type), row, col, team, true, &r);
        EXPECT_TRUE(b != nullptr) << "prebuilt " << type << " failed, result " << static_cast<int>(r);
        return *g.FindBuilding(b ? b->id : g.buildings.back().id);
    }

    void Run(GameState& g, int ticks) { for (int i = 0; i < ticks; ++i) StepSimulation(g, kTickDt); }
    void RunSeconds(GameState& g, float seconds) { Run(g, static_cast<int>(seconds * static_cast<float>(kTickRate))); }

    // Chạy tới khi pred() đúng. Trả về số giây đã chạy, hoặc -1 nếu hết maxSeconds mà vẫn chưa đúng.
    float RunUntil(GameState& g, float maxSeconds, const std::function<bool()>& pred) {
        const int maxTicks = static_cast<int>(maxSeconds * static_cast<float>(kTickRate));
        for (int t = 0; t < maxTicks; ++t) {
            if (pred()) return static_cast<float>(t) * kTickDt;
            StepSimulation(g, kTickDt);
        }
        return pred() ? maxSeconds : -1.0f;
    }

    int UnitsInsideWalls(const GameState& g) {
        int n = 0;
        for (const auto& u : g.units) if (u.IsAlive() && !g.map.CanBoxStandAt(u.x, u.y, kSquareSize)) ++n;
        return n;
    }

    bool IdsUniqueAndSorted(const GameState& g) {
        EntityId prev = 0;
        for (const auto& u : g.units) {
            if (u.id == kNoEntity || u.id <= prev) return false;
            prev = u.id;
        }
        return true;
    }

    // Lính đứng yên hẳn: không đường đi, không lệnh đi, không chờ đường.
    bool IsStationary(const Unit& u) { return u.path.empty() && !u.hasMoveGoal && !u.pathPending; }

    int CountAlive(const GameState& g, Team team) { return g.CountUnits(team, true); }
}

// ===========================================================================
// 1. Unit: OrderStop / OrderHold / EnterAttackMove và việc chế độ chiến đấu bị hủy
// ===========================================================================
TEST(UnitStop, CancelsMoveOrderAndPendingPathRequest) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    OrderMoveTo(g, U(g, id), 900.0f, 300.0f);
    ASSERT_TRUE(U(g, id).hasMoveGoal);
    ASSERT_TRUE(U(g, id).pathPending);
    U(g, id).OrderStop();
    EXPECT_TRUE(IsStationary(U(g, id)));
    ProcessPathRequests(g);                        // yêu cầu đã xếp hàng giờ lỗi thời: bị bỏ qua
    EXPECT_TRUE(U(g, id).path.empty());
    EXPECT_TRUE(!U(g, id).hasMoveGoal);
}

TEST(UnitStop, CancelsFollowedPath) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    OrderMoveTo(g, U(g, id), 900.0f, 300.0f);
    ::Run(g, 2);                                     // đã có đường đi và đang đi
    ASSERT_TRUE(!U(g, id).path.empty());
    U(g, id).OrderStop();
    EXPECT_TRUE(IsStationary(U(g, id)));
    EXPECT_EQ(U(g, id).unstickCount, 0);
}

TEST(UnitStop, CancelsAttackOrder) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    const EntityId foe = Spawn(g, Team::Enemy, Center(5, 12), "Worker");
    U(g, id).OrderAttack(foe, false);
    U(g, id).OrderStop();
    EXPECT_TRUE(!U(g, id).HasTarget());
    EXPECT_TRUE(!U(g, id).autoTarget);
}

TEST(UnitStop, InterruptsSwingInProgress_ButKeepsCooldown) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    U(g, id).state = UnitState::Attack;
    U(g, id).cooldownLeft = 0.7f;
    U(g, id).OrderStop();
    EXPECT_EQ(U(g, id).state, UnitState::Idle);
    EXPECT_FLOAT_EQ(U(g, id).cooldownLeft, 0.7f);  // bấm Stop liên tục không giúp đánh nhanh hơn
}

TEST(UnitStop, CancelsWorkerJob) {
    GameState g = OpenGame();
    Prebuilt(g, "Townhall", 2, 2);
    g.AddResource(2, 8, 500);
    const EntityId w = Spawn(g, Team::Player, Center(6, 5), "Worker");
    OrderGather(U(g, w), g.resources[0].id);
    ASSERT_EQ(U(g, w).job.kind, JobKind::Gather);
    U(g, w).OrderStop();
    EXPECT_EQ(U(g, w).job.kind, JobKind::None);
}

TEST(UnitStop, ResetsHoldAndAttackMove) {
    GameState g = OpenGame();
    const EntityId a = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    const EntityId b = Spawn(g, Team::Player, Center(6, 5), "Soldier");
    U(g, a).OrderHold();
    U(g, b).EnterAttackMove(500, 500);
    U(g, b).attackMoveEngaged = true;
    U(g, a).OrderStop();
    U(g, b).OrderStop();
    EXPECT_EQ(U(g, a).combatMode, CombatMode::Normal);
    EXPECT_EQ(U(g, b).combatMode, CombatMode::Normal);
    EXPECT_TRUE(!U(g, b).attackMoveEngaged);
}

TEST(UnitHold, ClearsMovementAndJobAndEntersHold) {
    GameState g = OpenGame();
    Prebuilt(g, "Townhall", 2, 2);
    g.AddResource(2, 8, 500);
    const EntityId w = Spawn(g, Team::Player, Center(6, 5), "Worker");
    OrderGather(U(g, w), g.resources[0].id);
    OrderMoveTo(g, U(g, w), 900.0f, 300.0f);       // (đổi lệnh: việc đang làm không bị xóa bởi OrderMoveTo)
    ASSERT_TRUE(U(g, w).pathPending);
    U(g, w).OrderHold();
    EXPECT_TRUE(U(g, w).IsHolding());
    EXPECT_TRUE(IsStationary(U(g, w)));
    EXPECT_EQ(U(g, w).job.kind, JobKind::None);
    ProcessPathRequests(g);
    EXPECT_TRUE(U(g, w).path.empty());             // yêu cầu tìm đường cũ không còn hiệu lực
}

TEST(UnitHold, KeepsCurrentTargetAsAutomaticOne) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    const EntityId foe = Spawn(g, Team::Enemy, Center(5, 6), "Worker");
    U(g, id).OrderAttack(foe, false);
    U(g, id).OrderHold();
    EXPECT_EQ(U(g, id).attackTargetId, foe);
    EXPECT_TRUE(U(g, id).autoTarget);
}

TEST(UnitHold, WithoutTargetStaysWithoutTarget) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    U(g, id).OrderHold();
    EXPECT_TRUE(!U(g, id).HasTarget());
    EXPECT_TRUE(!U(g, id).autoTarget);
}

TEST(UnitHold, DoesNotInterruptSwingInProgress) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    U(g, id).state = UnitState::Attack;
    U(g, id).OrderHold();
    EXPECT_EQ(U(g, id).state, UnitState::Attack);
}

TEST(UnitAttackMove, EnterAttackMoveOnlySetsModeAndGoal) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    OrderMoveTo(g, U(g, id), 700.0f, 400.0f);
    U(g, id).EnterAttackMove(700.0f, 400.0f);
    const Unit& u = U(g, id);
    EXPECT_TRUE(u.IsAttackMoving());
    EXPECT_TRUE(u.attackMoveGoal.x == 700.0f && u.attackMoveGoal.y == 400.0f);
    EXPECT_TRUE(!u.attackMoveEngaged);
    EXPECT_TRUE(u.hasMoveGoal);                    // không đụng tới lệnh đi đã ra
    EXPECT_TRUE(u.pathPending);
}

TEST(UnitAttackMove, EnterAttackMoveAlwaysStartsFresh) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    U(g, id).EnterAttackMove(100.0f, 100.0f);
    U(g, id).attackMoveEngaged = true;                // đang bận đánh giữa đường của lệnh cũ
    U(g, id).EnterAttackMove(700.0f, 400.0f);         // lệnh Attack-move mới: không thừa hưởng việc "đang bận" của lệnh cũ
    EXPECT_TRUE(!U(g, id).attackMoveEngaged);
    EXPECT_TRUE(U(g, id).attackMoveGoal.x == 700.0f && U(g, id).attackMoveGoal.y == 400.0f);
}

TEST(UnitCombatMode, MoveOrdersAndPlayerAttackOrdersResetIt) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    const EntityId foe = Spawn(g, Team::Enemy, Center(5, 12), "Worker");
    auto armed = [&](bool hold) {
        U(g, id).ResetCombatMode();
        if (hold) U(g, id).OrderHold(); else { U(g, id).EnterAttackMove(500, 500); U(g, id).attackMoveEngaged = true; }
    };
    for (bool hold : { true, false }) {
        armed(hold);
        U(g, id).StartMoveOrder(100, 100);
        EXPECT_EQ(U(g, id).combatMode, CombatMode::Normal) << "StartMoveOrder, hold=" << hold;
        EXPECT_TRUE(!U(g, id).attackMoveEngaged);

        armed(hold);
        U(g, id).OrderMove({ Waypoint{ 100, 100 } });
        EXPECT_EQ(U(g, id).combatMode, CombatMode::Normal) << "OrderMove, hold=" << hold;

        armed(hold);
        U(g, id).OrderMove({});                    // như khi thợ nhận việc mới
        EXPECT_EQ(U(g, id).combatMode, CombatMode::Normal) << "OrderMove(empty), hold=" << hold;

        armed(hold);
        U(g, id).OrderAttack(foe, false);
        EXPECT_EQ(U(g, id).combatMode, CombatMode::Normal) << "OrderAttack(player), hold=" << hold;
        EXPECT_TRUE(!U(g, id).attackMoveEngaged);
    }
}

TEST(UnitCombatMode, AutomaticAttackAndClearTargetKeepIt) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    const EntityId foe = Spawn(g, Team::Enemy, Center(5, 12), "Worker");
    U(g, id).OrderHold();
    U(g, id).OrderAttack(foe, true);
    EXPECT_TRUE(U(g, id).IsHolding());
    U(g, id).ClearTarget();
    EXPECT_TRUE(U(g, id).IsHolding());

    U(g, id).EnterAttackMove(500, 500);
    U(g, id).attackMoveEngaged = true;
    U(g, id).OrderAttack(foe, true);
    EXPECT_TRUE(U(g, id).IsAttackMoving());
    EXPECT_TRUE(U(g, id).attackMoveEngaged);
    U(g, id).ClearTarget();
    EXPECT_TRUE(U(g, id).IsAttackMoving());
    EXPECT_TRUE(U(g, id).attackMoveEngaged);
}

TEST(UnitCombatMode, DeathResetsIt) {
    GameState g = OpenGame();
    const EntityId a = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    const EntityId b = Spawn(g, Team::Player, Center(6, 5), "Soldier");
    U(g, a).OrderHold();
    U(g, b).EnterAttackMove(500, 500);
    U(g, b).attackMoveEngaged = true;
    U(g, a).HpValue = 0;
    U(g, b).HpValue = 0;
    U(g, a).UpdateState(kTickDt, nullptr, false);
    U(g, b).UpdateState(kTickDt, nullptr, false);
    EXPECT_EQ(U(g, a).state, UnitState::Dead);
    EXPECT_EQ(U(g, a).combatMode, CombatMode::Normal);
    EXPECT_EQ(U(g, b).combatMode, CombatMode::Normal);
    EXPECT_TRUE(!U(g, b).attackMoveEngaged);
}

TEST(UnitCombatMode, DefaultsToNormal) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 5), "Soldier");
    EXPECT_EQ(U(g, id).combatMode, CombatMode::Normal);
    EXPECT_TRUE(!U(g, id).IsHolding());
    EXPECT_TRUE(!U(g, id).IsAttackMoving());
    EXPECT_TRUE(!U(g, id).attackMoveEngaged);
}

// ===========================================================================
// 2. OrderAttackMoveTo
// ===========================================================================
TEST(OrderAttackMoveTo, QueuesPathRequestAndEntersMode) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 2), "Soldier");
    OrderAttackMoveTo(g, U(g, id), 900.0f, 400.0f);
    const Unit& u = U(g, id);
    EXPECT_TRUE(u.IsAttackMoving());
    EXPECT_TRUE(u.attackMoveGoal.x == 900.0f && u.attackMoveGoal.y == 400.0f);
    EXPECT_TRUE(u.hasMoveGoal);
    EXPECT_TRUE(u.moveGoal.x == 900.0f && u.moveGoal.y == 400.0f);
    EXPECT_TRUE(u.pathPending);
    ASSERT_EQ(g.pathQueue.size(), 1u);
    EXPECT_EQ(g.pathQueue.front().purpose, PathPurpose::Move);
    EXPECT_EQ(g.pathQueue.front().unit, id);
}

TEST(OrderAttackMoveTo, PathIsServedAndLeadsToGoal) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 2), "Soldier");
    OrderAttackMoveTo(g, U(g, id), 900.0f, 400.0f);
    ProcessPathRequests(g);
    ASSERT_TRUE(!U(g, id).path.empty());
    EXPECT_TRUE(U(g, id).IsAttackMoving());        // nhận đường đi không làm mất chế độ
    const Waypoint last = U(g, id).path.back();
    EXPECT_NEAR(last.x, 900.0f, 1.0f);
    EXPECT_NEAR(last.y, 400.0f, 1.0f);
}

TEST(OrderAttackMoveTo, ReplacesHoldAndPreviousAttackMove) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 2), "Soldier");
    U(g, id).OrderHold();
    OrderAttackMoveTo(g, U(g, id), 900.0f, 400.0f);
    EXPECT_TRUE(U(g, id).IsAttackMoving());
    EXPECT_TRUE(!U(g, id).IsHolding());
    U(g, id).attackMoveEngaged = true;
    OrderAttackMoveTo(g, U(g, id), 300.0f, 800.0f);
    EXPECT_TRUE(U(g, id).attackMoveGoal.x == 300.0f && U(g, id).attackMoveGoal.y == 800.0f);
    EXPECT_TRUE(!U(g, id).attackMoveEngaged);
    EXPECT_EQ(g.pathQueue.size(), 2u);             // OrderHold không xin đường; 2 lệnh Attack-move xếp 2 yêu cầu, chỉ cái mới nhất còn hiệu lực
    ProcessPathRequests(g);
    ASSERT_TRUE(!U(g, id).path.empty());
    EXPECT_NEAR(U(g, id).path.back().x, 300.0f, 1.0f);
}

TEST(OrderAttackMoveTo, PlainMoveAfterwardsReturnsToNormal) {
    GameState g = OpenGame();
    const EntityId id = Spawn(g, Team::Player, Center(5, 2), "Soldier");
    OrderAttackMoveTo(g, U(g, id), 900.0f, 400.0f);
    OrderMoveTo(g, U(g, id), 300.0f, 300.0f);
    EXPECT_EQ(U(g, id).combatMode, CombatMode::Normal);
}

// ===========================================================================
// 3. IssueStopOrder / IssueHoldOrder / IssueAttackMoveOrder
// ===========================================================================
namespace {
    EntityId SpawnSelected(GameState& g, Waypoint p, const char* type = "Soldier", Team team = Team::Player) {
        const EntityId id = Spawn(g, team, p, type);
        U(g, id).selected = true;
        return id;
    }
}

TEST(IssueStop, OnlySelectedLivePlayerUnitsAreStopped) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    const EntityId b = SpawnSelected(g, Center(5, 2));
    const EntityId unselected = Spawn(g, Team::Player, Center(6, 2), "Soldier");
    const EntityId enemy = SpawnSelected(g, Center(7, 2), "Grunt", Team::Enemy); // chọn nhầm lính địch cũng không bị điều khiển
    const EntityId dead = SpawnSelected(g, Center(8, 2));
    U(g, dead).HpValue = 0;
    for (EntityId id : { a, b, unselected, enemy }) OrderMoveTo(g, U(g, id), 900.0f, 500.0f);

    EXPECT_EQ(IssueStopOrder(g), 2);
    EXPECT_TRUE(IsStationary(U(g, a)));
    EXPECT_TRUE(IsStationary(U(g, b)));
    EXPECT_TRUE(U(g, unselected).hasMoveGoal);
    EXPECT_TRUE(U(g, enemy).hasMoveGoal);
}

TEST(IssueStop, NothingSelected_ReturnsZero) {
    GameState g = OpenGame();
    const EntityId a = Spawn(g, Team::Player, Center(4, 2), "Soldier");
    OrderMoveTo(g, U(g, a), 900.0f, 500.0f);
    EXPECT_EQ(IssueStopOrder(g), 0);
    EXPECT_TRUE(U(g, a).hasMoveGoal);
}

TEST(IssueStop, SelectedBuildingIsIgnored) {
    GameState g = OpenGame();
    Prebuilt(g, "Barracks", 2, 2).selected = true;
    EXPECT_EQ(IssueStopOrder(g), 0);
}

TEST(IssueHold, OnlySelectedLivePlayerUnitsHold) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    const EntityId unselected = Spawn(g, Team::Player, Center(6, 2), "Soldier");
    const EntityId enemy = SpawnSelected(g, Center(7, 2), "Grunt", Team::Enemy);
    OrderMoveTo(g, U(g, a), 900.0f, 500.0f);
    EXPECT_EQ(IssueHoldOrder(g), 1);
    EXPECT_TRUE(U(g, a).IsHolding());
    EXPECT_TRUE(IsStationary(U(g, a)));
    EXPECT_TRUE(!U(g, unselected).IsHolding());
    EXPECT_TRUE(!U(g, enemy).IsHolding());
}

TEST(IssueHold, NothingSelected_ReturnsZero) {
    GameState g = OpenGame();
    Spawn(g, Team::Player, Center(4, 2), "Soldier");
    EXPECT_EQ(IssueHoldOrder(g), 0);
}

TEST(IssueAttackMove, SmallGroup_EachUnitGetsOwnSlotAsGoal) {
    GameState g = OpenGame();
    std::vector<EntityId> ids;
    for (int i = 0; i < 3; ++i) ids.push_back(SpawnSelected(g, Center(4 + i, 2)));
    const EntityId bystander = Spawn(g, Team::Player, Center(10, 2), "Soldier");
    const Waypoint click = Center(8, 15);

    EXPECT_EQ(IssueAttackMoveOrder(g, click.x, click.y), 3);
    for (size_t i = 0; i < ids.size(); ++i) {
        const Unit& u = U(g, ids[i]);
        EXPECT_TRUE(u.IsAttackMoving());
        EXPECT_TRUE(u.hasMoveGoal);
        EXPECT_TRUE(u.pathPending);
        EXPECT_TRUE(!u.attackMoveEngaged);
        EXPECT_TRUE(u.attackMoveGoal.x == u.moveGoal.x && u.attackMoveGoal.y == u.moveGoal.y); // đi tới đúng chỗ đội hình của mình
        EXPECT_LE(std::hypot(u.attackMoveGoal.x - click.x, u.attackMoveGoal.y - click.y), 200.0f);
        for (size_t j = i + 1; j < ids.size(); ++j) {
            const Unit& o = U(g, ids[j]);
            EXPECT_GT(std::hypot(u.attackMoveGoal.x - o.attackMoveGoal.x, u.attackMoveGoal.y - o.attackMoveGoal.y), 20.0f);
        }
    }
    EXPECT_EQ(U(g, bystander).combatMode, CombatMode::Normal);
    EXPECT_TRUE(!U(g, bystander).hasMoveGoal);
}

TEST(IssueAttackMove, LargeGroupUsesFlowFieldAndStillMarksEveryone) {
    GameState g = OpenGame(20, 40);
    std::vector<EntityId> ids;
    const int n = kGroupSearchMinUnits + 4;
    for (int i = 0; i < n; ++i) ids.push_back(SpawnSelected(g, Center(4 + i % 7, 2 + i / 7)));
    const Waypoint click = Center(12, 30);

    EXPECT_EQ(IssueAttackMoveOrder(g, click.x, click.y), n);
    std::set<std::pair<int, int>> goals;
    for (EntityId id : ids) {
        const Unit& u = U(g, id);
        EXPECT_TRUE(u.IsAttackMoving());
        EXPECT_TRUE(u.hasMoveGoal);
        EXPECT_LE(std::hypot(u.attackMoveGoal.x - click.x, u.attackMoveGoal.y - click.y), 320.0f);
        goals.insert({ static_cast<int>(u.attackMoveGoal.x), static_cast<int>(u.attackMoveGoal.y) });
    }
    EXPECT_EQ(goals.size(), static_cast<size_t>(n));   // mỗi lính một vị trí riêng
}

TEST(IssueAttackMove, FoeUnderCursor_AttacksItDirectly) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    const EntityId b = SpawnSelected(g, Center(5, 2));
    const EntityId foe = Spawn(g, Team::Enemy, Center(8, 12), "Grunt");
    const Waypoint at = Center(8, 12);
    EXPECT_EQ(IssueAttackMoveOrder(g, at.x + 3.0f, at.y - 2.0f), 2);
    for (EntityId id : { a, b }) {
        EXPECT_EQ(U(g, id).attackTargetId, foe);
        EXPECT_TRUE(!U(g, id).autoTarget);            // lệnh của người chơi: đuổi tới cùng
        EXPECT_EQ(U(g, id).combatMode, CombatMode::Normal);
    }
}

TEST(IssueAttackMove, NothingSelected_ReturnsZeroAndChangesNothing) {
    GameState g = OpenGame();
    const EntityId a = Spawn(g, Team::Player, Center(4, 2), "Soldier");
    EXPECT_EQ(IssueAttackMoveOrder(g, 700.0f, 500.0f), 0);
    EXPECT_TRUE(!U(g, a).hasMoveGoal);
    EXPECT_TRUE(g.pathQueue.empty());
}

TEST(IssueAttackMove, DeadSelectedUnitsAreSkipped) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    const EntityId dead = SpawnSelected(g, Center(5, 2));
    U(g, dead).HpValue = 0;
    EXPECT_EQ(IssueAttackMoveOrder(g, 700.0f, 500.0f), 1);
    EXPECT_TRUE(U(g, a).IsAttackMoving());
    EXPECT_TRUE(!U(g, dead).IsAttackMoving());
}

TEST(IssueAttackMove, WorkersLoseTheirJobAndAreMovedToo) {
    GameState g = OpenGame();
    Prebuilt(g, "Townhall", 2, 2);
    g.AddResource(2, 8, 500);
    const EntityId w = SpawnSelected(g, Center(6, 5), "Worker");
    const EntityId s = SpawnSelected(g, Center(7, 5));
    OrderGather(U(g, w), g.resources[0].id);
    EXPECT_EQ(IssueAttackMoveOrder(g, 900.0f, 700.0f), 2);
    EXPECT_EQ(U(g, w).job.kind, JobKind::None);
    EXPECT_TRUE(U(g, w).IsAttackMoving());
    EXPECT_TRUE(U(g, s).IsAttackMoving());
}

TEST(IssueAttackMove, ReplacesHoldAndNewGoalReplacesOld) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    IssueHoldOrder(g);
    ASSERT_TRUE(U(g, a).IsHolding());
    IssueAttackMoveOrder(g, 900.0f, 700.0f);
    EXPECT_TRUE(U(g, a).IsAttackMoving());
    EXPECT_TRUE(!U(g, a).IsHolding());
    const Waypoint first = U(g, a).attackMoveGoal;
    IssueAttackMoveOrder(g, 300.0f, 300.0f);
    EXPECT_TRUE(U(g, a).attackMoveGoal.x != first.x || U(g, a).attackMoveGoal.y != first.y);
    EXPECT_LE(std::hypot(U(g, a).attackMoveGoal.x - 300.0f, U(g, a).attackMoveGoal.y - 300.0f), 100.0f);
}

TEST(IssueOrders, PlainMoveAfterHoldOrAttackMoveReturnsToNormal) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    IssueHoldOrder(g);
    IssueFormationMoveOrder(g, 700.0f, 500.0f);
    EXPECT_EQ(U(g, a).combatMode, CombatMode::Normal);
    IssueAttackMoveOrder(g, 900.0f, 700.0f);
    IssueFormationMoveOrder(g, 700.0f, 500.0f);
    EXPECT_EQ(U(g, a).combatMode, CombatMode::Normal);
    EXPECT_TRUE(!U(g, a).attackMoveEngaged);
}

TEST(IssueOrders, RightClickOnFoeAfterHold_ChasesAndReleasesHold) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(8, 3));
    const EntityId foe = Spawn(g, Team::Enemy, Center(8, 10), "Worker");
    IssueHoldOrder(g);
    IssueSmartOrder(g, Center(8, 10).x, Center(8, 10).y);
    EXPECT_EQ(U(g, a).attackTargetId, foe);
    EXPECT_EQ(U(g, a).combatMode, CombatMode::Normal);
    ::RunSeconds(g, 1.0f);
    EXPECT_GT(U(g, a).x, Center(8, 3).x + 100.0f);    // thật sự đuổi theo
}

// ===========================================================================
// 4. Phím S / H / A và chế độ chờ chọn điểm Attack-move (game/Commands.*)
// ===========================================================================
TEST(AttackMoveKey, NothingSelected_NotArmedAndTellsPlayer) {
    GameState g = OpenGame();
    Spawn(g, Team::Player, Center(4, 2), "Soldier");
    EXPECT_FALSE(BeginAttackMoveMode(g));
    EXPECT_FALSE(g.attackMoveArmed);
    EXPECT_GT(g.noticeTimer, 0.0f);
    EXPECT_TRUE(!g.notice.empty());
}

TEST(AttackMoveKey, OnlyBuildingSelected_NotArmed) {
    GameState g = OpenGame();
    Prebuilt(g, "Barracks", 2, 2).selected = true;
    HandleAttackMoveKey(g);
    EXPECT_FALSE(g.attackMoveArmed);
}

TEST(AttackMoveKey, OnlyEnemyOrDeadSelected_NotArmed) {
    GameState g = OpenGame();
    SpawnSelected(g, Center(4, 2), "Grunt", Team::Enemy);
    const EntityId dead = SpawnSelected(g, Center(5, 2));
    U(g, dead).HpValue = 0;
    HandleAttackMoveKey(g);
    EXPECT_FALSE(g.attackMoveArmed);
}

TEST(AttackMoveKey, TogglesWhenUnitsSelected) {
    GameState g = OpenGame();
    SpawnSelected(g, Center(4, 2));
    HandleAttackMoveKey(g);
    EXPECT_TRUE(g.attackMoveArmed);
    HandleAttackMoveKey(g);
    EXPECT_FALSE(g.attackMoveArmed);
    BeginAttackMoveMode(g);
    EXPECT_TRUE(g.attackMoveArmed);
    CancelAttackMoveMode(g);
    EXPECT_FALSE(g.attackMoveArmed);
}

TEST(AttackMoveKey, IgnoredWhileInBuildPlacement) {
    GameState g = OpenGame();
    SpawnSelected(g, Center(4, 2), "Worker");
    ASSERT_TRUE(BeginPlacement(g, 0));
    HandleAttackMoveKey(g);
    EXPECT_FALSE(g.attackMoveArmed);
    EXPECT_TRUE(g.placement.active);
}

TEST(AttackMoveKey, EnteringBuildPlacementDisarms) {
    GameState g = OpenGame();
    SpawnSelected(g, Center(4, 2), "Worker");
    HandleAttackMoveKey(g);
    ASSERT_TRUE(g.attackMoveArmed);
    HandleBuildKey(g);
    EXPECT_TRUE(g.placement.active);
    EXPECT_FALSE(g.attackMoveArmed);
}

TEST(AttackMoveKey, FailedBuildKeyKeepsArmed) {
    GameState g = OpenGame();
    SpawnSelected(g, Center(4, 2), "Soldier");   // không có thợ nào được chọn
    HandleAttackMoveKey(g);
    ASSERT_TRUE(g.attackMoveArmed);
    HandleBuildKey(g);
    EXPECT_FALSE(g.placement.active);
    EXPECT_TRUE(g.attackMoveArmed);
}

TEST(ConfirmAttackMove, IssuesOrderAndLeavesMode) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    const EntityId b = SpawnSelected(g, Center(5, 2));
    HandleAttackMoveKey(g);
    ASSERT_TRUE(g.attackMoveArmed);
    EXPECT_TRUE(ConfirmAttackMove(g, 900.0f, 600.0f));
    EXPECT_FALSE(g.attackMoveArmed);
    EXPECT_TRUE(U(g, a).IsAttackMoving());
    EXPECT_TRUE(U(g, b).IsAttackMoving());
}

TEST(ConfirmAttackMove, NotArmed_DoesNothing) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    EXPECT_FALSE(ConfirmAttackMove(g, 900.0f, 600.0f));
    EXPECT_TRUE(!U(g, a).hasMoveGoal);
    EXPECT_EQ(U(g, a).combatMode, CombatMode::Normal);
}

TEST(ConfirmAttackMove, SelectionGoneAfterArming_FailsWithNoticeAndLeavesMode) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    HandleAttackMoveKey(g);
    ASSERT_TRUE(g.attackMoveArmed);
    U(g, a).selected = false;
    EXPECT_FALSE(ConfirmAttackMove(g, 900.0f, 600.0f));
    EXPECT_FALSE(g.attackMoveArmed);
    EXPECT_GT(g.noticeTimer, 0.0f);
}

TEST(ConfirmAttackMove, ClickOnFoeAttacksIt) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    const EntityId foe = Spawn(g, Team::Enemy, Center(8, 12), "Grunt");
    HandleAttackMoveKey(g);
    EXPECT_TRUE(ConfirmAttackMove(g, Center(8, 12).x, Center(8, 12).y));
    EXPECT_EQ(U(g, a).attackTargetId, foe);
}

TEST(StopHoldKeys, StopStopsSelectedUnitsAndDisarms) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    OrderMoveTo(g, U(g, a), 900.0f, 500.0f);
    HandleAttackMoveKey(g);
    HandleStopKey(g);
    EXPECT_FALSE(g.attackMoveArmed);
    EXPECT_TRUE(IsStationary(U(g, a)));
}

TEST(StopHoldKeys, HoldHoldsSelectedUnitsAndDisarms) {
    GameState g = OpenGame();
    const EntityId a = SpawnSelected(g, Center(4, 2));
    const EntityId other = Spawn(g, Team::Player, Center(6, 2), "Soldier");
    HandleAttackMoveKey(g);
    HandleHoldKey(g);
    EXPECT_FALSE(g.attackMoveArmed);
    EXPECT_TRUE(U(g, a).IsHolding());
    EXPECT_TRUE(!U(g, other).IsHolding());
}

TEST(StopHoldKeys, IgnoredWhileInBuildPlacement) {
    GameState g = OpenGame();
    const EntityId w = SpawnSelected(g, Center(4, 2), "Worker");
    OrderMoveTo(g, U(g, w), 900.0f, 500.0f);
    ASSERT_TRUE(BeginPlacement(g, 0));
    HandleStopKey(g);
    HandleHoldKey(g);
    EXPECT_TRUE(U(g, w).hasMoveGoal);
    EXPECT_TRUE(!U(g, w).IsHolding());
    EXPECT_TRUE(g.placement.active);
}

TEST(StopHoldKeys, NothingSelectedIsHarmless) {
    GameState g = OpenGame();
    const EntityId a = Spawn(g, Team::Player, Center(4, 2), "Soldier");
    OrderMoveTo(g, U(g, a), 900.0f, 500.0f);
    HandleStopKey(g);
    HandleHoldKey(g);
    EXPECT_TRUE(U(g, a).hasMoveGoal);
    EXPECT_TRUE(g.notice.empty());                 // S / H không báo lỗi khi chưa chọn gì
}

TEST(StopHoldKeys, RestartResetsArmedMode) {
    GameState g = OpenGame();
    g.attackMoveArmed = true;
    InitializeWorld(g);
    EXPECT_FALSE(g.attackMoveArmed);
}

// ===========================================================================
// 5. Va chạm: lính giữ vị trí không bị đẩy lệch hẳn như lính đứng yên thường
// ===========================================================================
namespace {
    // Hai lính chồng lên nhau 10px theo trục x: a ở (500,500), b ở (530,500).
    struct CollisionRig {
        GameState g = OpenGame();
        EntityId a = kNoEntity, b = kNoEntity;
        CollisionRig() {
            a = Spawn(g, Team::Player, { 500.0f, 500.0f }, "Soldier");
            b = Spawn(g, Team::Player, { 530.0f, 500.0f }, "Soldier");
        }
        void MakeMoving(EntityId id) { U(g, id).path.assign({ Waypoint{ 800.0f, 500.0f } }); } // đang đi ra xa
    };
}

TEST(HoldCollisions, IdleUnitStillYieldsEntirelyToMover_Control) {
    CollisionRig r;
    r.MakeMoving(r.b);
    ResolveUnitCollisions(r.g);
    EXPECT_NEAR(U(r.g, r.a).x, 490.0f, 0.01f);
    EXPECT_NEAR(U(r.g, r.b).x, 530.0f, 0.01f);
}

TEST(HoldCollisions, HeldUnitIsNotShovedEntirelyByAMover) {
    CollisionRig r;
    U(r.g, r.a).OrderHold();
    r.MakeMoving(r.b);
    ResolveUnitCollisions(r.g);
    EXPECT_NEAR(U(r.g, r.a).x, 495.0f, 0.01f);     // chỉ nhường một nửa
    EXPECT_NEAR(U(r.g, r.b).x, 535.0f, 0.01f);
    EXPECT_NEAR(U(r.g, r.a).y, 500.0f, 0.01f);
    EXPECT_NEAR(U(r.g, r.b).y, 500.0f, 0.01f);
}

TEST(HoldCollisions, IdleUnitYieldsEntirelyToHeldUnit) {
    CollisionRig r;
    U(r.g, r.a).OrderHold();
    ResolveUnitCollisions(r.g);
    EXPECT_NEAR(U(r.g, r.a).x, 500.0f, 0.01f);
    EXPECT_NEAR(U(r.g, r.b).x, 540.0f, 0.01f);
}

TEST(HoldCollisions, TwoHeldUnitsSplitTheOverlap) {
    CollisionRig r;
    U(r.g, r.a).OrderHold();
    U(r.g, r.b).OrderHold();
    ResolveUnitCollisions(r.g);
    EXPECT_NEAR(U(r.g, r.a).x, 495.0f, 0.01f);
    EXPECT_NEAR(U(r.g, r.b).x, 535.0f, 0.01f);
}

TEST(HoldCollisions, HeldUnitNeverPushedIntoWalls) {
    // Lính giữ vị trí sát tường bị lính khác đẩy: vẫn không được lọt vào tường.
    GameState g = MakeGame(MakeMap({ "##########", "#........#", "#........#", "#........#", "##########" }));
    const EntityId a = Spawn(g, Team::Player, Center(2, 1), "Soldier");
    const EntityId b = Spawn(g, Team::Player, { Center(2, 1).x + 30.0f, Center(2, 1).y }, "Soldier");
    U(g, a).OrderHold();
    U(g, b).path.assign({ Waypoint{ Center(2, 1).x - 30.0f, Center(2, 1).y } }); // đi xuyên qua a, ép a vào tường
    ::Run(g, 60);
    EXPECT_EQ(UnitsInsideWalls(g), 0);
}

// ===========================================================================
// 6. Kịch bản mô phỏng: Stop
// ===========================================================================
TEST(StopSim, WalkingUnitStopsAndStaysPut) {
    GameState g = OpenGame();
    const EntityId id = SpawnSelected(g, Center(8, 2));
    OrderMoveTo(g, U(g, id), Center(8, 20).x, Center(8, 20).y);
    ::RunSeconds(g, 1.0f);
    ASSERT_GT(U(g, id).x, Center(8, 2).x + 150.0f);   // đã đi được một đoạn
    ASSERT_EQ(IssueStopOrder(g), 1);
    const Waypoint at = { U(g, id).x, U(g, id).y };
    ::RunSeconds(g, 3.0f);
    EXPECT_LT(DistToId(g, id, at), 1.0f);
    EXPECT_TRUE(IsStationary(U(g, id)));
    EXPECT_EQ(U(g, id).state, UnitState::Idle);
}

TEST(StopSim, StopRightAfterOrder_StalePathRequestDoesNotMoveUnit) {
    GameState g = OpenGame();
    const EntityId id = SpawnSelected(g, Center(8, 2));
    const Waypoint start = { U(g, id).x, U(g, id).y };
    OrderMoveTo(g, U(g, id), Center(8, 20).x, Center(8, 20).y);   // yêu cầu đường chưa kịp phục vụ
    ASSERT_EQ(IssueStopOrder(g), 1);
    ::RunSeconds(g, 2.0f);
    EXPECT_LT(DistToId(g, id, start), 1.0f);
}

TEST(StopSim, StopsExplicitChaseOfDistantFoe) {
    GameState g = OpenGame();
    const EntityId id = SpawnSelected(g, Center(8, 2));
    const EntityId foe = Spawn(g, Team::Enemy, Center(8, 21), "Worker");
    IssueAttackOrder(g, foe);
    ::RunSeconds(g, 1.0f);
    ASSERT_GT(U(g, id).x, Center(8, 2).x + 150.0f);
    ASSERT_GT(Dist(U(g, id), U(g, foe)), 192.0f + 100.0f);   // vẫn còn xa, Stop xong sẽ không tự vệ ngay
    IssueStopOrder(g);
    const Waypoint at = { U(g, id).x, U(g, id).y };
    ::RunSeconds(g, 2.0f);
    EXPECT_LT(DistToId(g, id, at), 1.0f);
    EXPECT_TRUE(!U(g, id).HasTarget());
}

TEST(StopSim, StopsWorkerThatIsMining) {
    GameState g = OpenGame();
    Prebuilt(g, "Townhall", 2, 2);
    g.AddResource(2, 9, 800);
    const EntityId w = SpawnSelected(g, Center(6, 5), "Worker");
    OrderGather(U(g, w), g.resources[0].id);
    ::RunSeconds(g, 4.0f);
    ASSERT_EQ(U(g, w).job.kind, JobKind::Gather);
    ASSERT_EQ(IssueStopOrder(g), 1);
    const Waypoint at = { U(g, w).x, U(g, w).y };
    const int carried = U(g, w).carrying;
    const int gold = g.Gold(Team::Player);
    ::RunSeconds(g, 12.0f);
    EXPECT_EQ(U(g, w).job.kind, JobKind::None);
    EXPECT_LT(DistToId(g, w, at), 1.0f);
    EXPECT_EQ(U(g, w).carrying, carried);             // không đào thêm
    EXPECT_EQ(g.Gold(Team::Player), gold);            // không đem vàng về nữa
}

TEST(StopSim, StopCancelsAttackMoveEntirely) {
    GameState g = OpenGame();
    const EntityId id = SpawnSelected(g, Center(8, 2));
    IssueAttackMoveOrder(g, Center(8, 21).x, Center(8, 21).y);
    ::RunSeconds(g, 1.0f);
    ASSERT_TRUE(U(g, id).IsAttackMoving());
    IssueStopOrder(g);
    const Waypoint at = { U(g, id).x, U(g, id).y };
    ::RunSeconds(g, 3.0f);
    EXPECT_LT(DistToId(g, id, at), 1.0f);
    EXPECT_EQ(U(g, id).combatMode, CombatMode::Normal);
}

TEST(StopSim, StoppedIdleUnitStillDefendsItself) {
    // Stop đưa lính về trạng thái đứng yên bình thường: có kẻ địch trong tầm phát hiện thì vẫn tự vệ.
    GameState g = OpenGame();
    SpawnSelected(g, Center(8, 5));
    const EntityId foe = Spawn(g, Team::Enemy, { Center(8, 5).x + 120.0f, Center(8, 5).y }, "Worker");
    IssueHoldOrder(g);
    ::RunSeconds(g, 2.0f);
    ASSERT_TRUE(Untouched(g, foe));    // đang Hold: không đuổi theo
    IssueStopOrder(g);                                // Stop hủy Hold -> lính thường
    ::RunSeconds(g, 3.0f);
    EXPECT_TRUE(!Alive(g, foe) || U(g, foe).HpValue < U(g, foe).HpMax);
}

// ===========================================================================
// 7. Kịch bản mô phỏng: Hold position
// ===========================================================================
TEST(HoldSim, DoesNotChaseFoeThatIsInAggroRangeButOutOfReach) {
    GameState g = OpenGame();
    const Waypoint post = Center(8, 5);
    const EntityId id = SpawnSelected(g, post);
    const EntityId foe = Spawn(g, Team::Enemy, { post.x + 150.0f, post.y }, "Worker");   // worker địch đứng yên, không đánh ai
    IssueHoldOrder(g);
    ::RunSeconds(g, 8.0f);
    EXPECT_LT(DistToId(g, id, post), 1.0f);
    EXPECT_TRUE(Untouched(g, foe));
    EXPECT_TRUE(IsStationary(U(g, id)));
    EXPECT_TRUE(U(g, id).IsHolding());
}

TEST(HoldSim, ControlWithoutHold_SameSoldierChasesAndHurtsTheFoe) {
    GameState g = OpenGame();
    const Waypoint post = Center(8, 5);
    const EntityId id = Spawn(g, Team::Player, post, "Soldier");
    const EntityId foe = Spawn(g, Team::Enemy, { post.x + 150.0f, post.y }, "Worker");
    ::RunSeconds(g, 8.0f);
    EXPECT_TRUE(!Alive(g, foe) || U(g, foe).HpValue < U(g, foe).HpMax);
    EXPECT_GT(U(g, id).x, post.x + 50.0f);
}

TEST(HoldSim, FightsFoeInReachWithoutMoving) {
    GameState g = OpenGame();
    const Waypoint post = Center(8, 5);
    const EntityId id = SpawnSelected(g, post);
    const EntityId foe = Spawn(g, Team::Enemy, { post.x + 55.0f, post.y }, "Worker");   // trong tầm đánh (tâm cách <= 60)
    IssueHoldOrder(g);
    const float t = RunUntil(g, 20.0f, [&] { return !Alive(g, foe); });
    EXPECT_GE(t, 0.0f) << "foe in reach was never killed";
    EXPECT_LT(DistToId(g, id, post), 1.0f);
}

TEST(HoldSim, DefendsItsPostAgainstAnApproachingEnemyWithoutLeavingIt) {
    GameState g = OpenGame();
    const Waypoint post = Center(8, 5);
    const EntityId id = SpawnSelected(g, post);
    const EntityId grunt = Spawn(g, Team::Enemy, { post.x + 150.0f, post.y }, "Grunt");   // địch tự đuổi tới
    U(g, grunt).HpMax = U(g, grunt).HpValue = 60;
    IssueHoldOrder(g);
    const float t = RunUntil(g, 30.0f, [&] { return !Alive(g, grunt); });
    EXPECT_GE(t, 0.0f) << "held soldier did not beat the grunt that came to it";
    ASSERT_TRUE(Alive(g, id));
    EXPECT_LT(DistToId(g, id, post), 2.0f);
    EXPECT_TRUE(U(g, id).IsHolding());
}

TEST(HoldSim, FoeStepsOutOfReach_SoldierDoesNotFollow) {
    GameState g = OpenGame();
    const Waypoint post = Center(8, 5);
    const EntityId id = SpawnSelected(g, post);
    const EntityId foe = Spawn(g, Team::Enemy, { post.x + 55.0f, post.y }, "Worker");
    IssueHoldOrder(g);
    ::RunSeconds(g, 0.5f);
    ASSERT_TRUE(U(g, id).HasTarget());
    U(g, foe).x = post.x + 170.0f;                    // địch lùi ra ngoài tầm đánh
    ::RunSeconds(g, 3.0f);
    EXPECT_LT(DistToId(g, id, post), 1.0f);
    EXPECT_TRUE(!U(g, id).HasTarget());
}

TEST(HoldSim, MovingOutOfHoldWorksAfterwards) {
    GameState g = OpenGame();
    const Waypoint post = Center(8, 5);
    const EntityId id = SpawnSelected(g, post);
    IssueHoldOrder(g);
    ::RunSeconds(g, 1.0f);
    IssueFormationMoveOrder(g, Center(8, 15).x, Center(8, 15).y);
    ::RunSeconds(g, 6.0f);
    EXPECT_LT(DistToId(g, id, Center(8, 15)), 30.0f);
    EXPECT_EQ(U(g, id).combatMode, CombatMode::Normal);
}

// ===========================================================================
// 8. Kịch bản mô phỏng: Attack-move
// ===========================================================================
TEST(AttackMoveSim, EngagesFoeOnTheWay_ThenArrivesAtGoal) {
    GameState g = OpenGame();
    const EntityId p = SpawnSelected(g, Center(8, 1));
    const EntityId e = Spawn(g, Team::Enemy, Center(6, 8), "Worker");        // cách đường đi 2 ô: trong tầm phát hiện
    ASSERT_EQ(IssueAttackMoveOrder(g, Center(8, 20).x, Center(8, 20).y), 1);
    const Waypoint goal = U(g, p).attackMoveGoal;
    const float t = RunUntil(g, 60.0f, [&] {
        return !Alive(g, e) && Alive(g, p) && DistToId(g, p, goal) < 8.0f && U(g, p).combatMode == CombatMode::Normal;
    });
    EXPECT_GE(t, 0.0f) << "attack-move did not (kill the foe AND arrive); soldier at " << U(g, p).x << "," << U(g, p).y;
    EXPECT_TRUE(!U(g, p).attackMoveEngaged);
    EXPECT_EQ(UnitsInsideWalls(g), 0);
}

TEST(AttackMoveSim, ControlPlainMoveIgnoresTheSameFoe) {
    GameState g = OpenGame();
    const EntityId p = SpawnSelected(g, Center(8, 1));
    const EntityId e = Spawn(g, Team::Enemy, Center(6, 8), "Worker");
    IssueFormationMoveOrder(g, Center(8, 20).x, Center(8, 20).y);
    ::RunSeconds(g, 15.0f);
    EXPECT_LT(DistToId(g, p, Center(8, 20)), 8.0f);
    EXPECT_TRUE(Untouched(g, e));
}

TEST(AttackMoveSim, NoFoes_BehavesLikeMoveAndEndsInNormalMode) {
    GameState g = OpenGame();
    const EntityId p = SpawnSelected(g, Center(8, 1));
    IssueAttackMoveOrder(g, Center(8, 20).x, Center(8, 20).y);
    const Waypoint goal = U(g, p).attackMoveGoal;
    const float t = RunUntil(g, 20.0f, [&] { return DistToId(g, p, goal) < 8.0f && U(g, p).combatMode == CombatMode::Normal; });
    EXPECT_GE(t, 0.0f);
    EXPECT_LT(t, 8.0f);                               // không bị chậm lại một cách bất thường
}

TEST(AttackMoveSim, KillsSeveralFoesInTurnThenContinues) {
    GameState g = OpenGame(16, 26);
    const EntityId p = SpawnSelected(g, Center(8, 1));
    std::vector<EntityId> foes;
    for (const Waypoint& w : { Center(6, 6), Center(10, 11), Center(7, 16) }) foes.push_back(Spawn(g, Team::Enemy, w, "Worker"));
    IssueAttackMoveOrder(g, Center(8, 24).x, Center(8, 24).y);
    const Waypoint goal = U(g, p).attackMoveGoal;
    const float t = RunUntil(g, 120.0f, [&] {
        bool allDead = true;
        for (EntityId f : foes) allDead = allDead && !Alive(g, f);
        return allDead && Alive(g, p) && DistToId(g, p, goal) < 8.0f && U(g, p).combatMode == CombatMode::Normal;
    });
    EXPECT_GE(t, 0.0f);
}

TEST(AttackMoveSim, FoeOnUnreachableIsland_IsGivenUpAndGoalStillReached) {
    std::vector<std::string> rows = Blank(12, 20);
    for (int c = 9; c <= 11; ++c) { rows[5][static_cast<size_t>(c)] = '~'; rows[7][static_cast<size_t>(c)] = '~'; }
    rows[6][9] = '~'; rows[6][11] = '~';              // hòn đảo một ô (6,10) bao quanh bởi nước
    GameState g = MakeGame(MakeMap(rows));
    const EntityId p = SpawnSelected(g, Center(8, 1));
    const EntityId e = Spawn(g, Team::Enemy, Center(6, 10), "Worker");
    IssueAttackMoveOrder(g, Center(8, 18).x, Center(8, 18).y);
    const Waypoint goal = U(g, p).attackMoveGoal;
    const float t = RunUntil(g, 40.0f, [&] { return DistToId(g, p, goal) < 8.0f && U(g, p).combatMode == CombatMode::Normal; });
    EXPECT_GE(t, 0.0f) << "soldier got stuck trying to reach an unreachable foe; at " << U(g, p).x << "," << U(g, p).y;
    EXPECT_TRUE(Untouched(g, e));        // địch trên đảo không bị đánh tới
}

TEST(AttackMoveSim, SmallGroupBeatsEnemiesInTheWayAndAllArrive) {
    GameState g = OpenGame(16, 26);
    std::vector<EntityId> mine;
    for (int i = 0; i < 6; ++i) mine.push_back(SpawnSelected(g, Center(5 + i, 1)));
    for (int r : { 6, 8, 10 }) Spawn(g, Team::Enemy, Center(r, 13), "Grunt");
    g.startCount[static_cast<int>(Team::Enemy)] = 3;   // (InitializeWorld làm việc này; ở đây dựng tay) -> hết địch là thắng
    IssueAttackMoveOrder(g, Center(8, 23).x, Center(8, 23).y);
    const float t = RunUntil(g, 90.0f, [&] {
        if (CountAlive(g, Team::Enemy) > 0) return false;
        for (EntityId id : mine) if (Alive(g, id) && U(g, id).IsAttackMoving()) return false;
        return true;
    });
    EXPECT_GE(t, 0.0f) << "enemies left: " << CountAlive(g, Team::Enemy);
    EXPECT_EQ(g.result, MatchResult::Victory);
    EXPECT_GE(CountAlive(g, Team::Player), 4);
    EXPECT_EQ(UnitsInsideWalls(g), 0);
}

TEST(AttackMoveSim, LargeGroupUsingFlowFieldArrivesAndLeavesAttackMove) {
    GameState g = OpenGame(20, 40);
    std::vector<EntityId> ids;
    for (int i = 0; i < 14; ++i) ids.push_back(SpawnSelected(g, Center(6 + i % 7, 2 + i / 7)));
    IssueAttackMoveOrder(g, Center(10, 34).x, Center(10, 34).y);
    for (EntityId id : ids) ASSERT_TRUE(U(g, id).IsAttackMoving());
    const float t = RunUntil(g, 60.0f, [&] {
        for (EntityId id : ids) if (U(g, id).IsAttackMoving()) return false;
        return true;
    });
    EXPECT_GE(t, 0.0f);
    for (EntityId id : ids) EXPECT_LT(DistToId(g, id, Center(10, 34)), 330.0f);
    EXPECT_EQ(UnitsInsideWalls(g), 0);
}

TEST(AttackMoveSim, NewMoveOrderMidFightCancelsAttackMove) {
    GameState g = OpenGame();
    const EntityId p = SpawnSelected(g, Center(8, 1));
    const EntityId e = Spawn(g, Team::Enemy, Center(6, 8), "Worker");
    IssueAttackMoveOrder(g, Center(8, 20).x, Center(8, 20).y);
    ASSERT_GE(RunUntil(g, 15.0f, [&] { return U(g, p).attackMoveEngaged; }), 0.0f);   // đã quay sang đánh con địch
    IssueFormationMoveOrder(g, Center(14, 3).x, Center(14, 3).y);
    EXPECT_EQ(U(g, p).combatMode, CombatMode::Normal);
    EXPECT_TRUE(!U(g, p).attackMoveEngaged);
    ::RunSeconds(g, 6.0f);
    EXPECT_LT(DistToId(g, p, Center(14, 3)), 30.0f);
    EXPECT_TRUE(Alive(g, e));                    // lệnh đi mới không bị "đi tiếp rồi quay lại đánh"
}

TEST(AttackMoveSim, AttackedFromBesideTheRoad_AttackMoverFightsBack) {
    GameState g = OpenGame();
    const EntityId p = SpawnSelected(g, Center(8, 2));
    const EntityId grunt = Spawn(g, Team::Enemy, Center(8, 6), "Grunt");   // 4 ô: ngoài tầm phát hiện của cả hai bên
    U(g, grunt).HpMax = U(g, grunt).HpValue = 40;
    IssueAttackMoveOrder(g, Center(8, 20).x, Center(8, 20).y);
    const float t = RunUntil(g, 40.0f, [&] { return !Alive(g, grunt); });
    EXPECT_GE(t, 0.0f);
    EXPECT_TRUE(Alive(g, p));
}

// ===========================================================================
// 9. Vẽ (chỉ kiểm tra không lỗi/crash; hình ảnh cần xem bằng mắt)
// ===========================================================================
TEST(CombatRender, DrawsHoldAttackMoveMarkersAndArmedCursorWithoutCrashing) {
    GameState g = OpenGame();
    const EntityId hold = SpawnSelected(g, Center(4, 3));
    const EntityId am = SpawnSelected(g, Center(6, 3));
    Spawn(g, Team::Enemy, Center(6, 10), "Grunt");
    U(g, hold).OrderHold();
    IssueHoldOrder(g);
    U(g, am).selected = true;
    IssueAttackMoveOrder(g, Center(10, 15).x, Center(10, 15).y);   // cả hai cùng được chọn: Attack-move thay Hold
    U(g, hold).OrderHold();
    ::Run(g, 5);
    g.attackMoveArmed = true;
    for (bool debug : { false, true }) {
        g.debugMode = debug;
        RenderGame(nullptr, g, 1280, 720);
    }
    SUCCEED();
}

// ===========================================================================
// 10. Stress ngẫu nhiên
// ===========================================================================
namespace {
    GameState BuildStressGame(Rng& rng) {
        const int rows = rng.Int(14, 22);
        const int cols = rng.Int(18, 30);
        std::vector<std::string> m = Blank(rows, cols);
        for (int r = 0; r < rows; ++r)
            for (int c = 0; c < cols; ++c)
                if (rng.Chance(10)) m[static_cast<size_t>(r)][static_cast<size_t>(c)] = rng.Chance(50) ? '~' : '#';
        for (int r = 1; r <= 5; ++r)
            for (int c = 1; c <= 9; ++c) m[static_cast<size_t>(r)][static_cast<size_t>(c)] = '.';   // vùng căn cứ luôn trống
        GameState g = MakeGame(MakeMap(m), 500);
        Prebuilt(g, "Townhall", 1, 1);
        g.AddResource(1, 6, 800);
        return g;
    }

    void SpawnRandom(GameState& g, Rng& rng, Team team, const char* type, int count) {
        for (int i = 0, tries = 0; i < count && tries < 200; ++tries) {
            const int r = rng.Int(0, g.map.rows - 1), c = rng.Int(0, g.map.cols - 1);
            const Waypoint p = Center(r, c);
            if (!g.map.CanBoxStandAt(p.x, p.y, kSquareSize)) continue;
            Spawn(g, team, p, type);
            ++i;
        }
    }

    Waypoint RandomWorldPoint(const GameState& g, Rng& rng) {
        return { static_cast<float>(rng.Int(0, static_cast<int>(g.map.cols * 64) - 1)),
                 static_cast<float>(rng.Int(0, static_cast<int>(g.map.rows * 64) - 1)) };
    }

    void RandomAction(GameState& g, Rng& rng) {
        const Waypoint p = RandomWorldPoint(g, rng);
        switch (rng.Int(0, 11)) {
        case 0: case 1:  // chọn ngẫu nhiên một số lính phe ta
            for (auto& u : g.units) u.selected = (u.team == Team::Player && u.IsAlive() && rng.Chance(55));
            break;
        case 2: IssueStopOrder(g); break;
        case 3: IssueHoldOrder(g); break;
        case 4: case 5: IssueAttackMoveOrder(g, p.x, p.y); break;
        case 6: IssueFormationMoveOrder(g, p.x, p.y); break;
        case 7: IssueSmartOrder(g, p.x, p.y); break;
        case 8: HandleAttackMoveKey(g); if (g.attackMoveArmed) ConfirmAttackMove(g, p.x, p.y); break;
        case 9: if (rng.Chance(50)) HandleStopKey(g); else HandleHoldKey(g); break;
        case 10: IssueSmartOrder(g, Center(1, 6).x + 20.0f, Center(1, 6).y + 20.0f); break;   // gửi thợ đi đào mỏ
        case 11:         // có lính chết bất ngờ
            if (!g.units.empty()) {
                Unit& victim = g.units[static_cast<size_t>(rng.Int(0, static_cast<int>(g.units.size()) - 1))];
                if (rng.Chance(30)) victim.HpValue = 0;
            }
            break;
        }
    }

    // Mọi bất biến phải đúng sau MỖI tick. Trả về mô tả lỗi, rỗng nếu ổn.
    std::string CheckInvariants(const GameState& g) {
        if (UnitsInsideWalls(g) != 0) return "unit inside walls";
        if (!IdsUniqueAndSorted(g)) return "unit ids not unique/sorted";
        const float w = static_cast<float>(g.map.cols) * 64.0f, h = static_cast<float>(g.map.rows) * 64.0f;
        for (const auto& u : g.units) {
            if (!u.IsAlive()) continue;
            if (u.IsHolding() && !IsStationary(u)) return "holding unit has a path / move goal / pending path request";
            if (u.attackMoveEngaged && !u.IsAttackMoving()) return "engaged flag without attack-move mode";
            if (u.team == Team::Enemy && u.combatMode != CombatMode::Normal) return "enemy unit in a player combat mode";
            if (u.IsAttackMoving() && !(u.attackMoveGoal.x >= 0.0f && u.attackMoveGoal.x <= w && u.attackMoveGoal.y >= 0.0f && u.attackMoveGoal.y <= h))
                return "attack-move goal outside the map";
            if (u.IsHolding() && u.job.kind != JobKind::None) return "holding unit still has a work job";
        }
        return {};
    }
}

TEST(CombatStress, RandomOrdersOnRandomMaps_InvariantsHoldEveryTick) {
    const char* env = std::getenv("COMBAT_STRESS_SCENARIOS");
    const int scenarios = env ? std::max(1, std::atoi(env)) : 40;
    // Độ phủ: để chắc là các ván ngẫu nhiên THỰC SỰ chạm tới các tính năng chứ không chạy "rỗng".
    long holdTicks = 0, attackMoveTicks = 0, engagedTicks = 0, holdFightTicks = 0, deaths = 0;
    for (int s = 0; s < scenarios; ++s) {
        Rng rng(static_cast<std::uint32_t>(s * 7919 + 13));
        GameState g = BuildStressGame(rng);
        SpawnRandom(g, rng, Team::Player, "Worker", rng.Int(0, 3));
        SpawnRandom(g, rng, Team::Player, "Soldier", rng.Int(3, 14));
        SpawnRandom(g, rng, Team::Enemy, "Grunt", rng.Int(1, 5));
        SpawnRandom(g, rng, Team::Enemy, "Worker", rng.Int(0, 2));
        const int ticks = rng.Int(500, 900);
        int untilAction = 0;
        for (int t = 0; t < ticks; ++t) {
            if (--untilAction <= 0) { RandomAction(g, rng); untilAction = rng.Int(4, 30); }
            StepSimulation(g, kTickDt);
            const std::string err = CheckInvariants(g);
            ASSERT_TRUE(err.empty()) << "scenario " << s << " tick " << t << ": " << err;
            for (const auto& u : g.units) {
                if (!u.IsAlive()) { ++deaths; continue; }
                if (u.IsHolding()) { ++holdTicks; if (u.HasTarget()) ++holdFightTicks; }
                if (u.IsAttackMoving()) { ++attackMoveTicks; if (u.attackMoveEngaged) ++engagedTicks; }
            }
        }
    }
    if (scenarios >= 20) {
        EXPECT_GT(holdTicks, 0) << "stress never had a unit on hold";
        EXPECT_GT(holdFightTicks, 0) << "stress never had a held unit fighting";
        EXPECT_GT(attackMoveTicks, 0) << "stress never had a unit attack-moving";
        EXPECT_GT(engagedTicks, 0) << "stress never had an attack-moving unit engage a foe";
    }
    if (std::getenv("COMBAT_STRESS_VERBOSE")) {
        std::printf("      coverage: holdTicks=%ld holdFight=%ld attackMoveTicks=%ld engaged=%ld deadTicks=%ld\n",
            holdTicks, holdFightTicks, attackMoveTicks, engagedTicks, deaths);
    }
}

TEST(CombatStress, AttackMoveAlwaysEndsEvenWhenGoalIsUnreachable) {
    const char* env = std::getenv("COMBAT_STRESS_SCENARIOS");
    const int scenarios = env ? std::max(1, std::atoi(env)) : 40;
    for (int s = 0; s < scenarios; ++s) {
        Rng rng(static_cast<std::uint32_t>(s * 104729 + 7));
        GameState g = BuildStressGame(rng);
        SpawnRandom(g, rng, Team::Player, "Soldier", rng.Int(1, 12));
        for (auto& u : g.units) if (u.team == Team::Player) u.selected = u.IsAlive() && !u.IsWorker();
        const Waypoint goal = RandomWorldPoint(g, rng);                // có thể rơi vào nước / đá / đảo kín
        IssueAttackMoveOrder(g, goal.x, goal.y);
        const float t = RunUntil(g, 120.0f, [&] {
            for (const auto& u : g.units) if (u.IsAlive() && (u.IsAttackMoving() || !IsStationary(u))) return false;
            return true;
        });
        ASSERT_GE(t, 0.0f) << "scenario " << s << ": a unit is still attack-moving / walking after 120 s";
    }
}
