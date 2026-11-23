#include "ui/Menu.h"
#include <algorithm>
#include <cctype>
#include <filesystem>
#include "Utils.h"

namespace {
    SDL_FRect GetMapRowRect(int index, int windowW) {
        const float width = std::min(620.0f, static_cast<float>(windowW) - 60.0f);
        const float x = (windowW - width) / 2.0f;
        return { x, 170.0f + index * 52.0f, width, 42.0f };
    }

    SDL_FRect GetStartButtonRect(int windowW, int windowH) {
        const float width = 220.0f;
        return { (windowW - width) / 2.0f, static_cast<float>(windowH) - 105.0f, width, 54.0f };
    }
}

int MenuVisibleRows(int windowH) {
    return std::max(0, (windowH - 300) / 52);
}

void MenuSelectNext(MenuState& menu, int windowH) {
    if (menu.maps.empty()) return;
    menu.selectedMap = std::min(menu.selectedMap + 1, static_cast<int>(menu.maps.size()) - 1);
    const int visible = std::max(1, MenuVisibleRows(windowH));
    if (menu.selectedMap >= menu.mapScroll + visible) menu.mapScroll = menu.selectedMap - visible + 1;
}

void MenuSelectPrev(MenuState& menu) {
    if (menu.maps.empty()) return;
    menu.selectedMap = std::max(0, menu.selectedMap - 1);
    if (menu.selectedMap < menu.mapScroll) menu.mapScroll = menu.selectedMap;
}

int MenuHitMapRow(const MenuState& menu, float mx, float my, int windowW, int windowH) {
    const int visible = MenuVisibleRows(windowH);
    const SDL_FPoint point{ mx, my };
    for (int rowIndex = 0; rowIndex < visible; ++rowIndex) {
        const int mapIndex = menu.mapScroll + rowIndex;
        if (mapIndex >= static_cast<int>(menu.maps.size())) break;
        const SDL_FRect row = GetMapRowRect(rowIndex, windowW);
        if (SDL_PointInRectFloat(&point, &row)) return mapIndex;
    }
    return -1;
}

bool MenuHitStartButton(float mx, float my, int windowW, int windowH) {
    const SDL_FPoint point{ mx, my };
    const SDL_FRect start = GetStartButtonRect(windowW, windowH);
    return SDL_PointInRectFloat(&point, &start);
}

void RefreshMapList(MenuState& menu) {
    namespace fs = std::filesystem;
    menu.maps.clear();
    const fs::path mapsDir = Utils::AssetPath("Maps");
    std::error_code ec;
    fs::create_directories(mapsDir, ec);
    if (ec) {
        menu.message = "Khong the tao/ truy cap thu muc Maps.";
        return;
    }

    for (fs::directory_iterator it(mapsDir, ec), end; !ec && it != end; it.increment(ec)) {
        if (!it->is_regular_file(ec) || ec) continue;
        std::string extension = it->path().extension().string();
        std::transform(extension.begin(), extension.end(), extension.begin(),
            [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
        if (extension == ".txt") {
            menu.maps.push_back({ it->path().stem().string(), it->path().string() });
        }
    }
    std::sort(menu.maps.begin(), menu.maps.end(), [](const MapEntry& a, const MapEntry& b) {
        return a.name < b.name;
        });
    menu.selectedMap = menu.maps.empty() ? -1 : 0;
    menu.mapScroll = 0;
    if (menu.maps.empty()) menu.message = "Khong tim thay map .txt trong thu muc Maps.";
    else menu.message.clear();
}

void DrawMenu(SDL_Renderer* r, const MenuState& menu, int windowW, int windowH) {
    SDL_SetRenderDrawColor(r, 18, 25, 32, 255);
    SDL_RenderClear(r);

    SDL_SetRenderDrawColor(r, 35, 48, 58, 255);
    SDL_FRect panel{ (windowW - 760.0f) / 2.0f, 35.0f, 760.0f,
        static_cast<float>(windowH) - 70.0f };
    if (panel.x < 10.0f) panel.x = 10.0f;
    panel.w = std::min(760.0f, static_cast<float>(windowW) - 20.0f);
    SDL_RenderFillRect(r, &panel);

    SDL_SetRenderDrawColor(r, 230, 235, 240, 255);
    SDL_RenderDebugText(r, panel.x + 28.0f, 65.0f, "MINI TEST - SELECT MAP");
    SDL_SetRenderDrawColor(r, 175, 190, 200, 255);
    SDL_RenderDebugText(r, panel.x + 28.0f, 105.0f, "Choose a map in the Maps folder:");

    const int maxVisible = MenuVisibleRows(windowH);
    const int endIndex = std::min(static_cast<int>(menu.maps.size()), menu.mapScroll + maxVisible);
    for (int i = menu.mapScroll; i < endIndex; ++i) {
        const int visibleRow = i - menu.mapScroll;
        SDL_FRect row = GetMapRowRect(visibleRow, windowW);
        const bool selected = i == menu.selectedMap;
        SDL_SetRenderDrawColor(r, selected ? 65 : 48, selected ? 105 : 62,
            selected ? 75 : 78, 255);
        SDL_RenderFillRect(r, &row);
        SDL_SetRenderDrawColor(r, selected ? 150 : 95, selected ? 230 : 115,
            selected ? 165 : 130, 255);
        SDL_RenderRect(r, &row);
        SDL_SetRenderDrawColor(r, 240, 240, 240, 255);
        const std::string label = (selected ? ">  " : "   ") + menu.maps[static_cast<size_t>(i)].name;
        SDL_RenderDebugText(r, row.x + 16.0f, row.y + 15.0f, label.c_str());
    }

    if (!menu.message.empty()) {
        SDL_SetRenderDrawColor(r, 255, 190, 100, 255);
        SDL_RenderDebugText(r, panel.x + 28.0f, 135.0f, menu.message.c_str());
    }

    SDL_FRect start = GetStartButtonRect(windowW, windowH);
    const bool canStart = menu.selectedMap >= 0 && menu.selectedMap < static_cast<int>(menu.maps.size());
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
