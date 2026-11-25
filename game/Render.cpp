#include "game/Render.h"
#include <algorithm>
#include <cmath>
#include <string>
#include <vector>
#include "game/Commands.h"
#include "game/Construction.h"
#include "game/Economy.h"
#include "game/Selection.h"

namespace {
    void RenderTiles(SDL_Renderer* r, const GameState& g, float camX, float camY, int windowW, int windowH) {
        // Chỉ vẽ các tile nằm trong vùng camera nhìn thấy.
        const int firstCol = std::max(0, static_cast<int>(camX / g.map.tileSize));
        const int firstRow = std::max(0, static_cast<int>(camY / g.map.tileSize));
        const int lastCol = std::min(g.map.cols - 1, static_cast<int>((camX + windowW) / g.map.tileSize));
        const int lastRow = std::min(g.map.rows - 1, static_cast<int>((camY + windowH) / g.map.tileSize));

        for (int row = firstRow; row <= lastRow; ++row) {
            for (int col = firstCol; col <= lastCol; ++col) {
                SDL_FRect tile = {
                    col * g.map.tileSize - camX,
                    row * g.map.tileSize - camY,
                    g.map.tileSize,
                    g.map.tileSize };

                switch (g.map.data[static_cast<size_t>(row) * static_cast<size_t>(g.map.cols) + static_cast<size_t>(col)]) {
                case Tile::Dirt: SDL_SetRenderDrawColor(r, 145, 105, 65, 255); // đất nâu
                    break;
                case Tile::Water: SDL_SetRenderDrawColor(r, 55, 115, 190, 255); // nước xanh dương
                    break;
                case Tile::Rock: SDL_SetRenderDrawColor(r, 136, 140, 141, 255); // đá xám
                    break;
                case Tile::Grass:
                default: SDL_SetRenderDrawColor(r, 75, 145, 75, 255); // cỏ xanh lá
                    break;
                }
                SDL_RenderFillRect(r, &tile);

                if (g.debugMode) {
                    // Đường viền nhẹ để nhìn rõ lưới ô vuông.
                    SDL_SetRenderDrawColor(r, 55, 105, 55, 255);
                    SDL_RenderRect(r, &tile);
                }
            }
        }
    }

    // Đường đi A* của từng Unit (chỉ vẽ nét khi debug) và dấu (+) ở điểm đích của lệnh đi.
    void RenderPaths(SDL_Renderer* r, const GameState& g, float camX, float camY) {
        for (const auto& p : g.units) {
            if (p.path.empty() || !p.IsAlive()) continue;
            float prevX = p.RenderX(g.renderAlpha) - camX;
            float prevY = p.RenderY(g.renderAlpha) - camY;
            if (g.debugMode) { SDL_SetRenderDrawColor(r, 100, 255, 120, 140); }
            for (const auto& wp : p.path) {
                const float nextX = wp.x - camX;
                const float nextY = wp.y - camY;
                if (g.debugMode) { SDL_RenderLine(r, prevX, prevY, nextX, nextY); }
                prevX = nextX;
                prevY = nextY;
            }

            // Vẽ dấu (+) ở điểm đích cuối cùng (không vẽ khi đang đuổi theo mục tiêu)
            if (!p.HasTarget() && p.team == Team::Player) {
                SDL_SetRenderDrawColor(r, 100, 255, 120, 230);
                SDL_RenderLine(r, prevX - 5.0f, prevY, prevX + 5.0f, prevY);
                SDL_RenderLine(r, prevX, prevY - 5.0f, prevX, prevY + 5.0f);
            }
        }
    }

    // Vẽ tất cả các Unit; unit ở phía dưới (y lớn hơn) vẽ sau để che unit phía trên.
    void RenderUnits(SDL_Renderer* r, const GameState& g, float camX, float camY) {
        const float alpha = g.renderAlpha;
        std::vector<const Unit*> drawOrder;
        drawOrder.reserve(g.units.size());
        for (const auto& p : g.units) { if (!p.IsGone()) drawOrder.push_back(&p); }
        std::sort(drawOrder.begin(), drawOrder.end(), [alpha](const Unit* a, const Unit* b) {
            return a->RenderY(alpha) < b->RenderY(alpha); });
        for (const Unit* p : drawOrder) {
            p->Render(r, camX, camY, alpha, g.debugMode, g.FindUnit(p->attackTargetId));
        }
    }

