#pragma once
#include <cstddef>
#include <utility>
#include <vector>
#include "Common.h"

// Danh sách điểm mốc còn lại của một đường đi. Lấy mốc ở đầu ra (pop_front) chỉ là tăng chỉ số `head_` nên O(1), thay cho `std::vector::erase(begin())` vốn dịch cả mảng (O(n)) mỗi lần tới một mốc.
// Giữ các tên hàm giống std::vector (empty, front, clear...) để code cũ gần như không phải sửa.
class Path {
public:
    Path() = default;
    explicit Path(std::vector<Waypoint> points) : pts_(std::move(points)) {}

    bool empty() const { return head_ >= pts_.size(); }
    std::size_t size() const { return empty() ? 0 : pts_.size() - head_; }

    // front() và back() chỉ gọi được khi !empty().
    const Waypoint& front() const { return pts_[head_]; }
    const Waypoint& back() const { return pts_.back(); }

    void pop_front() {
        if (empty()) return;
        if (++head_ >= pts_.size()) clear(); // hết mốc: thu mảng về rỗng để chỉ số không trỏ ra ngoài
    }
    void clear() { pts_.clear(); head_ = 0; }
    void assign(std::vector<Waypoint> points) { pts_ = std::move(points); head_ = 0; }

    // Duyệt các mốc còn lại (for (const auto& wp : path)).
    const Waypoint* begin() const { return pts_.data() + head_; }
    const Waypoint* end() const { return pts_.data() + pts_.size(); }

private:
    std::vector<Waypoint> pts_;
    std::size_t head_ = 0;
};
