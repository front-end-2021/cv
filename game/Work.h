#pragma once
#include "game/GameState.h"

// ===========================================================================
// Thợ: đào mỏ, nộp kho, xây công trình.
//
// Thợ là Unit có BuildSpeed > 0. Việc đang làm nằm ở Unit::job (WorkJob). Mỗi tick UpdateWorkerJob quyết định thợ
// cần làm gì tiếp, và khi cần đi đâu thì xếp một yêu cầu tìm đường bình thường (OrderMoveTo, qua hàng đợi
// game/PathService.h): việc di chuyển, né nhau, phát hiện kẹt... dùng lại nguyên code của lính.
//
//   Gather:  đi tới mỏ --(tới nơi)--> đào, mang dần tới đủ `carryCapacity` --> đi tới kho gần nhất --(tới nơi)--> nộp
//            vàng vào kho của phe --> quay lại mỏ ... Mỏ cạn thì tự tìm mỏ khác gần đó (kAutoMineRadius), không còn
//            thì bỏ việc (sau khi nộp nốt hàng đang mang). Chưa có kho thì đứng chờ, giữ hàng.
//   Build:   đi tới công trình xây dở --(tới nơi)--> xây, tiến độ tăng theo BuildSpeed. Xong (hoặc công trình biến mất)
//            thì rảnh.
//
// "Tới nơi" nghĩa là khoảng hở giữa hitbox thợ và mép công trình/mỏ <= kWorkReach. Đi mà không tới được (không có đường,
// bị chặn...) kJobMaxFailures lần liên tiếp thì thợ bỏ việc.
// ===========================================================================

// Giao việc. Hủy việc cũ, bỏ lệnh đi / đánh đang có. Chỉ có tác dụng với thợ (BuildSpeed > 0); trả về false nếu không phải thợ.
bool OrderGather(Unit& u, EntityId mineId);
bool OrderBuild(Unit& u, EntityId buildingId);
// Mang hàng đang có tới kho `depotId` nộp, rồi quay lại đào tiếp mỏ cũ (nếu còn) hoặc mỏ gần đó.
bool OrderReturnCargo(Unit& u, EntityId depotId);

// Chạy việc của một thợ trong MỘT tick. Gọi trước UpdateUnit. Không thêm/xóa đơn vị nào.
void UpdateWorkerJob(GameState& g, Unit& u, float dt);

// Ô đi được kề cạnh (không tính góc) hình chữ nhật `fp`, chọn ô gần `u` nhất và tránh ô đang đông lính đứng
// (để nhiều thợ cùng đào một mỏ không chen vào một ô). Điểm trả về là tâm ô.
bool FindApproachPoint(const GameState& g, const Unit& u, const Footprint& fp, Waypoint& out);

// Kho chứa của phe `team` gần (x, y) nhất (đã xây xong). nullptr nếu không có.
Building* FindNearestDepot(GameState& g, Team team, float x, float y);
// Mỏ còn tài nguyên gần (x, y) nhất trong bán kính `radius`. nullptr nếu không có.
ResourceNode* FindNearestMine(GameState& g, float x, float y, float radius);
