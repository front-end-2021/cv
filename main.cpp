#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>

#include <algorithm>
#include <filesystem>
#include <cmath>
#include <cctype>
#include <vector>
#include <fstream>
#include <sstream>
#include <string>
#include <utility>
#include "camera/camera.h"
#include "entity/selectable.h"
#include "Pathfinder.h"
#include "Utils.h"

constexpr int kWindowW = 1280;
constexpr int kWindowH = 720;
constexpr float kTileSize = 64.0f;
constexpr float kSquareSize = 40.0f;
constexpr float kSpeed = 300.0f; // tốc độ ô vuông vàng (pixel/giây)

// Map được nạp từ map.txt: 0 = cỏ, 1 = đất, 2 = nước.
int kMapRows = 0;
int kMapCols = 0;
std::vector<int> kMap;

static bool LoadMap(const std::string& filePath) {
    std::ifstream file(filePath);
    if (!file.is_open()) {
        SDL_Log("Khong the mo file map: %s", filePath.c_str());
        return false;
    }

    std::vector<int> loadedMap;
    std::string line;
    int rows = 0;
    int cols = 0;

    while (std::getline(file, line)) {
        const auto first = line.find_first_not_of(" \t\r");
        if (first == std::string::npos || line[first] == '#') continue;

        std::istringstream stream(line);
        std::vector<int> row;
        int tile = 0;
        while (stream >> tile) {
            if (tile < 0 || tile > 2) {
                SDL_Log("Gia tri tile khong hop le (chi chap nhan 0, 1, 2).");
                return false;
            }
            row.push_back(tile);
        }
        if (!stream.eof() || row.empty()) {
            SDL_Log("Dong map.txt chua du lieu khong hop le.");
            return false;
        }
        if (cols == 0) cols = static_cast<int>(row.size());
        if (static_cast<int>(row.size()) != cols) {
            SDL_Log("Cac dong trong map.txt phai co cung so cot.");
            return false;
        }
        loadedMap.insert(loadedMap.end(), row.begin(), row.end());
        ++rows;
    }

    if (rows == 0 || cols == 0) {
        SDL_Log("map.txt rong hoac khong co du lieu.");
        return false;
    }

    kMap = std::move(loadedMap);
    kMapRows = rows;
    kMapCols = cols;
    return true;
}

float kWorldW = 0.0f;
float kWorldH = 0.0f;
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

struct MapEntry {
    std::string name;
    std::string path;
};

enum class AppScreen { MapMenu, Game };

