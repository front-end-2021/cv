#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>

#include <algorithm>
#include <filesystem>
#include <string>

#include "Utils.h"
#include "camera/camera.h"
#include "game/Commands.h"
#include "game/Game.h"
#include "game/GameState.h"
#include "game/Orders.h"
#include "game/Render.h"
#include "game/Selection.h"
#include "game/World.h"
#include "ui/Menu.h"

constexpr int kWindowW = 1280;
constexpr int kWindowH = 720;

enum class AppScreen { MapMenu, Game };

struct App {
    SDL_Window* window = nullptr;
    SDL_Renderer* renderer = nullptr;
    Uint64 lastTicks = 0;
    GameState game;
    AppScreen screen = AppScreen::MapMenu;
    MenuState menu;
};

static bool StartSelectedMap(App& app) {
    MenuState& menu = app.menu;
    if (menu.selectedMap < 0 || menu.selectedMap >= static_cast<int>(menu.maps.size())) return false;
    const MapEntry& selected = menu.maps[static_cast<size_t>(menu.selectedMap)];
    if (!LoadTileMap(selected.path, app.game.map)) {
        menu.message = "Map khong hop le: " + selected.name;
        return false;
    }
    InitializeWorld(app.game);
    app.lastTicks = SDL_GetTicks();
    app.screen = AppScreen::Game;
    SDL_SetWindowMouseGrab(app.window, true); // Khóa chuột vào cửa sổ khi bắt đầu chơi
    return true;
}

// Nạp bảng loại đơn vị từ Data/units.txt; thiếu hoặc lỗi thì dùng bảng dự phòng và báo trên menu.
static void LoadUnitTypes(App& app) {
    const std::filesystem::path path = std::filesystem::path(Utils::AssetPath("Data")) / "units.txt";
    std::string error;
    if (app.game.unitTypes.LoadFromFile(path.string(), &error)) return;

    SDL_Log("Khong doc duoc %s (%s) -> dung bang chi so mac dinh.", path.string().c_str(), error.c_str());
    app.game.unitTypes.LoadBuiltInDefaults();
    if (app.menu.message.empty()) app.menu.message = "Data/units.txt loi: " + error + " (dung chi so mac dinh)";
}

// Nạp bảng loại công trình từ Data/buildings.txt; thiếu hoặc lỗi (kể cả nhắc tới loại đơn vị không có) thì dùng bảng dự phòng.
// Phải gọi SAU LoadUnitTypes vì cần đối chiếu tên loại đơn vị.
static void LoadBuildingTypes(App& app) {
    const std::filesystem::path path = std::filesystem::path(Utils::AssetPath("Data")) / "buildings.txt";
    std::string error;
    if (app.game.buildingTypes.LoadFromFile(path.string(), &error) &&
        app.game.buildingTypes.Validate(app.game.unitTypes, &error)) return;

    SDL_Log("Khong doc duoc %s (%s) -> dung bang cong trinh mac dinh.", path.string().c_str(), error.c_str());
    app.game.buildingTypes.LoadBuiltInDefaults();
    if (app.menu.message.empty()) app.menu.message = "Data/buildings.txt loi: " + error + " (dung chi so mac dinh)";
}

