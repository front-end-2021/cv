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

    bool IsTileWalkable(int r, int c, int rows, int cols, const int* mapData) {
        if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
        return mapData[r * cols + c] != 2; // 2 là nước -> không đi được
    }
}

bool Pathfinder::IsWalkableWorld(float worldX, float worldY, int rows, int cols, float tileSize, const int* mapData) {
    int c = static_cast<int>(std::floor(worldX / tileSize));
    int r = static_cast<int>(std::floor(worldY / tileSize));
    return IsTileWalkable(r, c, rows, cols, mapData);
}

bool Pathfinder::CanBoxStandAt(float worldX, float worldY, float boxSize, int rows, int cols, float tileSize, const int* mapData) {
    // Thu nhỏ hitbox 1 chút (0.45 thay vì 0.5) để lính dễ lách qua khe hẹp
    const float half = boxSize * 0.45f;
    return IsWalkableWorld(worldX - half, worldY - half, rows, cols, tileSize, mapData) &&
        IsWalkableWorld(worldX + half, worldY - half, rows, cols, tileSize, mapData) &&
        IsWalkableWorld(worldX - half, worldY + half, rows, cols, tileSize, mapData) &&
        IsWalkableWorld(worldX + half, worldY + half, rows, cols, tileSize, mapData);
}

std::vector<Waypoint> Pathfinder::FindPath(
    float startX, float startY,
    float goalX, float goalY,
    int rows, int cols, float tileSize,
    const int* mapData)
{
    int startC = std::clamp(static_cast<int>(startX / tileSize), 0, cols - 1);
    int startR = std::clamp(static_cast<int>(startY / tileSize), 0, rows - 1);
    int goalC = std::clamp(static_cast<int>(goalX / tileSize), 0, cols - 1);
    int goalR = std::clamp(static_cast<int>(goalY / tileSize), 0, rows - 1);

    // Nếu điểm đích là ô nước -> tìm ô cạn gần nhất xung quanh nó
    if (!IsTileWalkable(goalR, goalC, rows, cols, mapData)) {
        bool found = false;
        for (int radius = 1; radius <= 5 && !found; ++radius) {
            for (int dr = -radius; dr <= radius && !found; ++dr) {
                for (int dc = -radius; dc <= radius && !found; ++dc) {
                    if (IsTileWalkable(goalR + dr, goalC + dc, rows, cols, mapData)) {
                        goalR += dr;
                        goalC += dc;
                        goalX = goalC * tileSize + tileSize * 0.5f;
                        goalY = goalR * tileSize + tileSize * 0.5f;
                        found = true;
                    }
                }
            }
        }
        if (!found) return {};
    }

    if (startR == goalR && startC == goalC) {
        return { { goalX, goalY } };
    }

    std::vector<float> gScore(rows * cols, 1e9f);
    std::vector<int> parent(rows * cols, -1);
    std::vector<bool> closed(rows * cols, false);
    std::priority_queue<Node, std::vector<Node>, std::greater<Node>> openSet;

    auto heuristic = [&](int r, int c) {
        float dr = static_cast<float>(goalR - r);
        float dc = static_cast<float>(goalC - c);
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
            if (!IsTileWalkable(nr, nc, rows, cols, mapData)) continue;

            // Chống cắt góc chéo xuyên qua ô nước
            if (i >= 4) {
                if (!IsTileWalkable(curr.r + dRow[i], curr.c, rows, cols, mapData) ||
                    !IsTileWalkable(curr.r, curr.c + dCol[i], rows, cols, mapData)) {
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
            result.push_back({ c * tileSize + tileSize * 0.5f, r * tileSize + tileSize * 0.5f });
        }
        currIdx = parent[currIdx];
    }

    std::reverse(result.begin(), result.end());
    return result;
}
