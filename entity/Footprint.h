#pragma once
#include <algorithm>
#include <cmath>

// Hình chữ nhật mà công trình / mỏ chiếm trên lưới ô, kèm toạ độ pixel đã tính sẵn.
// Cạnh trái và trên thuộc hình, cạnh phải và dưới thì không (giống cách TileMap chia ô).
struct Footprint {
    int row = 0;    // ô góc trên-trái
    int col = 0;
    int w = 1;      // số ô chiếm theo chiều ngang
    int h = 1;      // số ô chiếm theo chiều dọc
    float left = 0.0f, top = 0.0f, right = 0.0f, bottom = 0.0f; // pixel thế giới

    static Footprint Make(int row, int col, int w, int h, float tileSize) {
        Footprint f;
        f.row = row;
        f.col = col;
        f.w = w;
        f.h = h;
        f.left = static_cast<float>(col) * tileSize;
        f.top = static_cast<float>(row) * tileSize;
        f.right = static_cast<float>(col + w) * tileSize;
        f.bottom = static_cast<float>(row + h) * tileSize;
        return f;
    }

    float CenterX() const { return (left + right) * 0.5f; }
    float CenterY() const { return (top + bottom) * 0.5f; }

    bool ContainsTile(int r, int c) const { return r >= row && r < row + h && c >= col && c < col + w; }
    bool ContainsPoint(float px, float py) const { return px >= left && px < right && py >= top && py < bottom; }

    // Khoảng cách từ điểm tới hình chữ nhật (0 nếu điểm nằm trong hoặc trên cạnh).
    float DistanceToPoint(float px, float py) const {
        const float dx = std::max({ left - px, 0.0f, px - right });
        const float dy = std::max({ top - py, 0.0f, py - bottom });
        return std::sqrt(dx * dx + dy * dy);
    }
};
