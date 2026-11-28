#include "game/Hud.h"
#include <algorithm>
#include <cmath>
#include <cstdio>
#include "game/Commands.h"
#include "game/Economy.h"
#include "game/Production.h"
#include "game/Selection.h"

namespace {
    // ---- Kích thước (pixel). Font gỡ lỗi của SDL rộng 8px mỗi ký tự. ----
    constexpr float kCharW = 8.0f;
    constexpr float kLineH = 14.0f;
    constexpr float kPad = 10.0f;               // lề trái / phải của bảng đáy
    constexpr float kInnerTop = 8.0f;           // lề trên / dưới bên trong bảng đáy
    constexpr float kBtnW = 96.0f;
    constexpr float kBtnH = 36.0f;
    constexpr float kBtnGapX = 6.0f;
    constexpr float kBtnGapY = 4.0f;
    constexpr int kCardCols = 3;
    constexpr int kCardSlots = 9;
    constexpr int kCancelSlot = 8;              // nút Cancel luôn ở ô cuối (dưới cùng bên phải)
    constexpr float kIcon = 24.0f;              // ô lính trong lưới
    constexpr float kIconGap = 3.0f;
    constexpr float kHeaderH = 18.0f;           // dòng tiêu đề phía trên lưới lính
    constexpr float kQueueIcon = 28.0f;
    constexpr float kQueueGap = 2.0f;
    constexpr float kQueueLabelW = 48.0f;       // chỗ cho chữ "Queue" trước các ô hàng đợi
    constexpr float kPortrait = 64.0f;
    constexpr float kGroupW = 52.0f;
    constexpr float kGroupH = 20.0f;
    constexpr float kGroupGap = 4.0f;
    constexpr size_t kBtnMaxChars = 11;         // chữ tối đa trên một nút lệnh
    constexpr size_t kMaxBuildingLines = 6;     // chọn nhiều công trình: tối đa ngần này dòng chi tiết

    struct Color { Uint8 r, g, b, a; };
    constexpr Color kWhite{ 235, 235, 235, 255 };
    constexpr Color kDim{ 150, 160, 150, 255 };
    constexpr Color kGold{ 255, 225, 90, 255 };
    constexpr Color kTitle{ 190, 255, 190, 255 };
    constexpr Color kPlayerBody{ 230, 200, 60, 255 };   // cùng màu thân lính phe ta khi vẽ (entity/Unit.cpp)
    constexpr Color kBuildingBody{ 70, 110, 190, 255 }; // cùng màu công trình phe ta (entity/Building.cpp)

    bool Inside(const SDL_FRect& rc, float x, float y) {
        return x >= rc.x && x < rc.x + rc.w && y >= rc.y && y < rc.y + rc.h;
    }

    std::string Fit(const std::string& s, size_t maxChars) { return s.size() <= maxChars ? s : s.substr(0, maxChars); }
    std::string Num(int v) { return std::to_string(v); }
    std::string FirstLetter(const std::string& s) { return s.empty() ? std::string("?") : std::string(1, s[0]); }
    float TextW(const std::string& s) { return static_cast<float>(s.size()) * kCharW; }

    std::string UnitName(const GameState& g, const Unit& u) {
        return (u.typeId >= 0 && u.typeId < g.unitTypes.Count()) ? g.unitTypes.Get(u.typeId).name : std::string("Unit");
    }

    std::string ResourceBarText(const GameState& g) {
        return "Gold: " + Num(g.Gold(Team::Player)) +
            "   Supply: " + Num(SupplyUsed(g, Team::Player)) + "/" + Num(SupplyCap(g, Team::Player));
    }

    // Thứ đang được chọn (phe ta). Đã có lính thì lờ công trình, như luật chọn trong game/Selection.cpp.
    struct Picked {
        std::vector<const Unit*> units;
        std::vector<const Building*> buildings;
    };

    Picked PickSelection(const GameState& g) {
        Picked p;
        for (const auto& u : g.units) {
            if (u.selected && u.team == Team::Player && u.IsAlive()) p.units.push_back(&u);
        }
        if (!p.units.empty()) return p;
        for (const auto& b : g.buildings) {
            if (b.selected && b.team == Team::Player) p.buildings.push_back(&b);
        }
        return p;
    }

