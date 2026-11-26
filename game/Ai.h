#pragma once
#include "game/GameState.h"

// ===========================================================================
// "Bộ não" tự chọn mục tiêu. DÙNG CHUNG cho mọi Unit:
//   - Kẻ địch (Team::Enemy): do AI điều khiển, lúc nào cũng được tự chọn mục tiêu.
//   - Lính phe ta: chỉ tự vệ khi đang đứng yên, không phá lệnh đi của người chơi.
//   Hai chế độ do người chơi đặt (Unit::combatMode):
//   - Hold: chỉ đánh kẻ đã nằm trong tầm đánh, không đuổi theo; mục tiêu bước ra khỏi tầm thì bỏ.
//   - AttackMove: vừa đi tới đích vừa tự chọn mục tiêu như lính đứng yên; xong mục tiêu thì đi tiếp (OrderAttackMoveTo),
//     tới đích (hoặc không đi tiếp được) thì về chế độ Normal.
// Kết quả luôn là gọi Unit::OrderAttack(..., automatic = true) / OrderMove: phần đuổi theo, đánh, animation... đã có sẵn trong Simulation.cpp, không viết lại cho từng phe.
// ===========================================================================
constexpr float kLeashFactor = 1.5f;      // đuổi theo mục tiêu tự chọn quá AggroRange * hệ số này thì bỏ cuộc
constexpr float kScanInterval = 0.2f;     // giây giữa hai lần quét tìm kẻ địch
constexpr float kHomeArriveDist = 40.0f;  // cách chỗ cũ dưới mức này thì coi như đã về tới
constexpr float kUnreachableMemory = 4.0f;// giây: đã biết không có đường lại gần một mục tiêu thì không tự chọn lại nó chừng này thời gian

// Kẻ thù còn sống gần nhất trong bán kính `radius` (tính theo khoảng cách tâm), bỏ qua `ignore` nếu có. Con trỏ chỉ dùng tạm.
Unit* FindNearestFoe(GameState& g, const Unit& self, float radius, EntityId ignore = kNoEntity);

// Kẻ thù còn sống gần nhất (theo khoảng cách tâm) mà `self` đánh tới được mà KHÔNG phải di chuyển (Unit::InAttackRange), bỏ qua `ignore` nếu có. Dành cho lính đang giữ vị trí. Con trỏ chỉ dùng tạm.
Unit* FindFoeInReach(GameState& g, const Unit& self, EntityId ignore = kNoEntity);

void AutoAcquireTarget(GameState& g, Unit& u, float dt);
