#pragma once
#include <cstdint>
#include <deque>
#include <vector>
#include "camera/camera.h"
#include "entity/Unit.h"
#include "entity/UnitType.h"
#include "game/PathRequest.h"
#include "TileMap.h"

enum class MatchResult { Playing, Victory, Defeat };

constexpr int kDefaultPlayerUnitCount = 6; // số lính phe ta khi map không có dòng @spawn nào

// Khung kéo chuột chọn quân (lưu bằng tọa độ thế giới).
struct SelectionBox {
    bool active = false;
    float startX = 0.0f;
    float startY = 0.0f;
    float endX = 0.0f;
    float endY = 0.0f;
};

struct GameState {
    TileMap map;
    UnitTypeTable unitTypes;                        // bảng loại đơn vị (Data/units.txt)
    Camera camera{ 0.0f, 0.0f };                    // Camera: góc trên-trái của vùng nhìn thấy, tính theo tọa độ thế giới
    bool debugMode = false;
    SelectionBox selection;

    // Lính của CẢ HAI PHE. LUÔN sắp xếp theo id tăng dần (id cấp tăng dần và chỉ thêm vào cuối,
    // xóa thì giữ nguyên thứ tự) nên tra theo ID bằng tìm nhị phân (FindUnit).
    // Các Unit tham chiếu nhau bằng ID, nên được thêm/xóa tự do giữa các tick.
    // Con trỏ/tham chiếu Unit chỉ dùng tạm TRONG một hàm: AddUnit và RemoveGoneUnits làm chúng mất hiệu lực.
    std::vector<Unit> units;
    EntityId nextEntityId = 1;

    // Yêu cầu tìm đường đang chờ phục vụ (xem game/PathService.h).
    std::deque<PathRequest> pathQueue;

    MatchResult result = MatchResult::Playing;
    int startCount[static_cast<int>(Team::Count)] = { 0, 0 }; // số quân mỗi phe lúc bắt đầu ván

    // ---- Nhịp mô phỏng cố định ----
    float tickAccumulator = 0.0f;   // thời gian dồn lại chưa đủ một tick
    float renderAlpha = 1.0f;       // hệ số nội suy khi vẽ = tickAccumulator / kTickDt
    std::uint64_t tickCount = 0;    // số tick đã chạy

    Unit* FindUnit(EntityId id);
    const Unit* FindUnit(EntityId id) const;
    // Thêm một Unit mới và cấp ID. Tham chiếu trả về mất hiệu lực ở lần AddUnit kế tiếp.
    Unit& AddUnit(float x, float y, Team team, int typeIndex);
    int CountUnits(Team team, bool aliveOnly) const;
    int StartCount(Team team) const { return startCount[static_cast<int>(team)]; }
};
