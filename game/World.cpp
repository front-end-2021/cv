#include "game/World.h"
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>
#include <string>

namespace {
    // Điểm p có đứng được không (không đè nước/đá) và không đè lên các điểm trong `taken`.
    bool IsSpotFree(const GameState& g, const Waypoint& p, const std::vector<Waypoint>& taken) {
        if (!g.map.CanBoxStandAt(p.x, p.y, kSquareSize)) return false;
        for (const auto& t : taken) {
            if (std::hypot(t.x - p.x, t.y - p.y) < kSquareSize) return false;
        }
        return true;
    }

    // Tâm ô trống gần điểm (wx, wy) nhất. Trả về false nếu cả bản đồ không còn chỗ.
    bool FindNearestFreeSpot(const GameState& g, float wx, float wy,
        const std::vector<Waypoint>& taken, Waypoint& out) {
        float best = 1e18f;
        bool found = false;
        for (int row = 0; row < g.map.rows; ++row) {
            for (int col = 0; col < g.map.cols; ++col) {
                const Waypoint c{ (static_cast<float>(col) + 0.5f) * g.map.tileSize,
                                  (static_cast<float>(row) + 0.5f) * g.map.tileSize };
                if (!IsSpotFree(g, c, taken)) continue;
                const float d = (c.x - wx) * (c.x - wx) + (c.y - wy) * (c.y - wy);
                if (d < best) { best = d; out = c; found = true; }
            }
        }
        return found;
    }

    // Chỉ số loại đơn vị cho một điểm xuất phát: theo tên trong map, không có/không tồn tại thì mặc định theo phe.
    int ResolveTypeIndex(const GameState& g, const std::string& name, Team team) {
        if (!name.empty()) {
            const int idx = g.unitTypes.IndexOf(name);
            if (idx >= 0) return idx;
            SDL_Log("Khong co loai don vi '%s' trong Data/units.txt, dung loai mac dinh.", name.c_str());
        }
        return g.unitTypes.DefaultIndexFor(team);
    }
}

void InitializeWorld(GameState& g) {
    if (g.unitTypes.Empty()) g.unitTypes.LoadBuiltInDefaults();

    g.camera.x = 0.0f;
    g.camera.y = 0.0f;
    g.selection = SelectionBox{};
    g.result = MatchResult::Playing;
    g.tickAccumulator = 0.0f;
    g.renderAlpha = 1.0f;
    g.tickCount = 0;

    // Dựng lại toàn bộ danh sách. nextEntityId KHÔNG đặt lại: ID cũ không bao giờ trùng ID mới.
    g.units.clear();

    // Map không có @spawn: dùng số lính mặc định, xếp quanh góc trên-trái.
    std::vector<SpawnPoint> playerSpawns = g.map.spawns;
    if (playerSpawns.empty()) {
        for (int i = 0; i < kDefaultPlayerUnitCount; ++i) {
            playerSpawns.push_back({ { g.map.tileSize * 1.5f, g.map.tileSize * 1.5f }, "" });
        }
    }
    g.units.reserve(playerSpawns.size() + g.map.enemySpawns.size());

    std::vector<Waypoint> placed;
    auto spawnUnit = [&](const SpawnPoint& sp, Team team) {
        Waypoint pos = sp.pos;
        if (!IsSpotFree(g, pos, placed) && !FindNearestFreeSpot(g, sp.pos.x, sp.pos.y, placed, pos)) {
            SDL_Log("Khong tim duoc cho dat mot don vi.");
        }
        placed.push_back(pos);
        Unit& u = g.AddUnit(pos.x, pos.y, team, ResolveTypeIndex(g, sp.unitType, team));
        if (team == Team::Enemy) { // kẻ địch có chỗ để quay về
            u.hasHome = true;
            u.home = pos;
        }
    };

    for (const auto& sp : playerSpawns) spawnUnit(sp, Team::Player);
    for (const auto& sp : g.map.enemySpawns) spawnUnit(sp, Team::Enemy);

    g.startCount[static_cast<int>(Team::Player)] = g.CountUnits(Team::Player, false);
    g.startCount[static_cast<int>(Team::Enemy)] = g.CountUnits(Team::Enemy, false);
}

void RemoveGoneUnits(GameState& g) {
    g.units.erase(std::remove_if(g.units.begin(), g.units.end(),
        [](const Unit& u) { return u.IsGone(); }), g.units.end());
}

void UpdateMatchResult(GameState& g) {
    if (g.result != MatchResult::Playing) return;
    if (g.CountUnits(Team::Player, true) == 0) {
        g.result = MatchResult::Defeat;
        SDL_Log("THAT BAI.");
    }
    else if (g.StartCount(Team::Enemy) > 0 && g.CountUnits(Team::Enemy, true) == 0) {
        g.result = MatchResult::Victory;
        SDL_Log("CHIEN THANG.");
    }
}
