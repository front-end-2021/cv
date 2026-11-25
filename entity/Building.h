#pragma once
#include <SDL3/SDL.h>
#include <string>
#include <vector>
#include "BuildingType.h"
#include "Entity.h"
#include "Footprint.h"

// Một đơn vị đang chờ / đang được huấn luyện trong công trình.
struct QueuedUnit {
    int   unitType = -1;     // chỉ số trong UnitTypeTable
    float timeLeft = 0.0f;   // giây còn lại; <= 0 mà chưa ra quân nghĩa là đang chờ chỗ trống quanh công trình
    float totalTime = 0.0f;  // tổng thời gian huấn luyện (để vẽ thanh tiến độ)

    // Tỉ lệ đã huấn luyện xong, 0..1.
    float Ratio() const { return totalTime > 0.0f ? 1.0f - (timeLeft > 0.0f ? timeLeft / totalTime : 0.0f) : 1.0f; }
};

// Công trình: chiếm các ô trên bản đồ (và chặn đường đi: xem TileMap::occupied), có thể đang xây dở,
// huấn luyện đơn vị, cấp thêm slot quân hoặc làm kho chứa.
// Tham chiếu tới công trình luôn bằng ID (EntityId, cùng dãy ID với lính), như mọi Entity khác.
class Building : public Entity {
public:
    int typeId = -1;             // chỉ số trong BuildingTypeTable
    std::string label;           // tên loại, để vẽ
    Footprint fp;                // các ô đang chiếm
    float buildTime = 0.0f;      // giây để một thợ buildspeed 100 xây xong (chép từ loại)

    bool complete = true;        // false: đang xây dở, chưa làm được gì
    float progress = 1.0f;       // 0..1 tiến độ xây

    bool dropoff = false;        // là kho chứa
    bool producesUnits = false;  // huấn luyện được đơn vị
    int supplyProvided = 0;      // slot quân cấp thêm (chỉ tính khi đã xây xong)

    std::vector<QueuedUnit> queue; // hàng đợi sản xuất; phần tử đầu là đơn vị đang được huấn luyện
    bool hasRally = false;       // điểm tập kết của quân mới ra
    Waypoint rally{ 0.0f, 0.0f };
    EntityId rallyResourceId = kNoEntity; // điểm tập kết đặt lên một mỏ: thợ mới ra sẽ tự đi đào

    // complete = true: dựng sẵn (đã xây xong, đủ máu). false: móng công trình, tiến độ 0.
    Building(const BuildingType& type, int typeIndex, int row, int col, float tileSize, Team team, bool complete);

    // Tăng tiến độ xây thêm `fraction` (0..1). Máu tăng theo tiến độ. Trả về true đúng lúc vừa xây xong.
    bool AdvanceConstruction(float fraction);

    // Vẽ thân công trình, thanh tiến độ xây / huấn luyện, viền chọn, thanh máu.
    void Render(SDL_Renderer* r, float camX, float camY, bool debug) const;
};
