#include "camera.h"
#include "../Utils.h"
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>

Camera::Camera(float startX, float startY) : x(startX), y(startY) { }

void Camera::ClampCamera(float px, float py, int windowW, int windowH, float worldW, float worldH) {
    // Giữ camera không nhìn ra ngoài biên bản đồ.
    const float maxX = std::max(0.0f, worldW - static_cast<float>(windowW));
    const float maxY = std::max(0.0f, worldH - static_cast<float>(windowH));
    x = std::clamp(px, 0.0f, maxX);
    y = std::clamp(py, 0.0f, maxY);
}

// Camera cuộn tự do: phím mũi tên và/hoặc chuột ở mép cửa sổ.
void Camera::UpdateCamera(const Input& in, float dt, int windowW, int windowH, float worldW, float worldH) {
    const float step = 1.0f;
    float dx = Utils::Axis(in.keys, SDL_SCANCODE_LEFT, SDL_SCANCODE_RIGHT);
    float dy = Utils::Axis(in.keys, SDL_SCANCODE_UP, SDL_SCANCODE_DOWN);

    if (in.mouseInWindow) {
        if (in.mouseX < edgeScrollMargin)                     dx -= step;
        if (in.mouseX > static_cast<float>(windowW) - edgeScrollMargin) dx += step;
        if (in.mouseY < edgeScrollMargin)                     dy -= step;
        if (in.mouseY > static_cast<float>(windowH) - edgeScrollMargin) dy += step;
    }

    // Phím + chuột cùng hướng có thể cộng thành 2, kẹp lại về [-1, 1].
    dx = std::clamp(dx, -step, step);
    dy = std::clamp(dy, -step, step);

    Utils::NormalizeDirection(dx, dy);
    ClampCamera(x + dx * cameraSpeed * dt, y + dy * cameraSpeed * dt, windowW, windowH, worldW, worldH);
}