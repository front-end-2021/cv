// Kiểm thử bước 3 (di chuyển & pathfinding). Không cần cửa sổ/GPU: chỉ chạy mô phỏng.
//   cmake -S . -B build -DMINIRTS_BUILD_TESTS=ON && cmake --build build --target PathingTests
//   ./build/PathingTests            (thêm --bench để in số liệu so sánh hiệu năng)
// Thoát với mã khác 0 nếu có kiểm tra thất bại.
#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <functional>
#include <numeric>
#include <queue>
#include <string>
#include <vector>

#include "FlowField.h"
#include "Path.h"
#include "Pathfinder.h"
#include "PathGrid.h"
#include "TileMap.h"
#include "game/Formation.h"
#include "game/Ai.h"
#include "game/GameState.h"
#include "game/Movement.h"
#include "game/Orders.h"
#include "game/PathService.h"
#include "game/Simulation.h"
#include "game/World.h"

// ---------------------------------------------------------------------------
// Khung kiểm thử tối giản
// ---------------------------------------------------------------------------
static int g_checks = 0;
static int g_failed = 0;
static bool g_bench = false;

#define CHECK(cond) do { ++g_checks; if (!(cond)) { ++g_failed; std::printf("  FAIL  %s:%d  %s\n", __FILE__, __LINE__, #cond); } } while (0)
#define CHECK_MSG(cond, ...) do { ++g_checks; if (!(cond)) { ++g_failed; std::printf("  FAIL  %s:%d  %s -> ", __FILE__, __LINE__, #cond); std::printf(__VA_ARGS__); std::printf("\n"); } } while (0)

static void Section(const char* name) { std::printf("[%s]\n", name); }

// Số ngẫu nhiên xác định (cùng kết quả mọi lần chạy, mọi máy).
struct Rng {
    std::uint32_t s;
    explicit Rng(std::uint32_t seed) : s(seed ? seed : 1u) {}
    std::uint32_t Next() { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return s; }
    int Int(int lo, int hi) { return lo + static_cast<int>(Next() % static_cast<std::uint32_t>(hi - lo + 1)); } // [lo, hi]
    float Float() { return static_cast<float>(Next() % 100000u) / 100000.0f; }
};

// '.' cỏ, ',' đất, '~' nước, '#' đá.
static TileMap MakeMap(const std::vector<std::string>& rows) {
    TileMap m;
    m.rows = static_cast<int>(rows.size());
    m.cols = static_cast<int>(rows[0].size());
    m.tileSize = 64.0f;
    for (const auto& line : rows) {
        for (char c : line) m.data.push_back(c == '#' ? Tile::Rock : c == '~' ? Tile::Water : c == ',' ? Tile::Dirt : Tile::Grass);
    }
    return m;
}

static std::vector<std::string> BlankRows(int rows, int cols, char fill = '.') {
    return std::vector<std::string>(static_cast<size_t>(rows), std::string(static_cast<size_t>(cols), fill));
}

static Waypoint Center(int row, int col) { return { (static_cast<float>(col) + 0.5f) * 64.0f, (static_cast<float>(row) + 0.5f) * 64.0f }; }

static GameState MakeGame(const TileMap& map) {
    GameState g;
    g.map = map;
    g.unitTypes.LoadBuiltInDefaults();
    return g;
}

static Unit& Add(GameState& g, Team team, Waypoint p, const char* type = nullptr) {
    const int idx = type ? g.unitTypes.IndexOf(type) : g.unitTypes.DefaultIndexFor(team);
    return g.AddUnit(p.x, p.y, team, idx);
}

static void Run(GameState& g, int ticks) { for (int i = 0; i < ticks; ++i) StepSimulation(g, kTickDt); }

static bool Moving(const Unit& u) { return u.hasMoveGoal || !u.path.empty() || u.pathPending; }

// Chạy tới khi không ai còn lệnh đi hoặc hết giờ. Trả về số giây đã chạy (maxSeconds nếu hết giờ).
static float RunUntilIdle(GameState& g, float maxSeconds, const std::function<void()>& perTick = nullptr) {
    const int maxTicks = static_cast<int>(maxSeconds * kTickRate);
    for (int t = 0; t < maxTicks; ++t) {
        bool any = !g.pathQueue.empty();
        for (const auto& u : g.units) if (u.IsAlive() && Moving(u)) { any = true; break; }
        if (!any) return static_cast<float>(t) * kTickDt;
        StepSimulation(g, kTickDt);
        if (perTick) perTick();
    }
    return maxSeconds;
}

static float MinPairDistance(const GameState& g) {
    float best = 1e9f;
    for (size_t i = 0; i < g.units.size(); ++i)
        for (size_t j = i + 1; j < g.units.size(); ++j)
            if (g.units[i].IsAlive() && g.units[j].IsAlive()) best = std::min(best, std::hypot(g.units[i].x - g.units[j].x, g.units[i].y - g.units[j].y));
    return best;
}

static int UnitsInsideWalls(const GameState& g) {
    int n = 0;
    for (const auto& u : g.units) if (u.IsAlive() && !g.map.CanBoxStandAt(u.x, u.y, kSquareSize)) ++n;
    return n;
}

// Đoạn thẳng đi được với hitbox THẬT (40px), lấy mẫu mỗi 1px: kiểm tra độc lập với HasLineOfSight (4px, hitbox phình).
static bool DenseSafe(const TileMap& m, Waypoint a, Waypoint b) {
    const float len = std::hypot(b.x - a.x, b.y - a.y);
    const int n = std::max(1, static_cast<int>(std::ceil(len)));
    for (int i = 0; i <= n; ++i) {
        const float t = static_cast<float>(i) / static_cast<float>(n);
        if (!m.CanBoxStandAt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, kSquareSize)) return false;
    }
    return true;
}

static float PolylineLength(Waypoint start, const std::vector<Waypoint>& pts) {
    float len = 0.0f;
    Waypoint prev = start;
    for (const auto& p : pts) { len += std::hypot(p.x - prev.x, p.y - prev.y); prev = p; }
    return len;
}

// Chi phí đường ngắn nhất (đơn vị ô) giữa hai ô theo luật lưới 8 hướng, bằng Dijkstra O(V^2) viết riêng làm "đáp án chuẩn".
// -1 nếu không nối được.
static float OracleCost(const TileMap& m, int sr, int sc, int gr, int gc) {
    const int n = m.rows * m.cols;
    std::vector<float> d(static_cast<size_t>(n), 1e30f);
    std::vector<char> done(static_cast<size_t>(n), 0);
    d[static_cast<size_t>(sr * m.cols + sc)] = 0.0f;
    for (;;) {
        int best = -1;
        for (int i = 0; i < n; ++i) if (!done[static_cast<size_t>(i)] && d[static_cast<size_t>(i)] < 1e29f && (best < 0 || d[static_cast<size_t>(i)] < d[static_cast<size_t>(best)])) best = i;
        if (best < 0) break;
        done[static_cast<size_t>(best)] = 1;
        const int r = best / m.cols, c = best % m.cols;
        for (int dr = -1; dr <= 1; ++dr) for (int dc = -1; dc <= 1; ++dc) {
            if (!dr && !dc) continue;
            const int nr = r + dr, nc = c + dc;
            if (!m.IsWalkableTile(nr, nc)) continue;
            if (dr && dc && (!m.IsWalkableTile(r + dr, c) || !m.IsWalkableTile(r, c + dc))) continue; // không cắt góc
            const float cost = (dr && dc) ? 1.41421356f : 1.0f;
            const size_t ni = static_cast<size_t>(nr * m.cols + nc);
            if (d[static_cast<size_t>(best)] + cost < d[ni]) d[ni] = d[static_cast<size_t>(best)] + cost;
        }
    }
    const float r = d[static_cast<size_t>(gr * m.cols + gc)];
    return r > 1e29f ? -1.0f : r;
}

static void TileOf(const TileMap& m, Waypoint p, int& r, int& c) {
    r = std::clamp(static_cast<int>(std::floor(p.y / m.tileSize)), 0, m.rows - 1);
    c = std::clamp(static_cast<int>(std::floor(p.x / m.tileSize)), 0, m.cols - 1);
}

// Chi phí (ô) của một đường đi thô: các mốc nằm ở các ô kề nhau liên tiếp.
static float RawPathCost(const TileMap& m, Waypoint start, const std::vector<Waypoint>& pts) {
    int pr, pc;
    TileOf(m, start, pr, pc);
    float cost = 0.0f;
    for (const auto& p : pts) {
        int r, c;
        TileOf(m, p, r, c);
        const int dr = std::abs(r - pr), dc = std::abs(c - pc);
        if (dr > 1 || dc > 1) return -2.0f; // không kề nhau: không phải đường thô hợp lệ
        cost += (dr && dc) ? 1.41421356f : 1.0f;
        pr = r; pc = c;
    }
    return cost;
}

