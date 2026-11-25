#include "ResourceNode.h"
#include <algorithm>
#include <cstdio>
#include <cstring>

ResourceNode::ResourceNode(int row, int col, int initialAmount, float tileSize)
    : Entity(0.0f, 0.0f, tileSize * static_cast<float>(kMineTiles)) {
    fp = Footprint::Make(row, col, kMineTiles, kMineTiles, tileSize);
    x = fp.CenterX();
    y = fp.CenterY();
    SnapPrevToCurrent();
    amount = std::max(0, initialAmount);
    maxAmount = amount;
}

void ResourceNode::Render(SDL_Renderer* r, float camX, float camY, bool debug) const {
    const SDL_FRect box = { fp.left - camX, fp.top - camY, fp.right - fp.left, fp.bottom - fp.top };
    const SDL_FRect body = { box.x + 6.0f, box.y + 6.0f, box.w - 12.0f, box.h - 12.0f };

    SDL_FRect shadow = { box.x + 8.0f, box.y + box.h - 10.0f, box.w - 12.0f, 8.0f };
    SDL_SetRenderDrawColor(r, 0, 0, 0, 70);
    SDL_RenderFillRect(r, &shadow);

    // Mỏ nhỏ dần khi bị đào: tỉ lệ còn lại quyết định kích thước "khối vàng" bên trong.
    const float ratio = maxAmount > 0 ? std::clamp(static_cast<float>(amount) / static_cast<float>(maxAmount), 0.0f, 1.0f) : 0.0f;
    SDL_SetRenderDrawColor(r, 96, 82, 60, 255);
    SDL_RenderFillRect(r, &body);
    const float inset = (1.0f - ratio) * (body.w * 0.30f);
    SDL_FRect gold = { body.x + 6.0f + inset, body.y + 6.0f + inset, body.w - 12.0f - 2.0f * inset, body.h - 12.0f - 2.0f * inset };
    SDL_SetRenderDrawColor(r, 235, 195, 55, 255);
    SDL_RenderFillRect(r, &gold);
    SDL_SetRenderDrawColor(r, 255, 240, 160, 255);
    SDL_FRect glint = { gold.x + 4.0f, gold.y + 4.0f, std::max(2.0f, gold.w * 0.25f), std::max(2.0f, gold.h * 0.12f) };
    SDL_RenderFillRect(r, &glint);
    SDL_SetRenderDrawColor(r, 60, 50, 30, 255);
    SDL_RenderRect(r, &body);

    // Số vàng còn lại ngay phía trên mỏ.
    char text[24];
    std::snprintf(text, sizeof(text), "%d", amount);
    SDL_SetRenderDrawColor(r, 255, 235, 120, 255);
    SDL_RenderDebugText(r, box.x + (box.w - static_cast<float>(std::strlen(text)) * 8.0f) / 2.0f, box.y - 12.0f, text);

    if (debug) {
        char info[32];
        std::snprintf(info, sizeof(info), "id %u", id);
        SDL_SetRenderDrawColor(r, 255, 255, 255, 255);
        SDL_RenderDebugText(r, box.x + 4.0f, box.y + box.h + 2.0f, info);
    }
}
