#pragma once
#include <vector>
#include "Common.h"
#include "TileMap.h"

class Pathfinder {
public:
    // Tìm đường A* trên `map` từ tọa độ thế giới (startX, startY) tới (goalX, goalY).
    // Trả về danh sách điểm mốc (rỗng nếu không có đường).
    static std::vector<Waypoint> FindPath(const TileMap& map, float startX, float startY, float goalX, float goalY);
};
