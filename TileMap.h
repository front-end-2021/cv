#pragma once
#include <cstdint>
#include <string>
#include <vector>
#include "Common.h"
#include "Tile.h"
#include "entity/Team.h"

// Một điểm xuất phát đọc từ file map.
struct SpawnPoint {
    Waypoint pos;          // pixel thế giới
    std::string unitType;  // tên loại đơn vị (xem Data/units.txt); rỗng = loại mặc định của phe
};

// Một mỏ tài nguyên đọc từ file map (xem "@mine").
struct MineSpawn {
    int row = 0;     // ô góc trên-trái (mỏ chiếm kMineTiles x kMineTiles ô)
    int col = 0;
    int amount = kDefaultMineAmount;
};

// Một công trình dựng sẵn đọc từ file map (xem "@building"). Kích thước lấy từ Data/buildings.txt khi dựng ván.
struct BuildingSpawn {
    std::string type;
    int row = 0;     // ô góc trên-trái
    int col = 0;
    Team team = Team::Player;
};

struct TileMap {
    int rows = 0;
    int cols = 0;
    float tileSize = 64.0f;
    std::vector<Tile> data;

    std::vector<SpawnPoint> spawns;       // điểm xuất phát của lính phe ta
    std::vector<SpawnPoint> enemySpawns;  // điểm xuất phát của từng kẻ địch
    std::vector<MineSpawn> mines;         // mỏ tài nguyên
    std::vector<BuildingSpawn> buildings; // công trình dựng sẵn
    int startGold = 0;                    // vàng ban đầu của phe ta

    // Lớp "ô bị chiếm" phủ lên địa hình: công trình và mỏ đánh dấu các ô chúng đứng lên (game/GameState.cpp).
    // Ô bị chiếm KHÔNG đi được, nên A*, FlowField, kiểm tra tầm nhìn và va chạm đều tự coi nó là vật cản.
    // Rỗng (hoặc sai kích thước) = không có ô nào bị chiếm.
    std::vector<std::uint8_t> occupied;

    bool Empty() const { return rows <= 0 || cols <= 0; }
    float WorldW() const { return static_cast<float>(cols) * tileSize; }
    float WorldH() const { return static_cast<float>(rows) * tileSize; }

    // Địa hình của ô có đi được không, KHÔNG tính công trình/mỏ (ngoài bản đồ, nước, đá -> không).
    // Dùng để biết có xây được lên ô đó không.
    bool IsTerrainWalkable(int row, int col) const;
    // Ô có đang bị công trình/mỏ chiếm không.
    bool IsOccupied(int row, int col) const;
    void SetOccupied(int row, int col, bool value);
    // Đánh dấu / bỏ đánh dấu hình chữ nhật w x h ô, góc trên-trái ở (row, col); ô ngoài bản đồ bị bỏ qua.
    void SetFootprintOccupied(int row, int col, int w, int h, bool value);
    void ClearOccupancy() { occupied.clear(); }

    // Ô (hàng, cột) có đi được không (ngoài bản đồ, nước, đá, hoặc đang bị công trình/mỏ chiếm -> không).
    bool IsWalkableTile(int row, int col) const;
    // Toạ độ thế giới có nằm trên ô đi được không.
    bool IsWalkableWorld(float worldX, float worldY) const;
    // Hình vuông có tâm (x, y) và cạnh boxSize có đè lên ô không đi được nào không.
    bool CanBoxStandAt(float worldX, float worldY, float boxSize) const;
};

// Đọc file map. Định dạng:
//   - Dòng bắt đầu bằng '#': ghi chú.
//   - "@spawn <cột> <hàng> [LoạiĐơnVị]": điểm xuất phát của một lính phe ta (nhiều dòng = nhiều lính).
//     Toạ độ tính theo ô: 2.5 = giữa ô số 2. Không ghi loại = loại mặc định của phe.
//   - "@enemy <cột> <hàng> [LoạiĐơnVị]": điểm xuất phát của một kẻ địch ("@target" là tên cũ).
//   - "@gold <số>": vàng ban đầu của phe ta.
//   - "@mine <cột> <hàng> [lượng]": mỏ vàng chiếm 2x2 ô, (cột, hàng) là ô GÓC TRÊN-TRÁI (số nguyên).
//     Không ghi lượng = kDefaultMineAmount.
//   - "@building <Loại> <cột> <hàng> [player|enemy]": công trình đã xây xong (loại: xem Data/buildings.txt),
//     (cột, hàng) là ô góc trên-trái (số nguyên). Không ghi phe = phe ta.
//   - Các dòng còn lại: mã tile cách nhau bởi dấu cách (xem enum Tile).
// Chỉ khi đọc thành công `out` mới bị thay đổi.
bool LoadTileMap(const std::string& filePath, TileMap& out);
