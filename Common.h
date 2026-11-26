#pragma once
#include <cstdint>

// Điểm trong thế giới (pixel).
struct Waypoint {
    float x;
    float y;
};

// ---- Định danh đơn vị ----
// Các đơn vị tham chiếu tới nhau bằng ID (không dùng con trỏ) nên có thể sinh/xóa quân bất cứ lúc nào mà không sợ con trỏ treo. ID hợp lệ bắt đầu từ 1 và không bao giờ dùng lại.
using EntityId = std::uint32_t;
constexpr EntityId kNoEntity = 0;

constexpr float kSquareSize = 40.0f; // kích thước hitbox của một đơn vị (pixel)

// ---- Kinh tế & xây dựng ----
constexpr int kMineTiles = 2;                // mỏ tài nguyên chiếm kMineTiles x kMineTiles ô
constexpr int kDefaultMineAmount = 1500;     // lượng tài nguyên của mỏ khi file map không ghi

// ---- Mô phỏng chạy theo nhịp cố định, tách khỏi tốc độ khung hình ----
constexpr int   kTickRate = 30;                                 // số tick logic mỗi giây
constexpr float kTickDt = 1.0f / static_cast<float>(kTickRate); // thời gian của một tick (giây)
constexpr int   kMaxTicksPerFrame = 5;                          // chặn "vòng xoáy chết" khi máy quá chậm
constexpr float kMaxFrameDt = 0.25f;                            // một khung hình dài hơn mức này bị cắt bớt

// ---- Di chuyển & tìm đường ----
// Hitbox "phình" thêm 10% dùng khi KIỂM TRA đường đi (làm mượt đường, chọn điểm đích): lính đi sát tường vẫn không bị vẽ đè lên tường. Vẫn đủ nhỏ để chui qua khe 1 ô và đứng được sát mép bản đồ.
constexpr float kPathClearance = kSquareSize * 1.1f;
// Yêu cầu tìm đường được xếp hàng và phục vụ có ngân sách mỗi tick, để một lệnh cho cả đội quân đông trên bản đồ lớn không làm khựng một khung hình (xem game/PathService.h).
constexpr int kMaxPathRequestsPerTick = 16;   // số yêu cầu tối đa phục vụ mỗi tick
constexpr int kPathNodeBudgetPerTick = 3000;  // tổng số ô A* được mở mỗi tick (luôn phục vụ được ít nhất 1 yêu cầu)
constexpr int kGroupSearchMinUnits = 10;      // nhóm từ ngần này lính trở lên: một lần tìm đường chung (FlowField)
