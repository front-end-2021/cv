#include "game/Movement.h"
#include <algorithm>
#include <cmath>
#include "Pathfinder.h"
#include "game/PathService.h"

namespace {
    // ---- Phát hiện kẹt ----
    constexpr float kStuckWindow = 0.5f;          // giây: cửa sổ đo tiến độ
    constexpr float kStuckProgressRatio = 0.3f;   // nhích được >= 30% quãng đường đáng lẽ đi thì coi là đang tiến
    constexpr float kHardStuckDist = 4.0f;        // nhích dưới mức này (px) trong cả cửa sổ = đứng yên hoàn toàn
    constexpr int kHardStuckWindowsToAct = 3;     // đứng yên ngần cửa sổ liên tiếp (1,5 giây) thì ra tay
    constexpr int kNearGoalPoorWindows = 2;       // gần đích mà tiến độ kém ngần cửa sổ liên tiếp (1 giây) = coi như đã tới
    constexpr int kPoorWindowsToAct = 6;          // tiến độ kém (dù vẫn nhích) ngần cửa sổ liên tiếp (3 giây) thì ra tay
    constexpr float kArriveSlack = 2.0f * kSquareSize; // kẹt trong bán kính này quanh đích thì coi như đã tới
    constexpr int kMaxUnstick = 2;                // số lần tính lại đường vì kẹt trước khi bỏ lệnh
    constexpr int kBlockedTicksToRepath = 4;      // bị tường chặn ngần tick liên tiếp (~0,13 giây) thì tính lại đường
    // Qua mốc TRUNG GIAN khi cách nó dưới ngần này và nhìn thấy mốc kế tiếp. Nhiều lính dồn về cùng một mốc
    // (góc tường, khe hẹp) không thể cùng đứng đúng điểm đó: bắt buộc chạm đúng sẽ khiến họ xoay vòng quanh mốc.
    constexpr float kWaypointReach = kSquareSize;

    // ---- Va chạm ----
    constexpr int kCollisionIterations = 2;       // số lượt quét mỗi tick (hàng xóm đẩy nhau lan dần)
    constexpr float kOverlapSlop = 0.5f;          // chồng lấn nhỏ hơn mức này (px) bỏ qua, tránh rung
    constexpr float kHeadOnDot = -0.3f;           // hai hướng đi có tích vô hướng thấp hơn mức này = đối đầu
    constexpr float kApproachDot = 0.3f;          // đang tiến về phía bên kia nếu hướng đi chiếu lên đường nối >= mức này
    constexpr float kSidestepFactor = 0.35f;      // né sang phải = 35% phần chồng lấn mỗi lượt
    constexpr float kSameTargetDist = 1.5f * kSquareSize; // hai lính nhắm hai mốc gần nhau hơn mức này = đi cùng chỗ, không né nhau
    constexpr float kYieldShare = 0.8f;           // đối đầu: bên không được ưu tiên gánh 80% phần chồng lấn

    enum class StepResult { Full, Partial, None };

    // Đưa lính tới (nx, ny). Đứng được ở đó thì đi thẳng; không thì trượt dọc tường theo từng trục.
    StepResult StepTo(const TileMap& map, Unit& u, float nx, float ny) {
        // Đang bị kẹt TRONG tường (ví dụ chỗ xuất phát quá chật) thì cho đi tự do để thoát ra.
        if (!map.CanBoxStandAt(u.x, u.y, kSquareSize)) { u.x = nx; u.y = ny; return StepResult::Full; }
        if (map.CanBoxStandAt(nx, ny, kSquareSize)) { u.x = nx; u.y = ny; return StepResult::Full; }
        bool moved = false;
        if (nx != u.x && map.CanBoxStandAt(nx, u.y, kSquareSize)) { u.x = nx; moved = true; }
        if (ny != u.y && map.CanBoxStandAt(u.x, ny, kSquareSize)) { u.y = ny; moved = true; }
        return moved ? StepResult::Partial : StepResult::None;
    }

    // Hướng đang đi (vector đơn vị tới mốc kế tiếp). false nếu không đi hoặc đang ở đúng mốc.
    bool Heading(const Unit& u, float& hx, float& hy) {
        if (u.path.empty()) return false;
        const float dx = u.path.front().x - u.x;
        const float dy = u.path.front().y - u.y;
        const float len = std::sqrt(dx * dx + dy * dy);
        if (len < 0.001f) return false;
        hx = dx / len;
        hy = dy / len;
        return true;
    }