    // ---------------------------------------------------------------------------
    // Bố cục
    // ---------------------------------------------------------------------------
    void AddCommand(HudLayout& L, int slot, HudAction action, int arg, EntityId id,
        const std::string& label, const std::string& sub, bool enabled = true, bool active = false) {
        HudButton b;
        b.kind = HudButtonKind::Command;
        b.action = action;
        b.arg = arg;
        b.id = id;
        b.label = Fit(label, kBtnMaxChars);
        b.sub = Fit(sub, kBtnMaxChars);
        b.enabled = enabled;
        b.active = active;
        const int col = slot % kCardCols;
        const int row = slot / kCardCols;
        b.rect = { L.card.x + static_cast<float>(col) * (kBtnW + kBtnGapX),
                   L.card.y + static_cast<float>(row) * (kBtnH + kBtnGapY), kBtnW, kBtnH };
        L.buttons.push_back(std::move(b));
    }

    // Có công trình nào đang chọn huấn luyện được loại `unitType` ngay bây giờ không (đủ vàng, đủ slot quân, hàng đợi chưa đầy).
    bool CanTrainNow(const GameState& g, int unitType, const std::vector<const Building*>& buildings) {
        const UnitType& t = g.unitTypes.Get(unitType);
        if (!CanAfford(g, Team::Player, t.cost)) return false;
        if (SupplyUsed(g, Team::Player) + t.supply > SupplyCap(g, Team::Player)) return false;
        for (const Building* b : buildings) {
            if (b->complete && CanProduce(g, *b, unitType) && static_cast<int>(b->queue.size()) < kMaxQueueLength) return true;
        }
        return false;
    }

    void BuildCommandCard(const GameState& g, const Picked& p, HudLayout& L) {
        if (g.placement.active) {
            // Đang đặt nhà: mỗi loại công trình một nút (ghi kèm phím chữ tương ứng, xem kBuildingHotkeys); Cancel ở ô cuối nếu còn chỗ.
            const int n = std::min(g.buildingTypes.Count(), kCardSlots);
            for (int i = 0; i < n; ++i) {
                const BuildingType& t = g.buildingTypes.Get(i);
                std::string sub = Num(t.cost) + "g";
                if (const char hotkey = BuildingHotkeyLabel(i)) sub += std::string(" [") + hotkey + "]";   // loại không có phím tắt: chỉ ghi giá
                AddCommand(L, i, HudAction::ChooseBuilding, i, kNoEntity, t.name, sub,
                    CanAfford(g, Team::Player, t.cost), i == g.placement.buildingType);
            }
            if (n < kCardSlots) AddCommand(L, kCancelSlot, HudAction::CancelPlacement, 0, kNoEntity, "Cancel", "[Esc]");
            return;
        }

        if (!p.units.empty()) {
            bool anyWorker = false, allHolding = true;
            for (const Unit* u : p.units) {
                anyWorker = anyWorker || u->IsWorker();
                allHolding = allHolding && u->IsHolding();
            }
            AddCommand(L, 0, HudAction::AttackMove, 0, kNoEntity, "Attack", "[A]", true, g.attackMoveArmed);
            AddCommand(L, 1, HudAction::Stop, 0, kNoEntity, "Stop", "[S]");
            AddCommand(L, 2, HudAction::Hold, 0, kNoEntity, "Hold", "[H]", true, allHolding);
            if (anyWorker) AddCommand(L, 3, HudAction::Build, 0, kNoEntity, "Build", "[B]");
            return;
        }

        if (!p.buildings.empty()) {
            const std::vector<int> options = TrainableUnitTypes(g);
            for (size_t i = 0; i < options.size() && i < static_cast<size_t>(kCancelSlot); ++i) {
                const UnitType& t = g.unitTypes.Get(options[i]);
                AddCommand(L, static_cast<int>(i), HudAction::Train, static_cast<int>(i), kNoEntity,
                    t.name, Num(t.cost) + "g [" + Num(static_cast<int>(i) + 1) + "]", CanTrainNow(g, options[i], p.buildings));
            }
            bool anyUnfinished = false, anyQueue = false;
            for (const Building* b : p.buildings) {
                anyUnfinished = anyUnfinished || !b->complete;
                anyQueue = anyQueue || !b->queue.empty();
            }
            if (anyUnfinished) AddCommand(L, kCancelSlot, HudAction::CancelOrder, 0, kNoEntity, "Cancel", "[Del]");
            else if (anyQueue) AddCommand(L, kCancelSlot, HudAction::CancelOrder, 0, kNoEntity, "Cancel", "[Bksp]");
        }
    }

