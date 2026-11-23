#pragma once
#include <cstdint>
#include "Common.h"

// Lý do xin đường: quyết định kết quả được áp dụng thế nào (xem ApplyPathResult trong game/PathService.cpp).
enum class PathPurpose : std::uint8_t {
    Move,    // lệnh đi tới một điểm
    Chase,   // đuổi theo mục tiêu đang ngoài tầm đánh
    Unstick  // đang đi mà bị chặn / kẹt: tính lại đường tới đích của lệnh đi
};

// Một yêu cầu tìm đường đang xếp hàng. Chỉ giữ ID của lính (không giữ con trỏ) nên lính chết/bị xóa trong lúc chờ cũng an toàn.
struct PathRequest {
    EntityId unit = kNoEntity;
    float goalX = 0.0f;
    float goalY = 0.0f;
    std::uint32_t ticket = 0; // phải khớp Unit::pathTicket lúc phục vụ, nếu không yêu cầu đã bị thay thế/hủy
    PathPurpose purpose = PathPurpose::Move;
};
