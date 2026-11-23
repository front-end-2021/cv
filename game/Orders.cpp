#include "game/Orders.h"
#include <algorithm>
#include <cmath>
#include <utility>
#include <vector>
#include "FlowField.h"
#include "Pathfinder.h"
#include "game/Formation.h"
#include "game/PathService.h"

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

namespace {
    // Lệnh đi cho cả nhóm đông: MỘT lần tìm đường chung về ô đích (FlowField) rồi mỗi lính lần theo cây tới vị trí
    // đội hình của mình, thay vì mỗi lính một lần A*. Lính nào không dựng được đường theo cách này (vị trí đội hình
    // khuất sau tường, không nối được tới đích...) thì xếp hàng xin đường riêng.
    void IssueGroupMove(GameState& g, const std::vector<Unit*>& units, const std::vector<Waypoint>& slots,
        const std::vector<int>& slotOf, float targetX, float targetY) {
        int goalRow = 0, goalCol = 0;
        FlowField field;
        bool built = false;
        if (Pathfinder::SnapToWalkable(g.map, targetX, targetY, goalRow, goalCol)) {
            std::vector<std::pair<int, int>> starts;
            starts.reserve(units.size());
            for (const Unit* u : units) {
                starts.push_back({ std::clamp(static_cast<int>(std::floor(u->y / g.map.tileSize)), 0, g.map.rows - 1),
                                   std::clamp(static_cast<int>(std::floor(u->x / g.map.tileSize)), 0, g.map.cols - 1) });
            }
            built = field.Build(g.map, goalRow, goalCol, starts);
        }

        std::vector<Waypoint> path;
        for (size_t i = 0; i < units.size(); ++i) {
            Unit& u = *units[i];
            const Waypoint slot = slots[static_cast<size_t>(slotOf[i])];
            if (built && field.BuildPath(g.map, u.x, u.y, slot, path)) {
                u.OrderMove(std::move(path));
                path.clear();
            }
            else {
                OrderMoveTo(g, u, slot.x, slot.y);
            }
        }
    }
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

    // Gán slot theo khoảng cách (tổng quãng đường nhỏ nhất) để lính không chạy chéo qua nhau.
    std::vector<Waypoint> positions;
    positions.reserve(selectedUnits.size());
    for (const Unit* u : selectedUnits) positions.push_back({ u->x, u->y });
    const std::vector<int> slotOf = AssignSlotsByDistance(positions, slots);

    if (static_cast<int>(selectedUnits.size()) >= kGroupSearchMinUnits) {
        IssueGroupMove(g, selectedUnits, slots, slotOf, targetWorldX, targetWorldY);
        return;
    }
    // Nhóm nhỏ: mỗi lính xin một đường A* riêng (xếp hàng, phục vụ ở đầu tick kế tiếp).
    for (size_t i = 0; i < selectedUnits.size(); ++i) {
        const Waypoint slot = slots[static_cast<size_t>(slotOf[i])];
        OrderMoveTo(g, *selectedUnits[i], slot.x, slot.y);
    }
}

void IssueAttackOrder(GameState& g, EntityId victim) {
    for (auto& p : g.units) {
        if (p.selected && p.team == Team::Player && p.IsAlive()) p.OrderAttack(victim);
    }
}
