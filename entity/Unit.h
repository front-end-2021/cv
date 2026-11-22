#pragma once
#include <vector>
#include "Entity.h"
#include "Animation.h"
#include "UnitType.h"

// Một Unit dùng cho CẢ HAI PHE. Kẻ địch chính là Unit có team = Team::Enemy:
// dùng chung state machine, lệnh, di chuyển, đuổi theo, đánh, animation và cách vẽ.
// Điểm khác nhau là loại đơn vị (UnitType), màu vẽ và việc ai ra lệnh (người chơi hay AI: xem game/Ai.cpp).
class Unit : public Entity {
public:
	std::vector<Waypoint> path;  // Danh sách các điểm mốc từ thuật toán A*

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
	void OrderMove(std::vector<Waypoint> newPath);             // đi tới nơi; hủy lệnh tấn công
	void OrderAttack(EntityId target, bool automatic = false); // đuổi theo rồi đánh mục tiêu
	void ClearTarget();                                        // bỏ lệnh tấn công và dừng lại
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
