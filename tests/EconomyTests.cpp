// Kiểm thử kinh tế & xây dựng (bước 4), không cần cửa sổ / SDL thật:
//   - lớp "ô bị chiếm" của TileMap chặn A*, FlowField, va chạm; công trình/mỏ làm vật cản
//   - đọc Data/buildings.txt, chỉ số kinh tế mới trong Data/units.txt, lệnh @gold / @mine / @building của file map
//   - dựng ván, đặt móng (luật đặt, trừ vàng, đẩy lính ra, tính lại đường), xây dở, hủy
//   - thợ đào mỏ -> nộp kho -> lặp lại (bảo toàn vàng), mỏ cạn, không có kho, mỏ không với tới
//   - hàng đợi sản xuất (vàng, slot quân, hàng đợi đầy, kẹt chỗ ra quân, điểm tập kết)
//   - lệnh chuột phải thông minh, chế độ đặt nhà và phím tắt, luật thắng/thua
//   - mô phỏng xác định (cùng kết quả mọi lần chạy) và stress ngẫu nhiên kiểm các bất biến
// Chạy: EconomyTests (thêm --gtest_filter=... để chọn). Số ván stress: biến môi trường ECONOMY_STRESS_SCENARIOS.
#include <gtest/gtest.h>
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <functional>
#include <set>
#include <sstream>
#include <string>
#include <vector>

#include "FlowField.h"
#include "Pathfinder.h"
#include "TileMap.h"
#include "entity/BuildingType.h"
#include "entity/UnitType.h"
#include "game/Ai.h"
#include "game/Commands.h"
#include "game/Construction.h"
#include "game/Economy.h"
#include "game/GameState.h"
#include "game/Orders.h"
#include "game/PathService.h"
#include "game/Production.h"
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

    // Ván trống có kinh tế bật, đủ bảng loại mặc định.
    GameState MakeGame(const TileMap& map, int gold = 1000) {
        GameState g;
        g.map = map;
        g.unitTypes.LoadBuiltInDefaults();
        g.buildingTypes.LoadBuiltInDefaults();
        g.economyActive = true;
        g.Gold(Team::Player) = gold;
        return g;
    }

    GameState OpenGame(int rows = 16, int cols = 24, int gold = 1000) { return MakeGame(MakeMap(Blank(rows, cols)), gold); }

    int UnitIdx(const GameState& g, const char* name) { return g.unitTypes.IndexOf(name); }
    int BuildIdx(const GameState& g, const char* name) { return g.buildingTypes.IndexOf(name); }

    Unit& AddUnit(GameState& g, Team team, Waypoint p, const char* type) {
        return g.AddUnit(p.x, p.y, team, UnitIdx(g, type));
    }

    // Dựng sẵn một công trình xong ngay (miễn phí).
    Building& Prebuilt(GameState& g, const char* type, int row, int col, Team team = Team::Player) {
        PlaceResult r = PlaceResult::Ok;
        Building* b = PlaceBuilding(g, BuildIdx(g, type), row, col, team, true, &r);
        EXPECT_TRUE(b != nullptr) << "prebuilt " << type << " failed, result " << static_cast<int>(r);
        return *g.FindBuilding(b ? b->id : g.buildings.back().id);
    }

    ResourceNode& Mine(GameState& g, int row, int col, int amount) { return g.AddResource(row, col, amount); }

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

    // Đoạn thẳng đi được với hitbox THẬT (40px), lấy mẫu mỗi 1px (độc lập với HasLineOfSight).
    bool DenseSafe(const TileMap& m, Waypoint a, Waypoint b) {
        const float len = std::hypot(b.x - a.x, b.y - a.y);
        const int n = std::max(1, static_cast<int>(std::ceil(len)));
        for (int i = 0; i <= n; ++i) {
            const float t = static_cast<float>(i) / static_cast<float>(n);
            if (!m.CanBoxStandAt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, kSquareSize)) return false;
        }
        return true;
    }

    // Lớp ô bị chiếm của bản đồ có khớp ĐÚNG với các công trình và mỏ đang có không (không thừa, không thiếu).
    bool OccupancyConsistent(const GameState& g) {
        std::vector<char> expected(g.map.data.size(), 0);
        auto mark = [&](const Footprint& fp) {
            for (int r = fp.row; r < fp.row + fp.h; ++r)
                for (int c = fp.col; c < fp.col + fp.w; ++c)
                    if (r >= 0 && c >= 0 && r < g.map.rows && c < g.map.cols) {
                        char& cell = expected[static_cast<size_t>(r) * static_cast<size_t>(g.map.cols) + static_cast<size_t>(c)];
                        if (cell) return false; // hai thực thể chồng lên nhau
                        cell = 1;
                    }
            return true;
            };
        for (const auto& b : g.buildings) if (!mark(b.fp)) return false;
        for (const auto& n : g.resources) if (!mark(n.fp)) return false;
        for (int r = 0; r < g.map.rows; ++r)
            for (int c = 0; c < g.map.cols; ++c)
                if (g.map.IsOccupied(r, c) != (expected[static_cast<size_t>(r) * static_cast<size_t>(g.map.cols) + static_cast<size_t>(c)] != 0)) return false;
        return true;
    }

    // Mọi ID (lính, công trình, mỏ) khác nhau, và mỗi danh sách sắp xếp tăng dần (điều kiện của tìm nhị phân).
    bool IdsUniqueAndSorted(const GameState& g) {
        std::set<EntityId> seen;
        auto check = [&](const auto& list) {
            EntityId prev = 0;
            for (const auto& e : list) {
                if (e.id == kNoEntity || e.id <= prev || !seen.insert(e.id).second) return false;
                prev = e.id;
            }
            return true;
            };
        return check(g.units) && check(g.buildings) && check(g.resources);
    }

    std::string WriteTempMap(const std::string& name, const std::string& content) {
        const std::filesystem::path p = std::filesystem::temp_directory_path() / ("minirts_econ_" + name + ".txt");
        std::ofstream(p) << content;
        return p.string();
    }

    // Tìm tệp dữ liệu từ thư mục chạy hoặc vài cấp thư mục cha (chạy từ build/, từ gốc dự án...).
    std::string FindDataFile(const std::string& relative) {
        const char* prefixes[] = { "", "../", "../../", "../../../" };
        for (const char* pre : prefixes) {
            const std::string path = std::string(pre) + relative;
            if (std::ifstream(path).good()) return path;
        }
        return "";
    }

    constexpr const char* kBlankRows10 = "0 0 0 0 0 0 0 0 0 0\n";
    std::string MapText(const std::string& directives, int rows = 10, int cols = 10) {
        std::string text = directives + "\n";
        for (int r = 0; r < rows; ++r) {
            for (int c = 0; c < cols; ++c) text += (c ? " 0" : "0");
            text += "\n";
        }
        return text;
    }
}

