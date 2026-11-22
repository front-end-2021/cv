#include "Pathfinder.h"
#include <queue>
#include <cmath>
#include <algorithm>

namespace {
    struct Node {
        int r, c;
        float g, f;
        bool operator>(const Node& other) const { return f > other.f; }
    };
}

std::vector<Waypoint> Pathfinder::FindPath(const TileMap& map, float startX, float startY, float goalX, float goalY)
{
    if (map.Empty()) return {};
    const int rows = map.rows;
    const int cols = map.cols;
    const float tileSize = map.tileSize;

    int startC = std::clamp(static_cast<int>(startX / tileSize), 0, cols - 1);
    int startR = std::clamp(static_cast<int>(startY / tileSize), 0, rows - 1);
    int goalC = std::clamp(static_cast<int>(goalX / tileSize), 0, cols - 1);
    int goalR = std::clamp(static_cast<int>(goalY / tileSize), 0, rows - 1);

    // Nếu điểm đích là ô nước/đá -> tìm ô đi được GẦN NHẤT xung quanh nó.
    // (Trước đây quét theo thứ tự hàng và lấy ô đầu tiên gặp, nên có thể chọn ô ở phía xa.)
    if (!map.IsWalkableTile(goalR, goalC)) {
        constexpr int kMaxSnapRadius = 5;
        float bestDistSq = 1e18f;
        int bestR = -1, bestC = -1;
        for (int dr = -kMaxSnapRadius; dr <= kMaxSnapRadius; ++dr) {
            for (int dc = -kMaxSnapRadius; dc <= kMaxSnapRadius; ++dc) {
                const int nr = goalR + dr;
                const int nc = goalC + dc;
                if (!map.IsWalkableTile(nr, nc)) continue;
                // Đo khoảng cách từ điểm người chơi bấm tới tâm ô, nên các lính có
                // điểm đích khác nhau trong đội hình sẽ ưu tiên các ô khác nhau.
                const float cx = nc * tileSize + tileSize / 2.0f;
                const float cy = nr * tileSize + tileSize / 2.0f;
                const float distSq = (cx - goalX) * (cx - goalX) + (cy - goalY) * (cy - goalY);
                if (distSq < bestDistSq) {
                    bestDistSq = distSq;
                    bestR = nr;
                    bestC = nc;
                }
            }
        }
        if (bestR < 0) return {};
        goalR = bestR;
        goalC = bestC;
        goalX = goalC * tileSize + tileSize / 2.0f;
        goalY = goalR * tileSize + tileSize / 2.0f;
    }

    if (startR == goalR && startC == goalC) { return { { goalX, goalY } }; }

    std::vector<float> gScore(rows * cols, 1e9f);
    std::vector<int> parent(rows * cols, -1);
    std::vector<bool> closed(rows * cols, false);
    std::priority_queue<Node, std::vector<Node>, std::greater<Node>> openSet;

    auto heuristic = [&](int r, int c) {
        float dr = static_cast<float>(goalR - r), dc = static_cast<float>(goalC - c);
        return std::sqrt(dr * dr + dc * dc);
    };

    int startIdx = startR * cols + startC;
    gScore[startIdx] = 0.0f;
    openSet.push({ startR, startC, 0.0f, heuristic(startR, startC) });

    // 8 hướng di chuyển
    const int dRow[8] = { -1, 1, 0, 0, -1, -1, 1, 1 };
    const int dCol[8] = { 0, 0, -1, 1, -1, 1, -1, 1 };

    bool pathFound = false;
    while (!openSet.empty()) {
        Node curr = openSet.top();
        openSet.pop();

        int currIdx = curr.r * cols + curr.c;
        if (closed[currIdx]) continue;
        closed[currIdx] = true;

        if (curr.r == goalR && curr.c == goalC) {
            pathFound = true;
            break;
        }

        for (int i = 0; i < 8; ++i) {
            int nr = curr.r + dRow[i];
            int nc = curr.c + dCol[i];
            if (!map.IsWalkableTile(nr, nc)) continue;

            // Chống cắt góc chéo xuyên qua ô nước
            if (i >= 4) {
                if (!map.IsWalkableTile(curr.r + dRow[i], curr.c) ||
                    !map.IsWalkableTile(curr.r, curr.c + dCol[i])) {
                    continue;
                }
            }

            int nextIdx = nr * cols + nc;
            if (closed[nextIdx]) continue;

            float stepCost = (i < 4) ? 1.0f : 1.4142f;
            float tentativeG = gScore[currIdx] + stepCost;

            if (tentativeG < gScore[nextIdx]) {
                gScore[nextIdx] = tentativeG;
                parent[nextIdx] = currIdx;
                openSet.push({ nr, nc, tentativeG, tentativeG + heuristic(nr, nc) });
            }
        }
    }

    if (!pathFound) return {};

    // Truy vết ngược từ đích về xuất phát
    std::vector<Waypoint> result;
    int currIdx = goalR * cols + goalC;
    while (currIdx != startIdx && currIdx != -1) {
        int r = currIdx / cols;
        int c = currIdx % cols;
        // Điểm cuối cùng lấy chính xác tọa độ đội hình, các điểm giữa lấy tâm ô tile
        if (r == goalR && c == goalC) {
            result.push_back({ goalX, goalY });
        }
        else {
            result.push_back({ c * tileSize + tileSize / 2.0f, r * tileSize + tileSize / 2.0f });
        }
        currIdx = parent[currIdx];
    }

    std::reverse(result.begin(), result.end());
    return result;
}