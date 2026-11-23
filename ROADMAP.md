# MiniRTS — Lộ trình hoàn thiện & tiến độ

_Cập nhật: 23/11/2026. Đối chiếu trực tiếp với code hiện tại (SDL3 + C++17, 2D)._

**Cách đọc:** `[x]` đã xong · `[ ]` chưa làm · ✅ xong hết · 🟡 làm một phần · ⬜ chưa bắt đầu.
Các số "x/y" đếm mục nhỏ trong từng bước, **không phản ánh khối lượng công việc** (một mục như "Fog of war" nặng hơn nhiều so với "Pause").

## Tổng quan

| | Nội dung | Trạng thái | Tiến độ |
|---|---|:---:|:---:|
| 1 | Sprite 2D + trạng thái Idle / Walk / Attack | 🟡 | 5/9 |
| 2 | Chiến đấu | 🟡 | 11/12 |
| 3 | Di chuyển & pathfinding | ✅ | 7/7 |
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

## Bước 3 — Di chuyển & pathfinding ✅ (7/7)

- [x] Làm mượt đường đi (line-of-sight / string-pulling): `Pathfinder::Smooth` bỏ các mốc thừa, mỗi đoạn thẳng được kiểm tra bằng hitbox phình 10% (`kPathClearance`) nên đi sát tường không bị vẽ đè lên tường. Khi đang đi, lính cũng bỏ qua mốc trung gian nếu đã nhìn thấy mốc kế tiếp
- [x] Gán slot đội hình theo khoảng cách gần nhất: `AssignSlotsByDistance` (Hungarian, tổng quãng đường nhỏ nhất nên **không có hai đường đi cắt nhau**; nhóm đông hơn 80 lính dùng cách tham lam cho nhẹ)
- [x] Tính lại đường khi bị chặn: bị tường chặn hẳn vài tick, hoặc gần như đứng yên 1,5 giây, thì xin đường mới tới `Unit::moveGoal` (đích cuối của lệnh đi). Thử 2 lần vẫn kẹt thì bỏ lệnh; kẹt trong bán kính 2 ô quanh đích thì coi như đã tới
- [x] Đi tới điểm gần đích nhất với tới được: A\* nhớ ô đã đóng gần điểm bấm nhất (`PathResult::partial`). Đích trên nước/đá được dời tới ô đi được gần nhất **không còn giới hạn 5 ô**. Bấm lên đảo/giữa hồ thì lính đi tới bờ gần nhất rồi dừng
- [x] Tránh nhau cho lính đang di chuyển (`game/Movement.cpp`): hai lính cùng đi nhường nhau một nửa; bên nào đang tiến về phía bên kia thì né sang phải của mình. Đối đầu trong lối hẹp thì bên id nhỏ được ưu tiên, bên kia bị đẩy lùi. Mọi cú đẩy đều kiểm tra tường. Lính đi cũng kiểm tra tường từng bước (trượt dọc tường khi chạm)
- [x] Tối ưu A\*: tái dùng bộ nhớ (dấu thời gian, không cấp phát `rows*cols` mỗi lần), heuristic octile, **hàng đợi yêu cầu đường đi** có ngân sách mỗi tick (`game/PathService.*`), và **tìm đường chung cho nhóm ≥ 10 lính** (`FlowField`: một lần Dijkstra ngược từ đích, dừng sớm khi mọi lính đã được nối, rồi mỗi lính lần theo cây). _Đây là trường chi phí dùng tạm cho một lệnh, chưa phải flow field giữ lâu dài để lính tra mỗi tick_
- [x] Thay `path.erase(begin)` bằng `Path` (`Path.h`: vector + chỉ số đầu, `pop_front` O(1))

