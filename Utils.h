#pragma once
#include <SDL3/SDL.h>
#include <cmath>
#include <algorithm>
#include <string>

class Utils {
public:
    static float Axis(const bool* keys, SDL_Scancode neg, SDL_Scancode pos);
    static void NormalizeDirection(float& dx, float& dy);
    // Đường dẫn tới thư mục tài nguyên (Maps, Data...) nằm cạnh file thực thi.
    static std::string AssetPath(const std::string& subDir);
};
