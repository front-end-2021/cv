// Kiểm thử giao diện & điều khiển của bước 5: Shift+click thêm vào vùng chọn, nhóm điều khiển Ctrl+số, HUD (bảng thông tin + nút lệnh).
// Không cần cửa sổ / SDL thật. Gồm:
//   - game/Selection.*: chọn thay thế / cộng thêm bằng Shift (kéo và bấm đơn lẻ), lính thắng công trình, nhả chuột nhanh, chọn riêng một lính
//   - nhóm điều khiển: lưu / gọi / lính chết / nhiều nhóm / ván mới; phím Ctrl+số và số (game/Commands.*) kể cả xung đột với phím huấn luyện
//   - camera chừa chỗ cho HUD ở đáy
//   - game/Hud.*: bố cục (không tràn cửa sổ, không đè nhau), nút theo thứ đang chọn, bật/tắt nút theo vàng và slot quân, vùng chặn chuột,
//     bấm từng loại nút, lưới ô lính, ô hàng đợi, bấm nhóm
//   - stress ngẫu nhiên: chọn / lưu / gọi / bấm HUD bừa, kiểm các bất biến
// Chạy: UiTests (thêm --gtest_filter=... để chọn). Số ván stress: biến môi trường UI_STRESS_SCENARIOS (mặc định 60).
#include <gtest/gtest.h>
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <set>
#include <string>
#include <vector>

#include "TileMap.h"
#include "camera/camera.h"
#include "entity/UnitType.h"
#include "game/Commands.h"
#include "game/Construction.h"
#include "game/Economy.h"
#include "game/GameState.h"
#include "game/Game.h"
#include "game/Hud.h"
#include "game/Orders.h"
#include "game/PathService.h"
#include "game/Production.h"
#include "game/Render.h"
#include "game/Selection.h"
#include "game/Simulation.h"
#include "game/World.h"

namespace {
    // ---------------------------------------------------------------------------
    // Dụng cụ chung
    // ---------------------------------------------------------------------------
    struct Rng {
        std::uint32_t s;
        explicit Rng(std::uint32_t seed) : s(seed ? seed : 1u) {}
        std::uint32_t Next() { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return s; }
        int Int(int lo, int hi) { return lo + static_cast<int>(Next() % static_cast<std::uint32_t>(hi - lo + 1)); }
        bool Chance(int percent) { return Int(1, 100) <= percent; }
    };

    TileMap MakeOpenMap(int rows, int cols) {
        TileMap m;
        m.rows = rows;
        m.cols = cols;
        m.tileSize = 64.0f;
        m.data.assign(static_cast<size_t>(rows) * static_cast<size_t>(cols), Tile::Grass);
        return m;
    }

    Waypoint Center(int row, int col) { return { (static_cast<float>(col) + 0.5f) * 64.0f, (static_cast<float>(row) + 0.5f) * 64.0f }; }

    GameState MakeGame(int gold = 0) {
        GameState g;
        g.map = MakeOpenMap(16, 24);   // 1536 x 1024 px
        g.unitTypes.LoadBuiltInDefaults();
        g.buildingTypes.LoadBuiltInDefaults();
        g.economyActive = true;
        g.Gold(Team::Player) = gold;
        return g;
    }

    int UnitIdx(const GameState& g, const char* name) { return g.unitTypes.IndexOf(name); }
    int BuildIdx(const GameState& g, const char* name) { return g.buildingTypes.IndexOf(name); }

    EntityId Spawn(GameState& g, Team team, Waypoint p, const char* type = "Soldier") {
        return g.AddUnit(p.x, p.y, team, UnitIdx(g, type)).id;
    }
    // Lính phe ta xếp thành hàng ngang cách nhau 100px trên dòng y (đủ xa để một cú bấm chỉ trúng một lính).
    EntityId SpawnAt(GameState& g, float x, float y, Team team = Team::Player, const char* type = "Soldier") {
        return g.AddUnit(x, y, team, UnitIdx(g, type)).id;
    }
    Unit& U(GameState& g, EntityId id) { return *g.FindUnit(id); }
    bool Sel(const GameState& g, EntityId id) { const Unit* u = g.FindUnit(id); return u && u->selected; }
    int SelectedUnitCount(const GameState& g) { int n = 0; for (const auto& u : g.units) if (u.selected) ++n; return n; }
    int SelectedBuildingCount(const GameState& g) { int n = 0; for (const auto& b : g.buildings) if (b.selected) ++n; return n; }

    Building& Prebuilt(GameState& g, const char* type, int row, int col, Team team = Team::Player) {
        PlaceResult r = PlaceResult::Ok;
        Building* b = PlaceBuilding(g, BuildIdx(g, type), row, col, team, true, &r);
        EXPECT_TRUE(b != nullptr) << "prebuilt " << type << " failed, result " << static_cast<int>(r);
        return *g.FindBuilding(b ? b->id : g.buildings.back().id);
    }
    Building& Foundation(GameState& g, const char* type, int row, int col) {
        PlaceResult r = PlaceResult::Ok;
        Building* b = PlaceBuilding(g, BuildIdx(g, type), row, col, Team::Player, false, &r);
        EXPECT_TRUE(b != nullptr) << "foundation " << type << " failed, result " << static_cast<int>(r);
        return *g.FindBuilding(b ? b->id : g.buildings.back().id);
    }
    void SelectOnlyBuilding(GameState& g, EntityId id) { DeselectAll(g); g.FindBuilding(id)->selected = true; }
    void SelectOnly(GameState& g, std::initializer_list<EntityId> ids) { DeselectAll(g); for (EntityId id : ids) U(g, id).selected = true; }

    // Camera ở (0,0) nên tọa độ màn hình = tọa độ thế giới.
    void Click(GameState& g, float x, float y, bool shift) {
        BeginSelection(g, x, y, shift);
        UpdateSelection(g, x, y);
        EndSelection(g);
    }
    void Drag(GameState& g, float x1, float y1, float x2, float y2, bool shift) {
        BeginSelection(g, x1, y1, shift);
        UpdateSelection(g, (x1 + x2) / 2.0f, (y1 + y2) / 2.0f);
        UpdateSelection(g, x2, y2);
        EndSelection(g);
    }
    void ClickUnit(GameState& g, EntityId id, bool shift) { Click(g, U(g, id).x, U(g, id).y, shift); }

    constexpr int kW = 1280;
    constexpr int kH = 720;

    // Bấm vào giữa nút đầu tiên khớp (action, arg; arg < 0 = không xét). Trả về HandleHudClick; false nếu không có nút đó.
    bool ClickHud(GameState& g, HudAction action, int arg = -1, bool shift = false, int w = kW, int h = kH) {
        const HudLayout L = BuildHudLayout(g, w, h);
        for (const auto& b : L.buttons) {
            if (b.action == action && (arg < 0 || b.arg == arg)) {
                return HandleHudClick(g, w, h, b.rect.x + b.rect.w / 2.0f, b.rect.y + b.rect.h / 2.0f, shift);
            }
        }
        EXPECT_TRUE(false) << "no HUD button for action " << static_cast<int>(action) << " arg " << arg;
        return false;
    }
    bool ClickUnitIcon(GameState& g, EntityId id, bool shift) {
        const HudLayout L = BuildHudLayout(g, kW, kH);
        for (const auto& b : L.buttons) {
            if (b.action == HudAction::SelectUnit && b.id == id) {
                return HandleHudClick(g, kW, kH, b.rect.x + b.rect.w / 2.0f, b.rect.y + b.rect.h / 2.0f, shift);
            }
        }
        EXPECT_TRUE(false) << "no unit icon for id " << id;
        return false;
    }

    const HudButton* FindButton(const HudLayout& L, HudAction action, int arg = -1) {
        for (const auto& b : L.buttons) {
            if (b.action == action && (arg < 0 || b.arg == arg)) return &b;
        }
        return nullptr;
    }
    int CountButtons(const HudLayout& L, HudAction action) {
        int n = 0;
        for (const auto& b : L.buttons) if (b.action == action) ++n;
        return n;
    }

    bool Overlaps(const SDL_FRect& a, const SDL_FRect& b) {
        return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    }
    bool InsideRect(const SDL_FRect& outer, const SDL_FRect& r) {
        return r.x >= outer.x - 0.01f && r.y >= outer.y - 0.01f && r.x + r.w <= outer.x + outer.w + 0.01f && r.y + r.h <= outer.y + outer.h + 0.01f;
    }

    void RunSteps(GameState& g, int ticks) { for (int i = 0; i < ticks; ++i) StepSimulation(g, kTickDt); }

    // Ván có Townhall (slot + kho) để huấn luyện được.
    GameState EconomyGame(int gold = 500) {
        GameState g = MakeGame(gold);
        Prebuilt(g, "Townhall", 2, 2);
        return g;
    }
    EntityId TownhallId(const GameState& g) { return g.buildings.front().id; }
}

// ===========================================================================
// Shift + click / kéo: thêm vào vùng chọn
// ===========================================================================
TEST(SelectionShift, PlainBoxStillReplacesTheSelection) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a });
    Click(g, 300, 100, false);
    EXPECT_FALSE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
}

