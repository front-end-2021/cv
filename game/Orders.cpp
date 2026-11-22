#include "game/Orders.h"
#include <cmath>
#include <vector>
#include "Pathfinder.h"
#include "game/Formation.h"

bool PointHitsEntity(const Entity& e, float wx, float wy) {
    const float reach = e.squareSize / 2.0f + 4.0f;
    return std::abs(wx - e.x) <= reach && std::abs(wy - e.y) <= reach;
}

Unit* FindEnemyAt(GameState& g, float wx, float wy) {
    Unit* best = nullptr;
    float bestDist = 1e18f;
    for (auto& u : g.units) {
        if (u.team != Team::Enemy || !u.IsAlive() || !PointHitsEntity(u, wx, wy)) continue;
        const float d = std::hypot(u.x - wx, u.y - wy);
        if (d < bestDist) { bestDist = d; best = &u; }
    }
    return best;
}

void IssueFormationMoveOrder(GameState& g, float targetWorldX, float targetWorldY) {
    std::vector<Unit*> selectedUnits;
    for (auto& p : g.units) {
        if (p.selected && p.team == Team::Player && p.IsAlive()) selectedUnits.push_back(&p);
    }
    if (selectedUnits.empty()) return;

    const float half = kSquareSize / 2.0f;
    float facingAngleRad = GetRad(selectedUnits[0], targetWorldX, targetWorldY);
    
    const std::vector<Waypoint> slots = ComputeFormationSlots(
        static_cast<int>(selectedUnits.size()), targetWorldX, targetWorldY, kSquareSize + 6.0f,
        facingAngleRad, half, half, g.map.WorldW() - half, g.map.WorldH() - half);
    
    for (size_t i = 0; i < selectedUnits.size(); ++i) {
        // Tìm đường A* vòng qua nước tới ô vị trí đội hình
        selectedUnits[i]->OrderMove(Pathfinder::FindPath(
            g.map, selectedUnits[i]->x, selectedUnits[i]->y, slots[i].x, slots[i].y));
    }
}

void IssueAttackOrder(GameState& g, EntityId victim) {
    for (auto& p : g.units) {
        if (p.selected && p.team == Team::Player && p.IsAlive()) p.OrderAttack(victim);
    }
}
float GetRad(Unit* u, float targetX, float targetY) {
    float dx = targetX - u->x;
    float dy = targetY - u->y;
    float facingAngleRad = 0.0f;
    if (dx != 0.0f || dy != 0.0f) { facingAngleRad = std::atan2(dy, dx); } // Tránh trường hợp click trùng ngay tâm đội hình
    if (-0.785f <= facingAngleRad && facingAngleRad < 0.785f) { return 0.0f; } // -45deg:45deg Sang phải
    if (0.785f <= facingAngleRad && facingAngleRad < 2.356f) { return 1.571f; } // 45deg:135deg Xuống dưới
    if (2.356f <= facingAngleRad && facingAngleRad < 3.927f) { return 3.142f; } // 135deg:225deg Sang trái
    return -1.571f; // 225deg:360deg Lên trên
}