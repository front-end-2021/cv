#include "selectable.h"
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>

Target::Target(float x, float y, float sz) : Selectable(x, y, sz) {}

void Target::Render(SDL_Renderer* r, float camX, float camY) const {
    SDL_FRect rect = {
            x - squareSize / 2.0f - camX,
            y - squareSize / 2.0f - camY,
            squareSize, squareSize };
    SDL_SetRenderDrawColor(r, 70, 150, 230, 255);
    SDL_RenderFillRect(r, &rect);

    RenderSelectionOutline(r, rect);
}