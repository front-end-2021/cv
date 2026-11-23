#pragma once
#include <cstdint>
#include <vector>
#include "../Path.h"
#include "Entity.h"
#include "Animation.h"
#include "UnitType.h"

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
	// Bỏ yêu cầu tìm đường đang chờ (nếu có): kết quả của nó, khi tới, sẽ bị bỏ qua.
	void CancelPathRequest() { pathPending = false; ++pathTicket; }
	// Bắt đầu theo dõi tiến độ đi từ chỗ đang đứng (gọi mỗi khi có đường đi mới).
	void ResetProgressMonitor() { stuckTimer = 0.0f; stuckRefX = x; stuckRefY = y; hardStuckWindows = 0; poorWindows = 0; blockedTicks = 0; }
	bool HasTarget() const { return attackTargetId != kNoEntity; }

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
