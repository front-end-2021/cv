#include "Pathfinder.h"
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include "PathGrid.h"

namespace {
    using pathgrid::kDirCount;

    struct HeapNode {
        int idx;
        float f;  // g + h
        float h;  // phần ước lượng còn lại; khi f bằng nhau thì ô nào gần đích hơn được mở trước
    };

    // Sắp xếp cho std::push_heap/pop_heap: phần tử "nhỏ nhất" (f thấp nhất) nằm ở đầu.
    struct WorseThan {
        bool operator()(const HeapNode& a, const HeapNode& b) const {
            if (a.f != b.f) return a.f > b.f;
            if (a.h != b.h) return a.h > b.h;
            return a.idx > b.idx; // cuối cùng theo chỉ số ô để kết quả luôn như nhau giữa các lần chạy
        }
    };

    // Bộ nhớ làm việc của A*, TÁI SỬ DỤNG giữa các lần gọi thay vì cấp phát 3 mảng rows*cols mỗi lần.
    // "Xóa" bằng cách tăng `stamp`: ô nào có dấu khác stamp hiện tại coi như chưa từng chạm tới.
    // thread_local nên nhiều luồng tìm đường cùng lúc (nếu sau này có) không đạp lên nhau.
    struct Workspace {
        std::vector<float> g;
        std::vector<int> parent;
        std::vector<std::uint32_t> openStamp;   // == stamp: g/parent của ô hợp lệ trong lần tìm này
        std::vector<std::uint32_t> closedStamp; // == stamp: ô đã đóng
        std::vector<HeapNode> heap;
        std::uint32_t stamp = 0;

        void Begin(std::size_t cells) {
            if (g.size() != cells) {
                g.assign(cells, 0.0f);
                parent.assign(cells, -1);
                openStamp.assign(cells, 0);
                closedStamp.assign(cells, 0);
                stamp = 0;
            }
            if (++stamp == 0) { // tràn số: xóa thật một lần rồi đếm lại
                std::fill(openStamp.begin(), openStamp.end(), 0u);
                std::fill(closedStamp.begin(), closedStamp.end(), 0u);
                stamp = 1;
            }
            heap.clear();
        }
    };

    // Khoảng cách octile: ước lượng đúng cho lưới 8 hướng (thẳng = 1, chéo = sqrt(2)), sát thực tế hơn khoảng cách đường thẳng nên A* mở ít ô hơn mà vẫn tìm ra đường ngắn nhất.
    float OctileDistance(int dr, int dc) {
        const float a = static_cast<float>(std::abs(dr));
        const float b = static_cast<float>(std::abs(dc));
        return (a + b) + (pathgrid::kDiagonalCost - 2.0f) * std::min(a, b);
    }

    Waypoint TileCenter(const TileMap& map, int row, int col) {
        return { (static_cast<float>(col) + 0.5f) * map.tileSize, (static_cast<float>(row) + 0.5f) * map.tileSize };
    }

    int TileCol(const TileMap& map, float x) {
        return std::clamp(static_cast<int>(std::floor(x / map.tileSize)), 0, map.cols - 1);
    }
    int TileRow(const TileMap& map, float y) {
        return std::clamp(static_cast<int>(std::floor(y / map.tileSize)), 0, map.rows - 1);
    }
}

bool Pathfinder::HasLineOfSight(const TileMap& map, float x0, float y0, float x1, float y1) {
    // Lấy mẫu mỗi 1/16 ô (4px với ô 64px): đủ dày để hitbox không "lọt" qua góc tường giữa hai mẫu.
    const float step = std::max(2.0f, map.tileSize / 16.0f);
    const float dx = x1 - x0;
    const float dy = y1 - y0;
    const float len = std::sqrt(dx * dx + dy * dy);
    const int samples = std::max(1, static_cast<int>(std::ceil(len / step)));
    for (int i = 0; i <= samples; ++i) {
        const float t = static_cast<float>(i) / static_cast<float>(samples);
        if (!map.CanBoxStandAt(x0 + dx * t, y0 + dy * t, kPathClearance)) return false;
    }
    return true;
}