// ===========================================================================
// 1. Lớp "ô bị chiếm" của TileMap
// ===========================================================================
TEST(TileMapOccupancy, BlocksWalkabilityButNotTerrain) {
    TileMap m = MakeMap(Blank(6, 6));
    m.SetFootprintOccupied(1, 1, 2, 3, true);
    for (int r = 0; r < 6; ++r) {
        for (int c = 0; c < 6; ++c) {
            const bool inside = (r >= 1 && r < 4 && c >= 1 && c < 3);
            EXPECT_EQ(m.IsOccupied(r, c), inside);
            EXPECT_EQ(m.IsWalkableTile(r, c), !inside);
            EXPECT_TRUE(m.IsTerrainWalkable(r, c)); // địa hình vẫn là cỏ
        }
    }
    const Waypoint inside = Center(2, 1), outside = Center(2, 4);
    EXPECT_FALSE(m.CanBoxStandAt(inside.x, inside.y, kSquareSize));
    EXPECT_TRUE(m.CanBoxStandAt(outside.x, outside.y, kSquareSize));
    EXPECT_FALSE(m.IsWalkableWorld(inside.x, inside.y));

    m.SetFootprintOccupied(1, 1, 2, 3, false);
    EXPECT_TRUE(m.IsWalkableTile(2, 1));
    EXPECT_TRUE(m.CanBoxStandAt(inside.x, inside.y, kSquareSize));
}

TEST(TileMapOccupancy, RockAndWaterStayBlockedWhenUnoccupied) {
    TileMap m = MakeMap({ ".~#", "...", "..." });
    m.SetOccupied(1, 1, true);
    m.SetOccupied(1, 1, false);
    EXPECT_FALSE(m.IsTerrainWalkable(0, 1));
    EXPECT_FALSE(m.IsTerrainWalkable(0, 2));
    EXPECT_FALSE(m.IsWalkableTile(0, 1)); // bỏ đánh dấu một ô khác không làm nước đi được
    EXPECT_TRUE(m.IsWalkableTile(1, 1));
}

