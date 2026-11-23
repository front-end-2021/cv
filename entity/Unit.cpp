#include "Unit.h"
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <utility>

Unit::Unit(float x, float y, float sz) : Entity(x, y, sz) {}

// ---------------------------------------------------------------------------
// Loại đơn vị và lệnh
// ---------------------------------------------------------------------------
void Unit::ApplyType(const UnitType& type, int typeIndex) {
    typeId = typeIndex;
    HpMax = type.hpMax;
    HpValue = type.hpMax;
    Armor = type.armor;
    Shield = type.shield;
    Damage = type.damage;
    Cooldown = type.cooldown;
    Range = type.range;
    MoveSpeed = type.moveSpeed;
    AggroRange = type.aggroRange;
    Vision = type.vision;
}

void Unit::ClearTarget() {
    attackTargetId = kNoEntity;
    autoTarget = false;
    path.clear();
    hasMoveGoal = false;
    unstickCount = 0;
    CancelPathRequest();
}

void Unit::OrderMove(std::vector<Waypoint> newPath) {
    ClearTarget();
    if (!newPath.empty()) {
        hasMoveGoal = true;
        moveGoal = newPath.back();
    }
    path.assign(std::move(newPath));
    ResetProgressMonitor();
    // Lệnh đi bỏ ngang đòn đánh đang diễn ra.
    if (state == UnitState::Attack) EnterState(UnitState::Idle);
}

void Unit::StartMoveOrder(float goalX, float goalY) {
    ClearTarget();
    hasMoveGoal = true;
    moveGoal = { goalX, goalY };
    ResetProgressMonitor();
    if (state == UnitState::Attack) EnterState(UnitState::Idle);
}

void Unit::OrderAttack(EntityId target, bool automatic) {
    attackTargetId = target;
    autoTarget = automatic;
    path.clear();      // đường đi sẽ được xin khi cần (xem UpdateUnit trong game/Simulation.cpp)
    hasMoveGoal = false;
    unstickCount = 0;
    CancelPathRequest();
    repathTimer = 0.0f;
    // Không cắt ngang đòn đang đánh: nếu đang Attack thì cứ đánh nốt.
}

bool Unit::IsGone() const {
    return state == UnitState::Dead && anim.Finished(GetClip(UnitState::Dead));
}

bool Unit::InAttackRange(const Entity& t) const {
    // Xem mỗi đơn vị như một vòng tròn bán kính = nửa cạnh hitbox.
    const float gap = DistanceTo(t) - (squareSize + t.squareSize) * 0.5f;
    return gap <= Range;
}

// ---------------------------------------------------------------------------
// State machine
//
//   Idle  --(có đường đi)-----------------------------> Walk
//   Walk  --(hết đường đi)----------------------------> Idle
//   Idle/Walk --(mục tiêu trong tầm && hết cooldown)--> Attack
//   Attack --(animation chạy xong)--------------------> Idle hoặc Walk
//   bất kỳ --(HP về 0)--------------------------------> Dead (không quay lại)
//
// Attack không bị ngắt giữa chừng (trừ khi có lệnh đi mới: xem OrderMove).
// ---------------------------------------------------------------------------
void Unit::EnterState(UnitState s) {
    state = s;
    anim.Restart();
}

