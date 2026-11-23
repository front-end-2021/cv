// Stress mô phỏng: chạy nhiều ván NGẪU NHIÊN (bản đồ có tường, khe hẹp, vật cản; 1–3 nhóm tới 24 lính; lệnh đi tới điểm bất kỳ)
// rồi kiểm các bất biến. Nặng hơn TestRandomStress trong PathingTests.cpp: số ván và seed chỉnh được.
//
//   StressTest [số_ván=300] [seed=987654321]
//   ./build/Debug/StressTest
// Thoát mã khác 0 nếu có vi phạm bất biến:
//   - có lính đè lên tường (hitbox 40px chồng lên ô nước/đá)
//   - toạ độ không hợp lệ (NaN / vô cực)
//   - lệnh đi không kết thúc sau 90 giây mô phỏng (chạy mãi / xoay vòng)
//   - hàng đợi tìm đường còn yêu cầu khi mọi lính đã dừng
// Các con số "lệch khỏi vị trí đội hình" chỉ để tham khảo, không làm test thất bại (xem ROADMAP, mục nợ kỹ thuật số 3).
#include <gtest/gtest.h>
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <utility>
#include <vector>

#include "Pathfinder.h"
#include "TileMap.h"
#include "game/GameState.h"
#include "game/Orders.h"
#include "game/PathService.h"
#include "game/Simulation.h"

namespace {
    struct StressConfig {
        int scenarios = 300;
        std::uint32_t seed = 987654321u;
    } g_config;

    struct Rng {
        std::uint32_t s;
        std::uint32_t Next() { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return s; }
        int Int(int lo, int hi) { return lo + static_cast<int>(Next() % static_cast<std::uint32_t>(hi - lo + 1)); }
    };

    Waypoint Center(int row, int col) {
        return { (static_cast<float>(col) + 0.5f) * 64.0f, (static_cast<float>(row) + 0.5f) * 64.0f };
    }

    bool Moving(const Unit& u) {
        return u.hasMoveGoal || !u.path.empty() || u.pathPending;
    }
}

