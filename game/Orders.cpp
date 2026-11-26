#include "game/Orders.h"
#include <algorithm>
#include <cmath>
#include <utility>
#include <vector>
#include "FlowField.h"
#include "Pathfinder.h"
#include "game/Construction.h"
#include "game/Formation.h"
#include "game/PathService.h"
#include "game/Production.h"
#include "game/Work.h"

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

ResourceNode* FindResourceAt(GameState& g, float wx, float wy) {
    for (auto& n : g.resources) {
        if (!n.Depleted() && n.fp.ContainsPoint(wx, wy)) return &n;
    }
    return nullptr;
}

Building* FindBuildingAt(GameState& g, float wx, float wy, Team team) {
    for (auto& b : g.buildings) {
        if (b.team == team && b.fp.ContainsPoint(wx, wy)) return &b;
    }
    return nullptr;
}

namespace {
    // Lệnh đi cho cả nhóm đông: MỘT lần tìm đường chung về ô đích (FlowField) rồi mỗi lính lần theo cây tới vị trí đội hình của mình, thay vì mỗi lính một lần A*.
    // Lính nào không dựng được đường theo cách này (vị trí đội hình khuất sau tường, không nối được tới đích...) thì xếp hàng xin đường riêng.
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

namespace {
    // Ra lệnh đi theo đội hình cho đúng các lính trong `units` (không rỗng). attackMove: mỗi lính vào chế độ AttackMove
    // với đích là vị trí đội hình của mình (đặt SAU khi ra lệnh đi, vì lệnh đi đưa lính về chế độ Normal).
    void MoveInFormation(GameState& g, const std::vector<Unit*>& selectedUnits, float targetWorldX, float targetWorldY,
        bool attackMove = false) {
        if (selectedUnits.empty()) return;
        for (Unit* u : selectedUnits) u->CancelJob(); // lệnh của người chơi thay cho việc thợ đang làm

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
        }
        else {
            // Nhóm nhỏ: mỗi lính xin một đường A* riêng (xếp hàng, phục vụ ở đầu tick kế tiếp).
            for (size_t i = 0; i < selectedUnits.size(); ++i) {
                const Waypoint slot = slots[static_cast<size_t>(slotOf[i])];
                OrderMoveTo(g, *selectedUnits[i], slot.x, slot.y);
            }
        }
        if (attackMove) {
            for (size_t i = 0; i < selectedUnits.size(); ++i) {
                const Waypoint slot = slots[static_cast<size_t>(slotOf[i])];
                selectedUnits[i]->EnterAttackMove(slot.x, slot.y);
            }
        }
    }

    std::vector<Unit*> SelectedPlayerUnits(GameState& g) {
        std::vector<Unit*> out;
        for (auto& p : g.units) {
            if (p.selected && p.team == Team::Player && p.IsAlive()) out.push_back(&p);
        }
        return out;
    }
}

void IssueFormationMoveOrder(GameState& g, float targetWorldX, float targetWorldY) {
    MoveInFormation(g, SelectedPlayerUnits(g), targetWorldX, targetWorldY);
}

void IssueFormationMoveOrder(GameState& g, const std::vector<EntityId>& ids, float targetWorldX, float targetWorldY) {
    std::vector<Unit*> units;
    for (EntityId id : ids) {
        Unit* u = g.FindUnit(id);
        if (u && u->team == Team::Player && u->IsAlive()) units.push_back(u);
    }
    MoveInFormation(g, units, targetWorldX, targetWorldY);
}

void IssueAttackOrder(GameState& g, EntityId victim) {
    for (auto& p : g.units) {
        if (p.selected && p.team == Team::Player && p.IsAlive()) {
            p.CancelJob();
            p.OrderAttack(victim);
        }
    }
}

int IssueStopOrder(GameState& g) {
    const std::vector<Unit*> units = SelectedPlayerUnits(g);
    for (Unit* u : units) u->OrderStop();
    return static_cast<int>(units.size());
}

int IssueHoldOrder(GameState& g) {
    const std::vector<Unit*> units = SelectedPlayerUnits(g);
    for (Unit* u : units) u->OrderHold();
    return static_cast<int>(units.size());
}