    // Mỏ và công trình (vẽ trước lính: lính không bao giờ đứng lên các ô của chúng).
    void RenderResources(SDL_Renderer* r, const GameState& g, float camX, float camY) {
        for (const auto& n : g.resources) n.Render(r, camX, camY, g.debugMode);
    }

    void RenderBuildings(SDL_Renderer* r, const GameState& g, float camX, float camY) {
        for (const auto& b : g.buildings) b.Render(r, camX, camY, g.debugMode);
    }

    // Đường nối từ công trình đang chọn tới điểm tập kết của nó, kèm lá cờ nhỏ.
    void RenderRallyPoints(SDL_Renderer* r, const GameState& g, float camX, float camY) {
        for (const auto& b : g.buildings) {
            if (!b.selected || !b.hasRally) continue;
            const float fx = b.rally.x - camX;
            const float fy = b.rally.y - camY;
            SDL_SetRenderDrawColor(r, 90, 200, 255, 150);
            SDL_RenderLine(r, b.x - camX, b.y - camY, fx, fy);
            SDL_FRect flag = { fx - 1.0f, fy - 16.0f, 12.0f, 8.0f };
            SDL_RenderLine(r, fx, fy, fx, fy - 16.0f);
            SDL_SetRenderDrawColor(r, 90, 200, 255, 255);
            SDL_RenderFillRect(r, &flag);
        }
    }

    // Bóng mờ công trình khi đang đặt nhà: từng ô xanh nếu xây được, đỏ nếu không; viền đỏ nếu cả vị trí không hợp lệ.
    void RenderPlacementGhost(SDL_Renderer* r, const GameState& g, float camX, float camY) {
        const PlacementMode& p = g.placement;
        if (!p.active || p.buildingType < 0 || p.buildingType >= g.buildingTypes.Count()) return;
        const BuildingType& type = g.buildingTypes.Get(p.buildingType);
        const float ts = g.map.tileSize;

        for (int row = p.row; row < p.row + type.height; ++row) {
            for (int col = p.col; col < p.col + type.width; ++col) {
                const SDL_FRect cell = { static_cast<float>(col) * ts - camX, static_cast<float>(row) * ts - camY, ts, ts };
                if (IsTileBuildable(g, row, col)) SDL_SetRenderDrawColor(r, 60, 220, 90, 120);
                else                              SDL_SetRenderDrawColor(r, 235, 60, 60, 150);
                SDL_RenderFillRect(r, &cell);
            }
        }
        const SDL_FRect box = { static_cast<float>(p.col) * ts - camX, static_cast<float>(p.row) * ts - camY,
                                static_cast<float>(type.width) * ts, static_cast<float>(type.height) * ts };
        const bool ok = (p.status == PlaceResult::Ok);
        SDL_SetRenderDrawColor(r, ok ? 120 : 255, ok ? 255 : 90, ok ? 140 : 90, 255);
        SDL_RenderRect(r, &box);
        SDL_SetRenderDrawColor(r, 255, 255, 255, 255);
        SDL_RenderDebugText(r, box.x + (box.w - static_cast<float>(type.name.size()) * 8.0f) / 2.0f, box.y + box.h / 2.0f - 4.0f, type.name.c_str());
        if (!ok) {
            const char* why = DescribePlaceResult(p.status);
            SDL_SetRenderDrawColor(r, 255, 120, 120, 255);
            SDL_RenderDebugText(r, box.x, box.y + box.h + 6.0f, why);
        }
    }

    void RenderSelectionBox(SDL_Renderer* r, const GameState& g, float camX, float camY) {
        if (!g.selection.active) return;
        // Chuyển từ tọa độ thế giới về tọa độ màn hình
        SDL_FRect selectScreenRect = GetNormalizedRect(
            g.selection.startX - camX, g.selection.startY - camY,
            g.selection.endX - camX, g.selection.endY - camY);

        // Nền xanh lá bán trong suốt kiểu game RTS
        SDL_SetRenderDrawColor(r, 50, 220, 80, 50);
        SDL_RenderFillRect(r, &selectScreenRect);

        // Viền khung quét
        SDL_SetRenderDrawColor(r, 50, 255, 80, 220);
        SDL_RenderRect(r, &selectScreenRect);
    }

