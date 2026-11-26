#include "game/Formation.h"
#include <algorithm>
#include <cmath>
#include <numeric>

std::vector<Waypoint> ComputeFormationSlots(int count, float centerX, float centerY, float spacing, float minX, float minY, float maxX, float maxY) {
    std::vector<Waypoint> slots;
    if (count <= 0) return slots;
    slots.reserve(static_cast<size_t>(count));

    const int cols = static_cast<int>(std::ceil(std::sqrt(static_cast<float>(count))));
    const int rows = static_cast<int>(std::ceil(static_cast<float>(count) / static_cast<float>(cols)));

    const float totalWidth = static_cast<float>(cols - 1) * spacing;
    const float totalHeight = static_cast<float>(rows - 1) * spacing;
    const float startX = centerX - totalWidth / 2.0f;
    const float startY = centerY - totalHeight / 2.0f;

    for (int i = 0; i < count; ++i) {
        const int r = i / cols;
        const int c = i % cols;
        const int unitsInThisRow = (r == rows - 1) ? (count - r * cols) : cols;
        const float rowOffsetX = static_cast<float>(cols - unitsInThisRow) * spacing / 2.0f;

        slots.push_back({
            std::clamp(startX + static_cast<float>(c) * spacing + rowOffsetX, minX, maxX),
            std::clamp(startY + static_cast<float>(r) * spacing, minY, maxY) });
    }
    return slots;
}

namespace {
    // Hungarian (Kuhn-Munkres) cho ma trận vuông n x n, O(n^3). cost[i * n + j] = chi phí gán hàng i cho cột j. Trả về col[i] = cột được gán cho hàng i.
    std::vector<int> SolveAssignment(const std::vector<double>& cost, int n) {
        const double kInf = 1e18;
        const size_t size = static_cast<size_t>(n) + 1;
        // Thế năng hàng/cột (u, v), p[j] = hàng đang giữ cột j, way[j] = cột trước đó trên đường tăng.
        std::vector<double> u(size, 0.0), v(size, 0.0);
        std::vector<int> p(size, 0), way(size, 0);

        // Cấp phát 1 lần duy nhất bên ngoài vòng lặp
        std::vector<double> minv(size);
        std::vector<uint8_t> used(size);

        for (int i = 1; i <= n; ++i) {
            p[0] = i;
            int j0 = 0;

            // Tái sử dụng bộ nhớ bằng cách reset giá trị
            std::fill(minv.begin(), minv.end(), kInf);
            std::fill(used.begin(), used.end(), uint8_t{ 0 });

            do {
                used[static_cast<size_t>(j0)] = 1;
                const int i0 = p[static_cast<size_t>(j0)];
                double delta = kInf;
                int j1 = 0;

                for (int j = 1; j <= n; ++j) {
                    if (used[static_cast<size_t>(j)]) continue;
                    const double cur = cost[static_cast<size_t>((i0 - 1) * n + (j - 1))] - u[static_cast<size_t>(i0)] - v[static_cast<size_t>(j)];
                    if (cur < minv[static_cast<size_t>(j)]) {
                        minv[static_cast<size_t>(j)] = cur;
                        way[static_cast<size_t>(j)] = j0;
                    }
                    if (minv[static_cast<size_t>(j)] < delta) {
                        delta = minv[static_cast<size_t>(j)];
                        j1 = j;
                    }
                }

                for (int j = 0; j <= n; ++j) {
                    if (used[static_cast<size_t>(j)]) {
                        u[static_cast<size_t>(p[static_cast<size_t>(j)])] += delta;
                        v[static_cast<size_t>(j)] -= delta;
                    }
                    else {
                        minv[static_cast<size_t>(j)] -= delta;
                    }
                }
                j0 = j1;
            } while (p[static_cast<size_t>(j0)] != 0);

            do {
                const int j1 = way[static_cast<size_t>(j0)];
                p[static_cast<size_t>(j0)] = p[static_cast<size_t>(j1)];
                j0 = j1;
            } while (j0 != 0);
        }

        std::vector<int> col(static_cast<size_t>(n), 0);
        for (int j = 1; j <= n; ++j) {
            col[static_cast<size_t>(p[static_cast<size_t>(j)] - 1)] = j - 1;
        }
        return col;
    }
}

std::vector<int> AssignSlotsByDistance(const std::vector<Waypoint>& from, const std::vector<Waypoint>& slots) {
    const int n = static_cast<int>(std::min(from.size(), slots.size()));
    std::vector<int> slotOf(from.size(), 0);
    if (n <= 0) return slotOf;
    std::iota(slotOf.begin(), slotOf.end(), 0); // phòng hờ nếu hai danh sách lệch nhau: giữ thứ tự cũ cho phần dư

    // Bình phương khoảng cách: không tốn chi phí khai căn
    auto distSq = [&](int i, int j) -> double {
        const double dx = static_cast<double>(from[static_cast<size_t>(i)].x - slots[static_cast<size_t>(j)].x);
        const double dy = static_cast<double>(from[static_cast<size_t>(i)].y - slots[static_cast<size_t>(j)].y);
        return dx * dx + dy * dy;
    };

    if (n <= kOptimalAssignMaxUnits) {
        std::vector<double> cost(static_cast<size_t>(n) * static_cast<size_t>(n));
        for (int i = 0; i < n; ++i) {
            const size_t rowOffset = static_cast<size_t>(i) * static_cast<size_t>(n);
            for (int j = 0; j < n; ++j) {
                cost[rowOffset + static_cast<size_t>(j)] = std::sqrt(distSq(i, j)); // Nhanh hơn std::hypot nhiều lần mà vẫn giữ nguyên độ chính xác cho tọa độ game
            }
        }
        const std::vector<int> col = SolveAssignment(cost, n);
        for (int i = 0; i < n; ++i) { slotOf[static_cast<size_t>(i)] = col[static_cast<size_t>(i)]; }
        return slotOf;
    }

    // Tham lam: chỉ dùng distSq để sắp xếp, lấy lần lượt cặp (lính, slot) chưa dùng có khoảng cách ngắn nhất.
    struct Pair { double dSq; int i; int j; };
    std::vector<Pair> pairs;
    pairs.reserve(static_cast<size_t>(n) * static_cast<size_t>(n));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) { pairs.push_back({ distSq(i, j), i, j }); }
    }

    std::sort(pairs.begin(), pairs.end(), [](const Pair& a, const Pair& b) {
        if (a.dSq != b.dSq) return a.dSq < b.dSq;
        if (a.i != b.i) return a.i < b.i;
        return a.j < b.j;
    });

    std::vector<uint8_t> unitDone(static_cast<size_t>(n), 0), slotDone(static_cast<size_t>(n), 0);
    int left = n;
    for (const Pair& pr : pairs) {
        if (unitDone[static_cast<size_t>(pr.i)] || slotDone[static_cast<size_t>(pr.j)]) continue;
        unitDone[static_cast<size_t>(pr.i)] = slotDone[static_cast<size_t>(pr.j)] = 1;
        slotOf[static_cast<size_t>(pr.i)] = pr.j;
        if (--left == 0) break;
    }
    return slotOf;
}