TEST(SelectionShift, ShiftClickAddsAnotherUnit) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100), c = SpawnAt(g, 500, 100);
    SelectOnly(g, { a });
    Click(g, 300, 100, true);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
    EXPECT_FALSE(Sel(g, c));
}

TEST(SelectionShift, ShiftClickCanBuildUpALargerSelectionOneByOne) {
    GameState g = MakeGame();
    std::vector<EntityId> ids;
    for (int i = 0; i < 5; ++i) ids.push_back(SpawnAt(g, 100.0f + 150.0f * static_cast<float>(i), 100));
    Click(g, 100, 100, false);
    for (int i = 1; i < 5; ++i) Click(g, 100.0f + 150.0f * static_cast<float>(i), 100, true);
    EXPECT_EQ(SelectedUnitCount(g), 5);
}

TEST(SelectionShift, ShiftClickOnASelectedUnitRemovesIt) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a, b });
    Click(g, 100, 100, true);
    EXPECT_FALSE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
}

TEST(SelectionShift, ShiftClickOnTheOnlySelectedUnitLeavesNothingSelected) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    Click(g, 100, 100, true);
    EXPECT_EQ(SelectedUnitCount(g), 0);
}

TEST(SelectionShift, ShiftDragAddsEveryUnitInsideTheBoxAndKeepsTheOldOnes) {
    GameState g = MakeGame();
    const EntityId old = SpawnAt(g, 100, 600);
    const EntityId in1 = SpawnAt(g, 300, 100), in2 = SpawnAt(g, 400, 150), out = SpawnAt(g, 900, 100);
    SelectOnly(g, { old });
    Drag(g, 250, 50, 450, 200, true);
    EXPECT_TRUE(Sel(g, old));
    EXPECT_TRUE(Sel(g, in1));
    EXPECT_TRUE(Sel(g, in2));
    EXPECT_FALSE(Sel(g, out));
}

TEST(SelectionShift, ShiftDragOverAlreadySelectedUnitsDoesNotDeselectThem) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 300, 100), b = SpawnAt(g, 400, 100);
    SelectOnly(g, { a });
    Drag(g, 250, 50, 450, 150, true);
    EXPECT_TRUE(Sel(g, a));   // kéo thì chỉ cộng thêm, không đảo chọn
    EXPECT_TRUE(Sel(g, b));
}

TEST(SelectionShift, ShiftClickOnEmptyGroundKeepsTheSelection) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a, b });
    Click(g, 900, 500, true);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
}

TEST(SelectionShift, PlainClickOnEmptyGroundStillClearsTheSelection) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    Click(g, 900, 500, false);
    EXPECT_EQ(SelectedUnitCount(g), 0);
}

TEST(SelectionShift, ShiftNeverSelectsEnemiesOrTheDead) {
    GameState g = MakeGame();
    const EntityId mine = SpawnAt(g, 100, 100);
    const EntityId foe = SpawnAt(g, 300, 100, Team::Enemy, "Grunt");
    const EntityId dead = SpawnAt(g, 500, 100);
    U(g, dead).TakeDamage(10000);
    SelectOnly(g, { mine });
    Drag(g, 0, 0, 700, 200, true);
    EXPECT_TRUE(Sel(g, mine));
    EXPECT_FALSE(Sel(g, foe));
    EXPECT_FALSE(Sel(g, dead));
}

TEST(SelectionShift, ShiftBoxKeepsOldSelectionWhileBoxMovesAcrossFrames) {
    GameState g = MakeGame();
    const EntityId old = SpawnAt(g, 100, 600), x = SpawnAt(g, 400, 100);
    SelectOnly(g, { old });
    BeginSelection(g, 350, 50, true);
    UpdateSelection(g, 450, 150);
    EXPECT_TRUE(Sel(g, x));
    EXPECT_TRUE(Sel(g, old));
    UpdateSelection(g, 360, 55);   // thu khung lại: x không còn trong khung nhưng vùng chọn cũ vẫn còn
    EXPECT_FALSE(Sel(g, x));
    EXPECT_TRUE(Sel(g, old));
    UpdateSelection(g, 450, 150);
    EXPECT_TRUE(Sel(g, x));
    EndSelection(g);
    EXPECT_TRUE(Sel(g, x));
    EXPECT_TRUE(Sel(g, old));
}

TEST(SelectionShift, UnitsBeatBuildingsEvenWhenAdding) {
    GameState g = MakeGame();
    Building& h = Prebuilt(g, "House", 8, 8);
    const EntityId hid = h.id;
    const EntityId a = SpawnAt(g, 100, 100);
    // Đang chọn lính, Shift + bấm công trình: công trình không được thêm vào.
    SelectOnly(g, { a });
    Click(g, h.x, h.y, true);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_FALSE(g.FindBuilding(hid)->selected);
    // Đang chọn công trình, Shift + bấm lính: lính thắng, công trình bị bỏ chọn.
    SelectOnlyBuilding(g, hid);
    Click(g, 100, 100, true);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_FALSE(g.FindBuilding(hid)->selected);
}

TEST(SelectionShift, ShiftClickAddsAndTogglesBuildings) {
    GameState g = MakeGame();
    const EntityId b1 = Prebuilt(g, "House", 2, 2).id;
    const EntityId b2 = Prebuilt(g, "House", 2, 8).id;
    SelectOnlyBuilding(g, b1);
    Click(g, g.FindBuilding(b2)->x, g.FindBuilding(b2)->y, true);
    EXPECT_TRUE(g.FindBuilding(b1)->selected);
    EXPECT_TRUE(g.FindBuilding(b2)->selected);
    Click(g, g.FindBuilding(b1)->x, g.FindBuilding(b1)->y, true);
    EXPECT_FALSE(g.FindBuilding(b1)->selected);
    EXPECT_TRUE(g.FindBuilding(b2)->selected);
}

TEST(SelectionShift, ShiftDragAddsBuildingsToABuildingSelection) {
    GameState g = MakeGame();
    const EntityId b1 = Prebuilt(g, "House", 2, 2).id;
    const EntityId b2 = Prebuilt(g, "House", 2, 8).id;
    SelectOnlyBuilding(g, b1);
    Drag(g, 400, 100, 700, 300, true);
    EXPECT_TRUE(g.FindBuilding(b1)->selected);
    EXPECT_TRUE(g.FindBuilding(b2)->selected);
}

TEST(SelectionShift, EnemyBuildingsAreNeverSelected) {
    GameState g = MakeGame();
    const EntityId foe = Prebuilt(g, "House", 8, 8, Team::Enemy).id;
    Click(g, g.FindBuilding(foe)->x, g.FindBuilding(foe)->y, true);
    EXPECT_FALSE(g.FindBuilding(foe)->selected);
    Click(g, g.FindBuilding(foe)->x, g.FindBuilding(foe)->y, false);
    EXPECT_FALSE(g.FindBuilding(foe)->selected);
}

TEST(SelectionShift, AUnitThatDiesMidDragLeavesTheSelection) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a, b });
    BeginSelection(g, 700, 500, true);
    U(g, a).TakeDamage(10000);
    UpdateSelection(g, 705, 505);
    EXPECT_FALSE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
    EndSelection(g);
    EXPECT_FALSE(Sel(g, a));
}

TEST(SelectionShift, ReleasingBeforeAnyUpdateStillAppliesTheClick) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    // Bấm và nhả trong cùng một khung hình (chưa có UpdateSelection nào): vẫn chọn.
    BeginSelection(g, 300, 100, false);
    EndSelection(g);
    EXPECT_TRUE(Sel(g, b));
    EXPECT_FALSE(Sel(g, a));
    // Cộng thêm cũng vậy.
    BeginSelection(g, 100, 100, true);
    EndSelection(g);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
}

TEST(SelectionShift, EndSelectionClearsTheAdditiveState) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    BeginSelection(g, 100, 100, true);
    EXPECT_TRUE(g.selection.additive);
    EXPECT_EQ(static_cast<int>(g.selection.baseUnits.size()), 1);
    EndSelection(g);
    EXPECT_FALSE(g.selection.active);
    EXPECT_FALSE(g.selection.additive);
    EXPECT_TRUE(g.selection.baseUnits.empty());
    EXPECT_TRUE(g.selection.baseBuildings.empty());
    // Lần kéo thường kế tiếp không được dính vùng chọn cũ.
    Click(g, 900, 500, false);
    EXPECT_EQ(SelectedUnitCount(g), 0);
}

TEST(SelectionShift, WorksWithAScrolledCamera) {
    GameState g = MakeGame();
    g.camera.x = 400.0f;
    g.camera.y = 200.0f;
    const EntityId a = SpawnAt(g, 500, 300), b = SpawnAt(g, 800, 300);
    SelectOnly(g, { a });
    BeginSelection(g, 800.0f - g.camera.x, 300.0f - g.camera.y, true);
    UpdateSelection(g, 800.0f - g.camera.x, 300.0f - g.camera.y);
    EndSelection(g);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
}

