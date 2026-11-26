#pragma once
#include "TileMap.h"

// Luật đi trên lưới dùng CHUNG cho A* (Pathfinder) và tìm đường cho cả nhóm (FlowField), để hai nơi
// luôn đồng ý với nhau thế nào là một bước đi hợp lệ và tốn bao nhiêu.
namespace pathgrid {
    constexpr int kDirCount = 8;                                       // 4 hướng thẳng rồi 4 hướng chéo
    constexpr int kDirRow[kDirCount] = { -1, 1, 0, 0, -1, -1, 1, 1 };
    constexpr int kDirCol[kDirCount] = { 0, 0, -1, 1, -1, 1, -1, 1 };
    constexpr float kDiagonalCost = 1.41421356f;

    inline float StepCost(int dir) { return dir < 4 ? 1.0f : kDiagonalCost; }

    // Từ ô (row, col) bước theo hướng `dir` có hợp lệ không: ô đến phải đi được, và bước chéo thì không được cắt góc qua ô nước/đá. Luật đối xứng nên đi ngược lại cũng hợp lệ.
    inline bool CanStep(const TileMap& map, int row, int col, int dir) {
        const int nr = row + kDirRow[dir];
        const int nc = col + kDirCol[dir];
        if (!map.IsWalkableTile(nr, nc)) return false;
        if (dir >= 4 && (!map.IsWalkableTile(nr, col) || !map.IsWalkableTile(row, nc))) return false;
        return true;
    }
}