TEST(TileMapOccupancy, EmptyOverlayAndOutOfRangeAreSafe) {
    TileMap m = MakeMap(Blank(4, 4));
    EXPECT_TRUE(m.occupied.empty());
    EXPECT_FALSE(m.IsOccupied(0, 0));
    EXPECT_FALSE(m.IsOccupied(-1, 0));
    EXPECT_FALSE(m.IsOccupied(0, 99));
    m.SetOccupied(-1, 0, true);   // ngoài bản đồ: bỏ qua, không cấp phát, không sập
    m.SetOccupied(0, 99, true);
    EXPECT_TRUE(m.occupied.empty());
    m.SetFootprintOccupied(2, 2, 5, 5, true); // phần ngoài bản đồ bị bỏ qua
    EXPECT_EQ(m.occupied.size(), m.data.size());
    EXPECT_TRUE(m.IsOccupied(3, 3));
    EXPECT_FALSE(m.IsOccupied(1, 1));
    m.ClearOccupancy();
    EXPECT_FALSE(m.IsOccupied(3, 3));
    EXPECT_TRUE(m.IsWalkableTile(3, 3));
}

TEST(TileMapOccupancy, OverlayIsCopiedWithTheMap) {
    TileMap a = MakeMap(Blank(4, 4));
    a.SetOccupied(1, 1, true);
    TileMap b = a;
    EXPECT_TRUE(b.IsOccupied(1, 1));
    b.SetOccupied(1, 1, false);
    EXPECT_TRUE(a.IsOccupied(1, 1)); // bản sao độc lập
}

// ---------------------------------------------------------------------------
// Đường đi tôn trọng ô bị chiếm
// ---------------------------------------------------------------------------
TEST(OccupancyPathing, PathGoesAroundBuilding) {
    TileMap m = MakeMap(Blank(9, 12));
    const Waypoint start = Center(3, 1), goal = Center(3, 10);

    const PathResult open = Pathfinder::Find(m, start.x, start.y, goal.x, goal.y);
    ASSERT_FALSE(open.points.empty());
    EXPECT_EQ(open.points.size(), 1u); // đường thẳng

    m.SetFootprintOccupied(0, 5, 2, 7, true); // bức tường rộng 2 ô, cao 7 ô (hàng 0..6), chừa hai hàng cuối
    const PathResult around = Pathfinder::Find(m, start.x, start.y, goal.x, goal.y);
    ASSERT_FALSE(around.points.empty());
    EXPECT_FALSE(around.partial);
    Waypoint prev = start;
    for (const auto& p : around.points) {
        EXPECT_TRUE(DenseSafe(m, prev, p)) << "segment crosses the building";
        prev = p;
    }
    EXPECT_NEAR(around.points.back().x, goal.x, 0.01f);
    // Phải vòng xuống tận hàng 7 mới qua được.
    float lowest = 0.0f;
    for (const auto& p : around.points) lowest = std::max(lowest, p.y);
    EXPECT_GE(lowest, 7.0f * 64.0f);
}

TEST(OccupancyPathing, GoalInsideBuildingSnapsToAdjacentTile) {
    TileMap m = MakeMap(Blank(10, 10));
    m.SetFootprintOccupied(4, 4, 3, 3, true);
    const Waypoint start = Center(1, 1);
    const Waypoint inside = Center(5, 5);
    const PathResult res = Pathfinder::Find(m, start.x, start.y, inside.x, inside.y);
    ASSERT_FALSE(res.points.empty());
    const Waypoint end = res.points.back();
    EXPECT_TRUE(m.IsWalkableWorld(end.x, end.y));
    // Kết thúc ngay cạnh công trình, không đè lên.
    const Footprint fp = Footprint::Make(4, 4, 3, 3, 64.0f);
    EXPECT_LE(fp.DistanceToPoint(end.x, end.y), 64.0f);
    EXPECT_FALSE(fp.ContainsPoint(end.x, end.y));
}

TEST(OccupancyPathing, EnclosedRegionIsPartial) {
    // Vòng công trình khép kín quanh ô (4,4): vào trong không được, A* đi tới điểm gần nhất ở ngoài.
    TileMap m = MakeMap(Blank(9, 9));
    m.SetFootprintOccupied(3, 3, 3, 3, true);
    m.SetOccupied(4, 4, false); // ô giữa trống nhưng bị bao kín
    const Waypoint start = Center(0, 0), inner = Center(4, 4);
    const PathResult res = Pathfinder::Find(m, start.x, start.y, inner.x, inner.y);
    EXPECT_TRUE(res.partial);
    for (const auto& p : res.points) EXPECT_FALSE(Footprint::Make(3, 3, 3, 3, 64.0f).ContainsPoint(p.x, p.y));
}

