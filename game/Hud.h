#pragma once
#include <SDL3/SDL.h>
#include <cstdint>
#include <string>
#include <vector>
#include "game/GameState.h"

// ===========================================================================
// HUD: thanh tài nguyên (trên cùng bên trái), thanh nhóm điều khiển, và bảng đáy gồm
//   - bảng thông tin (bên trái): một lính -> chỉ số, trạng thái; nhiều lính -> lưới ô nhỏ có thanh máu (bấm một ô để chọn riêng lính đó,
//     Shift + bấm để bỏ lính đó khỏi vùng chọn); công trình -> máu, tiến độ xây, hàng đợi huấn luyện (bấm một ô để hủy đơn vị đó);
//     không chọn gì -> gợi ý phím
//   - thẻ lệnh (bên phải): lưới 3x3 nút bấm theo thứ đang chọn (Attack/Stop/Hold/Build cho lính; Train/Cancel cho công trình;
//     danh sách công trình khi đang đặt nhà). Mỗi nút làm đúng việc của phím tắt tương ứng (game/Commands.h).
//
// Bố cục (BuildHudLayout) và xử lý bấm chuột (HandleHudClick) tách khỏi SDL (chỉ dùng kiểu SDL_FRect) nên test được không cần cửa sổ;
// DrawHud và HandleHudClick dùng CHUNG một bố cục nên hình vẽ và vùng bấm không thể lệch nhau.
// ===========================================================================

constexpr float kHudPanelHeight = 132.0f;   // chiều cao bảng đáy; camera chừa đúng ngần này ở đáy (Camera::bottomInset)

enum class HudAction : std::uint8_t {
    None,
    AttackMove,       // = phím A
    Stop,             // = phím S
    Hold,             // = phím H
    Build,            // = phím B
    ChooseBuilding,   // đang đặt nhà: chọn loại công trình thứ arg (từ 0)
    Train,            // huấn luyện đơn vị thứ arg (từ 0) trong TrainableUnitTypes
    CancelPlacement,  // thoát chế độ đặt nhà
    CancelOrder,      // = Delete / Backspace: hủy công trình xây dở, hoặc đơn vị cuối hàng đợi
    CancelQueued,     // hủy đơn vị ở vị trí arg trong hàng đợi của công trình `id`
    RecallGroup,      // gọi nhóm điều khiển số arg (từ 1)
    SelectUnit        // bấm ô lính `id` trong lưới: chọn riêng lính đó (Shift: bỏ lính đó khỏi vùng chọn)
};

enum class HudButtonKind : std::uint8_t { Command, Group, UnitIcon, QueueIcon };

struct HudButton {
    HudButtonKind kind = HudButtonKind::Command;
    HudAction action = HudAction::None;
    SDL_FRect rect{ 0.0f, 0.0f, 0.0f, 0.0f };
    int arg = 0;
    EntityId id = kNoEntity;
    std::string label;      // dòng chữ trên (nút lệnh), hoặc chữ cái đầu (ô lính / ô hàng đợi)
    std::string sub;        // dòng chữ dưới của nút lệnh: phím tắt, giá
    bool enabled = true;    // false: vẽ mờ (nút vẫn bấm được, lệnh sẽ báo lý do không làm được)
    bool active = false;    // đang bật: chế độ Attack-move, đang Hold, loại công trình đang chọn, nhóm đang được chọn
};

struct HudLayout {
    SDL_FRect panel{ 0.0f, 0.0f, 0.0f, 0.0f };      // bảng đáy
    SDL_FRect info{ 0.0f, 0.0f, 0.0f, 0.0f };       // bảng thông tin (trong panel)
    SDL_FRect card{ 0.0f, 0.0f, 0.0f, 0.0f };       // thẻ lệnh (trong panel)
    SDL_FRect topBar{ 0.0f, 0.0f, 0.0f, 0.0f };     // thanh vàng / slot quân (chỉ khi hasTopBar)
    SDL_FRect groupBar{ 0.0f, 0.0f, 0.0f, 0.0f };   // thanh nhóm điều khiển (chỉ khi hasGroupBar)
    bool hasTopBar = false;
    bool hasGroupBar = false;
    int hiddenUnits = 0;                            // số lính được chọn mà lưới không đủ chỗ vẽ
    std::vector<HudButton> buttons;                 // mọi thứ bấm được
};

HudLayout BuildHudLayout(const GameState& g, int windowW, int windowH);

// Điểm màn hình (x, y) có nằm trên HUD không (chuột trái/phải ở đó không được tác động lên thế giới).
bool HudBlocksPoint(const HudLayout& layout, float x, float y);
bool IsOverHud(const GameState& g, int windowW, int windowH, float x, float y);
// Nút ở điểm (x, y), nullptr nếu không có.
const HudButton* HudButtonAt(const HudLayout& layout, float x, float y);

// Chuột trái tại (x, y) trên màn hình. Trả về true nếu HUD đã nhận cú bấm (bấm trúng nút hoặc nền HUD): khi đó main.cpp không được
// đặt nhà / Attack-move / bắt đầu kéo chọn nữa. shift = đang giữ Shift.
bool HandleHudClick(GameState& g, int windowW, int windowH, float x, float y, bool shift);

// Dòng trạng thái của một lính: "Idle", "Moving", "Attacking", "Holding position", "Attack-moving", "Mining", "Delivering gold", "Building"...
std::string HudUnitStatus(const Unit& u);

// Vẽ HUD (không gồm bộ đếm quân và banner thắng/thua: xem Render.cpp).
void DrawHud(SDL_Renderer* r, const GameState& g, int windowW, int windowH);
