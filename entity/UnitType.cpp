#include "UnitType.h"
#include <SDL3/SDL.h>
#include <cmath>
#include <fstream>
#include <istream>
#include <sstream>
#include "DataParse.h"

namespace {
    using dataparse::ParseFloat;
    using dataparse::ParseInt;
    using dataparse::Trim;

    // Gán `value` cho khóa `key` của `t`. Trả về chuỗi lỗi (rỗng nếu thành công).
    std::string SetField(UnitType& t, const std::string& key, const std::string& value) {
        auto setInt = [&](int& field, int minValue) -> std::string {
            int v = 0;
            if (!ParseInt(value, v)) return "gia tri cua '" + key + "' phai la so nguyen";
            if (v < minValue) return "'" + key + "' phai >= " + std::to_string(minValue);
            field = v;
            return "";
        };
        auto setFloat = [&](float& field, float minValue, bool strictlyAbove) -> std::string {
            float v = 0.0f;
            if (!ParseFloat(value, v)) return "gia tri cua '" + key + "' phai la so";
            if (strictlyAbove ? !(v > minValue) : (v < minValue)) {
                return "'" + key + "' phai " + (strictlyAbove ? "> " : ">= ") + std::to_string(static_cast<int>(minValue));
            }
            field = v;
            return "";
        };
        if (key == "hp")       return setInt(t.hpMax, 1);
        if (key == "armor")    return setInt(t.armor, 0);
        if (key == "shield")   return setInt(t.shield, 0);
        if (key == "damage")   return setInt(t.damage, 0);
        if (key == "cooldown") return setFloat(t.cooldown, 0.0f, true);
        if (key == "range")    return setFloat(t.range, 0.0f, false);
        if (key == "speed")    return setFloat(t.moveSpeed, 0.0f, false);
        if (key == "aggro")    return setFloat(t.aggroRange, 0.0f, false);
        if (key == "vision")   return setFloat(t.vision, 0.0f, false);
        if (key == "cost")       return setInt(t.cost, 0);
        if (key == "supply")     return setInt(t.supply, 0);
        if (key == "traintime")  return setFloat(t.trainTime, 0.0f, true);
        if (key == "buildspeed") return setInt(t.buildSpeed, 0);
        if (key == "carry")      return setInt(t.carry, 1);
        return "khoa khong ro: '" + key + "'";
    }
}

bool UnitTypeTable::LoadFromStream(std::istream& in, std::string* error) {
    std::vector<UnitType> parsed;
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
            if (name.empty()) return fail("ten loai don vi rong");
            if (name.find_first_of(" \t") != std::string::npos) return fail("ten loai '" + name + "' khong duoc chua khoang trang");
            for (const auto& t : parsed) {
                if (t.name == name) return fail("loai '" + name + "' bi khai bao trung");
            }
            UnitType t;
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
        if (error) *error = "khong co loai don vi nao";
        return false;
    }
    types_ = std::move(parsed);
    return true;
}

bool UnitTypeTable::LoadFromFile(const std::string& path, std::string* error) {
    std::ifstream file(path);
    if (!file.is_open()) {
        if (error) *error = "khong mo duoc file";
        return false;
    }
    return LoadFromStream(file, error);
}

void UnitTypeTable::LoadBuiltInDefaults() {
    types_.clear();
    UnitType soldier;
    soldier.name = "Soldier";
    soldier.cost = 60;
    soldier.trainTime = 12.0f;
    types_.push_back(soldier);

    UnitType grunt; // trâu hơn nhưng yếu và chậm hơn
    grunt.name = "Grunt";
    grunt.hpMax = 120;
    grunt.damage = 8;
    grunt.cooldown = 1.2f;
    grunt.moveSpeed = 220.0f;
    grunt.cost = 50;
    grunt.trainTime = 12.0f;
    types_.push_back(grunt);

    UnitType worker; // thợ: yếu, không tự đánh ai, đào và xây được
    worker.name = "Worker";
    worker.hpMax = 60;
    worker.armor = 0;
    worker.damage = 4;
    worker.cooldown = 1.5f;
    worker.moveSpeed = 260.0f;
    worker.aggroRange = 0.0f;
    worker.cost = 50;
    worker.trainTime = 8.0f;
    worker.buildSpeed = 100;
    worker.carry = 10;
    types_.push_back(worker);
}

int UnitTypeTable::IndexOf(const std::string& name) const {
    for (size_t i = 0; i < types_.size(); ++i) {
        if (types_[i].name == name) return static_cast<int>(i);
    }
    return -1;
}

int UnitTypeTable::DefaultIndexFor(Team team) const {
    if (types_.empty()) return -1;
    const int idx = IndexOf(DefaultTypeName(team));
    return idx >= 0 ? idx : 0;
}
