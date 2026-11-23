#pragma once
#include <vector>
#include "Common.h"

// Chia `count` vị trí đội hình dạng lưới (hàng cuối được căn giữa) quanh (centerX, centerY),
// mỗi vị trí cách nhau `spacing` pixel và bị kẹp vào [minX, maxX] x [minY, maxY].
// Hàm thuần, không phụ thuộc game: dễ kiểm thử và dễ thay thuật toán (ví dụ gán slot theo khoảng cách gần nhất).
std::vector<Waypoint> ComputeFormationSlots(int count, float centerX, float centerY, float spacing,
    float minX, float minY, float maxX, float maxY);

// Nhóm đông hơn ngần này lính: gán slot kiểu tham lam (nhẹ) thay vì tối ưu tuyệt đối (O(n^3)).
constexpr int kOptimalAssignMaxUnits = 80;

// Gán mỗi lính MỘT vị trí đội hình sao cho TỔNG quãng đường thẳng là nhỏ nhất (thuật toán Hungarian).
// Cách gán tối ưu này không bao giờ có hai đường đi cắt nhau, nên lính không còn chạy chéo qua nhau như khi
// gán theo thứ tự trong danh sách. Nhóm đông hơn kOptimalAssignMaxUnits lính dùng cách tham lam (cặp gần nhất
// trước): rẻ hơn nhiều, hơi kém tối ưu nhưng vẫn tránh được phần lớn đường chéo.
// `from` (vị trí các lính) và `slots` phải cùng số phần tử. Trả về slotOf, với slotOf[i] = chỉ số slot của lính i.
std::vector<int> AssignSlotsByDistance(const std::vector<Waypoint>& from, const std::vector<Waypoint>& slots);
