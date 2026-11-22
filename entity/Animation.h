#pragma once
#include <algorithm>
#include <cmath>

// ---------------------------------------------------------------------------
// Trạng thái logic của đơn vị. Đây là LOGIC GAME, không phải hình ảnh:
// animation chỉ "đọc" trạng thái này để biết cần phát clip nào.
// Muốn thêm Gather / Build sau này: thêm enum + một dòng trong kClips.
// ---------------------------------------------------------------------------
enum class UnitState { Idle, Walk, Attack, Dead, Count };

// 4 hướng nhìn. Khi có sprite thật: Left/Right có thể dùng chung 1 hàng sprite
// rồi lật ngang bằng SDL_RenderTextureRotated + SDL_FLIP_HORIZONTAL.
enum class Facing { Down, Left, Right, Up };

// Mô tả một đoạn animation (với sprite sheet thật: thêm trường `row`).
struct AnimClip {
    int   frameCount; // số khung hình
    float fps;        // số khung hình mỗi giây
    bool  loop;       // true: lặp mãi (Idle/Walk); false: chạy 1 lần (Attack)
    int   hitFrame;   // khung hình gây sát thương (-1 nếu clip không có)
};

// Bảng clip dùng chung cho mọi unit. Sau này chuyển sang theo từng UnitType.
inline const AnimClip& GetClip(UnitState s) {
    static const AnimClip kClips[static_cast<int>(UnitState::Count)] = {
        /* Idle   */ { 4,  4.0f, true,  -1 },
        /* Walk   */ { 6, 10.0f, true,  -1 },
        /* Attack */ { 5, 10.0f, false,  3 }, // 0.5 giây, trúng đòn ở khung 3
        /* Dead   */ { 4,  6.0f, false, -1 }, // ~0.67 giây rồi biến mất, không quay lại trạng thái khác
    };
    return kClips[static_cast<int>(s)];
}

// Bộ phát animation: chỉ giữ thời gian và khung hình hiện tại.
struct Animator {
    float time  = 0.0f;
    int   frame = 0;

    void Restart() { time = 0.0f; frame = 0; }

    void Update(float dt, const AnimClip& clip) {
        time += dt;
        const int f = static_cast<int>(time * clip.fps);
        frame = clip.loop ? f % clip.frameCount : std::min(f, clip.frameCount - 1);
    }

    // Chỉ có nghĩa với clip không lặp.
    bool Finished(const AnimClip& clip) const {
        return !clip.loop && time * clip.fps >= static_cast<float>(clip.frameCount);
    }
};

// Chọn hướng nhìn từ một vector (trục nào dài hơn thì thắng).
inline Facing FacingFromVector(float dx, float dy) {
    if (std::abs(dx) > std::abs(dy)) return dx < 0.0f ? Facing::Left : Facing::Right;
    return dy < 0.0f ? Facing::Up : Facing::Down;
}

// Vector đơn vị tương ứng với hướng nhìn (hệ toạ độ màn hình: y hướng xuống).
inline void FacingVector(Facing f, float& fx, float& fy) {
    switch (f) {
    case Facing::Left:  fx = -1.0f; fy =  0.0f; break;
    case Facing::Right: fx =  1.0f; fy =  0.0f; break;
    case Facing::Up:    fx =  0.0f; fy = -1.0f; break;
    case Facing::Down:
    default:            fx =  0.0f; fy =  1.0f; break;
    }
}