void Pathfinder::Smooth(const TileMap& map, float startX, float startY, std::vector<Waypoint>& points) {
    if (points.size() < 2) return;
    std::vector<Waypoint> out;
    out.reserve(points.size());
    float ax = startX, ay = startY; // "neo": chỗ ta đang đứng, rồi tới từng mốc đã giữ lại
    std::size_t i = 0;
    while (i < points.size()) {
        // Mốc points[i] luôn được giữ (hai ô kề nhau). Kéo dài ra tới mốc xa nhất còn nhìn thấy từ neo.
        std::size_t j = i;
        while (j + 1 < points.size() && HasLineOfSight(map, ax, ay, points[j + 1].x, points[j + 1].y)) ++j;
        out.push_back(points[j]);
        ax = points[j].x;
        ay = points[j].y;
        i = j + 1;
    }
    points = std::move(out);
}

bool Pathfinder::SnapToWalkable(const TileMap& map, float x, float y, int& outRow, int& outCol) {
    if (map.Empty()) return false;
    x = std::clamp(x, 0.0f, map.WorldW());
    y = std::clamp(y, 0.0f, map.WorldH());
    const int r0 = TileRow(map, y);
    const int c0 = TileCol(map, x);
    if (map.IsWalkableTile(r0, c0)) { outRow = r0; outCol = c0; return true; }

    // Quét các vòng vuông rộng dần quanh ô đích. Điểm bấm nằm trong ô (r0, c0) nên mọi ô ở vòng k cách nó
    // ít nhất (k - 0.5) ô: khi ô tốt nhất đã gần hơn mức đó thì các vòng sau không thể thắng -> dừng sớm.
    const float ts = map.tileSize;
    float bestSq = 1e30f;
    bool found = false;
    const int maxRing = std::max(map.rows, map.cols);
    for (int ring = 1; ring <= maxRing; ++ring) {
        if (found) {
            const float reach = (static_cast<float>(ring) - 0.5f) * ts;
            if (bestSq <= reach * reach) break;
        }
        for (int dr = -ring; dr <= ring; ++dr) {
            const bool edgeRow = (dr == -ring || dr == ring);
            const int step = edgeRow ? 1 : 2 * ring; // hàng giữa chỉ xét 2 ô ngoài cùng của vòng
            for (int dc = -ring; dc <= ring; dc += step) {
                const int r = r0 + dr, c = c0 + dc;
                if (!map.IsWalkableTile(r, c)) continue;
                const Waypoint ctr = TileCenter(map, r, c);
                const float d2 = (ctr.x - x) * (ctr.x - x) + (ctr.y - y) * (ctr.y - y);
                if (d2 < bestSq) { bestSq = d2; outRow = r; outCol = c; found = true; }
            }
        }
    }
    return found;
}

bool Pathfinder::NormalizeGoal(const TileMap& map, float& x, float& y) {
    if (map.Empty()) return false;
    x = std::clamp(x, 0.0f, map.WorldW());
    y = std::clamp(y, 0.0f, map.WorldH());
    const int r = TileRow(map, y);
    const int c = TileCol(map, x);
    if (!map.IsWalkableTile(r, c)) return false;
    if (!map.CanBoxStandAt(x, y, kPathClearance)) {
        const Waypoint ctr = TileCenter(map, r, c); // tâm một ô đi được luôn đứng được
        x = ctr.x;
        y = ctr.y;
    }
    return true;
}