TEST(OccupancyPathing, FlowFieldAvoidsOccupiedTiles) {
    TileMap m = MakeMap(Blank(8, 8));
    m.SetFootprintOccupied(2, 3, 4, 2, true);
    FlowField field;
    ASSERT_TRUE(field.Build(m, 6, 6, {}));
    EXPECT_FALSE(field.Reaches(2, 3)); // ô bị chiếm không nối vào cây
    EXPECT_TRUE(field.Reaches(0, 0));
    std::vector<Waypoint> path;
    ASSERT_TRUE(field.ExtractPath(0, 4, path));
    for (const auto& p : path) EXPECT_TRUE(m.IsWalkableWorld(p.x, p.y));
    // Dựng cây VỀ một ô đang bị chiếm: thất bại.
    FlowField bad;
    EXPECT_FALSE(bad.Build(m, 2, 3, {}));
}

TEST(OccupancyPathing, UnitsCannotWalkIntoBuilding) {
    GameState g = OpenGame(8, 14);
    Prebuilt(g, "House", 3, 6); // 2x2 ở giữa lối đi
    Unit& u = AddUnit(g, Team::Player, Center(3, 1), "Soldier");
    const EntityId id = u.id;
    OrderMoveTo(g, u, Center(3, 11).x, Center(3, 11).y);
    int bad = 0;
    const float t = RunUntil(g, 30.0f, [&] {
        bad += UnitsInsideWalls(g);
        const Unit* v = g.FindUnit(id);
        return !v->hasMoveGoal && v->path.empty() && !v->pathPending;
        });
    EXPECT_GE(t, 0.0f);
    EXPECT_EQ(bad, 0);
    EXPECT_NEAR(g.FindUnit(id)->x, Center(3, 11).x, 6.0f);
}

// ===========================================================================
// 2. Dữ liệu: Data/units.txt (chỉ số mới) và Data/buildings.txt
// ===========================================================================
TEST(UnitTypeEconomy, ParsesNewKeys) {
    std::istringstream in("[Peon]\nhp = 40\ncost = 55\nsupply = 2\ntraintime = 7.5\nbuildspeed = 150\ncarry = 12\n");
    UnitTypeTable t;
    std::string err;
    ASSERT_TRUE(t.LoadFromStream(in, &err)) << err;
    const UnitType& u = t.Get(0);
    EXPECT_EQ(u.cost, 55);
    EXPECT_EQ(u.supply, 2);
    EXPECT_FLOAT_EQ(u.trainTime, 7.5f);
    EXPECT_EQ(u.buildSpeed, 150);
    EXPECT_EQ(u.carry, 12);
}

TEST(UnitTypeEconomy, DefaultsForUnlistedKeys) {
    std::istringstream in("[Plain]\nhp = 10\n");
    UnitTypeTable t;
    ASSERT_TRUE(t.LoadFromStream(in));
    EXPECT_EQ(t.Get(0).cost, 0);
    EXPECT_EQ(t.Get(0).supply, 1);
    EXPECT_EQ(t.Get(0).buildSpeed, 0); // không phải thợ
    EXPECT_GT(t.Get(0).trainTime, 0.0f);
}

TEST(UnitTypeEconomy, RejectsBadValuesAndKeepsOldTable) {
    UnitTypeTable t;
    t.LoadBuiltInDefaults();
    const int before = t.Count();
    const char* bad[] = {
        "[A]\ncost = -1\n", "[A]\nsupply = -2\n", "[A]\ntraintime = 0\n", "[A]\ntraintime = -3\n",
        "[A]\nbuildspeed = -1\n", "[A]\ncarry = 0\n", "[A]\ncost = abc\n", "[A]\ncost = 5\ncost = 6\n",
    };
    for (const char* text : bad) {
        std::istringstream in(text);
        std::string err;
        EXPECT_FALSE(t.LoadFromStream(in, &err)) << text;
        EXPECT_FALSE(err.empty());
        EXPECT_EQ(t.Count(), before) << "bảng cũ phải giữ nguyên";
    }
}

TEST(UnitTypeEconomy, ApplyTypeCopiesEconomyStats) {
    GameState g = OpenGame();
    Unit& w = AddUnit(g, Team::Player, Center(2, 2), "Worker");
    EXPECT_TRUE(w.IsWorker());
    EXPECT_EQ(w.Cost, g.unitTypes.Get(UnitIdx(g, "Worker")).cost);
    EXPECT_EQ(w.Supply, 1);
    EXPECT_GT(w.BuildSpeed, 0);
    EXPECT_GT(w.carryCapacity, 0);
    EXPECT_EQ(w.job.kind, JobKind::None);
    Unit& s = AddUnit(g, Team::Player, Center(4, 4), "Soldier");
    EXPECT_FALSE(s.IsWorker());
    EXPECT_EQ(s.Cost, 60);
}

