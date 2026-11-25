#include "game/Economy.h"

bool CanAfford(const GameState& g, Team team, int cost) {
    return cost <= g.Gold(team);
}

bool Spend(GameState& g, Team team, int cost) {
    if (cost < 0 || !CanAfford(g, team, cost)) return false;
    g.Gold(team) -= cost;
    return true;
}

void Refund(GameState& g, Team team, int amount) {
    if (amount > 0) g.Gold(team) += amount;
}

int SupplyUsed(const GameState& g, Team team) {
    int used = 0;
    for (const auto& u : g.units) {
        if (u.team == team && u.IsAlive()) used += u.Supply;
    }
    for (const auto& b : g.buildings) {
        if (b.team != team) continue;
        for (const auto& q : b.queue) used += g.unitTypes.Get(q.unitType).supply;
    }
    return used;
}

int SupplyCap(const GameState& g, Team team) {
    int cap = 0;
    for (const auto& b : g.buildings) {
        if (b.team == team && b.complete) cap += b.supplyProvided;
    }
    return cap;
}

bool HasProductionBuilding(const GameState& g, Team team) {
    for (const auto& b : g.buildings) {
        if (b.team == team && b.complete && b.producesUnits) return true;
    }
    return false;
}
