# Mini RTS

Game chiến thuật thời gian thực (RTS) 2D nhìn từ trên xuống, viết bằng **C++17** và **SDL3**. Dự án dùng để học và thử nghiệm các thành phần cốt lõi của một game RTS: tìm đường cho cả đội quân, chiến đấu, kinh tế (đào vàng, xây nhà, huấn luyện quân) và giao diện điều khiển bằng chuột + phím.

> Tiến độ chi tiết, các giới hạn đã biết và đề xuất bước tiếp theo nằm trong [`ROADMAP.md`](ROADMAP.md).

## Tính năng

- **Bản đồ dạng ô** (cỏ, đất, nước, đá) đọc từ file `.txt`; camera cuộn tự do bằng phím mũi tên hoặc chuột ở mép cửa sổ.
- **Tìm đường**: A\* có làm mượt đường, tìm điểm gần đích nhất khi đích không với tới, FlowField dùng chung cho nhóm đông (từ 10 lính), hàng đợi yêu cầu đường có ngân sách mỗi tick, đội hình theo slot, tránh va chạm và phát hiện kẹt.
- **Chiến đấu**: máu / giáp / khiên / tầm đánh / hồi chiêu theo từng loại đơn vị; tự chọn mục tiêu cho cả hai phe; lệnh **Stop**, **Hold position**, **Attack-move**.
- **Kinh tế & xây dựng**: mỏ vàng, thợ đào và nộp về kho, đặt nhà bằng bóng mờ xanh/đỏ, công trình chặn đường đi, thợ xây (nhiều thợ thì nhanh hơn), hàng đợi huấn luyện, giới hạn slot quân (supply).
- **Giao diện**: HUD có bảng thông tin, nút lệnh bấm bằng chuột, thanh nhóm điều khiển; chọn quân bằng khung kéo, **Shift+click** để thêm/bỏ khỏi vùng chọn, **Ctrl+số** để lưu/gọi nhóm.
- **Mô phỏng tick cố định** (30 tick/giây) tách khỏi tốc độ vẽ, có nội suy khi vẽ.
- **Dữ liệu ngoài code**: chỉ số đơn vị và công trình nằm trong `Data/*.txt`, bản đồ nằm trong `Maps/*.txt`.
- **Bộ kiểm thử không cần cửa sổ** (GoogleTest) cho tìm đường, AI, chiến đấu, kinh tế và giao diện.

## Yêu cầu

- **CMake** 3.16 trở lên
- Trình biên dịch hỗ trợ **C++17** (dự án đã cấu hình sẵn cờ cho MSVC; trình biên dịch khác dùng cờ mặc định)
- **Git** và kết nối internet ở lần cấu hình đầu tiên: CMake tự tải
  - SDL3 (`release-3.2.0`, build tĩnh nên không cần `SDL3.dll` cạnh file `.exe`)
  - GoogleTest (`v1.18.0`, chỉ khi bật bộ kiểm thử, mặc định là bật)

## Build và chạy
1. Tạo và build thư mục chỉ chứa Game:
    ```
    cmake -S . -B build/game -DMINIRTS_BUILD_TESTS=OFF -G Ninja -DCMAKE_BUILD_TYPE=Release
    cmake --build build/game
    ```
2.  Tạo và build thư mục Debug chuyên để chạy Test:
    ```
    cmake -S . -B build/test-debug -DMINIRTS_BUILD_TESTS=ON -G Ninja -DCMAKE_BUILD_TYPE=Debug
    cmake --build build/test-debug --target AiTests CombatTests EconomyTests PathingTests StressTest UiTests
    ctest --test-dir build/test-debug --output-on-failure
    ```
3. 

```bash
# Cấu hình (lần đầu sẽ tải SDL3 và GoogleTest)
cmake -S . -B build

# Biên dịch
cmake --build build --config Release

# Chạy
./build/MiniRTS                  # Linux / macOS (generator một cấu hình)
build\Release\MiniRTS.exe        # Windows với Visual Studio
```

Muốn bỏ qua bộ kiểm thử (khỏi tải GoogleTest, build nhanh hơn):

```bash
cmake -S . -B build -DMINIRTS_BUILD_TESTS=OFF
```

**Lưu ý về `Maps/` và `Data/`**: game tìm hai thư mục này **cạnh file thực thi**. CMake copy chúng vào thư mục build (`build/`) lúc cấu hình. Với Visual Studio, file `.exe` nằm trong `build/Debug/` hoặc `build/Release/`, nên nếu game báo không thấy map hoặc dữ liệu thì copy `Maps/` và `Data/` vào cạnh file `.exe`. Sửa map hoặc dữ liệu trong thư mục gốc xong thì chạy lại bước cấu hình (hoặc sửa thẳng bản copy) để game thấy thay đổi.

