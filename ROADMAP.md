# MiniRTS — Lộ trình hoàn thiện & tiến độ

_Cập nhật: 22/11/2026. Đối chiếu trực tiếp với code hiện tại (SDL3 + C++17, 2D)._

**Cách đọc:** `[x]` đã xong · `[ ]` chưa làm · ✅ xong hết · 🟡 làm một phần · ⬜ chưa bắt đầu.
Các số "x/y" đếm mục nhỏ trong từng bước, **không phản ánh khối lượng công việc** (một mục như "Fog of war" nặng hơn nhiều so với "Pause").

## Tổng quan

| | Nội dung | Trạng thái | Tiến độ |
|---|---|:---:|:---:|
| 1 | Sprite 2D + trạng thái Idle / Walk / Attack | 🟡 | 5/9 |
| 2 | Chiến đấu | 🟡 | 11/12 |
| 3 | Di chuyển & pathfinding | ⬜ | 0/7 |
| 4 | Kinh tế & xây dựng | ⬜ | 0/6 |
| 5 | Giao diện & tầm nhìn | ⬜ | 0/8 |
| 6 | AI, luật chơi & đóng gói | 🟡 | 3/11 |

---

## Bước 1 — Sprite 2D + Idle / Walk / Attack 🟡 (5/9)

- [x] `UnitState`, `Facing` (4 hướng), `Animator` (`entity/Animation.h`)
- [x] State machine hoạt động: Idle ↔ Walk, → Attack, → Dead (sơ đồ trong `Unit.cpp`)
- [x] Hình vẽ tạm khác nhau theo trạng thái (thở / nhún / lao tới + vệt chém / xẹp mờ), có bóng và "mắt" chỉ hướng
- [x] Gây sát thương đúng **khung trúng đòn** (`hitFrame`), đòn đánh không bị ngắt giữa chừng
- [x] Vẽ theo thứ tự `y` (đơn vị phía dưới che đơn vị phía trên)
- [ ] Nạp PNG (SDL3_image hoặc stb_image) và bật `SDL_SCALEMODE_NEAREST` nếu là pixel art
- [ ] Vẽ bằng `SDL_RenderTexture` theo `frame`/hàng, lật ngang cho Left/Right
- [ ] Neo sprite ở chân nhân vật, chỉnh kích thước sprite so với hitbox 40px
- [ ] Khai báo clip (số khung, fps, hitFrame) trong file dữ liệu — hiện hard-code trong `kClips` (`entity/Animation.h`). Có thể gộp vào `Data/units.txt` theo từng loại đơn vị

> Muốn thay sprite thật: chỉ cần sửa thân hàm `Unit::Render` (đã có ghi chú trong code); nhớ dùng `RenderX/RenderY(alpha)` làm vị trí vẽ. Cần có art và chốt layout sprite sheet trước.

## Bước 2 — Chiến đấu 🟡 (11/12)

- [x] HP / Armor / Shield thật (khiên đỡ trước, giáp trừ tối thiểu 1 mỗi đòn)
- [x] Thanh máu (hiện khi bị thương hoặc đang chọn)
- [x] Cái chết: trạng thái `Dead` + animation chết, bỏ khỏi danh sách chọn/va chạm/nhắm
- [x] **Xóa hẳn xác khỏi danh sách đơn vị** khi animation chết xong
- [x] Chuột phải lên kẻ địch = lệnh tấn công
- [ ] Lệnh **Stop**, **Hold position**, **Attack-move** (A + click)
- [x] Tự tìm mục tiêu khi đứng yên (`aggro` 192px) — _chưa dùng `Vision`_
- [x] Đuổi theo mục tiêu, tính lại đường khi mục tiêu chạy đi
- [x] Cooldown giữa hai đòn
- [x] Kẻ địch là `Unit` thật (`team = Enemy`), dùng chung toàn bộ code với lính phe ta
- [x] Lớp **team** (hai phe thù địch, cùng phe không đánh nhau)
- [x] **Dùng ID thay cho con trỏ** (`attackTargetId`, `lastAttackerId`): có thể thêm/xóa đơn vị bất cứ lúc nào, kể cả giữa trận

## Bước 3 — Di chuyển & pathfinding ⬜ (0/7)