static TileMap RandomMap(Rng& rng, int rows, int cols, int obstaclePercent) {
    auto rowsV = BlankRows(rows, cols);
    for (auto& line : rowsV) for (auto& ch : line) {
        const int roll = rng.Int(0, 99);
        if (roll < obstaclePercent) ch = (rng.Int(0, 1) ? '#' : '~');
    }
    return MakeMap(rowsV);
}

static bool Walkable(const TileMap& m, int r, int c) { return m.IsWalkableTile(r, c); }

// ---------------------------------------------------------------------------
// Các nhóm kiểm thử
// ---------------------------------------------------------------------------
static void TestPathContainer() {
    Section("Path: reference point at the beginning O(1) using an index");//lấy mốc ở đầu O(1) bằng chỉ số
    Path p;
    CHECK(p.empty() && p.size() == 0);
    p.assign({ {1, 1}, {2, 2}, {3, 3} });
    CHECK(p.size() == 3 && p.front().x == 1 && p.back().x == 3);
    p.pop_front();
    CHECK(p.size() == 2 && p.front().x == 2);
    float sum = 0; for (const auto& w : p) sum += w.x;
    CHECK(sum == 5.0f);                       // duyệt chỉ thấy các mốc còn lại
    p.pop_front(); p.pop_front();
    CHECK(p.empty() && p.begin() == p.end());
    p.pop_front();                            // pop khi rỗng không làm hỏng
    CHECK(p.empty());
    p.assign({ {9, 9} });
    CHECK(p.size() == 1 && p.front().x == 9);
    p.clear();
    CHECK(p.empty());

    // Nhiều mốc: duyệt hết rồi pop từng cái, thứ tự đúng.
    std::vector<Waypoint> many;
    for (int i = 0; i < 1000; ++i) many.push_back({ static_cast<float>(i), 0.0f });
    p.assign(many);
    bool order = true;
    for (int i = 0; i < 1000; ++i) { if (p.front().x != static_cast<float>(i) || p.size() != static_cast<size_t>(1000 - i)) order = false; p.pop_front(); }
    CHECK(order && p.empty());
}

static void TestAStarMatchesOracle() {
    Section("A*: shortest path matches the correct answer exactly (random map)");//đường ngắn nhất đúng bằng đáp án chuẩn (bản đồ ngẫu nhiên)
    Rng rng(12345);
    int compared = 0, unreachable = 0, mismatches = 0, invalid = 0;
    for (int mapNo = 0; mapNo < 40; ++mapNo) {
        const TileMap m = RandomMap(rng, 22, 26, 20 + (mapNo % 3) * 8);
        for (int q = 0; q < 12; ++q) {
            int sr, sc, gr, gc;
            int tries = 0;
            do { sr = rng.Int(0, m.rows - 1); sc = rng.Int(0, m.cols - 1); } while (!Walkable(m, sr, sc) && ++tries < 100);
            tries = 0;
            do { gr = rng.Int(0, m.rows - 1); gc = rng.Int(0, m.cols - 1); } while (!Walkable(m, gr, gc) && ++tries < 100);
            if (!Walkable(m, sr, sc) || !Walkable(m, gr, gc) || (sr == gr && sc == gc)) continue;
            const Waypoint s = Center(sr, sc), g = Center(gr, gc);
            const PathResult res = Pathfinder::FindRaw(m, s.x, s.y, g.x, g.y);
            const float oracle = OracleCost(m, sr, sc, gr, gc);
            if (oracle < 0) {
                ++unreachable;
                if (!res.partial) ++mismatches;   // đích không với tới thì phải báo partial
                continue;
            }
            ++compared;
            if (res.partial || res.points.empty()) { ++mismatches; continue; }
            const float cost = RawPathCost(m, s, res.points);
            if (cost < 0) ++invalid;
            else if (std::abs(cost - oracle) > 1e-3f) ++mismatches;
        }
    }
    CHECK_MSG(compared > 150, "can only compare %d queries", compared);//chỉ so được %d truy vấn
    CHECK_MSG(unreachable > 5, "need a few cases that are out of reach (%d)", unreachable);//cần có vài ca không với tới (%d)
    CHECK_MSG(mismatches == 0, "%d queries deviate from the expected answer", mismatches); //%d truy vấn lệch đáp án chuẩn
    CHECK_MSG(invalid == 0, "%d rough paths with no adjacent marked points", invalid);//%d đường thô có mốc không kề nhau
}

static void TestSmoothing() {
    Section("Smooth: move straight across empty space, without cutting into the wall"); //Làm mượt: đi thẳng qua chỗ trống, không cắt vào tường
    {   // Bản đồ trống: góc này sang góc kia = đúng 1 mốc (đường thẳng), thay vì zigzag qua tâm ô.
        const TileMap m = MakeMap(BlankRows(16, 20));
        const Waypoint a = Center(1, 1), b = Center(13, 17);
        const PathResult raw = Pathfinder::FindRaw(m, a.x, a.y, b.x, b.y);
        const PathResult sm = Pathfinder::Find(m, a.x, a.y, b.x, b.y);
        CHECK(raw.points.size() > 5);
        CHECK(sm.points.size() == 1 && sm.points[0].x == b.x && sm.points[0].y == b.y);
        CHECK(!sm.partial);
    }
    {   // Có tường chữ L: đường mượt vẫn an toàn và không dài hơn đường thô.
        auto rows = BlankRows(14, 20);
        for (int r = 2; r < 11; ++r) rows[static_cast<size_t>(r)][10] = '#';
        for (int c = 4; c < 11; ++c) rows[10][static_cast<size_t>(c)] = '#';
        const TileMap m = MakeMap(rows);
        const Waypoint a = Center(5, 2), b = Center(5, 17);
        const PathResult raw = Pathfinder::FindRaw(m, a.x, a.y, b.x, b.y);
        const PathResult sm = Pathfinder::Find(m, a.x, a.y, b.x, b.y);
        CHECK(!sm.points.empty() && sm.points.size() < raw.points.size());
        CHECK(PolylineLength(a, sm.points) <= PolylineLength(a, raw.points) + 0.01f);
        Waypoint prev = a; bool safe = true;
        for (const auto& p : sm.points) { if (!DenseSafe(m, prev, p)) safe = false; prev = p; }
        CHECK(safe);
    }
    {   // Ngẫu nhiên: mọi đoạn đều an toàn với hitbox thật, mốc cuối giữ nguyên, không dài hơn đường thô.
        Rng rng(777);
        int checked = 0, unsafe = 0, longer = 0, endDiff = 0;
        for (int mapNo = 0; mapNo < 30; ++mapNo) {
            const TileMap m = RandomMap(rng, 20, 24, 15 + (mapNo % 4) * 5);
            for (int q = 0; q < 10; ++q) {
                const int sr = rng.Int(0, m.rows - 1), sc = rng.Int(0, m.cols - 1), gr = rng.Int(0, m.rows - 1), gc = rng.Int(0, m.cols - 1);
                if (!Walkable(m, sr, sc) || !Walkable(m, gr, gc) || (sr == gr && sc == gc)) continue;
                const Waypoint a = Center(sr, sc), b = Center(gr, gc);
                const PathResult raw = Pathfinder::FindRaw(m, a.x, a.y, b.x, b.y);
                const PathResult sm = Pathfinder::Find(m, a.x, a.y, b.x, b.y);
                if (raw.points.empty() || sm.points.empty()) continue;
                ++checked;
                Waypoint prev = a;
                for (const auto& p : sm.points) { if (!DenseSafe(m, prev, p)) { ++unsafe; break; } prev = p; }
                if (PolylineLength(a, sm.points) > PolylineLength(a, raw.points) + 0.05f) ++longer;
                if (sm.points.back().x != raw.points.back().x || sm.points.back().y != raw.points.back().y) ++endDiff;
            }
        }
        CHECK_MSG(checked > 100, "check only %d paths", checked);//chỉ kiểm %d đường
        CHECK_MSG(unsafe == 0, "%d smooth paths cut into the wall", unsafe);//%d đường mượt cắt vào tường
        CHECK_MSG(longer == 0, "%d smooth paths are longer than rough path", longer);//%d đường mượt dài hơn đường thô
        CHECK_MSG(endDiff == 0, "%d smooth path changes endpoint", endDiff);//%d đường mượt đổi điểm cuối
    }
    {   // Khe 1 ô: vẫn chui qua được (hitbox phình không làm tắc khe).
        auto rows = BlankRows(11, 20);
        for (int r = 0; r < 11; ++r) rows[static_cast<size_t>(r)][10] = '#';
        rows[5][10] = '.';
        const TileMap m = MakeMap(rows);
        const Waypoint a = Center(2, 3), b = Center(8, 16);
        const PathResult sm = Pathfinder::Find(m, a.x, a.y, b.x, b.y);
        CHECK(!sm.points.empty() && !sm.partial);
        bool throughGap = false;
        Waypoint prev = a;
        for (const auto& p : sm.points) {
            if (DenseSafe(m, prev, p) && ((prev.x < 640 && p.x > 640) || (prev.x == 640 && prev.y > 320 && prev.y < 384))) throughGap = true;
            prev = p;
        }
        CHECK(throughGap);
    }
    {   // Điểm đích sát tường được dời vào chỗ đứng được; đích ngay mép bản đồ giữ nguyên.
        auto rows = BlankRows(6, 8);
        rows[2][4] = '#';
        const TileMap m = MakeMap(rows);
        float x = 4 * 64.0f - 3.0f, y = 2.5f * 64.0f; // sát mép trái của ô đá
        CHECK(Pathfinder::NormalizeGoal(m, x, y));
        CHECK(m.CanBoxStandAt(x, y, kPathClearance));
        float ex = 20.0f, ey = 20.0f;                 // góc bản đồ: đúng chỗ công thức đội hình kẹp vào
        CHECK(Pathfinder::NormalizeGoal(m, ex, ey) && ex == 20.0f && ey == 20.0f);
        float wx = 4.5f * 64.0f, wy = 2.5f * 64.0f;   // trúng ô đá
        CHECK(!Pathfinder::NormalizeGoal(m, wx, wy));
    }
}

