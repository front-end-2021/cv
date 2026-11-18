#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>

#include <algorithm>
#include <cmath>
#include "camera/camera.h"
#include "Utils.h"

constexpr int kWindowW = 1280;
constexpr int kWindowH = 720;
constexpr float kTileSize = 64.0f;
constexpr float kSquareSize = 40.0f;
constexpr float kSpeed = 300.0f; // tốc độ ô vuông vàng (pixel/giây)

// 0 = cỏ, 1 = đất, 2 = nước
constexpr int kMapRows = 15;
constexpr int kMapCols = 24;
constexpr int kMap[kMapRows][kMapCols] = {
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 } };

constexpr float kWorldW = kMapCols * kTileSize;
constexpr float kWorldH = kMapRows * kTileSize;
constexpr float kTargetX = 12.0f * kTileSize + kTileSize / 2.0f;
constexpr float kTargetY = 6.0f * kTileSize + kTileSize / 2.0f;

struct GameState {
    float x = kWorldW / 2.0f, y = kWorldH / 2.0f; // Tọa độ thế giới, không phải tọa độ màn hình.
    Camera camera{ 0.0f, 0.0f };                    // Camera: góc trên-trái của vùng nhìn thấy, tính theo tọa độ thế giới
    bool touchingTarget = false;

    // ---- Trạng thái quét chuột chọn (lưu bằng tọa độ thế giới) ----
    bool isSelecting = false;
    float selectStartWorldX = 0.0f;
    float selectStartWorldY = 0.0f;
    float selectEndWorldX = 0.0f;
    float selectEndWorldY = 0.0f;

    bool playerSelected = false;
    bool targetSelected = false;

    // ---- Trạng thái di chuyển theo lệnh chuột phải ----
    bool hasMoveOrder = false;
    float moveTargetX = 0.0f;
    float moveTargetY = 0.0f;
};

struct App {
    SDL_Window* window = nullptr;
    SDL_Renderer* renderer = nullptr;
    Uint64 lastTicks = 0;
    GameState game;
};

// Hàm chuẩn hóa 2 điểm bất kỳ thành hình chữ nhật có w, h dương
static SDL_FRect GetNormalizedRect(float x1, float y1, float x2, float y2) {
    SDL_FRect r;
    r.x = std::min(x1, x2);
    r.y = std::min(y1, y2);
    r.w = std::abs(x2 - x1);
    r.h = std::abs(y2 - y1);
    return r;
}

