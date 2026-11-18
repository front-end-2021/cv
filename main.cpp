#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>

#include <algorithm>
#include <cmath>
#include <vector>
#include "camera/camera.h"
#include "entity/selectable.h"
#include "Pathfinder.h"
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
Target target{ 12.0f * kTileSize + kTileSize / 2.0f , 6.0f * kTileSize + kTileSize / 2.0f, kSquareSize };

// Khởi tạo danh sách 6 ô vuông vàng xếp sẵn trên bản đồ
std::vector<Player> players = {
    { 300.0f, 300.0f, kSquareSize },
    { 360.0f, 300.0f, kSquareSize },
    { 420.0f, 300.0f, kSquareSize },
    { 300.0f, 360.0f, kSquareSize },
    { 360.0f, 360.0f, kSquareSize },
    { 420.0f, 360.0f, kSquareSize }
};

struct GameState {
    Camera camera{ 0.0f, 0.0f };                    // Camera: góc trên-trái của vùng nhìn thấy, tính theo tọa độ thế giới
    // ---- Trạng thái quét chuột chọn (lưu bằng tọa độ thế giới) ----
    bool isSelecting = false;
    float selectStartWorldX = 0.0f;
    float selectStartWorldY = 0.0f;
    float selectEndWorldX = 0.0f;
    float selectEndWorldY = 0.0f;
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

// Hàm chia vị trí đội hình cho các Player đang được chọn
static void IssueFormationMoveOrder(std::vector<Player>& unitList, float targetWorldX, float targetWorldY) {
    std::vector<Player*> selectedUnits;
    for (auto& p : unitList) {
        if (p.selected) selectedUnits.push_back(&p);
    }
    if (selectedUnits.empty()) return;

    const int count = static_cast<int>(selectedUnits.size());
    const int cols = static_cast<int>(std::ceil(std::sqrt(count)));
    const int rows = static_cast<int>(std::ceil(static_cast<float>(count) / cols));
    const float spacing = kSquareSize + 14.0f;

    const float totalWidth = (cols - 1) * spacing;
    const float totalHeight = (rows - 1) * spacing;
    const float startX = targetWorldX - totalWidth / 2.0f;
    const float startY = targetWorldY - totalHeight / 2.0f;
    const float half = kSquareSize / 2.0f;

    for (int i = 0; i < count; ++i) {
        int r = i / cols;
        int c = i % cols;
        int unitsInThisRow = (r == rows - 1) ? (count - r * cols) : cols;
        float rowOffsetX = (cols - unitsInThisRow) * spacing / 2.0f;

        float destX = std::clamp(startX + c * spacing + rowOffsetX, half, kWorldW - half);
        float destY = std::clamp(startY + r * spacing, half, kWorldH - half);

        // Tìm đường A* vòng qua nước tới ô vị trí đội hình
        selectedUnits[i]->path = Pathfinder::FindPath(
            selectedUnits[i]->x, selectedUnits[i]->y,
            destX, destY,
            kMapRows, kMapCols, kTileSize, &kMap[0][0]);
    }
}

// Hàm đẩy nhẹ các ô vuông ra nếu chúng đè lên nhau
static void ResolveUnitCollisions(std::vector<Player>& unitList) {
    const float minDist = kSquareSize;// +1.0f;
    for (size_t i = 0; i < unitList.size(); ++i) {
        if (!unitList[i].path.empty()) return; // !iIdle

        for (size_t j = i + 1; j < unitList.size(); ++j) {
            bool jIdle = unitList[j].path.empty();// && !(unitList[j].selected);
            if (!jIdle) return;

            float dx = unitList[j].x - unitList[i].x;
            float dy = unitList[j].y - unitList[i].y;
            float dist = dx * dx + dy * dy;
            if (minDist * minDist <= dist) { continue; }
            
            if(dist < 0.001f) { dx = 1.0f; dy = 0.0f; dist = 1.0f; }
            else { dist = std::sqrt(dist); }
            // Đẩy toàn bộ phần chồng lấn sang đơn vị j để giữ nguyên vị trí đơn vị i
            float overlap = (minDist - dist);
            float nx = dx / dist;
            float ny = dy / dist;

            float nextJX = unitList[j].x + nx * overlap;
            float nextJY = unitList[j].y + ny * overlap;
            if (Pathfinder::CanBoxStandAt(nextJX, nextJY, kSquareSize, kMapRows, kMapCols, kTileSize, &kMap[0][0])) {
                unitList[j].x = std::floor(nextJX);
                unitList[j].y = std::floor(nextJY);
            }
        }
    }
}

static void Update(GameState& g, const Input& in, float dt, int windowW, int windowH) {
    const float half = kSquareSize / 2.0f;
    // ---- Ô vuông vàng: chỉ di chuyển bằng WASD ----
    float wasdX = Utils::Axis(in.keys, SDL_SCANCODE_A, SDL_SCANCODE_D);
    float wasdY = Utils::Axis(in.keys, SDL_SCANCODE_W, SDL_SCANCODE_S);
    bool hasWasd = (wasdX != 0.0f || wasdY != 0.0f);
    if (hasWasd) {
        // Nếu người chơi bấm WASD, hủy lệnh di chuyển bằng chuột hiện tại
        Utils::NormalizeDirection(wasdX, wasdY);
    }
    // 1. Cập nhật di chuyển cho từng Player
    for (auto& p : players) {
        if (hasWasd && p.selected) {
            p.path.clear(); // Hủy đường A* nếu người chơi tự lái bằng WASD
            float nextX = p.x + wasdX * kSpeed * dt;
            float nextY = p.y + wasdY * kSpeed * dt;

            // Tách trục X và Y để trượt dọc mép hồ nước
            if (Pathfinder::CanBoxStandAt(nextX, p.y, kSquareSize, kMapRows, kMapCols, kTileSize, &kMap[0][0])) {
                p.x = nextX;
            }
            if (Pathfinder::CanBoxStandAt(p.x, nextY, kSquareSize, kMapRows, kMapCols, kTileSize, &kMap[0][0])) {
                p.y = nextY;
            }
        }
        else if (!p.path.empty()) {
            // Di chuyển lần lượt qua từng điểm mốc trong path
            Waypoint targetWp = p.path.front();
            float toTargetX = targetWp.x - p.x;
            float toTargetY = targetWp.y - p.y;
            float dist = std::sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
            float stepDist = kSpeed * dt;

            if (dist <= stepDist) {
                p.x = targetWp.x;
                p.y = targetWp.y;
                p.path.erase(p.path.begin()); // Đã tới mốc -> chuyển sang mốc kế tiếp
            }
            else {
                p.x += (toTargetX / dist) * stepDist;
                p.y += (toTargetY / dist) * stepDist;
            }
        }
    }

    // 2. Xử lý tách va chạm để các ô không đè lên nhau trên đường đi
    ResolveUnitCollisions(players);

    // 3. Kẹp biên bản đồ và kiểm tra chạm Target cho từng Player
    for (auto& p : players) {
        p.x = std::clamp(p.x, half, kWorldW - half);
        p.y = std::clamp(p.y, half, kWorldH - half);

        p.touchingTarget =
            std::abs(p.x - target.x) < kSquareSize &&
            std::abs(p.y - target.y) < kSquareSize;
    }
    // 4. Cập nhật Camera
    g.camera.UpdateCamera(in, dt, windowW, windowH, kWorldW, kWorldH);

    if (in.keys[SDL_SCANCODE_SPACE] && !players.empty()) {
        // Đưa camera về ô vuông đầu tiên đang được chọn (hoặc ô đầu danh sách)
        const Player* focusUnit = &players[0];
        for (const auto& p : players) {
            if (p.selected) {
                focusUnit = &p;
                break;
            }
        }
        g.camera.ClampCamera(focusUnit->x - windowW / 2.0f, focusUnit->y - windowH / 2.0f, windowW, windowH, kWorldW, kWorldH);
    }
    // 5. Cập nhật quét chuột chọn hàng loạt
    if (g.isSelecting) {
        g.selectEndWorldX = in.mouseX + g.camera.x;
        g.selectEndWorldY = in.mouseY + g.camera.y;

        SDL_FRect selectionWorldRect = GetNormalizedRect(
            g.selectStartWorldX, g.selectStartWorldY,
            g.selectEndWorldX, g.selectEndWorldY);

        if (selectionWorldRect.w < 3.0f && selectionWorldRect.h < 3.0f) {
            selectionWorldRect.w = 3.0f;
            selectionWorldRect.h = 3.0f;
        }

        SDL_FRect targetWorldRect = { target.x - half, target.y - half, kSquareSize, kSquareSize };
        target.selected = SDL_HasRectIntersectionFloat(&selectionWorldRect, &targetWorldRect);

        // Duyệt qua toàn bộ vector players để chọn những ô nằm trong khung quét
        for (auto& p : players) {
            SDL_FRect playerWorldRect = { p.x - half, p.y - half, kSquareSize, kSquareSize };
            p.selected = SDL_HasRectIntersectionFloat(&selectionWorldRect, &playerWorldRect);
        }
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
    // Vẽ đường đi A* của từng Player
    for (const auto& p : players) {
        if (!p.path.empty()) {
            float prevX = p.x - camX;
            float prevY = p.y - camY;

            SDL_SetRenderDrawColor(r, 100, 255, 120, 140);
            for (const auto& wp : p.path) {
                float nextX = wp.x - camX;
                float nextY = wp.y - camY;
                SDL_RenderLine(r, prevX, prevY, nextX, nextY);
                prevX = nextX;
                prevY = nextY;
            }

            // Vẽ dấu (+) ở điểm đích cuối cùng
            SDL_SetRenderDrawColor(r, 100, 255, 120, 230);
            SDL_RenderLine(r, prevX - 5.0f, prevY, prevX + 5.0f, prevY);
            SDL_RenderLine(r, prevX, prevY - 5.0f, prevX, prevY + 5.0f);
        }
    }

    target.Render(r, camX, camY);// Mục tiêu đứng yên trong thế giới; camera khiến nó cuộn theo bản đồ.
    
    // Vẽ tất cả các Player
    for (auto& p : players) { p.Render(r, camX, camY); }


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
            target.selected = false;
            for (auto& p : players) { p.selected = false; }
        }
        break;
    case SDL_EVENT_MOUSE_BUTTON_UP: // THẢ CHUỘT
        if (event->button.button == SDL_BUTTON_LEFT) {
            if (g.isSelecting) g.isSelecting = false;
        }
        else if (event->button.button == SDL_BUTTON_RIGHT) {
            // Ra lệnh di chuyển đội hình tới vị trí chuột phải
            float clickWorldX = event->button.x + g.camera.x;
            float clickWorldY = event->button.y + g.camera.y;
            IssueFormationMoveOrder(players, clickWorldX, clickWorldY);
        }
        break;
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