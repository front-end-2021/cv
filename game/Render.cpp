#include "game/Render.h"
#include <algorithm>
#include <cmath>
#include <string>
#include <vector>
#include "game/Construction.h"
#include "game/Hud.h"
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
            if (!p.HasTarget() && p.team == Team::Player && !p.IsAttackMoving()) {
                SDL_SetRenderDrawColor(r, 100, 255, 120, 230);
                SDL_RenderLine(r, prevX - 5.0f, prevY, prevX + 5.0f, prevY);
                SDL_RenderLine(r, prevX, prevY - 5.0f, prevX, prevY + 5.0f);
            }
        }
    }

    // Dấu (x) đỏ ở đích của lệnh Attack-move, cho các lính phe ta đang được chọn (kể cả lúc đang bận đánh giữa đường).
    void RenderAttackMoveMarkers(SDL_Renderer* r, const GameState& g, float camX, float camY) {
        SDL_SetRenderDrawColor(r, 255, 90, 70, 230);
        for (const auto& u : g.units) {
            if (!u.selected || u.team != Team::Player || !u.IsAlive() || !u.IsAttackMoving()) continue;
            const float gx = u.attackMoveGoal.x - camX;
            const float gy = u.attackMoveGoal.y - camY;
            SDL_RenderLine(r, gx - 5.0f, gy - 5.0f, gx + 5.0f, gy + 5.0f);
            SDL_RenderLine(r, gx - 5.0f, gy + 5.0f, gx + 5.0f, gy - 5.0f);
        }
    }

    // Con trỏ chữ thập đỏ khi đang chờ chọn điểm Attack-move.
    void RenderAttackMoveCursor(SDL_Renderer* r) {
        float mx = 0.0f, my = 0.0f;
        SDL_GetMouseState(&mx, &my);
        SDL_SetRenderDrawColor(r, 255, 90, 70, 255);
        SDL_RenderLine(r, mx - 12.0f, my, mx + 12.0f, my);
        SDL_RenderLine(r, mx, my - 12.0f, mx, my + 12.0f);
        const SDL_FRect box = { mx - 7.0f, my - 7.0f, 14.0f, 14.0f };
        SDL_RenderRect(r, &box);
    }

    // Vẽ tất cả các Unit; unit ở phía dưới (y lớn hơn) vẽ sau để che unit phía trên.
    void RenderUnits(SDL_Renderer* r, const GameState& g, float camX, float camY) {
        const float alpha = g.renderAlpha;
        std::vector<const Unit*> drawOrder;
        drawOrder.reserve(g.units.size()); // cấp phát trước một vùng nhớ cho drawOrder đủ để chứa lượng phần tử = size của g.units
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

    // Bộ đếm quân (góc trên phải) + banner kết quả. Phần còn lại của HUD nằm ở game/Hud.cpp.
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
    RenderAttackMoveMarkers(r, g, camX, camY);
    RenderPlacementGhost(r, g, camX, camY);
    RenderSelectionBox(r, g, camX, camY);
    if (g.attackMoveArmed) RenderAttackMoveCursor(r);
    RenderHud(r, g, windowW, windowH);
    DrawHud(r, g, windowW, windowH); // thanh tài nguyên, nhóm điều khiển, bảng thông tin và thẻ lệnh (game/Hud.cpp)
    if (g.debugMode) RenderDebugOverlay(r, g);
    SDL_RenderPresent(r);
}
