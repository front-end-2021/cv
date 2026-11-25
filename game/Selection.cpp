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
    for (auto& b : g.buildings) b.selected = false;
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
    bool anyUnit = false;
    for (auto& u : g.units) {
        SDL_FRect unitRect = { u.x - half, u.y - half, kSquareSize, kSquareSize };
        u.selected = u.team == Team::Player && u.IsAlive() &&
            SDL_HasRectIntersectionFloat(&rect, &unitRect);
        anyUnit = anyUnit || u.selected;
    }

    // Công trình phe ta chỉ được chọn khi khung không trúng lính nào (lính được ưu tiên, như các game RTS khác).
    for (auto& b : g.buildings) {
        SDL_FRect buildingRect = { b.fp.left, b.fp.top, b.fp.right - b.fp.left, b.fp.bottom - b.fp.top };
        b.selected = !anyUnit && b.team == Team::Player &&
            SDL_HasRectIntersectionFloat(&rect, &buildingRect);
    }
}

void FocusCameraOnSelection(GameState& g, int windowW, int windowH) {
    // Thứ tự ưu tiên: lính đang chọn -> công trình đang chọn -> lính phe ta còn sống -> công trình phe ta -> thực thể bất kỳ.
    const Entity* focus = nullptr;
    auto pick = [&](auto& list, auto pred) {
        for (const auto& e : list) {
            if (!focus && pred(e)) focus = &e;
        }
    };
    pick(g.units, [](const Unit& u) { return u.selected; });
    pick(g.buildings, [](const Building& b) { return b.selected; });
    pick(g.units, [](const Unit& u) { return u.team == Team::Player && u.IsAlive(); });
    pick(g.buildings, [](const Building& b) { return b.team == Team::Player; });
    pick(g.units, [](const Unit&) { return true; });
    pick(g.buildings, [](const Building&) { return true; });
    if (!focus) return;
    g.camera.ClampCamera(focus->x - windowW / 2.0f, focus->y - windowH / 2.0f,
        windowW, windowH, g.map.WorldW(), g.map.WorldH());
}
