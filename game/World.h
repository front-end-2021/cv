#pragma once
#include "game/GameState.h"

// Dựng một ván mới trên g.map đã nạp (cũng dùng khi chơi lại): công trình dựng sẵn (@building) và mỏ (@mine) trước,
// rồi lính phe ta ở các @spawn, kẻ địch ở các @enemy, mỗi điểm theo loại đơn vị ghi trong map (mặc định theo phe).
// Vàng ban đầu lấy từ @gold. Công trình/mỏ nào không đặt được (ngoài map, đè nước/đá, đè nhau, loại không có trong
// Data/buildings.txt) bị bỏ qua kèm ghi log.
// Lính có điểm không dùng được (nằm trên nước/đá, công trình, bị trùng, hoặc thiếu) sẽ được dời sang ô trống gần nhất.
void InitializeWorld(GameState& g);

// Xóa hẳn các đơn vị đã chết xong animation khỏi danh sách. An toàn vì mọi tham chiếu là ID.
void RemoveGoneUnits(GameState& g);

// Dọn các mỏ đã cạn khỏi thế giới (trả các ô của chúng về cho bản đồ). Gọi cuối mỗi tick, khi không ai còn giữ con trỏ ResourceNode.
void RemoveDepletedResources(GameState& g);

// Thắng khi diệt hết lính địch (map có kẻ địch; công trình địch chưa đánh được nên không tính).
// Thua khi mất hết lính VÀ không còn công trình nào huấn luyện thêm quân được.
void UpdateMatchResult(GameState& g);
