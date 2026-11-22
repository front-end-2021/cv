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
