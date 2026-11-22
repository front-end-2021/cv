#pragma once
#include <string>
#include <vector>
#include "Common.h"
#include "Tile.h"

// Một điểm xuất phát đọc từ file map.
struct SpawnPoint {
    Waypoint pos;          // pixel thế giới
    std::string unitType;  // tên loại đơn vị (xem Data/units.txt); rỗng = loại mặc định của phe
};

struct TileMap {
    int rows = 0;
    int cols = 0;
    float tileSize = 64.0f;
    std::vector<Tile> data;

    std::vector<SpawnPoint> spawns;       // điểm xuất phát của lính phe ta
    std::vector<SpawnPoint> enemySpawns;  // điểm xuất phát của từng kẻ địch

    bool Empty() const { return rows <= 0 || cols <= 0; }
    float WorldW() const { return static_cast<float>(cols) * tileSize; }
    float WorldH() const { return static_cast<float>(rows) * tileSize; }

    // Ô (hàng, cột) có đi được không (ngoài bản đồ, nước, đá -> không).
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
//   - Các dòng còn lại: mã tile cách nhau bởi dấu cách (xem enum Tile).
// Chỉ khi đọc thành công `out` mới bị thay đổi.
bool LoadTileMap(const std::string& filePath, TileMap& out);