TEST(SimulationStress, RandomMapsAndFormationMoves) {
    Rng rng{ g_config.seed == 0 ? 1u : g_config.seed };

    long wallViolations = 0, nanCount = 0;
    int timeouts = 0, queueLeft = 0, totalUnits = 0, unreachableSlot = 0, displaced = 0;
    float worst = 0.0f;

    for (int sc = 0; sc < g_config.scenarios; ++sc) {
        SCOPED_TRACE("Scenario: " + std::to_string(sc) + " | Base Seed: " + std::to_string(g_config.seed));

        // --- Dựng bản đồ ngẫu nhiên ---
        const int rows = rng.Int(14, 40), cols = rng.Int(18, 50);
        std::vector<std::string> R(static_cast<size_t>(rows), std::string(static_cast<size_t>(cols), '.'));
        const int density = rng.Int(5, 30);
        for (auto& line : R)
            for (auto& ch : line)
                if (rng.Int(0, 99) < density) ch = rng.Int(0, 1) ? '#' : '~';

        const int walls = rng.Int(0, 3);
        for (int w = 0; w < walls; ++w) {
            const int c = rng.Int(4, cols - 5), gap = rng.Int(1, rows - 2);
            for (int r = 0; r < rows; ++r)
                if (r != gap) R[static_cast<size_t>(r)][static_cast<size_t>(c)] = '#';
        }

        GameState g;
        g.unitTypes.LoadBuiltInDefaults();
        g.map.rows = rows;
        g.map.cols = cols;
        g.map.tileSize = 64.0f;
        for (const auto& line : R)
            for (char ch : line)
                g.map.data.push_back(ch == '#' ? Tile::Rock : ch == '~' ? Tile::Water : Tile::Grass);

        auto pickFree = [&](int rLo, int rHi, int cLo, int cHi, Waypoint& out) {
            for (int t = 0; t < 400; ++t) {
                out = Center(rng.Int(rLo, rHi), rng.Int(cLo, cHi));
                if (!g.map.CanBoxStandAt(out.x, out.y, kSquareSize)) continue;
                bool ok = true;
                for (const auto& u : g.units)
                    if (std::hypot(u.x - out.x, u.y - out.y) < kSquareSize) ok = false;
                if (ok) return true;
            }
            return false;
            };

        // --- Tạo 1-3 nhóm lính và phát lệnh di chuyển ---
        const int nGroups = rng.Int(1, 3);
        std::vector<std::vector<EntityId>> groups(static_cast<size_t>(nGroups));
        for (int gi = 0; gi < nGroups; ++gi) {
            const int n = rng.Int(1, 24), c0 = rng.Int(0, cols - 6), r0 = rng.Int(0, rows - 6);
            for (int i = 0; i < n; ++i) {
                Waypoint p;
                if (pickFree(r0, std::min(rows - 1, r0 + 5), c0, std::min(cols - 1, c0 + 5), p)) {
                    groups[static_cast<size_t>(gi)].push_back(
                        g.AddUnit(p.x, p.y, Team::Player, g.unitTypes.DefaultIndexFor(Team::Player)).id);
                }
            }
        }

        std::vector<std::pair<EntityId, Waypoint>> ownGoal;
        for (int gi = 0; gi < nGroups; ++gi) {
            for (auto& u : g.units) u.selected = false;
            for (EntityId id : groups[static_cast<size_t>(gi)]) g.FindUnit(id)->selected = true;
            const Waypoint goal = Center(rng.Int(0, rows - 1), rng.Int(0, cols - 1));
            IssueFormationMoveOrder(g, goal.x, goal.y);
            for (EntityId id : groups[static_cast<size_t>(gi)])
                ownGoal.push_back({ id, g.FindUnit(id)->moveGoal });
        }
        totalUnits += static_cast<int>(g.units.size());

        // --- Chạy mô phỏng tối đa 90s ---
        const int maxTicks = 90 * kTickRate;
        int t = 0;
        for (; t < maxTicks; ++t) {
            bool any = !g.pathQueue.empty();
            for (const auto& u : g.units) if (Moving(u)) { any = true; break; }
            if (!any) break;

            StepSimulation(g, kTickDt);
            for (const auto& u : g.units) {
                if (!std::isfinite(u.x) || !std::isfinite(u.y)) ++nanCount;
                if (!g.map.CanBoxStandAt(u.x, u.y, kSquareSize)) ++wallViolations;
            }
        }

        const float seconds = static_cast<float>(t) * kTickDt;
        worst = std::max(worst, seconds);
        if (t >= maxTicks) {
            ++timeouts;
            ADD_FAILURE() << "Game " << sc << " TIME'S UP (map " << cols << "x" << rows
                << ", " << g.units.size() << " units)";
        }
        if (!g.pathQueue.empty()) ++queueLeft;

        // --- Thu thập chỉ số tham khảo ---
        for (const auto& og : ownGoal) {
            const Unit* u = g.FindUnit(og.first);
            if (!u || Moving(*u)) continue;
            const PathResult res = Pathfinder::Find(g.map, u->x, u->y, og.second.x, og.second.y);
            if (res.partial) { ++unreachableSlot; continue; }
            float remain = 0.0f;
            Waypoint prev{ u->x, u->y };
            for (const auto& w : res.points) { remain += std::hypot(w.x - prev.x, w.y - prev.y); prev = w; }
            if (remain > 2.0f * 64.0f) ++displaced;
        }
    }

    // Lưu số liệu tham khảo vào báo cáo của GoogleTest
    RecordProperty("total_scenarios", g_config.scenarios);
    RecordProperty("total_units", totalUnits);
    RecordProperty("longest_seconds", std::to_string(worst));
    RecordProperty("unreachable_slots", unreachableSlot);
    RecordProperty("displaced_units", displaced);

    std::printf("match=%d  Unit=%d  longest=%.1fs\n", g_config.scenarios, totalUnits, static_cast<double>(worst));
    std::printf("REFERENCE: Unreachable=%d; Displaced(>2 tiles)=%d\n", unreachableSlot, displaced);

    // Kiểm tra các bất biến bắt buộc (nếu sai, RUN_ALL_TESTS() sẽ tự động trả về 1)
    EXPECT_EQ(wallViolations, 0) << "Co linh de len tuong/nuoc";
    EXPECT_EQ(nanCount, 0) << "Toa do bi NaN hoac vo cuc";
    EXPECT_EQ(timeouts, 0) << "Co van bi treo qua 90 giay mo phong";
    EXPECT_EQ(queueLeft, 0) << "Hang doi tim duong van con yeu cau khi linh da dung";
}

int main(int argc, char** argv) {
    std::setvbuf(stdout, nullptr, _IONBF, 0);
    // InitGoogleTest sẽ tự động lọc bỏ các cờ --gtest_* ra khỏi argc/argv
    ::testing::InitGoogleTest(&argc, argv);

    if (argc > 1) g_config.scenarios = std::atoi(argv[1]);
    if (argc > 2) g_config.seed = static_cast<std::uint32_t>(std::strtoul(argv[2], nullptr, 10));

    return RUN_ALL_TESTS();
}