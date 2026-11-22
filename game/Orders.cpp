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
    const std::vector<Waypoint> slots = ComputeFormationSlots(
        static_cast<int>(selectedUnits.size()), targetWorldX, targetWorldY, kSquareSize + 6.0f,
        half, half, g.map.WorldW() - half, g.map.WorldH() - half);

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
