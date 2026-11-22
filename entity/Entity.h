#pragma once
#include <SDL3/SDL.h>
#include <algorithm>
#include <cmath>
#include "../Common.h"
#include "Team.h"

// Mọi thứ có thể xuất hiện và được chọn trong thế giới (hiện chỉ có Unit; sau này thêm công trình, mỏ...).
class Entity
{
public:
	EntityId id = kNoEntity; // do GameState cấp khi thêm vào thế giới
	float x = 0.0f;
	float y = 0.0f;
	float z = 0.0f;
	// Vị trí ở tick logic TRƯỚC. Khi vẽ nội suy giữa (prev -> hiện tại) để chuyển động mượt dù logic chỉ chạy 30 lần/giây.
	float prevX = 0.0f;
	float prevY = 0.0f;
	float squareSize;
	bool selected = false;
	Team team = Team::Player;

	Entity(float x, float y, float size);
	Entity(const Entity&) = default;
	Entity& operator=(const Entity&) = default;
	Entity(Entity&&) = default;
	Entity& operator=(Entity&&) = default;
	virtual ~Entity() = default; // Hàm hủy ảo bắt buộc khi dùng kế thừa

	// Vị trí dùng để vẽ, alpha thuộc [0, 1] (0 = tick trước, 1 = tick hiện tại).
	float RenderX(float alpha) const { return prevX + (x - prevX) * alpha; }
	float RenderY(float alpha) const { return prevY + (y - prevY) * alpha; }
	// Ghi nhớ vị trí hiện tại làm "tick trước" (gọi ở đầu mỗi tick, hoặc sau khi dịch chuyển tức thời).
	void SnapPrevToCurrent() { prevX = x; prevY = y; }

	void RenderSelectionOutline(SDL_Renderer* r, const SDL_FRect& rect) const;
	// Thanh máu phía trên đầu; chỉ hiện khi đã bị thương hoặc đang được chọn.
	void RenderHealthBar(SDL_Renderer* r, const SDL_FRect& rect) const;

	// ---- Chỉ số (Unit::ApplyType nạp lại theo loại đơn vị) ----
	float MoveSpeed = 300.0f; // pixel/giây
	float Vision = 320.0f;    // Phạm vi nhìn (pixel), dành cho sương mù chiến trường
	float Detection = 0.0f;   // Phát hiện tàng hình (pixel)
	float AggroRange = 192.0f;// Bán kính tự động tìm kẻ địch khi đứng yên (pixel)

	int Cost = 0;             // Chi phí sản xuất
	int Supply = 1;           // Số lượng slot quân đội mà đơn vị chiếm giữ
	int BuildSpeed = 0;       // Tốc độ khai thác / Xây dựng

	int HpValue = 100;
	int HpMax = 100;
	int Armor = 1;
	int Shield = 0;

	int Damage = 10;          // Sát thương mỗi đòn
	float Cooldown = 1.0f;    // Thời gian giữa hai đòn đánh (giây)
	float Range = 20.0f;      // Tầm đánh = khoảng hở tối đa giữa hai cạnh hitbox (pixel)

	float hurtTimer = 0.0f;   // > 0: vừa bị đánh, dùng để nháy sáng

	// Kẻ vừa đánh mình, dùng để đánh trả. Tự hết hạn sau kGrudgeTime giây để không giữ mãi mối thù với kẻ ở rất xa.
	EntityId lastAttackerId = kNoEntity;
	float grudgeTimer = 0.0f;
	static constexpr float kGrudgeTime = 4.0f;

	bool IsAlive() const { return HpValue > 0; }
	// Khiên đỡ trước; phần còn lại trừ giáp (tối thiểu 1) rồi mới trừ máu.
	void TakeDamage(int amount, EntityId attacker = kNoEntity);
	// Khoảng cách giữa hai tâm.
	float DistanceTo(const Entity& other) const;
};
