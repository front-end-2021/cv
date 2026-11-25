#pragma once
#include <cctype>
#include <cmath>
#include <sstream>
#include <string>

// Hàm đọc dùng chung cho các file dữ liệu dạng văn bản (Data/*.txt, Maps/*.txt).
// Mọi hàm Parse* đều chặt chẽ: thừa ký tự phía sau số, hoặc số không hợp lệ (NaN, vô cực, tràn) đều bị từ chối.
namespace dataparse {
    inline std::string Trim(const std::string& s) {
        const auto a = s.find_first_not_of(" \t\r\n");
        if (a == std::string::npos) return "";
        const auto b = s.find_last_not_of(" \t\r\n");
        return s.substr(a, b - a + 1);
    }

    inline bool ParseInt(const std::string& text, int& out) {
        std::istringstream is(text);
        long long v = 0;
        std::string rest;
        if (!(is >> v) || (is >> rest) || v < -2000000000LL || v > 2000000000LL) return false;
        out = static_cast<int>(v);
        return true;
    }

    inline bool ParseFloat(const std::string& text, float& out) {
        std::istringstream is(text);
        float v = 0.0f;
        std::string rest;
        if (!(is >> v) || (is >> rest) || !std::isfinite(v)) return false;
        out = v;
        return true;
    }

    // 1/0, true/false, yes/no (không phân biệt hoa thường).
    inline bool ParseBool(const std::string& text, bool& out) {
        std::string t;
        for (char c : text) t.push_back(static_cast<char>(std::tolower(static_cast<unsigned char>(c))));
        if (t == "1" || t == "true" || t == "yes") { out = true; return true; }
        if (t == "0" || t == "false" || t == "no") { out = false; return true; }
        return false;
    }
}