TEST(SelectionShift, SelectOnlyUnitAndRemoveUnitFromSelection) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    const EntityId foe = SpawnAt(g, 500, 100, Team::Enemy, "Grunt");
    const EntityId dead = SpawnAt(g, 700, 100);
    U(g, dead).TakeDamage(10000);
    SelectOnly(g, { a, b });
    EXPECT_TRUE(SelectOnlyUnit(g, b));
    EXPECT_FALSE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
    EXPECT_FALSE(SelectOnlyUnit(g, foe));
    EXPECT_FALSE(SelectOnlyUnit(g, dead));
    EXPECT_FALSE(SelectOnlyUnit(g, 99999));
    EXPECT_TRUE(Sel(g, b)); // lần thất bại không đổi gì
    SelectOnly(g, { a, b });
    RemoveUnitFromSelection(g, a);
    EXPECT_FALSE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
    RemoveUnitFromSelection(g, 99999); // ID lạ: không sao
}

// ===========================================================================
// Nhóm điều khiển
// ===========================================================================
TEST(ControlGroups, SaveThenRecallSelectsExactlyTheGroup) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100), c = SpawnAt(g, 500, 100);
    SelectOnly(g, { a, b });
    EXPECT_EQ(SaveControlGroup(g, 1), 2);
    SelectOnly(g, { c });
    EXPECT_EQ(RecallControlGroup(g, 1), 2);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
    EXPECT_FALSE(Sel(g, c));
}

TEST(ControlGroups, SavingReplacesThePreviousGroup) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a });
    SaveControlGroup(g, 2);
    SelectOnly(g, { b });
    SaveControlGroup(g, 2);
    SelectOnly(g, {});
    EXPECT_EQ(RecallControlGroup(g, 2), 1);
    EXPECT_FALSE(Sel(g, a));
    EXPECT_TRUE(Sel(g, b));
}

TEST(ControlGroups, GroupsAreIndependentAndAUnitMayBeInSeveral) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a, b });
    SaveControlGroup(g, 1);
    SelectOnly(g, { b });
    SaveControlGroup(g, 9);
    EXPECT_EQ(ControlGroupSize(g, 1), 2);
    EXPECT_EQ(ControlGroupSize(g, 9), 1);
    EXPECT_EQ(ControlGroupSize(g, 5), 0);
    RecallControlGroup(g, 1);
    EXPECT_EQ(SelectedUnitCount(g), 2);
    RecallControlGroup(g, 9);
    EXPECT_EQ(SelectedUnitCount(g), 1);
    EXPECT_TRUE(Sel(g, b));
}

TEST(ControlGroups, OnlySelectedLivingPlayerUnitsAreSaved) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), notSelected = SpawnAt(g, 300, 100);
    const EntityId foe = SpawnAt(g, 500, 100, Team::Enemy, "Grunt");
    const EntityId dead = SpawnAt(g, 700, 100);
    U(g, dead).TakeDamage(10000);
    U(g, foe).selected = true;     // (không thể xảy ra qua giao diện, nhưng nhóm vẫn không được nhận)
    U(g, dead).selected = true;
    U(g, a).selected = true;
    EXPECT_EQ(SaveControlGroup(g, 3), 1);
    DeselectAll(g);
    RecallControlGroup(g, 3);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_FALSE(Sel(g, notSelected));
    EXPECT_FALSE(Sel(g, foe));
    EXPECT_FALSE(Sel(g, dead));
}

TEST(ControlGroups, SavingWithNothingSelectedKeepsTheOldGroup) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    SaveControlGroup(g, 4);
    DeselectAll(g);
    EXPECT_EQ(SaveControlGroup(g, 4), 0);
    EXPECT_EQ(ControlGroupSize(g, 4), 1);
}

TEST(ControlGroups, BuildingsDoNotGoIntoGroups) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    SaveControlGroup(g, 1);
    const EntityId house = Prebuilt(g, "House", 8, 8).id;
    SelectOnlyBuilding(g, house);
    EXPECT_EQ(SaveControlGroup(g, 1), 0);   // chỉ chọn công trình: không lưu, nhóm cũ giữ nguyên
    EXPECT_EQ(ControlGroupSize(g, 1), 1);
}

TEST(ControlGroups, RecallingAnEmptyGroupKeepsTheCurrentSelection) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    EXPECT_EQ(RecallControlGroup(g, 6), 0);
    EXPECT_TRUE(Sel(g, a));
}

TEST(ControlGroups, RecallReplacesABuildingSelection) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    SaveControlGroup(g, 1);
    const EntityId house = Prebuilt(g, "House", 8, 8).id;
    SelectOnlyBuilding(g, house);
    RecallControlGroup(g, 1);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_EQ(SelectedBuildingCount(g), 0);
}

TEST(ControlGroups, DeadAndRemovedUnitsDropOutOfTheGroup) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100), c = SpawnAt(g, 500, 100);
    SelectOnly(g, { a, b, c });
    SaveControlGroup(g, 1);
    U(g, b).TakeDamage(10000);                       // chết (còn trong danh sách lúc diễn hoạt ảnh chết)
    EXPECT_EQ(ControlGroupSize(g, 1), 2);
    RunSteps(g, 90);                                      // hoạt ảnh chết xong -> xác bị xóa khỏi danh sách đơn vị
    EXPECT_TRUE(g.FindUnit(b) == nullptr);
    EXPECT_EQ(ControlGroupSize(g, 1), 2);
    DeselectAll(g);
    EXPECT_EQ(RecallControlGroup(g, 1), 2);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_TRUE(Sel(g, c));
    EXPECT_EQ(static_cast<int>(g.controlGroups[0].size()), 2); // đã dọn khỏi danh sách
}

TEST(ControlGroups, AGroupWhoseMembersAllDiedCannotBeRecalled) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a });
    SaveControlGroup(g, 1);
    SelectOnly(g, { b });
    U(g, a).TakeDamage(10000);
    EXPECT_EQ(RecallControlGroup(g, 1), 0);
    EXPECT_TRUE(Sel(g, b)); // vùng chọn hiện tại giữ nguyên
}

TEST(ControlGroups, OutOfRangeNumbersAreIgnored) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    for (int n : { -1, 0, kControlGroupCount + 1, 100 }) {
        EXPECT_EQ(SaveControlGroup(g, n), 0);
        EXPECT_EQ(RecallControlGroup(g, n), 0);
        EXPECT_EQ(ControlGroupSize(g, n), 0);
        EXPECT_FALSE(IsControlGroupSelected(g, n));
    }
    EXPECT_TRUE(Sel(g, a));
}

TEST(ControlGroups, IsControlGroupSelectedNeedsAnExactMatch) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100), c = SpawnAt(g, 500, 100);
    SelectOnly(g, { a, b });
    SaveControlGroup(g, 1);
    EXPECT_TRUE(IsControlGroupSelected(g, 1));
    SelectOnly(g, { a });
    EXPECT_FALSE(IsControlGroupSelected(g, 1));       // thiếu
    SelectOnly(g, { a, b, c });
    EXPECT_FALSE(IsControlGroupSelected(g, 1));       // thừa
    EXPECT_FALSE(IsControlGroupSelected(g, 2));       // nhóm rỗng
}

TEST(ControlGroups, RecallCancelsADragInProgress) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 700, 100);
    SelectOnly(g, { a });
    SaveControlGroup(g, 1);
    BeginSelection(g, 650, 50, false);               // đang kéo quanh b
    UpdateSelection(g, 750, 150);
    EXPECT_TRUE(Sel(g, b));
    RecallControlGroup(g, 1);
    UpdateSelection(g, 760, 160);                    // khung hình sau: khung kéo không được ghi đè vùng chọn vừa gọi
    EXPECT_TRUE(Sel(g, a));
    EXPECT_FALSE(Sel(g, b));
    EXPECT_FALSE(g.selection.active);
}

TEST(ControlGroups, ANewMatchClearsAllGroups) {
    GameState g = MakeGame();
    g.map.spawns.push_back({ Center(2, 2), "Soldier" });
    InitializeWorld(g);
    for (auto& u : g.units) u.selected = true;
    SaveControlGroup(g, 1);
    SaveControlGroup(g, 7);
    EXPECT_GT(ControlGroupSize(g, 1), 0);
    InitializeWorld(g);
    for (int n = 1; n <= kControlGroupCount; ++n) {
        EXPECT_EQ(ControlGroupSize(g, n), 0);
        EXPECT_TRUE(g.controlGroups[static_cast<size_t>(n - 1)].empty());
    }
}

// ---- phím Ctrl+số / số ----
TEST(ControlGroupKeys, CtrlNumberSavesAndTellsThePlayer) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a, b });
    HandleSaveGroupKey(g, 3);
    EXPECT_EQ(ControlGroupSize(g, 3), 2);
    EXPECT_GT(g.noticeTimer, 0.0f);
    EXPECT_TRUE(g.notice.find('3') != std::string::npos);
    EXPECT_TRUE(g.notice.find('2') != std::string::npos);
}

TEST(ControlGroupKeys, CtrlNumberWithNothingSelectedComplainsAndKeepsTheGroup) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    HandleSaveGroupKey(g, 1);
    DeselectAll(g);
    g.noticeTimer = 0.0f;
    HandleSaveGroupKey(g, 1);
    EXPECT_GT(g.noticeTimer, 0.0f);
    EXPECT_EQ(ControlGroupSize(g, 1), 1);
}

TEST(ControlGroupKeys, NumberKeyRecallsTheGroupWhenNoTrainingBuildingIsSelected) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a });
    HandleSaveGroupKey(g, 1);
    SelectOnly(g, { b });
    HandleNumberKey(g, 1);
    EXPECT_TRUE(Sel(g, a));
    EXPECT_FALSE(Sel(g, b));
    HandleNumberKey(g, 5);   // nhóm rỗng: không làm gì
    EXPECT_TRUE(Sel(g, a));
}

