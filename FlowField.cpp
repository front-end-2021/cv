#include "FlowField.h"
#include <algorithm>
#include <climits>
#include <cmath>
#include <functional>
#include "Pathfinder.h"
#include "PathGrid.h"

namespace {
    constexpr float kInf = 1e30f;
}

bool FlowField::Build(const TileMap& map, int goalRow, int goalCol, const std::vector<std::pair<int, int>>& starts) {
    rows_ = map.rows;
    cols_ = map.cols;
    tileSize_ = map.tileSize;
    goalIdx_ = -1;
    expanded_ = 0;
    const std::size_t cells = map.Empty() ? 0u : static_cast<std::size_t>(rows_) * static_cast<std::size_t>(cols_);
    dist_.assign(cells, kInf);
    next_.assign(cells, -1);
    closed_.assign(cells, 0);
    if (map.Empty() || !map.IsWalkableTile(goalRow, goalCol)) return false;

    // Đánh dấu ô của các lính. Ô không đi được không bao giờ được "tới" nên bỏ qua (nếu không sẽ không dừng sớm được).
    std::vector<char> isStart(cells, 0);
    int remaining = 0;
    for (const auto& s : starts) {
        if (!map.IsWalkableTile(s.first, s.second)) continue;
        char& mark = isStart[static_cast<std::size_t>(s.first * cols_ + s.second)];
        if (!mark) { mark = 1; ++remaining; }
    }
    if (starts.empty()) remaining = INT_MAX; // dựng cho cả bản đồ

    using Entry = std::pair<float, int>; // (khoảng cách tới đích, chỉ số ô); min-heap, hòa thì theo chỉ số ô cho ổn định
    std::vector<Entry> heap;
    goalIdx_ = goalRow * cols_ + goalCol;
    dist_[static_cast<std::size_t>(goalIdx_)] = 0.0f;
    heap.push_back({ 0.0f, goalIdx_ });

    while (!heap.empty() && remaining > 0) {
        std::pop_heap(heap.begin(), heap.end(), std::greater<Entry>());
        const Entry top = heap.back();
        heap.pop_back();
        const std::size_t cur = static_cast<std::size_t>(top.second);
        if (closed_[cur]) continue;
        closed_[cur] = 1;
        ++expanded_;
        if (isStart[cur]) --remaining;

        const int r = top.second / cols_;
        const int c = top.second % cols_;
        for (int i = 0; i < pathgrid::kDirCount; ++i) {
            if (!pathgrid::CanStep(map, r, c, i)) continue;
            const int nIdx = (r + pathgrid::kDirRow[i]) * cols_ + (c + pathgrid::kDirCol[i]);
            const std::size_t n = static_cast<std::size_t>(nIdx);
            if (closed_[n]) continue;
            const float nd = top.first + pathgrid::StepCost(i);
            if (nd < dist_[n]) {
                dist_[n] = nd;
                next_[n] = top.second; // đi từ n sang ô vừa đóng là bước đầu tiên của đường ngắn nhất về đích
                heap.push_back({ nd, nIdx });
                std::push_heap(heap.begin(), heap.end(), std::greater<Entry>());
            }
        }
    }
    return true;
}

bool FlowField::Reaches(int row, int col) const {
    if (row < 0 || row >= rows_ || col < 0 || col >= cols_) return false;
    return closed_[static_cast<std::size_t>(row * cols_ + col)] != 0;
}

bool FlowField::ExtractPath(int row, int col, std::vector<Waypoint>& out) const {
    out.clear();
    if (!Reaches(row, col)) return false;
    int idx = row * cols_ + col;
    while (idx != goalIdx_) {
        idx = next_[static_cast<std::size_t>(idx)];
        if (idx < 0) { out.clear(); return false; } // không thể xảy ra với ô đã đóng; giữ cho chắc
        out.push_back({ (static_cast<float>(idx % cols_) + 0.5f) * tileSize_,
                        (static_cast<float>(idx / cols_) + 0.5f) * tileSize_ });
    }
    return true;
}

bool FlowField::BuildPath(const TileMap& map, float startX, float startY, Waypoint slot, std::vector<Waypoint>& out) const {
    out.clear();
    if (map.Empty() || !Pathfinder::NormalizeGoal(map, slot.x, slot.y)) return false;

    const int startRow = std::clamp(static_cast<int>(std::floor(startY / tileSize_)), 0, rows_ - 1);
    const int startCol = std::clamp(static_cast<int>(std::floor(startX / tileSize_)), 0, cols_ - 1);
    std::vector<Waypoint> trail;
    if (!ExtractPath(startRow, startCol, trail)) return false;

    // Rẽ thẳng tới vị trí đội hình ở chỗ sớm nhất nhìn thấy nó: chỗ đang đứng, rồi từng mốc trên đường.
    if (Pathfinder::HasLineOfSight(map, startX, startY, slot.x, slot.y)) {
        out.push_back(slot);
        return true;
    }
    for (std::size_t k = 0; k < trail.size(); ++k) {
        if (!Pathfinder::HasLineOfSight(map, trail[k].x, trail[k].y, slot.x, slot.y)) continue;
        trail.resize(k + 1);
        trail.push_back(slot);
        Pathfinder::Smooth(map, startX, startY, trail);
        out = std::move(trail);
        return true;
    }
    return false; // vị trí đội hình khuất sau tường so với mọi mốc: để A* riêng lo
}