    // Lưới ô lính (chọn nhiều lính) hoặc các ô hàng đợi (chọn đúng một công trình đã xong).
    void BuildInfoButtons(const GameState& g, const Picked& p, HudLayout& L) {
        (void)g;
        if (p.units.size() >= 2) {
            const float gridTop = L.info.y + kHeaderH;
            const int cols = std::max(0, static_cast<int>((L.info.w + kIconGap) / (kIcon + kIconGap)));
            const int rows = std::max(0, static_cast<int>((L.info.y + L.info.h - gridTop + kIconGap) / (kIcon + kIconGap)));
            const int capacity = cols * rows;
            const int total = static_cast<int>(p.units.size());
            const int shown = std::min(total, capacity);
            for (int i = 0; i < shown; ++i) {
                const Unit& u = *p.units[static_cast<size_t>(i)];
                HudButton b;
                b.kind = HudButtonKind::UnitIcon;
                b.action = HudAction::SelectUnit;
                b.id = u.id;
                b.label = FirstLetter(UnitName(g, u));
                b.rect = { L.info.x + static_cast<float>(i % cols) * (kIcon + kIconGap),
                           gridTop + static_cast<float>(i / cols) * (kIcon + kIconGap), kIcon, kIcon };
                L.buttons.push_back(std::move(b));
            }
            L.hiddenUnits = total - shown;
        }
        else if (p.units.empty() && p.buildings.size() == 1 && p.buildings[0]->complete) {
            const Building& bd = *p.buildings[0];
            for (size_t i = 0; i < bd.queue.size(); ++i) {
                HudButton b;
                b.kind = HudButtonKind::QueueIcon;
                b.action = HudAction::CancelQueued;
                b.arg = static_cast<int>(i);
                b.id = bd.id;
                b.label = FirstLetter(g.unitTypes.Get(bd.queue[i].unitType).name);
                b.rect = { L.info.x + kQueueLabelW + static_cast<float>(i) * (kQueueIcon + kQueueGap),
                           L.info.y + 80.0f, kQueueIcon, kQueueIcon };
                L.buttons.push_back(std::move(b));
            }
        }
    }

    void BuildGroupBar(const GameState& g, const SDL_FRect& panel, HudLayout& L) {
        float x = 8.0f;
        const float y = panel.y - kGroupH - 4.0f;
        for (int n = 1; n <= kControlGroupCount; ++n) {
            const int size = ControlGroupSize(g, n);
            if (size == 0) continue;
            HudButton b;
            b.kind = HudButtonKind::Group;
            b.action = HudAction::RecallGroup;
            b.arg = n;
            b.label = Num(n) + ":" + Num(size);
            b.active = IsControlGroupSelected(g, n);
            b.rect = { x, y, kGroupW, kGroupH };
            L.buttons.push_back(std::move(b));
            x += kGroupW + kGroupGap;
        }
        if (x > 8.0f) {
            L.hasGroupBar = true;
            L.groupBar = { 8.0f, y, x - kGroupGap - 8.0f, kGroupH };
        }
    }
}

HudLayout BuildHudLayout(const GameState& g, int windowW, int windowH) {
    HudLayout L;
    const float w = static_cast<float>(windowW);
    const float h = static_cast<float>(windowH);
    L.panel = { 0.0f, h - kHudPanelHeight, w, kHudPanelHeight };

    const float cardW = static_cast<float>(kCardCols) * kBtnW + static_cast<float>(kCardCols - 1) * kBtnGapX;
    const float cardH = 3.0f * kBtnH + 2.0f * kBtnGapY;
    L.card = { w - cardW - kPad, L.panel.y + kInnerTop, cardW, cardH };
    L.info = { kPad, L.panel.y + kInnerTop, std::max(0.0f, L.card.x - 12.0f - kPad), kHudPanelHeight - 2.0f * kInnerTop };

    if (g.economyActive) {
        L.hasTopBar = true;
        L.topBar = { 6.0f, 6.0f, TextW(ResourceBarText(g)) + 12.0f, 20.0f };
    }

    const Picked p = PickSelection(g);
    BuildCommandCard(g, p, L);
    BuildInfoButtons(g, p, L);
    BuildGroupBar(g, L.panel, L);
    return L;
}