struct App {
    SDL_Window* window = nullptr;
    SDL_Renderer* renderer = nullptr;
    Uint64 lastTicks = 0;
    GameState game;
    AppScreen screen = AppScreen::MapMenu;
    std::vector<MapEntry> maps;
    int selectedMap = -1;
    int mapScroll = 0;
    std::string menuMessage;
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
            kMapRows, kMapCols, kTileSize, kMap.data());
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
            if (Pathfinder::CanBoxStandAt(nextJX, nextJY, kSquareSize, kMapRows, kMapCols, kTileSize, kMap.data())) {
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
            if (Pathfinder::CanBoxStandAt(nextX, p.y, kSquareSize, kMapRows, kMapCols, kTileSize, kMap.data())) {
                p.x = nextX;
            }
            if (Pathfinder::CanBoxStandAt(p.x, nextY, kSquareSize, kMapRows, kMapCols, kTileSize, kMap.data())) {
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

            switch (kMap[row * kMapCols + col]) {
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

static SDL_FRect GetMapRowRect(int index, int windowW) {
    const float width = std::min(620.0f, static_cast<float>(windowW) - 60.0f);
    const float x = (windowW - width) / 2.0f;
    return { x, 170.0f + index * 52.0f, width, 42.0f };
}

static SDL_FRect GetStartButtonRect(int windowW, int windowH) {
    const float width = 220.0f;
    return { (windowW - width) / 2.0f, static_cast<float>(windowH) - 105.0f, width, 54.0f };
}

static void DrawMenu(App& app, int windowW, int windowH) {
    SDL_Renderer* r = app.renderer;
    SDL_SetRenderDrawColor(r, 18, 25, 32, 255);
    SDL_RenderClear(r);

    SDL_SetRenderDrawColor(r, 35, 48, 58, 255);
    SDL_FRect panel{ (windowW - 760.0f) / 2.0f, 35.0f, 760.0f,
        static_cast<float>(windowH) - 70.0f };
    if (panel.x < 10.0f) panel.x = 10.0f;
    panel.w = std::min(760.0f, static_cast<float>(windowW) - 20.0f);
    SDL_RenderFillRect(r, &panel);

    SDL_SetRenderDrawColor(r, 230, 235, 240, 255);
    SDL_RenderDebugText(r, panel.x + 28.0f, 65.0f, "MINI RTS - SELECT MAP");
    SDL_SetRenderDrawColor(r, 175, 190, 200, 255);
    SDL_RenderDebugText(r, panel.x + 28.0f, 105.0f, "Choose a map in the Maps folder:");

    const int maxVisible = std::max(0, static_cast<int>((windowH - 300) / 52));
    const int endIndex = std::min(static_cast<int>(app.maps.size()), app.mapScroll + maxVisible);
    for (int i = app.mapScroll; i < endIndex; ++i) {
        const int visibleRow = i - app.mapScroll;
        SDL_FRect row = GetMapRowRect(visibleRow, windowW);
        const bool selected = i == app.selectedMap;
        SDL_SetRenderDrawColor(r, selected ? 65 : 48, selected ? 105 : 62,
            selected ? 75 : 78, 255);
        SDL_RenderFillRect(r, &row);
        SDL_SetRenderDrawColor(r, selected ? 150 : 95, selected ? 230 : 115,
            selected ? 165 : 130, 255);
        SDL_RenderRect(r, &row);
        SDL_SetRenderDrawColor(r, 240, 240, 240, 255);
        const std::string label = (selected ? ">  " : "   ") + app.maps[i].name;
        SDL_RenderDebugText(r, row.x + 16.0f, row.y + 15.0f, label.c_str());
    }

    if (!app.menuMessage.empty()) {
        SDL_SetRenderDrawColor(r, 255, 190, 100, 255);
        SDL_RenderDebugText(r, panel.x + 28.0f, 135.0f, app.menuMessage.c_str());
    }

    SDL_FRect start = GetStartButtonRect(windowW, windowH);
    const bool canStart = app.selectedMap >= 0 && app.selectedMap < static_cast<int>(app.maps.size());
    SDL_SetRenderDrawColor(r, canStart ? 45 : 65, canStart ? 135 : 65,
        canStart ? 75 : 65, 255);
    SDL_RenderFillRect(r, &start);
    SDL_SetRenderDrawColor(r, 180, 230, 190, 255);
    SDL_RenderRect(r, &start);
    SDL_SetRenderDrawColor(r, 255, 255, 255, 255);
    SDL_RenderDebugText(r, start.x + 78.0f, start.y + 22.0f, "START GAME");

    SDL_SetRenderDrawColor(r, 175, 190, 200, 255);
    SDL_RenderDebugText(r, panel.x + 28.0f, static_cast<float>(windowH) - 48.0f,
        "Click a map, then START. Add .txt maps to Maps folder.");
    SDL_RenderPresent(r);
}

// Đặt lại kích thước thế giới và vị trí các đối tượng sau khi nạp map.
static void InitializeWorldForLoadedMap(GameState& game) {
    kWorldW = kMapCols * kTileSize;
    kWorldH = kMapRows * kTileSize;

    target.x = kWorldW / 2.0f;
    target.y = kWorldH / 2.0f;
    target.selected = false;
    game.camera.x = 0.0f;
    game.camera.y = 0.0f;
    game.isSelecting = false;

    const float half = kSquareSize / 2.0f;
    const float spawnX[] = { 2.5f, 3.5f, 4.5f, 2.5f, 3.5f, 4.5f };
    const float spawnY[] = { 2.5f, 2.5f, 2.5f, 3.5f, 3.5f, 3.5f };
    for (size_t i = 0; i < players.size(); ++i) {
        players[i].x = std::clamp(spawnX[i] * kTileSize, half, std::max(half, kWorldW - half));
        players[i].y = std::clamp(spawnY[i] * kTileSize, half, std::max(half, kWorldH - half));
        players[i].selected = false;
        players[i].touchingTarget = false;
        players[i].path.clear();
    }
}

static bool StartSelectedMap(App& app) {
    if (app.selectedMap < 0 || app.selectedMap >= static_cast<int>(app.maps.size())) return false;
    const MapEntry& selected = app.maps[app.selectedMap];
    if (!LoadMap(selected.path)) {
        app.menuMessage = "Map khong hop le: " + selected.name;
        return false;
    }
    InitializeWorldForLoadedMap(app.game);
    app.lastTicks = SDL_GetTicks();
    app.screen = AppScreen::Game;
    return true;
}

// Thư mục Maps nằm cạnh file thực thi. Chỉ liệt kê các file .txt.
static std::string GetMapsDirectory() {
    const char* basePath = SDL_GetBasePath();
    if (basePath) {
        std::string path = std::string(basePath) + "Maps";
        return path;
    }
    return "Maps";
}

static void RefreshMapList(App& app) {
    namespace fs = std::filesystem;
    app.maps.clear();
    const fs::path mapsDir = GetMapsDirectory();
    std::error_code ec;
    fs::create_directories(mapsDir, ec);
    if (ec) {
        app.menuMessage = "Khong the tao/ truy cap thu muc Maps.";
        return;
    }

    for (fs::directory_iterator it(mapsDir, ec), end; !ec && it != end; it.increment(ec)) {
        if (!it->is_regular_file(ec) || ec) continue;
        std::string extension = it->path().extension().string();
        std::transform(extension.begin(), extension.end(), extension.begin(),
            [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
        if (extension == ".txt") {
            app.maps.push_back({ it->path().stem().string(), it->path().string() });
        }
    }
    std::sort(app.maps.begin(), app.maps.end(), [](const MapEntry& a, const MapEntry& b) {
        return a.name < b.name;
        });
    app.selectedMap = app.maps.empty() ? -1 : 0;
    app.mapScroll = 0;
    if (app.maps.empty()) app.menuMessage = "Khong tim thay map .txt trong thu muc Maps.";
    else app.menuMessage.clear();
}

SDL_AppResult SDL_AppInit(void** appstate, int argc, char* argv[]) {
    (void)argc;
    (void)argv;

    SDL_SetAppMetadata("Mini RTS", "0.3", "com.example.minirts");

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

    RefreshMapList(*app);
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppEvent(void* appstate, SDL_Event* event) {
    App* app = static_cast<App*>(appstate);
    if (event->type == SDL_EVENT_QUIT) return SDL_APP_SUCCESS;
    if (!app) return SDL_APP_CONTINUE;

    if (event->type == SDL_EVENT_KEY_DOWN && event->key.key == SDLK_ESCAPE) {
        if (app->screen == AppScreen::Game) {
            app->screen = AppScreen::MapMenu;
            RefreshMapList(*app);
            return SDL_APP_CONTINUE;
        }
        return SDL_APP_SUCCESS;
    }

    if (app->screen == AppScreen::MapMenu) {
        if (event->type == SDL_EVENT_KEY_DOWN) {
            if (event->key.key == SDLK_DOWN && !app->maps.empty()) {
                app->selectedMap = std::min(app->selectedMap + 1, static_cast<int>(app->maps.size()) - 1);
                int w = 0, h = 0; SDL_GetWindowSize(app->window, &w, &h);
                const int visible = std::max(1, static_cast<int>((h - 300) / 52));
                if (app->selectedMap >= app->mapScroll + visible) app->mapScroll = app->selectedMap - visible + 1;
            } else if (event->key.key == SDLK_UP && !app->maps.empty()) {
                app->selectedMap = std::max(0, app->selectedMap - 1);
                if (app->selectedMap < app->mapScroll) app->mapScroll = app->selectedMap;
            } else if (event->key.key == SDLK_RETURN || event->key.key == SDLK_KP_ENTER) {
                StartSelectedMap(*app);
            } else if (event->key.key == SDLK_R) {
                RefreshMapList(*app);
            }
        } else if (event->type == SDL_EVENT_MOUSE_BUTTON_DOWN && event->button.button == SDL_BUTTON_LEFT) {
            int windowW = 0, windowH = 0;
            SDL_GetWindowSize(app->window, &windowW, &windowH);
            const float mx = event->button.x;
            const float my = event->button.y;
            const int visible = std::max(0, static_cast<int>((windowH - 300) / 52));
            for (int rowIndex = 0; rowIndex < visible; ++rowIndex) {
                const int mapIndex = app->mapScroll + rowIndex;
                if (mapIndex >= static_cast<int>(app->maps.size())) break;
                SDL_FRect row = GetMapRowRect(rowIndex, windowW);
                SDL_FPoint point{ mx, my };
                if (SDL_PointInRectFloat(&point, &row)) {
                    app->selectedMap = mapIndex;
                    break;
                }
            }
            SDL_FRect start = GetStartButtonRect(windowW, windowH);
            SDL_FPoint point{ mx, my };
            if (SDL_PointInRectFloat(&point, &start)) StartSelectedMap(*app);
        }
        return SDL_APP_CONTINUE;
    }

    GameState& g = app->game;
    switch (event->type) {
    case SDL_EVENT_MOUSE_BUTTON_DOWN:
        if (event->button.button == SDL_BUTTON_LEFT) {
            g.isSelecting = true;
            g.selectStartWorldX = event->button.x + g.camera.x;
            g.selectStartWorldY = event->button.y + g.camera.y;
            g.selectEndWorldX = g.selectStartWorldX;
            g.selectEndWorldY = g.selectStartWorldY;
            target.selected = false;
            for (auto& p : players) p.selected = false;
        }
        break;
    case SDL_EVENT_MOUSE_BUTTON_UP:
        if (event->button.button == SDL_BUTTON_LEFT) {
            if (g.isSelecting) g.isSelecting = false;
        } else if (event->button.button == SDL_BUTTON_RIGHT) {
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
    if (!app) return SDL_APP_FAILURE;
    if (app->screen == AppScreen::MapMenu) {
        int menuW = 0, menuH = 0;
        SDL_GetWindowSize(app->window, &menuW, &menuH);
        DrawMenu(*app, menuW, menuH);
        return SDL_APP_CONTINUE;
    }

    const Uint64 now = SDL_GetTicks();
    float dt = static_cast<float>(now - app->lastTicks) / 1000.0f;
    app->lastTicks = now;
    if (dt > 0.1f) dt = 0.1f;

    int windowW = 0, windowH = 0;
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
