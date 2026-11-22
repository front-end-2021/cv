Dự án **Mini RTS** hiện đã có một nền tảng rất sạch sẽ và rõ ràng: CMake + SDL3, menu chọn map `.txt`, parse `@spawn / @enemy / tilemap`, camera cuộn phím + mép màn hình, quét chuột chọn hàng loạt, đội hình di chuyển cơ bản, tìm đường A* 8 hướng, state machine (`Idle`/`Walk`/`Attack`/`Dead`), AI tự vệ/đuổi bắt/quay về `home`, và điều kiện thắng/thua.   Dưới đây là các bước tiếp theo được sắp xếp theo mức độ ưu tiên để hoàn thiện một game **RTS 2D** hoàn chỉnh, đồng thời chỉ ra một vài điểm rủi ro cần xử lý sớm trong code hiện tại.

1. **Sửa các điểm rủi ro & hoàn thiện core logic hiện tại**

    Trước khi mở rộng tính năng mới, nên xử lý các chỗ dễ phát sinh lỗi khi quy mô game tăng lên:
    + **Thay con trỏ thô (`iSelect*`) bằng ID / index an toàn**: Hiện `Unit` giữ `attackTarget` và `lastAttacker` dạng con trỏ tới phần tử trong `std::vector<Unit>`. Nếu sau này có cơ chế sinh lính mới, xóa xác hẳn khỏi vector hoặc sắp xếp lại, con trỏ này sẽ thành dangling pointer. Nên gán mỗi đơn vị một `uint32_t id` (hoặc tra cứu qua bảng/ID) kèm hàm `FindUnitById(...)`.
    + **Cải thiện tách va chạm & kẹt đường**: `ResolveUnitCollisions` hiện chỉ đẩy đơn vị đứng yên khi đơn vị kia đang có `path`, và `Pathfinder::FindPath` tìm đường theo từng ô lưới chứ chưa tính đến các đơn vị/chướng ngại động đang chắn đường. Khi nhiều lính cùng đi qua điểm hẹp, dễ xảy ra chồng lấn hoặc đứng khựng. Có thể bổ sung tách va chạm qua lại mức nhẹ giữa 2 unit đang đứng/đi và cơ chế *repath* nếu bị kẹt quá lâu.
    + **Kiểm soát di chuyển sau khi ván đấu kết thúc**: Khi `MatchResult` chuyển sang `Victory` hoặc `Defeat`, cần cân nhắc khóa lệnh điều khiển/tấn công thêm để trải nghiệm kết ván rõ ràng hơn.
1. **Nâng cấp đồ họa 2D & Animation (thay hình khối tạm)**
    Code hiện vẽ tile màu phẳng và unit bằng hình vuông + "mắt" + vệt chém. Để lên đồ họa 2D thực thụ:   
    + **Nạp Texture & Sprite Sheet (`SDL_Texture`)**: Tách phần quản lý tài nguyên (texture cache, hủy texture đúng lúc). Trong `Unit::Render`, thay thân vẽ hình chữ nhật bằng `SDL_RenderTexture` / `SDL_RenderTextureRotated` (dùng `SDL_FLIP_HORIZONTAL` cho hướng `Left`/`Right` như bạn đã ghi chú).
    * **Tilemap có sprite/autotiling**: Thay `SDL_RenderFillRect` theo `enum class Tile` bằng tile sprite (hoặc biến thể cỏ/đất/nước/đá, viền bờ nước).
    * **Hiệu ứng 2D (VFX) & Âm thanh (SFX)**: Thêm hiệu ứng đòn đánh/chém/nổ/chết độc lập với unit (để vẫn chạy khi unit chết) và tích hợp âm thanh (có thể dùng `SDL_mixer` hoặc tự trộn âm cơ bản với SDL3) cho tiếng chọn lính, ra lệnh, chém, trúng đòn, thắng/thua.

1. **Xây dựng chiều sâu gameplay RTS cốt lõi**
    Một game RTS thường cần nhiều hơn việc điều khiển một nhóm lính đánh nhau:
    + **Phân loại đơn vị & công trình (`UnitType` / `Building`)**: Hiện chỉ số đang gắn theo Team (`GetStats(Team)`). Hãy tách sang `UnitType` (ví dụ: bộ binh cận chiến, lính đánh xa/cung thủ, trinh sát) và thêm công trình (nhà chính/Command Center, nhà lính, tháp phòng thủ) kế thừa hoặc mở rộng từ `iSelect`.
    + **Tài nguyên, khai thác & sản xuất**: Bổ sung tài nguyên (ví dụ: Vàng/Gỗ/Khoáng), mỏ tài nguyên trên map, lính công nhân (`BuildSpeed` đã có sẵn trong `iSelect`!) để thu thập tài nguyên, xây nhà và huấn luyện thêm quân (`Cost` và `Supply` cũng đã có sẵn khung trong iSelect).
    + **Sương mù chiến trường (Fog of War)**: Trường `Vision` đã có sẵn trong `iSelect`. Có thể tạo lưới tầm nhìn theo từng phe (chưa khám phá / đã khám phá nhưng không thấy hiện tại / đang nhìn thấy) để ẩn kẻ địch nằm ngoài tầm nhìn và làm map RTS có tính chiến thuật hơn.

1. **Mở rộng điều khiển RTS & giao diện (UI/HUD)**
    + **Thao tác điều khiển quen thuộc của RTS:**
        + Double-click chọn tất cả lính cùng loại trong màn hình.
        + Phím tắt điều khiển: `A` (Attack-Move — vừa đi vừa đánh trên đường), `S` hoặc `H` (Stop / Hold position), `Shift + Click` xếp hàng lệnh (queue orders), và phím số `1–9` gán nhóm (`Ctrl + số` lưu, bấm `số` để chọn).

    + **HUD & Minimap:** Hiện HUD mới hiển thị số quân còn lại và bảng `VICTORY`/`DEFEAT`. Nên thêm **Minimap** ở góc màn hình (hiển thị địa hình, vị trí quân ta/địch, khung camera và cho phép click/kéo để di chuyển camera nhanh), cùng khung thông tin/nút lệnh của đơn vị hoặc công trình đang chọn.

1. **Dữ liệu ngoài & công cụ hỗ trợ thiết kế màn chơi**
    + **Đưa chỉ số sang file cấu hình (JSON/CSV/INI):** Thay vì hardcode `UnitStats` và `AnimClip` trong code, đưa ra file dữ liệu để cân bằng game nhanh mà không cần biên dịch lại.
    + **Mở rộng định dạng map `.txt`:** Hỗ trợ thêm loại đơn vị/tài nguyên/công trình trong file map (ví dụ `@enemy` `@archer ...`, `@resource ...`), đồng thời kiểm tra hợp lệ map chặt chẽ hơn.

