#pragma once
#include <vector>
#include "entity/selectable.h"
#include "Tile.h"

class Pathfinder {
private:
    // Kiểm tra tọa độ thế giới (x, y) có nằm trên ô đi được không
    static bool IsWalkableWorld(float worldX, float worldY, int rows, int cols, float tileSize, const Tile* mapData);

public:
    // Kiểm tra hình vuông có tâm (x, y) và kích thước size có đè lên ô nước nào không
    static bool CanBoxStandAt(float worldX, float worldY, float boxSize, int rows, int cols, float tileSize, const Tile* mapData);

    // Tìm đường A* từ tọa độ thế giới (startX, startY) tới (goalX, goalY)
    static std::vector<Waypoint> FindPath(float startX, float startY, float goalX, float goalY, int rows, int cols, float tileSize, const Tile* mapData);
};