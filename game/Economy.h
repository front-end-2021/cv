#pragma once
#include "game/GameState.h"

// ===========================================================================
// Kinh tế: vàng và slot quân (supply).
//
// Mỗi phe có một kho vàng (GameState::gold). Vàng chỉ vào kho khi thợ NỘP hàng ở một công trình kho (xem game/Work.h),
// và chỉ ra khỏi kho ở hai chỗ: đặt móng công trình (Entity::Cost của công trình) và đưa đơn vị vào hàng đợi
// sản xuất (Entity::Cost của đơn vị). Hủy thì hoàn lại.
//
// Slot quân (Entity::Supply): mỗi đơn vị còn sống chiếm `Supply` slot, và đơn vị đang nằm trong hàng đợi sản xuất
// cũng chiếm chỗ trước. Tổng slot các công trình ĐÃ XÂY XONG cấp ra là giới hạn (Building::supplyProvided).
// Chỉ việc đưa thêm đơn vị vào hàng đợi mới bị giới hạn này chặn; quân có sẵn từ map vượt giới hạn thì vẫn ở đó.
// ===========================================================================

constexpr float kGatherPerSecond = 4.0f;   // vàng/giây một thợ đào được khi buildspeed = 100
constexpr float kWorkReach = 30.0f;        // thợ được coi là "tới nơi làm việc" khi khoảng hở giữa hitbox và mép công trình/mỏ <= ngần này (px)
constexpr float kAutoMineRadius = 8.0f * 64.0f; // mỏ đang đào cạn thì thợ tự tìm mỏ khác trong bán kính này (px)
constexpr float kCancelRefundRatio = 0.75f;// hủy công trình xây dở: hoàn lại ngần này giá
constexpr int kMaxQueueLength = 5;         // số đơn vị tối đa trong hàng đợi của một công trình
constexpr int kJobMaxFailures = 3;         // thợ đi tới chỗ làm việc thất bại ngần lần liên tiếp thì bỏ việc
constexpr float kJobRetryDelay = 0.5f;     // giây chờ giữa hai lần thợ thử đi lại

bool CanAfford(const GameState& g, Team team, int cost);
// Trừ `cost` vàng. false (và không trừ gì) nếu không đủ.
bool Spend(GameState& g, Team team, int cost);
void Refund(GameState& g, Team team, int amount);

// Tổng slot quân đang chiếm: đơn vị còn sống + đơn vị đang chờ trong hàng đợi sản xuất.
int SupplyUsed(const GameState& g, Team team);
// Tổng slot các công trình đã xây xong cấp ra.
int SupplyCap(const GameState& g, Team team);

// Phe còn khả năng có thêm quân không: có công trình đã xây xong huấn luyện được đơn vị.
bool HasProductionBuilding(const GameState& g, Team team);