    // HUD: số quân còn lại + thông báo kết quả
    void RenderHud(SDL_Renderer* r, const GameState& g, int windowW, int windowH) {
        const std::string hud =
            "Player " + std::to_string(g.CountUnits(Team::Player, true)) + "/" + std::to_string(g.StartCount(Team::Player)) +
            "   Enemy " + std::to_string(g.CountUnits(Team::Enemy, true)) + "/" + std::to_string(g.StartCount(Team::Enemy));
        SDL_SetRenderDrawColor(r, 255, 255, 255, 255);
        SDL_RenderDebugText(r, static_cast<float>(windowW) - static_cast<float>(hud.size()) * 8.0f - 12.0f, 10.0f, hud.c_str());

        if (g.result == MatchResult::Playing) return;
        const bool won = (g.result == MatchResult::Victory);
        const std::string title = won ? "VICTORY!" : "DEFEAT";
        const std::string hint = "R: play again    Esc: map menu";
        const float cx = static_cast<float>(windowW) / 2.0f;
        const float cy = static_cast<float>(windowH) / 2.0f;
        SDL_FRect banner = { cx - 190.0f, cy - 45.0f, 380.0f, 90.0f };
        SDL_SetRenderDrawColor(r, 0, 0, 0, 170);
        SDL_RenderFillRect(r, &banner);
        SDL_SetRenderDrawColor(r, won ? 90 : 235, won ? 235 : 90, 90, 255);
        SDL_RenderRect(r, &banner);
        SDL_RenderDebugText(r, cx - static_cast<float>(title.size()) * 4.0f, cy - 20.0f, title.c_str());
        SDL_SetRenderDrawColor(r, 255, 255, 255, 255);
        SDL_RenderDebugText(r, cx - static_cast<float>(hint.size()) * 4.0f, cy + 12.0f, hint.c_str());
    }

    // Khung chữ nền tối ở góc dưới-trái; mỗi dòng một màu.
    struct HudLine { std::string text; Uint8 r, g, b; };
    void RenderTextPanel(SDL_Renderer* r, const std::vector<HudLine>& lines, float x, float bottom) {
        if (lines.empty()) return;
        float width = 0.0f;
        for (const auto& l : lines) width = std::max(width, static_cast<float>(l.text.size()) * 8.0f);
        const float height = static_cast<float>(lines.size()) * 14.0f + 10.0f;
        SDL_FRect panel = { x, bottom - height, width + 16.0f, height };
        SDL_SetRenderDrawColor(r, 0, 0, 0, 160);
        SDL_RenderFillRect(r, &panel);
        float y = panel.y + 6.0f;
        for (const auto& l : lines) {
            SDL_SetRenderDrawColor(r, l.r, l.g, l.b, 255);
            SDL_RenderDebugText(r, panel.x + 8.0f, y, l.text.c_str());
            y += 14.0f;
        }
    }