    // Tính lại đường tới đích của lệnh đi; thử nhiều lần vẫn kẹt thì bỏ lệnh.
    void RepathOrGiveUp(GameState& g, Unit& u) {
        if (u.pathPending) return; // đang chờ đường mới, đừng xin chồng lên
        if (u.unstickCount >= kMaxUnstick) {
            u.path.clear();
            u.hasMoveGoal = false;
            u.unstickCount = 0;
            return;
        }
        ++u.unstickCount;
        RequestPath(g, u, u.moveGoal.x, u.moveGoal.y, PathPurpose::Unstick);
    }

    // Đã bị chặn (tường) hoặc đứng yên quá lâu dù còn đường đi.
    void HandleStuck(GameState& g, Unit& u, bool nearGoalCountsAsArrived) {
        if (u.hasMoveGoal) {
            const float toGoal = std::hypot(u.moveGoal.x - u.x, u.moveGoal.y - u.y);
            if (nearGoalCountsAsArrived && toGoal <= kArriveSlack) {
                u.path.clear();
                u.hasMoveGoal = false;
                u.unstickCount = 0;
                u.CancelPathRequest();
                return;
            }
            RepathOrGiveUp(g, u);
        }
        else {
            // Đang đuổi theo mục tiêu: bỏ đường cũ, UpdateUnit sẽ xin đường mới ngay lượt tới.
            u.path.clear();
            u.repathTimer = 0.0f;
        }
    }

    // Đo tiến độ mỗi cửa sổ kStuckWindow giây. Ba mức:
    //  - tiến bình thường (>= 30% quãng đường đáng lẽ đi): xóa mọi bộ đếm;
    //  - kém (dưới 30%) kéo dài: gần đích thì coi như đã tới (cả đám chen chúc quanh đích); xa đích thì tính lại đường;
    //  - gần như đứng yên (dưới kHardStuckDist): ra tay sớm hơn.
    void MonitorProgress(GameState& g, Unit& u, float dt) {
        if (u.path.empty() || u.state == UnitState::Attack) {
            u.ResetProgressMonitor();
            return;
        }
        u.stuckTimer += dt;
        if (u.stuckTimer < kStuckWindow) return;

        const float moved = std::hypot(u.x - u.stuckRefX, u.y - u.stuckRefY);
        const float expected = u.MoveSpeed * u.stuckTimer;
        u.stuckTimer = 0.0f;
        u.stuckRefX = u.x;
        u.stuckRefY = u.y;

        if (moved >= expected * kStuckProgressRatio) { // đang tiến bình thường
            u.hardStuckWindows = 0;
            u.poorWindows = 0;
            u.unstickCount = 0;
            return;
        }
        ++u.poorWindows;
        u.hardStuckWindows = (moved < kHardStuckDist) ? u.hardStuckWindows + 1 : 0;

        // Gần đích (còn <= 2 mốc) mà vẫn chen chúc không tiến nổi: dừng ở đây, nhường chỗ cho lính khác.
        if (u.hasMoveGoal && u.path.size() <= 2 && u.poorWindows >= kNearGoalPoorWindows &&
            std::hypot(u.moveGoal.x - u.x, u.moveGoal.y - u.y) <= kArriveSlack) {
            HandleStuck(g, u, true);
            return;
        }
        if (u.hardStuckWindows >= kHardStuckWindowsToAct || u.poorWindows >= kPoorWindowsToAct) {
            u.hardStuckWindows = 0;
            u.poorWindows = 0;
            HandleStuck(g, u, true);
        }
    }
}

void MoveUnitAlongPath(GameState& g, Unit& u, float dt) {
    if (u.state == UnitState::Dead) return;

    if (u.state != UnitState::Attack && !u.path.empty()) {
        float budget = u.MoveSpeed * dt;
        bool refused = false; // bị tường chặn hẳn, không nhích nổi
        // Có thể đi qua vài mốc trong một tick (mốc đã làm mượt thường thưa): phần bước dư không bị bỏ phí.
        for (int guard = 0; guard < 8 && budget > 0.0f && !u.path.empty(); ++guard) {
            const Waypoint wp = u.path.front();
            const float dx = wp.x - u.x;
            const float dy = wp.y - u.y;
            const float dist = std::sqrt(dx * dx + dy * dy);
            // Mốc trung gian: đủ gần và đã nhìn thấy mốc kế tiếp thì bỏ qua luôn, không cần chạm đúng điểm.
            // (Kiểm tra tầm nhìn ngay tại chỗ nên đi tắt vẫn không cắt vào tường.)
            if (u.path.size() > 1 && dist > budget && dist <= kWaypointReach) {
                const Waypoint& next = *(u.path.begin() + 1);
                if (Pathfinder::HasLineOfSight(g.map, u.x, u.y, next.x, next.y)) {
                    u.path.pop_front();
                    continue;
                }
            }
            if (dist <= budget) {
                const StepResult r = StepTo(g.map, u, wp.x, wp.y);
                if (r == StepResult::Full) {
                    budget -= dist;
                    u.path.pop_front(); // tới mốc -> sang mốc kế tiếp
                    continue;
                }
                refused = (r == StepResult::None);
            }
            else {
                const float k = budget / dist;
                refused = (StepTo(g.map, u, u.x + dx * k, u.y + dy * k) == StepResult::None);
            }
            break;
        }

        u.blockedTicks = refused ? u.blockedTicks + 1 : 0;
        if (u.blockedTicks >= kBlockedTicksToRepath) {
            u.blockedTicks = 0;
            HandleStuck(g, u, false);
        }
    }
    else {
        u.blockedTicks = 0;
    }

    MonitorProgress(g, u, dt);

    // Hết đường đi, không còn chờ đường mới: lệnh đi đã hoàn thành.
    if (u.hasMoveGoal && u.path.empty() && !u.pathPending && !u.HasTarget()) {
        u.hasMoveGoal = false;
        u.unstickCount = 0;
    }
}

