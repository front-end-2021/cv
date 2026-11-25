#include "BuildingType.h"
#include <SDL3/SDL.h>
#include <fstream>
#include <istream>
#include <sstream>
#include "DataParse.h"
#include "UnitType.h"

namespace {
    using dataparse::ParseBool;
    using dataparse::ParseFloat;
    using dataparse::ParseInt;
    using dataparse::Trim;

    constexpr int kMaxFootprint = 8; // công trình rộng/cao tối đa ngần này ô

    // Gán `value` cho khóa `key` của `t`. Trả về chuỗi lỗi (rỗng nếu thành công).
    std::string SetField(BuildingType& t, const std::string& key, const std::string& value) {
        auto setInt = [&](int& field, int minValue, int maxValue) -> std::string {
            int v = 0;
            if (!ParseInt(value, v)) return "gia tri cua '" + key + "' phai la so nguyen";
            if (v < minValue || v > maxValue) {
                return "'" + key + "' phai trong khoang " + std::to_string(minValue) + ".." + std::to_string(maxValue);
            }
            field = v;
            return "";
        };
        constexpr int kBig = 2000000000;
        if (key == "width")  return setInt(t.width, 1, kMaxFootprint);
        if (key == "height") return setInt(t.height, 1, kMaxFootprint);
        if (key == "hp")     return setInt(t.hpMax, 1, kBig);
        if (key == "armor")  return setInt(t.armor, 0, kBig);
        if (key == "cost")   return setInt(t.cost, 0, kBig);
        if (key == "supply") return setInt(t.supply, 0, kBig);
        if (key == "buildtime") {
            float v = 0.0f;
            if (!ParseFloat(value, v)) return "gia tri cua 'buildtime' phai la so";
            if (!(v > 0.0f)) return "'buildtime' phai > 0";
            t.buildTime = v;
            return "";
        }
        if (key == "dropoff") {
            bool b = false;
            if (!ParseBool(value, b)) return "gia tri cua 'dropoff' phai la 1/0 (hoac true/false)";
            t.dropoff = b;
            return "";
        }
        if (key == "produces") {
            std::string spaced = value;
            for (char& c : spaced) if (c == ',') c = ' ';
            std::istringstream is(spaced);
            std::vector<std::string> names;
            std::string name;
            while (is >> name) {
                for (const auto& n : names) if (n == name) return "'produces' bi ghi trung loai '" + name + "'";
                names.push_back(name);
            }
            if (names.empty()) return "'produces' khong co ten loai nao";
            t.produces = std::move(names);
            return "";
        }
        return "khoa khong ro: '" + key + "'";
    }
}

bool BuildingTypeTable::LoadFromStream(std::istream& in, std::string* error) {
    std::vector<BuildingType> parsed;
    std::vector<std::string> seenKeys; // các khóa đã gặp trong loại hiện tại (chặn khai báo trùng)
    std::string line;
    int lineNo = 0;

    auto fail = [&](const std::string& why) {
        if (error) *error = "dong " + std::to_string(lineNo) + ": " + why;
        return false;
    };

    while (std::getline(in, line)) {
        ++lineNo;
        const std::string text = Trim(line);
        if (text.empty() || text[0] == '#') continue;

        if (text[0] == '[') {
            if (text.back() != ']') return fail("thieu dau ']'");
            const std::string name = Trim(text.substr(1, text.size() - 2));
            if (name.empty()) return fail("ten loai cong trinh rong");
            if (name.find_first_of(" \t") != std::string::npos) return fail("ten loai '" + name + "' khong duoc chua khoang trang");
            for (const auto& t : parsed) {
                if (t.name == name) return fail("loai '" + name + "' bi khai bao trung");
            }
            BuildingType t;
            t.name = name;
            parsed.push_back(t);
            seenKeys.clear();
            continue;
        }

        if (parsed.empty()) return fail("khoa nam ngoai [TenLoai]");
        const auto eq = text.find('=');
        if (eq == std::string::npos) return fail("can co dang 'khoa = gia tri'");
        const std::string key = Trim(text.substr(0, eq));
        const std::string value = Trim(text.substr(eq + 1));
        if (key.empty() || value.empty()) return fail("can co dang 'khoa = gia tri'");
        for (const auto& k : seenKeys) {
            if (k == key) return fail("khoa '" + key + "' bi khai bao trung trong loai '" + parsed.back().name + "'");
        }
        const std::string err = SetField(parsed.back(), key, value);
        if (!err.empty()) return fail(err);
        seenKeys.push_back(key);
    }

    if (parsed.empty()) {
        if (error) *error = "khong co loai cong trinh nao";
        return false;
    }
    types_ = std::move(parsed);
    return true;
}

bool BuildingTypeTable::LoadFromFile(const std::string& path, std::string* error) {
    std::ifstream file(path);
    if (!file.is_open()) {
        if (error) *error = "khong mo duoc file";
        return false;
    }
    return LoadFromStream(file, error);
}

void BuildingTypeTable::LoadBuiltInDefaults() {
    types_.clear();

    BuildingType hall; // trụ sở: kho chứa, đẻ thợ, cấp nhiều slot quân
    hall.name = "Townhall";
    hall.width = 3;
    hall.height = 3;
    hall.hpMax = 800;
    hall.armor = 2;
    hall.cost = 200;
    hall.buildTime = 40.0f;
    hall.supply = 10;
    hall.dropoff = true;
    hall.produces = { "Worker" };
    types_.push_back(hall);

    BuildingType house; // nhà: chỉ để nới giới hạn quân
    house.name = "House";
    house.width = 2;
    house.height = 2;
    house.hpMax = 300;
    house.cost = 80;
    house.buildTime = 20.0f;
    house.supply = 8;
    types_.push_back(house);

    BuildingType barracks; // trại lính
    barracks.name = "Barracks";
    barracks.width = 3;
    barracks.height = 2;
    barracks.hpMax = 500;
    barracks.cost = 150;
    barracks.buildTime = 30.0f;
    barracks.produces = { "Soldier" };
    types_.push_back(barracks);
}

bool BuildingTypeTable::Validate(const UnitTypeTable& units, std::string* error) const {
    for (const auto& t : types_) {
        for (const auto& name : t.produces) {
            if (units.IndexOf(name) < 0) {
                if (error) *error = "cong trinh '" + t.name + "' san xuat loai don vi khong co that: '" + name + "'";
                return false;
            }
        }
    }
    return true;
}

int BuildingTypeTable::IndexOf(const std::string& name) const {
    for (size_t i = 0; i < types_.size(); ++i) {
        if (types_[i].name == name) return static_cast<int>(i);
    }
    return -1;
}