TEST(UnitTypeEconomy, WorkerNeverAutoFights) {
    // Thợ có aggro = 0: không tự lao vào kẻ địch đứng gần.
    GameState g = OpenGame();
    const EntityId id = AddUnit(g, Team::Player, Center(5, 5), "Worker").id;
    AddUnit(g, Team::Enemy, Center(5, 6), "Grunt"); // thêm lính làm mất hiệu lực mọi Unit& cũ: chỉ giữ ID
    RunSeconds(g, 1.0f);
    EXPECT_FALSE(g.FindUnit(id)->HasTarget());
}

TEST(BuildingData, ParsesAFullFile) {
    std::istringstream in(
        "# ghi chú\n"
        "[Keep]\nwidth = 4\nheight = 3\nhp = 900\narmor = 3\ncost = 250\nbuildtime = 45.5\nsupply = 12\ndropoff = yes\n"
        "produces = Worker, Soldier  Grunt\n"
        "[Hut]\n");
    BuildingTypeTable t;
    std::string err;
    ASSERT_TRUE(t.LoadFromStream(in, &err)) << err;
    ASSERT_EQ(t.Count(), 2);
    const BuildingType& k = t.Get(t.IndexOf("Keep"));
    EXPECT_EQ(k.width, 4);
    EXPECT_EQ(k.height, 3);
    EXPECT_EQ(k.hpMax, 900);
    EXPECT_EQ(k.armor, 3);
    EXPECT_EQ(k.cost, 250);
    EXPECT_FLOAT_EQ(k.buildTime, 45.5f);
    EXPECT_EQ(k.supply, 12);
    EXPECT_TRUE(k.dropoff);
    ASSERT_EQ(k.produces.size(), 3u);
    EXPECT_EQ(k.produces[0], "Worker");
    EXPECT_EQ(k.produces[1], "Soldier");
    EXPECT_EQ(k.produces[2], "Grunt");
    const BuildingType& h = t.Get(t.IndexOf("Hut")); // mọi khóa lấy mặc định
    EXPECT_FALSE(h.dropoff);
    EXPECT_TRUE(h.produces.empty());
    EXPECT_EQ(h.supply, 0);
    EXPECT_EQ(t.IndexOf("Nope"), -1);
}

TEST(BuildingData, RejectsBadInputWithLineNumber) {
    struct Case { const char* text; const char* expectInError; };
    const Case cases[] = {
        { "width = 3\n", "dong 1" },                          // khóa ngoài [Loại]
        { "[A]\nwidth = 0\n", "dong 2" },
        { "[A]\nwidth = 9\n", "dong 2" },
        { "[A]\nheight = x\n", "dong 2" },
        { "[A]\nhp = 0\n", "dong 2" },
        { "[A]\ncost = -5\n", "dong 2" },
        { "[A]\nbuildtime = 0\n", "dong 2" },
        { "[A]\ndropoff = maybe\n", "dong 2" },
        { "[A]\nproduces = A, A\n", "dong 2" },               // ghi trùng
        { "[A]\nflavour = 1\n", "dong 2" },                   // khóa lạ
        { "[A]\nwidth = 2\nwidth = 3\n", "dong 3" },          // khai báo trùng
        { "[A]\n[A]\n", "dong 2" },                           // loại trùng
        { "[A B]\n", "dong 1" },                              // tên có khoảng trắng
        { "[A\n", "dong 1" },                                 // thiếu ]
        { "[A]\nwidth\n", "dong 2" },                         // thiếu =
        { "# chỉ có ghi chú\n", "khong co loai" },            // rỗng
    };
    BuildingTypeTable t;
    t.LoadBuiltInDefaults();
    const int before = t.Count();
    for (const auto& c : cases) {
        std::istringstream in(c.text);
        std::string err;
        EXPECT_FALSE(t.LoadFromStream(in, &err)) << c.text;
        EXPECT_NE(err.find(c.expectInError), std::string::npos) << c.text << " -> " << err;
        EXPECT_EQ(t.Count(), before) << "bảng cũ phải giữ nguyên";
    }
    EXPECT_FALSE(t.LoadFromFile("khong_ton_tai_xyz.txt"));
}

TEST(BuildingData, ValidateChecksProducedUnits) {
    UnitTypeTable units;
    units.LoadBuiltInDefaults();
    BuildingTypeTable ok;
    ok.LoadBuiltInDefaults();
    EXPECT_TRUE(ok.Validate(units));

    std::istringstream in("[Fort]\nproduces = Worker, Dragon\n");
    BuildingTypeTable bad;
    ASSERT_TRUE(bad.LoadFromStream(in)); // đọc được (chưa biết loại đơn vị) nhưng không hợp lệ
    std::string err;
    EXPECT_FALSE(bad.Validate(units, &err));
    EXPECT_NE(err.find("Dragon"), std::string::npos);
}