void ResolveUnitCollisions(GameState& g) {
    const float minDist = kSquareSize;
    const std::size_t count = g.units.size();

    for (int iter = 0; iter < kCollisionIterations; ++iter) {
        bool touched = false;
        for (std::size_t i = 0; i < count; ++i) {
            Unit& a = g.units[i];
            if (!a.IsAlive()) continue; // xác không va chạm
            for (std::size_t j = i + 1; j < count; ++j) {
                Unit& b = g.units[j];
                if (!b.IsAlive()) continue;

                float dx = b.x - a.x;
                float dy = b.y - a.y;
                if (std::abs(dx) >= minDist || std::abs(dy) >= minDist) continue; // xa nhau, khỏi tính căn
                const float distSq = dx * dx + dy * dy;
                if (distSq >= minDist * minDist) continue;

                float dist = std::sqrt(distSq);
                const float overlap = minDist - dist;
                if (overlap < kOverlapSlop) continue;
                if (dist < 0.001f) { dx = 1.0f; dy = 0.0f; dist = 1.0f; } // trùng tâm: tách theo trục x
                const float nx = dx / dist; // hướng từ a sang b
                const float ny = dy / dist;
                touched = true;

                const bool aMoving = !a.path.empty();
                const bool bMoving = !b.path.empty();
                float ahx = 0.0f, ahy = 0.0f, bhx = 0.0f, bhy = 0.0f;
                const bool aHeads = aMoving && Heading(a, ahx, ahy);
                const bool bHeads = bMoving && Heading(b, bhx, bhy);

                // Phần chồng lấn mỗi bên phải gánh (wa + wb = 1).
                float wa = 0.5f, wb = 0.5f;
                if (aMoving != bMoving) {
                    // Lính đứng yên nhường hoàn toàn cho lính đang đi.
                    wa = aMoving ? 0.0f : 1.0f;
                    wb = 1.0f - wa;
                }
                else if (aHeads && bHeads && ahx * bhx + ahy * bhy < kHeadOnDot) {
                    // Đối đầu: bên id nhỏ được ưu tiên đi tiếp, bên kia bị đẩy lùi (không để cả hai kẹt cứng trong lối hẹp).
                    wa = (a.id < b.id) ? 1.0f - kYieldShare : kYieldShare;
                    wb = 1.0f - wa;
                }

                if (wa > 0.0f) StepTo(g.map, a, a.x - nx * overlap * wa, a.y - ny * overlap * wa);
                if (wb > 0.0f) StepTo(g.map, b, b.x + nx * overlap * wb, b.y + ny * overlap * wb);

                // Cả hai đang đi, và hai đường thật sự cắt nhau (không phải cùng dồn về một mốc): bên nào đang tiến
                // về phía bên kia thì né sang phải của mình ("phải" trên màn hình, y hướng xuống, của hướng (hx, hy) là (-hy, hx)).
                const bool sameTarget = aHeads && bHeads &&
                    std::hypot(a.path.front().x - b.path.front().x, a.path.front().y - b.path.front().y) < kSameTargetDist;
                if (aMoving && bMoving && !sameTarget) {
                    const float side = overlap * kSidestepFactor;
                    if (aHeads && ahx * nx + ahy * ny > kApproachDot) {
                        StepTo(g.map, a, a.x - ahy * side, a.y + ahx * side);
                    }
                    if (bHeads && -(bhx * nx + bhy * ny) > kApproachDot) {
                        StepTo(g.map, b, b.x - bhy * side, b.y + bhx * side);
                    }
                }
            }
        }
        if (!touched) break;
    }
}