static void TestClosestReachable() {
    Section("Target in an isolated area: move to nearest reachable point");//Đích ở vùng tách biệt: đi tới điểm gần nhất với tới được
    std::vector<std::string> rows = {
        "....~~~~~~....",
        "....~....~....",
        "....~.##.~....",
        "....~....~....",
        "....~~~~~~....",
        "..............",
    };
    const TileMap m = MakeMap(rows);
    const Waypoint start = Center(2, 1);
    const Waypoint click = Center(2, 7);             // trong đảo đá, bên trong vòng nước (không đi vào được)
    // Ô trong vòng nước: (1..3, 5..8) trừ đá. Đảo hoàn toàn tách biệt với đất liền.
    const PathResult res = Pathfinder::Find(m, start.x, start.y, 7.0f * 64.0f + 10.0f, 1.5f * 64.0f);
    CHECK(res.partial);
    CHECK(!res.points.empty());
    // Điểm cuối phải là ô đi được GẦN ĐIỂM BẤM NHẤT trong vùng với tới được (so với vét cạn).
    const float cx = 7.0f * 64.0f + 10.0f, cy = 1.5f * 64.0f;
    float bestD = 1e30f;
    for (int r = 0; r < m.rows; ++r) for (int c = 0; c < m.cols; ++c) {
        if (!Walkable(m, r, c) || OracleCost(m, 2, 1, r, c) < 0) continue; // chỉ xét ô với tới được từ chỗ lính đứng
        const Waypoint ctr = Center(r, c);
        bestD = std::min(bestD, std::hypot(ctr.x - cx, ctr.y - cy));
    }
    if (!res.points.empty()) {
        const Waypoint e = res.points.back();
        CHECK_MSG(std::abs(std::hypot(e.x - cx, e.y - cy) - bestD) < 0.01f, "at the end of path, distance to the trigger point is %.1f, optimal distance is %.1f", std::hypot(e.x - cx, e.y - cy), bestD);//cuối đường cách điểm bấm %.1f, tốt nhất là %.1f
        int er, ec; TileOf(m, e, er, ec);
        CHECK(OracleCost(m, 2, 1, er, ec) >= 0);
    }
    (void)click;

    // Lính đứng TRONG vùng tách biệt (đảo), bấm ra đất liền: đi tới ô trong đảo gần điểm bấm nhất...
    const float clickX = 10.5f * 64.0f, clickY = 1.5f * 64.0f; // đất liền, ngay ngoài vòng nước, ngang hàng 1
    const Waypoint inIsland = Center(3, 5);
    const PathResult toEdge = Pathfinder::Find(m, inIsland.x, inIsland.y, clickX, clickY);
    CHECK(toEdge.partial && !toEdge.points.empty());
    if (!toEdge.points.empty()) {
        CHECK(std::abs(toEdge.points.back().x - Center(1, 8).x) < 0.01f && std::abs(toEdge.points.back().y - Center(1, 8).y) < 0.01f);
    }
    // ... và đã đứng đúng ô gần nhất rồi thì không còn chỗ nào lại gần hơn: không đi đâu cả.
    const Waypoint atEdge = Center(1, 8);
    const PathResult stay = Pathfinder::Find(m, atEdge.x, atEdge.y, clickX, clickY);
    CHECK(stay.partial && stay.points.empty());

    // Hồ lớn: bấm giữa hồ (xa mọi bờ hơn 5 ô) vẫn đi tới bờ gần nhất, không còn đứng yên như bản cũ.
    auto lake = BlankRows(30, 30);
    for (int r = 4; r < 26; ++r) for (int c = 4; c < 26; ++c) lake[static_cast<size_t>(r)][static_cast<size_t>(c)] = '~';
    const TileMap lm = MakeMap(lake);
    const Waypoint a = Center(1, 1);
    const PathResult across = Pathfinder::Find(lm, a.x, a.y, 15.0f * 64.0f, 15.0f * 64.0f);
    CHECK(!across.points.empty());
    if (!across.points.empty()) {
        const Waypoint e = across.points.back();
        int er, ec; TileOf(lm, e, er, ec);
        CHECK(Walkable(lm, er, ec));
    }
    // Bản đồ không còn ô nào đi được: không có đường.
    const TileMap dead = MakeMap(BlankRows(4, 4, '#'));
    CHECK(Pathfinder::Find(dead, 10, 10, 100, 100).points.empty());
}

static void TestSlotAssignment() {
    Section("Assign squad slots based on distance");//Gán slot đội hình theo khoảng cách
    Rng rng(2024);
    auto totalDist = [](const std::vector<Waypoint>& from, const std::vector<Waypoint>& slots, const std::vector<int>& of) {
        double t = 0; for (size_t i = 0; i < from.size(); ++i) t += std::hypot(from[i].x - slots[static_cast<size_t>(of[i])].x, from[i].y - slots[static_cast<size_t>(of[i])].y); return t; };
    auto isPerm = [](const std::vector<int>& of) { std::vector<int> s = of; std::sort(s.begin(), s.end()); for (size_t i = 0; i < s.size(); ++i) if (s[i] != static_cast<int>(i)) return false; return true; };

    // 1. Hungarian đúng bằng vét cạn hoán vị với n <= 7.
    int wrong = 0, notPerm = 0;
    for (int trial = 0; trial < 150; ++trial) {
        const int n = rng.Int(1, 7);
        std::vector<Waypoint> from, slots;
        for (int i = 0; i < n; ++i) { from.push_back({ rng.Float() * 800, rng.Float() * 600 }); slots.push_back({ rng.Float() * 800, rng.Float() * 600 }); }
        const std::vector<int> of = AssignSlotsByDistance(from, slots);
        if (!isPerm(of)) { ++notPerm; continue; }
        std::vector<int> perm(static_cast<size_t>(n)); std::iota(perm.begin(), perm.end(), 0);
        double best = 1e30;
        do { best = std::min(best, totalDist(from, slots, perm)); } while (std::next_permutation(perm.begin(), perm.end()));
        if (std::abs(totalDist(from, slots, of) - best) > 1e-6) ++wrong;
    }
    CHECK_MSG(notPerm == 0, "%d times is not a permutation", notPerm);//%d lần không phải hoán vị
    CHECK_MSG(wrong == 0, "%d non-optimized instances", wrong);//%d lần không tối ưu

    // 2. Không có hai đường đi cắt nhau (đây chính là "lính chạy chéo nhau").
    auto cross = [](Waypoint a, Waypoint b, Waypoint c, Waypoint d) {
        auto o = [](Waypoint p, Waypoint q, Waypoint r) { return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x); };
        const float d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
        return ((d1 > 1e-3f && d2 < -1e-3f) || (d1 < -1e-3f && d2 > 1e-3f)) && ((d3 > 1e-3f && d4 < -1e-3f) || (d3 < -1e-3f && d4 > 1e-3f));
    };
    int optimalCrossings = 0, identityCrossings = 0;
    for (int trial = 0; trial < 20; ++trial) {
        const int n = 30;
        std::vector<Waypoint> from, slots;
        for (int i = 0; i < n; ++i) from.push_back({ rng.Float() * 800, rng.Float() * 600 });
        slots = ComputeFormationSlots(n, 400.0f + rng.Float() * 200, 300.0f, 46.0f, 20, 20, 2000, 2000);
        const std::vector<int> of = AssignSlotsByDistance(from, slots);
        std::vector<int> identity(static_cast<size_t>(n)); std::iota(identity.begin(), identity.end(), 0);
        for (int i = 0; i < n; ++i) for (int j = i + 1; j < n; ++j) {
            if (cross(from[static_cast<size_t>(i)], slots[static_cast<size_t>(of[static_cast<size_t>(i)])], from[static_cast<size_t>(j)], slots[static_cast<size_t>(of[static_cast<size_t>(j)])])) ++optimalCrossings;
            if (cross(from[static_cast<size_t>(i)], slots[static_cast<size_t>(i)], from[static_cast<size_t>(j)], slots[static_cast<size_t>(j)])) ++identityCrossings;
        }
    }
    CHECK_MSG(optimalCrossings == 0, "the optimal assignment still contains %d pairs of intersecting paths", optimalCrossings);//gán tối ưu vẫn có %d cặp đường cắt nhau
    CHECK_MSG(identityCrossings > 50, "Following original order, only %d pairs intersect (there should have been more).", identityCrossings);//gán theo thứ tự cũ chỉ có %d cặp cắt nhau (đáng lẽ nhiều)
    std::printf("      (intersections in 20-board, 30-soldier scenario: assignment by original order = %d, assignment by distance = %d)\n", identityCrossings, optimalCrossings);//(đường cắt nhau trong 20 ván 30 lính: gán theo thứ tự cũ = %d, gán theo khoảng cách = %d)

    // 3. Nhóm rất đông dùng cách tham lam: vẫn là hoán vị hợp lệ và tốt hơn nhiều so với gán theo thứ tự.
    {
        const int n = kOptimalAssignMaxUnits + 40;
        std::vector<Waypoint> from, slots;
        for (int i = 0; i < n; ++i) from.push_back({ rng.Float() * 1500, rng.Float() * 1500 });
        slots = ComputeFormationSlots(n, 700.0f, 700.0f, 46.0f, 20, 20, 3000, 3000);
        const std::vector<int> of = AssignSlotsByDistance(from, slots);
        std::vector<int> identity(static_cast<size_t>(n)); std::iota(identity.begin(), identity.end(), 0);
        CHECK(isPerm(of));
        CHECK(totalDist(from, slots, of) < totalDist(from, slots, identity) * 0.7);
    }
    CHECK(AssignSlotsByDistance({}, {}).empty());
}

