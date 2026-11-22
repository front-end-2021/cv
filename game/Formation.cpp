#include "game/Formation.h"
#include <algorithm>
#include <cmath>

// facingAngleRad: Góc hướng mặt của đội hình tính bằng Radian (0 = hướng sang phải / trục +X)
std::vector<Waypoint> ComputeFormationSlots( int count, float centerX, float centerY, 
    float spacing, float facingAngleRad, float minX, float minY, float maxX, float maxY)
{
    std::vector<Waypoint> slots;
    if (count <= 0) return slots;
    slots.reserve(static_cast<size_t>(count)); // cấp trước bộ nhớ cho count phần tử để tránh việc cấp phát lại nhiều lần khi thêm phần tử, giúp tối ưu hiệu năng

    const int cols = static_cast<int>(std::ceil(std::sqrt(static_cast<float>(count)))); // cố gắng xếp các đối tượng thành một hình càng gần hình vuông càng tốt
    const int rows = static_cast<int>(std::ceil(static_cast<float>(count) / static_cast<float>(cols)));

    const float totalWidth = static_cast<float>(cols - 1) * spacing; // cols - 1 vì khoảng cách tính từ tâm đối tượng đầu đến tâm đối tượng cuối
    const float totalHeight = static_cast<float>(rows - 1) * spacing;

    // 1. Tính trước sin/cos để xoay tọa độ. Mặc định đội hình hướng lên trên (-Y) hoặc sang phải (+X), ở đây quy ước hàng đầu hướng về phía trước
    const float cosA = std::cos(facingAngleRad);
    const float sinA = std::sin(facingAngleRad);

    // 2. Kéo tâm đội hình vào trong biên an toàn (tránh dồn cục từng lính ở mép bản đồ). Dùng bán kính bao quanh đội hình để đảm bảo khi xoay không bị lẹm ra ngoài
    const float boundingRadius = std::hypot(totalWidth, totalHeight) / 2.0f;
    const float safeCenterX = std::clamp(centerX, minX + boundingRadius, std::max(minX + boundingRadius, maxX - boundingRadius));
    const float safeCenterY = std::clamp(centerY, minY + boundingRadius, std::max(minY + boundingRadius, maxY - boundingRadius));

    for (int i = 0; i < count; ++i) {
        const int r = i / cols;
        const int c = i % cols;
        const int unitsInThisRow = (r == rows - 1) ? (count - r * cols) : cols;
        const float rowOffsetX = static_cast<float>(cols - unitsInThisRow) * spacing / 2.0f;

        // Tọa độ cục bộ (Local space) so với tâm (0, 0). Hàng 0 (r = 0) sẽ nằm ở phía trước (trục +X cục bộ), các cột trải rộng theo trục Y cục bộ
        const float localX = (totalHeight / 2.0f) - static_cast<float>(r) * spacing;
        const float localY = -(totalWidth / 2.0f) + static_cast<float>(c) * spacing + rowOffsetX;

        // 3. Áp dụng ma trận xoay 2D và tịnh tiến về tâm an toàn
        const float worldX = safeCenterX + (localX * cosA - localY * sinA);
        const float worldY = safeCenterY + (localX * sinA + localY * cosA);
        
        slots.push_back({ std::clamp(worldX, minX, maxX), std::clamp(worldY, minY, maxY) }); // Tọa độ (X, Y) thực tế cho đối tượng thứ i
    }
    return slots;
}
