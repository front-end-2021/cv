#pragma once
#include <vector>
#include "Common.h"

// Chia `count` vị trí đội hình dạng lưới (hàng cuối được căn giữa) quanh (centerX, centerY),
// mỗi vị trí cách nhau `spacing` pixel và bị kẹp vào [minX, maxX] x [minY, maxY].
// Hàm thuần, không phụ thuộc game: dễ kiểm thử và dễ thay thuật toán (ví dụ gán slot theo khoảng cách gần nhất).
std::vector<Waypoint> ComputeFormationSlots(int count, float centerX, float centerY, float spacing,
    float minX, float minY, float maxX, float maxY);
