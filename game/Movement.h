#pragma once
#include "game/GameState.h"

// Di chuyển một Unit dọc theo u.path trong MỘT tick (không di chuyển khi đang ra đòn).
//  - Mỗi bước kiểm tra tường: bị chặn thì trượt dọc tường theo từng trục.
//  - Bị tường chặn liên tiếp, hoặc đứng yên quá lâu dù còn đường đi -> tính lại đường tới đích của
//    lệnh đi (PathPurpose::Unstick). Thử vài lần vẫn kẹt thì bỏ lệnh; kẹt gần đích thì coi như đã tới.
//  - Tới hết đường đi thì xóa lệnh đi (u.hasMoveGoal = false).
void MoveUnitAlongPath(GameState& g, Unit& u, float dt);

// Tách các Unit đang đè lên nhau (gọi sau khi mọi Unit đã di chuyển).
//  - Lính đứng yên bị lính đang đi đẩy ra (như trước).
//  - Hai lính cùng đứng yên: mỗi bên nhường một nửa.
//  - Hai lính cùng ĐANG ĐI: mỗi bên nhường một nửa, bên nào đang tiến về phía bên kia thì còn né sang phải
//    của mình (giao thông bên phải) để hai đoàn ngược chiều lách qua nhau thay vì kẹt cứng.
//    Hai lính đối đầu trong lối hẹp: bên id nhỏ được ưu tiên, bên kia bị đẩy lùi cho tới chỗ lách được.
// Mọi cú đẩy đều kiểm tra tường (trượt dọc tường nếu cần) nên không ai bị đẩy vào nước/đá.
void ResolveUnitCollisions(GameState& g);
