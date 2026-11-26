#pragma once
#include "entity/Footprint.h"
#include "game/GameState.h"

// ===========================================================================
// Đặt và xây công trình.
//
// Đặt móng là tức thì: PlaceBuilding trừ vàng, thêm một Building chưa xong (complete = false) vào thế giới và đánh dấu các ô nó chiếm, nên từ đó đường đi đã né nó. 
// Sau đó thợ được giao đi xây (game/Work.h) và mỗi tick họ đứng cạnh công trình thì tiến độ tăng lên theo Entity::BuildSpeed. 
// Xây xong thì công trình mới hoạt động (cấp slot quân, làm kho, huấn luyện đơn vị).
//
// Lính đang đứng trong vùng định xây của phe mình (hoặc trung lập) được đẩy ra chỗ trống gần nhất; lính ĐỊCH đứng
// trong vùng đó thì chặn việc đặt móng (PlaceResult::EnemyInWay). Lính đang đi mà đường cắt qua công trình mới được tính lại đường.
// ===========================================================================

// Ô (row, col) có xây được lên không: địa hình đi được và chưa bị công trình/mỏ chiếm. Dùng để tô bóng mờ.
bool IsTileBuildable(const GameState& g, int row, int col);

// Có đặt được công trình loại `typeIndex` với góc trên-trái ở ô (row, col) không. KHÔNG xét vàng.
// Trả về lý do đầu tiên không được, hoặc PlaceResult::Ok.
PlaceResult CheckPlacement(const GameState& g, int typeIndex, int row, int col, Team team);

// Mô tả ngắn lý do (cho thông báo trên màn hình, tiếng Anh vì font gỡ lỗi của SDL chỉ có ASCII).
const char* DescribePlaceResult(PlaceResult r);

// Đặt móng. Thành công trả về con trỏ tới công trình mới (chỉ dùng tạm: AddBuilding kế tiếp làm nó mất hiệu lực), thất bại trả về nullptr và ghi lý do vào *result (nếu có).
// Thất bại thì không thay đổi gì, kể cả vàng. prebuilt = true: công trình dựng sẵn, xây xong ngay và miễn phí (dùng khi dựng ván từ file map).
Building* PlaceBuilding(GameState& g, int typeIndex, int row, int col, Team team, bool prebuilt, PlaceResult* result = nullptr);

// Hủy công trình ĐANG XÂY DỞ: hoàn kCancelRefundRatio giá, gỡ khỏi bản đồ. false nếu không có hoặc đã xây xong.
bool CancelConstruction(GameState& g, EntityId buildingId);

// Gỡ một công trình bất kỳ khỏi thế giới, hoàn lại tiền các đơn vị còn trong hàng đợi (không hoàn tiền công trình).
// Thợ đang làm việc với công trình này tự bỏ việc ở tick sau.
bool DestroyBuilding(GameState& g, EntityId buildingId);

// Đẩy mọi lính còn sống đang bị kẹt trong ô không đi được (vừa bị công trình đè lên) ra chỗ đứng được gần nhất.
void EvictTrappedUnits(GameState& g);

// Lính nào còn đường đi cắt qua (vùng quanh) `fp` thì xin đường mới: lệnh đi tính lại tới đích cuối, lệnh đuổi theo thì bỏ đường cũ để xin lại ở tick kế tiếp.
void ReplanPathsCrossing(GameState& g, const Footprint& fp);

// Thợ đã tới nơi xây: tăng tiến độ theo thời gian dt và tốc độ làm việc của thợ. Trả về true đúng lúc xây xong.
bool ApplyConstructionWork(Building& b, const Unit& worker, float dt);