TEST(BuildingData, ShippedDataFilesAreConsistent) {
    const std::string unitsPath = FindDataFile("Data/units.txt");
    const std::string buildingsPath = FindDataFile("Data/buildings.txt");
    if (unitsPath.empty() || buildingsPath.empty()) { std::printf("      (skip: Data/*.txt not found)\n"); return; }
    UnitTypeTable units;
    BuildingTypeTable buildings;
    std::string err;
    ASSERT_TRUE(units.LoadFromFile(unitsPath, &err)) << err;
    ASSERT_TRUE(buildings.LoadFromFile(buildingsPath, &err)) << err;
    EXPECT_TRUE(buildings.Validate(units, &err)) << err;

    ASSERT_GE(units.IndexOf("Worker"), 0);
    EXPECT_GT(units.Get(units.IndexOf("Worker")).buildSpeed, 0);
    EXPECT_EQ(units.Get(units.IndexOf("Soldier")).buildSpeed, 0);
    // Có ít nhất một kho, một công trình cấp slot quân, một công trình đẻ lính.
    bool dropoff = false, supply = false, trains = false;
    for (const auto& b : buildings.All()) { dropoff |= b.dropoff; supply |= b.supply > 0; trains |= !b.produces.empty(); }
    EXPECT_TRUE(dropoff && supply && trains);
    // Dữ liệu dự phòng khớp với tệp (cùng tên loại, cùng giá và kích thước).
    BuildingTypeTable builtin;
    builtin.LoadBuiltInDefaults();
    for (const auto& b : builtin.All()) {
        const int idx = buildings.IndexOf(b.name);
        ASSERT_GE(idx, 0) << b.name;
        EXPECT_EQ(buildings.Get(idx).cost, b.cost) << b.name;
        EXPECT_EQ(buildings.Get(idx).width, b.width) << b.name;
        EXPECT_EQ(buildings.Get(idx).supply, b.supply) << b.name;
    }
}

// ===========================================================================
// 3. Lệnh trong file map và dựng ván
// ===========================================================================
TEST(MapDirectives, ParsesGoldMineAndBuilding) {
    const std::string path = WriteTempMap("ok", MapText("@gold 250\n@mine 2 3 700\n@mine 5 5\n@building Townhall 1 1\n@building Barracks 6 2 enemy\n@spawn 8.5 8.5 Worker\n@enemy 9.5 9.5"));
    TileMap m;
    ASSERT_TRUE(LoadTileMap(path, m));
    EXPECT_EQ(m.startGold, 250);
    ASSERT_EQ(m.mines.size(), 2u);
    EXPECT_EQ(m.mines[0].col, 2);
    EXPECT_EQ(m.mines[0].row, 3);
    EXPECT_EQ(m.mines[0].amount, 700);
    EXPECT_EQ(m.mines[1].amount, kDefaultMineAmount);
    ASSERT_EQ(m.buildings.size(), 2u);
    EXPECT_EQ(m.buildings[0].type, "Townhall");
    EXPECT_EQ(m.buildings[0].team, Team::Player);
    EXPECT_EQ(m.buildings[1].team, Team::Enemy);
    EXPECT_EQ(m.buildings[1].col, 6);
    EXPECT_EQ(m.buildings[1].row, 2);
    EXPECT_EQ(m.spawns.size(), 1u);
    EXPECT_EQ(m.enemySpawns.size(), 1u);
    EXPECT_TRUE(m.occupied.empty()); // lớp ô bị chiếm thuộc ván đang chơi, chưa dựng
}

TEST(MapDirectives, OldDirectivesStillWork) {
    const std::string path = WriteTempMap("old", MapText("@spawn 2.5 2.5 Soldier\n@spawn 3.5 2.5\n@enemy 7.5 7.5 Grunt\n@target 8.5 8.5"));
    TileMap m;
    ASSERT_TRUE(LoadTileMap(path, m));
    EXPECT_EQ(m.spawns.size(), 2u);
    EXPECT_EQ(m.spawns[0].unitType, "Soldier");
    EXPECT_EQ(m.spawns[1].unitType, "");
    EXPECT_EQ(m.enemySpawns.size(), 2u);
    EXPECT_EQ(m.startGold, 0);
    EXPECT_TRUE(m.mines.empty());
    EXPECT_TRUE(m.buildings.empty());
}