static void TestFlowField() {
    Section("FlowField: finding the way for the whole group");//một lần tìm đường cho cả nhóm
    Rng rng(99);
    int pathsChecked = 0, costMismatch = 0, unsafe = 0, badEnd = 0, notReach = 0;
    for (int mapNo = 0; mapNo < 25; ++mapNo) {
        const TileMap m = RandomMap(rng, 24, 28, 18);
        int gr, gc;
        int tries = 0;
        do { gr = rng.Int(0, m.rows - 1); gc = rng.Int(0, m.cols - 1); } while (!Walkable(m, gr, gc) && ++tries < 200);
        if (!Walkable(m, gr, gc)) continue;
        std::vector<std::pair<int, int>> starts;
        for (int i = 0; i < 14; ++i) {
            int r, c; int t = 0;
            do { r = rng.Int(0, m.rows - 1); c = rng.Int(0, m.cols - 1); } while (!Walkable(m, r, c) && ++t < 200);
            if (Walkable(m, r, c)) starts.push_back({ r, c });
        }
        FlowField field;
        CHECK(field.Build(m, gr, gc, starts));
        for (const auto& s : starts) {
            const float oracle = OracleCost(m, s.first, s.second, gr, gc);
            const bool reach = field.Reaches(s.first, s.second);
            if ((oracle >= 0) != reach) { ++notReach; continue; }
            if (!reach) continue;
            std::vector<Waypoint> trail;
            if (!field.ExtractPath(s.first, s.second, trail)) { ++notReach; continue; }
            const Waypoint a = Center(s.first, s.second);
            const float cost = trail.empty() ? 0.0f : RawPathCost(m, a, trail);
            if (std::abs(cost - oracle) > 1e-3f) ++costMismatch;
            ++pathsChecked;

            // Đường tới một vị trí đội hình quanh đích: an toàn, đúng điểm cuối.
            Waypoint slot = Center(gr, gc);
            slot.x += (rng.Float() - 0.5f) * 140.0f;
            slot.y += (rng.Float() - 0.5f) * 140.0f;
            std::vector<Waypoint> pts;
            if (field.BuildPath(m, a.x, a.y, slot, pts)) {
                Waypoint norm = slot;
                if (!Pathfinder::NormalizeGoal(m, norm.x, norm.y)) { ++badEnd; continue; }
                if (pts.empty() || pts.back().x != norm.x || pts.back().y != norm.y) ++badEnd;
                Waypoint prev = a;
                for (const auto& p : pts) { if (!DenseSafe(m, prev, p)) { ++unsafe; break; } prev = p; }
            }
        }
    }
    CHECK_MSG(pathsChecked > 150, "check only %d paths", pathsChecked);//chỉ kiểm %d đường
    CHECK_MSG(notReach == 0, "%d soldiers incorrectly connected/disconnected compared to the correct answer", notReach);//%d lính nối/không nối sai so với đáp án chuẩn
    CHECK_MSG(costMismatch == 0, "%d answers deviate from the correct key", costMismatch);//%d đường lệch đáp án chuẩn
    CHECK_MSG(unsafe == 0, "%d group paths cut into the wall", unsafe);//%d đường nhóm cắt vào tường
    CHECK_MSG(badEnd == 0, "%d group paths have incorrect endpoints", badEnd);//%d đường nhóm sai điểm cuối

    // Dừng sớm: lính ở gần đích thì không phải quét cả bản đồ lớn.
    const TileMap big = MakeMap(BlankRows(100, 100));
    FlowField nearField;
    std::vector<std::pair<int, int>> starts;
    for (int i = 0; i < 12; ++i) starts.push_back({ 50 + i % 3, 52 + i / 3 });
    nearField.Build(big, 50, 50, starts);
    CHECK_MSG(nearField.ExpandedCount() < 600, "open %d cells on a 10.000-cell map", nearField.ExpandedCount());//mở %d ô trên bản đồ 10.000 ô
    FlowField full;
    full.Build(big, 50, 50, {});
    CHECK(full.ExpandedCount() == 10000);
    // Ô đích không đi được: không dựng.
    auto r = BlankRows(5, 5); r[2][2] = '#';
    FlowField bad;
    CHECK(!bad.Build(MakeMap(r), 2, 2, {}));
}

// --- Mô phỏng -------------------------------------------------------------
static void TestWallCrossing() {
    Section("Simulation: Entire group must pass through a wall with an opening, without anyone touching or leaning on wall.");//Mô phỏng: cả nhóm qua tường có khe hở, không ai đè lên tường
    auto rows = BlankRows(14, 26);
    for (int r = 0; r < 14; ++r) rows[static_cast<size_t>(r)][12] = '#';
    rows[6][12] = '.';
    GameState g = MakeGame(MakeMap(rows));
    for (int i = 0; i < 8; ++i) { Unit& u = Add(g, Team::Player, Center(2 + i, 3 + (i % 2) * 1)); u.selected = true; }
    IssueFormationMoveOrder(g, 21.5f * 64.0f, 7.0f * 64.0f);
    int wallTicks = 0;
    const float t = RunUntilIdle(g, 40.0f, [&] { wallTicks += UnitsInsideWalls(g); });
    CHECK_MSG(t < 25.0f, "took %.1f seconds", t);//mất %.1f giây
    CHECK_MSG(wallTicks == 0, "%d instances of soldiers pressing against the wall", wallTicks);//%d lần có lính đè lên tường
    int arrived = 0;
    for (const auto& u : g.units) if (u.x > 19.0f * 64.0f && std::hypot(u.x - 21.5f * 64.0f, u.y - 7.0f * 64.0f) < 4.0f * 64.0f) ++arrived;
    CHECK_MSG(arrived == 8, "%d/8 soldiers have arrived", arrived);//%d/8 lính tới nơi
    CHECK(MinPairDistance(g) > kSquareSize * 0.8f); // cuối cùng không còn chồng nhau đáng kể
    CHECK(g.pathQueue.empty());
}

