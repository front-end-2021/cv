#pragma once
#include "game/GameState.h"

// ===========================================================================
// Hàng đợi yêu cầu tìm đường.
//
// Mọi nơi cần đường đi (lệnh đi, đuổi theo mục tiêu, tính lại khi bị chặn, AI về chỗ cũ) không gọi A* ngay
// mà xếp một PathRequest vào g.pathQueue. Mỗi tick, ProcessPathRequests phục vụ theo thứ tự đến trước
// phục vụ trước, trong ngân sách kMaxPathRequestsPerTick yêu cầu / kPathNodeBudgetPerTick ô A*.
// Nhờ vậy một lệnh cho hàng trăm lính trên bản đồ lớn được dàn ra vài tick thay vì làm khựng một khung hình.
//
// Mỗi lính chỉ có tối đa MỘT yêu cầu còn hiệu lực: xếp yêu cầu mới hoặc đổi lệnh làm yêu cầu cũ lỗi thời
// (so số hiệu Unit::pathTicket) và nó bị bỏ qua khi tới lượt mà không tốn ngân sách.
// ===========================================================================

// Xếp một yêu cầu tìm đường tới (goalX, goalY) cho `u`. Thay thế yêu cầu cũ (nếu có) của lính này.
void RequestPath(GameState& g, Unit& u, float goalX, float goalY, PathPurpose purpose);

// Lệnh đi: hủy lệnh cũ, ghi nhớ đích rồi xếp yêu cầu tìm đường. Lính đứng chờ tới khi có đường (thường là tick kế tiếp).
void OrderMoveTo(GameState& g, Unit& u, float goalX, float goalY);

// Phục vụ hàng đợi trong ngân sách của MỘT tick. Gọi ở đầu mỗi tick (xem StepSimulation).
void ProcessPathRequests(GameState& g);
