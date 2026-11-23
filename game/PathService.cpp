#include "game/PathService.h"
#include <algorithm>
#include <cmath>
#include "Pathfinder.h"
#include "game/Ai.h"

namespace {
    // Áp dụng kết quả tìm đường cho lính. Yêu cầu đã được kiểm tra còn hiệu lực.
    void ApplyPathResult(GameState& g, Unit& u, const PathRequest& req, PathResult& res) {
        u.pathPending = false;

        // Bỏ các mốc trùng chỗ đang đứng để lính không bị nháy sang Walk 1 tick rồi quay lại Idle.
        std::vector<Waypoint>& pts = res.points;
        std::size_t skip = 0;
        while (skip < pts.size() && std::hypot(pts[skip].x - u.x, pts[skip].y - u.y) < 1.0f) ++skip;
        pts.erase(pts.begin(), pts.begin() + static_cast<std::ptrdiff_t>(skip));

        switch (req.purpose) {
        case PathPurpose::Move:
        case PathPurpose::Unstick:
            if (!u.hasMoveGoal) return; // lệnh đi đã bị hủy trong lúc chờ (đáng lẽ đã lỗi thời; giữ cho chắc)
            if (pts.empty()) {
                // Không có đường, hoặc chỗ đang đứng đã là điểm gần đích nhất: coi như đã tới nơi.
                u.path.clear();
                u.hasMoveGoal = false;
            }
            else {
                u.path.assign(std::move(pts));
                u.ResetProgressMonitor();
            }
            break;

        case PathPurpose::Chase: {
            const Unit* target = g.FindUnit(u.attackTargetId);
            if (!u.HasTarget() || !target || !target->IsAlive()) return;
            if (u.InAttackRange(*target)) return; // đã tới tầm đánh trong lúc chờ: không cần đi nữa
            if (pts.empty()) {
                // Không có đường tới (hoặc không thể lại gần hơn) -> bỏ lệnh, và nhớ là kẻ này không với tới được
                // để bộ tự chọn mục tiêu không chọn lại ngay rồi xin đường vô ích mỗi 0,25 giây.
                u.unreachableTargetId = u.attackTargetId;
                u.unreachableTimer = kUnreachableMemory;
                u.ClearTarget();
            }
            else {
                u.path.assign(std::move(pts));
                u.ResetProgressMonitor();
            }
            break;
        }
        }
    }
}

void RequestPath(GameState& g, Unit& u, float goalX, float goalY, PathPurpose purpose) {
    ++u.pathTicket; // yêu cầu cũ (nếu còn trong hàng đợi) trở thành lỗi thời
    u.pathPending = true;
    g.pathQueue.push_back({ u.id, goalX, goalY, u.pathTicket, purpose });
}

void OrderMoveTo(GameState& g, Unit& u, float goalX, float goalY) {
    u.StartMoveOrder(goalX, goalY);
    RequestPath(g, u, goalX, goalY, PathPurpose::Move);
}

void ProcessPathRequests(GameState& g) {
    int served = 0;
    int nodes = 0;
    while (!g.pathQueue.empty()) {
        // Hết ngân sách thì để tick sau; nhưng luôn phục vụ được ít nhất 1 yêu cầu mỗi tick để hàng đợi không bao giờ đứng yên.
        if (served > 0 && (served >= kMaxPathRequestsPerTick || nodes >= kPathNodeBudgetPerTick)) break;

        const PathRequest req = g.pathQueue.front();
        g.pathQueue.pop_front();

        Unit* u = g.FindUnit(req.unit);
        if (!u || !u->IsAlive() || !u->pathPending || u->pathTicket != req.ticket) continue; // lỗi thời: bỏ, không tốn ngân sách

        // Đường được tính từ chỗ lính đứng LÚC NÀY, không phải lúc xếp hàng.
        PathResult res = Pathfinder::Find(g.map, u->x, u->y, req.goalX, req.goalY);
        nodes += std::max(1, res.expanded);
        ++served;
        ApplyPathResult(g, *u, req, res);
    }
}