static void TestOpposingGroups(float* outMinDist = nullptr, std::vector<Waypoint>* outFinal = nullptr) {
    if (!outFinal) Section("Simulation: two trains moving in opposite directions squeeze past each other");//Mô phỏng: hai đoàn ngược chiều lách qua nhau
    GameState g = MakeGame(MakeMap(BlankRows(14, 34)));
    for (int i = 0; i < 10; ++i) { Unit& u = Add(g, Team::Player, Center(2 + i, 2)); u.selected = true; }
    std::vector<EntityId> left;
    for (const auto& u : g.units) left.push_back(u.id);
    // Đoàn thứ hai: cùng phe Player nhưng chọn riêng; dựng bằng lệnh trực tiếp để cả hai đoàn cùng chạy.
    std::vector<EntityId> right;
    for (int i = 0; i < 10; ++i) { Unit& u = Add(g, Team::Player, Center(2 + i, 31)); right.push_back(u.id); }
    // Đoàn trái -> bên phải
    for (auto& u : g.units) u.selected = false;
    for (EntityId id : left) g.FindUnit(id)->selected = true;
    IssueFormationMoveOrder(g, 29.0f * 64.0f, 7.0f * 64.0f);
    for (auto& u : g.units) u.selected = false;
    for (EntityId id : right) g.FindUnit(id)->selected = true;
    IssueFormationMoveOrder(g, 4.0f * 64.0f, 7.0f * 64.0f);

    float minDist = 1e9f;
    const float t = RunUntilIdle(g, 40.0f, [&] { minDist = std::min(minDist, MinPairDistance(g)); });
    if (outMinDist) *outMinDist = minDist;
    if (outFinal) { for (const auto& u : g.units) outFinal->push_back({ u.x, u.y }); return; }
    CHECK_MSG(t < 20.0f, "took %.1f seconds", t); //mất % .1f giây
    int stillMoving = 0, leftArrived = 0, rightArrived = 0;
    for (const auto& u : g.units) if (Moving(u)) ++stillMoving;
    for (EntityId id : left) if (g.FindUnit(id)->x > 20.0f * 64.0f) ++leftArrived;
    for (EntityId id : right) if (g.FindUnit(id)->x < 14.0f * 64.0f) ++rightArrived;
    CHECK_MSG(stillMoving == 0, "%d soldiers have not yet stopped", stillMoving);//%d lính chưa dừng
    CHECK_MSG(leftArrived == 10 && rightArrived == 10, "tới nơi: %d + %d / 20", leftArrived, rightArrived);
    // Bản cũ cho hai lính cùng đi xuyên qua nhau hoàn toàn (khoảng cách ~0). Giờ không được chồng quá nửa hitbox.
    CHECK_MSG(minDist > kSquareSize * 0.45f, "two elements stacked with a spacing of %.1f px", minDist);//hai lính từng chồng sát tới %.1f px
    CHECK_MSG(UnitsInsideWalls(g) == 0, "There are soldiers pressing against the wall.");//có lính đè lên tường
    std::printf("      (closest distance between two units as they pass each other: %.1f px, hitbox %.0f px)\n", minDist, kSquareSize);//(khoảng cách gần nhất giữa hai lính trong lúc đi qua nhau: %.1f px, hitbox %.0f px)
}

static void TestChokepoint() {
    Section("Simulation: two groups moving in opposite directions pass through a single 1-cell-wide gap (without becoming completely jammed)");//Mô phỏng: hai đoàn ngược chiều qua MỘT khe 1 ô (không kẹt cứng)
    auto rows = BlankRows(13, 30);
    for (int r = 0; r < 13; ++r) { rows[static_cast<size_t>(r)][14] = '#'; rows[static_cast<size_t>(r)][15] = '#'; }
    rows[6][14] = '.'; rows[6][15] = '.';
    GameState g = MakeGame(MakeMap(rows));
    std::vector<EntityId> left, right;
    for (int i = 0; i < 6; ++i) { left.push_back(Add(g, Team::Player, Center(4 + i, 9 + (i % 2))).id); }
    for (int i = 0; i < 6; ++i) { right.push_back(Add(g, Team::Player, Center(4 + i, 19 + (i % 2))).id); }
    for (auto& u : g.units) u.selected = false;
    for (EntityId id : left) g.FindUnit(id)->selected = true;
    IssueFormationMoveOrder(g, 24.0f * 64.0f, 6.5f * 64.0f);
    for (auto& u : g.units) u.selected = false;
    for (EntityId id : right) g.FindUnit(id)->selected = true;
    IssueFormationMoveOrder(g, 5.0f * 64.0f, 6.5f * 64.0f);

    int wallTicks = 0;
    const float t = RunUntilIdle(g, 60.0f, [&] { wallTicks += UnitsInsideWalls(g); });
    int crossed = 0;
    for (EntityId id : left) if (g.FindUnit(id)->x > 15.5f * 64.0f) ++crossed;
    for (EntityId id : right) if (g.FindUnit(id)->x < 14.0f * 64.0f) ++crossed;
    CHECK_MSG(wallTicks == 0, "%d instances of soldiers pressing against the wall", wallTicks);//%d lần có lính đè lên tường
    CHECK_MSG(crossed == 12, "%d/12 soldiers made it through the gap (after %.1f seconds)", crossed, t);//%d/12 lính qua được khe (sau %.1f giây)
    CHECK_MSG(t < 50.0f, "took %.1f seconds", t);//mất %.1f giây
    std::printf("      (%d/12 soldiers passed through the gap, taking %.1f seconds)\n", crossed, t);//(%d/12 lính qua khe, mất %.1f giây)
}

static void TestBlockedRepath() {
    Section("Simulation: recalculate the path if blocked; slide along the wall if it is struck at an angle.");//Mô phỏng: bị chặn thì tính lại đường; chạm tường chéo thì trượt dọc tường
    // Tường dọc ở cột 9 (hàng 3..13), khe rộng 3 ô ở hàng 0..2.
    auto rows = BlankRows(14, 20);
    for (int r = 3; r < 14; ++r) rows[static_cast<size_t>(r)][9] = '#';
    {
        // (a) Đường cũ đi thẳng xuyên tường (như đường đã lỗi thời): lính áp vào tường, không trượt được (đi vuông góc)
        //     nên bị chặn hẳn. Sau vài tick phải xin đường mới tới ĐÍCH của lệnh, rồi đi vòng qua khe.
        GameState g = MakeGame(MakeMap(rows));
        const EntityId id = Add(g, Team::Player, Center(8, 7)).id;
        g.FindUnit(id)->OrderMove({ Center(8, 10), Center(8, 15) });
        const std::uint32_t ticketBefore = g.FindUnit(id)->pathTicket;
        Run(g, 24); // ~0,8 giây: đi ~8 tick tới tường rồi bị chặn 4 tick -> xin đường. Chờ bộ phát hiện kẹt thì phải tới 2 giây.
        CHECK_MSG(g.FindUnit(id)->pathTicket != ticketBefore, "Soldiers were blocked by a wall, yet they did not seek a new route.");//lính bị tường chặn nhưng không xin đường mới
        int wallTicks = 0;
        const float t = RunUntilIdle(g, 30.0f, [&] { wallTicks += UnitsInsideWalls(g); });
        const Unit* p = g.FindUnit(id);
        CHECK_MSG(wallTicks == 0, "%d times pressed against the wall", wallTicks);//%d lần đè lên tường
        CHECK_MSG(std::hypot(p->x - Center(8, 15).x, p->y - Center(8, 15).y) < 80.0f, "The soldier stops at (%.0f, %.0f) after %.1f seconds.", p->x, p->y, t);//lính dừng ở (%.0f, %.0f) sau %.1f giây
        CHECK_MSG(t < 15.0f, "took %.1f seconds", t);//mất %.1f giây
    }
    {
        // (b) Bị xô ra sau tường, mốc kế tiếp nằm bên kia: đường thẳng tới đó cắt tường nhưng lính trượt dọc tường
        //     lên khe được, nên không cần tính lại đường vẫn tới nơi và không bao giờ đè lên tường.
        GameState g = MakeGame(MakeMap(rows));
        const EntityId id = Add(g, Team::Player, Center(2, 7)).id;
        OrderMoveTo(g, *g.FindUnit(id), Center(6, 13).x, Center(6, 13).y);
        Run(g, 6);
        Unit* p = g.FindUnit(id);
        p->x = Center(9, 8).x; p->y = Center(9, 8).y; p->SnapPrevToCurrent();
        CHECK_MSG(!p->path.empty() && !DenseSafe(g.map, { p->x, p->y }, p->path.front()), "Incorrect test layout: the next waypoint is not positioned behind the wall.");//bố cục test sai: mốc kế tiếp không nằm sau tường
        int wallTicks = 0;
        const float t = RunUntilIdle(g, 30.0f, [&] { wallTicks += UnitsInsideWalls(g); });
        p = g.FindUnit(id);
        CHECK_MSG(wallTicks == 0, "%d times pressed against the wall", wallTicks);//%d lần đè lên tường
        CHECK_MSG(std::hypot(p->x - Center(6, 13).x, p->y - Center(6, 13).y) < 80.0f, "The soldier stops at (%.0f, %.0f) after %.1f seconds.", p->x, p->y, t);//lính dừng ở (%.0f, %.0f) sau %.1f giây
    }
}

