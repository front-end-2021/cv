#include "Building.h"
#include <algorithm>
#include <cmath>
#include <cstdio>

Building::Building(const BuildingType& type, int typeIndex, int row, int col, float tileSize, Team teamOwner, bool isComplete)
    : Entity(0.0f, 0.0f, tileSize * static_cast<float>(std::max(type.width, type.height))) {
    typeId = typeIndex;
    label = type.name;
    fp = Footprint::Make(row, col, type.width, type.height, tileSize);
    x = fp.CenterX();
    y = fp.CenterY();
    SnapPrevToCurrent();
    team = teamOwner;
    buildTime = type.buildTime;
    dropoff = type.dropoff;
    producesUnits = !type.produces.empty();
    supplyProvided = type.supply;
    HpMax = type.hpMax;
    Armor = type.armor;
    Cost = type.cost;
    complete = isComplete;
    progress = isComplete ? 1.0f : 0.0f;
    HpValue = isComplete ? HpMax : std::max(1, HpMax / 10);
}

bool Building::AdvanceConstruction(float fraction) {
    if (complete || fraction <= 0.0f) return false;
    progress = std::min(1.0f, progress + fraction);
    if (progress >= 1.0f) {
        complete = true;
        HpValue = HpMax;
        return true;
    }
    // Máu tăng dần từ 10% tới 100% theo tiến độ xây.
    const float hp = static_cast<float>(HpMax) * (0.1f + 0.9f * progress);
    HpValue = std::clamp(static_cast<int>(hp), 1, HpMax);
    return false;
}

void Building::Render(SDL_Renderer* r, float camX, float camY, bool debug) const {
    const SDL_FRect box = { fp.left - camX, fp.top - camY, fp.right - fp.left, fp.bottom - fp.top };
    const SDL_FRect body = { box.x + 3.0f, box.y + 3.0f, box.w - 6.0f, box.h - 6.0f };

    const bool isEnemy = (team == Team::Enemy);
    const Uint8 cr = isEnemy ? 170 : 70;
    const Uint8 cg = isEnemy ? 60 : 110;
    const Uint8 cb = isEnemy ? 60 : 190;

    // Bóng đổ nhẹ phía dưới.
    SDL_FRect shadow = { box.x + 6.0f, box.y + box.h - 6.0f, box.w - 6.0f, 8.0f };
    SDL_SetRenderDrawColor(r, 0, 0, 0, 70);
    SDL_RenderFillRect(r, &shadow);

    if (complete) {
        SDL_SetRenderDrawColor(r, cr, cg, cb, 255);
        SDL_RenderFillRect(r, &body);
        SDL_SetRenderDrawColor(r, static_cast<Uint8>(cr / 2), static_cast<Uint8>(cg / 2), static_cast<Uint8>(cb / 2), 255);
        SDL_RenderRect(r, &body);
        // Kho chứa: dấu hiệu nhỏ ở góc để dễ nhận biết.
        if (dropoff) {
            SDL_FRect mark = { body.x + 6.0f, body.y + 6.0f, 12.0f, 12.0f };
            SDL_SetRenderDrawColor(r, 240, 205, 60, 255);
            SDL_RenderFillRect(r, &mark);
        }
    }
    else {
        // Móng công trình: mờ, kèm thanh tiến độ xây (vàng) ở giữa.
        SDL_SetRenderDrawColor(r, cr, cg, cb, 110);
        SDL_RenderFillRect(r, &body);
        SDL_SetRenderDrawColor(r, 230, 230, 230, 200);
        SDL_RenderRect(r, &body);
        SDL_FRect back = { body.x + 8.0f, body.y + body.h / 2.0f - 5.0f, body.w - 16.0f, 10.0f };
        SDL_FRect fill = { back.x, back.y, back.w * progress, back.h };
        SDL_SetRenderDrawColor(r, 20, 20, 20, 220);
        SDL_RenderFillRect(r, &back);
        SDL_SetRenderDrawColor(r, 240, 205, 60, 255);
        SDL_RenderFillRect(r, &fill);
    }

    // Tên loại (font gỡ lỗi rộng 8px mỗi ký tự).
    SDL_SetRenderDrawColor(r, 255, 255, 255, 255);
    SDL_RenderDebugText(r, box.x + (box.w - static_cast<float>(label.size()) * 8.0f) / 2.0f, box.y + 8.0f, label.c_str());

    // Đang huấn luyện: thanh tiến độ ở đáy công trình.
    if (complete && !queue.empty()) {
        SDL_FRect back = { body.x + 6.0f, body.y + body.h - 14.0f, body.w - 12.0f, 7.0f };
        SDL_SetRenderDrawColor(r, 20, 20, 20, 220);
        SDL_RenderFillRect(r, &back);
        const float ratio = queue.front().Ratio();
        if (ratio > 0.0f) {
            SDL_FRect fill = { back.x, back.y, back.w * std::clamp(ratio, 0.0f, 1.0f), back.h };
            SDL_SetRenderDrawColor(r, 90, 200, 255, 255);
            SDL_RenderFillRect(r, &fill);
        }
    }

    RenderSelectionOutline(r, box);
    RenderHealthBar(r, box);

    if (debug) {
        char text[48];
        std::snprintf(text, sizeof(text), "id %u  q%d", id, static_cast<int>(queue.size()));
        SDL_SetRenderDrawColor(r, 255, 255, 255, 255);
        SDL_RenderDebugText(r, box.x + 4.0f, box.y + box.h + 2.0f, text);
    }
}