## Cách chơi

Mở game, chọn một map trong danh sách (click rồi bấm **START**, hoặc `↑`/`↓` + `Enter`). Đặt thêm file `.txt` vào thư mục `Maps/` rồi bấm `R` ở màn chọn map để làm mới danh sách.

- **Thắng**: diệt hết lính địch.
- **Thua**: mất hết lính **và** không còn công trình đã xây xong nào huấn luyện được quân.

**Thử nhanh bằng `Maps/Map03.txt`** (căn cứ có sẵn Townhall, 4 thợ, 4 lính, 3 mỏ vàng, sông có cầu, 3 lính địch ở phía đông):

1. Kéo khung chọn các thợ, bấm nút **Build** (hoặc phím `B`), chọn **Barracks** và bấm chuột trái để đặt móng. Thợ tự đi xây.
2. Chọn thợ rồi bấm chuột phải lên mỏ vàng để đi đào.
3. Chọn Barracks đã xây xong, bấm nút **Soldier** (hoặc phím `1`) để huấn luyện lính.
4. Townhall chỉ cấp 10 slot quân nên sẽ hết slot sau vài đơn vị: xây thêm **House** để có thêm slot.
5. Gom lính, bấm `A` rồi bấm chuột trái vào khu địch (Attack-move).

### Điều khiển

**Camera**

| Thao tác | Tác dụng |
|---|---|
| `←` `↑` `→` `↓` | Cuộn camera |
| Chuột ở mép cửa sổ | Cuộn camera (khi chuột đang bị khóa trong cửa sổ game) |
| Giữ `Space` | Đưa camera tới vùng chọn |

**Chọn quân**

| Thao tác | Tác dụng |
|---|---|
| Kéo chuột trái | Chọn lính phe ta trong khung; nếu khung không trúng lính nào thì chọn công trình |
| Bấm chuột trái | Chọn thứ dưới con trỏ |
| `Shift` + kéo | Thêm vào vùng chọn hiện tại |
| `Shift` + bấm | Đảo chọn thứ dưới con trỏ (đang chọn thì bỏ, chưa chọn thì thêm) |
| `Ctrl` + `1`…`9` | Lưu các lính đang chọn thành nhóm |
| `1`…`9` | Gọi nhóm (xem lưu ý bên dưới) |

**Ra lệnh**

| Thao tác | Tác dụng |
|---|---|
| Chuột phải | Tùy thứ dưới con trỏ: kẻ địch → tấn công; mỏ → thợ đi đào; móng xây dở → thợ đi xây; kho → thợ đang mang hàng đi nộp; mặt đất → đi theo đội hình; đang chọn công trình → đặt điểm tập kết |
| `a`, rồi chuột trái | Attack-move: đi tới điểm đã bấm và đánh mọi kẻ địch gặp trên đường |
| `s` | Stop: dừng và bỏ lệnh hiện tại |
| `h` | Hold position: đứng yên, chỉ đánh kẻ trong tầm |
| `b` | Vào chế độ đặt nhà (cần đang chọn thợ) |
| `n`,`a`,`b` khi đặt nhà | Chọn loại công trình Home, Horse, Barrack |
| Chuột trái khi đặt nhà | Đặt móng tại bóng mờ (mọi thợ đang chọn đi xây) |
| `1`…`9` khi chọn công trình huấn luyện được | Huấn luyện đơn vị thứ n |
| `Backspace` | Hủy đơn vị cuối hàng đợi |
| `Delete` | Hủy công trình đang xây dở (hoàn 75% vàng) |
| `Esc` | Thoát chế độ đặt nhà / Attack-move; rồi thả chuột; rồi về màn chọn map (ở màn chọn map: thoát game) |

**Khác**

