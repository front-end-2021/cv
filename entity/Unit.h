#pragma once
#include <cstdint>
#include <vector>
#include "../Path.h"
#include "Entity.h"
#include "Animation.h"
#include "UnitType.h"

// Việc thợ đang làm (xem game/Work.cpp). Lệnh của người chơi (đi, đánh) xóa việc này; lệnh đi do chính việc
// này phát ra (đi tới mỏ, kho, công trình) thì không.
enum class JobKind : std::uint8_t {
    None,    // rảnh
    Gather,  // đào mỏ rồi mang về kho, lặp mãi tới khi hết mỏ quanh đó
    Build    // đi tới công trình đang xây dở rồi xây
};

// Chế độ chiến đấu do người chơi đặt bằng các lệnh H / A + click (xem game/Orders.h). Chỉ ảnh hưởng cách lính tự chọn
// mục tiêu và có đuổi theo hay không (xem AutoAcquireTarget trong game/Ai.cpp). Mọi lệnh đi hoặc đánh MỚI của người chơi,
// và lệnh Stop, đưa lính về Normal.
enum class CombatMode : std::uint8_t {
    Normal,      // mặc định: theo lệnh đi; đứng yên thì tự vệ trong tầm phát hiện (AggroRange)
    Hold,        // giữ vị trí: không bao giờ rời chỗ để đuổi theo ai, chỉ đánh kẻ lọt vào tầm đánh (Range)
    AttackMove   // đi tới attackMoveGoal; gặp kẻ địch trong tầm phát hiện thì dừng lại đánh, xong thì đi tiếp
};

struct WorkJob {
    JobKind kind = JobKind::None;
    EntityId target = kNoEntity;   // Gather: mỏ đang đào; Build: công trình đang xây
    EntityId depot = kNoEntity;    // Gather: kho đang đi tới để nộp hàng
    bool returning = false;        // Gather: đang mang hàng về kho (false: đang đi đào / đang đào)
    bool moveIssued = false;       // đã ra lệnh đi tới chỗ làm việc mà chưa thấy tới nơi
    int failures = 0;              // số lần đi mà không tới được chỗ làm việc; đủ kJobMaxFailures thì bỏ việc
    float retryTimer = 0.0f;       // giây phải chờ trước khi thử đi lại
};

// Một Unit dùng cho CẢ HAI PHE. Kẻ địch chính là Unit có team = Team::Enemy:
// dùng chung state machine, lệnh, di chuyển, đuổi theo, đánh, animation và cách vẽ.
// Điểm khác nhau là loại đơn vị (UnitType), màu vẽ và việc ai ra lệnh (người chơi hay AI: xem game/Ai.cpp).
class Unit : public Entity {
public:
	Path path;                   // Các điểm mốc còn phải đi (A* đã làm mượt); lấy mốc ở đầu ra là O(1)

	// ---- Lệnh đi (khác với đuổi theo mục tiêu: xem attackTargetId) ----
	bool hasMoveGoal = false;    // true từ lúc nhận lệnh đi tới lúc tới nơi / bỏ cuộc / bị đổi lệnh
	Waypoint moveGoal{ 0.0f, 0.0f }; // đích CUỐI CÙNG của lệnh đi; dùng để tính lại đường khi bị chặn

	// ---- Yêu cầu tìm đường đang chờ (xem game/PathService.h) ----
	bool pathPending = false;    // đã xếp yêu cầu, chưa có kết quả
	std::uint32_t pathTicket = 0;// số hiệu yêu cầu còn hiệu lực; kết quả mang số khác là của lệnh cũ và bị bỏ

	// ---- Mục tiêu đã biết là không với tới (xem game/PathService.cpp, game/Ai.cpp) ----
	EntityId unreachableTargetId = kNoEntity; // bộ tự chọn mục tiêu bỏ qua kẻ này, tránh xin đường vô ích liên tục
	float unreachableTimer = 0.0f;            // giây còn lại của khoảng "bỏ qua" đó

	// ---- Phát hiện kẹt (xem game/Movement.cpp) ----
	float stuckTimer = 0.0f;     // thời gian đã trôi trong cửa sổ theo dõi hiện tại
	float stuckRefX = 0.0f;      // vị trí đầu cửa sổ: so với chỗ đang đứng để biết lính có nhích được không
	float stuckRefY = 0.0f;
	int hardStuckWindows = 0;    // số cửa sổ liên tiếp gần như không nhích
	int poorWindows = 0;         // số cửa sổ liên tiếp tiến độ kém (nhích dưới 30% quãng đường đáng lẽ đi)
	int unstickCount = 0;        // số lần đã tính lại đường vì kẹt mà vẫn chưa thoát
	int blockedTicks = 0;        // số tick liên tiếp bị TƯỜNG chặn không bước được

	int typeId = -1;             // chỉ số trong UnitTypeTable (-1 = chưa gán)

	// ---- Thợ (xem game/Work.h). Chỉ đơn vị có BuildSpeed > 0 mới làm việc được ----
	WorkJob job;                 // việc đang làm
	int carrying = 0;            // tài nguyên đang mang
	int carryCapacity = 10;      // mang tối đa bao nhiêu mỗi chuyến
	float gatherAccum = 0.0f;    // phần lẻ tài nguyên đã đào được nhưng chưa đủ 1 đơn vị