bool HudBlocksPoint(const HudLayout& layout, float x, float y) {
    return Inside(layout.panel, x, y) ||
        (layout.hasTopBar && Inside(layout.topBar, x, y)) ||
        (layout.hasGroupBar && Inside(layout.groupBar, x, y));
}

bool IsOverHud(const GameState& g, int windowW, int windowH, float x, float y) {
    return HudBlocksPoint(BuildHudLayout(g, windowW, windowH), x, y);
}

const HudButton* HudButtonAt(const HudLayout& layout, float x, float y) {
    for (const auto& b : layout.buttons) {
        if (Inside(b.rect, x, y)) return &b;
    }
    return nullptr;
}

bool HandleHudClick(GameState& g, int windowW, int windowH, float x, float y, bool shift) {
    const HudLayout layout = BuildHudLayout(g, windowW, windowH);
    if (!HudBlocksPoint(layout, x, y)) return false;
    const HudButton* hit = HudButtonAt(layout, x, y);
    if (!hit) return true; // nền HUD: nuốt cú bấm, không làm gì

    const HudButton b = *hit; // bản sao: các lệnh dưới đây có thể đổi trạng thái game
    switch (b.action) {
    case HudAction::AttackMove:      HandleAttackMoveKey(g); break;
    case HudAction::Stop:            HandleStopKey(g); break;
    case HudAction::Hold:            HandleHoldKey(g); break;
    case HudAction::Build:           HandleBuildKey(g); break;
    case HudAction::ChooseBuilding:  ChooseBuildingType(g, b.arg); break;
    case HudAction::Train:           HandleNumberKey(g, b.arg + 1); break;
    case HudAction::CancelPlacement: CancelPlacement(g); break;
    case HudAction::CancelOrder:     HandleCancelKey(g); break;
    case HudAction::CancelQueued:    CancelQueuedUnit(g, b.id, b.arg); break;
    case HudAction::RecallGroup:     RecallControlGroup(g, b.arg); break;
    case HudAction::SelectUnit:
        if (shift) RemoveUnitFromSelection(g, b.id);
        else SelectOnlyUnit(g, b.id);
        break;
    case HudAction::None: break;
    }
    return true;
}

std::string HudUnitStatus(const Unit& u) {
    if (u.state == UnitState::Dead) return "Dead";
    if (u.job.kind == JobKind::Gather) return u.job.returning ? "Delivering gold" : "Mining";
    if (u.job.kind == JobKind::Build) return "Building";
    if (u.IsHolding()) return "Holding position";
    if (u.IsAttackMoving()) return "Attack-moving";
    if (u.state == UnitState::Attack || u.HasTarget()) return "Attacking";
    if (u.state == UnitState::Walk) return "Moving";
    return "Idle";
}

// ---------------------------------------------------------------------------
// Vẽ
// ---------------------------------------------------------------------------
namespace {
    void Fill(SDL_Renderer* r, const SDL_FRect& rc, Color c) {
        SDL_SetRenderDrawColor(r, c.r, c.g, c.b, c.a);
        SDL_RenderFillRect(r, &rc);
    }

    void Frame(SDL_Renderer* r, const SDL_FRect& rc, Color c) {
        SDL_SetRenderDrawColor(r, c.r, c.g, c.b, c.a);
        SDL_RenderRect(r, &rc);
    }

    // Chữ, cắt bớt cho khỏi tràn qua `rightEdge`.
    void Text(SDL_Renderer* r, float x, float y, const std::string& s, Color c, float rightEdge = 1e9f) {
        const int fit = static_cast<int>(std::max(0.0f, (rightEdge - x) / kCharW));
        const std::string t = Fit(s, static_cast<size_t>(fit));
        if (t.empty()) return;
        SDL_SetRenderDrawColor(r, c.r, c.g, c.b, c.a);
        SDL_RenderDebugText(r, x, y, t.c_str());
    }

    void TextCentered(SDL_Renderer* r, const SDL_FRect& rc, float y, const std::string& s, Color c) {
        Text(r, rc.x + (rc.w - TextW(s)) / 2.0f, y, s, c);
    }

