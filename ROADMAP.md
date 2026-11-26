# MiniRTS — Lộ trình hoàn thiện & tiến độ

_Cập nhật: 26/11/2026. Đối chiếu trực tiếp với code hiện tại (SDL3 + C++17, 2D)._

**Cách đọc:** `[x]` đã xong · `[ ]` chưa làm · ✅ xong hết · 🟡 làm một phần · ⬜ chưa bắt đầu.
Các số "x/y" đếm mục nhỏ trong từng bước, **không phản ánh khối lượng công việc** (một mục như "Fog of war" nặng hơn nhiều so với "Pause").

## Tổng quan

| | Nội dung | Trạng thái | Tiến độ |
|---|---|:---:|:---:|
| 1 | Sprite 2D + trạng thái Idle / Walk / Attack | 🟡 | 5/9 |
| 2 | Chiến đấu | ✅ | 12/12 |
| 3 | Di chuyển & pathfinding | ✅ | 7/7 |
| 4 | Kinh tế & xây dựng | ✅ | 6/6 |
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

## Bước 2 — Chiến đấu ✅ (12/12)

- [x] HP / Armor / Shield thật (khiên đỡ trước, giáp trừ tối thiểu 1 mỗi đòn)
- [x] Thanh máu (hiện khi bị thương hoặc đang chọn)
- [x] Cái chết: trạng thái `Dead` + animation chết, bỏ khỏi danh sách chọn/va chạm/nhắm
- [x] **Xóa hẳn xác khỏi danh sách đơn vị** khi animation chết xong
- [x] Chuột phải lên kẻ địch = lệnh tấn công
- [x] Lệnh **Stop** (`S`), **Hold position** (`H`), **Attack-move** (`A` rồi chuột trái): xem ghi chú bên dưới
- [x] Tự tìm mục tiêu khi đứng yên (`aggro` 192px) — _chưa dùng `Vision`_
- [x] Đuổi theo mục tiêu, tính lại đường khi mục tiêu chạy đi
- [x] Cooldown giữa hai đòn
- [x] Kẻ địch là `Unit` thật (`team = Enemy`), dùng chung toàn bộ code với lính phe ta
- [x] Lớp **team** (hai phe thù địch, cùng phe không đánh nhau)
- [x] **Dùng ID thay cho con trỏ** (`attackTargetId`, `lastAttackerId`): có thể thêm/xóa đơn vị bất cứ lúc nào, kể cả giữa trận

