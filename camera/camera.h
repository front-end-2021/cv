#pragma once

// ---- Dữ liệu input của một khung hình (gom về một chỗ cho dễ truyền đi) ----
struct Input {
	const bool* keys = nullptr;
	float mouseX = 0.0f, mouseY = 0.0f; // tọa độ chuột trong cửa sổ
	bool  mouseInWindow = false;
};

class Camera {
public:
	float x = 0.0f;
	float y = 0.0f;

	Camera(float startX, float startY);
	void ClampCamera(float px, float py, int windowW, int windowH, float worldW, float worldH);
	void UpdateCamera(const Input& in, float dt, int windowW, int windowH, float worldW, float worldH);

private:
	float edgeScrollMargin = 20.0f; // bề rộng vùng mép màn hình kích hoạt cuộn
	float cameraSpeed = 700.0f;    // tốc độ cuộn camera (pixel/giây)
};