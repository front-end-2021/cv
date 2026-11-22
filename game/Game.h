#pragma once
#include "camera/camera.h"
#include "game/GameState.h"

// Cập nhật một KHUNG HÌNH:
//   1. Mô phỏng: dồn frameDt vào bộ tích lũy rồi chạy bao nhiêu tick cố định (kTickDt) cũng được,
//      nên kết quả game không phụ thuộc tốc độ khung hình (60 FPS hay 144 FPS đều như nhau).
//      Phần dư được lưu thành g.renderAlpha để vẽ nội suy.
//   2. Camera và khung kéo chọn quân chạy theo từng khung hình (là giao diện, không phải mô phỏng).
void UpdateGameFrame(GameState& g, const Input& in, float frameDt, int windowW, int windowH);