static void TestUnreachableGoalSimulation() {
    Section("Simulation: command to move to an unreachable location -> approach as closely as possible, then stop");//Mô phỏng: lệnh đi tới nơi không với tới -> đến sát nhất rồi dừng
    const std::vector<std::string> rows = {
        "..............",
        "..............",
        "..~~~~~~~.....",
        "..~.....~.....",
        "..~.....~.....",
        "..~~~~~~~.....",
        "..............",
    };
    GameState g = MakeGame(MakeMap(rows));
    Unit& u = Add(g, Team::Player, Center(0, 0));
    u.selected = true;
    IssueFormationMoveOrder(g, Center(3, 5).x, Center(3, 5).y); // giữa vùng nước vây quanh
    const float t = RunUntilIdle(g, 20.0f);
    CHECK_MSG(t < 15.0f, "The soldiers are still running after %.1f seconds", t);//lính vẫn đang chạy sau %.1f giây
    CHECK(!g.units[0].hasMoveGoal && g.units[0].path.empty());
    const float d = std::hypot(g.units[0].x - Center(3, 5).x, g.units[0].y - Center(3, 5).y);
    CHECK_MSG(d < 3.5f * 64.0f, "stop %.0f px from the destination", d);//dừng cách đích %.0f px
    CHECK(g.units[0].y > 1.0f * 64.0f);  // đã đi chứ không đứng yên ở chỗ cũ
}

static void TestQueueBudget() {
    Section("Pathfinding queue: budget-constrained service, no requests are lost, older requests are replaced");//Hàng đợi tìm đường: phục vụ có ngân sách, không mất yêu cầu, yêu cầu cũ bị thay thế
    Rng rng(5);
    auto rows = BlankRows(110, 110);
    for (auto& line : rows) for (auto& ch : line) if (rng.Int(0, 99) < 22) ch = '#';
    GameState g = MakeGame(MakeMap(rows));
    std::vector<EntityId> ids;
    for (int i = 0; i < 150; ++i) {
        int r, c; do { r = rng.Int(0, 109); c = rng.Int(0, 109); } while (!Walkable(g.map, r, c));
        ids.push_back(Add(g, Team::Player, Center(r, c)).id);
    }
    // Mỗi lính xin đường tới một ô xa; lính đầu tiên đổi ý ngay (yêu cầu đầu thành lỗi thời).
    for (EntityId id : ids) {
        int r, c; do { r = rng.Int(0, 109); c = rng.Int(0, 109); } while (!Walkable(g.map, r, c));
        OrderMoveTo(g, *g.FindUnit(id), Center(r, c).x, Center(r, c).y);
    }
    OrderMoveTo(g, *g.FindUnit(ids[0]), Center(1, 1).x, Center(1, 1).y);
    CHECK(g.pathQueue.size() == 151);

    int ticks = 0, maxServed = 0, prevWith = 0;
    while (!g.pathQueue.empty() && ticks < 200) {
        StepSimulation(g, kTickDt);
        // Yêu cầu lỗi thời được bỏ qua "miễn phí" nên số yêu cầu rời hàng đợi mỗi tick có thể lớn hơn trần;
        // ta kiểm trần qua số lính vừa nhận được đường trong tick đó.
        int withPath = 0;
        for (const auto& u : g.units) if (!u.path.empty()) ++withPath;
        maxServed = std::max(maxServed, withPath - prevWith);
        prevWith = withPath;
        ++ticks;
    }
    CHECK_MSG(g.pathQueue.empty(), "queue has %zu requests remaining after %d ticks", g.pathQueue.size(), ticks);//hàng đợi còn %zu yêu cầu sau %d tick
    CHECK_MSG(ticks > 1, "The 150 requests need to be spread across multiple ticks, but only %d were used.", ticks);//150 yêu cầu phải được dàn ra nhiều tick, nhưng chỉ mất %d
    CHECK_MSG(ticks <= 40, "service too slow: %d ticks", ticks);//phục vụ quá chậm: %d tick
    CHECK_MSG(maxServed <= kMaxPathRequestsPerTick, "một tick phục vụ %d yêu cầu (tối đa %d)", maxServed, kMaxPathRequestsPerTick);
    int noPath = 0;
    for (const auto& u : g.units) if (u.pathPending) ++noPath; // không ai bị bỏ quên trong trạng thái "đang chờ đường"
    CHECK_MSG(noPath == 0, "%d soldiers are still waiting for a path", noPath);//%d lính vẫn chờ đường
    // Lính 0 đã đổi ý: đường của nó phải kết thúc gần (1,1), không phải đích đầu tiên.
    const Unit* first = g.FindUnit(ids[0]);
    CHECK(first && first->hasMoveGoal && std::abs(first->moveGoal.x - Center(1, 1).x) < 1.0f);
    std::printf("      (150 requests served in %d ticks, with a maximum of %d requests per tick)\n", ticks, maxServed);//150 yêu cầu được phục vụ trong %d tick, tối đa %d yêu cầu mỗi tick
}

static void TestOrderReplacement() {
    Section("Changing an order: the previous path must not overlap with the new order.");//Đổi lệnh: yêu cầu đường cũ không đè lên lệnh mới
    GameState g = MakeGame(MakeMap(BlankRows(12, 24)));
    Unit& u = Add(g, Team::Player, Center(2, 2));
    const EntityId id = u.id;
    OrderMoveTo(g, u, Center(2, 20).x, Center(2, 20).y);
    OrderMoveTo(g, *g.FindUnit(id), Center(9, 4).x, Center(9, 4).y); // đổi ý trước khi tick nào chạy
    CHECK(g.pathQueue.size() == 2);
    Run(g, 1);
    const Unit* p = g.FindUnit(id);
    CHECK(p->path.size() >= 1);
    CHECK(std::abs(p->path.back().x - Center(9, 4).x) < 1.0f && std::abs(p->path.back().y - Center(9, 4).y) < 1.0f);
    CHECK(g.pathQueue.empty());

    // Lệnh tấn công hủy lệnh đi đang chờ đường.
    Unit& foe = Add(g, Team::Enemy, Center(10, 22));
    foe.hasHome = false;
    const EntityId foeId = foe.id;
    Unit& v = Add(g, Team::Player, Center(2, 6));
    const EntityId vid = v.id;
    OrderMoveTo(g, v, Center(2, 20).x, Center(2, 20).y);
    g.FindUnit(vid)->OrderAttack(foeId);
    CHECK(!g.FindUnit(vid)->hasMoveGoal);
    Run(g, 2);
    const Unit* q = g.FindUnit(vid);
    // Đang đuổi theo kẻ địch (đường kết thúc gần kẻ địch ở (10,22)), không phải đích cũ (2,20).
    CHECK(q->HasTarget());
    CHECK(q->path.empty() || std::abs(q->path.back().y - Center(10, 22).y) < 70.0f);
}

static void TestMoveOrderNotHijacked() {
    Section("The order to proceed must not be interrupted by self-defense forces (even while waiting for the road)");//Lệnh đi không bị tự vệ chen ngang (kể cả lúc còn chờ đường)
    GameState g = MakeGame(MakeMap(BlankRows(12, 24)));
    const EntityId id = Add(g, Team::Player, Center(5, 5)).id; // tham chiếu Unit mất hiệu lực ở lần Add kế tiếp: chỉ giữ ID
    Add(g, Team::Enemy, Center(5, 7));                          // kẻ địch trong tầm phát hiện
    OrderMoveTo(g, *g.FindUnit(id), Center(5, 1).x, Center(5, 1).y);
    for (int i = 0; i < 3; ++i) {
        Run(g, 1);
        CHECK(!g.FindUnit(id)->HasTarget());
    }
    CHECK(g.FindUnit(id)->hasMoveGoal || g.FindUnit(id)->path.empty());
}

// Tìm Maps/<name> từ thư mục chạy hoặc vài cấp thư mục cha (chạy từ build/, từ gốc dự án...).
static bool LoadMapFile(const char* name, TileMap& out) {
    const char* prefixes[] = { "Maps/", "../Maps/", "../../Maps/", "../../../Maps/" };
    for (const char* pre : prefixes) if (LoadTileMap((std::string(pre) + name).c_str(), out)) return true;
    return false;
}

