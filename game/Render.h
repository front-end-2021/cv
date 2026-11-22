#pragma once
#include <SDL3/SDL.h>
#include "game/GameState.h"

// Vẽ toàn bộ màn chơi (bản đồ, đường đi, lính, khung chọn, HUD) rồi SDL_RenderPresent.
// Vị trí lính được nội suy theo g.renderAlpha.
void RenderGame(SDL_Renderer* r, const GameState& g, int windowW, int windowH);
