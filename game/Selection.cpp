#include "game/Selection.h"
#include <algorithm>
#include <cmath>

SDL_FRect GetNormalizedRect(float x1, float y1, float x2, float y2) {
    SDL_FRect r;
    r.x = std::min(x1, x2);
    r.y = std::min(y1, y2);
    r.w = std::abs(x2 - x1);
    r.h = std::abs(y2 - y1);
    return r;
}

void DeselectAll(GameState& g) {
    for (auto& u : g.units) u.selected = false;
}

void BeginSelection(GameState& g, float screenX, float screenY) {
    g.selection.active = true;
    g.selection.startX = screenX + g.camera.x;
    g.selection.startY = screenY + g.camera.y;
    g.selection.endX = g.selection.startX;
    g.selection.endY = g.selection.startY;
    DeselectAll(g);
}

void EndSelection(GameState& g) {
    g.selection.active = false;
}

void UpdateSelection(GameState& g, float mouseX, float mouseY) {
    if (!g.selection.active) return;
    g.selection.endX = mouseX + g.camera.x;
    g.selection.endY = mouseY + g.camera.y;

    SDL_FRect rect = GetNormalizedRect(g.selection.startX, g.selection.startY,
        g.selection.endX, g.selection.endY);
    if (rect.w < 3.0f && rect.h < 3.0f) {
        rect.w = 3.0f;
        rect.h = 3.0f;
    }

    // Chỉ chọn được lính phe ta còn sống.
    const float half = kSquareSize / 2.0f;
    for (auto& u : g.units) {
        SDL_FRect unitRect = { u.x - half, u.y - half, kSquareSize, kSquareSize };
        u.selected = u.team == Team::Player && u.IsAlive() &&
            SDL_HasRectIntersectionFloat(&rect, &unitRect);
    }
}

void FocusCameraOnSelection(GameState& g, int windowW, int windowH) {
    if (g.units.empty()) return;
    const Unit* focus = nullptr;
    for (const auto& u : g.units) {
        if (u.selected) { focus = &u; break; }
    }
    if (!focus) {
        for (const auto& u : g.units) {
            if (u.team == Team::Player && u.IsAlive()) { focus = &u; break; }
        }
    }
    if (!focus) focus = &g.units[0];
    g.camera.ClampCamera(focus->x - windowW / 2.0f, focus->y - windowH / 2.0f,
        windowW, windowH, g.map.WorldW(), g.map.WorldH());
}
