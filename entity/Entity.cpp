#include "Entity.h"
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>

Entity::Entity(float x, float y, float sz) : x(x), y(y), prevX(x), prevY(y), squareSize(sz) {}

void Entity::RenderSelectionOutline(SDL_Renderer* r, const SDL_FRect& rect) const {
    if (!selected) return;
    SDL_FRect outline = { rect.x - 3.0f, rect.y - 3.0f, rect.w + 6.0f, rect.h + 6.0f };
    SDL_SetRenderDrawColor(r, 50, 255, 80, 255);
    SDL_RenderRect(r, &outline);
}

void Entity::RenderHealthBar(SDL_Renderer* r, const SDL_FRect& rect) const {
    if (HpMax <= 0 || (HpValue >= HpMax && !selected)) return;
    const float ratio = std::clamp(static_cast<float>(HpValue) / static_cast<float>(HpMax), 0.0f, 1.0f);
    SDL_FRect back = { rect.x, rect.y - 12.0f, rect.w, 5.0f };
    SDL_FRect fill = { rect.x, rect.y - 12.0f, rect.w * ratio, 5.0f };
    SDL_SetRenderDrawColor(r, 20, 20, 20, 220);
    SDL_RenderFillRect(r, &back);
    // Xanh khi khỏe, vàng khi nửa máu, đỏ khi sắp chết.
    if (ratio > 0.5f)       SDL_SetRenderDrawColor(r, 70, 210, 80, 255);
    else if (ratio > 0.25f) SDL_SetRenderDrawColor(r, 230, 200, 60, 255);
    else                    SDL_SetRenderDrawColor(r, 230, 60, 60, 255);
    SDL_RenderFillRect(r, &fill);
}

void Entity::TakeDamage(int amount, EntityId attacker) {
    if (amount <= 0 || !IsAlive()) return;
    int remaining = amount;
    if (Shield > 0) {
        const int absorbed = std::min(Shield, remaining);
        Shield -= absorbed;
        remaining -= absorbed;
    }
    if (remaining > 0) {
        HpValue = std::max(0, HpValue - std::max(1, remaining - Armor));
    }
    hurtTimer = 0.12f;
    if (attacker != kNoEntity && attacker != id) { // ghi nhớ kẻ đánh mình để còn đánh trả
        lastAttackerId = attacker;
        grudgeTimer = kGrudgeTime;
    }
}

float Entity::DistanceTo(const Entity& other) const { return std::hypot(other.x - x, other.y - y);}
