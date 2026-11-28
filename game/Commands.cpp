#include "game/Commands.h"
#include <algorithm>
#include <cctype>
#include <cmath>
#include <string>
#include "game/Construction.h"
#include "game/Economy.h"
#include "game/Orders.h"
#include "game/Production.h"
#include "game/Selection.h"

std::vector<int> TrainableUnitTypes(const GameState& g) {
    std::vector<int> types;
    for (const auto& b : g.buildings) {
        if (!b.selected || b.team != Team::Player || !b.complete || !b.producesUnits) continue;
        for (const auto& name : g.buildingTypes.Get(b.typeId).produces) {
            const int idx = g.unitTypes.IndexOf(name);
            if (idx >= 0 && std::find(types.begin(), types.end(), idx) == types.end()) types.push_back(idx);
        }
    }
    return types;
}

bool BeginPlacement(GameState& g, int buildingType) {
    if (buildingType < 0) buildingType = 0;
    if (buildingType >= g.buildingTypes.Count()) {
        g.Notify("No such building type");
        return false;
    }
    if (SelectedWorkerIds(g).empty()) {
        g.Notify("Select a worker first");
        return false;
    }
    g.attackMoveArmed = false; // hai chế độ "chờ bấm chuột trái" không đi cùng nhau
    g.placement.active = true;
    g.placement.buildingType = buildingType;
    g.placement.status = PlaceResult::Ok;
    return true;
}

void CancelPlacement(GameState& g) {
    g.placement.active = false;
}

void UpdatePlacement(GameState& g, float mouseX, float mouseY) {
    PlacementMode& p = g.placement;
    if (!p.active) return;
    if (p.buildingType < 0 || p.buildingType >= g.buildingTypes.Count()) { p.active = false; return; }
    const BuildingType& type = g.buildingTypes.Get(p.buildingType);

    // Tâm công trình bám theo con trỏ, rồi làm tròn về lưới ô.
    const float ts = g.map.tileSize;
    const float worldX = mouseX + g.camera.x;
    const float worldY = mouseY + g.camera.y;
    p.col = static_cast<int>(std::lround((worldX - static_cast<float>(type.width) * ts * 0.5f) / ts));
    p.row = static_cast<int>(std::lround((worldY - static_cast<float>(type.height) * ts * 0.5f) / ts));

    p.status = CheckPlacement(g, p.buildingType, p.row, p.col, Team::Player);
    if (p.status == PlaceResult::Ok && !CanAfford(g, Team::Player, type.cost)) p.status = PlaceResult::NotEnoughGold;
    if (p.status == PlaceResult::Ok && SelectedWorkerIds(g).empty()) p.status = PlaceResult::NoWorker;
}

bool ConfirmPlacement(GameState& g) {
    PlacementMode& p = g.placement;
    if (!p.active) return false;
    PlaceResult result = PlaceResult::Ok;
    if (!IssueBuildOrder(g, p.buildingType, p.row, p.col, &result)) {
        g.Notify(DescribePlaceResult(result));
        return false;
    }
    p.active = false;
    return true;
}

bool BeginAttackMoveMode(GameState& g) {
    bool anyUnit = false;
    for (const auto& u : g.units) {
        if (u.selected && u.team == Team::Player && u.IsAlive()) { anyUnit = true; break; }
    }
    if (!anyUnit) {
        g.Notify("Select units first");
        return false;
    }
    g.attackMoveArmed = true;
    return true;
}

void CancelAttackMoveMode(GameState& g) {
    g.attackMoveArmed = false;
}

bool ConfirmAttackMove(GameState& g, float worldX, float worldY) {
    if (!g.attackMoveArmed) return false;
    g.attackMoveArmed = false;
    if (IssueAttackMoveOrder(g, worldX, worldY) == 0) {
        g.Notify("Select units first");
        return false;
    }
    return true;
}

void HandleStopKey(GameState& g) {
    if (g.placement.active) return;
    g.attackMoveArmed = false;
    IssueStopOrder(g);
}

