#pragma once
#include "game/GameState.h"

// Chạy MỘT tick mô phỏng (dt luôn là kTickDt khi gọi từ UpdateGameFrame):
// ghi nhớ vị trí cũ để nội suy -> mỗi Unit (cả hai phe) tự chọn mục tiêu, thi hành lệnh,
// di chuyển, chạy state machine -> tách va chạm -> kẹp biên -> xóa xác -> xét thắng/thua.
void StepSimulation(GameState& g, float dt);