> **Điều khiển lính** (cần đang chọn lính phe ta; `S`/`H`/`A` bị bỏ qua khi đang đặt nhà, logic ở `game/Commands.*` nên test được):
> - **`S` Stop** (`Unit::OrderStop`): bỏ lệnh đi/đánh/việc của thợ, hủy yêu cầu đường đang chờ, cắt ngang cả đòn đang ra (cooldown giữ nguyên nên bấm liên tục không đánh nhanh hơn). Sau Stop lính là lính đứng yên bình thường: có địch trong tầm phát hiện thì vẫn tự vệ (muốn đứng im hẳn thì dùng Hold).
> - **`H` Hold position** (`Unit::OrderHold`, `CombatMode::Hold`): đứng yên tại chỗ, chỉ đánh kẻ đã nằm trong **tầm đánh** (`FindFoeInReach`), không bao giờ rời chỗ để đuổi theo. Mục tiêu bước ra khỏi tầm thì bị bỏ (đòn đang vung thì để đánh nốt); đánh trả chỉ với kẻ đã trong tầm; lính không tự đánh ai (`aggro = 0`, như thợ) thì Hold chỉ là đứng yên. Mọi lệnh đi/đánh mới của người chơi hủy Hold. Về va chạm, lính Hold được tính như lính đang đi (nhường một nửa) thay vì nhường hết, để một lính đi ngang qua không đẩy lệch cả hàng giữ vị trí.
> - **`A` rồi chuột trái = Attack-move** (`OrderAttackMoveTo` = `OrderMoveTo` + `Unit::EnterAttackMove`, `CombatMode::AttackMove`): đi theo đội hình như lệnh đi nhưng giữa đường tự chọn mục tiêu như lính đứng yên (`AutoAcquireTarget`); xong mục tiêu (chết / bị kéo quá xa / không với tới) thì đi tiếp tới đích (đợi đòn đang ra xong); hết đường mà không còn bận gì thì về chế độ Normal. Nhờ vậy đích không với tới (giữa hồ) không gây vòng lặp xin đường vô tận, và địch trên đảo bị bỏ qua sau lần thử đầu. Mỗi lính nhớ **vị trí đội hình của riêng mình** làm đích (kể cả nhóm ≥ 10 dùng FlowField). Bấm lên kẻ địch thì đánh thẳng kẻ đó như chuột phải. `A` lần nữa, chuột phải hoặc `Esc` thoát chế độ chờ chọn điểm; `S`, `H` hoặc vào chế độ đặt nhà cũng thoát.
> - Lệnh đi / đánh MỚI của người chơi (`StartMoveOrder`, `OrderMove`, `OrderAttack` không tự động) đưa lính về `CombatMode::Normal`; đánh tự chọn (`OrderAttack(id, true)`) và `ClearTarget` thì giữ nguyên chế độ. Chết cũng đặt lại.
> - Hiển thị (chưa xem bằng mắt, xem mục 19 phần nợ kỹ thuật): ô xanh lam ở góc lính đang Hold; dấu (x) đỏ ở đích Attack-move của lính đang chọn (thay cho dấu + xanh của lệnh đi) và con trỏ chữ thập đỏ khi đang chờ chọn điểm; dòng gợi ý phím trong HUD; chế độ debug (`\`) thêm `Hold`/`AM` sau tên trạng thái.

## Bước 3 — Di chuyển & pathfinding ✅ (7/7)

- [x] Làm mượt đường đi (line-of-sight / string-pulling): `Pathfinder::Smooth` bỏ các mốc thừa, mỗi đoạn thẳng được kiểm tra bằng hitbox phình 10% (`kPathClearance`) nên đi sát tường không bị vẽ đè lên tường. Khi đang đi, lính cũng bỏ qua mốc trung gian nếu đã nhìn thấy mốc kế tiếp
- [x] Gán slot đội hình theo khoảng cách gần nhất: `AssignSlotsByDistance` (Hungarian, tổng quãng đường nhỏ nhất nên **không có hai đường đi cắt nhau**; nhóm đông hơn 80 lính dùng cách tham lam cho nhẹ)
- [x] Tính lại đường khi bị chặn: bị tường chặn hẳn vài tick, hoặc gần như đứng yên 1,5 giây, thì xin đường mới tới `Unit::moveGoal` (đích cuối của lệnh đi). Thử 2 lần vẫn kẹt thì bỏ lệnh; kẹt trong bán kính 2 ô quanh đích thì coi như đã tới
- [x] Đi tới điểm gần đích nhất với tới được: A\* nhớ ô đã đóng gần điểm bấm nhất (`PathResult::partial`). Đích trên nước/đá được dời tới ô đi được gần nhất **không còn giới hạn 5 ô**. Bấm lên đảo/giữa hồ thì lính đi tới bờ gần nhất rồi dừng
- [x] Tránh nhau cho lính đang di chuyển (`game/Movement.cpp`): hai lính cùng đi nhường nhau một nửa; bên nào đang tiến về phía bên kia thì né sang phải của mình. Đối đầu trong lối hẹp thì bên id nhỏ được ưu tiên, bên kia bị đẩy lùi. Mọi cú đẩy đều kiểm tra tường. Lính đi cũng kiểm tra tường từng bước (trượt dọc tường khi chạm)
- [x] Tối ưu A\*: tái dùng bộ nhớ (dấu thời gian, không cấp phát `rows*cols` mỗi lần), heuristic octile, **hàng đợi yêu cầu đường đi** có ngân sách mỗi tick (`game/PathService.*`), và **tìm đường chung cho nhóm ≥ 10 lính** (`FlowField`: một lần Dijkstra ngược từ đích, dừng sớm khi mọi lính đã được nối, rồi mỗi lính lần theo cây). _Đây là trường chi phí dùng tạm cho một lệnh, chưa phải flow field giữ lâu dài để lính tra mỗi tick_
- [x] Thay `path.erase(begin)` bằng `Path` (`Path.h`: vector + chỉ số đầu, `pop_front` O(1))

> Phụ trợ: `Maps/Map02.txt` (sông có bãi cạn rộng và cầu hẹp 1 ô, sống đá có khe, bậc thang đá chéo, hồ có đảo tách biệt, khu địch có tường bao) để xem bằng mắt; `tests/PathingTests.cpp` (xem mục "Đã làm thêm"). Debug (`\`) hiện thêm số yêu cầu đường đang chờ (`PathQ`).

## Bước 4 — Kinh tế & xây dựng ✅ (6/6)

- [x] Tài nguyên, node mỏ trên map: `ResourceNode` (`entity/ResourceNode.*`) là mỏ vàng chiếm 2x2 ô (`kMineTiles`), vẽ nhỏ dần và hiện số còn lại, cạn thì bị gỡ (`RemoveDepletedResources`). Khai báo trong file map: `@mine <cột> <hàng> [lượng]` (ô góc trên-trái), `@gold <số>` (vàng ban đầu của phe ta), `@building <Loại> <cột> <hàng> [player|enemy]` (công trình dựng sẵn, đã xong). Chỉ có một loại tài nguyên (vàng); mỗi phe một kho (`GameState::Gold(team)`)
- [x] Thợ khai thác, kho chứa: thợ là `Unit` có `BuildSpeed > 0` (loại `Worker` trong `Data/units.txt`), việc đang làm nằm ở `Unit::job` (`WorkJob`), chạy bởi `game/Work.*`: đi tới mỏ → đào đủ `carry` → mang về kho (`dropoff = 1`) gần nhất → nộp → lặp lại. Mỏ cạn thì tự tìm mỏ khác trong 8 ô (`kAutoMineRadius`); chưa có kho thì đứng chờ, giữ hàng; không tới được chỗ làm việc 3 lần liên tiếp thì bỏ việc. Đi lại dùng nguyên hàng đợi tìm đường, tránh nhau và phát hiện kẹt của lính. Nhiều thợ chia nhau các ô kề mỏ (đo: 12 thợ trên một mỏ vẫn giữ ~80% thu nhập mỗi thợ so với 1 thợ)
- [x] Công trình có footprint chiếm ô và chặn pathfinding: `TileMap::occupied` là lớp "ô bị chiếm" phủ lên địa hình, và `IsWalkableTile` đọc lớp này, nên A\*, FlowField, tầm nhìn, `CanBoxStandAt` và va chạm đều tự coi công trình/mỏ là vật cản mà **không phải sửa từng nơi**. Lớp này chỉ bị thay đổi trong `GameState::AddBuilding/AddResource/RemoveBuilding/RemoveResource`. Đặt móng (`PlaceBuilding`, `game/Construction.*`) trừ vàng, đẩy lính phe ta đang đứng trong vùng ra chỗ trống gần nhất, và tính lại đường cho lính đang đi mà đường cắt qua công trình mới (`ReplanPathsCrossing`). Lính ĐỊCH đứng trong vùng thì chặn việc đặt. Công trình có kích thước/giá/thời gian xây/slot cấp/kho/danh sách đơn vị huấn luyện trong `Data/buildings.txt` (`entity/BuildingType.*`); công trình xây dở có máu tăng dần, thợ xây theo `BuildSpeed` (nhiều thợ thì nhanh hơn), hủy xây dở hoàn 75%
- [x] Chế độ đặt nhà (ô xanh/đỏ báo vị trí hợp lệ): `B` vào chế độ (cần đang chọn thợ), `1`–`9` chọn loại, bóng mờ bám lưới ô và theo chuột, từng ô xanh nếu xây được / đỏ nếu không, hiện lý do nếu không đặt được (nước/đá, đè vật khác, địch chặn, thiếu vàng). Chuột trái đặt (mọi thợ đang chọn đi xây), chuột phải/`Esc` thoát. Logic nằm ở `game/Commands.*`, tách khỏi SDL nên test được; `main.cpp` chỉ đổi phím/chuột thành lời gọi
- [x] Hàng đợi sản xuất: `EnqueueUnit` (`game/Production.*`) trừ vàng và giữ chỗ slot quân ngay khi xếp hàng, tối đa 5 đơn vị/công trình, hủy thì hoàn đủ. Hết giờ huấn luyện (`traintime`) thì đơn vị ra ở một ô trống quanh công trình (chưa có chỗ thì chờ), rồi đi tới điểm tập kết (chuột phải khi đang chọn công trình); điểm tập kết đặt lên mỏ thì thợ mới ra tự đi đào. Phím số khi đang chọn công trình đã xong huấn luyện đơn vị thứ n; `Backspace` hủy đơn vị cuối hàng đợi, `Delete` hủy công trình xây dở
- [x] Dùng `Cost`, `Supply`, `BuildSpeed`: `Cost` (đơn vị và công trình, đọc từ `Data/*.txt`) được trừ khi xếp hàng / đặt móng; `Supply` là slot quân: tổng slot đơn vị còn sống và đơn vị đang trong hàng đợi không được vượt tổng slot các công trình ĐÃ XÂY XONG cấp (`SupplyUsed/SupplyCap`, `game/Economy.*`; quân có sẵn từ map vượt giới hạn thì vẫn ở đó); `BuildSpeed` (% so với 100) là tốc độ đào và xây của thợ

> Điều khiển mới: chuột phải tùy thứ nằm dưới con trỏ (`IssueSmartOrder`): kẻ địch → đánh; mỏ → thợ đi đào; móng xây dở → thợ đi xây; kho → thợ đang mang hàng đi nộp; mặt đất → đi theo đội hình. Chọn công trình bằng khung chọn khi khung không trúng lính nào. Thử bằng `Maps/Map03.txt` (căn cứ có sẵn Townhall + 4 thợ + 4 lính, 3 mỏ vàng, sông có cầu, 3 địch).
> Luật thua đổi nhẹ: mất hết lính VÀ không còn công trình đã xong nào huấn luyện được quân thì mới thua (map cũ không có công trình nên không đổi). Thắng vẫn là diệt hết lính địch.

## Bước 5 — Giao diện & tầm nhìn ⬜ (0/8)

- [ ] HUD đầy đủ: tài nguyên, bảng thông tin unit, nút lệnh — _hiện có HUD tối thiểu vẽ bằng debug font: đếm quân còn lại, banner thắng/thua, thanh vàng + slot quân, và bảng gợi ý phím theo thứ đang chọn (xây, huấn luyện, hàng đợi, điểm tập kết, thông báo lỗi). Chưa có bảng thông tin unit và nút bấm bằng chuột_
- [ ] Ctrl+số lưu/gọi nhóm
- [ ] Shift+click thêm vào vùng chọn
- [ ] Double-click chọn cùng loại — _`Unit::typeId` đã có sẵn để so loại_
- [ ] Minimap
- [ ] Thông báo bị tấn công
- [ ] Fog of war — _`Vision`, `Detection` đã khai báo nhưng chưa dùng_
- [ ] Tileset thật + autotile ở rìa cỏ/nước (hiện vẽ ô màu phẳng)

## Bước 6 — AI, luật chơi & đóng gói 🟡 (3/11)

- [ ] AI địch: build order đơn giản — _hạ tầng đã sẵn sàng và dùng chung hai phe: vàng/slot quân theo `Team`, `PlaceBuilding`, `EnqueueUnit`, `OrderGather` đều nhận phe, không gắn với người chơi_
- [ ] AI địch: đợt tấn công theo timer
- [x] AI địch: phòng thủ khi bị đánh (tự phát hiện, đánh trả, bỏ cuộc khi bị kéo quá xa, về chỗ cũ)
- [x] Điều kiện thắng/thua + màn hình kết thúc (banner VICTORY/DEFEAT, **R** chơi lại, **Esc** về menu)
- [ ] Tạm dừng
- [ ] Chọn tốc độ game — _nay làm được bằng cách nhân `frameDt` trước khi dồn vào bộ tích lũy tick_
- [ ] Âm thanh (SDL3 audio)
- [ ] Save/load
- [ ] Cài đặt
- [x] Map có điểm xuất phát, kẻ địch và loại đơn vị (`@spawn`, `@enemy`, `@target` là tên cũ vẫn dùng được)
- [ ] Map có header đầy đủ: tên, số người chơi, mỏ tài nguyên — _mỏ (`@mine`), vàng (`@gold`) và công trình (`@building`) đã có; còn thiếu tên và số người chơi_

---

## Cấu trúc mã nguồn hiện tại

```
main.cpp            vòng đời SDL + nhận sự kiện (258 dòng)
Common.h            Waypoint, EntityId, hằng số chung (kSquareSize, kTickRate, kMineTiles...)
Tile.h  TileMap.*   địa hình, đọc file map, khả năng đi được, lớp "ô bị chiếm" bởi công trình/mỏ
DataParse.h         hàm đọc số/bool chặt chẽ dùng chung cho Data/*.txt và Maps/*.txt
Pathfinder.*        A* trên TileMap + làm mượt đường + tìm điểm gần đích nhất
FlowField.*         tìm đường chung cho cả nhóm (Dijkstra ngược, dừng sớm)
Path.h  PathGrid.h  danh sách mốc lấy ở đầu O(1) · luật đi 8 hướng dùng chung A*/FlowField
Utils.* camera/     tiện ích, camera
entity/             Entity (id, vị trí, HP) · Unit (state machine, lệnh, việc của thợ) · UnitType (đọc Data/units.txt)
                    Building · BuildingType (đọc Data/buildings.txt) · ResourceNode (mỏ) · Footprint (hình chữ nhật theo ô)
                    Animation.h · Team.h
game/               GameState (units theo ID) · World (dựng ván, xóa xác, thắng/thua)
                    Simulation (1 tick cố định) · Ai · Orders · Formation (gán slot) · Selection
                    Movement (đi + va chạm) · PathService/PathRequest (hàng đợi tìm đường)
                    Economy (vàng, slot quân) · Construction (đặt/hủy công trình, đẩy lính, tính lại đường)
                    Production (hàng đợi sản xuất, điểm tập kết) · Work (thợ: đào, nộp kho, xây)
                    Commands (chế độ đặt nhà, chế độ chờ chọn điểm Attack-move, phím tắt B/S/H/A...; không phụ thuộc SDL)
                    Game (vòng bước cố định + nội suy) · Render
ui/Menu.*           màn chọn map
tests/              PathingTests.cpp · AiTests.cpp · StressTest.cpp · EconomyTests.cpp · CombatTests.cpp (cmake -DMINIRTS_BUILD_TESTS=ON)
Data/units.txt      chỉ số các loại đơn vị      Data/buildings.txt   chỉ số các loại công trình
Maps/*.txt          bản đồ (Map03.txt: thử kinh tế)
```

## Đã làm thêm ngoài kế hoạch gốc

- Bộ não tự chọn mục tiêu **dùng chung cho cả hai phe** (`AutoAcquireTarget`): kẻ địch do AI điều khiển, lính phe ta tự vệ khi đứng yên mà không phá lệnh đi của người chơi
- Ghi nhớ kẻ vừa đánh mình (`lastAttackerId`), tự hết hạn sau 4 giây
- Số lính phe ta lấy theo số dòng `@spawn` trong map (không còn cố định 6)
- Nháy trắng khi trúng đòn, nháy sáng ở khung trúng đòn
- **Bộ nhớ "mục tiêu không với tới"**: khi biết không có đường lại gần một mục tiêu, bộ tự chọn mục tiêu bỏ qua nó 4 giây (`kUnreachableMemory`) thay vì chọn lại rồi xin đường vô ích mỗi 0,25 giây (đo được: 243 → 18 lần xin đường trong 20 giây)
- **Bộ kiểm thử không cần cửa sổ** `tests/PathingTests.cpp` (147 kiểm tra): so A\* với đáp án chuẩn trên bản đồ ngẫu nhiên, làm mượt, đường gần đích nhất, gán slot (đối chiếu vét cạn), FlowField, các kịch bản mô phỏng (qua tường, hai đoàn ngược chiều, nút cổ chai, bị chặn, đổi lệnh, hàng đợi), 150 ván ngẫu nhiên kiểm bất biến (không ai đè lên tường, mọi lệnh đi kết thúc). Chạy: `cmake -S . -B build -DMINIRTS_BUILD_TESTS=ON`, `cmake --build build --target PathingTests`, `ctest --test-dir build`; thêm `--bench` để in số liệu hiệu năng
- **Bộ kiểm thử kinh tế** `tests/EconomyTests.cpp` (121 test, không cần cửa sổ): lớp ô bị chiếm (A\*, FlowField, va chạm), đọc `Data/*.txt` và `@gold/@mine/@building` (kể cả báo lỗi và giữ nguyên bảng cũ khi lỗi), luật đặt móng từng lý do, đẩy lính ra, tính lại đường, thời gian xây theo số thợ và `BuildSpeed`, đào mỏ/nộp kho với **bảo toàn vàng** (đào = nộp + đang mang), mỏ cạn, mỏ không với tới, không có kho, hàng đợi sản xuất (vàng, slot, đầy, kẹt chỗ ra quân, tập kết), lệnh chuột phải, chế độ đặt nhà, phím tắt, luật thắng/thua, mô phỏng xác định (cùng kịch bản → cùng kết quả, kể cả khi xen ván khác), và stress ngẫu nhiên (lệnh bừa trên bản đồ bừa, kiểm: không ai trong tường, ô bị chiếm khớp công trình/mỏ, ID duy nhất, vàng không âm, hàng đợi hợp lệ, vàng bảo toàn). Đã chạy 6.000 ván stress (hơn 207.000 lệnh, 17.677 công trình được đặt) không vi phạm. Số ván khi chạy: biến môi trường `ECONOMY_STRESS_SCENARIOS` (mặc định 60). Độ mạnh của test đã được kiểm bằng cách cố ý chèn 43 lỗi vào code chính (bỏ trừ vàng, bỏ đẩy lính, bỏ tính lại đường, nộp nhầm kho địch...): cả 43 đều bị test bắt
- **Bộ kiểm thử chiến đấu** `tests/CombatTests.cpp` (79 test, không cần cửa sổ) và 36 test thêm vào `tests/AiTests.cpp` (từ 54 lên 90): `FindFoeInReach` (biên đúng bằng tầm đánh, bỏ qua mục tiêu chỉ định, tầm xa); các nhánh mới của `AutoAcquireTarget` (Hold: không đuổi, bỏ mục tiêu ra khỏi tầm nhưng không cắt đòn đang vung, đánh trả chỉ kẻ trong tầm, lính `aggro = 0`; Attack-move: chọn mục tiêu khi đang đi, đi tiếp sau khi xong / bị kéo quá xa / mục tiêu biến mất, đợi đòn xong mới đi tiếp, không xin đường trùng, về Normal khi tới nơi); `OrderStop/OrderHold/EnterAttackMove` và việc lệnh mới hủy chế độ; `IssueStop/Hold/AttackMoveOrder` (chỉ lính đang chọn, phe ta, còn sống; nhóm nhỏ và nhóm FlowField; thợ mất việc); phím `S/H/A` và chế độ chờ chọn điểm; va chạm của lính Hold; kịch bản mô phỏng (Stop giữa đường / lúc đào mỏ, Hold không đuổi theo nhưng giữ được chốt trước địch tới, Attack-move đánh dọc đường rồi tới đích, địch trên đảo không với tới, nhóm 6 lính thắng 3 địch, nhóm 14 lính qua FlowField); và stress ngẫu nhiên (lệnh bừa trên bản đồ bừa; bất biến: không ai trong tường, lính Hold không bao giờ tự có đường đi/lệnh đi/yêu cầu đường, cờ `attackMoveEngaged` chỉ có khi đang Attack-move, mọi Attack-move đều kết thúc kể cả khi đích không với tới). Test tự kiểm độ phủ của stress (có lính Hold đang đánh, có lính Attack-move đang giao tranh). Đã chạy 300 ván stress dưới ASan/UBSan (~237.000 lính-tick Hold, ~367.000 lính-tick Attack-move) không vi phạm. Số ván: biến môi trường `COMBAT_STRESS_SCENARIOS` (mặc định 40). Độ mạnh của test đã được kiểm bằng cách cố ý chèn 40 lỗi vào code chính (bỏ hủy việc của thợ khi Stop, Hold vẫn dùng tầm phát hiện, Attack-move không đi tiếp, đích đội hình thành điểm bấm, quên thoát chế độ khi vào đặt nhà...): cả 40 đều bị test bắt
- `Maps/Map03.txt`: map thử kinh tế (căn cứ có sẵn, 3 mỏ vàng, sông có cầu 2 ô, 3 lính địch)
- Sửa `CMakeLists.txt`: nhánh `StressTest` đặt nhầm cờ MSVC cho `PathingTests`
- Phím **R** chơi lại ván; **\** bật/tắt debug (tên trạng thái, khung hình, đường nhắm, số tick)

## Giới hạn & nợ kỹ thuật đã biết

1. **Lệnh của người chơi áp dụng ngay khi nhận sự kiện chuột**, chưa xếp hàng theo tick. Cần thêm hàng đợi lệnh nếu sau này làm replay hoặc multiplayer.
2. **Con trỏ `Unit*` chỉ dùng tạm trong một hàm** (từ `FindUnit`, `AddUnit`, `FindEnemyAt`...). Thêm/xóa đơn vị làm chúng mất hiệu lực; cần lưu lâu dài thì lưu `EntityId`.
3. **Va chạm**: lính đứng yên luôn nhường hoàn toàn cho lính đang đi, nên với nhóm đông (từ ~24 lính) một số lính đã vào đúng chỗ bị lính đến sau đẩy lệch khỏi vị trí đội hình (đo trên bản đồ trống: lệch trung bình 7–9 px, tối đa 40–80 px) và không tự quay lại. Thử cho lính đang đi nhường một phần: không cải thiện đáng kể mà làm kẹt nhiều hơn nên giữ nguyên. (Ngoại lệ có chủ ý: lính đang Hold position được tính như lính đang đi, nhường một nửa; lính Hold bị đẩy lệch thì cũng không tự quay lại chốt.) Quét va chạm vẫn O(n²) mỗi tick (đủ cho vài trăm lính; cần lưới băm không gian nếu nhiều hơn). Đã bỏ `std::floor` khi đẩy: không còn lệch dần về góc trên-trái.
4. **Kẻ địch không "gọi đồng bọn"**: chỉ xông vào khi chính nó tới tầm phát hiện. Đánh trả cũng bỏ qua kẻ đứng quá 288px, nên lính tầm xa có thể bắn từ xa mà địch không phản ứng.
5. Chọn quân và bấm chuột dùng **vị trí logic**, lệch tối đa 1 tick (≤ 10px với lính chạy nhanh) so với hình vẽ nội suy.
6. Dưới khoảng **6 FPS**, game chạy chậm lại thay vì bù tick (chặn 5 tick/khung để tránh "vòng xoáy chết").
7. Phím **R** chơi lại ngay giữa ván, không hỏi xác nhận.
8. **Chưa build thử trên SDL3 thật** (kể cả `CMakeLists.txt` mới có thêm tùy chọn test). Kiểm tra bằng SDL giả + AddressSanitizer/UBSan: 147 kiểm tra trong `tests/` đạt, cộng 2.000 ván stress ngẫu nhiên ngoài bộ test (khoảng 49.000 lính: 0 lần đè tường, 0 lệnh chạy mãi không dừng). Hình vẽ tạm và cảm giác điều khiển cần xem bằng mắt khi chạy thật, đặc biệt là `Map02.txt`. Bước 2 được kiểm theo cách tương tự (SDL giả + GoogleTest rút gọn + ASan/UBSan, vì môi trường làm việc không có cmake/SDL3/GoogleTest): `AiTests` 90, `CombatTests` 79, `EconomyTests` 28, `PathingTests` 22 test và `StressTest` đều đạt; `main.cpp`/`ui/Menu.cpp` chỉ được biên dịch kiểm tra, **`CMakeLists.txt` (target `CombatTests` mới thêm) chưa được chạy thử**.
9. **Đường đi chỉ biết địa hình, không biết lính khác.** Lính tránh nhau cục bộ lúc đang đi (đẩy/né), nên hai đoàn ngược chiều qua một khe 1 ô mất lâu hơn bản cũ (12 lính: ~8 giây so với ~4 giây, vì bản cũ cho lính xuyên qua nhau). Chưa có luồng giao thông, chưa có "xếp hàng chờ" có chủ đích.
10. **Mốc trung gian được bỏ qua sớm** (trong 1 hitbox, nếu nhìn thấy mốc kế tiếp) và lính kẹt gần đích thì dừng tại chỗ: vị trí cuối có thể lệch tới ~2 ô so với vị trí đội hình khi đám đông chen chúc. Các hằng số (`kWaypointReach`, `kArriveSlack`, `kStuckWindow`...) nằm đầu `game/Movement.cpp`.
11. **Hàng đợi tìm đường chưa gộp yêu cầu giống nhau** (nhiều lính đuổi cùng một mục tiêu vẫn mỗi lính một lần A\*) và chưa ưu tiên (lệnh của người chơi vẫn xếp cùng hàng với đuổi theo của AI). Ngân sách `kMaxPathRequestsPerTick` / `kPathNodeBudgetPerTick` đặt ở `Common.h`.
12. Cân bằng: 6 lính đánh 3 địch thắng không mất ai (~9 giây); chỉnh trong `Data/units.txt` hoặc thêm dòng `@enemy`.

13. **Công trình chưa bị tấn công được.** Lính không nhắm / đánh công trình hay mỏ, nên công trình của hai phe là bất tử và điều kiện thắng chỉ tính lính địch (công trình địch còn đứng vẫn thắng). `Building` đã có máu/giáp (`TakeDamage` của `Entity`) nên khi làm thì chủ yếu là mở rộng `FindEnemyAt`/`FindNearestFoe`/`UpdateUnit` sang `Building`, rồi gọi `DestroyBuilding` (đã có, hoàn tiền hàng đợi) khi máu về 0.
14. **Lệnh xây/huấn luyện/đặt nhà áp dụng ngay khi nhận sự kiện** (như mục 1), chưa xếp hàng theo tick. Đặt móng còn đẩy lính đi tức thời (dịch tối đa ~5 ô, không có hoạt ảnh tránh ra).
15. **Chỉ một loại tài nguyên (vàng)** và mọi mỏ đều 2x2 (`kMineTiles`); số thợ đào cùng một mỏ không bị giới hạn. Thêm loại tài nguyên thứ hai cần: enum loại, kho vàng thành mảng, `WorkJob` biết loại đang mang.
16. **Hủy công trình xây dở luôn hoàn 75%** bất kể tiến độ; hủy công trình đã xong chưa có (chỉ `DestroyBuilding` dành cho code, dùng khi công trình bị phá). Người chơi chưa thể phá công trình của mình.
17. **Hằng số kinh tế** (`kGatherPerSecond`, `kWorkReach`, `kMaxQueueLength`, `kJobMaxFailures`, `kJobRetryDelay`...) nằm đầu `game/Economy.h`; giá, thời gian, slot nằm ở `Data/*.txt`. Chưa cân bằng theo cảm giác chơi: thợ đào ~155 vàng/phút, Townhall cấp 10 slot nên map thử hết slot sau 2 đơn vị và buộc phải xây House.
18. **Thợ gặp việc không làm được thì lặng lẽ rảnh** (không có đường tới mỏ/công trình sau 3 lần thử, hoặc hết mỏ gần đó): chưa có thông báo/âm thanh nào cho người chơi biết.
19. **Chưa xem bằng mắt bản vẽ mới** (công trình, mỏ, bóng mờ xanh/đỏ, HUD kinh tế, điểm tập kết): `Render.cpp` và `main.cpp` mới chỉ được biên dịch kiểm tra với SDL giả; logic bên dưới thì đã có test. Cần chạy thật `Maps/Map03.txt` để chỉnh màu/kích thước chữ. Cùng ghi chú cho phần vẽ mới của bước 2: ô xanh lam của Hold, dấu (x) đỏ và con trỏ chữ thập của Attack-move, dòng gợi ý `A/S/H` (test chỉ chạy `RenderGame` với renderer rỗng để chắc không lỗi/crash, không kiểm hình).

20. **Giới hạn của Stop / Hold / Attack-move** (bước 2): (a) Attack-move chọn mục tiêu gần nhất trong `AggroRange` (192px), chưa ưu tiên theo loại (lính trước thợ, mối đe dọa trước...) và chưa dùng `Vision`; (b) chưa đánh được công trình (mục 13); (c) lính bị kéo đi đánh giữa đường rồi tiếp tục tới vị trí đội hình **riêng của mình**, không tự dàn lại hàng; (d) Stop không xóa mối thù `lastAttackerId` (4 giây) nên lính vừa bị đánh có thể quay lại đánh trả ngay sau Stop; (e) chưa có xếp hàng lệnh (Shift+lệnh) và chưa có nút bấm cho các lệnh này, chỉ có phím; (f) Attack-move cũng gửi cả thợ đi cùng (thợ `aggro = 0` nên chỉ đi, không đánh, và mất việc đang làm); (g) như mục 1, lệnh áp dụng ngay khi nhận sự kiện phím/chuột.

## Đề xuất thứ tự tiếp theo

1. **Chạy thử trên SDL3 thật** (build, xem `Maps/Map03.txt`: chọn thợ, bấm `B`, đặt Barracks, huấn luyện lính bằng phím số, cho thợ đào mỏ ở xa, đặt nhà chặn đường lính đang đi) và chỉnh các hằng số đi lại + kinh tế theo cảm giác.
2. **Cho lính tấn công công trình** (mục 13): cần để công trình địch có ý nghĩa và để người chơi mất được căn cứ. Rẻ vì `DestroyBuilding`, máu và giáp của công trình đã có.
3. **Bước 1 (sprite thật)** khi đã có art và chốt layout sprite sheet; nên đưa luôn clip animation vào `Data/units.txt`.
4. **Cải thiện nhanh ở bước 5**: Shift+click, Ctrl+số, tạm dừng, nút bấm cho lệnh xây/huấn luyện (hiện toàn bằng phím). Rẻ nhưng cải thiện trải nghiệm nhiều.
5. Sau đó **fog of war và minimap → AI kinh tế (bước 6)**: AI dùng lại `PlaceBuilding`, `EnqueueUnit`, `OrderGather`, `IssueBuildOrder` đã dùng chung hai phe.