static void TestMap02() {
    Section("Maps/Map02.txt: Can be loaded; can traverse shallows/narrow bridges; can be placed onto an island without getting stuck.");//nạp được, đi qua bãi cạn / cầu hẹp, bấm lên đảo không treo
    GameState g;
    g.unitTypes.LoadBuiltInDefaults();
    if (!LoadMapFile("Map02.txt", g.map)) { std::printf("      (skip: not found Maps/Map02.txt)\n"); return; }//bỏ qua: không tìm thấy Maps/
    InitializeWorld(g);
    CHECK(g.CountUnits(Team::Player, true) == 6 && g.CountUnits(Team::Enemy, true) == 3);
    // Cả đội đi tới cửa khu địch phía đông: phải qua sông (bãi cạn rộng hoặc cầu hẹp), vòng qua sống đá và bậc thang đá chéo.
    for (auto& u : g.units) u.selected = (u.team == Team::Player);
    const float doorX = 19.5f * 64.0f, doorY = 13.5f * 64.0f;
    IssueFormationMoveOrder(g, doorX, doorY);
    int wallTicks = 0;
    const float t = RunUntilIdle(g, 40.0f, [&] { wallTicks += UnitsInsideWalls(g); });
    CHECK_MSG(wallTicks == 0, "%d over the wall", wallTicks);//%d lần đè tường
    CHECK_MSG(t < 30.0f, "took %.1f seconds", t);//mất %.1f giây
    int closeCount = 0;
    for (const auto& u : g.units) if (u.team == Team::Player && std::hypot(u.x - doorX, u.y - doorY) < 4.0f * 64.0f) ++closeCount;
    CHECK_MSG(closeCount >= 5, "only %d/6 soldiers reached the door", closeCount);//chỉ %d/6 lính tới gần cửa
    // Bấm lên đảo giữa hồ (tách biệt): đến bờ gần nhất rồi dừng, lệnh kết thúc.
    for (auto& u : g.units) u.selected = (u.team == Team::Player);
    IssueFormationMoveOrder(g, 4.5f * 64.0f, 13.5f * 64.0f);
    const float t2 = RunUntilIdle(g, 40.0f);
    CHECK_MSG(t2 < 40.0f, "The command to go to the island did not finish after %.1f seconds.", t2);//lệnh lên đảo không kết thúc sau %.1f giây
    CHECK_MSG(UnitsInsideWalls(g) == 0, "Any soldiers over the wall");//có lính đè lên tường
}

static void TestFightRegression() {
    Section("Regression: 6 soldiers vs. 3 enemies on Default.txt — still a win.");//Hồi quy: 6 lính đánh 3 địch trên Default.txt vẫn thắng
    GameState g;
    g.unitTypes.LoadBuiltInDefaults();
    // Tìm file map: chạy từ thư mục dự án (đường dẫn tương đối) hoặc từ thư mục build.
    if (!LoadMapFile("Default.txt", g.map)) { std::printf("      (skipping: Maps/Default.txt not found)\n"); return; }//bỏ qua: không tìm thấy Maps/Default.txt
    InitializeWorld(g);
    for (auto& u : g.units) if (u.team == Team::Player) u.selected = true;
    const Unit* foe = nullptr;
    for (const auto& u : g.units) if (u.team == Team::Enemy) { foe = &u; break; }
    CHECK(foe != nullptr);
    IssueAttackOrder(g, foe->id);
    int ticks = 0;
    while (g.result == MatchResult::Playing && ticks < 60 * kTickRate) { StepSimulation(g, kTickDt); ++ticks; }
    const int alive = g.CountUnits(Team::Player, true);
    CHECK_MSG(g.result == MatchResult::Victory, "result %d after %.1f seconds", static_cast<int>(g.result), static_cast<float>(ticks) * kTickDt);//kết quả %d sau %.1f giây
    CHECK_MSG(alive >= 4, "only %d/6 soldiers remaining", alive);//chỉ còn %d/6 lính
    std::printf("      (won after %.1f seconds, with %d/6 minions remaining)\n", static_cast<float>(ticks) * kTickDt, alive);//thắng sau %.1f giây, còn %d/6 lính
}

static void TestEnemyReturnsHome() {
    Section("AI: If lured too far away, it gives up and heads back to its original position (via a pathfinding queue)");//AI: bị dụ đi xa thì bỏ cuộc rồi quay về chỗ cũ (qua hàng đợi tìm đường)
    GameState g = MakeGame(MakeMap(BlankRows(12, 40)));
    const Waypoint home = Center(6, 20);
    const EntityId foeId = Add(g, Team::Enemy, home).id;
    g.FindUnit(foeId)->hasHome = true;
    g.FindUnit(foeId)->home = home;
    const EntityId bait = Add(g, Team::Player, Center(6, 22)).id; // lọt vào tầm phát hiện (192px) của kẻ địch
    Run(g, 20);
    CHECK(g.FindUnit(foeId)->HasTarget());
    // Mồi chạy thật xa (người chơi ra lệnh đi): kẻ địch đuổi tới ngưỡng bỏ cuộc rồi phải quay về.
    g.FindUnit(bait)->selected = true;
    IssueFormationMoveOrder(g, Center(6, 38).x, Center(6, 38).y);
    Run(g, 40 * kTickRate);
    const Unit* foe = g.FindUnit(foeId);
    CHECK(foe != nullptr);
    if (foe) {
        CHECK_MSG(std::hypot(foe->x - home.x, foe->y - home.y) < kHomeArriveDist + 10.0f, "enemy is %.0f px away from the previous location", std::hypot(foe->x - home.x, foe->y - home.y));//kẻ địch ở cách chỗ cũ %.0f px
        CHECK(!foe->HasTarget());
    }
}

static void TestChaseUnreachable() {
    Section("Pursuing an enemy who is out of reach: get as close as possible, then give up—don’t keep chasing indefinitely.");//Đuổi kẻ địch đứng ở nơi không với tới: tới sát nhất rồi bỏ cuộc, không xin đường mãi
    const std::vector<std::string> rows = {
        "..............",
        "..............",
        "..~~~~~~~.....",
        "..~.....~.....",
        "..~.....~.....",
        "..~~~~~~~.....",
        "..............",
    };
    GameState g = MakeGame(MakeMap(rows));
    const EntityId foe = Add(g, Team::Enemy, Center(3, 5)).id;       // trên đảo tách biệt
    g.FindUnit(foe)->hasHome = false;
    const EntityId me = Add(g, Team::Player, Center(0, 0)).id;
    g.FindUnit(me)->selected = true;
    IssueAttackOrder(g, foe);
    size_t maxQueue = 0;
    const std::uint32_t ticket0 = g.FindUnit(me)->pathTicket;
    for (int t = 0; t < 30 * kTickRate; ++t) { StepSimulation(g, kTickDt); maxQueue = std::max(maxQueue, g.pathQueue.size()); }
    const Unit* u = g.FindUnit(me);
    // Mỗi chu kỳ "chọn mục tiêu -> xin đường -> không có đường" tốn ~3 số hiệu. Không có bộ nhớ "không với tới" thì chu kỳ lặp
    // mỗi 0,25 giây (~360 số hiệu / 30 giây); có bộ nhớ thì chỉ vài chục.
    CHECK_MSG(u->pathTicket - ticket0 <= 60, "requested the right of way %u times in 30 seconds", u->pathTicket - ticket0);//đã xin đường %u lần trong 30 giây
    CHECK(u != nullptr && u->IsAlive());
    if (u) {
        CHECK_MSG(!u->HasTarget(), "Still chasing an unattainable goal.");//vẫn đang đuổi theo mục tiêu không với tới
        CHECK_MSG(u->y > 64.0f, "the soldier did not approach (at (%.0f, %.0f))", u->x, u->y);//lính không hề tiến lại gần (ở (%.0f, %.0f))
    }
    CHECK_MSG(maxQueue <= 4, "The queue swelled to %zu", maxQueue);//hàng đợi phình tới %zu
}