bool Unit::UpdateState(float dt, const Entity* target, bool targetInRange) {
    // 0. Hết máu -> chết. Từ đây không còn lệnh, không còn được chọn, chỉ chạy animation chết.
    if (state != UnitState::Dead && !IsAlive()) {
        path.clear();
        hasMoveGoal = false;
        CancelPathRequest();
        attackTargetId = kNoEntity;
        autoTarget = false;
        lastAttackerId = kNoEntity;
        selected = false;
        EnterState(UnitState::Dead);
    }
    if (state == UnitState::Dead) {
        anim.Update(dt, GetClip(UnitState::Dead));
        return false;
    }

    cooldownLeft = std::max(0.0f, cooldownLeft - dt);

    const bool hasTarget = target && target->IsAlive();

    // 1. Đang đánh mà animation đã xong -> trả về Idle/Walk.
    if (state == UnitState::Attack && anim.Finished(GetClip(UnitState::Attack))) {
        EnterState(path.empty() ? UnitState::Idle : UnitState::Walk);
    }

    // 2. Không đang đánh -> chọn trạng thái theo tình huống.
    if (state != UnitState::Attack) {
        if (hasTarget && targetInRange) {
            // Dù chưa đánh được (còn cooldown) vẫn quay mặt về phía mục tiêu.
            facing = FacingFromVector(target->x - x, target->y - y);
        }

        if (hasTarget && targetInRange && cooldownLeft <= 0.0f) {
            EnterState(UnitState::Attack);
            cooldownLeft = Cooldown;
            hitDone = false;
        }
        else if (!path.empty()) {
            if (state != UnitState::Walk) EnterState(UnitState::Walk);
            const float dx = path.front().x - x;
            const float dy = path.front().y - y;
            if (dx * dx + dy * dy > 0.01f) facing = FacingFromVector(dx, dy);
        }
        else if (state != UnitState::Idle) {
            EnterState(UnitState::Idle); // facing giữ nguyên hướng cuối cùng
        }
    }

    // 3. Chạy animation của trạng thái hiện tại.
    const AnimClip& clip = GetClip(state);
    anim.Update(dt, clip);

    // 4. Khung trúng đòn: báo cho bên ngoài biết để gây sát thương (đúng 1 lần mỗi đòn).
    if (state == UnitState::Attack && !hitDone && clip.hitFrame >= 0 && anim.frame >= clip.hitFrame) {
        hitDone = true;
        return true;
    }
    return false;
}