TEST(ControlGroupKeys, NumberKeyStillTrainsWhenATrainingBuildingIsSelected) {
    GameState g = EconomyGame(500);
    const EntityId a = SpawnAt(g, 100, 600);
    SelectOnly(g, { a });
    HandleSaveGroupKey(g, 1);
    SelectOnlyBuilding(g, TownhallId(g));
    const int goldBefore = g.Gold(Team::Player);
    HandleNumberKey(g, 1);                       // Townhall huấn luyện được 1 loại (Worker): phím 1 = huấn luyện
    EXPECT_EQ(static_cast<int>(g.FindBuilding(TownhallId(g))->queue.size()), 1);
    EXPECT_LT(g.Gold(Team::Player), goldBefore);
    EXPECT_EQ(SelectedBuildingCount(g), 1);      // KHÔNG gọi nhóm 1
    EXPECT_FALSE(Sel(g, a));
}

TEST(ControlGroupKeys, NumberKeyBeyondTheTrainingOptionsRecallsAGroupEvenWithABuildingSelected) {
    GameState g = EconomyGame(500);
    const EntityId a = SpawnAt(g, 100, 600);
    SelectOnly(g, { a });
    HandleSaveGroupKey(g, 2);
    SelectOnlyBuilding(g, TownhallId(g));
    HandleNumberKey(g, 2);                       // Townhall chỉ có 1 lựa chọn huấn luyện: phím 2 gọi nhóm 2
    EXPECT_TRUE(Sel(g, a));
    EXPECT_EQ(SelectedBuildingCount(g), 0);
    EXPECT_TRUE(g.FindBuilding(TownhallId(g))->queue.empty());
}

TEST(ControlGroupKeys, NumberKeyWhilePlacingIsIgnoredItNeitherPicksTheBuildingTypeNorRecallsTheGroup) {
    GameState g = MakeGame(500);
    const EntityId w = SpawnAt(g, 100, 100, Team::Player, "Worker");
    const EntityId a = SpawnAt(g, 300, 100);
    SelectOnly(g, { a });
    HandleSaveGroupKey(g, 2);
    SelectOnly(g, { w });
    ASSERT_TRUE(BeginPlacement(g, 0));
    HandleNumberKey(g, 2);
    EXPECT_TRUE(g.placement.active);
    EXPECT_EQ(g.placement.buildingType, 0);   // phím số không còn chọn loại công trình (dùng h / a / b)
    EXPECT_TRUE(Sel(g, w));                   // và cũng không gọi nhóm 2
    EXPECT_FALSE(Sel(g, a));
}

// ===========================================================================
// Phím chữ n / a / b chọn loại công trình khi đang đặt nhà
// ===========================================================================
TEST(BuildingHotkeys, HotkeysMapToTheFirstThreeTypesInOrder) {
    GameState g = MakeGame(500);
    ASSERT_GE(g.buildingTypes.Count(), 3);
    EXPECT_EQ(BuildingHotkeyLabel(0), 'N');
    EXPECT_EQ(BuildingHotkeyLabel(1), 'A');
    EXPECT_EQ(BuildingHotkeyLabel(2), 'B');
    EXPECT_EQ(BuildingHotkeyLabel(3), 0);    // không có phím thứ tư
    EXPECT_EQ(BuildingHotkeyLabel(-1), 0);
}

TEST(BuildingHotkeys, HAndABChooseTheTypeWhilePlacing) {
    GameState g = MakeGame(500);
    const EntityId w = SpawnAt(g, 100, 100, Team::Player, "Worker");
    SelectOnly(g, { w });
    ASSERT_TRUE(BeginPlacement(g, 0));

    EXPECT_TRUE(HandleBuildingHotkey(g, 'a'));
    EXPECT_EQ(g.placement.buildingType, 1);
    EXPECT_TRUE(HandleBuildingHotkey(g, 'b'));
    EXPECT_EQ(g.placement.buildingType, 2);
    EXPECT_TRUE(HandleBuildingHotkey(g, 'n'));
    EXPECT_EQ(g.placement.buildingType, 0);
    EXPECT_TRUE(g.placement.active);          // chọn loại không làm thoát chế độ đặt nhà (kể cả B)
}

TEST(BuildingHotkeys, UpperCaseWorksToo) {
    GameState g = MakeGame(500);
    const EntityId w = SpawnAt(g, 100, 100, Team::Player, "Worker");
    SelectOnly(g, { w });
    ASSERT_TRUE(BeginPlacement(g, 0));
    EXPECT_TRUE(HandleBuildingHotkey(g, 'B'));
    EXPECT_EQ(g.placement.buildingType, 2);
    EXPECT_TRUE(HandleBuildingHotkey(g, 'A'));
    EXPECT_EQ(g.placement.buildingType, 1);
}

TEST(BuildingHotkeys, OtherKeysAreNotConsumedAndChangeNothing) {
    GameState g = MakeGame(500);
    const EntityId w = SpawnAt(g, 100, 100, Team::Player, "Worker");
    SelectOnly(g, { w });
    ASSERT_TRUE(BeginPlacement(g, 1));
    EXPECT_FALSE(HandleBuildingHotkey(g, 's'));
    EXPECT_FALSE(HandleBuildingHotkey(g, 'x'));
    EXPECT_FALSE(HandleBuildingHotkey(g, '1'));   // số không còn là phím chọn công trình
    EXPECT_FALSE(HandleBuildingHotkey(g, '2'));
    EXPECT_EQ(g.placement.buildingType, 1);
}

TEST(BuildingHotkeys, IgnoredWhenNotPlacingSoHAndAStillMeanHoldAndAttackMove) {
    GameState g = MakeGame(500);
    const EntityId a = SpawnAt(g, 300, 100);
    SelectOnly(g, { a });
    EXPECT_FALSE(HandleBuildingHotkey(g, 'n'));   // main.cpp sẽ để phím h rơi xuống HandleHoldKey
    EXPECT_FALSE(HandleBuildingHotkey(g, 'a'));
    EXPECT_FALSE(HandleBuildingHotkey(g, 'b'));
    EXPECT_FALSE(g.placement.active);
    HandleHoldKey(g);
    EXPECT_TRUE(U(g, a).IsHolding());
    HandleAttackMoveKey(g);
    EXPECT_TRUE(g.attackMoveArmed);
}

TEST(BuildingHotkeys, ChooseBuildingTypeValidatesItsArgument) {
    GameState g = MakeGame(500);
    const EntityId w = SpawnAt(g, 100, 100, Team::Player, "Worker");
    SelectOnly(g, { w });
    ChooseBuildingType(g, 2);                     // chưa đặt nhà: bỏ qua
    EXPECT_FALSE(g.placement.active);
    ASSERT_TRUE(BeginPlacement(g, 0));
    ChooseBuildingType(g, 99);                    // không có loại này: giữ nguyên
    EXPECT_EQ(g.placement.buildingType, 0);
    ChooseBuildingType(g, -1);
    EXPECT_EQ(g.placement.buildingType, 0);
    ChooseBuildingType(g, 2);
    EXPECT_EQ(g.placement.buildingType, 2);
}

TEST(BuildingHotkeys, ChosenTypeIsTheOneThatGetsPlaced) {
    GameState g = MakeGame(1000);
    const EntityId w = SpawnAt(g, 300, 300, Team::Player, "Worker");
    SelectOnly(g, { w });
    ASSERT_TRUE(BeginPlacement(g, 0));
    ASSERT_TRUE(HandleBuildingHotkey(g, 'b'));    // Barracks
    UpdatePlacement(g, 640.0f, 512.0f);
    ASSERT_TRUE(ConfirmPlacement(g));
    ASSERT_EQ(g.buildings.size(), 1u);
    EXPECT_EQ(g.buildings.back().typeId, BuildIdx(g, "Barracks"));
}

// ===========================================================================
// Camera chừa chỗ cho HUD
// ===========================================================================
TEST(HudCamera, BottomInsetLetsTheCameraScrollPastTheBottomEdge) {
    Camera cam(0, 0);
    cam.ClampCamera(0, 99999, 1280, 720, 2048, 1088);
    EXPECT_NEAR(cam.y, 1088 - 720, 0.01);          // mặc định như cũ
    cam.bottomInset = kHudPanelHeight;
    cam.ClampCamera(0, 99999, 1280, 720, 2048, 1088);
    EXPECT_NEAR(cam.y, 1088 - 720 + kHudPanelHeight, 0.01);
    cam.ClampCamera(-50, -50, 1280, 720, 2048, 1088);   // biên trên và trái không đổi
    EXPECT_NEAR(cam.x, 0.0f, 0.01);
    EXPECT_NEAR(cam.y, 0.0f, 0.01);
}

TEST(HudCamera, AMapSmallerThanTheWindowStillClampsToZero) {
    Camera cam(0, 0);
    cam.bottomInset = kHudPanelHeight;
    cam.ClampCamera(500, 500, 1280, 720, 800, 500);
    EXPECT_NEAR(cam.x, 0.0f, 0.01);
    EXPECT_NEAR(cam.y, 0.0f, 0.01);
}