PathResult Pathfinder::FindRaw(const TileMap& map, float startX, float startY, float goalX, float goalY) {
    PathResult result;
    if (map.Empty()) return result;
    const int rows = map.rows;
    const int cols = map.cols;
    const float clickX = std::clamp(goalX, 0.0f, map.WorldW()); // điểm người chơi bấm: thước đo "gần đích nhất"
    const float clickY = std::clamp(goalY, 0.0f, map.WorldH());

    const int startR = TileRow(map, startY);
    const int startC = TileCol(map, startX);

    // 1. Xác định ô đích và điểm cuối cùng của đường đi.
    int goalR = TileRow(map, clickY);
    int goalC = TileCol(map, clickX);
    Waypoint goalPoint{ clickX, clickY };
    if (map.IsWalkableTile(goalR, goalC)) {
        NormalizeGoal(map, goalPoint.x, goalPoint.y);
    }
    else {
        // Đích là nước/đá: dời tới ô đi được GẦN ĐIỂM BẤM NHẤT (các lính có điểm đích khác nhau trong đội hình sẽ được dời tới các ô khác nhau).
        if (!SnapToWalkable(map, clickX, clickY, goalR, goalC)) return result;
        goalPoint = TileCenter(map, goalR, goalC);
    }

    if (startR == goalR && startC == goalC) {
        result.points.push_back(goalPoint);
        return result;
    }

    // 2. A*.
    thread_local Workspace ws;
    ws.Begin(static_cast<std::size_t>(rows) * static_cast<std::size_t>(cols));
    const int startIdx = startR * cols + startC;
    const int goalIdx = goalR * cols + goalC;

    auto heuristic = [&](int r, int c) { return OctileDistance(goalR - r, goalC - c); };
    auto pushNode = [&](int idx, float g, float h) {
        ws.heap.push_back({ idx, g + h, h });
        std::push_heap(ws.heap.begin(), ws.heap.end(), WorseThan());
    };

    ws.g[static_cast<std::size_t>(startIdx)] = 0.0f;
    ws.parent[static_cast<std::size_t>(startIdx)] = -1;
    ws.openStamp[static_cast<std::size_t>(startIdx)] = ws.stamp;
    pushNode(startIdx, 0.0f, heuristic(startR, startC));

    // Ô đã đóng gần ĐIỂM BẤM nhất: nếu không tới được đích thì đi tới đó.
    int bestIdx = startIdx;
    float bestSq = 1e30f;
    float bestG = 0.0f;
    bool found = false;

    while (!ws.heap.empty()) {
        std::pop_heap(ws.heap.begin(), ws.heap.end(), WorseThan());
        const HeapNode node = ws.heap.back();
        ws.heap.pop_back();

        const std::size_t cur = static_cast<std::size_t>(node.idx);
        if (ws.closedStamp[cur] == ws.stamp) continue; // bản sao cũ của một ô đã đóng
        ws.closedStamp[cur] = ws.stamp;
        ++result.expanded;

        const int r = node.idx / cols;
        const int c = node.idx % cols;
        const Waypoint ctr = TileCenter(map, r, c);
        const float dSq = (ctr.x - clickX) * (ctr.x - clickX) + (ctr.y - clickY) * (ctr.y - clickY);
        if (dSq < bestSq - 0.01f || (dSq <= bestSq + 0.01f && ws.g[cur] < bestG)) {
            bestSq = dSq;
            bestIdx = node.idx;
            bestG = ws.g[cur];
        }

        if (node.idx == goalIdx) { found = true; break; }

        for (int i = 0; i < kDirCount; ++i) {
            if (!pathgrid::CanStep(map, r, c, i)) continue;
            const int nIdx = (r + pathgrid::kDirRow[i]) * cols + (c + pathgrid::kDirCol[i]);
            const std::size_t n = static_cast<std::size_t>(nIdx);
            if (ws.closedStamp[n] == ws.stamp) continue;

            const float tentative = ws.g[cur] + pathgrid::StepCost(i);
            if (ws.openStamp[n] != ws.stamp || tentative < ws.g[n]) {
                ws.openStamp[n] = ws.stamp;
                ws.g[n] = tentative;
                ws.parent[n] = node.idx;
                pushNode(nIdx, tentative, heuristic(r + pathgrid::kDirRow[i], c + pathgrid::kDirCol[i]));
            }
        }
    }

    // 3. Không tới được đích -> điểm gần đích nhất; nếu chỗ đang đứng đã là điểm đó thì không đi đâu cả.
    int endIdx = goalIdx;
    if (!found) {
        result.partial = true;
        if (bestIdx == startIdx) return result;
        endIdx = bestIdx;
    }

    // 4. Truy vết ngược từ đích về xuất phát. Mốc cuối là điểm đích chính xác (hoặc tâm ô gần nhất nếu đích không với tới được), các mốc giữa lấy tâm ô.
    std::vector<Waypoint> pts;
    for (int idx = endIdx; idx != startIdx && idx != -1; idx = ws.parent[static_cast<std::size_t>(idx)]) {
        if (idx == endIdx && found) pts.push_back(goalPoint);
        else pts.push_back(TileCenter(map, idx / cols, idx % cols));
    }
    std::reverse(pts.begin(), pts.end());
    result.points = std::move(pts);
    return result;
}

PathResult Pathfinder::Find(const TileMap& map, float startX, float startY, float goalX, float goalY) {
    PathResult result = FindRaw(map, startX, startY, goalX, goalY);
    Smooth(map, startX, startY, result.points);
    return result;
}
