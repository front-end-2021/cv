#pragma once
#include <vector>
#include "game/GameState.h"

// Điểm (wx, wy) có nằm trong hitbox của đơn vị không (nới thêm vài pixel cho dễ bấm).
bool PointHitsEntity(const Entity& e, float wx, float wy);

// Kẻ địch còn sống nằm dưới điểm (wx, wy) (nếu chồng nhau thì lấy kẻ gần tâm nhất). Con trỏ chỉ dùng tạm.
Unit* FindEnemyAt(GameState& g, float wx, float wy);

// Mỏ tài nguyên nằm dưới điểm (wx, wy), nullptr nếu không có. Con trỏ chỉ dùng tạm.
ResourceNode* FindResourceAt(GameState& g, float wx, float wy);
// Công trình của phe `team` nằm dưới điểm (wx, wy), nullptr nếu không có. Con trỏ chỉ dùng tạm.
Building* FindBuildingAt(GameState& g, float wx, float wy, Team team);

// Chia vị trí đội hình cho các Unit phe ta đang được chọn rồi ra lệnh đi (hủy việc đang làm của thợ).
// Vị trí được gán theo khoảng cách gần nhất (không chạy chéo nhau). Nhóm nhỏ xin đường A* riêng qua hàng đợi
// (game/PathService.h); nhóm từ kGroupSearchMinUnits lính trở lên dùng một lần tìm đường chung (FlowField).
void IssueFormationMoveOrder(GameState& g, float targetWorldX, float targetWorldY);

// Như trên nhưng cho đúng các lính trong `ids` (phe ta, còn sống) thay vì những lính đang được chọn.
void IssueFormationMoveOrder(GameState& g, const std::vector<EntityId>& ids, float targetWorldX, float targetWorldY);

// Ra lệnh cho các Unit phe ta đang được chọn: đuổi theo rồi đánh `victim` (hủy việc đang làm của thợ).
void IssueAttackOrder(GameState& g, EntityId victim);

// Stop (phím S) cho các lính phe ta đang được chọn: bỏ lệnh đi / đánh / việc đang làm, đứng lại ngay, về chế độ
// Normal (xem Unit::OrderStop). Trả về số lính nhận lệnh.
int IssueStopOrder(GameState& g);

// Hold position (phím H) cho các lính phe ta đang được chọn: đứng yên tại chỗ, chỉ đánh kẻ đã nằm trong tầm đánh,
// không đuổi theo (xem Unit::OrderHold). Mọi lệnh đi / đánh sau đó của người chơi hủy chế độ này. Trả về số lính nhận lệnh.
int IssueHoldOrder(GameState& g);

// Attack-move (phím A rồi bấm chuột trái) tới điểm (wx, wy) cho các lính phe ta đang được chọn.
//   - Có kẻ địch dưới điểm bấm: tấn công thẳng kẻ đó (như chuột phải).
//   - Còn lại: cả nhóm đi theo đội hình như lệnh đi, mỗi lính vào chế độ AttackMove tới vị trí đội hình của mình:
//     gặp kẻ địch trong tầm phát hiện thì dừng lại đánh, xong thì đi tiếp (hủy việc đang làm của thợ).
// Trả về số lính nhận lệnh.
int IssueAttackMoveOrder(GameState& g, float wx, float wy);

// Chuột phải tại điểm (wx, wy) trên thế giới. Tùy thứ nằm dưới điểm đó và những gì đang được chọn:
//   - đang chọn lính: kẻ địch -> tấn công; mỏ -> thợ đi đào (lính khác đi tới gần mỏ); công trình xây dở của phe ta ->
//     thợ đi xây; kho của phe ta -> thợ đang mang hàng đi nộp; còn lại -> đi tới đó theo đội hình.
//   - chỉ đang chọn công trình: đặt điểm tập kết (đặt lên mỏ thì thợ mới ra tự đi đào).
void IssueSmartOrder(GameState& g, float wx, float wy);

// Thợ đang được chọn (phe ta, còn sống).
std::vector<EntityId> SelectedWorkerIds(const GameState& g);

// Đặt móng công trình loại `typeIndex` ở ô (row, col) và giao MỌI thợ đang được chọn đi xây.
// Thất bại (không có thợ, không đặt được, thiếu vàng) thì không thay đổi gì và ghi lý do vào *result.
bool IssueBuildOrder(GameState& g, int typeIndex, int row, int col, PlaceResult* result = nullptr);