    // Thanh nền tối + phần đầy theo tỉ lệ.
    void Bar(SDL_Renderer* r, const SDL_FRect& rc, float ratio, Color fill) {
        Fill(r, rc, { 20, 20, 20, 230 });
        SDL_FRect f = rc;
        f.w = rc.w * std::clamp(ratio, 0.0f, 1.0f);
        if (f.w > 0.0f) Fill(r, f, fill);
    }

    Color HealthColor(float ratio) {
        if (ratio > 0.5f) return { 70, 210, 80, 255 };
        if (ratio > 0.25f) return { 230, 200, 60, 255 };
        return { 230, 60, 60, 255 };
    }

    float HpRatio(const Entity& e) {
        return e.HpMax > 0 ? static_cast<float>(std::max(0, e.HpValue)) / static_cast<float>(e.HpMax) : 0.0f;
    }

    std::string OneDecimal(float v) {
        char buf[32];
        std::snprintf(buf, sizeof(buf), "%.1f", static_cast<double>(v));
        return buf;
    }

    void DrawButton(SDL_Renderer* r, const HudButton& b, bool hover) {
        Color bg = b.enabled ? Color{ 38, 58, 44, 235 } : Color{ 52, 40, 40, 235 };
        if (b.active) bg = { 66, 112, 70, 245 };
        if (hover) { bg.r = static_cast<Uint8>(std::min(255, bg.r + 22)); bg.g = static_cast<Uint8>(std::min(255, bg.g + 22)); bg.b = static_cast<Uint8>(std::min(255, bg.b + 22)); }
        Fill(r, b.rect, bg);
        Frame(r, b.rect, b.active ? kGold : (hover ? Color{ 200, 240, 200, 255 } : Color{ 110, 150, 115, 255 }));

        if (b.kind == HudButtonKind::Command) {
            TextCentered(r, b.rect, b.rect.y + 7.0f, b.label, b.enabled ? kWhite : kDim);
            TextCentered(r, b.rect, b.rect.y + 21.0f, b.sub, b.enabled ? kGold : Color{ 150, 120, 90, 255 });
        }
        else if (b.kind == HudButtonKind::Group) {
            TextCentered(r, b.rect, b.rect.y + 6.0f, b.label, b.active ? kGold : kWhite);
        }
    }

    // Ô lính nhỏ trong lưới: thân màu phe ta, chữ cái đầu của loại, thanh máu ở đáy.
    void DrawUnitIcon(SDL_Renderer* r, const GameState& g, const HudButton& b, bool hover) {
        const Unit* u = g.FindUnit(b.id);
        Fill(r, b.rect, kPlayerBody);
        Frame(r, b.rect, hover ? Color{ 255, 255, 255, 255 } : Color{ 90, 70, 20, 255 });
        Text(r, b.rect.x + (b.rect.w - kCharW) / 2.0f, b.rect.y + 5.0f, b.label, { 40, 30, 10, 255 });
        if (u) {
            const float ratio = HpRatio(*u);
            Bar(r, { b.rect.x + 2.0f, b.rect.y + b.rect.h - 6.0f, b.rect.w - 4.0f, 4.0f }, ratio, HealthColor(ratio));
        }
    }

    void DrawQueueIcon(SDL_Renderer* r, const Building& bd, const HudButton& b, bool hover) {
        Fill(r, b.rect, { 60, 90, 150, 255 });
        Frame(r, b.rect, hover ? Color{ 255, 255, 255, 255 } : Color{ 150, 190, 255, 255 });
        Text(r, b.rect.x + (b.rect.w - kCharW) / 2.0f, b.rect.y + 6.0f, b.label, kWhite);
        if (b.arg == 0 && static_cast<size_t>(b.arg) < bd.queue.size()) { // đơn vị đầu hàng: thanh tiến độ
            Bar(r, { b.rect.x + 2.0f, b.rect.y + b.rect.h - 7.0f, b.rect.w - 4.0f, 5.0f }, bd.queue[0].Ratio(), { 90, 200, 255, 255 });
        }
    }