SDL_AppResult SDL_AppInit(void** appstate, int argc, char* argv[]) {
    (void)argc;
    (void)argv;

    SDL_SetAppMetadata("Mini RTS", "0.4", "com.example.minirts");

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

    RefreshMapList(app->menu);
    LoadUnitTypes(*app);
    LoadBuildingTypes(*app);
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppEvent(void* appstate, SDL_Event* event) {
    App* app = static_cast<App*>(appstate);
    if (event->type == SDL_EVENT_QUIT) return SDL_APP_SUCCESS;
    if (!app) return SDL_APP_CONTINUE;

    if (event->type == SDL_EVENT_KEY_DOWN && event->key.key == SDLK_ESCAPE) {
        if (app->screen == AppScreen::Game) {
            if (app->game.placement.active) { // Esc thoát chế độ đặt nhà trước đã
                CancelPlacement(app->game);
                return SDL_APP_CONTINUE;
            }
            if (SDL_GetWindowMouseGrab(app->window)) { // Nếu chuột đang bị khóa -> thả chuột ra ngoài
                SDL_SetWindowMouseGrab(app->window, false);
                EndSelection(app->game);
            }
            else {
                app->screen = AppScreen::MapMenu;
                RefreshMapList(app->menu);
            }
            return SDL_APP_CONTINUE;
        }
        return SDL_APP_SUCCESS;
    }

    if (app->screen == AppScreen::MapMenu) {
        if (event->type == SDL_EVENT_KEY_DOWN) {
            if (event->key.key == SDLK_DOWN) {
                int w = 0, h = 0; SDL_GetWindowSize(app->window, &w, &h);
                MenuSelectNext(app->menu, h);
            } else if (event->key.key == SDLK_UP) {
                MenuSelectPrev(app->menu);
            } else if (event->key.key == SDLK_RETURN || event->key.key == SDLK_KP_ENTER) {
                StartSelectedMap(*app);
            } else if (event->key.key == SDLK_R) {
                RefreshMapList(app->menu);
            }
        } else if (event->type == SDL_EVENT_MOUSE_BUTTON_DOWN && event->button.button == SDL_BUTTON_LEFT) {
            int windowW = 0, windowH = 0;
            SDL_GetWindowSize(app->window, &windowW, &windowH);
            const int hit = MenuHitMapRow(app->menu, event->button.x, event->button.y, windowW, windowH);
            if (hit >= 0) app->menu.selectedMap = hit;
            if (MenuHitStartButton(event->button.x, event->button.y, windowW, windowH)) StartSelectedMap(*app);
        }
        return SDL_APP_CONTINUE;
    }

    GameState& g = app->game;
    if (event->type == SDL_EVENT_KEY_DOWN && event->key.key == SDLK_R) {
        InitializeWorld(g); // chơi lại map hiện tại
        return SDL_APP_CONTINUE;
    }
    if (event->type == SDL_EVENT_KEY_DOWN && !event->key.repeat) {
        // Kinh tế & xây dựng (xem game/Commands.h).
        const SDL_Keycode key = event->key.key;
        if (key == SDLK_B) { HandleBuildKey(g); return SDL_APP_CONTINUE; }
        if (key == SDLK_DELETE || key == SDLK_BACKSPACE) { HandleCancelKey(g); return SDL_APP_CONTINUE; }
        if (key >= SDLK_1 && key <= SDLK_9) { HandleNumberKey(g, static_cast<int>(key - SDLK_1) + 1); return SDL_APP_CONTINUE; }
    }
    if (event->type == SDL_EVENT_KEY_UP && event->key.key == SDLK_BACKSLASH) {
        g.debugMode = !g.debugMode;
        return SDL_APP_CONTINUE;
    }
    switch (event->type) {
        case SDL_EVENT_MOUSE_BUTTON_DOWN:
            if (event->button.button == SDL_BUTTON_LEFT) {
                if (!SDL_GetWindowMouseGrab(app->window)) {
                    SDL_SetWindowMouseGrab(app->window, true); // Khóa chuột trở lại khi người chơi bấm vào cửa sổ game
                }
                if (g.placement.active) {
                    UpdatePlacement(g, event->button.x, event->button.y);
                    ConfirmPlacement(g); // đặt móng tại bóng mờ (không bắt đầu kéo chọn quân)
                }
                else {
                    BeginSelection(g, event->button.x, event->button.y);
                }
            }
            break;
        case SDL_EVENT_MOUSE_BUTTON_UP:
            if (event->button.button == SDL_BUTTON_LEFT) {
                EndSelection(g);
            } else if (event->button.button == SDL_BUTTON_RIGHT) {
                if (g.placement.active) {
                    CancelPlacement(g);
                }
                else {
                    // Tấn công / đào / xây / nộp hàng / đi / đặt điểm tập kết tùy thứ nằm dưới con trỏ (xem IssueSmartOrder).
                    IssueSmartOrder(g, event->button.x + g.camera.x, event->button.y + g.camera.y);
                }
            }
            break;
        default: break;
    }
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppIterate(void* appstate) {
    App* app = static_cast<App*>(appstate);
    if (!app) return SDL_APP_FAILURE;

    int windowW = 0, windowH = 0;
    SDL_GetWindowSize(app->window, &windowW, &windowH);

    if (app->screen == AppScreen::MapMenu) {
        DrawMenu(app->renderer, app->menu, windowW, windowH);
        return SDL_APP_CONTINUE;
    }

    const Uint64 now = SDL_GetTicks();
    const float frameDt = static_cast<float>(now - app->lastTicks) / 1000.0f;
    app->lastTicks = now;

    // Gom input của khung hình này.
    Input input;
    input.keys = SDL_GetKeyboardState(nullptr);
    SDL_GetMouseState(&input.mouseX, &input.mouseY);

    // Chỉ cuộn bằng mép khi chuột đang ở trong vùng nội dung của cửa sổ.
    const bool isMouseGrabbed = SDL_GetWindowMouseGrab(app->window);
    const bool hasMouseFocus = (SDL_GetWindowFlags(app->window) & SDL_WINDOW_MOUSE_FOCUS) != 0;
    input.mouseInWindow = isMouseGrabbed && hasMouseFocus &&
        input.mouseX >= 0.0f && input.mouseY >= 0.0f &&
        input.mouseX < static_cast<float>(windowW) &&
        input.mouseY < static_cast<float>(windowH);

    UpdateGameFrame(app->game, input, frameDt, windowW, windowH);
    RenderGame(app->renderer, app->game, windowW, windowH);
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
