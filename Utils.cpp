#include "Utils.h"
#include <SDL3/SDL.h>
#include <cmath>

// Định nghĩa KHÔNG có chữ 'static'
float Utils::Axis(const bool* keys, SDL_Scancode neg, SDL_Scancode pos) {
    return (keys[pos] ? 1.0f : 0.0f) - (keys[neg] ? 1.0f : 0.0f);
};
void Utils::NormalizeDirection(float& dx, float& dy) {
    // Đi chéo không nhanh hơn đi thẳng.
    const float len = std::sqrt(dx * dx + dy * dy);
    if (len > 0.0f) { dx /= len; dy /= len; }
};