    void DrawPortrait(SDL_Renderer* r, const SDL_FRect& rc, Color body, const std::string& letter, const Entity& e) {
        Fill(r, rc, body);
        Frame(r, rc, { 20, 20, 20, 255 });
        Text(r, rc.x + (rc.w - kCharW) / 2.0f, rc.y + (rc.h - kCharW) / 2.0f, letter, { 30, 30, 30, 255 });
        const float ratio = HpRatio(e);
        Bar(r, { rc.x, rc.y + rc.h + 4.0f, rc.w, 6.0f }, ratio, HealthColor(ratio));
    }

    // "8 Soldier, 4 Worker": đếm theo tên loại, theo thứ tự xuất hiện đầu tiên.
    std::string CountByName(const std::vector<std::string>& names) {
        std::vector<std::pair<std::string, int>> counts;
        for (const auto& n : names) {
            auto it = std::find_if(counts.begin(), counts.end(), [&](const auto& c) { return c.first == n; });
            if (it == counts.end()) counts.push_back({ n, 1 });
            else ++it->second;
        }
        std::string out;
        for (size_t i = 0; i < counts.size(); ++i) {
            if (i) out += ", ";
            out += Num(counts[i].second) + " " + counts[i].first;
        }
        return out;
    }

    void DrawUnitInfo(SDL_Renderer* r, const GameState& g, const Picked& p, const HudLayout& L, float mx, float my) {
        const SDL_FRect& info = L.info;
        const float right = info.x + info.w;

        if (p.units.size() == 1) {
            const Unit& u = *p.units[0];
            const std::string name = UnitName(g, u);
            DrawPortrait(r, { info.x, info.y, kPortrait, kPortrait }, kPlayerBody, FirstLetter(name), u);

            const float tx = info.x + kPortrait + 12.0f;
            float ty = info.y;
            Text(r, tx, ty, name, kTitle, right);
            ty += kLineH + 2.0f;
            std::string line = "HP " + Num(std::max(0, u.HpValue)) + "/" + Num(u.HpMax) + "   Armor " + Num(u.Armor);
            const int shieldMax = (u.typeId >= 0 && u.typeId < g.unitTypes.Count()) ? g.unitTypes.Get(u.typeId).shield : 0;
            if (shieldMax > 0 || u.Shield > 0) line += "   Shield " + Num(u.Shield) + "/" + Num(shieldMax);
            Text(r, tx, ty, line, kWhite, right);
            ty += kLineH;
            Text(r, tx, ty, "Damage " + Num(u.Damage) + "   Range " + Num(static_cast<int>(u.Range)) + "   Cooldown " + OneDecimal(u.Cooldown) + "s", kWhite, right);
            ty += kLineH;
            Text(r, tx, ty, "Speed " + Num(static_cast<int>(u.MoveSpeed)) + "   Supply " + Num(u.Supply), kWhite, right);
            ty += kLineH;
            std::string status = "Status: " + HudUnitStatus(u);
            if (u.IsWorker()) status += "   Carrying " + Num(u.carrying) + "/" + Num(u.carryCapacity);
            Text(r, tx, ty, status, kGold, right);
            return;
        }

        std::vector<std::string> names;
        for (const Unit* u : p.units) names.push_back(UnitName(g, *u));
        std::string header = Num(static_cast<int>(p.units.size())) + " units: " + CountByName(names);
        if (L.hiddenUnits > 0) header += "  (+" + Num(L.hiddenUnits) + " not shown)";
        Text(r, info.x, info.y, header, kTitle, right);

        for (const auto& b : L.buttons) {
            if (b.kind != HudButtonKind::UnitIcon) continue;
            DrawUnitIcon(r, g, b, Inside(b.rect, mx, my));
        }
    }