- [ ] Làm mượt đường đi (line-of-sight / string-pulling) thay vì đi zigzag qua tâm từng ô
- [ ] Gán slot đội hình theo khoảng cách gần nhất — hiện gán theo thứ tự trong danh sách nên lính hay chạy chéo nhau (hàm `ComputeFormationSlots` đã tách riêng, dễ thay thuật toán)
- [ ] Tính lại đường khi bị chặn — _hiện chỉ có tính lại khi đuổi mục tiêu đang di chuyển_
- [ ] Đi tới điểm **gần đích nhất với tới được** khi đích nằm ở vùng tách biệt — _hiện chỉ tìm ô gần nhất trong bán kính 5 ô, nếu không với tới thì lính đứng yên_
- [ ] Tránh nhau cho lính **đang di chuyển** — _lính đứng yên đã được đẩy ra, nhưng hai lính cùng đi vẫn xuyên qua nhau_
- [ ] Tối ưu A\*: hàng đợi yêu cầu đường đi, flow field cho nhóm đông (hiện mỗi unit cấp phát `rows*cols` mỗi lần tìm đường)
- [ ] Thay `path.erase(begin)` (O(n)) bằng chỉ số hoặc `deque`

## Bước 4 — Kinh tế & xây dựng ⬜ (0/6)

- [ ] Tài nguyên, node mỏ trên map
- [ ] Thợ khai thác, kho chứa
- [ ] Công trình có footprint chiếm ô và chặn pathfinding (cần thêm vào `TileMap`/`Pathfinder`)
- [ ] Chế độ đặt nhà (ô xanh/đỏ báo vị trí hợp lệ)
- [ ] Hàng đợi sản xuất — _đã có `GameState::AddUnit` cấp ID, thêm quân giữa trận an toàn_
- [ ] Dùng `Cost`, `Supply`, `BuildSpeed` — _đã khai báo trong `Entity` nhưng chưa có code nào dùng_

## Bước 5 — Giao diện & tầm nhìn ⬜ (0/8)

- [ ] HUD đầy đủ: tài nguyên, bảng thông tin unit, nút lệnh — _hiện chỉ có HUD tối thiểu: đếm quân còn lại và banner thắng/thua (vẽ bằng debug font)_
- [ ] Ctrl+số lưu/gọi nhóm
- [ ] Shift+click thêm vào vùng chọn
- [ ] Double-click chọn cùng loại — _`Unit::typeId` đã có sẵn để so loại_
- [ ] Minimap
- [ ] Thông báo bị tấn công
- [ ] Fog of war — _`Vision`, `Detection` đã khai báo nhưng chưa dùng_
- [ ] Tileset thật + autotile ở rìa cỏ/nước (hiện vẽ ô màu phẳng)

## Bước 6 — AI, luật chơi & đóng gói 🟡 (3/11)

- [ ] AI địch: build order đơn giản
- [ ] AI địch: đợt tấn công theo timer
- [x] AI địch: phòng thủ khi bị đánh (tự phát hiện, đánh trả, bỏ cuộc khi bị kéo quá xa, về chỗ cũ)
- [x] Điều kiện thắng/thua + màn hình kết thúc (banner VICTORY/DEFEAT, **R** chơi lại, **Esc** về menu)
- [ ] Tạm dừng
- [ ] Chọn tốc độ game — _nay làm được bằng cách nhân `frameDt` trước khi dồn vào bộ tích lũy tick_
- [ ] Âm thanh (SDL3 audio)
- [ ] Save/load
- [ ] Cài đặt
- [x] Map có điểm xuất phát, kẻ địch và loại đơn vị (`@spawn`, `@enemy`, `@target` là tên cũ vẫn dùng được)
- [ ] Map có header đầy đủ: tên, số người chơi, mỏ tài nguyên

---

## Cấu trúc mã nguồn hiện tại

