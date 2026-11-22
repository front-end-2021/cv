#include "TileMap.h"
#include <SDL3/SDL.h>
#include <cmath>
#include <fstream>
#include <sstream>
#include <utility>

bool TileMap::IsWalkableTile(int row, int col) const {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return false; // Ngoài bản đồ
    const Tile t = data[static_cast<size_t>(row) * static_cast<size_t>(cols) + static_cast<size_t>(col)];
    return t != Tile::Water && t != Tile::Rock; // Nước và đá không đi được
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
    std::string line;
    int rows = 0, cols = 0;
    const int maxTileCode = static_cast<int>(Tile::Rock);
    while (std::getline(file, line)) {
        const auto first = line.find_first_not_of(" \t\r");
        if (first == std::string::npos || line[first] == '#') continue;

        if (line[first] == '@') {
            std::istringstream directive(line.substr(first + 1));
            std::string name;
            float a = 0.0f, b = 0.0f;
            if (!(directive >> name >> a >> b)) {
                SDL_Log("Dong lenh trong map khong hop le: %s", line.c_str());
                return false;
            }
            std::string unitType, extra;
            directive >> unitType; // tùy chọn
            if (directive >> extra) {
                SDL_Log("Dong lenh trong map co tham so thua: %s", line.c_str());
                return false;
            }
            if (name == "spawn") {
                spawnTiles.push_back({ { a, b }, unitType });
            }
            else if (name == "enemy" || name == "target") {
                enemyTiles.push_back({ { a, b }, unitType });
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
    return true;
}
