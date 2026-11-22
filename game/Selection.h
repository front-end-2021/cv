#pragma once
#include <SDL3/SDL.h>
#include "game/GameState.h"

// Chuẩn hóa 2 điểm bất kỳ thành hình chữ nhật có w, h dương.
SDL_FRect GetNormalizedRect(float x1, float y1, float x2, float y2);

void DeselectAll(GameState& g);
// Bắt đầu kéo chọn tại điểm màn hình (screenX, screenY); bỏ chọn mọi lính.
void BeginSelection(GameState& g, float screenX, float screenY);
void EndSelection(GameState& g);
// Cập nhật khung kéo theo vị trí chuột (tọa độ màn hình) và chọn các lính phe ta còn sống nằm trong khung.
void UpdateSelection(GameState& g, float mouseX, float mouseY);
// Đưa camera về lính đang được chọn đầu tiên (hoặc lính phe ta còn sống đầu tiên).
void FocusCameraOnSelection(GameState& g, int windowW, int windowH);
