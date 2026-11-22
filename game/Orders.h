#pragma once
#include "game/GameState.h"

// Điểm (wx, wy) có nằm trong hitbox của đơn vị không (nới thêm vài pixel cho dễ bấm).
bool PointHitsEntity(const Entity& e, float wx, float wy);

// Kẻ địch còn sống nằm dưới điểm (wx, wy) (nếu chồng nhau thì lấy kẻ gần tâm nhất). Con trỏ chỉ dùng tạm.
Unit* FindEnemyAt(GameState& g, float wx, float wy);

// Chia vị trí đội hình cho các Unit phe ta đang được chọn rồi ra lệnh đi (A* vòng qua nước/đá).
void IssueFormationMoveOrder(GameState& g, float targetWorldX, float targetWorldY);

// Ra lệnh cho các Unit phe ta đang được chọn: đuổi theo rồi đánh `victim`.
void IssueAttackOrder(GameState& g, EntityId victim);
float GetRad(Unit* u, float targetX, float targetY);