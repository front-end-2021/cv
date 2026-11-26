#include "TileMap.h"
#include <SDL3/SDL.h>
#include <cmath>
#include <fstream>
#include <sstream>
#include <utility>
#include "DataParse.h"

bool TileMap::IsTerrainWalkable(int row, int col) const {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return false; // Ngoài bản đồ
    const Tile t = data[static_cast<size_t>(row) * static_cast<size_t>(cols) + static_cast<size_t>(col)];
    return t != Tile::Water && t != Tile::Rock; // Nước và đá không đi được
}

bool TileMap::IsOccupied(int row, int col) const {
    if (occupied.empty() || row < 0 || row >= rows || col < 0 || col >= cols) return false;
    const size_t idx = static_cast<size_t>(row) * static_cast<size_t>(cols) + static_cast<size_t>(col);
    return idx < occupied.size() && occupied[idx] != 0;
}

void TileMap::SetOccupied(int row, int col, bool value) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    if (occupied.size() != data.size()) occupied.assign(data.size(), 0); // cấp phát khi cần dùng lần đầu
    occupied[static_cast<size_t>(row) * static_cast<size_t>(cols) + static_cast<size_t>(col)] = value ? 1 : 0;
}

void TileMap::SetFootprintOccupied(int row, int col, int w, int h, bool value) {
    for (int r = row; r < row + h; ++r) {
        for (int c = col; c < col + w; ++c) SetOccupied(r, c, value);
    }
}

bool TileMap::IsWalkableTile(int row, int col) const {
    return IsTerrainWalkable(row, col) && !IsOccupied(row, col);
}

bool TileMap::IsWalkableWorld(float worldX, float worldY) const {
    const int c = static_cast<int>(std::floor(worldX / tileSize));
    const int r = static_cast<int>(std::floor(worldY / tileSize));
    return IsWalkableTile(r, c);
}

bool TileMap::CanBoxStandAt(float worldX, float worldY, float boxSize) const {
    // Thu nhỏ hitbox 1 chút (0.45 thay vì 0.5) để lính dễ lách qua khe hẹp
    const float half = boxSize * 0.45f;
    return IsWalkableWorld(worldX - half, worldY - half) &&
        IsWalkableWorld(worldX + half, worldY - half) &&
        IsWalkableWorld(worldX - half, worldY + half) &&
        IsWalkableWorld(worldX + half, worldY + half);
}

