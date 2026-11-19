#include "selectable.h"
#include <SDL3/SDL.h>

#include <algorithm>
#include <cmath>

Target::Target(float x, float y, float sz) : Selectable(x, y, sz) {}

void Target::Render(SDL_Renderer* r, float camX, float camY) {
    SDL_FRect rect = {
            x - squareSize / 2.0f - camX,
            y - squareSize / 2.0f - camY,
            squareSize, squareSize };
    SDL_SetRenderDrawColor(r, 70, 150, 230, 255);
    SDL_RenderFillRect(r, &rect);

    // Viền xanh lá sáng nếu Mục tiêu đang được chọn
    if (selected) {
        SDL_FRect outline = { rect.x - 3.0f, rect.y - 3.0f, rect.w + 6.0f, rect.h + 6.0f };
        SDL_SetRenderDrawColor(r, 50, 255, 80, 255);
        SDL_RenderRect(r, &outline);
    }
}