TEST(MapDirectives, InvalidDirectivesFailAndLeaveMapUntouched) {
    const char* bad[] = {
        "@gold", "@gold -5", "@gold abc", "@gold 1 2", "@gold 1.5",
        "@mine", "@mine 3", "@mine x y", "@mine 1 1 0", "@mine 1 1 -4", "@mine 1.5 2", "@mine 1 2 3 4",
        "@building", "@building Townhall", "@building Townhall 1", "@building Townhall a b",
        "@building Townhall 1 1 neutral", "@building Townhall 1 1 player extra", "@building Townhall 1.5 2",
        "@spawn 1", "@spawn a b", "@spawn 1 2 Soldier extra", "@unknown 1 2", "@",
    };
    TileMap m = MakeMap(Blank(3, 3));
    m.startGold = 77; // dấu hiệu để biết `m` có bị đụng tới không
    for (const char* line : bad) {
        const std::string path = WriteTempMap("bad", MapText(line));
        TileMap before = m;
        EXPECT_FALSE(LoadTileMap(path, m)) << line;
        EXPECT_EQ(m.rows, before.rows) << line;
        EXPECT_EQ(m.startGold, 77) << line;
        EXPECT_TRUE(m.mines.empty()) << line;
    }
}

TEST(MapDirectives, OutsideMapIsSkippedNotFatal) {
    const std::string path = WriteTempMap("outside", MapText("@mine 50 50\n@mine 2 2\n@building House 20 1\n@building House -1 1\n@building House 3 3"));
    TileMap m;
    ASSERT_TRUE(LoadTileMap(path, m));
    EXPECT_EQ(m.mines.size(), 1u);
    EXPECT_EQ(m.buildings.size(), 1u);
}

TEST(MapDirectives, ReloadResetsEconomyFields) {
    TileMap m;
    ASSERT_TRUE(LoadTileMap(WriteTempMap("r1", MapText("@gold 99\n@mine 1 1\n@building House 4 4")), m));
    m.SetOccupied(0, 0, true);
    ASSERT_TRUE(LoadTileMap(WriteTempMap("r2", MapText("@spawn 1.5 1.5")), m));
    EXPECT_EQ(m.startGold, 0);
    EXPECT_TRUE(m.mines.empty());
    EXPECT_TRUE(m.buildings.empty());
    EXPECT_TRUE(m.occupied.empty());
}

TEST(WorldInit, BuildsEconomyFromMap) {
    GameState g;
    g.unitTypes.LoadBuiltInDefaults();
    ASSERT_TRUE(LoadTileMap(WriteTempMap("w1",
        MapText("@gold 300\n@building Townhall 1 1\n@building House 7 7 enemy\n@mine 5 1 900\n@spawn 4.5 4.5 Worker\n@spawn 5.5 4.5 Soldier\n@enemy 8.5 3.5 Grunt")), g.map));
    InitializeWorld(g);
    EXPECT_TRUE(g.economyActive);
    EXPECT_EQ(g.Gold(Team::Player), 300);
    EXPECT_EQ(g.Gold(Team::Enemy), 0);
    ASSERT_EQ(g.buildings.size(), 2u);
    ASSERT_EQ(g.resources.size(), 1u);
    EXPECT_EQ(g.resources[0].amount, 900);
    const Building* hall = g.FindBuilding(g.buildings[0].id);
    EXPECT_TRUE(hall->complete);
    EXPECT_TRUE(hall->dropoff);
    EXPECT_EQ(hall->HpValue, hall->HpMax);
    EXPECT_EQ(g.buildings[1].team, Team::Enemy);
    EXPECT_EQ(g.CountUnits(Team::Player, true), 2);
    EXPECT_EQ(g.CountUnits(Team::Enemy, true), 1);
    EXPECT_TRUE(OccupancyConsistent(g));
    EXPECT_TRUE(IdsUniqueAndSorted(g));
    EXPECT_EQ(UnitsInsideWalls(g), 0);
    EXPECT_EQ(SupplyCap(g, Team::Player), 10);
    EXPECT_EQ(SupplyUsed(g, Team::Player), 2);
}