	// ---- State machine Idle / Walk / Attack / Dead ----
	UnitState state = UnitState::Idle;
	Facing facing = Facing::Down;
	Animator anim;

	// ---- Lệnh tấn công (tham chiếu bằng ID, không dùng con trỏ) ----
	EntityId attackTargetId = kNoEntity; // kNoEntity = không có lệnh
	bool autoTarget = false;     // true: do AI / tự vệ chọn (có thể bỏ cuộc); false: người chơi ra lệnh
	float cooldownLeft = 0.0f;   // Thời gian còn lại trước khi được đánh tiếp
	float repathTimer = 0.0f;    // Giãn cách giữa hai lần tính lại đường khi đuổi mục tiêu
	float chaseGoalX = 0.0f;     // Vị trí mục tiêu lúc tính đường gần nhất (để biết nó có chạy đi không)
	float chaseGoalY = 0.0f;
	bool hitDone = false;        // Đòn đánh hiện tại đã gây sát thương chưa

	// ---- Chế độ chiến đấu (xem CombatMode; logic ở game/Ai.cpp) ----
	CombatMode combatMode = CombatMode::Normal;
	Waypoint attackMoveGoal{ 0.0f, 0.0f }; // AttackMove: đích cuối của lệnh; vẫn nhớ khi đang bận đánh giữa đường
	bool attackMoveEngaged = false;        // AttackMove: đang đuổi/đánh một mục tiêu tự chọn; xong thì đi tiếp tới attackMoveGoal

	// ---- Dành cho AI ----
	float scanTimer = 0.0f;      // Giãn cách giữa hai lần quét tìm kẻ địch
	bool hasHome = false;        // Có chỗ để quay về khi hết việc không
	Waypoint home{ 0.0f, 0.0f };

	Unit(float x, float y, float sz);

	// Nạp chỉ số của một loại đơn vị (HP đầy).
	void ApplyType(const UnitType& type, int typeIndex);

	// Lệnh. Luôn đi qua các hàm này để trạng thái và lệnh không bị lệch nhau.
	void OrderMove(std::vector<Waypoint> newPath);             // đi theo đường ĐÃ CÓ; hủy lệnh tấn công
	void StartMoveOrder(float goalX, float goalY);             // đi tới nơi, đường chưa có: dùng OrderMoveTo (game/PathService.h)
	void OrderAttack(EntityId target, bool automatic = false); // đuổi theo rồi đánh mục tiêu
	void ClearTarget();                                        // bỏ lệnh tấn công / lệnh đi và dừng lại
	// Stop (phím S): bỏ mọi lệnh đi / đánh / việc đang làm, về chế độ Normal và đứng lại; cắt ngang cả đòn đang ra.
	void OrderStop();
	// Hold position (phím H): như Stop nhưng vào chế độ Hold. Mục tiêu đang đánh (nếu có) được giữ lại tới khi nó ra
	// khỏi tầm đánh (AutoAcquireTarget sẽ bỏ nó, không đuổi theo).
	void OrderHold();
	// Vào chế độ AttackMove với đích (goalX, goalY). KHÔNG tự ra lệnh đi: gọi SAU OrderMoveTo / OrderMove
	// (xem OrderAttackMoveTo trong game/PathService.h).
	void EnterAttackMove(float goalX, float goalY);
	bool IsHolding() const { return combatMode == CombatMode::Hold; }
	bool IsAttackMoving() const { return combatMode == CombatMode::AttackMove; }
	// Về chế độ Normal (bỏ luôn việc "đang đánh giữa đường" của AttackMove).
	void ResetCombatMode() { combatMode = CombatMode::Normal; attackMoveEngaged = false; }
	// Bỏ yêu cầu tìm đường đang chờ (nếu có): kết quả của nó, khi tới, sẽ bị bỏ qua.
	void CancelPathRequest() { pathPending = false; ++pathTicket; }
	// Bắt đầu theo dõi tiến độ đi từ chỗ đang đứng (gọi mỗi khi có đường đi mới).
	void ResetProgressMonitor() { stuckTimer = 0.0f; stuckRefX = x; stuckRefY = y; hardStuckWindows = 0; poorWindows = 0; blockedTicks = 0; }
	bool HasTarget() const { return attackTargetId != kNoEntity; }
	bool IsWorker() const { return BuildSpeed > 0; }
	void CancelJob() { job = WorkJob{}; gatherAccum = 0.0f; }

	bool InAttackRange(const Entity& t) const;
	// Đã chết và animation chết đã xong: không cần vẽ / xét nữa.
	bool IsGone() const;

	// Gọi mỗi tick SAU khi đã di chuyển. `target` là mục tiêu đã tra từ attackTargetId (nullptr nếu không có).
	// Quyết định chuyển trạng thái, cập nhật animation. Trả về true đúng 1 lần mỗi đòn đánh, tại khung trúng đòn.
	bool UpdateState(float dt, const Entity* target, bool targetInRange);

	// alpha: hệ số nội suy giữa tick trước và tick hiện tại. attackTarget chỉ dùng để vẽ đường nhắm khi debug.
	void Render(SDL_Renderer* r, float camX, float camY, float alpha, bool debug, const Entity* attackTarget) const;

private:
	void EnterState(UnitState s);
};
