#include "game/Construction.h"
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>
#include "game/Economy.h"
#include "game/PathService.h"

namespace {
    constexpr float kEvictStep = 8.0f;        // bước lấy mẫu khi tìm chỗ đứng cho lính bị đẩy ra (px)
    constexpr int kEvictMaxRingTiles = 5;     // tìm trong bán kính ngần này ô

    // Hộp 0,45 cạnh lính là cỡ TileMap::CanBoxStandAt dùng: lính "chạm" vùng nào thì không đứng được ở đó.
    bool UnitTouchesFootprint(const Unit& u, const Footprint& fp) {
        const float half = kSquareSize * 0.45f;
        return fp.ContainsPoint(u.x - half, u.y - half) || fp.ContainsPoint(u.x + half, u.y - half) ||
               fp.ContainsPoint(u.x - half, u.y + half) || fp.ContainsPoint(u.x + half, u.y + half);
    }

    // Đoạn thẳng (x0,y0)->(x1,y1) có cắt hình chữ nhật không (phương pháp "slab").
    bool SegmentHitsRect(float x0, float y0, float x1, float y1, float left, float top, float right, float bottom) {
        float tMin = 0.0f, tMax = 1.0f;
        const float d[2] = { x1 - x0, y1 - y0 };
        const float o[2] = { x0, y0 };
        const float lo[2] = { left, top };
        const float hi[2] = { right, bottom };
        for (int i = 0; i < 2; ++i) {
            if (std::abs(d[i]) < 1e-6f) {
                if (o[i] < lo[i] || o[i] > hi[i]) return false;
            }
            else {
                float t1 = (lo[i] - o[i]) / d[i];
                float t2 = (hi[i] - o[i]) / d[i];
                if (t1 > t2) std::swap(t1, t2);
                tMin = std::max(tMin, t1);
                tMax = std::min(tMax, t2);
                if (tMin > tMax) return false;
            }
        }
        return true;
    }

    // Chỗ đứng được gần (x, y) nhất. false nếu không có trong bán kính tìm.
    bool FindNearestStandable(const TileMap& map, float x, float y, Waypoint& out) {
        const float maxR = static_cast<float>(kEvictMaxRingTiles) * map.tileSize;
        float best = 1e30f;
        bool found = false;
        for (float dy = -maxR; dy <= maxR; dy += kEvictStep) {
            for (float dx = -maxR; dx <= maxR; dx += kEvictStep) {
                const float d2 = dx * dx + dy * dy;
                if (d2 >= best || d2 > maxR * maxR) continue;
                if (!map.CanBoxStandAt(x + dx, y + dy, kSquareSize)) continue;
                best = d2;
                out = { x + dx, y + dy };
                found = true;
            }
        }
        return found;
    }
}

bool IsTileBuildable(const GameState& g, int row, int col) {
    return g.map.IsTerrainWalkable(row, col) && !g.map.IsOccupied(row, col);
}

PlaceResult CheckPlacement(const GameState& g, int typeIndex, int row, int col, Team team) {
    if (typeIndex < 0 || typeIndex >= g.buildingTypes.Count()) return PlaceResult::UnknownType;
    const BuildingType& type = g.buildingTypes.Get(typeIndex);
    if (row < 0 || col < 0 || row + type.height > g.map.rows || col + type.width > g.map.cols) return PlaceResult::OutOfMap;

    bool occupied = false;
    for (int r = row; r < row + type.height; ++r) {
        for (int c = col; c < col + type.width; ++c) {
            if (!g.map.IsTerrainWalkable(r, c)) return PlaceResult::BadTerrain;
            if (g.map.IsOccupied(r, c)) occupied = true;
        }
    }
    if (occupied) return PlaceResult::Occupied;

    const Footprint fp = Footprint::Make(row, col, type.width, type.height, g.map.tileSize);
    for (const auto& u : g.units) {
        if (u.IsAlive() && u.team != team && UnitTouchesFootprint(u, fp)) return PlaceResult::EnemyInWay;
    }
    return PlaceResult::Ok;
}