TEST(WorldInit, SkipsUnplaceableThings) {
    // Loại lạ, mỏ đè nước, công trình đè công trình khác, mỏ đè công trình: bỏ qua hết, phần hợp lệ vẫn dựng.
    GameState g;
    g.unitTypes.LoadBuiltInDefaults();
    g.map = MakeMap({ "..........", "..........", "..~~......", "..~~......", "..........", "..........", "..........", ".........." });
    g.map.buildings = { { "Castle", 0, 0, Team::Player },{ "House", 0, 5, Team::Player },{ "House", 0, 6, Team::Player },{ "Barracks", 2, 2, Team::Player } };
    g.map.mines = { { 2, 2, 100 },{ 0, 5, 100 },{ 5, 0, 100 } };
    InitializeWorld(g);
    EXPECT_EQ(g.buildings.size(), 1u);   // chỉ House đầu tiên ở (0,5)
    EXPECT_EQ(g.resources.size(), 1u);   // chỉ mỏ ở (5,0)
    EXPECT_TRUE(OccupancyConsistent(g));
}

TEST(WorldInit, RestartResetsEverythingAndKeepsIdsUnique) {
    GameState g;
    g.unitTypes.LoadBuiltInDefaults();
    ASSERT_TRUE(LoadTileMap(WriteTempMap("w2", MapText("@gold 200\n@building Townhall 1 1\n@mine 6 1 500\n@spawn 4.5 4.5 Worker")), g.map));
    InitializeWorld(g);
    const EntityId firstHall = g.buildings[0].id;
    Unit& w = *g.FindUnit(g.units[0].id);
    OrderGather(w, g.resources[0].id);
    ASSERT_TRUE(IssueBuildOrder(g, BuildIdx(g, "House"), 6, 6) == false); // chưa chọn thợ nào
    RunSeconds(g, 10.0f);
    g.Gold(Team::Player) = 12345;
    InitializeWorld(g); // chơi lại
    EXPECT_EQ(g.Gold(Team::Player), 200);
    EXPECT_EQ(g.buildings.size(), 1u);
    EXPECT_NE(g.buildings[0].id, firstHall); // ID không bao giờ dùng lại
    EXPECT_EQ(g.resources[0].amount, 500);
    EXPECT_EQ(g.units[0].job.kind, JobKind::None);
    EXPECT_TRUE(OccupancyConsistent(g));
    EXPECT_TRUE(IdsUniqueAndSorted(g));
    EXPECT_FALSE(g.placement.active);
}

TEST(WorldInit, ClassicMapsHaveNoEconomy) {
    const char* names[] = { "Default.txt", "Map01.txt", "Map02.txt" };
    for (const char* name : names) {
        const std::string path = FindDataFile(std::string("Maps/") + name);
        if (path.empty()) { std::printf("      (skip: Maps/%s not found)\n", name); continue; }
        GameState g;
        g.unitTypes.LoadBuiltInDefaults();
        ASSERT_TRUE(LoadTileMap(path, g.map)) << name;
        InitializeWorld(g);
        EXPECT_FALSE(g.economyActive) << name;
        EXPECT_TRUE(g.buildings.empty()) << name;
        EXPECT_TRUE(g.resources.empty()) << name;
        EXPECT_EQ(g.Gold(Team::Player), 0) << name;
    }
}

TEST(WorldInit, Map03IsPlayable) {
    const std::string path = FindDataFile("Maps/Map03.txt");
    if (path.empty()) { std::printf("      (skip: Maps/Map03.txt not found)\n"); return; }
    GameState g;
    g.unitTypes.LoadBuiltInDefaults();
    g.buildingTypes.LoadBuiltInDefaults();
    ASSERT_TRUE(LoadTileMap(path, g.map));
    InitializeWorld(g);
    EXPECT_TRUE(g.economyActive);
    EXPECT_EQ(g.Gold(Team::Player), 300);
    EXPECT_EQ(g.buildings.size(), 1u);
    EXPECT_EQ(g.resources.size(), 3u);
    int workers = 0, soldiers = 0;
    for (const auto& u : g.units) if (u.team == Team::Player) (u.IsWorker() ? workers : soldiers)++;
    EXPECT_EQ(workers, 4);
    EXPECT_EQ(soldiers, 4);
    EXPECT_EQ(g.CountUnits(Team::Enemy, true), 3);
    EXPECT_EQ(UnitsInsideWalls(g), 0);
    EXPECT_TRUE(OccupancyConsistent(g));
    EXPECT_LE(SupplyUsed(g, Team::Player), SupplyCap(g, Team::Player)); // còn chỗ huấn luyện thêm

    // Cho cả bốn thợ đi đào mỏ gần nhất: phải kiếm được vàng thật.
    for (auto& u : g.units) if (u.team == Team::Player && u.IsWorker()) OrderGather(u, g.resources[0].id);
    const int before = g.Gold(Team::Player);
    RunSeconds(g, 60.0f);
    EXPECT_GT(g.Gold(Team::Player), before + 100);
    EXPECT_EQ(UnitsInsideWalls(g), 0);
}
