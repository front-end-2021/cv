# Chọn bản đồ khi khởi động MiniRTS

Khi mở game, MiniRTS hiển thị hộp thoại chọn file của hệ điều hành:

- Chọn một file `.txt` để chơi trên bản đồ đó.
- Chọn `map.txt` để dùng bản đồ mặc định.
- Nhấn **Cancel** để tự động nạp `map.txt` nằm cạnh file thực thi.
- Nếu file được chọn không hợp lệ, game sẽ thử nạp `map.txt` mặc định.

## Định dạng file

Mỗi dòng là một hàng của bản đồ; các số nguyên cách nhau bằng dấu cách.

| Giá trị | Địa hình |
|---|---|
| `0` | Cỏ, có thể di chuyển |
| `1` | Đất, có thể di chuyển |
| `2` | Nước, chặn di chuyển |

Ví dụ:

```text
0 0 0 0 0 0
0 1 1 1 0 0
0 1 2 1 0 0
0 1 1 1 0 0
0 0 0 0 0 0
```

Các điều kiện hợp lệ:

- Bản đồ phải có ít nhất một hàng và một cột.
- Tất cả các hàng phải có cùng số cột.
- Chỉ chấp nhận các giá trị `0`, `1`, `2`.
- Có thể dùng dòng trống và dòng chú thích bắt đầu bằng `#`.

`CMakeLists.txt` tự copy `map.txt` mặc định vào thư mục build cạnh file thực thi.
