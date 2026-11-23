#pragma once
#include <utility>
#include <vector>
#include "Common.h"
#include "TileMap.h"

// Tìm đường cho CẢ NHÓM bằng một lần tìm kiếm chung thay vì mỗi lính một lần A*.
//
// Dijkstra chạy NGƯỢC từ ô đích ra mọi hướng và dừng ngay khi mọi lính trong nhóm đã được nối vào.
// Kết quả là một cây đường đi ngắn nhất: mỗi ô nhớ ô kế tiếp trên đường về đích. Lính nào cũng chỉ cần
// lần theo cây từ ô của mình (BuildPath), nên chi phí tìm kiếm không tăng theo số lính.
// (Đây là trường chi phí dùng tạm cho MỘT lệnh, không giữ lại để lính tra mỗi tick.)
// Dùng cùng luật đi và chi phí với A* (PathGrid.h) nên đường đi ra có độ dài như nhau.
class FlowField {
public:
    // Dựng cây về ô (goalRow, goalCol). `starts` là ô của các lính cần đường (rỗng = dựng cho cả bản đồ).
    // false nếu ô đích không đi được.
    bool Build(const TileMap& map, int goalRow, int goalCol, const std::vector<std::pair<int, int>>& starts);

    // Ô (row, col) đã được nối vào cây (tức là có đường tới đích).
    bool Reaches(int row, int col) const;

    // Tâm các ô từ ô kế tiếp của (row, col) tới ô đích. false nếu ô đó không nối được tới đích.
    bool ExtractPath(int row, int col, std::vector<Waypoint>& out) const;

    // Đường cho một lính đứng ở (startX, startY) tới vị trí đội hình `slot`: lần theo cây rồi rẽ thẳng tới
    // `slot` ở mốc đầu tiên nhìn thấy nó, và làm mượt. false nếu không dựng được (lính không nối được tới
    // đích, hoặc `slot` khuất sau tường): khi đó hãy xin đường riêng bằng A*.
    bool BuildPath(const TileMap& map, float startX, float startY, Waypoint slot, std::vector<Waypoint>& out) const;

    int ExpandedCount() const { return expanded_; }

private:
    int rows_ = 0;
    int cols_ = 0;
    float tileSize_ = 0.0f;
    int goalIdx_ = -1;
    int expanded_ = 0;
    std::vector<float> dist_;
    std::vector<int> next_;       // ô kế tiếp trên đường về đích (-1: đích hoặc chưa tới)
    std::vector<char> closed_;
};