TEST(HudCamera, UpdateGameFrameReservesTheHudStrip) {
    GameState g = MakeGame();
    Input in;
    static bool keys[512] = {};
    in.keys = keys;
    UpdateGameFrame(g, in, 0.016f, kW, kH);
    EXPECT_NEAR(g.camera.bottomInset, kHudPanelHeight, 0.01);
}

TEST(HudCamera, FocusCentersInTheVisiblePartAboveTheHud) {
    GameState g = MakeGame();
    g.camera.bottomInset = kHudPanelHeight;
    const EntityId a = SpawnAt(g, 700, 600);
    SelectOnly(g, { a });
    FocusCameraOnSelection(g, kW, kH);
    EXPECT_NEAR(g.camera.x, 700.0f - kW / 2.0f > 0 ? 700.0f - kW / 2.0f : 0.0f, 0.01);
    EXPECT_NEAR(g.camera.y, 600.0f - (kH - kHudPanelHeight) / 2.0f, 0.01);
}

// ===========================================================================
// HUD: bố cục
// ===========================================================================
TEST(HudLayout, PanelSitsAtTheBottomAndFillsTheWidth) {
    GameState g = MakeGame();
    const HudLayout L = BuildHudLayout(g, kW, kH);
    EXPECT_NEAR(L.panel.y + L.panel.h, static_cast<float>(kH), 0.01);
    EXPECT_NEAR(L.panel.h, kHudPanelHeight, 0.01);
    EXPECT_NEAR(L.panel.w, static_cast<float>(kW), 0.01);
    EXPECT_TRUE(InsideRect(L.panel, L.info));
    EXPECT_TRUE(InsideRect(L.panel, L.card));
    EXPECT_FALSE(Overlaps(L.info, L.card));
}

TEST(HudLayout, NothingSelectedMeansNoButtons) {
    GameState g = MakeGame();
    SpawnAt(g, 100, 100);
    const HudLayout L = BuildHudLayout(g, kW, kH);
    EXPECT_TRUE(L.buttons.empty());
}

TEST(HudLayout, ASoldierGetsAttackStopHoldButNoBuild) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    const HudLayout L = BuildHudLayout(g, kW, kH);
    EXPECT_TRUE(FindButton(L, HudAction::AttackMove) != nullptr);
    EXPECT_TRUE(FindButton(L, HudAction::Stop) != nullptr);
    EXPECT_TRUE(FindButton(L, HudAction::Hold) != nullptr);
    EXPECT_TRUE(FindButton(L, HudAction::Build) == nullptr);
    EXPECT_TRUE(FindButton(L, HudAction::Train) == nullptr);
}

TEST(HudLayout, AWorkerAlsoGetsBuild) {
    GameState g = MakeGame();
    const EntityId w = SpawnAt(g, 100, 100, Team::Player, "Worker");
    const EntityId s = SpawnAt(g, 300, 100);
    SelectOnly(g, { s });
    EXPECT_TRUE(FindButton(BuildHudLayout(g, kW, kH), HudAction::Build) == nullptr);
    SelectOnly(g, { w, s });
    EXPECT_TRUE(FindButton(BuildHudLayout(g, kW, kH), HudAction::Build) != nullptr);
}

TEST(HudLayout, ButtonStatesFollowTheGame) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a, b });
    EXPECT_FALSE(FindButton(BuildHudLayout(g, kW, kH), HudAction::AttackMove)->active);
    EXPECT_FALSE(FindButton(BuildHudLayout(g, kW, kH), HudAction::Hold)->active);
    HandleAttackMoveKey(g);
    EXPECT_TRUE(FindButton(BuildHudLayout(g, kW, kH), HudAction::AttackMove)->active);
    HandleHoldKey(g);   // thoát chế độ Attack-move, cả hai đều Hold
    EXPECT_FALSE(FindButton(BuildHudLayout(g, kW, kH), HudAction::AttackMove)->active);
    EXPECT_TRUE(FindButton(BuildHudLayout(g, kW, kH), HudAction::Hold)->active);
    U(g, b).OrderStop();   // chỉ còn một lính Hold: nút Hold không còn sáng
    EXPECT_FALSE(FindButton(BuildHudLayout(g, kW, kH), HudAction::Hold)->active);
}

TEST(HudLayout, TownhallOffersWorkerTrainingAndCancelOnlyWithAQueue) {
    GameState g = EconomyGame(500);
    SelectOnlyBuilding(g, TownhallId(g));
    HudLayout L = BuildHudLayout(g, kW, kH);
    const HudButton* train = FindButton(L, HudAction::Train, 0);
    ASSERT_TRUE(train != nullptr);
    EXPECT_EQ(train->label, std::string("Worker"));
    EXPECT_TRUE(train->enabled);
    EXPECT_EQ(CountButtons(L, HudAction::Train), 1);
    EXPECT_TRUE(FindButton(L, HudAction::CancelOrder) == nullptr);
    EXPECT_EQ(CountButtons(L, HudAction::CancelQueued), 0);

    EnqueueUnit(g, TownhallId(g), UnitIdx(g, "Worker"));
    EnqueueUnit(g, TownhallId(g), UnitIdx(g, "Worker"));
    L = BuildHudLayout(g, kW, kH);
    EXPECT_TRUE(FindButton(L, HudAction::CancelOrder) != nullptr);
    EXPECT_EQ(CountButtons(L, HudAction::CancelQueued), 2);
    EXPECT_EQ(FindButton(L, HudAction::CancelQueued, 1)->id, TownhallId(g));
}

TEST(HudLayout, BarracksTrainsSoldiers) {
    GameState g = EconomyGame(500);
    const EntityId bar = Prebuilt(g, "Barracks", 8, 8).id;
    SelectOnlyBuilding(g, bar);
    const HudLayout L = BuildHudLayout(g, kW, kH);
    ASSERT_TRUE(FindButton(L, HudAction::Train, 0) != nullptr);
    EXPECT_EQ(FindButton(L, HudAction::Train, 0)->label, std::string("Soldier"));
}

TEST(HudLayout, AFoundationOffersCancelAndNoTraining) {
    GameState g = MakeGame(500);
    const EntityId f = Foundation(g, "Barracks", 4, 4).id;
    SelectOnlyBuilding(g, f);
    const HudLayout L = BuildHudLayout(g, kW, kH);
    EXPECT_TRUE(FindButton(L, HudAction::CancelOrder) != nullptr);
    EXPECT_EQ(CountButtons(L, HudAction::Train), 0);
    EXPECT_EQ(CountButtons(L, HudAction::CancelQueued), 0);
}

TEST(HudLayout, PlacementModeListsEveryBuildingTypeAndACancelButton) {
    GameState g = MakeGame(100);
    const EntityId w = SpawnAt(g, 100, 100, Team::Player, "Worker");
    SelectOnly(g, { w });
    ASSERT_TRUE(BeginPlacement(g, 1));
    const HudLayout L = BuildHudLayout(g, kW, kH);
    EXPECT_EQ(CountButtons(L, HudAction::ChooseBuilding), g.buildingTypes.Count());
    EXPECT_TRUE(FindButton(L, HudAction::CancelPlacement) != nullptr);
    EXPECT_EQ(CountButtons(L, HudAction::AttackMove), 0);   // đang đặt nhà: không có nút lệnh lính
    for (int i = 0; i < g.buildingTypes.Count(); ++i) {
        const HudButton* b = FindButton(L, HudAction::ChooseBuilding, i);
        ASSERT_TRUE(b != nullptr);
        EXPECT_EQ(b->active, i == 1);
        EXPECT_EQ(b->enabled, g.buildingTypes.Get(i).cost <= 100);   // vàng 100: nhà 80g mua được, 150g / 200g thì không
    }
}

TEST(HudLayout, PlacementButtonsShowTheLetterHotkeysNotNumbers) {
    GameState g = MakeGame(500);
    const EntityId w = SpawnAt(g, 100, 100, Team::Player, "Worker");
    SelectOnly(g, { w });
    ASSERT_TRUE(BeginPlacement(g, 0));
    const HudLayout L = BuildHudLayout(g, kW, kH);
    const char* const expected[] = { "[H]", "[A]", "[B]" };
    for (int i = 0; i < 3; ++i) {
        const HudButton* b = FindButton(L, HudAction::ChooseBuilding, i);
        ASSERT_TRUE(b != nullptr);
        EXPECT_NE(b->sub.find(expected[i]), std::string::npos) << "button " << i << " sub=" << b->sub;
        EXPECT_EQ(b->sub.find('['), b->sub.rfind('[')) << "chỉ một nhãn phím trên nút " << i;
        for (char digit = '0'; digit <= '9'; ++digit) {
            const std::string bracketed = std::string("[") + digit + "]";
            EXPECT_EQ(b->sub.find(bracketed), std::string::npos) << "button " << i << " vẫn ghi phím số: " << b->sub;
        }
    }
}

