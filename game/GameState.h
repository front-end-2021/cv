#pragma once
#include <array>
#include <cstdint>
#include <deque>
#include <vector>
#include <string>
#include "camera/camera.h"
#include "entity/Building.h"
#include "entity/BuildingType.h"
#include "entity/ResourceNode.h"
#include "entity/Unit.h"
#include "entity/UnitType.h"
#include "game/PathRequest.h"
#include "TileMap.h"

enum class MatchResult { Playing, Victory, Defeat };

constexpr int kDefaultPlayerUnitCount = 6; // số lính phe ta khi map không có dòng @spawn nào

// Kết quả kiểm tra / thực hiện đặt móng công trình (game/Construction.h).
enum class PlaceResult {
    Ok,
    UnknownType,     // loại công trình không có trong bảng
    OutOfMap,        // một phần công trình nằm ngoài bản đồ
    BadTerrain,      // đè lên nước / đá
    Occupied,        // đè lên công trình hoặc mỏ khác
    EnemyInWay,      // có lính địch đứng trong vùng định xây
    NotEnoughGold,
    NoWorker         // không có thợ nào đang được chọn để đi xây
};

// Chế độ đặt nhà: bóng mờ công trình bám theo chuột, xanh = đặt được, đỏ = không (game/Commands.h).
struct PlacementMode {
    bool active = false;
    int buildingType = -1;   // chỉ số trong BuildingTypeTable
    int row = 0;             // ô góc trên-trái của bóng mờ
    int col = 0;
    PlaceResult status = PlaceResult::Ok; // kết quả kiểm tra tại vị trí hiện tại (Ok = đặt được và đủ vàng)
};

constexpr int kControlGroupCount = 9;   // nhóm điều khiển 1..9 (Ctrl+số để lưu, số để gọi: game/Selection.h)

// Khung kéo chuột chọn quân (lưu bằng tọa độ thế giới).
struct SelectionBox {
    bool active = false;
    float startX = 0.0f;
    float startY = 0.0f;
    float endX = 0.0f;
    float endY = 0.0f;

    // Shift + kéo/bấm: không thay vùng chọn cũ mà cộng thêm vào nó (bấm đơn lẻ lên thứ đã chọn thì bỏ chọn thứ đó).
    // Lúc bắt đầu kéo ghi nhớ ai đang được chọn (theo ID, tăng dần) để mỗi khung hình tính lại được vùng chọn từ "vùng chọn cũ + khung kéo".
    bool additive = false;
    std::vector<EntityId> baseUnits;
    std::vector<EntityId> baseBuildings;
};

struct GameState {
    TileMap map;
    UnitTypeTable unitTypes;                        // bảng loại đơn vị (Data/units.txt)
    BuildingTypeTable buildingTypes;                // bảng loại công trình (Data/buildings.txt)
    Camera camera{ 0.0f, 0.0f };                    // Camera: góc trên-trái của vùng nhìn thấy, tính theo tọa độ thế giới
    bool debugMode = false;
    SelectionBox selection;

    // Nhóm điều khiển (Ctrl+1..9 lưu, 1..9 gọi). Chỉ chứa lính phe ta, lưu bằng ID nên lính chết/biến mất tự rơi khỏi nhóm
    // (RecallControlGroup dọn dần). Ván mới (InitializeWorld) xóa hết.
    std::array<std::vector<EntityId>, kControlGroupCount> controlGroups;

    // Lính của CẢ HAI PHE. LUÔN sắp xếp theo id tăng dần (id cấp tăng dần và chỉ thêm vào cuối,
    // xóa thì giữ nguyên thứ tự) nên tra theo ID bằng tìm nhị phân (FindUnit).
    // Các Unit tham chiếu nhau bằng ID, nên được thêm/xóa tự do giữa các tick.
    // Con trỏ/tham chiếu Unit chỉ dùng tạm TRONG một hàm: AddUnit và RemoveGoneUnits làm chúng mất hiệu lực.
    std::vector<Unit> units;
    EntityId nextEntityId = 1; // dùng chung cho lính, công trình và mỏ: một EntityId chỉ ứng với đúng một thực thể

    // Công trình và mỏ tài nguyên. Cũng sắp xếp theo id tăng dần (tra bằng tìm nhị phân), cũng chỉ tham chiếu bằng ID.
    // AddBuilding/AddResource/RemoveBuilding/RemoveResource là NƠI DUY NHẤT thay đổi lớp ô bị chiếm của bản đồ
    // (map.occupied), nên lớp đó luôn khớp với các công trình và mỏ đang có.
    std::vector<Building> buildings;
    std::vector<ResourceNode> resources;

    // ---- Kinh tế (game/Economy.h) ----
    int gold[static_cast<int>(Team::Count)] = { 0, 0 };
    bool economyActive = false;     // ván có kinh tế (map có công trình, mỏ hoặc vàng ban đầu): HUD hiện vàng và slot quân
    PlacementMode placement;
    bool attackMoveArmed = false;   // đã bấm A, đang chờ chuột trái chọn điểm Attack-move (game/Commands.h)
    std::string notice;             // thông báo ngắn cho người chơi ("Not enough gold"...)
    float noticeTimer = 0.0f;       // giây còn hiển thị thông báo (giảm theo khung hình, không phải tick)

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
    Building* FindBuilding(EntityId id);
    const Building* FindBuilding(EntityId id) const;
    ResourceNode* FindResource(EntityId id);
    const ResourceNode* FindResource(EntityId id) const;
    // Thêm một Unit mới và cấp ID. Tham chiếu trả về mất hiệu lực ở lần AddUnit kế tiếp.
    Unit& AddUnit(float x, float y, Team team, int typeIndex);
    // Thêm công trình (đánh dấu các ô nó chiếm). Không kiểm tra gì: dùng PlaceBuilding (game/Construction.h) để đặt đúng luật.
    // Tham chiếu trả về mất hiệu lực ở lần AddBuilding kế tiếp.
    Building& AddBuilding(int typeIndex, int row, int col, Team team, bool complete);
    // Thêm mỏ tài nguyên (đánh dấu các ô nó chiếm).
    ResourceNode& AddResource(int row, int col, int amount);
    // Gỡ công trình / mỏ và trả các ô nó chiếm về cho bản đồ. Không hoàn tiền (xem DestroyBuilding trong game/Construction.h).
    bool RemoveBuilding(EntityId id);
    bool RemoveResource(EntityId id);

    int CountUnits(Team team, bool aliveOnly) const;
    int StartCount(Team team) const { return startCount[static_cast<int>(team)]; }
    int& Gold(Team team) { return gold[static_cast<int>(team)]; }
    int Gold(Team team) const { return gold[static_cast<int>(team)]; }
    // Hiện thông báo ngắn cho người chơi.
    void Notify(const std::string& text) { notice = text; noticeTimer = 2.5f; }
};