// Chạy nhiều ván ngẫu nhiên (bản đồ có tường, khe hẹp, vật cản; 1-3 nhóm tới 24 lính; lệnh đi tới điểm bất kỳ). Bất biến:
// không ai đè lên tường, không có số NaN, mọi lệnh đi kết thúc trong thời gian hợp lý, hàng đợi cạn.
// (Từng lộ ra lỗi 4 lính cùng nhắm một mốc xoay vòng quanh mốc mãi mãi: các ván 51, 77, 113, 144... hết giờ 90 giây.)
static void TestRandomStress() {
    Section("Stress: 150 random games; all invariants remain unchanged.");//150 ván ngẫu nhiên, mọi bất biến đều giữ
    Rng rng(987654321u);
    int wallViolations = 0, nanCount = 0, timeouts = 0, queueLeft = 0, units = 0;
    float worst = 0.0f;
    const int kScenarios = 150;
    for (int sc = 0; sc < kScenarios; ++sc) {
        const int rows = rng.Int(14, 40), cols = rng.Int(18, 50);
        auto R = BlankRows(rows, cols);
        const int density = rng.Int(5, 30);
        for (auto& line : R) for (auto& ch : line) if (rng.Int(0, 99) < density) ch = rng.Int(0, 1) ? '#' : '~';
        const int walls = rng.Int(0, 3);
        for (int w = 0; w < walls; ++w) {
            const int c = rng.Int(4, cols - 5), gap = rng.Int(1, rows - 2);
            for (int r = 0; r < rows; ++r) if (r != gap) R[static_cast<size_t>(r)][static_cast<size_t>(c)] = '#';
        }
        GameState g = MakeGame(MakeMap(R));
        auto pickFree = [&](int rLo, int rHi, int cLo, int cHi, Waypoint& out) {
            for (int t = 0; t < 400; ++t) {
                out = Center(rng.Int(rLo, rHi), rng.Int(cLo, cHi));
                if (!g.map.CanBoxStandAt(out.x, out.y, kSquareSize)) continue;
                bool ok = true;
                for (const auto& u : g.units) if (std::hypot(u.x - out.x, u.y - out.y) < kSquareSize) ok = false;
                if (ok) return true;
            }
            return false;
        };
        const int nGroups = rng.Int(1, 3);
        std::vector<std::vector<EntityId>> groups(static_cast<size_t>(nGroups));
        for (int gi = 0; gi < nGroups; ++gi) {
            const int n = rng.Int(1, 24), c0 = rng.Int(0, cols - 6), r0 = rng.Int(0, rows - 6);
            for (int i = 0; i < n; ++i) {
                Waypoint p;
                if (pickFree(r0, std::min(rows - 1, r0 + 5), c0, std::min(cols - 1, c0 + 5), p)) groups[static_cast<size_t>(gi)].push_back(Add(g, Team::Player, p).id);
            }
        }
        for (int gi = 0; gi < nGroups; ++gi) {
            for (auto& u : g.units) u.selected = false;
            for (EntityId id : groups[static_cast<size_t>(gi)]) g.FindUnit(id)->selected = true;
            const Waypoint goal = Center(rng.Int(0, rows - 1), rng.Int(0, cols - 1));
            IssueFormationMoveOrder(g, goal.x, goal.y);
        }
        units += static_cast<int>(g.units.size());
        const float t = RunUntilIdle(g, 90.0f, [&] {
            for (const auto& u : g.units) {
                if (!std::isfinite(u.x) || !std::isfinite(u.y)) ++nanCount;
                if (!g.map.CanBoxStandAt(u.x, u.y, kSquareSize)) ++wallViolations;
            }
        });
        worst = std::max(worst, t);
        if (t >= 90.0f) { ++timeouts; std::printf("      match %d time's up (map %dx%d)\n", sc, cols, rows); }//ván %d hết giờ (bản đồ %dx%d)
        if (!g.pathQueue.empty()) ++queueLeft;
    }
    CHECK_MSG(wallViolations == 0, "%d instances of soldiers pressing against the wall", wallViolations);//%d lần có lính đè lên tường
    CHECK_MSG(nanCount == 0, "%d instances of invalid coordinates", nanCount);//%d lần có toạ độ không hợp lệ
    CHECK_MSG(timeouts == 0, "%d matches where minions kept running endlessly", timeouts);//%d ván có lính chạy mãi không dừng
    CHECK_MSG(queueLeft == 0, "%d board(s) still require a path in the queue", queueLeft);//%d ván còn yêu cầu đường trong hàng đợi
    CHECK_MSG(worst < 40.0f, "the longest round took %.1f seconds", worst);//ván lâu nhất mất %.1f giây
    std::printf("      (%d games, %d units; longest game %.1f seconds)\n", kScenarios, units, worst);//%d ván, %d lính; ván lâu nhất %.1f giây
}

static void TestDeterminism() {
    Section("Verification: running the same scenario twice to ensure it yields the same result");//Xác định: cùng kịch bản chạy hai lần cho đúng cùng kết quả
    std::vector<Waypoint> a, b;
    TestOpposingGroups(nullptr, &a);
    TestOpposingGroups(nullptr, &b);
    bool same = a.size() == b.size() && !a.empty();
    for (size_t i = 0; same && i < a.size(); ++i) same = (a[i].x == b[i].x && a[i].y == b[i].y);
    CHECK(same);
}

static void TestNoDriftFromPushing() {
    Section("Collision: pushing stationary minions no longer causes them to gradually drift toward the top-left corner.");//Va chạm: đẩy lính đứng yên không còn làm lệch dần về góc trên-trái
    GameState g = MakeGame(MakeMap(BlankRows(10, 10)));
    // Cụm lính chồng lên nhau quanh giữa bản đồ, đứng yên. Trọng tâm cụm không được trôi về một phía.
    Rng rng(31);
    float cx = 0, cy = 0;
    for (int i = 0; i < 12; ++i) {
        Unit& u = Add(g, Team::Player, { 320.0f + (rng.Float() - 0.5f) * 30.0f, 320.0f + (rng.Float() - 0.5f) * 30.0f });
        cx += u.x; cy += u.y;
    }
    cx /= 12; cy /= 12;
    Run(g, 120);
    float nx = 0, ny = 0;
    for (const auto& u : g.units) { nx += u.x; ny += u.y; }
    nx /= 12; ny /= 12;
    CHECK_MSG(std::abs(nx - cx) < 8.0f && std::abs(ny - cy) < 8.0f, "centroid drift (%.1f, %.1f)", nx - cx, ny - cy);//trọng tâm trôi (%.1f, %.1f)
    CHECK_MSG(MinPairDistance(g) > kSquareSize - 2.0f, "still piled on top of each other: %.1f px", MinPairDistance(g));//vẫn còn chồng nhau:
}

// --- Số liệu hiệu năng (chỉ in khi --bench) --------------------------------
static void Bench() {
    std::printf("[bench]\n");
    Rng rng(4242);
    auto rows = BlankRows(160, 160);
    for (auto& line : rows) for (auto& ch : line) if (rng.Int(0, 99) < 24) ch = '#';
    const TileMap m = MakeMap(rows);
    std::vector<Waypoint> starts;
    while (starts.size() < 40) { const int r = rng.Int(0, 40), c = rng.Int(0, 40); if (Walkable(m, r, c)) starts.push_back(Center(r, c)); }
    int gr = 120, gc = 120;
    while (!Walkable(m, gr, gc)) ++gc;
    using Clock = std::chrono::steady_clock;
    int astarNodes = 0;
    auto t0 = Clock::now();
    for (const auto& s : starts) astarNodes += Pathfinder::Find(m, s.x, s.y, Center(gr, gc).x, Center(gr, gc).y).expanded;
    auto t1 = Clock::now();
    std::vector<std::pair<int, int>> st;
    for (const auto& s : starts) { int r, c; TileOf(m, s, r, c); st.push_back({ r, c }); }
    FlowField field;
    field.Build(m, gr, gc, st);
    std::vector<Waypoint> out;
    for (const auto& s : starts) field.BuildPath(m, s.x, s.y, Center(gr, gc), out);
    auto t2 = Clock::now();
    auto us = [](Clock::time_point a, Clock::time_point b) { return std::chrono::duration_cast<std::chrono::microseconds>(b - a).count(); };
    std::printf("  40 units, 160x160 map (24% obstacles), same objective.:\n");//40 linh, bản đồ 160x160 (24%% vật cản), cũng một đi'ch
    std::printf("    40 instances of A*      : %7d open cells, %6lld us\n", astarNodes, static_cast<long long>(us(t0, t1)));//40 lần A*      : %7d ô mở
    std::printf("    FlowField once: %7d open cell, %6lld us (including extracting 40 lines + smoothing)\n", field.ExpandedCount(), static_cast<long long>(us(t1, t2)));//1 lần FlowField: %7d ô mở, %6lld us (gồm trích 40 đường + làm mượt
}

int main(int argc, char** argv) {
    std::setvbuf(stdout, nullptr, _IONBF, 0); // không mất log nếu một kiểm tra làm chương trình sập
    for (int i = 1; i < argc; ++i) if (!std::strcmp(argv[i], "--bench")) g_bench = true;

    TestPathContainer();
    TestAStarMatchesOracle();
    TestSmoothing();
    TestClosestReachable();
    TestSlotAssignment();
    TestFlowField();
    TestWallCrossing();
    TestOpposingGroups();
    TestChokepoint();
    TestBlockedRepath();
    TestUnreachableGoalSimulation();
    TestQueueBudget();
    TestOrderReplacement();
    TestMoveOrderNotHijacked();
    TestEnemyReturnsHome();
    TestChaseUnreachable();
    TestFightRegression();
    TestMap02();
    TestRandomStress();
    TestDeterminism();
    TestNoDriftFromPushing();
    if (g_bench) Bench();

    std::printf("\n%d kiem tra, %d that bai.\n", g_checks, g_failed);
    return g_failed == 0 ? 0 : 1;
}
