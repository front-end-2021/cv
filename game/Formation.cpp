#include "game/Formation.h"
#include <algorithm>
#include <cmath>

std::vector<Waypoint> ComputeFormationSlots(int count, float centerX, float centerY, float spacing,
    float minX, float minY, float maxX, float maxY) {
    std::vector<Waypoint> slots;
    if (count <= 0) return slots;
    slots.reserve(static_cast<size_t>(count));

    const int cols = static_cast<int>(std::ceil(std::sqrt(static_cast<float>(count))));
    const int rows = static_cast<int>(std::ceil(static_cast<float>(count) / static_cast<float>(cols)));

    const float totalWidth = static_cast<float>(cols - 1) * spacing;
    const float totalHeight = static_cast<float>(rows - 1) * spacing;
    const float startX = centerX - totalWidth / 2.0f;
    const float startY = centerY - totalHeight / 2.0f;

    for (int i = 0; i < count; ++i) {
        const int r = i / cols;
        const int c = i % cols;
        const int unitsInThisRow = (r == rows - 1) ? (count - r * cols) : cols;
        const float rowOffsetX = static_cast<float>(cols - unitsInThisRow) * spacing / 2.0f;

        slots.push_back({
            std::clamp(startX + static_cast<float>(c) * spacing + rowOffsetX, minX, maxX),
            std::clamp(startY + static_cast<float>(r) * spacing, minY, maxY) });
    }
    return slots;
}
