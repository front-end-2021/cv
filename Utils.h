#pragma once
#include <SDL3/SDL.h>

#include <cmath>
#include <algorithm>

class Utils {
public:
    static float Axis(const bool* keys, SDL_Scancode neg, SDL_Scancode pos);
    static void NormalizeDirection(float& dx, float& dy);
};