#include "selectable.h"
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>

Selectable::Selectable(float x, float y, float sz) : x(x), y(y), squareSize(sz) {}

void Selectable::RenderSelectionOutline(SDL_Renderer* r, const SDL_FRect& rect) const {
    if (!selected) return;
    SDL_FRect outline = { rect.x - 3.0f, rect.y - 3.0f, rect.w + 6.0f, rect.h + 6.0f };
    SDL_SetRenderDrawColor(r, 50, 255, 80, 255);
    SDL_RenderRect(r, &outline);
}