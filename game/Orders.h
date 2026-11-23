#pragma once
#include "game/GameState.h"

// Điểm (wx, wy) có nằm trong hitbox của đơn vị không (nới thêm vài pixel cho dễ bấm).
bool PointHitsEntity(const Entity& e, float wx, float wy);

// Kẻ địch còn sống nằm dưới điểm (wx, wy) (nếu chồng nhau thì lấy kẻ gần tâm nhất). Con trỏ chỉ dùng tạm.
Unit* FindEnemyAt(GameState& g, float wx, float wy);

// Chia vị trí đội hình cho các Unit phe ta đang được chọn rồi ra lệnh đi.
// Vị trí được gán theo khoảng cách gần nhất (không chạy chéo nhau). Nhóm nhỏ xin đường A* riêng qua hàng đợi
// (game/PathService.h); nhóm từ kGroupSearchMinUnits lính trở lên dùng một lần tìm đường chung (FlowField).
void IssueFormationMoveOrder(GameState& g, float targetWorldX, float targetWorldY);

// Ra lệnh cho các Unit phe ta đang được chọn: đuổi theo rồi đánh `victim`.
void IssueAttackOrder(GameState& g, EntityId victim);
