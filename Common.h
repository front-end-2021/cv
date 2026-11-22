#pragma once
#include <cstdint>

// Điểm trong thế giới (pixel).
struct Waypoint {
    float x;
    float y;
};

// ---- Định danh đơn vị ----
// Các đơn vị tham chiếu tới nhau bằng ID (không dùng con trỏ) nên có thể sinh/xóa quân
// bất cứ lúc nào mà không sợ con trỏ treo. ID hợp lệ bắt đầu từ 1 và không bao giờ dùng lại.
using EntityId = std::uint32_t;
constexpr EntityId kNoEntity = 0;

constexpr float kSquareSize = 40.0f; // kích thước hitbox của một đơn vị (pixel)

// ---- Mô phỏng chạy theo nhịp cố định, tách khỏi tốc độ khung hình ----
constexpr int   kTickRate = 30;                                 // số tick logic mỗi giây
constexpr float kTickDt = 1.0f / static_cast<float>(kTickRate); // thời gian của một tick (giây)
constexpr int   kMaxTicksPerFrame = 5;                          // chặn "vòng xoáy chết" khi máy quá chậm
constexpr float kMaxFrameDt = 0.25f;                            // một khung hình dài hơn mức này bị cắt bớt