int IssueAttackMoveOrder(GameState& g, float wx, float wy) {
    const std::vector<Unit*> units = SelectedPlayerUnits(g);
    if (units.empty()) return 0;
    if (const Unit* foe = FindEnemyAt(g, wx, wy)) {
        IssueAttackOrder(g, foe->id);
        return static_cast<int>(units.size());
    }
    MoveInFormation(g, units, wx, wy, true); // (đã hủy việc đang làm của thợ)
    return static_cast<int>(units.size());
}

std::vector<EntityId> SelectedWorkerIds(const GameState& g) {
    std::vector<EntityId> ids;
    for (const auto& u : g.units) {
        if (u.selected && u.team == Team::Player && u.IsAlive() && u.IsWorker()) ids.push_back(u.id);
    }
    return ids;
}

namespace {
    // Các lính đang được chọn chia làm thợ và không phải thợ.
    void SplitSelection(const GameState& g, std::vector<EntityId>& workers, std::vector<EntityId>& others) {
        for (const auto& u : g.units) {
            if (!(u.selected && u.team == Team::Player && u.IsAlive())) continue;
            (u.IsWorker() ? workers : others).push_back(u.id);
        }
    }
}

void IssueSmartOrder(GameState& g, float wx, float wy) {
    std::vector<EntityId> workers, others;
    SplitSelection(g, workers, others);

    // Chỉ chọn công trình (không chọn lính nào): chuột phải đặt điểm tập kết cho các công trình huấn luyện được.
    if (workers.empty() && others.empty()) {
        const ResourceNode* mine = FindResourceAt(g, wx, wy);
        for (auto& b : g.buildings) {
            if (!b.selected || b.team != Team::Player || !b.complete || !b.producesUnits) continue;
            SetRallyPoint(b, wx, wy, mine ? mine->id : kNoEntity);
        }
        return;
    }

    // 1. Kẻ địch dưới con trỏ: cả nhóm tấn công.
    if (const Unit* foe = FindEnemyAt(g, wx, wy)) {
        IssueAttackOrder(g, foe->id);
        return;
    }

    // 2. Mỏ: thợ đi đào, lính khác đi tới gần mỏ.
    if (const ResourceNode* mine = FindResourceAt(g, wx, wy)) {
        for (EntityId id : workers) {
            if (Unit* u = g.FindUnit(id)) OrderGather(*u, mine->id);
        }
        IssueFormationMoveOrder(g, others, wx, wy);
        return;
    }

    // 3. Công trình của phe ta.
    if (const Building* b = FindBuildingAt(g, wx, wy, Team::Player)) {
        if (!b->complete) { // xây dở: thợ đi xây (tiếp)
            for (EntityId id : workers) {
                if (Unit* u = g.FindUnit(id)) OrderBuild(*u, b->id);
            }
            IssueFormationMoveOrder(g, others, wx, wy);
            return;
        }
        if (b->dropoff) { // kho: thợ đang mang hàng đi nộp, thợ tay không và lính khác chỉ đi tới đó
            std::vector<EntityId> rest = others;
            for (EntityId id : workers) {
                Unit* u = g.FindUnit(id);
                if (!u) continue;
                if (u->carrying > 0) OrderReturnCargo(*u, b->id);
                else rest.push_back(id);
            }
            IssueFormationMoveOrder(g, rest, wx, wy);
            return;
        }
    }

    // 4. Mặt đất (hoặc công trình không có việc gì để làm): cả nhóm đi theo đội hình.
    std::vector<EntityId> all = workers;
    all.insert(all.end(), others.begin(), others.end());
    IssueFormationMoveOrder(g, all, wx, wy);
}

bool IssueBuildOrder(GameState& g, int typeIndex, int row, int col, PlaceResult* result) {
    const std::vector<EntityId> workers = SelectedWorkerIds(g);
    if (workers.empty()) {
        if (result) *result = PlaceResult::NoWorker;
        return false;
    }
    const Building* b = PlaceBuilding(g, typeIndex, row, col, Team::Player, false, result);
    if (!b) return false;
    const EntityId buildingId = b->id;
    for (EntityId id : workers) {
        if (Unit* u = g.FindUnit(id)) OrderBuild(*u, buildingId);
    }
    return true;
}
