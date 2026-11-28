#pragma once
#include <vector>
#include "game/GameState.h"

// ===========================================================================
// Lệnh từ bàn phím và chế độ đặt nhà. Tách khỏi SDL (chỉ nhận dữ liệu thuần) để kiểm thử được không cần cửa sổ; main.cpp chỉ việc đổi phím / chuột thành các lời gọi này.
//
//   B               vào chế độ đặt nhà (cần đang chọn ít nhất một thợ). Khi ĐANG đặt nhà thì B không thoát chế độ mà chọn Barracks (xem dòng H / A / B)
//   N / A / B       đang đặt nhà: chọn loại công trình thứ 1 / 2 / 3 trong Data/buildings.txt (mặc định Townhall / House / Barracks), không phân biệt hoa thường
//                   (xem kBuildingHotkeys). Phím chữ thay cho phím số 1 / 2 / 3 trước đây
//   1..9            đang chọn công trình huấn luyện được và n <= số loại nó huấn luyện được: huấn luyện đơn vị thứ n;
//                   còn lại: gọi nhóm điều khiển n (chọn đúng các lính đã lưu trong nhóm). Muốn gọi nhóm khi đang chọn công trình huấn luyện được
//                   mà n trùng phím huấn luyện thì bấm nút nhóm trên HUD (hoặc bỏ chọn công trình trước). Đang đặt nhà: phím số bị bỏ qua
//   Ctrl+1..9         lưu các lính phe ta đang chọn thành nhóm điều khiển n (công trình không vào nhóm được)
//   chuột trái        đang đặt nhà: đặt móng tại bóng mờ (xanh = được, đỏ = không)
//   chuột phải/Esc    đang đặt nhà: thoát chế độ
//   Delete/Backspace  đang đặt nhà: thoát chế độ; không thì: hủy công trình xây dở đang chọn (hoàn 75%), hoặc hủy đơn vị cuối hàng đợi của công trình đang chọn (hoàn đủ)
//   S               Stop: lính đang chọn bỏ mọi lệnh / việc đang làm và đứng lại
//   H               Hold position: lính đang chọn giữ vị trí, chỉ đánh kẻ trong tầm đánh, không đuổi theo
//   A               bật/tắt chế độ Attack-move (cần đang chọn lính); chuột trái: đi tới điểm đó và đánh mọi kẻ địch gặp trên đường (bấm lên kẻ địch thì tấn công thẳng kẻ đó); chuột phải/Esc: thoát chế độ
//   (đang đặt nhà: S bị bỏ qua, còn H / A / B là phím chọn loại công trình chứ không ra lệnh Hold / Attack-move / Build; vào chế độ đặt nhà, hoặc bấm S / H, thì thoát chế độ Attack-move)
// ===========================================================================

// Vào chế độ đặt nhà với loại công trình `buildingType` (-1 = loại đầu tiên). false (kèm thông báo) nếu không đang chọn thợ nào hoặc loại không có.
bool BeginPlacement(GameState& g, int buildingType = -1);
void CancelPlacement(GameState& g);

// Cập nhật bóng mờ theo vị trí chuột (tọa độ màn hình): bám vào lưới ô, tâm công trình ở gần con trỏ nhất, rồi kiểm tra đặt được không (g.placement.status). Gọi mỗi khung hình khi đang đặt nhà.
void UpdatePlacement(GameState& g, float mouseX, float mouseY);

// Đặt móng tại bóng mờ hiện tại và giao các thợ đang chọn đi xây. Thành công thì thoát chế độ đặt nhà và trả về true; thất bại thì ở lại chế độ đặt nhà, hiện thông báo lý do.
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

// ---- Chọn loại công trình khi đang đặt nhà: phím chữ h / a / b (hoặc nút trên HUD) ----

// Phím chọn loại công trình thứ i (từ 0) trong Data/buildings.txt: phần tử i ứng với loại thứ i (0 = Townhall, 1 = House, 2 = Barracks).
// Loại nào ở ngoài mảng này (bảng có nhiều hơn 3 loại) không có phím tắt, chỉ chọn được bằng nút trên HUD. Muốn đổi phím thì sửa ở đây.
inline constexpr char kBuildingHotkeys[] = { 'n', 'a', 'b' };
inline constexpr int kBuildingHotkeyCount = static_cast<int>(sizeof(kBuildingHotkeys));

// Phím (chữ HOA, để ghi trên nút HUD) của loại công trình `buildingType`; 0 nếu loại đó không có phím tắt.
char BuildingHotkeyLabel(int buildingType);
// Chọn loại công trình `buildingType` khi đang đặt nhà (bóng mờ đổi theo ở lần UpdatePlacement kế tiếp). Bỏ qua nếu không đang đặt nhà hoặc không có loại đó.
void ChooseBuildingType(GameState& g, int buildingType);
// Phím chữ `key` (ASCII, không phân biệt hoa thường) khi đang đặt nhà: h / a / b chọn loại công trình tương ứng.
// true nếu phím đã được dùng làm phím chọn công trình (kể cả khi bảng không có loại đó), để nơi gọi không xử lý tiếp (đặc biệt là B không được bật/tắt chế độ đặt nhà);
// false nếu không đang đặt nhà hoặc phím không phải phím chọn công trình.
bool HandleBuildingHotkey(GameState& g, char key);

// Phím số: đang đặt nhà thì bị bỏ qua (chọn công trình bằng phím chữ ở trên); không thì huấn luyện đơn vị thứ `number` hoặc gọi nhóm điều khiển `number`.
void HandleNumberKey(GameState& g, int number);
// Ctrl+số: lưu vùng chọn thành nhóm điều khiển `number` (1..kControlGroupCount), kèm thông báo; không có lính nào được chọn thì báo lỗi và giữ nguyên nhóm cũ.
void HandleSaveGroupKey(GameState& g, int number);
void HandleCancelKey(GameState& g);

// Các loại đơn vị mà bộ công trình đang chọn huấn luyện được (chỉ công trình đã xây xong), theo thứ tự xuất hiện đầu tiên, không trùng. 
// Phím số n huấn luyện phần tử thứ n-1 của danh sách này. Trả về chỉ số trong UnitTypeTable.
std::vector<int> TrainableUnitTypes(const GameState& g);
