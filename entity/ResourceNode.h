#pragma once
#include <SDL3/SDL.h>
#include "../Common.h"
#include "Entity.h"
#include "Footprint.h"

// Mỏ tài nguyên (vàng) trên bản đồ. Chiếm kMineTiles x kMineTiles ô và chặn đường đi như công trình,
// nên thợ không đứng lên mỏ mà đứng cạnh nó để đào. Cạn thì biến mất (game/World.cpp: RemoveDepletedResources).
// Không thuộc phe nào (trường `team` của Entity bị bỏ qua).
class ResourceNode : public Entity {
public:
    Footprint fp;
    int amount = 0;      // còn lại
    int maxAmount = 0;   // lúc đầu

    ResourceNode(int row, int col, int initialAmount, float tileSize);

    bool Depleted() const { return amount <= 0; }

    void Render(SDL_Renderer* r, float camX, float camY, bool debug) const;
};