    void DrawBuildingInfo(SDL_Renderer* r, const GameState& g, const Picked& p, const HudLayout& L, float mx, float my) {
        const SDL_FRect& info = L.info;
        const float right = info.x + info.w;

        if (p.buildings.size() > 1) {
            std::vector<std::string> names;
            for (const Building* b : p.buildings) names.push_back(b->label);
            Text(r, info.x, info.y, Num(static_cast<int>(p.buildings.size())) + " buildings: " + CountByName(names), kTitle, right);
            float ty = info.y + kHeaderH;
            for (size_t i = 0; i < p.buildings.size() && i < kMaxBuildingLines; ++i) {
                const Building& b = *p.buildings[i];
                const std::string state = b.complete
                    ? "HP " + Num(std::max(0, b.HpValue)) + "/" + Num(b.HpMax) + (b.queue.empty() ? "" : "   Queue " + Num(static_cast<int>(b.queue.size())))
                    : "Under construction " + Num(static_cast<int>(b.progress * 100.0f)) + "%";
                Text(r, info.x, ty, b.label + "  " + state, kWhite, right);
                ty += kLineH;
            }
            if (p.buildings.size() > kMaxBuildingLines) Text(r, info.x, ty, "+" + Num(static_cast<int>(p.buildings.size() - kMaxBuildingLines)) + " more", kDim, right);
            return;
        }

        const Building& b = *p.buildings[0];
        DrawPortrait(r, { info.x, info.y, kPortrait, kPortrait }, kBuildingBody, FirstLetter(b.label), b);
        const float tx = info.x + kPortrait + 12.0f;
        float ty = info.y;
        Text(r, tx, ty, b.label, kTitle, right);
        ty += kLineH + 2.0f;
        Text(r, tx, ty, "HP " + Num(std::max(0, b.HpValue)) + "/" + Num(b.HpMax) + "   Armor " + Num(b.Armor), kWhite, right);
        ty += kLineH;

        if (!b.complete) {
            Text(r, tx, ty, "Under construction", kGold, right);
            ty += kLineH;
            const SDL_FRect bar = { tx, ty, 160.0f, 10.0f };
            Bar(r, bar, b.progress, { 240, 205, 60, 255 });
            Frame(r, bar, { 20, 20, 20, 255 });
            Text(r, tx + 168.0f, ty + 1.0f, Num(static_cast<int>(b.progress * 100.0f)) + "%", kWhite, right);
            ty += kLineH;
            Text(r, tx, ty, "Del: cancel (75% refund)", kDim, right);
            return;
        }

        std::string roles;
        if (b.supplyProvided > 0) roles += "Supply +" + Num(b.supplyProvided);
        if (b.dropoff) roles += std::string(roles.empty() ? "" : "   ") + "Drop-off";
        if (!roles.empty()) { Text(r, tx, ty, roles, kWhite, right); ty += kLineH; }
        if (b.producesUnits && b.typeId >= 0 && b.typeId < g.buildingTypes.Count()) {
            std::string names;
            for (const auto& n : g.buildingTypes.Get(b.typeId).produces) names += std::string(names.empty() ? "" : ", ") + n;
            Text(r, tx, ty, "Trains: " + names, kWhite, right);
            ty += kLineH;
            Text(r, tx, ty, b.hasRally ? "Rally point set" : "RMB: set rally point", kDim, right);

            Text(r, info.x, info.y + 80.0f + 10.0f, "Queue", b.queue.empty() ? kDim : kWhite);
            for (const auto& btn : L.buttons) {
                if (btn.kind != HudButtonKind::QueueIcon) continue;
                DrawQueueIcon(r, b, btn, Inside(btn.rect, mx, my));
            }
        }
    }

    void DrawHints(SDL_Renderer* r, const HudLayout& L) {
        const SDL_FRect& info = L.info;
        const float right = info.x + info.w;
        static const char* const kHints[] = {
            "Drag: select   Shift+drag/click: add or remove",
            "Ctrl+1-9: save group   1-9: recall group",
            "RMB: move, attack, mine, build, set rally",
            "A attack-move   S stop   H hold   B build (worker)",
            "Space: jump to selection   \\: debug",
        };
        float ty = info.y + 2.0f;
        for (const char* line : kHints) {
            Text(r, info.x, ty, line, kDim, right);
            ty += kLineH + 2.0f;
        }
    }

    void DrawTopBar(SDL_Renderer* r, const GameState& g, const HudLayout& L) {
        if (!L.hasTopBar) return;
        Fill(r, L.topBar, { 0, 0, 0, 160 });
        const bool full = SupplyCap(g, Team::Player) > 0 && SupplyUsed(g, Team::Player) >= SupplyCap(g, Team::Player);
        // Vàng (vàng) rồi tới slot quân (đỏ khi đầy), vẽ từng phần cho dễ đổi màu.
        const std::string gold = "Gold: " + Num(g.Gold(Team::Player));
        const std::string supply = "Supply: " + Num(SupplyUsed(g, Team::Player)) + "/" + Num(SupplyCap(g, Team::Player));
        Text(r, L.topBar.x + 6.0f, L.topBar.y + 6.0f, gold, kGold);
        Text(r, L.topBar.x + 6.0f + TextW(gold) + 3.0f * kCharW, L.topBar.y + 6.0f, supply, full ? Color{ 255, 110, 90, 255 } : kGold);
    }

