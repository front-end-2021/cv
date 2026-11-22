#pragma once
#include <SDL3/SDL.h>
#include <string>
#include <vector>

struct MapEntry {
    std::string name;
    std::string path;
};

// Trạng thái màn chọn map.
struct MenuState {
    std::vector<MapEntry> maps;
    int selectedMap = -1;
    int mapScroll = 0;
    std::string message;
};

// Quét thư mục Maps (cạnh file thực thi), chỉ lấy file .txt.
void RefreshMapList(MenuState& menu);

void DrawMenu(SDL_Renderer* r, const MenuState& menu, int windowW, int windowH);

// Số dòng map hiển thị được trong cửa sổ cao windowH.
int MenuVisibleRows(int windowH);
void MenuSelectNext(MenuState& menu, int windowH);
void MenuSelectPrev(MenuState& menu);
// Chỉ số map ở dưới điểm (mx, my), -1 nếu không trúng dòng nào.
int MenuHitMapRow(const MenuState& menu, float mx, float my, int windowW, int windowH);
bool MenuHitStartButton(float mx, float my, int windowW, int windowH);