// ---------------------------------------------------------------------------
// Hình vẽ tạm (chưa có sprite). Khi có sprite sheet, chỉ cần thay thân hàm này:
//   src = { anim.frame * frameW, row(state, facing) * frameH, frameW, frameH }
//   rồi SDL_RenderTexture(r, sheet, &src, &dst)  (neo ở chân nhân vật).
// ---------------------------------------------------------------------------
void Unit::Render(SDL_Renderer* r, float camX, float camY, float alpha, bool debug, const Entity* attackTarget) const {
    if (IsGone()) return; // đã chết xong: không còn gì để vẽ

    const float half = squareSize / 2.0f;
    // Vị trí đã nội suy giữa tick trước và tick hiện tại -> chuyển động mượt dù logic chỉ chạy 30 Hz.
    const float rx = RenderX(alpha);
    const float ry = RenderY(alpha);
    // Hộp gốc, đứng yên: dùng cho bóng, viền chọn, thanh máu.
    const SDL_FRect baseRect = {
            rx - half - camX,
            ry - half - camY,
            squareSize, squareSize };

    // Màu thân theo phe (chỗ DUY NHẤT hai phe khác nhau khi vẽ).
    const bool isEnemy = (team == Team::Enemy);
    const Uint8 teamR = isEnemy ? 205 : 230;
    const Uint8 teamG = isEnemy ? 60 : 200;
    const Uint8 teamB = 60;

    float fx = 0.0f, fy = 1.0f;
    FacingVector(facing, fx, fy);
    const AnimClip& clip = GetClip(state);
    const int frame = anim.frame;

    // ---- Đang chết: thân xẹp xuống và mờ dần theo từng khung hình ----
    if (state == UnitState::Dead) {
        const float t = static_cast<float>(frame) / static_cast<float>(clip.frameCount); // 0..0.75
        SDL_FRect corpse = baseRect;
        corpse.h = baseRect.h * (1.0f - 0.7f * t);
        corpse.y = baseRect.y + baseRect.h - corpse.h;      // neo ở chân
        corpse.w = baseRect.w * (1.0f + 0.3f * t);
        corpse.x = baseRect.x - (corpse.w - baseRect.w) / 2.0f;
        SDL_SetRenderDrawColor(r, teamR, teamG, teamB, static_cast<Uint8>(255.0f * (1.0f - t)));
        SDL_RenderFillRect(r, &corpse);
        return;
    }

    // Bóng dưới chân (không nhún theo thân nên dễ thấy chuyển động).
    SDL_FRect shadow = { baseRect.x + 4.0f, baseRect.y + baseRect.h - 6.0f, baseRect.w - 8.0f, 8.0f };
    SDL_SetRenderDrawColor(r, 0, 0, 0, 80);
    SDL_RenderFillRect(r, &shadow);

    // ---- Thân: mỗi trạng thái một kiểu chuyển động ----
    SDL_FRect body = baseRect;
    switch (state) {
        case UnitState::Idle: {
            // "Thở": thân cao lên 0-2px, chân giữ nguyên.
            static const float kBreath[4] = { 0.0f, 1.0f, 2.0f, 1.0f };
            const float b = kBreath[frame % 4];
            body.y -= b;
            body.h += b;
            break;
        }
        case UnitState::Walk: {
            // Nhún theo bước chân: 2 bước mỗi vòng lặp.
            const float t = (static_cast<float>(frame) + 0.5f) / static_cast<float>(clip.frameCount);
            body.y -= 5.0f * std::abs(std::sin(t * 6.2831853f));
            break;
        }
        case UnitState::Attack: {
            // Lùi lại lấy đà -> lao tới ở khung trúng đòn -> thu về.
            static const float kLunge[5] = { -3.0f, -5.0f, 0.0f, 10.0f, 4.0f };
            const float l = kLunge[std::clamp(frame, 0, 4)];
            body.x += fx * l;
            body.y += fy * l;
            break;
        }
        default: break;
    }

    // ---- Màu thân ----
    if (hurtTimer > 0.0f) {
        SDL_SetRenderDrawColor(r, 255, 255, 255, 255); // vừa trúng đòn: nháy trắng
    }
    else if (state == UnitState::Attack && frame == clip.hitFrame) {
        SDL_SetRenderDrawColor(r, 255, 250, 210, 255); // nháy sáng đúng khung trúng đòn
    }
    else {
        SDL_SetRenderDrawColor(r, teamR, teamG, teamB, 255);
    }
    SDL_RenderFillRect(r, &body);

    // ---- "Mắt" chỉ hướng nhìn ----
    const float cx = body.x + body.w / 2.0f;
    const float cy = body.y + body.h / 2.0f;
    SDL_FRect eye = {
            cx + fx * (half - 8.0f) - 5.0f,
            cy + fy * (half - 8.0f) - 5.0f,
            10.0f, 10.0f };
    SDL_SetRenderDrawColor(r, 40, 40, 40, 255);
    SDL_RenderFillRect(r, &eye);

    // ---- Vệt chém (từ khung 2 của Attack) ----
    if (state == UnitState::Attack && frame >= 2) {
        static const float kSlashLen[5] = { 0.0f, 0.0f, 14.0f, 26.0f, 18.0f };
        const float len = kSlashLen[std::clamp(frame, 0, 4)];
        const float px = -fy, py = fx; // vuông góc với hướng nhìn
        const float sx = cx + fx * (half + 2.0f);
        const float sy = cy + fy * (half + 2.0f);
        if (frame == clip.hitFrame) SDL_SetRenderDrawColor(r, 255, 255, 255, 255);
        else                        SDL_SetRenderDrawColor(r, 255, 180, 60, 230);
        for (int k = -1; k <= 1; ++k) {
            const float ox = px * static_cast<float>(k) * 1.5f;
            const float oy = py * static_cast<float>(k) * 1.5f;
            SDL_RenderLine(r, sx + ox, sy + oy, sx + fx * len + ox, sy + fy * len + oy);
        }
    }

    RenderSelectionOutline(r, baseRect);
    RenderHealthBar(r, baseRect);

    if (debug) {
        static const char* const kNames[] = { "Idle", "Walk", "Attack", "Dead" };
        char label[32];
        std::snprintf(label, sizeof(label), "%s %d", kNames[static_cast<int>(state)], frame);
        SDL_SetRenderDrawColor(r, 255, 255, 255, 255);
        SDL_RenderDebugText(r, baseRect.x, baseRect.y - 24.0f, label);

        if (attackTarget && attackTarget->IsAlive()) {
            SDL_SetRenderDrawColor(r, 255, 80, 80, 160);
            SDL_RenderLine(r, baseRect.x + half, baseRect.y + half,
                attackTarget->RenderX(alpha) - camX, attackTarget->RenderY(alpha) - camY);
        }
    }
}