bool LoadTileMap(const std::string& filePath, TileMap& out) {
    std::ifstream file(filePath);
    if (!file.is_open()) {
        SDL_Log("Khong the mo file map: %s", filePath.c_str());
        return false;
    }

    std::vector<Tile> loadedMap;
    std::vector<SpawnPoint> spawnTiles; // toạ độ ô; đổi sang pixel khi đã biết kích thước map
    std::vector<SpawnPoint> enemyTiles;
    std::vector<MineSpawn> loadedMines;
    std::vector<BuildingSpawn> loadedBuildings;
    int loadedGold = 0;
    std::string line;
    int rows = 0, cols = 0;
    const int maxTileCode = static_cast<int>(Tile::Rock);
    while (std::getline(file, line)) {
        const auto first = line.find_first_not_of(" \t\r");
        if (first == std::string::npos || line[first] == '#') continue;

        if (line[first] == '@') {
            // Tách thành các từ: "@tên tham_số...". Tham số nào cũng đọc chặt (dataparse::Parse*).
            std::istringstream directive(line.substr(first + 1));
            std::string name;
            std::vector<std::string> args;
            directive >> name;
            for (std::string token; directive >> token;) args.push_back(token);
            auto bad = [&](const char* why) {
                SDL_Log("Dong lenh trong map khong hop le (%s): %s", why, line.c_str());
                return false;
            };
            if (name.empty()) return bad("thieu ten lenh");

            if (name == "spawn" || name == "enemy" || name == "target") {
                // @spawn / @enemy <cột> <hàng> [LoạiĐơnVị]
                float a = 0.0f, b = 0.0f;
                if (args.size() < 2 || !dataparse::ParseFloat(args[0], a) || !dataparse::ParseFloat(args[1], b)) return bad("can <cot> <hang>");
                if (args.size() > 3) return bad("co tham so thua");
                const std::string unitType = args.size() == 3 ? args[2] : std::string();
                (name == "spawn" ? spawnTiles : enemyTiles).push_back({ { a, b }, unitType });
            }
            else if (name == "gold") {
                // @gold <số>: vàng ban đầu
                int amount = 0;
                if (args.size() != 1 || !dataparse::ParseInt(args[0], amount) || amount < 0) return bad("can mot so nguyen >= 0");
                loadedGold = amount;
            }
            else if (name == "mine") {
                // @mine <cột> <hàng> [lượng]
                MineSpawn m;
                if (args.size() < 2 || args.size() > 3 || !dataparse::ParseInt(args[0], m.col) || !dataparse::ParseInt(args[1], m.row)) {
                    return bad("can <cot> <hang> [luong] la so nguyen");
                }
                if (args.size() == 3 && (!dataparse::ParseInt(args[2], m.amount) || m.amount <= 0)) return bad("luong phai la so nguyen > 0");
                loadedMines.push_back(m);
            }
            else if (name == "building") {
                // @building <Loại> <cột> <hàng> [player|enemy]
                BuildingSpawn bs;
                if (args.size() < 3 || args.size() > 4 || !dataparse::ParseInt(args[1], bs.col) || !dataparse::ParseInt(args[2], bs.row)) {
                    return bad("can <Loai> <cot> <hang> [player|enemy], cot/hang la so nguyen");
                }
                bs.type = args[0];
                if (args.size() == 4) {
                    if (args[3] == "player") bs.team = Team::Player;
                    else if (args[3] == "enemy") bs.team = Team::Enemy;
                    else return bad("phe phai la player hoac enemy");
                }
                loadedBuildings.push_back(bs);
            }
            else {
                SDL_Log("Lenh map khong ro: @%s", name.c_str());
                return false;
            }
            continue;
        }

        std::istringstream stream(line);
        std::vector<Tile> row;
        int tile = 0;
        while (stream >> tile) {
            if (tile < 0 || tile > maxTileCode) {
                SDL_Log("Gia tri tile khong hop le (chi chap nhan 0..%d).", maxTileCode);
                return false;
            }
            row.push_back(static_cast<Tile>(tile));
        }
        if (!stream.eof() || row.empty()) {
            SDL_Log("Dong map.txt chua du lieu khong hop le.");
            return false;
        }
        if (cols == 0) cols = static_cast<int>(row.size());
        if (static_cast<int>(row.size()) != cols) {
            SDL_Log("Cac dong trong map.txt phai co cung so cot.");
            return false;
        }
        loadedMap.insert(loadedMap.end(), row.begin(), row.end());
        ++rows;
    }

    if (rows == 0 || cols == 0) {
        SDL_Log("map.txt rong hoac khong co du lieu.");
        return false;
    }

    // Đổi toạ độ ô -> pixel; bỏ qua điểm nằm ngoài bản đồ.
    const float ts = out.tileSize;
    auto convert = [&](const std::vector<SpawnPoint>& in, const char* label) {
        std::vector<SpawnPoint> result;
        for (const auto& s : in) {
            const bool inside = s.pos.x >= 0.0f && s.pos.y >= 0.0f &&
                s.pos.x < static_cast<float>(cols) && s.pos.y < static_cast<float>(rows);
            if (!inside) {
                SDL_Log("@%s (%.1f, %.1f) nam ngoai map, bo qua.", label, s.pos.x, s.pos.y);
                continue;
            }
            result.push_back({ { s.pos.x * ts, s.pos.y * ts }, s.unitType });
        }
        return result;
    };
    std::vector<SpawnPoint> spawns = convert(spawnTiles, "spawn");
    std::vector<SpawnPoint> enemies = convert(enemyTiles, "enemy");

    out.rows = rows;
    out.cols = cols;
    out.data = std::move(loadedMap);
    out.spawns = std::move(spawns);
    out.enemySpawns = std::move(enemies);

    // Mỏ và công trình: chỉ cần ô góc trên-trái nằm trong bản đồ ở đây; kích thước và địa hình được kiểm tra khi dựng ván (game/World.cpp) vì cần bảng loại công trình.
    auto insideMap = [&](int r, int c) { return r >= 0 && c >= 0 && r < rows && c < cols; };
    out.mines.clear();
    for (const auto& m : loadedMines) {
        if (!insideMap(m.row, m.col)) { SDL_Log("@mine (%d, %d) nam ngoai map, bo qua.", m.col, m.row); continue; }
        out.mines.push_back(m);
    }
    out.buildings.clear();
    for (const auto& b : loadedBuildings) {
        if (!insideMap(b.row, b.col)) { SDL_Log("@building %s (%d, %d) nam ngoai map, bo qua.", b.type.c_str(), b.col, b.row); continue; }
        out.buildings.push_back(b);
    }
    out.startGold = loadedGold;
    out.occupied.clear(); // lớp ô bị chiếm thuộc ván đang chơi, không thuộc file map
    return true;
}
