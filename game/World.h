#pragma once
#include "game/GameState.h"

// Dựng một ván mới trên g.map đã nạp (cũng dùng khi chơi lại): lính phe ta ở các @spawn,
// kẻ địch ở các @enemy, mỗi điểm theo loại đơn vị ghi trong map (mặc định theo phe).
// Điểm nào không dùng được (nằm trên nước/đá, bị trùng, hoặc thiếu) sẽ được dời sang ô trống gần nhất.
void InitializeWorld(GameState& g);

// Xóa hẳn các đơn vị đã chết xong animation khỏi danh sách. An toàn vì mọi tham chiếu là ID.
void RemoveGoneUnits(GameState& g);

// Thắng khi diệt hết kẻ địch (map có kẻ địch); thua khi mất hết lính.
void UpdateMatchResult(GameState& g);
