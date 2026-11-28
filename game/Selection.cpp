#include "game/Selection.h"
#include <algorithm>
#include <cmath>

namespace {
    // ids tăng dần (ta luôn duyệt g.units / g.buildings theo thứ tự id) nên tìm nhị phân được.
    bool InSortedIds(const std::vector<EntityId>& ids, EntityId id) {
        return std::binary_search(ids.begin(), ids.end(), id);
    }

    bool IsSelectableUnit(const Unit& u) { return u.team == Team::Player && u.IsAlive(); }

    // Tính lại vùng chọn từ khung kéo hiện tại (và vùng chọn cũ nếu đang cộng thêm bằng Shift).
    void ApplySelectionBox(GameState& g) {
        SDL_FRect rect = GetNormalizedRect(g.selection.startX, g.selection.startY,
            g.selection.endX, g.selection.endY);
        const bool click = rect.w < 3.0f && rect.h < 3.0f; // bấm đơn lẻ, chưa kéo
        if (click) {
            rect.w = 3.0f;
            rect.h = 3.0f;
        }
        const bool additive = g.selection.additive;
        // `hit`: trúng khung kéo; `wasSelected`: đã được chọn từ trước khi bắt đầu kéo (chỉ có nghĩa khi cộng thêm).
        auto decide = [&](bool hit, bool wasSelected) {
            if (!additive) return hit;
            if (click) return hit ? !wasSelected : wasSelected; // Shift + bấm: đảo chọn thứ dưới con trỏ
            return hit || wasSelected;                            // Shift + kéo: cộng thêm
        };

        // Chỉ chọn được lính phe ta còn sống.
        const float half = kSquareSize / 2.0f;
        bool anyUnit = false;
        for (auto& u : g.units) {
            SDL_FRect unitRect = { u.x - half, u.y - half, kSquareSize, kSquareSize };
            const bool hit = SDL_HasRectIntersectionFloat(&rect, &unitRect);
            u.selected = IsSelectableUnit(u) && decide(hit, InSortedIds(g.selection.baseUnits, u.id));
            anyUnit = anyUnit || u.selected;
        }

        // Công trình phe ta chỉ được chọn khi không có lính nào được chọn (lính được ưu tiên, như các game RTS khác).
        for (auto& b : g.buildings) {
            SDL_FRect buildingRect = { b.fp.left, b.fp.top, b.fp.right - b.fp.left, b.fp.bottom - b.fp.top };
            const bool hit = SDL_HasRectIntersectionFloat(&rect, &buildingRect);
            b.selected = !anyUnit && b.team == Team::Player && decide(hit, InSortedIds(g.selection.baseBuildings, b.id));
        }
    }

    void ClearSelectionBox(SelectionBox& s) {
        s.active = false;
        s.additive = false;
        s.baseUnits.clear();
        s.baseBuildings.clear();
    }
}

SDL_FRect GetNormalizedRect(float x1, float y1, float x2, float y2) {
    SDL_FRect r;
    r.x = std::min(x1, x2);
    r.y = std::min(y1, y2);
    r.w = std::abs(x2 - x1);
    r.h = std::abs(y2 - y1);
    return r;
}

void DeselectAll(GameState& g) {
    for (auto& u : g.units) u.selected = false;
    for (auto& b : g.buildings) b.selected = false;
}

void BeginSelection(GameState& g, float screenX, float screenY, bool additive) {
    ClearSelectionBox(g.selection);
    g.selection.active = true;
    g.selection.startX = screenX + g.camera.x;
    g.selection.startY = screenY + g.camera.y;
    g.selection.endX = g.selection.startX;
    g.selection.endY = g.selection.startY;
    g.selection.additive = additive;
    if (!additive) {
        DeselectAll(g);
        return;
    }
    for (const auto& u : g.units) {
        if (u.selected && IsSelectableUnit(u)) g.selection.baseUnits.push_back(u.id);
    }
    for (const auto& b : g.buildings) {
        if (b.selected && b.team == Team::Player) g.selection.baseBuildings.push_back(b.id);
    }
}

void EndSelection(GameState& g) {
    if (g.selection.active) ApplySelectionBox(g); // chốt lần cuối: nhả chuột ngay trong khung hình bấm vẫn tính
    ClearSelectionBox(g.selection);
}