```
main.cpp            vòng đời SDL + nhận sự kiện (212 dòng)
Common.h            Waypoint, EntityId, hằng số chung (kSquareSize, kTickRate...)
Tile.h  TileMap.*   địa hình, đọc file map, khả năng đi được
Pathfinder.*        A* trên TileMap
Utils.* camera/     tiện ích, camera
entity/             Entity (id, vị trí, HP) · Unit (state machine, lệnh) · UnitType (đọc Data/units.txt)
                    Animation.h · Team.h
game/               GameState (units theo ID) · World (dựng ván, xóa xác, thắng/thua)
                    Simulation (1 tick cố định) · Ai · Orders · Formation · Selection
                    Game (vòng bước cố định + nội suy) · Render
ui/Menu.*           màn chọn map
Data/units.txt      chỉ số các loại đơn vị      Maps/*.txt   bản đồ
```

## Đã làm thêm ngoài kế hoạch gốc

- Bộ não tự chọn mục tiêu **dùng chung cho cả hai phe** (`AutoAcquireTarget`): kẻ địch do AI điều khiển, lính phe ta tự vệ khi đứng yên mà không phá lệnh đi của người chơi
- Ghi nhớ kẻ vừa đánh mình (`lastAttackerId`), tự hết hạn sau 4 giây
- Số lính phe ta lấy theo số dòng `@spawn` trong map (không còn cố định 6)
- Nháy trắng khi trúng đòn, nháy sáng ở khung trúng đòn
- Phím **R** chơi lại ván; **\** bật/tắt debug (tên trạng thái, khung hình, đường nhắm, số tick)

## Giới hạn & nợ kỹ thuật đã biết

1. **Lệnh của người chơi áp dụng ngay khi nhận sự kiện chuột**, chưa xếp hàng theo tick. Cần thêm hàng đợi lệnh nếu sau này làm replay hoặc multiplayer.
2. **Con trỏ `Unit*` chỉ dùng tạm trong một hàm** (từ `FindUnit`, `AddUnit`, `FindEnemyAt`...). Thêm/xóa đơn vị làm chúng mất hiệu lực; cần lưu lâu dài thì lưu `EntityId`.
3. **Va chạm** chỉ đẩy lính đứng yên; `std::floor` làm tròn vị trí khi đẩy nên có thể còn chồng nhẹ dưới 1px.
4. **Kẻ địch không "gọi đồng bọn"**: chỉ xông vào khi chính nó tới tầm phát hiện. Đánh trả cũng bỏ qua kẻ đứng quá 288px, nên lính tầm xa có thể bắn từ xa mà địch không phản ứng.
5. Chọn quân và bấm chuột dùng **vị trí logic**, lệch tối đa 1 tick (≤ 10px với lính chạy nhanh) so với hình vẽ nội suy.
6. Dưới khoảng **6 FPS**, game chạy chậm lại thay vì bù tick (chặn 5 tick/khung để tránh "vòng xoáy chết").
7. Phím **R** chơi lại ngay giữa ván, không hỏi xác nhận.
8. **Chưa build thử trên SDL3 thật.** Kiểm tra bằng SDL giả + AddressSanitizer/UBSan: 172 kiểm tra hành vi đạt, cộng test hồi quy 12.000 truy vấn đường đi và 9.840 vị trí đội hình giống hệt bản trước khi tách code. Hình vẽ tạm cần xem bằng mắt khi chạy thật.
9. Cân bằng: 6 lính đánh 3 địch thắng không mất ai (~9 giây); chỉnh trong `Data/units.txt` hoặc thêm dòng `@enemy`.

## Đề xuất thứ tự tiếp theo

1. **Chốt bước 2**: Stop / Hold position / Attack-move. Mỗi lệnh chỉ vài chục dòng nhờ `Unit::OrderXxx` và `Orders.cpp`.
2. **Bước 1 (sprite thật)** khi đã có art và chốt layout sprite sheet; nên đưa luôn clip animation vào `Data/units.txt`.
3. **Bước 3** (làm mượt đường đi, slot đội hình, tránh nhau khi đang đi) để cảm giác điều khiển tốt hơn. Nên làm trước bước 4 vì công trình sẽ chặn đường đi.
4. **Cải thiện nhanh ở bước 5**: Shift+click, Ctrl+số, tạm dừng. Rẻ nhưng cải thiện trải nghiệm nhiều.
5. Sau đó mới tới **bước 4 → fog of war và minimap → AI kinh tế (bước 6)**.