TEST(HudLayout, TrainButtonIsDimWhenTheTrainIsImpossible) {
    GameState g = EconomyGame(10);
    SelectOnlyBuilding(g, TownhallId(g));
    EXPECT_FALSE(FindButton(BuildHudLayout(g, kW, kH), HudAction::Train, 0)->enabled);   // thiếu vàng
    g.Gold(Team::Player) = 1000;
    EXPECT_TRUE(FindButton(BuildHudLayout(g, kW, kH), HudAction::Train, 0)->enabled);
    for (int i = 0; i < kMaxQueueLength; ++i) EnqueueUnit(g, TownhallId(g), UnitIdx(g, "Worker"));
    // Slot quân của Townhall là 10: tới đây có thể đã hết slot hoặc hết chỗ hàng đợi; cả hai đều phải làm nút mờ.
    EXPECT_FALSE(FindButton(BuildHudLayout(g, kW, kH), HudAction::Train, 0)->enabled);
}

TEST(HudLayout, TrainButtonIsDimWhenSupplyIsFull) {
    GameState g = EconomyGame(1000);
    for (int i = 0; i < 10; ++i) SpawnAt(g, 100.0f + 60.0f * static_cast<float>(i), 800, Team::Player, "Worker"); // đúng 10/10 slot
    SelectOnlyBuilding(g, TownhallId(g));
    EXPECT_EQ(SupplyUsed(g, Team::Player), SupplyCap(g, Team::Player));
    EXPECT_FALSE(FindButton(BuildHudLayout(g, kW, kH), HudAction::Train, 0)->enabled);
}

TEST(HudLayout, GroupButtonsAppearOnlyForNonEmptyGroups) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    EXPECT_FALSE(BuildHudLayout(g, kW, kH).hasGroupBar);
    SelectOnly(g, { a, b });
    SaveControlGroup(g, 2);
    SelectOnly(g, { a });
    SaveControlGroup(g, 5);
    HudLayout L = BuildHudLayout(g, kW, kH);
    EXPECT_TRUE(L.hasGroupBar);
    EXPECT_EQ(CountButtons(L, HudAction::RecallGroup), 2);
    const HudButton* g2 = FindButton(L, HudAction::RecallGroup, 2);
    const HudButton* g5 = FindButton(L, HudAction::RecallGroup, 5);
    ASSERT_TRUE(g2 != nullptr);
    ASSERT_TRUE(g5 != nullptr);
    EXPECT_EQ(g2->label, std::string("2:2"));
    EXPECT_EQ(g5->label, std::string("5:1"));
    EXPECT_FALSE(g2->active);
    EXPECT_TRUE(g5->active);                         // vùng chọn hiện tại đúng là nhóm 5
    EXPECT_TRUE(g2->rect.y + g2->rect.h <= L.panel.y); // thanh nhóm nằm ngay trên bảng đáy
    EXPECT_FALSE(Overlaps(g2->rect, g5->rect));
}

TEST(HudLayout, ManyUnitsFillTheGridAndReportTheRest) {
    GameState g = MakeGame();
    std::vector<EntityId> ids;
    for (int i = 0; i < 120; ++i) ids.push_back(SpawnAt(g, 50.0f + 10.0f * static_cast<float>(i % 100), 50.0f + 10.0f * static_cast<float>(i / 100)));
    for (EntityId id : ids) U(g, id).selected = true;
    const HudLayout L = BuildHudLayout(g, kW, kH);
    const int icons = CountButtons(L, HudAction::SelectUnit);
    EXPECT_GT(icons, 0);
    EXPECT_EQ(icons + L.hiddenUnits, 120);
    EXPECT_GT(L.hiddenUnits, 0);
    std::set<EntityId> seen;
    for (const auto& b : L.buttons) {
        if (b.action != HudAction::SelectUnit) continue;
        EXPECT_TRUE(InsideRect(L.info, b.rect));
        EXPECT_TRUE(seen.insert(b.id).second);       // mỗi lính một ô
    }
}

TEST(HudLayout, FewUnitsShowAllOfThemAndNothingHidden) {
    GameState g = MakeGame();
    for (int i = 0; i < 7; ++i) U(g, SpawnAt(g, 100.0f + 100.0f * static_cast<float>(i), 100)).selected = true;
    const HudLayout L = BuildHudLayout(g, kW, kH);
    EXPECT_EQ(CountButtons(L, HudAction::SelectUnit), 7);
    EXPECT_EQ(L.hiddenUnits, 0);
}

TEST(HudLayout, ASingleUnitHasNoIconGrid) {
    GameState g = MakeGame();
    U(g, SpawnAt(g, 100, 100)).selected = true;
    EXPECT_EQ(CountButtons(BuildHudLayout(g, kW, kH), HudAction::SelectUnit), 0);
}

TEST(HudLayout, EveryButtonStaysInsideTheWindowAndNothingOverlaps) {
    struct Size { int w, h; };
    for (const Size sz : { Size{ 1280, 720 }, Size{ 1024, 600 }, Size{ 800, 600 }, Size{ 640, 480 } }) {
        GameState g = EconomyGame(1000);
        const EntityId bar = Prebuilt(g, "Barracks", 8, 8).id;
        std::vector<EntityId> units;
        for (int i = 0; i < 30; ++i) units.push_back(SpawnAt(g, 50.0f + 30.0f * static_cast<float>(i), 800, Team::Player, i % 4 == 0 ? "Worker" : "Soldier"));
        for (int variant = 0; variant < 5; ++variant) {
            DeselectAll(g);
            g.placement.active = false;
            if (variant == 0) for (EntityId id : units) U(g, id).selected = true;
            if (variant == 1) { U(g, units[0]).selected = true; SaveControlGroup(g, 1); SaveControlGroup(g, 9); }
            if (variant == 2) { g.FindBuilding(bar)->selected = true; for (int i = 0; i < 3; ++i) EnqueueUnit(g, bar, UnitIdx(g, "Soldier")); }
            if (variant == 3) { g.FindBuilding(TownhallId(g))->selected = true; for (int i = 0; i < 5; ++i) EnqueueUnit(g, TownhallId(g), UnitIdx(g, "Worker")); }
            if (variant == 4) { U(g, units[0]).selected = true; BeginPlacement(g, 0); }
            const HudLayout L = BuildHudLayout(g, sz.w, sz.h);
            const SDL_FRect window = { 0.0f, 0.0f, static_cast<float>(sz.w), static_cast<float>(sz.h) };
            EXPECT_TRUE(InsideRect(window, L.panel));
            EXPECT_TRUE(InsideRect(L.panel, L.info));
            EXPECT_TRUE(InsideRect(L.panel, L.card));
            for (size_t i = 0; i < L.buttons.size(); ++i) {
                const HudButton& b = L.buttons[i];
                EXPECT_TRUE(InsideRect(window, b.rect)) << "button " << i << " variant " << variant << " size " << sz.w;
                if (b.kind == HudButtonKind::Group) EXPECT_FALSE(Overlaps(b.rect, L.panel));
                else if (b.kind == HudButtonKind::Command) EXPECT_TRUE(InsideRect(L.card, b.rect));
                else EXPECT_TRUE(InsideRect(L.info, b.rect));
                for (size_t j = i + 1; j < L.buttons.size(); ++j) EXPECT_FALSE(Overlaps(b.rect, L.buttons[j].rect)) << i << " vs " << j;
            }
        }
    }
}

// ===========================================================================
// HUD: vùng chặn chuột
// ===========================================================================
TEST(HudBlocking, PanelBlocksButTheWorldAboveDoesNot) {
    GameState g = MakeGame();
    EXPECT_TRUE(IsOverHud(g, kW, kH, 640, kH - 5));
    EXPECT_TRUE(IsOverHud(g, kW, kH, 5, kH - kHudPanelHeight + 1));
    EXPECT_FALSE(IsOverHud(g, kW, kH, 640, kH - kHudPanelHeight - 40));
    EXPECT_FALSE(IsOverHud(g, kW, kH, 640, 300));
}

TEST(HudBlocking, TopResourceBarBlocksOnlyWhenTheEconomyIsActive) {
    GameState g = MakeGame();
    EXPECT_TRUE(IsOverHud(g, kW, kH, 20, 12));
    g.economyActive = false;
    EXPECT_FALSE(IsOverHud(g, kW, kH, 20, 12));
}

TEST(HudBlocking, GroupBarBlocksOnlyWhereItIs) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    const float y = kH - kHudPanelHeight - 14.0f; // giữa thanh nhóm
    EXPECT_FALSE(IsOverHud(g, kW, kH, 20, y));
    SelectOnly(g, { a });
    SaveControlGroup(g, 1);
    EXPECT_TRUE(IsOverHud(g, kW, kH, 20, y));
    EXPECT_FALSE(IsOverHud(g, kW, kH, 900, y));
}

// ===========================================================================
// HUD: bấm chuột
// ===========================================================================
TEST(HudClick, ClickingTheWorldIsNotConsumed) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    EXPECT_FALSE(HandleHudClick(g, kW, kH, 640, 300, false));
    EXPECT_TRUE(Sel(g, a));
}

TEST(HudClick, ClickingThePanelBackgroundIsConsumedAndChangesNothing) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    EXPECT_TRUE(HandleHudClick(g, kW, kH, 700, kH - 60, false));   // khoảng trống giữa bảng thông tin và thẻ lệnh
    EXPECT_TRUE(Sel(g, a));
    EXPECT_FALSE(g.attackMoveArmed);
}

