#pragma once
#include <SDL3/SDL.h>
#include "game/GameState.h"

// Chuẩn hóa 2 điểm bất kỳ thành hình chữ nhật có w, h dương.
SDL_FRect GetNormalizedRect(float x1, float y1, float x2, float y2);

void DeselectAll(GameState& g);
// Bắt đầu kéo chọn tại điểm màn hình (screenX, screenY).
//   additive = false: bỏ chọn mọi thứ rồi chọn theo khung kéo.
//   additive = true (giữ Shift): giữ vùng chọn cũ, khung kéo chỉ cộng thêm; bấm đơn lẻ (khung nhỏ hơn 3px) lên thứ đang được chọn thì bỏ chọn thứ đó.
void BeginSelection(GameState& g, float screenX, float screenY, bool additive = false);
// Kết thúc kéo chọn. Chốt vùng chọn theo khung kéo hiện tại (nên bấm nhả quá nhanh, chưa kịp có UpdateSelection nào, vẫn chọn được).
void EndSelection(GameState& g);
// Cập nhật khung kéo theo vị trí chuột (tọa độ màn hình) và chọn các lính phe ta còn sống nằm trong khung.
// Công trình phe ta chỉ được chọn khi không có lính nào được chọn: lính luôn thắng công trình, kể cả khi cộng thêm bằng Shift.
void UpdateSelection(GameState& g, float mouseX, float mouseY);
// Đưa camera về lính đang được chọn đầu tiên (hoặc lính phe ta còn sống đầu tiên).
void FocusCameraOnSelection(GameState& g, int windowW, int windowH);

// Chọn đúng một lính phe ta (bỏ chọn mọi thứ khác). false (không đổi gì) nếu không có lính đó, đã chết hoặc không phải phe ta.
bool SelectOnlyUnit(GameState& g, EntityId id);
// Bỏ một lính khỏi vùng chọn (không đụng tới các lính khác).
void RemoveUnitFromSelection(GameState& g, EntityId id);

// ---- Nhóm điều khiển 1..kControlGroupCount (number tính từ 1) ----
// Lưu các lính phe ta đang chọn thành nhóm `number` (thay nhóm cũ). Một lính có thể nằm trong nhiều nhóm. Công trình không vào nhóm được.
// Trả về số lính đã lưu; 0 (nhóm cũ giữ nguyên) nếu đang không chọn lính nào hoặc `number` sai.
int SaveControlGroup(GameState& g, int number);
// Chọn đúng các lính còn sống của nhóm `number` (bỏ chọn mọi thứ khác, hủy luôn khung kéo đang dở). Trả về số lính được chọn;
// 0 (vùng chọn hiện tại giữ nguyên) nếu nhóm rỗng hoặc `number` sai. Lính đã chết bị dọn khỏi nhóm.
int RecallControlGroup(GameState& g, int number);
// Số lính còn sống của nhóm `number` (0 nếu số sai).
int ControlGroupSize(const GameState& g, int number);
// Vùng chọn hiện tại có đúng là nhóm `number` không (mọi lính còn sống của nhóm đang được chọn và không có lính nào khác).
bool IsControlGroupSelected(const GameState& g, int number);
