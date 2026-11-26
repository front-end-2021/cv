#include "game/Game.h"
#include <algorithm>
#include <cmath>
#include "game/Commands.h"
#include "game/Selection.h"
#include "game/Simulation.h"

void UpdateGameFrame(GameState& g, const Input& in, float frameDt, int windowW, int windowH) {
    // 1. Mô phỏng theo nhịp cố định.
    frameDt = std::clamp(frameDt, 0.0f, kMaxFrameDt); //tránh lỗi nhảy bước quá lớn khi game bị giật hoặc tạm dừng
    g.tickAccumulator += frameDt;
    int steps = 0;
    while (g.tickAccumulator >= kTickDt && steps < kMaxTicksPerFrame) {
        StepSimulation(g, kTickDt);
        g.tickAccumulator -= kTickDt;
        ++steps;
    }
    // Máy quá chậm: bỏ phần thời gian chưa kịp mô phỏng (giữ lại phần dư để không giật hình).
    if (g.tickAccumulator >= kTickDt) g.tickAccumulator = std::fmod(g.tickAccumulator, kTickDt);
    g.renderAlpha = std::clamp(g.tickAccumulator / kTickDt, 0.0f, 1.0f);

    // 2. Camera và chọn quân (theo khung hình).
    g.camera.UpdateCamera(in, std::min(frameDt, 0.1f), windowW, windowH, g.map.WorldW(), g.map.WorldH());
    if (in.keys[SDL_SCANCODE_SPACE]) FocusCameraOnSelection(g, windowW, windowH);
    UpdateSelection(g, in.mouseX, in.mouseY);
    UpdatePlacement(g, in.mouseX, in.mouseY);
    g.noticeTimer = std::max(0.0f, g.noticeTimer - frameDt);
}
