#pragma once
#include "game/GameState.h"

// ===========================================================================
// Hàng đợi sản xuất của công trình.
//
// EnqueueUnit trừ vàng và giữ chỗ slot quân NGAY khi đưa vào hàng đợi (xem game/Economy.h); hủy thì hoàn lại.
// Mỗi tick UpdateProduction giảm thời gian huấn luyện của đơn vị đầu hàng; hết giờ thì đơn vị xuất hiện ở một ô
// trống quanh công trình (nếu chưa có chỗ thì đứng chờ tới khi có) rồi đi tới điểm tập kết (nếu có).
// Thợ mới ra mà điểm tập kết nằm trên một mỏ thì tự đi đào.
// ===========================================================================

enum class EnqueueResult {
    Ok,
    NoSuchBuilding,
    NotComplete,       // công trình còn đang xây dở
    CannotProduce,     // công trình này không huấn luyện được loại đơn vị đó
    QueueFull,
    NotEnoughGold,
    NotEnoughSupply
};

// Công trình `b` có huấn luyện được loại đơn vị `unitTypeIndex` không (theo danh sách `produces`).
bool CanProduce(const GameState& g, const Building& b, int unitTypeIndex);

EnqueueResult EnqueueUnit(GameState& g, EntityId buildingId, int unitTypeIndex);

// Hủy đơn vị ở vị trí `index` trong hàng đợi (-1 = cuối hàng), hoàn lại vàng và slot. false nếu không có.
bool CancelQueuedUnit(GameState& g, EntityId buildingId, int index = -1);

// Đặt điểm tập kết cho công trình. resourceId != kNoEntity: điểm đó nằm trên mỏ này.
void SetRallyPoint(Building& b, float x, float y, EntityId resourceId = kNoEntity);

// Chạy hàng đợi của mọi công trình trong MỘT tick. Có thể thêm đơn vị vào g.units, nên chỉ gọi khi không còn
// tham chiếu Unit nào đang giữ (xem StepSimulation).
void UpdateProduction(GameState& g, float dt);

// Mô tả ngắn lý do (cho thông báo trên màn hình).
const char* DescribeEnqueueResult(EnqueueResult r);
