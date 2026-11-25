#include "game/GameState.h"
#include <algorithm>

Unit* GameState::FindUnit(EntityId id) {
    if (id == kNoEntity) return nullptr;
    auto it = std::lower_bound(units.begin(), units.end(), id,
        [](const Unit& u, EntityId value) { return u.id < value; });
    return (it != units.end() && it->id == id) ? &*it : nullptr;
}

const Unit* GameState::FindUnit(EntityId id) const {
    return const_cast<GameState*>(this)->FindUnit(id);
}

Building* GameState::FindBuilding(EntityId id) {
    if (id == kNoEntity) return nullptr;
    auto it = std::lower_bound(buildings.begin(), buildings.end(), id,
        [](const Building& b, EntityId value) { return b.id < value; });
    return (it != buildings.end() && it->id == id) ? &*it : nullptr;
}

const Building* GameState::FindBuilding(EntityId id) const {
    return const_cast<GameState*>(this)->FindBuilding(id);
}

ResourceNode* GameState::FindResource(EntityId id) {
    if (id == kNoEntity) return nullptr;
    auto it = std::lower_bound(resources.begin(), resources.end(), id,
        [](const ResourceNode& n, EntityId value) { return n.id < value; });
    return (it != resources.end() && it->id == id) ? &*it : nullptr;
}

const ResourceNode* GameState::FindResource(EntityId id) const {
    return const_cast<GameState*>(this)->FindResource(id);
}

Building& GameState::AddBuilding(int typeIndex, int row, int col, Team team, bool complete) {
    buildings.emplace_back(buildingTypes.Get(typeIndex), typeIndex, row, col, map.tileSize, team, complete);
    Building& b = buildings.back();
    b.id = nextEntityId++;
    map.SetFootprintOccupied(b.fp.row, b.fp.col, b.fp.w, b.fp.h, true);
    return b;
}

ResourceNode& GameState::AddResource(int row, int col, int amount) {
    resources.emplace_back(row, col, amount, map.tileSize);
    ResourceNode& n = resources.back();
    n.id = nextEntityId++;
    map.SetFootprintOccupied(n.fp.row, n.fp.col, n.fp.w, n.fp.h, true);
    return n;
}

bool GameState::RemoveBuilding(EntityId id) {
    auto it = std::lower_bound(buildings.begin(), buildings.end(), id,
        [](const Building& b, EntityId value) { return b.id < value; });
    if (it == buildings.end() || it->id != id) return false;
    map.SetFootprintOccupied(it->fp.row, it->fp.col, it->fp.w, it->fp.h, false);
    buildings.erase(it);
    return true;
}

bool GameState::RemoveResource(EntityId id) {
    auto it = std::lower_bound(resources.begin(), resources.end(), id,
        [](const ResourceNode& n, EntityId value) { return n.id < value; });
    if (it == resources.end() || it->id != id) return false;
    map.SetFootprintOccupied(it->fp.row, it->fp.col, it->fp.w, it->fp.h, false);
    resources.erase(it);
    return true;
}

Unit& GameState::AddUnit(float x, float y, Team team, int typeIndex) {
    units.emplace_back(x, y, kSquareSize);
    Unit& u = units.back();
    u.id = nextEntityId++;
    u.team = team;
    u.ApplyType(unitTypes.Get(typeIndex), typeIndex);
    return u;
}

int GameState::CountUnits(Team team, bool aliveOnly) const {
    int n = 0;
    for (const auto& u : units) {
        if (u.team == team && (!aliveOnly || u.IsAlive())) ++n;
    }
    return n;
}
