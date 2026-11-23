#include "game/Render.h"
#include <algorithm>
#include <cmath>
#include <string>
#include <vector>
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
        SDL_RenderDebugText(r, 10.0f, 10.0f, debugText.c_str());
    }
}

void RenderGame(SDL_Renderer* r, const GameState& g, int windowW, int windowH) {
    SDL_SetRenderDrawColor(r, 20, 25, 20, 255);
    SDL_RenderClear(r);

    // Làm tròn camera xuống số nguyên để các ô không bị nhấp nháy/hở 1 pixel khi cuộn.
    const float camX = std::floor(g.camera.x);
    const float camY = std::floor(g.camera.y);

    RenderTiles(r, g, camX, camY, windowW, windowH);
    RenderPaths(r, g, camX, camY);
    RenderUnits(r, g, camX, camY);
    RenderSelectionBox(r, g, camX, camY);
    RenderHud(r, g, windowW, windowH);
    if (g.debugMode) RenderDebugOverlay(r, g);
    SDL_RenderPresent(r);
}