    // Vàng, slot quân (trên cùng bên trái) và bảng gợi ý lệnh theo thứ đang chọn (dưới cùng bên trái).
    void RenderEconomyHud(SDL_Renderer* r, const GameState& g, int windowH) {
        if (g.economyActive) {
            const std::string bar = "Gold: " + std::to_string(g.Gold(Team::Player)) +
                "   Supply: " + std::to_string(SupplyUsed(g, Team::Player)) + "/" + std::to_string(SupplyCap(g, Team::Player));
            SDL_FRect back = { 6.0f, 6.0f, static_cast<float>(bar.size()) * 8.0f + 12.0f, 20.0f };
            SDL_SetRenderDrawColor(r, 0, 0, 0, 160);
            SDL_RenderFillRect(r, &back);
            SDL_SetRenderDrawColor(r, 255, 225, 90, 255);
            SDL_RenderDebugText(r, 12.0f, 12.0f, bar.c_str());
        }

        std::vector<HudLine> lines;
        auto add = [&](const std::string& text, Uint8 cr = 235, Uint8 cg = 235, Uint8 cb = 235) { lines.push_back({ text, cr, cg, cb }); };

        if (g.placement.active) {
            add("BUILD MODE   LMB: place   RMB/Esc: cancel", 160, 255, 170);
            std::string row;
            for (int i = 0; i < g.buildingTypes.Count() && i < 9; ++i) {
                const BuildingType& t = g.buildingTypes.Get(i);
                row += (i == g.placement.buildingType ? "> " : "  ");
                row += "[" + std::to_string(i + 1) + "] " + t.name + " " + std::to_string(t.cost) + "g  ";
            }
            add(row);
        }
        else {
            bool anyWorker = false;
            for (const auto& u : g.units) {
                if (u.selected && u.team == Team::Player && u.IsAlive() && u.IsWorker()) { anyWorker = true; break; }
            }
            if (anyWorker) add("Worker: B = build   RMB on gold mine = mine   RMB on building site = build");

            for (const auto& b : g.buildings) {
                if (!b.selected || b.team != Team::Player) continue;
                if (!b.complete) {
                    add(b.label + ": under construction " + std::to_string(static_cast<int>(b.progress * 100.0f)) + "%   Del: cancel (75% refund)");
                    continue;
                }
                add(b.label + "  HP " + std::to_string(b.HpValue) + "/" + std::to_string(b.HpMax));
            }
            const std::vector<int> options = TrainableUnitTypes(g);
            if (!options.empty()) {
                std::string row;
                for (size_t i = 0; i < options.size() && i < 9; ++i) {
                    const UnitType& t = g.unitTypes.Get(options[i]);
                    row += "[" + std::to_string(i + 1) + "] " + t.name + " " + std::to_string(t.cost) + "g  ";
                }
                add("Train: " + row);
                for (const auto& b : g.buildings) {
                    if (!b.selected || b.team != Team::Player || b.queue.empty()) continue;
                    std::string q = "Queue (" + b.label + "): ";
                    for (size_t i = 0; i < b.queue.size(); ++i) {
                        q += g.unitTypes.Get(b.queue[i].unitType).name;
                        if (i == 0) q += " " + std::to_string(static_cast<int>(b.queue[i].Ratio() * 100.0f)) + "%";
                        if (i + 1 < b.queue.size()) q += " | ";
                    }
                    add(q, 160, 215, 255);
                }
                add("RMB: set rally point   Backspace: cancel last in queue");
            }
        }
        if (g.noticeTimer > 0.0f && !g.notice.empty()) add(g.notice, 255, 170, 90);
        RenderTextPanel(r, lines, 8.0f, static_cast<float>(windowH) - 8.0f);
    }

    void RenderDebugOverlay(SDL_Renderer* r, const GameState& g) {
        float mouseX = 0.0f, mouseY = 0.0f;
        SDL_GetMouseState(&mouseX, &mouseY);

        const float worldMouseX = mouseX + g.camera.x;
        const float worldMouseY = mouseY + g.camera.y;
        const int tileCol = static_cast<int>(std::floor(worldMouseX / g.map.tileSize));
        const int tileRow = static_cast<int>(std::floor(worldMouseY / g.map.tileSize));

        std::string debugText = "Tile: (" + std::to_string(tileCol) + ", " + std::to_string(tileRow) + ")";

        if (tileCol >= 0 && tileCol < g.map.cols && tileRow >= 0 && tileRow < g.map.rows) {
            debugText += " | World: (" +
                std::to_string(static_cast<int>(worldMouseX)) + ", " +
                std::to_string(static_cast<int>(worldMouseY)) + ")";
        }
        else {
            debugText += " | Outside map";
        }
        debugText += " | Tick: " + std::to_string(g.tickCount);
        debugText += " | PathQ: " + std::to_string(g.pathQueue.size());

        SDL_SetRenderDrawColor(r, 255, 255, 0, 255);
        SDL_RenderDebugText(r, 10.0f, 32.0f, debugText.c_str()); // dưới thanh vàng/slot quân
    }
}

void RenderGame(SDL_Renderer* r, const GameState& g, int windowW, int windowH) {
    SDL_SetRenderDrawColor(r, 20, 25, 20, 255);
    SDL_RenderClear(r);

    // Làm tròn camera xuống số nguyên để các ô không bị nhấp nháy/hở 1 pixel khi cuộn.
    const float camX = std::floor(g.camera.x);
    const float camY = std::floor(g.camera.y);

    RenderTiles(r, g, camX, camY, windowW, windowH);
    RenderResources(r, g, camX, camY);
    RenderBuildings(r, g, camX, camY);
    RenderPaths(r, g, camX, camY);
    RenderUnits(r, g, camX, camY);
    RenderRallyPoints(r, g, camX, camY);
    RenderPlacementGhost(r, g, camX, camY);
    RenderSelectionBox(r, g, camX, camY);
    RenderHud(r, g, windowW, windowH);
    RenderEconomyHud(r, g, windowH);
    if (g.debugMode) RenderDebugOverlay(r, g);
    SDL_RenderPresent(r);
}