Building* PlaceBuilding(GameState& g, int typeIndex, int row, int col, Team team, bool prebuilt, PlaceResult* result) {
    PlaceResult r = CheckPlacement(g, typeIndex, row, col, team);
    int cost = 0;
    if (r == PlaceResult::Ok) {
        cost = g.buildingTypes.Get(typeIndex).cost;
        if (!prebuilt && !CanAfford(g, team, cost)) r = PlaceResult::NotEnoughGold;
    }
    if (result) *result = r;
    if (r != PlaceResult::Ok) return nullptr;

    if (!prebuilt) Spend(g, team, cost);
    Building& b = g.AddBuilding(typeIndex, row, col, team, prebuilt);
    const Footprint fp = b.fp;
    EvictTrappedUnits(g);
    ReplanPathsCrossing(g, fp);
    return &b;
}

bool CancelConstruction(GameState& g, EntityId buildingId) {
    const Building* b = g.FindBuilding(buildingId);
    if (!b || b->complete) return false;
    const Team team = b->team;
    const int refund = static_cast<int>(static_cast<float>(b->Cost) * kCancelRefundRatio);
    g.RemoveBuilding(buildingId);
    Refund(g, team, refund);
    return true;
}

bool DestroyBuilding(GameState& g, EntityId buildingId) {
    const Building* b = g.FindBuilding(buildingId);
    if (!b) return false;
    const Team team = b->team;
    int refund = 0;
    for (const auto& q : b->queue) refund += g.unitTypes.Get(q.unitType).cost;
    g.RemoveBuilding(buildingId);
    Refund(g, team, refund);
    return true;
}

void EvictTrappedUnits(GameState& g) {
    for (auto& u : g.units) {
        if (!u.IsAlive() || g.map.CanBoxStandAt(u.x, u.y, kSquareSize)) continue;
        Waypoint p;
        if (FindNearestStandable(g.map, u.x, u.y, p)) {
            u.x = p.x;
            u.y = p.y;
            u.SnapPrevToCurrent();
        }
        else {
            SDL_Log("Khong tim duoc cho dung cho mot linh bi ket trong cong trinh.");
        }
    }
}

void ReplanPathsCrossing(GameState& g, const Footprint& fp) {
    // Lính đi sát công trình cũng phải tránh nó một khoảng bằng nửa hitbox phình dùng khi tìm đường.
    const float margin = kPathClearance * 0.5f + 2.0f;
    for (auto& u : g.units) {
        if (!u.IsAlive() || u.path.empty()) continue;
        bool hit = false;
        float px = u.x, py = u.y;
        for (const Waypoint& wp : u.path) {
            if (SegmentHitsRect(px, py, wp.x, wp.y, fp.left - margin, fp.top - margin, fp.right + margin, fp.bottom + margin)) {
                hit = true;
                break;
            }
            px = wp.x;
            py = wp.y;
        }
        if (!hit) continue;

        if (u.hasMoveGoal) {
            RequestPath(g, u, u.moveGoal.x, u.moveGoal.y, PathPurpose::Unstick); // vẫn đi theo đường cũ cho tới khi có đường mới
        }
        else {
            u.path.clear(); // đang đuổi theo mục tiêu: UpdateUnit xin đường mới ở tick kế tiếp
            u.repathTimer = 0.0f;
        }
    }
}

bool ApplyConstructionWork(Building& b, const Unit& worker, float dt) {
    if (b.complete || worker.BuildSpeed <= 0) return false;
    const float seconds = dt * static_cast<float>(worker.BuildSpeed) / 100.0f;
    return b.AdvanceConstruction(seconds / std::max(0.1f, b.buildTime));
}

const char* DescribePlaceResult(PlaceResult r) {
    switch (r) {
    case PlaceResult::Ok: return "";
    case PlaceResult::UnknownType: return "Unknown building type";
    case PlaceResult::OutOfMap: return "Cannot build outside the map";
    case PlaceResult::BadTerrain: return "Cannot build on water or rock";
    case PlaceResult::Occupied: return "Something is already built there";
    case PlaceResult::EnemyInWay: return "Enemy units are in the way";
    case PlaceResult::NotEnoughGold: return "Not enough gold";
    case PlaceResult::NoWorker: return "Select a worker first";
    }
    return "";
}
