#pragma once
#include <vector>
#include "game/GameState.h"

// ===========================================================================
// Lệnh từ bàn phím và chế độ đặt nhà. Tách khỏi SDL (chỉ nhận dữ liệu thuần) để kiểm thử được không cần cửa sổ; main.cpp chỉ việc đổi phím / chuột thành các lời gọi này.
//
//   B               bật/tắt chế độ đặt nhà (cần đang chọn ít nhất một thợ)
//   1..9            đang đặt nhà: chọn loại công trình; không thì: huấn luyện đơn vị thứ n của công trình đang chọn
//   chuột trái      đang đặt nhà: đặt móng tại bóng mờ (xanh = được, đỏ = không)
//   chuột phải/Esc  đang đặt nhà: thoát chế độ
//   Delete/Backspace  đang đặt nhà: thoát chế độ; không thì: hủy công trình xây dở đang chọn (hoàn 75%), hoặc hủy đơn vị cuối hàng đợi của công trình đang chọn (hoàn đủ)
//   S               Stop: lính đang chọn bỏ mọi lệnh / việc đang làm và đứng lại
//   H               Hold position: lính đang chọn giữ vị trí, chỉ đánh kẻ trong tầm đánh, không đuổi theo
//   A               bật/tắt chế độ Attack-move (cần đang chọn lính); chuột trái: đi tới điểm đó và đánh mọi kẻ địch gặp trên đường (bấm lên kẻ địch thì tấn công thẳng kẻ đó); chuột phải/Esc: thoát chế độ
//   (S, H, A bị bỏ qua khi đang đặt nhà; vào chế độ đặt nhà, hoặc bấm S / H, thì thoát chế độ Attack-move)
// ===========================================================================

// Vào chế độ đặt nhà với loại công trình `buildingType` (-1 = loại đầu tiên). false (kèm thông báo) nếu không đang chọn thợ nào hoặc loại không có.
bool BeginPlacement(GameState& g, int buildingType = -1);
void CancelPlacement(GameState& g);

// Cập nhật bóng mờ theo vị trí chuột (tọa độ màn hình): bám vào lưới ô, tâm công trình ở gần con trỏ nhất,
// rồi kiểm tra đặt được không (g.placement.status). Gọi mỗi khung hình khi đang đặt nhà.
void UpdatePlacement(GameState& g, float mouseX, float mouseY);

// Đặt móng tại bóng mờ hiện tại và giao các thợ đang chọn đi xây. Thành công thì thoát chế độ đặt nhà và trả về true;
// thất bại thì ở lại chế độ đặt nhà, hiện thông báo lý do.
bool ConfirmPlacement(GameState& g);

// ---- Lệnh cho lính: Stop / Hold position / Attack-move (phần tính toán nằm ở game/Orders.h) ----

// Vào chế độ chờ chọn điểm Attack-move. false (kèm thông báo) nếu không đang chọn lính phe ta nào.
bool BeginAttackMoveMode(GameState& g);
void CancelAttackMoveMode(GameState& g);
// Chuột trái ở chế độ Attack-move tại điểm THẾ GIỚI (worldX, worldY): ra lệnh cho lính đang chọn rồi thoát chế độ.
// false nếu không ở chế độ này hoặc không còn lính nào để ra lệnh (khi đó vẫn thoát chế độ).
bool ConfirmAttackMove(GameState& g, float worldX, float worldY);

void HandleStopKey(GameState& g);
void HandleHoldKey(GameState& g);
void HandleAttackMoveKey(GameState& g);

void HandleBuildKey(GameState& g);
void HandleNumberKey(GameState& g, int number);
void HandleCancelKey(GameState& g);

// Các loại đơn vị mà bộ công trình đang chọn huấn luyện được (chỉ công trình đã xây xong), theo thứ tự xuất hiện đầu tiên, không trùng. 
// Phím số n huấn luyện phần tử thứ n-1 của danh sách này. Trả về chỉ số trong UnitTypeTable.
std::vector<int> TrainableUnitTypes(const GameState& g);