static void Update(GameState& g, const Input& in, float dt, int windowW, int windowH) {
    const float half = kSquareSize / 2.0f;
    // ---- Ô vuông vàng: chỉ di chuyển bằng WASD ----
    float wasdX = Utils::Axis(in.keys, SDL_SCANCODE_A, SDL_SCANCODE_D);
    float wasdY = Utils::Axis(in.keys, SDL_SCANCODE_W, SDL_SCANCODE_S);
    if (wasdX != 0.0f || wasdY != 0.0f) {
        // Nếu người chơi bấm WASD, hủy lệnh di chuyển bằng chuột hiện tại
        g.hasMoveOrder = false;
        Utils::NormalizeDirection(wasdX, wasdY);
        g.x += wasdX * kSpeed * dt;
        g.y += wasdY * kSpeed * dt;
    }
    else if (g.hasMoveOrder) {
        // Tính vector khoảng cách từ vị trí hiện tại tới điểm đích
        float toTargetX = g.moveTargetX - g.x;
        float toTargetY = g.moveTargetY - g.y;
        float dist = std::sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
        float stepDist = kSpeed * dt;

        // Nếu khoảng cách còn lại nhỏ hơn quãng đường đi được trong 1 frame -> Đặt thẳng vào đích (chống rung)
        if (dist <= stepDist) {
            g.x = g.moveTargetX;
            g.y = g.moveTargetY;
            g.hasMoveOrder = false;
        }
        else {
            g.x += (toTargetX / dist) * stepDist;
            g.y += (toTargetY / dist) * stepDist;
        }
    }

    // Giới hạn trong toàn bộ bản đồ.
    g.x = std::clamp(g.x, half, kWorldW - half);
    g.y = std::clamp(g.y, half, kWorldH - half);

    // Va chạm với ô vuông mục tiêu được tính trong tọa độ thế giới.
    g.touchingTarget =
        std::abs(g.x - kTargetX) < kSquareSize &&
        std::abs(g.y - kTargetY) < kSquareSize;

    // ---- Camera: độc lập với ô vuông vàng ----
    g.camera.UpdateCamera(in, dt, windowW, windowH, kWorldW, kWorldH);

    // Space: đưa camera về chỗ ô vuông vàng (đỡ bị lạc khi cuộn xa).
    if (in.keys[SDL_SCANCODE_SPACE]) {
        g.camera.ClampCamera(g.x - windowW / 2.0f, g.y - windowH / 2.0f, windowW, windowH, kWorldW, kWorldH);
    }

    // ---- Cập nhật vùng quét chuột (nếu đang giữ chuột trái) ----
    if (g.isSelecting) {
        // Cập nhật liên tục theo vị trí chuột + camera (hỗ trợ vừa kéo vừa cuộn map)
        g.selectEndWorldX = in.mouseX + g.camera.x;
        g.selectEndWorldY = in.mouseY + g.camera.y;

        SDL_FRect selectionWorldRect = GetNormalizedRect(
            g.selectStartWorldX, g.selectStartWorldY,
            g.selectEndWorldX, g.selectEndWorldY);

        // Nếu chỉ click nhẹ (vùng kéo quá nhỏ < 3px), mở rộng nhẹ để hỗ trợ click chọn trực tiếp
        if (selectionWorldRect.w < 3.0f && selectionWorldRect.h < 3.0f) {
            selectionWorldRect.w = 3.0f;
            selectionWorldRect.h = 3.0f;
        }

        // Hình chữ nhật thế giới của Mục tiêu và Người chơi
        SDL_FRect targetWorldRect = { kTargetX - half, kTargetY - half, kSquareSize, kSquareSize };
        SDL_FRect playerWorldRect = { g.x - half, g.y - half, kSquareSize, kSquareSize };

        // Kiểm tra giao nhau
        g.targetSelected = SDL_HasRectIntersectionFloat(&selectionWorldRect, &targetWorldRect);
        g.playerSelected = SDL_HasRectIntersectionFloat(&selectionWorldRect, &playerWorldRect);
    }
}

