#pragma once
#include <vector>
#include "Common.h"
#include "TileMap.h"

struct PathResult {
    std::vector<Waypoint> points; // các mốc cần đi tới (không gồm chỗ đang đứng); rỗng = không đi đâu được
    bool partial = false;         // true: ĐÍCH KHÔNG VỚI TỚI ĐƯỢC, points dẫn tới điểm gần đích nhất mà với tới được
    int expanded = 0;             // số ô A* đã mở, để PathService tính ngân sách mỗi tick
};

class Pathfinder {
public:
    // Đường đi dùng trong game: A* rồi làm mượt (string-pulling), nên đi thẳng qua chỗ trống thay vì
    // zigzag qua tâm từng ô.
    //  - Đích nằm trên nước/đá: dời tới ô đi được gần điểm bấm nhất (không giới hạn bán kính).
    //  - Đích ở vùng tách biệt (đảo, vùng bị đá chặn): đi tới điểm gần đích nhất mà với tới được
    //    (result.partial = true). Nếu chỗ đang đứng đã là điểm gần nhất thì points rỗng.
    static PathResult Find(const TileMap& map, float startX, float startY, float goalX, float goalY);

    // Chỉ A*, chưa làm mượt: đi qua tâm từng ô. Dùng để so sánh/kiểm thử.
    static PathResult FindRaw(const TileMap& map, float startX, float startY, float goalX, float goalY);

    // Giữ API cũ: chỉ lấy danh sách điểm.
    static std::vector<Waypoint> FindPath(const TileMap& map, float startX, float startY, float goalX, float goalY) {
        return Find(map, startX, startY, goalX, goalY).points;
    }

    // Bỏ các mốc thừa: từ chỗ đứng, đi thẳng tới mốc xa nhất còn "nhìn thấy" được, lặp lại.
    // Mốc cuối cùng luôn được giữ. Mỗi đoạn thẳng đều đi được với hitbox kPathClearance.
    static void Smooth(const TileMap& map, float startX, float startY, std::vector<Waypoint>& points);

    // Đoạn thẳng (x0,y0)->(x1,y1) có đi được không với hitbox kPathClearance (lấy mẫu dọc đoạn thẳng).
    static bool HasLineOfSight(const TileMap& map, float x0, float y0, float x1, float y1);

    // Ô đi được gần (x, y) nhất (đo tới tâm ô, không giới hạn bán kính). false nếu cả bản đồ không có ô nào đi được.
    static bool SnapToWalkable(const TileMap& map, float x, float y, int& outRow, int& outCol);

    // Làm điểm đích dùng được: ô phải đi được; nếu đứng đúng điểm đó bị đè lên tường thì dời về tâm ô.
    // false nếu ô không đi được (khi đó hãy dùng SnapToWalkable).
    static bool NormalizeGoal(const TileMap& map, float& x, float& y);
};