TEST(HudClick, AttackButtonTogglesAttackMoveMode) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    SelectOnly(g, { a });
    EXPECT_TRUE(ClickHud(g, HudAction::AttackMove));
    EXPECT_TRUE(g.attackMoveArmed);
    EXPECT_TRUE(ClickHud(g, HudAction::AttackMove));
    EXPECT_FALSE(g.attackMoveArmed);
}

TEST(HudClick, StopButtonStopsTheSelectedUnits) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    const EntityId other = SpawnAt(g, 300, 100);
    SelectOnly(g, { a });
    OrderMoveTo(g, U(g, a), 900.0f, 500.0f);
    OrderMoveTo(g, U(g, other), 900.0f, 500.0f);
    RunSteps(g, 5);
    ASSERT_TRUE(U(g, a).hasMoveGoal);
    ClickHud(g, HudAction::Stop);
    EXPECT_FALSE(U(g, a).hasMoveGoal);
    EXPECT_TRUE(U(g, other).hasMoveGoal);   // lính không được chọn không bị ảnh hưởng
}

TEST(HudClick, HoldButtonPutsTheSelectedUnitsOnHold) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100), c = SpawnAt(g, 500, 100);
    SelectOnly(g, { a, b });
    ClickHud(g, HudAction::Hold);
    EXPECT_TRUE(U(g, a).IsHolding());
    EXPECT_TRUE(U(g, b).IsHolding());
    EXPECT_FALSE(U(g, c).IsHolding());
}

TEST(HudClick, BuildButtonEntersPlacementAndTheListPicksTheType) {
    GameState g = MakeGame(500);
    const EntityId w = SpawnAt(g, 100, 100, Team::Player, "Worker");
    SelectOnly(g, { w });
    ClickHud(g, HudAction::Build);
    ASSERT_TRUE(g.placement.active);
    EXPECT_EQ(g.placement.buildingType, 0);
    ClickHud(g, HudAction::ChooseBuilding, 2);
    EXPECT_TRUE(g.placement.active);
    EXPECT_EQ(g.placement.buildingType, 2);
    ClickHud(g, HudAction::CancelPlacement);
    EXPECT_FALSE(g.placement.active);
}

TEST(HudClick, ClickingAnAttackButtonWhilePlacingIsNotPossibleButPanelStillBlocks) {
    GameState g = MakeGame(500);
    const EntityId w = SpawnAt(g, 100, 100, Team::Player, "Worker");
    SelectOnly(g, { w });
    BeginPlacement(g, 0);
    EXPECT_TRUE(HandleHudClick(g, kW, kH, 700, kH - 60, false)); // nền bảng: nuốt, vẫn đang đặt nhà
    EXPECT_TRUE(g.placement.active);
}

TEST(HudClick, TrainButtonQueuesAUnitAndChargesGold) {
    GameState g = EconomyGame(500);
    SelectOnlyBuilding(g, TownhallId(g));
    const int before = g.Gold(Team::Player);
    ClickHud(g, HudAction::Train, 0);
    EXPECT_EQ(static_cast<int>(g.FindBuilding(TownhallId(g))->queue.size()), 1);
    EXPECT_EQ(g.Gold(Team::Player), before - g.unitTypes.Get(UnitIdx(g, "Worker")).cost);
}

TEST(HudClick, TrainButtonWithoutGoldExplainsInsteadOfQueuing) {
    GameState g = EconomyGame(5);
    SelectOnlyBuilding(g, TownhallId(g));
    g.noticeTimer = 0.0f;
    ClickHud(g, HudAction::Train, 0);   // nút mờ vẫn bấm được
    EXPECT_TRUE(g.FindBuilding(TownhallId(g))->queue.empty());
    EXPECT_EQ(g.Gold(Team::Player), 5);
    EXPECT_GT(g.noticeTimer, 0.0f);
}

TEST(HudClick, CancelButtonRemovesTheLastQueuedUnitAndRefunds) {
    GameState g = EconomyGame(500);
    SelectOnlyBuilding(g, TownhallId(g));
    ClickHud(g, HudAction::Train, 0);
    ClickHud(g, HudAction::Train, 0);
    const int afterTwo = g.Gold(Team::Player);
    ClickHud(g, HudAction::CancelOrder);
    EXPECT_EQ(static_cast<int>(g.FindBuilding(TownhallId(g))->queue.size()), 1);
    EXPECT_EQ(g.Gold(Team::Player), afterTwo + g.unitTypes.Get(UnitIdx(g, "Worker")).cost);
}

TEST(HudClick, ClickingAQueueIconCancelsThatUnitOnly) {
    GameState g = EconomyGame(1000);
    const EntityId bar = Prebuilt(g, "Barracks", 8, 8).id;
    Prebuilt(g, "House", 12, 12);   // thêm slot quân
    SelectOnlyBuilding(g, bar);
    EnqueueUnit(g, bar, UnitIdx(g, "Soldier"));
    EnqueueUnit(g, bar, UnitIdx(g, "Soldier"));
    EnqueueUnit(g, bar, UnitIdx(g, "Soldier"));
    g.FindBuilding(bar)->queue[1].timeLeft = 7.0f;   // đánh dấu phần tử giữa để biết ai bị hủy
    const HudLayout L = BuildHudLayout(g, kW, kH);
    ASSERT_EQ(CountButtons(L, HudAction::CancelQueued), 3);
    const int goldBefore = g.Gold(Team::Player);
    ClickHud(g, HudAction::CancelQueued, 1);
    const Building& b = *g.FindBuilding(bar);
    ASSERT_EQ(static_cast<int>(b.queue.size()), 2);
    EXPECT_GT(g.Gold(Team::Player), goldBefore);
    EXPECT_TRUE(std::fabs(b.queue[0].timeLeft - 7.0f) > 0.01f && std::fabs(b.queue[1].timeLeft - 7.0f) > 0.01f);
}

TEST(HudClick, CancelButtonOnAFoundationRemovesItAndRefunds75Percent) {
    GameState g = MakeGame(500);
    const int cost = g.buildingTypes.Get(BuildIdx(g, "Barracks")).cost;
    const EntityId f = Foundation(g, "Barracks", 4, 4).id;
    EXPECT_EQ(g.Gold(Team::Player), 500 - cost);
    SelectOnlyBuilding(g, f);
    ClickHud(g, HudAction::CancelOrder);
    EXPECT_TRUE(g.FindBuilding(f) == nullptr);
    EXPECT_EQ(g.Gold(Team::Player), 500 - cost + static_cast<int>(static_cast<float>(cost) * kCancelRefundRatio));
}

TEST(HudClick, GroupButtonRecallsTheGroup) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100);
    SelectOnly(g, { a });
    SaveControlGroup(g, 4);
    SelectOnly(g, { b });
    EXPECT_TRUE(ClickHud(g, HudAction::RecallGroup, 4));
    EXPECT_TRUE(Sel(g, a));
    EXPECT_FALSE(Sel(g, b));
}

TEST(HudClick, GroupButtonWorksEvenWhenATrainingBuildingKeyWouldClash) {
    GameState g = EconomyGame(500);
    const EntityId a = SpawnAt(g, 100, 600);
    SelectOnly(g, { a });
    SaveControlGroup(g, 1);
    SelectOnlyBuilding(g, TownhallId(g));
    ClickHud(g, HudAction::RecallGroup, 1);          // phím 1 sẽ huấn luyện, nhưng nút nhóm thì gọi nhóm
    EXPECT_TRUE(Sel(g, a));
    EXPECT_EQ(SelectedBuildingCount(g), 0);
    EXPECT_TRUE(g.FindBuilding(TownhallId(g))->queue.empty());
}

TEST(HudClick, UnitIconSelectsJustThatUnit) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100), c = SpawnAt(g, 500, 100);
    SelectOnly(g, { a, b, c });
    EXPECT_TRUE(ClickUnitIcon(g, b, false));
    EXPECT_EQ(SelectedUnitCount(g), 1);
    EXPECT_TRUE(Sel(g, b));
}

TEST(HudClick, ShiftClickOnAUnitIconRemovesItFromTheSelection) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100), b = SpawnAt(g, 300, 100), c = SpawnAt(g, 500, 100);
    SelectOnly(g, { a, b, c });
    EXPECT_TRUE(ClickUnitIcon(g, b, true));
    EXPECT_EQ(SelectedUnitCount(g), 2);
    EXPECT_FALSE(Sel(g, b));
    EXPECT_TRUE(Sel(g, a));
    EXPECT_TRUE(Sel(g, c));
}

TEST(HudClick, RemovingUnitsOneByOneShrinksTheLayoutConsistently) {
    GameState g = MakeGame();
    std::vector<EntityId> ids;
    for (int i = 0; i < 4; ++i) ids.push_back(SpawnAt(g, 100.0f + 150.0f * static_cast<float>(i), 100));
    for (EntityId id : ids) U(g, id).selected = true;
    for (int left = 4; left > 1; --left) {
        EXPECT_EQ(CountButtons(BuildHudLayout(g, kW, kH), HudAction::SelectUnit), left);
        ClickUnitIcon(g, ids[static_cast<size_t>(4 - left)], true);
    }
    EXPECT_EQ(CountButtons(BuildHudLayout(g, kW, kH), HudAction::SelectUnit), 0); // một lính: bảng đơn
    EXPECT_EQ(SelectedUnitCount(g), 1);
}

