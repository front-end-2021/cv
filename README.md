# Mini RTS

| Phím | Chức năng |
|---|---|
| Mũi tên / chuột ở mép cửa sổ | Cuộn camera |
| W A S D | Di chuyển ô vuông vàng |
| Space | Đưa camera về chỗ ô vuông vàng |
| Esc | Thoát |

### Những thay đổi chính mới:
* **`SDL_SetRenderDrawBlendMode` trong `SDL_AppInit`**: Bật chế độ hòa trộn màu (`SDL_BLENDMODE_BLEND`) để ô vuông quét chuột có hiệu ứng nền xanh lá bán trong suốt.
* **Tọa độ thế giới (World Space) cho vùng chọn**: Trong `GameState`, điểm đầu và cuối của vùng quét được lưu bằng tọa độ thế giới (`event->button.x + g.camera.x`). Khi vẽ ở `Render()`, tọa độ này được trừ đi `camX, camY` để hiển thị đúng vị trí trên màn hình.
* **Hỗ trợ cả Click chọn và Kéo chọn**: Trong `Update()`, nếu người dùng chỉ click chuột (không kéo), vùng chọn tự động mở rộng thành `3x3` pixel để vẫn bắt dính đối tượng.
* **Hiển thị trạng thái được chọn**: Cả ô vuông vàng (người chơi) và ô vuông xanh (mục tiêu) đều có thêm một khung viền màu xanh lá sáng bao quanh khi bị quét trúng.

### Các điểm nâng cấp chính vừa thêm vào:
* **Điều kiện ra lệnh (`SDL_BUTTON_RIGHT`)**: Lệnh di chuyển chỉ được kích hoạt khi `g.playerSelected == true`. Tọa độ điểm đến `moveTargetX, moveTargetY` được tính theo tọa độ thế giới (`event->button.x + g.camera.x`) và giới hạn không vượt quá mép bản đồ.
* **Di chuyển mượt và chống rung tại điểm đích**: Trong hàm `Update()`, khi khoảng cách còn lại tới đích nhỏ hơn quãng đường di chuyển trong 1 khung hình (`dist <= stepDist`), ô vuông vàng sẽ được gán thẳng vào tọa độ đích và tắt trạng thái `hasMoveOrder`. Điều này giúp vật thể không bị rung lắc qua lại quanh điểm đến.
* **Phản hồi trực quan (Visual Feedback)**: Khi đang di chuyển theo lệnh chuột, hàm `Render()` sẽ vẽ một đường dẫn màu xanh lá nhạt nối từ tâm ô vuông vàng tới dấu chữ thập (`+`) tại vị trí bạn vừa click chuột phải.
* **Hỗ trợ điều khiển song song**: Nếu bạn bấm các phím `WASD` trong lúc ô vuông vàng đang tự chạy, lệnh di chuyển bằng chuột sẽ tự động hủy để nhường quyền điều khiển cho bàn phím.