| Phím | Tác dụng |
|---|---|
| `R` | Chơi lại ván hiện tại (không hỏi xác nhận) |
| `\` | Bật/tắt thông tin gỡ lỗi |

**Lưu ý về phím số**: khi đang chọn công trình huấn luyện được, các số từ `1` đến số loại đơn vị nó huấn luyện được dùng để huấn luyện (Townhall có 1 loại nên phím `1` huấn luyện thợ, không gọi nhóm 1). Muốn gọi nhóm trùng số đó thì bấm nút nhóm trên thanh nhóm của HUD, hoặc bỏ chọn công trình trước. Các trường hợp còn lại, số gọi nhóm.

### HUD

- **Trên cùng bên trái**: vàng và slot quân (chữ đỏ khi đầy). Bên phải: số quân còn lại của hai phe. Ở giữa: dòng báo chế độ đang bật (đặt nhà, Attack-move).
- **Bảng thông tin (đáy, bên trái)**: một lính hiện chỉ số và trạng thái; nhiều lính hiện lưới ô nhỏ có thanh máu (bấm một ô để chọn riêng lính đó, `Shift` + bấm để bỏ lính đó khỏi vùng chọn); công trình hiện máu, tiến độ xây và hàng đợi huấn luyện (bấm một ô hàng đợi để hủy đúng đơn vị đó).
- **Thẻ nút lệnh (đáy, bên phải)**: nút đổi theo thứ đang chọn (Attack / Stop / Hold / Build cho lính; Train / Cancel cho công trình; danh sách công trình khi đặt nhà). Nút mờ nghĩa là hiện chưa làm được (thiếu vàng, hết slot quân, hàng đợi đầy) nhưng vẫn bấm được để xem lý do.
- **Thanh nhóm (ngay trên bảng đáy)**: các nhóm đã lưu dạng `số:số lính`, bấm để gọi nhóm; nhóm đang được chọn viền vàng.

Bấm chuột lên HUD không tác động lên thế giới nằm bên dưới.

## Định dạng dữ liệu

Dòng bắt đầu bằng `#` là chú thích. Chú thích ở đầu mỗi file liệt kê đầy đủ khóa và giá trị hợp lệ; dưới đây là tóm tắt.

### `Data/units.txt`: các loại đơn vị

Mỗi loại bắt đầu bằng `[Ten]` (không chứa khoảng trắng), theo sau là các dòng `khoa = gia_tri`. Khóa nào không ghi thì dùng giá trị mặc định.

| Khóa | Ý nghĩa |
|---|---|
| `hp`, `armor`, `shield` | Máu tối đa, giáp (trừ vào mỗi đòn), khiên (mất trước máu) |
| `damage`, `cooldown`, `range` | Sát thương mỗi đòn, giây giữa hai đòn, tầm đánh (pixel) |
| `speed`, `aggro`, `vision` | Tốc độ (pixel/giây), bán kính tự phát hiện địch khi đứng yên, tầm nhìn |
| `cost`, `supply`, `traintime` | Vàng khi xếp hàng huấn luyện, slot quân chiếm giữ, giây huấn luyện |
| `buildspeed`, `carry` | Chỉ dành cho thợ: tốc độ làm việc theo % (> 0 nghĩa là thợ), lượng vàng mang mỗi chuyến |

Có sẵn ba loại: `Soldier`, `Grunt` (địch) và `Worker`.

### `Data/buildings.txt`: các loại công trình

| Khóa | Ý nghĩa |
|---|---|
| `width`, `height` | Số ô chiếm (1..8) |
| `hp`, `armor` | Máu tối đa, giáp |
| `cost`, `buildtime` | Vàng khi đặt móng, giây để một thợ xây xong |
| `supply` | Slot quân cấp thêm khi xây **xong** |
| `dropoff` | `1` = là kho, thợ mang vàng về nộp ở đây |
| `produces` | Các loại đơn vị huấn luyện được (tên trong `units.txt`) |

Có sẵn ba loại: `Townhall`, `House`, `Barracks`. Thứ tự khai báo quyết định phím số khi đặt nhà.

### `Maps/*.txt`: bản đồ

Phần khai báo (các dòng `@...`) rồi tới lưới ô: mỗi dòng một hàng, các số cách nhau bằng dấu cách. `0` cỏ · `1` đất · `2` nước · `3` đá (nước và đá là vật cản).

| Khai báo | Ý nghĩa |
|---|---|
| `@spawn <cột> <hàng> [Loại]` | Điểm xuất phát của một đơn vị phe ta (tọa độ ô: `2.5` là giữa ô số 2). Bỏ trống loại thì là `Soldier` |
| `@enemy <cột> <hàng> [Loại]` | Như trên cho kẻ địch (mặc định `Grunt`) |
| `@gold <số>` | Vàng ban đầu của phe ta |
| `@mine <cột> <hàng> [lượng]` | Mỏ vàng chiếm 2x2 ô; `(cột, hàng)` là ô góc trên-trái (số nguyên) |
| `@building <Loại> <cột> <hàng> [player\|enemy]` | Công trình dựng sẵn đã xây xong, ô góc trên-trái |

Các map đi kèm: `Default.txt` và `Map01.txt` (chiến đấu cơ bản), `Map02.txt` (thử tìm đường: sông có bãi cạn và cầu hẹp, khe đá, hồ có đảo), `Map03.txt` (thử kinh tế và xây dựng).

## Kiểm thử

Bộ kiểm thử dùng GoogleTest, không cần cửa sổ hay SDL thật. Mặc định được build cùng dự án (`MINIRTS_BUILD_TESTS=ON`).