void UpdateSelection(GameState& g, float mouseX, float mouseY) {
    if (!g.selection.active) return;
    g.selection.endX = mouseX + g.camera.x;
    g.selection.endY = mouseY + g.camera.y;
    ApplySelectionBox(g);
}

bool SelectOnlyUnit(GameState& g, EntityId id) {
    const Unit* u = g.FindUnit(id);
    if (!u || !IsSelectableUnit(*u)) return false;
    DeselectAll(g);
    g.FindUnit(id)->selected = true;
    return true;
}

void RemoveUnitFromSelection(GameState& g, EntityId id) {
    if (Unit* u = g.FindUnit(id)) u->selected = false;
}

int SaveControlGroup(GameState& g, int number) {
    if (number < 1 || number > kControlGroupCount) return 0;
    std::vector<EntityId> ids;
    for (const auto& u : g.units) {
        if (u.selected && IsSelectableUnit(u)) ids.push_back(u.id);
    }
    if (ids.empty()) return 0;
    const int saved = static_cast<int>(ids.size());
    g.controlGroups[static_cast<size_t>(number - 1)] = std::move(ids);
    return saved;
}

int RecallControlGroup(GameState& g, int number) {
    if (number < 1 || number > kControlGroupCount) return 0;
    std::vector<EntityId>& group = g.controlGroups[static_cast<size_t>(number - 1)];
    // Dọn lính đã chết / đã biến mất khỏi nhóm.
    group.erase(std::remove_if(group.begin(), group.end(), [&](EntityId id) {
        const Unit* u = g.FindUnit(id);
        return !u || !IsSelectableUnit(*u);
    }), group.end());
    if (group.empty()) return 0;

    ClearSelectionBox(g.selection); // đang kéo chọn dở mà gọi nhóm: bỏ khung kéo, nếu không khung sẽ ghi đè vùng chọn ở khung hình sau
    DeselectAll(g);
    for (EntityId id : group) g.FindUnit(id)->selected = true;
    return static_cast<int>(group.size());
}

int ControlGroupSize(const GameState& g, int number) {
    if (number < 1 || number > kControlGroupCount) return 0;
    int n = 0;
    for (EntityId id : g.controlGroups[static_cast<size_t>(number - 1)]) {
        const Unit* u = g.FindUnit(id);
        if (u && IsSelectableUnit(*u)) ++n;
    }
    return n;
}

bool IsControlGroupSelected(const GameState& g, int number) {
    const int size = ControlGroupSize(g, number);
    if (size == 0) return false;
    int selected = 0, inGroupSelected = 0;
    for (const auto& u : g.units) {
        if (u.selected && IsSelectableUnit(u)) ++selected;
    }
    for (EntityId id : g.controlGroups[static_cast<size_t>(number - 1)]) {
        const Unit* u = g.FindUnit(id);
        if (u && IsSelectableUnit(*u) && u->selected) ++inGroupSelected;
    }
    return selected == size && inGroupSelected == size;
}

void FocusCameraOnSelection(GameState& g, int windowW, int windowH) {
    // Thứ tự ưu tiên: lính đang chọn -> công trình đang chọn -> lính phe ta còn sống -> công trình phe ta -> thực thể bất kỳ.
    const Entity* focus = nullptr;
    auto pick = [&](auto& list, auto pred) {
        for (const auto& e : list) {
            if (!focus && pred(e)) focus = &e;
        }
    };
    pick(g.units, [](const Unit& u) { return u.selected; });
    pick(g.buildings, [](const Building& b) { return b.selected; });
    pick(g.units, [](const Unit& u) { return u.team == Team::Player && u.IsAlive(); });
    pick(g.buildings, [](const Building& b) { return b.team == Team::Player; });
    pick(g.units, [](const Unit&) { return true; });
    pick(g.buildings, [](const Building&) { return true; });
    if (!focus) return;
    // Căn giữa trong phần màn hình nhìn thấy được (trừ phần HUD đáy che).
    const float visibleH = static_cast<float>(windowH) - g.camera.bottomInset;
    g.camera.ClampCamera(focus->x - windowW / 2.0f, focus->y - visibleH / 2.0f,
        windowW, windowH, g.map.WorldW(), g.map.WorldH());
}
