#include "selectable.h"
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>

Unit::Unit(float x, float y, float sz) : Selectable(x, y, sz) {}

void Unit::Render(SDL_Renderer* r, float camX, float camY) const {
    SDL_FRect rect = {
            x - squareSize / 2.0f - camX,
            y - squareSize / 2.0f - camY,
            squareSize, squareSize };
    if (touchingTarget) {
        SDL_SetRenderDrawColor(r, 240, 70, 70, 255); // chạm mục tiêu đổi màu đỏ
    }
    else {
        SDL_SetRenderDrawColor(r, 230, 200, 60, 255); // màu mặc định vàng
    }
    SDL_RenderFillRect(r, &rect);

    RenderSelectionOutline(r, rect);
}