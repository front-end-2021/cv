#pragma once
#include <iosfwd>
#include <string>
#include <vector>
#include "Team.h"

// Chỉ số của một LOẠI đơn vị. Đọc từ Data/units.txt, không nằm trong code.
struct UnitType {
    std::string name;
    int   hpMax = 100;
    int   armor = 1;
    int   shield = 0;
    int   damage = 10;
    float cooldown = 1.0f;     // giây giữa hai đòn
    float range = 20.0f;       // khoảng hở tối đa giữa hai cạnh hitbox khi đánh (pixel)
    float moveSpeed = 300.0f;  // pixel/giây
    float aggroRange = 192.0f; // bán kính tự động phát hiện kẻ địch khi đứng yên (pixel)
    float vision = 320.0f;     // tầm nhìn (pixel)
};

// Loại đơn vị mặc định khi file map không ghi rõ (@spawn / @enemy không có tên loại).
inline const char* DefaultTypeName(Team t) {
    return t == Team::Enemy ? "Grunt" : "Soldier";
}

// Bảng các loại đơn vị.
//
// Định dạng file (xem Data/units.txt):
//   # ghi chú
//   [TênLoại]            <- mở một loại mới (không chứa khoảng trắng, không trùng nhau)
//   hp = 100             <- khóa = giá trị; các khóa: hp armor shield damage cooldown range speed aggro vision
//   ...
// Khóa nào không ghi thì lấy giá trị mặc định trong struct UnitType.
class UnitTypeTable {
public:
    // Đọc từ file / luồng. Thất bại thì bảng cũ giữ nguyên và `error` (nếu có) cho biết lý do kèm số dòng.
    bool LoadFromFile(const std::string& path, std::string* error = nullptr);
    bool LoadFromStream(std::istream& in, std::string* error = nullptr);
    // Bảng dự phòng khi không có file (khớp với Data/units.txt mặc định).
    void LoadBuiltInDefaults();

    bool Empty() const { return types_.empty(); }
    int Count() const { return static_cast<int>(types_.size()); }
    const UnitType& Get(int index) const { return types_[static_cast<size_t>(index)]; }
    const std::vector<UnitType>& All() const { return types_; }
    // Chỉ số của loại tên `name`, -1 nếu không có.
    int IndexOf(const std::string& name) const;
    // Loại mặc định của phe (theo DefaultTypeName); nếu thiếu thì loại đầu tiên; -1 nếu bảng rỗng.
    int DefaultIndexFor(Team team) const;

private:
    std::vector<UnitType> types_;
};
