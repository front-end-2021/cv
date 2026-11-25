#pragma once
#include <iosfwd>
#include <string>
#include <vector>

class UnitTypeTable;

// Chỉ số của một LOẠI công trình. Đọc từ Data/buildings.txt, không nằm trong code.
struct BuildingType {
    std::string name;
    int   width = 2;            // số ô chiếm theo chiều ngang
    int   height = 2;           // số ô chiếm theo chiều dọc
    int   hpMax = 400;
    int   armor = 1;
    int   cost = 100;           // vàng trả khi đặt móng
    float buildTime = 30.0f;    // giây để MỘT thợ (buildspeed 100) xây xong; nhiều thợ thì nhanh hơn
    int   supply = 0;           // số slot quân công trình cấp thêm khi xây XONG
    bool  dropoff = false;      // true: là kho, thợ mang tài nguyên về nộp ở đây
    std::vector<std::string> produces; // tên các loại đơn vị công trình huấn luyện được (xem Data/units.txt)
};

// Bảng các loại công trình.
//
// Định dạng file (xem Data/buildings.txt): giống Data/units.txt
//   [TênLoại]
//   khóa = giá trị       các khóa: width height hp armor cost buildtime supply dropoff produces
// `produces` là danh sách tên loại đơn vị, cách nhau bằng dấu cách hoặc dấu phẩy.
// Khóa nào không ghi thì lấy giá trị mặc định trong struct BuildingType.
class BuildingTypeTable {
public:
    // Đọc từ file / luồng. Thất bại thì bảng cũ giữ nguyên và `error` (nếu có) cho biết lý do kèm số dòng.
    bool LoadFromFile(const std::string& path, std::string* error = nullptr);
    bool LoadFromStream(std::istream& in, std::string* error = nullptr);
    // Bảng dự phòng khi không có file (khớp với Data/buildings.txt mặc định).
    void LoadBuiltInDefaults();

    // Mọi tên trong `produces` phải là loại đơn vị có thật. false + `error` nếu có tên lạ.
    bool Validate(const UnitTypeTable& units, std::string* error = nullptr) const;

    bool Empty() const { return types_.empty(); }
    int Count() const { return static_cast<int>(types_.size()); }
    const BuildingType& Get(int index) const { return types_[static_cast<size_t>(index)]; }
    const std::vector<BuildingType>& All() const { return types_; }
    // Chỉ số của loại tên `name`, -1 nếu không có.
    int IndexOf(const std::string& name) const;

private:
    std::vector<BuildingType> types_;
};