> Phụ trợ: `Maps/Map02.txt` (sông có bãi cạn rộng và cầu hẹp 1 ô, sống đá có khe, bậc thang đá chéo, hồ có đảo tách biệt, khu địch có tường bao) để xem bằng mắt; `tests/PathingTests.cpp` (xem mục "Đã làm thêm"). Debug (`\`) hiện thêm số yêu cầu đường đang chờ (`PathQ`).

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
Pathfinder.*        A* trên TileMap + làm mượt đường + tìm điểm gần đích nhất
FlowField.*         tìm đường chung cho cả nhóm (Dijkstra ngược, dừng sớm)
Path.h  PathGrid.h  danh sách mốc lấy ở đầu O(1) · luật đi 8 hướng dùng chung A*/FlowField
Utils.* camera/     tiện ích, camera
entity/             Entity (id, vị trí, HP) · Unit (state machine, lệnh) · UnitType (đọc Data/units.txt)
                    Animation.h · Team.h
game/               GameState (units theo ID) · World (dựng ván, xóa xác, thắng/thua)
                    Simulation (1 tick cố định) · Ai · Orders · Formation (gán slot) · Selection
                    Movement (đi + va chạm) · PathService/PathRequest (hàng đợi tìm đường)
                    Game (vòng bước cố định + nội suy) · Render
ui/Menu.*           màn chọn map
tests/              PathingTests.cpp (cmake -DMINIRTS_BUILD_TESTS=ON)
Data/units.txt      chỉ số các loại đơn vị      Maps/*.txt   bản đồ
```

## Đã làm thêm ngoài kế hoạch gốc

- Bộ não tự chọn mục tiêu **dùng chung cho cả hai phe** (`AutoAcquireTarget`): kẻ địch do AI điều khiển, lính phe ta tự vệ khi đứng yên mà không phá lệnh đi của người chơi
- Ghi nhớ kẻ vừa đánh mình (`lastAttackerId`), tự hết hạn sau 4 giây
- Số lính phe ta lấy theo số dòng `@spawn` trong map (không còn cố định 6)
- Nháy trắng khi trúng đòn, nháy sáng ở khung trúng đòn
- **Bộ nhớ "mục tiêu không với tới"**: khi biết không có đường lại gần một mục tiêu, bộ tự chọn mục tiêu bỏ qua nó 4 giây (`kUnreachableMemory`) thay vì chọn lại rồi xin đường vô ích mỗi 0,25 giây (đo được: 243 → 18 lần xin đường trong 20 giây)
- **Bộ kiểm thử không cần cửa sổ** `tests/PathingTests.cpp` (147 kiểm tra): so A\* với đáp án chuẩn trên bản đồ ngẫu nhiên, làm mượt, đường gần đích nhất, gán slot (đối chiếu vét cạn), FlowField, các kịch bản mô phỏng (qua tường, hai đoàn ngược chiều, nút cổ chai, bị chặn, đổi lệnh, hàng đợi), 150 ván ngẫu nhiên kiểm bất biến (không ai đè lên tường, mọi lệnh đi kết thúc). Chạy: `cmake -S . -B build -DMINIRTS_BUILD_TESTS=ON`, `cmake --build build --target PathingTests`, `ctest --test-dir build`; thêm `--bench` để in số liệu hiệu năng
- Phím **R** chơi lại ván; **\** bật/tắt debug (tên trạng thái, khung hình, đường nhắm, số tick)

## Giới hạn & nợ kỹ thuật đã biết

1. **Lệnh của người chơi áp dụng ngay khi nhận sự kiện chuột**, chưa xếp hàng theo tick. Cần thêm hàng đợi lệnh nếu sau này làm replay hoặc multiplayer.
2. **Con trỏ `Unit*` chỉ dùng tạm trong một hàm** (từ `FindUnit`, `AddUnit`, `FindEnemyAt`...). Thêm/xóa đơn vị làm chúng mất hiệu lực; cần lưu lâu dài thì lưu `EntityId`.
3. **Va chạm**: lính đứng yên luôn nhường hoàn toàn cho lính đang đi, nên với nhóm đông (từ ~24 lính) một số lính đã vào đúng chỗ bị lính đến sau đẩy lệch khỏi vị trí đội hình (đo trên bản đồ trống: lệch trung bình 7–9 px, tối đa 40–80 px) và không tự quay lại. Thử cho lính đang đi nhường một phần: không cải thiện đáng kể mà làm kẹt nhiều hơn nên giữ nguyên. Quét va chạm vẫn O(n²) mỗi tick (đủ cho vài trăm lính; cần lưới băm không gian nếu nhiều hơn). Đã bỏ `std::floor` khi đẩy: không còn lệch dần về góc trên-trái.
4. **Kẻ địch không "gọi đồng bọn"**: chỉ xông vào khi chính nó tới tầm phát hiện. Đánh trả cũng bỏ qua kẻ đứng quá 288px, nên lính tầm xa có thể bắn từ xa mà địch không phản ứng.
5. Chọn quân và bấm chuột dùng **vị trí logic**, lệch tối đa 1 tick (≤ 10px với lính chạy nhanh) so với hình vẽ nội suy.
6. Dưới khoảng **6 FPS**, game chạy chậm lại thay vì bù tick (chặn 5 tick/khung để tránh "vòng xoáy chết").
7. Phím **R** chơi lại ngay giữa ván, không hỏi xác nhận.
8. **Chưa build thử trên SDL3 thật** (kể cả `CMakeLists.txt` mới có thêm tùy chọn test). Kiểm tra bằng SDL giả + AddressSanitizer/UBSan: 147 kiểm tra trong `tests/` đạt, cộng 2.000 ván stress ngẫu nhiên ngoài bộ test (khoảng 49.000 lính: 0 lần đè tường, 0 lệnh chạy mãi không dừng). Hình vẽ tạm và cảm giác điều khiển cần xem bằng mắt khi chạy thật, đặc biệt là `Map02.txt`.
9. **Đường đi chỉ biết địa hình, không biết lính khác.** Lính tránh nhau cục bộ lúc đang đi (đẩy/né), nên hai đoàn ngược chiều qua một khe 1 ô mất lâu hơn bản cũ (12 lính: ~8 giây so với ~4 giây, vì bản cũ cho lính xuyên qua nhau). Chưa có luồng giao thông, chưa có "xếp hàng chờ" có chủ đích.
10. **Mốc trung gian được bỏ qua sớm** (trong 1 hitbox, nếu nhìn thấy mốc kế tiếp) và lính kẹt gần đích thì dừng tại chỗ: vị trí cuối có thể lệch tới ~2 ô so với vị trí đội hình khi đám đông chen chúc. Các hằng số (`kWaypointReach`, `kArriveSlack`, `kStuckWindow`...) nằm đầu `game/Movement.cpp`.
11. **Hàng đợi tìm đường chưa gộp yêu cầu giống nhau** (nhiều lính đuổi cùng một mục tiêu vẫn mỗi lính một lần A\*) và chưa ưu tiên (lệnh của người chơi vẫn xếp cùng hàng với đuổi theo của AI). Ngân sách `kMaxPathRequestsPerTick` / `kPathNodeBudgetPerTick` đặt ở `Common.h`.
12. Cân bằng: 6 lính đánh 3 địch thắng không mất ai (~9 giây); chỉnh trong `Data/units.txt` hoặc thêm dòng `@enemy`.

## Đề xuất thứ tự tiếp theo

1. **Chạy thử trên SDL3 thật** (build, xem `Maps/Map02.txt`, thử chọn cả đội rồi bấm lên đảo / qua cầu hẹp) và chỉnh các hằng số đi lại theo cảm giác.
2. **Chốt bước 2**: Stop / Hold position / Attack-move. Mỗi lệnh chỉ vài chục dòng nhờ `Unit::OrderXxx` và `Orders.cpp`; Attack-move dùng được ngay `OrderMoveTo` + `AutoAcquireTarget`.
3. **Bước 1 (sprite thật)** khi đã có art và chốt layout sprite sheet; nên đưa luôn clip animation vào `Data/units.txt`.
4. **Cải thiện nhanh ở bước 5**: Shift+click, Ctrl+số, tạm dừng. Rẻ nhưng cải thiện trải nghiệm nhiều.
5. Sau đó mới tới **bước 4** (công trình chặn đường: nhớ tính lại đường cho lính đang đi khi có công trình mới; `Path`/`PathService` đã sẵn sàng) **→ fog of war và minimap → AI kinh tế (bước 6)**.