    // Dòng gợi ý chế độ (đặt nhà / Attack-move) ở giữa phía trên.
    void DrawModeBanner(SDL_Renderer* r, const GameState& g, const HudLayout& L, int windowW) {
        std::string text;
        Color color = kWhite;
        if (g.placement.active) { text = "BUILD  LMB: place  RMB/Esc: cancel"; color = { 160, 255, 170, 255 }; }
        else if (g.attackMoveArmed) { text = "ATTACK-MOVE  LMB: target  RMB/Esc: cancel"; color = { 255, 130, 110, 255 }; }
        if (text.empty()) return;
        const float centered = (static_cast<float>(windowW) - TextW(text)) / 2.0f;
        float x = centered;
        float y = 6.0f;
        if (L.hasTopBar) x = std::max(x, L.topBar.x + L.topBar.w + 12.0f);
        // Chừa chỗ cho bộ đếm quân ở góc trên phải (Render.cpp); cửa sổ hẹp quá thì hạ banner xuống hàng thứ hai.
        if (x + TextW(text) + 8.0f > static_cast<float>(windowW) - 216.0f) {
            x = std::max(8.0f, centered);
            y = 30.0f;
        }
        Fill(r, { x - 8.0f, y, TextW(text) + 16.0f, 20.0f }, { 0, 0, 0, 170 });
        Text(r, x, y + 6.0f, text, color);
    }

    // Thông báo ngắn (hết tiền, hết slot...) ngay phía trên bảng đáy.
    void DrawNotice(SDL_Renderer* r, const GameState& g, const HudLayout& L, int windowW) {
        if (g.noticeTimer <= 0.0f || g.notice.empty()) return;
        const float centered = (static_cast<float>(windowW) - TextW(g.notice)) / 2.0f;
        float x = centered;
        float y = L.panel.y - kGroupH - 4.0f;
        if (L.hasGroupBar) {
            x = std::max(x, L.groupBar.x + L.groupBar.w + 16.0f);
            // Không đủ chỗ bên phải thanh nhóm (cửa sổ hẹp, nhiều nhóm): đặt thông báo lên hàng ngay phía trên thanh nhóm.
            if (x + TextW(g.notice) + 8.0f > static_cast<float>(windowW)) {
                x = std::max(8.0f, centered);
                y -= kGroupH + 4.0f;
            }
        }
        Fill(r, { x - 8.0f, y, TextW(g.notice) + 16.0f, kGroupH }, { 0, 0, 0, 170 });
        Text(r, x, y + 6.0f, g.notice, { 255, 170, 90, 255 });
    }
}

void DrawHud(SDL_Renderer* r, const GameState& g, int windowW, int windowH) {
    const HudLayout L = BuildHudLayout(g, windowW, windowH);
    float mx = 0.0f, my = 0.0f;
    SDL_GetMouseState(&mx, &my);

    DrawTopBar(r, g, L);
    DrawModeBanner(r, g, L, windowW);

    // Thanh nhóm điều khiển.
    for (const auto& b : L.buttons) {
        if (b.kind == HudButtonKind::Group) DrawButton(r, b, Inside(b.rect, mx, my));
    }
    DrawNotice(r, g, L, windowW);

    // Bảng đáy.
    Fill(r, L.panel, { 14, 18, 14, 240 });
    SDL_SetRenderDrawColor(r, 90, 140, 90, 255);
    SDL_RenderLine(r, L.panel.x, L.panel.y, L.panel.x + L.panel.w, L.panel.y);

    const Picked p = PickSelection(g);
    if (!p.units.empty()) DrawUnitInfo(r, g, p, L, mx, my);
    else if (!p.buildings.empty()) DrawBuildingInfo(r, g, p, L, mx, my);
    else DrawHints(r, L);

    for (const auto& b : L.buttons) {
        if (b.kind == HudButtonKind::Command) DrawButton(r, b, Inside(b.rect, mx, my));
    }
}