static void Render(SDL_Renderer* r, const GameState& g, int windowW, int windowH) {
    SDL_SetRenderDrawColor(r, 20, 25, 20, 255);
    SDL_RenderClear(r);

    // Làm tròn camera xuống số nguyên để các ô không bị nhấp nháy/hở 1 pixel khi cuộn.
    const float camX = std::floor(g.camera.x);
    const float camY = std::floor(g.camera.y);

    // Chỉ vẽ các tile nằm trong vùng camera nhìn thấy.
    const int firstCol = std::max(0, static_cast<int>(camX / kTileSize));
    const int firstRow = std::max(0, static_cast<int>(camY / kTileSize));
    const int lastCol = std::min(kMapCols - 1, static_cast<int>((camX + windowW) / kTileSize));
    const int lastRow = std::min(kMapRows - 1, static_cast<int>((camY + windowH) / kTileSize));

    for (int row = firstRow; row <= lastRow; ++row) {
        for (int col = firstCol; col <= lastCol; ++col) {
            SDL_FRect tile = {
                col * kTileSize - camX,
                row * kTileSize - camY,
                kTileSize,
                kTileSize };

            switch (kMap[row][col]) {
            case 1:
                SDL_SetRenderDrawColor(r, 145, 105, 65, 255); // đất nâu
                break;
            case 2:
                SDL_SetRenderDrawColor(r, 55, 115, 190, 255); // nước xanh dương
                break;
            default:
                SDL_SetRenderDrawColor(r, 75, 145, 75, 255); // cỏ xanh lá
                break;
            }
            SDL_RenderFillRect(r, &tile);

            // Đường viền nhẹ để nhìn rõ lưới ô vuông.
            SDL_SetRenderDrawColor(r, 55, 105, 55, 255);
            SDL_RenderRect(r, &tile);
        }
    }
    // Vẽ điểm đích và đường dẫn nếu ô vuông vàng đang di chuyển theo lệnh chuột phải
    if (g.hasMoveOrder) {
        float startScreenX = g.x - camX;
        float startScreenY = g.y - camY;
        float destScreenX = g.moveTargetX - camX;
        float destScreenY = g.moveTargetY - camY;

        // Vẽ đường thẳng nối từ ô vuông vàng tới điểm đích
        SDL_SetRenderDrawColor(r, 100, 255, 120, 140);
        SDL_RenderLine(r, startScreenX, startScreenY, destScreenX, destScreenY);

        // Vẽ điểm đánh dấu hình chữ thập (+) tại nơi vừa click chuột phải
        SDL_SetRenderDrawColor(r, 100, 255, 120, 255);
        SDL_RenderLine(r, destScreenX - 6.0f, destScreenY, destScreenX + 6.0f, destScreenY);
        SDL_RenderLine(r, destScreenX, destScreenY - 6.0f, destScreenX, destScreenY + 6.0f);
    }

    // Mục tiêu đứng yên trong thế giới; camera khiến nó cuộn theo bản đồ.
    SDL_FRect targetRect = {
        kTargetX - kSquareSize / 2.0f - camX,
        kTargetY - kSquareSize / 2.0f - camY,
        kSquareSize, kSquareSize };
    SDL_SetRenderDrawColor(r, 70, 150, 230, 255);
    SDL_RenderFillRect(r, &targetRect);

    // Viền xanh lá sáng nếu Mục tiêu đang được chọn
    if (g.targetSelected) {
        SDL_FRect outline = { targetRect.x - 3.0f, targetRect.y - 3.0f, targetRect.w + 6.0f, targetRect.h + 6.0f };
        SDL_SetRenderDrawColor(r, 50, 255, 80, 255);
        SDL_RenderRect(r, &outline);
    }

    // Ô vuông vàng (người chơi).
    SDL_FRect playerRect = {
        g.x - kSquareSize / 2.0f - camX,
        g.y - kSquareSize / 2.0f - camY,
        kSquareSize, kSquareSize };
    if (g.touchingTarget) {
        SDL_SetRenderDrawColor(r, 240, 70, 70, 255); // chạm mục tiêu đổi màu đỏ
    }
    else {
        SDL_SetRenderDrawColor(r, 230, 200, 60, 255); // màu mặc định vàng
    }
    SDL_RenderFillRect(r, &playerRect);

    // Viền xanh lá sáng nếu Người chơi đang được chọn
    if (g.playerSelected) {
        SDL_FRect outline = { playerRect.x - 3.0f, playerRect.y - 3.0f, playerRect.w + 6.0f, playerRect.h + 6.0f };
        SDL_SetRenderDrawColor(r, 50, 255, 80, 255);
        SDL_RenderRect(r, &outline);
    }

    // Vẽ khung quét chuột RTS (chuyển từ tọa độ thế giới về tọa độ màn hình)
    if (g.isSelecting) {
        SDL_FRect selectScreenRect = GetNormalizedRect(
            g.selectStartWorldX - camX, g.selectStartWorldY - camY,
            g.selectEndWorldX - camX, g.selectEndWorldY - camY);

        // Nền xanh lá bán trong suốt kiểu game RTS
        SDL_SetRenderDrawColor(r, 50, 220, 80, 50);
        SDL_RenderFillRect(r, &selectScreenRect);

        // Viền khung quét
        SDL_SetRenderDrawColor(r, 50, 255, 80, 220);
        SDL_RenderRect(r, &selectScreenRect);
    }

    SDL_RenderPresent(r);
}