void HandleHoldKey(GameState& g) {
    if (g.placement.active) return;
    g.attackMoveArmed = false;
    IssueHoldOrder(g);
}

void HandleAttackMoveKey(GameState& g) {
    if (g.placement.active) return;
    if (g.attackMoveArmed) CancelAttackMoveMode(g);
    else BeginAttackMoveMode(g);
}

void HandleBuildKey(GameState& g) {
    if (g.placement.active) CancelPlacement(g);
    else BeginPlacement(g, -1);
}

char BuildingHotkeyLabel(int buildingType) {
    if (buildingType < 0 || buildingType >= kBuildingHotkeyCount) return 0;
    return static_cast<char>(std::toupper(static_cast<unsigned char>(kBuildingHotkeys[buildingType])));
}

void ChooseBuildingType(GameState& g, int buildingType) {
    if (!g.placement.active) return;
    if (buildingType < 0 || buildingType >= g.buildingTypes.Count()) return;
    g.placement.buildingType = buildingType;
}

bool HandleBuildingHotkey(GameState& g, char key) {
    if (!g.placement.active) return false;
    const char lower = static_cast<char>(std::tolower(static_cast<unsigned char>(key)));
    for (int i = 0; i < kBuildingHotkeyCount; ++i) {
        if (kBuildingHotkeys[i] != lower) continue;
        ChooseBuildingType(g, i);
        return true;
    }
    return false;
}

void HandleNumberKey(GameState& g, int number) {
    if (number < 1) return;
    const int index = number - 1;

    // Đang đặt nhà: phím số không còn chọn loại công trình (đã chuyển sang h / a / b, xem HandleBuildingHotkey), cũng không gọi nhóm
    // để vùng chọn thợ không bị đổi giữa chừng.
    if (g.placement.active) return;

    const std::vector<int> options = TrainableUnitTypes(g);
    if (index >= static_cast<int>(options.size())) {
        // Không phải phím huấn luyện (không chọn công trình nào, hoặc số lớn hơn số loại nó huấn luyện được): gọi nhóm điều khiển.
        RecallControlGroup(g, number);
        return;
    }
    const int unitType = options[static_cast<size_t>(index)];

    // Công trình đang chọn huấn luyện được loại này mà hàng đợi ngắn nhất.
    const Building* best = nullptr;
    for (const auto& b : g.buildings) {
        if (!b.selected || b.team != Team::Player || !b.complete || !CanProduce(g, b, unitType)) continue;
        if (!best || b.queue.size() < best->queue.size()) best = &b;
    }
    if (!best) return;
    const EnqueueResult r = EnqueueUnit(g, best->id, unitType);
    if (r != EnqueueResult::Ok) g.Notify(DescribeEnqueueResult(r));
}

void HandleSaveGroupKey(GameState& g, int number) {
    if (number < 1 || number > kControlGroupCount) return;
    const int saved = SaveControlGroup(g, number);
    if (saved == 0) {
        g.Notify("Select units to save a group");
        return;
    }
    g.Notify("Group " + std::to_string(number) + " saved: " + std::to_string(saved) + (saved == 1 ? " unit" : " units"));
}

void HandleCancelKey(GameState& g) {
    if (g.placement.active) { CancelPlacement(g); return; }

    // Công trình xây dở đang chọn: hủy (hoàn tiền).
    std::vector<EntityId> unfinished;
    for (const auto& b : g.buildings) {
        if (b.selected && b.team == Team::Player && !b.complete) unfinished.push_back(b.id);
    }
    if (!unfinished.empty()) {
        for (EntityId id : unfinished) CancelConstruction(g, id);
        g.Notify("Construction cancelled (75% refund)");
        return;
    }

    // Không thì hủy đơn vị cuối hàng đợi của công trình đầu tiên đang chọn mà có hàng đợi.
    for (const auto& b : g.buildings) {
        if (b.selected && b.team == Team::Player && !b.queue.empty()) {
            CancelQueuedUnit(g, b.id, -1);
            return;
        }
    }
}