| Target | Nội dung |
|---|---|
| `PathingTests` | A\*, làm mượt, FlowField, gán slot đội hình, kịch bản di chuyển, ván ngẫu nhiên kiểm bất biến (thêm `--bench` để in số liệu hiệu năng) |
| `AiTests` | Tự chọn mục tiêu, các chế độ Hold và Attack-move |
| `CombatTests` | Lệnh Stop / Hold / Attack-move, va chạm, mô phỏng, stress |
| `EconomyTests` | Ô bị chiếm, đặt nhà, xây, đào mỏ và nộp kho (bảo toàn vàng), hàng đợi sản xuất, luật thắng thua, stress |
| `UiTests` | Shift+click, nhóm điều khiển, bố cục và nút bấm của HUD, stress |
| `StressTest` | Nhiều ván mô phỏng ngẫu nhiên (bản đồ có tường, khe hẹp; 1–3 nhóm tới 24 lính), kiểm không lính nào đè lên tường, mọi lệnh đi đều kết thúc |

```bash
cmake --build build                          # build cả game lẫn các target test
ctest --test-dir build --output-on-failure   # chạy tất cả (thêm -C Release với Visual Studio)

# hoặc build và chạy từng bộ
cmake --build build --target UiTests
```

Số ván của các bộ stress chỉnh bằng biến môi trường: `ECONOMY_STRESS_SCENARIOS` (mặc định 60), `COMBAT_STRESS_SCENARIOS` (mặc định 40), `UI_STRESS_SCENARIOS` (mặc định 60). `StressTest` nhận tham số dòng lệnh `StressTest [số_ván=300] [seed]`.

## Cấu trúc mã nguồn

```
main.cpp            vòng đời SDL, nhận sự kiện phím/chuột rồi gọi vào game/
Common.h            hằng số chung (kích thước hitbox, tick, ngân sách tìm đường...)
Tile.h  TileMap.*   địa hình, đọc file map, khả năng đi được, lớp "ô bị chiếm" của công trình/mỏ
Pathfinder.*        A* trên TileMap, làm mượt đường, tìm điểm gần đích nhất
FlowField.*         tìm đường chung cho cả nhóm
camera/             camera cuộn tự do
entity/             Entity, Unit (máy trạng thái, lệnh, việc của thợ), Building, ResourceNode, các bảng loại (đọc Data/*.txt)
game/               GameState, World (dựng ván, thắng/thua), Simulation (1 tick cố định),
                    Ai, Orders, Formation, Movement, PathService,
                    Economy, Construction, Production, Work,
                    Selection (chọn quân, nhóm điều khiển), Commands (phím tắt, chế độ đặt nhà),
                    Hud (bố cục + bấm + vẽ HUD), Game (vòng bước cố định), Render
ui/                 màn chọn map
Data/               chỉ số đơn vị và công trình
Maps/               bản đồ
tests/              các bộ kiểm thử
```

Hai nguyên tắc thiết kế đáng biết khi đọc code:

- **Logic tách khỏi SDL**: phần lớn `game/` (lệnh, chọn quân, bố cục và xử lý bấm của HUD...) không gọi SDL, nên test được mà không cần cửa sổ. `main.cpp` chỉ đổi phím/chuột thành lời gọi hàm.
- **Tham chiếu đơn vị bằng `EntityId`**, không giữ con trỏ lâu dài: thêm/xóa đơn vị làm con trỏ cũ mất hiệu lực. Nhóm điều khiển, vùng chọn cộng thêm và hàng đợi đều lưu ID.

## Giới hạn đã biết

Một số giới hạn quan trọng (danh sách đầy đủ trong mục "Giới hạn & nợ kỹ thuật đã biết" của [`ROADMAP.md`](ROADMAP.md)):

- Lính chưa tấn công được công trình, nên công trình của hai phe là bất tử và điều kiện thắng chỉ tính lính địch.
- Chỉ có một loại tài nguyên (vàng).
- AI địch hiện chỉ phòng thủ (tự phát hiện, đánh trả, bỏ cuộc khi bị kéo quá xa); chưa tự xây dựng hay tấn công theo đợt.
- Đồ họa còn tạm: ô màu phẳng, đơn vị vẽ bằng hình vuông có bóng và "mắt" chỉ hướng, chữ HUD dùng font gỡ lỗi 8px của SDL. Chưa có sprite và tileset thật, âm thanh, minimap, sương mù chiến trường, tạm dừng, lưu/nạp ván.
- Lệnh của người chơi được áp dụng ngay khi nhận sự kiện chuột/phím, chưa xếp hàng theo tick, nên chưa phù hợp để làm replay hoặc nhiều người chơi.

## Thư viện sử dụng

- [SDL3](https://github.com/libsdl-org/SDL) (cửa sổ, đồ họa 2D, nhập liệu), tự tải qua CMake `FetchContent`
- [GoogleTest](https://github.com/google/googletest) (kiểm thử), tự tải khi bật `MINIRTS_BUILD_TESTS`