SDL_AppResult SDL_AppInit(void** appstate, int argc, char* argv[]) {
    (void)argc;
    (void)argv;

    SDL_SetAppMetadata("Mini RTS", "0.2", "com.example.minirts");

    if (!SDL_Init(SDL_INIT_VIDEO)) {
        SDL_Log("SDL_Init failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }

    App* app = new App();
    *appstate = app;

    if (!SDL_CreateWindowAndRenderer("Mini RTS - Tilemap & Free Camera",
        kWindowW, kWindowH, SDL_WINDOW_RESIZABLE,
        &app->window, &app->renderer)) {
        SDL_Log("Create window/renderer failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }

    // Bật Blend Mode để vẽ khung quét chuột trong suốt
    SDL_SetRenderDrawBlendMode(app->renderer, SDL_BLENDMODE_BLEND);

    SDL_SetRenderVSync(app->renderer, 1);
    app->lastTicks = SDL_GetTicks();
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppEvent(void* appstate, SDL_Event* event) {
    (void)appstate;

    if (event->type == SDL_EVENT_QUIT) { return SDL_APP_SUCCESS; }
    if (event->type == SDL_EVENT_KEY_DOWN && event->key.key == SDLK_ESCAPE) {
        return SDL_APP_SUCCESS;
    }

    App* app = static_cast<App*>(appstate);
    GameState& g = app->game;

    switch (event->type) {
    case SDL_EVENT_MOUSE_BUTTON_DOWN: // NHẤN CHUỘT
        if (event->button.button == SDL_BUTTON_LEFT) {
            g.isSelecting = true;
            // Lưu tọa độ theo không gian thế giới (cộng thêm tọa độ camera)
            g.selectStartWorldX = event->button.x + g.camera.x;
            g.selectStartWorldY = event->button.y + g.camera.y;
            g.selectEndWorldX = g.selectStartWorldX;
            g.selectEndWorldY = g.selectStartWorldY;
            // Bỏ chọn cũ khi bắt đầu vùng quét mới
            g.playerSelected = false;
            g.targetSelected = false;
        }
        break;
    case SDL_EVENT_MOUSE_BUTTON_UP: // THẢ CHUỘT
        switch (event->button.button) {
        case SDL_BUTTON_LEFT: {
            if (g.isSelecting) g.isSelecting = false;
            break;
        }
        case SDL_BUTTON_RIGHT: {
            // Chuột phải: Ra lệnh di chuyển nếu ô vuông vàng đang được chọn
            if (g.playerSelected) {
                const float half = kSquareSize / 2.0f;
                g.hasMoveOrder = true;
                // Quy đổi tọa độ click trên cửa sổ sang tọa độ thế giới và kẹp trong bản đồ
                g.moveTargetX = std::clamp(event->button.x + g.camera.x, half, kWorldW - half);
                g.moveTargetY = std::clamp(event->button.y + g.camera.y, half, kWorldH - half);
            }
            break;
        }
        default: break;
        }
    default: break;
    }

    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppIterate(void* appstate) {
    App* app = static_cast<App*>(appstate);

    const Uint64 now = SDL_GetTicks();
    float dt = static_cast<float>(now - app->lastTicks) / 1000.0f;
    app->lastTicks = now;
    if (dt > 0.1f) dt = 0.1f;

    int windowW = 00, windowH = 0;
    SDL_GetWindowSize(app->window, &windowW, &windowH);

    // Gom input của khung hình này.
    Input input;
    input.keys = SDL_GetKeyboardState(nullptr);
    SDL_GetMouseState(&input.mouseX, &input.mouseY);

    // Chỉ cuộn bằng mép khi chuột đang ở trong vùng nội dung của cửa sổ.
    const bool hasMouseFocus = (SDL_GetWindowFlags(app->window) & SDL_WINDOW_MOUSE_FOCUS) != 0;
    input.mouseInWindow = hasMouseFocus &&
        input.mouseX >= 0.0f && input.mouseY >= 0.0f &&
        input.mouseX < static_cast<float>(windowW) &&
        input.mouseY < static_cast<float>(windowH);

    Update(app->game, input, dt, windowW, windowH);
    Render(app->renderer, app->game, windowW, windowH);
    return SDL_APP_CONTINUE;
}

void SDL_AppQuit(void* appstate, SDL_AppResult result) {
    (void)result;
    App* app = static_cast<App*>(appstate);
    if (app) {
        if (app->renderer) SDL_DestroyRenderer(app->renderer);
        if (app->window) SDL_DestroyWindow(app->window);
        delete app;
    }
}