TEST(HudClick, EveryCommandButtonDoesSomethingWithoutCrashingOnAnyWindowSize) {
    for (int w : { 640, 800, 1280 }) {
        GameState g = EconomyGame(1000);
        const EntityId worker = SpawnAt(g, 300, 700, Team::Player, "Worker");
        const EntityId soldier = SpawnAt(g, 400, 700);
        SelectOnly(g, { worker, soldier });
        const HudLayout L = BuildHudLayout(g, w, 480);
        for (const auto& b : L.buttons) HandleHudClick(g, w, 480, b.rect.x + 1.0f, b.rect.y + 1.0f, false);
        SUCCEED();
    }
}

// ===========================================================================
// HUD: trạng thái lính
// ===========================================================================
TEST(HudStatus, DescribesWhatTheUnitIsDoing) {
    GameState g = MakeGame();
    const EntityId a = SpawnAt(g, 100, 100);
    EXPECT_EQ(HudUnitStatus(U(g, a)), std::string("Idle"));
    OrderMoveTo(g, U(g, a), 900.0f, 100.0f);
    RunSteps(g, 5);
    EXPECT_EQ(HudUnitStatus(U(g, a)), std::string("Moving"));
    U(g, a).OrderHold();
    EXPECT_EQ(HudUnitStatus(U(g, a)), std::string("Holding position"));
    U(g, a).OrderStop();
    U(g, a).EnterAttackMove(800.0f, 100.0f);
    EXPECT_EQ(HudUnitStatus(U(g, a)), std::string("Attack-moving"));
    U(g, a).ResetCombatMode();
    U(g, a).job.kind = JobKind::Gather;
    EXPECT_EQ(HudUnitStatus(U(g, a)), std::string("Mining"));
    U(g, a).job.returning = true;
    EXPECT_EQ(HudUnitStatus(U(g, a)), std::string("Delivering gold"));
    U(g, a).job.kind = JobKind::Build;
    EXPECT_EQ(HudUnitStatus(U(g, a)), std::string("Building"));
    U(g, a).CancelJob();
    const EntityId foe = SpawnAt(g, 160, 100, Team::Enemy, "Grunt");
    U(g, a).OrderAttack(foe);
    EXPECT_EQ(HudUnitStatus(U(g, a)), std::string("Attacking"));
}

// ===========================================================================
// Vẽ: chỉ kiểm không lỗi / không crash (renderer rỗng, như các bộ test khác)
// ===========================================================================
TEST(HudRender, DrawsEveryHudStateWithoutCrashing) {
    GameState g = EconomyGame(500);
    const EntityId bar = Prebuilt(g, "Barracks", 8, 8).id;
    const EntityId w = SpawnAt(g, 300, 700, Team::Player, "Worker");
    const EntityId s1 = SpawnAt(g, 400, 700), s2 = SpawnAt(g, 500, 700);
    U(g, s2).TakeDamage(40);
    const EntityId foe = SpawnAt(g, 900, 700, Team::Enemy, "Grunt");
    (void)foe;
    for (int variant = 0; variant < 9; ++variant) {
        DeselectAll(g);
        g.placement.active = false;
        g.attackMoveArmed = false;
        g.notice.clear();
        g.noticeTimer = 0.0f;
        switch (variant) {
        case 0: break;
        case 1: SelectOnly(g, { s1 }); break;
        case 2: SelectOnly(g, { w, s1, s2 }); SaveControlGroup(g, 1); SaveControlGroup(g, 9); break;
        case 3: SelectOnly(g, { w }); BeginPlacement(g, 0); break;
        case 4: SelectOnly(g, { s1 }); HandleAttackMoveKey(g); break;
        case 5: SelectOnlyBuilding(g, bar); EnqueueUnit(g, bar, UnitIdx(g, "Soldier")); break;
        case 6: SelectOnlyBuilding(g, TownhallId(g)); g.Notify("Not enough gold"); break;
        case 7: { const EntityId f = Foundation(g, "House", 12, 12).id; SelectOnlyBuilding(g, f); break; }
        case 8: g.FindBuilding(bar)->selected = true; g.FindBuilding(TownhallId(g))->selected = true; break;
        }
        RenderGame(nullptr, g, kW, kH);
        RenderGame(nullptr, g, 320, 200);   // cửa sổ rất nhỏ
    }
    g.economyActive = false;
    RenderGame(nullptr, g, kW, kH);
    SUCCEED();
}

// ===========================================================================
// Stress ngẫu nhiên: chọn / lưu / gọi / bấm HUD bừa, kiểm các bất biến
// ===========================================================================
namespace {
    int StressScenarios() {
        const char* env = std::getenv("UI_STRESS_SCENARIOS");
        const int n = env ? std::atoi(env) : 60;
        return n > 0 ? n : 60;
    }

    // Trả về mô tả lỗi, rỗng nếu ổn.
    std::string CheckInvariants(const GameState& g) {
        for (const auto& u : g.units) {
            if (u.selected && (u.team != Team::Player || !u.IsAlive())) return "selected unit is not a living player unit";
        }
        for (const auto& b : g.buildings) {
            if (b.selected && b.team != Team::Player) return "selected enemy building";
        }
        if (SelectedUnitCount(g) > 0 && SelectedBuildingCount(g) > 0) return "units and buildings selected together";
        for (const auto& group : g.controlGroups) {
            for (EntityId id : group) {
                const Unit* u = g.FindUnit(id);
                if (u && u->team != Team::Player) return "enemy in a control group";
            }
            if (!std::is_sorted(group.begin(), group.end())) return "control group ids not sorted";
        }
        if (!std::is_sorted(g.selection.baseUnits.begin(), g.selection.baseUnits.end())) return "baseUnits not sorted";
        if (!g.selection.active && (g.selection.additive || !g.selection.baseUnits.empty() || !g.selection.baseBuildings.empty())) return "stale additive state";
        return "";
    }
}

TEST(UiStress, RandomSelectionGroupsAndHudClicks) {
    const int scenarios = StressScenarios();
    int hudConsumed = 0, shiftAdds = 0, recalls = 0;
    for (int seed = 1; seed <= scenarios; ++seed) {
        Rng rng(static_cast<std::uint32_t>(seed) * 7919u);
        GameState g = EconomyGame(400);
        Prebuilt(g, "Barracks", 8, 14);
        for (int i = 0; i < 24; ++i) {
            const bool enemy = rng.Chance(20);
            SpawnAt(g, 80.0f + static_cast<float>(rng.Int(0, 1300)), 80.0f + static_cast<float>(rng.Int(0, 800)),
                enemy ? Team::Enemy : Team::Player, enemy ? "Grunt" : (rng.Chance(30) ? "Worker" : "Soldier"));
        }
        // Kẻ đứng đè lên nhau hoặc lên công trình không quan trọng ở đây (không chạy mô phỏng dài).
        for (int step = 0; step < 150; ++step) {
            const int w = rng.Chance(50) ? 1280 : 800;
            const int h = rng.Chance(50) ? 720 : 600;
            const float mx = static_cast<float>(rng.Int(0, w - 1)), my = static_cast<float>(rng.Int(0, h - 1));
            const bool shift = rng.Chance(40);
            switch (rng.Int(0, 12)) {
            case 0: case 1: Click(g, mx, my, shift); if (shift) ++shiftAdds; break;
            case 2: Drag(g, mx, my, static_cast<float>(rng.Int(0, w - 1)), static_cast<float>(rng.Int(0, h - 1)), shift); break;
            case 3: HandleSaveGroupKey(g, rng.Int(1, kControlGroupCount)); break;
            case 4: case 5: HandleNumberKey(g, rng.Int(1, kControlGroupCount)); ++recalls; break;
            case 6: case 7: if (HandleHudClick(g, w, h, mx, my, shift)) ++hudConsumed; break;
            case 8: { // bấm đúng một nút bất kỳ
                const HudLayout L = BuildHudLayout(g, w, h);
                if (!L.buttons.empty()) {
                    const HudButton& b = L.buttons[static_cast<size_t>(rng.Int(0, static_cast<int>(L.buttons.size()) - 1))];
                    if (HandleHudClick(g, w, h, b.rect.x + b.rect.w / 2.0f, b.rect.y + b.rect.h / 2.0f, shift)) ++hudConsumed;
                }
                break;
            }
            case 9: // giết vài lính; game bỏ chọn lính chết ở nhịp mô phỏng kế tiếp nên chạy 1 nhịp trước khi kiểm
                for (auto& u : g.units) if (u.team == Team::Player && u.IsAlive() && rng.Chance(8)) u.TakeDamage(10000);
                RunSteps(g, 1);
                break;
            case 10: RunSteps(g, rng.Int(1, 40)); break;
            case 11: if (rng.Chance(30)) HandleBuildKey(g); else if (rng.Chance(30)) HandleCancelKey(g); break;
            case 12: IssueSmartOrder(g, mx, my); break;
            }
            const std::string bad = CheckInvariants(g);
            ASSERT_TRUE(bad.empty()) << "seed " << seed << " step " << step << ": " << bad;
            RenderGame(nullptr, g, w, h);
        }
    }
    EXPECT_GT(hudConsumed, 0);
    EXPECT_GT(shiftAdds, 0);
    EXPECT_GT(recalls, 0);
}
