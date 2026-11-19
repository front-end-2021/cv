#pragma once
#include <SDL3/SDL.h>
#include <vector>
struct Waypoint {
	float x;
	float y;
};

class Selectable
{
public:
	float x = 0.0f;
	float y = 0.0f;
	float squareSize;
	bool selected = false;

	Selectable(float x, float y, float sz);
	virtual ~Selectable() = default; // Hàm hủy ảo bắt buộc khi dùng kế thừa

};

class Target : public Selectable {
public:
	Target(float x, float y, float sz);
	void Render(SDL_Renderer* r, float camX, float camY);
};

class Player : public Selectable {
public:
	std::vector<Waypoint> path;  // Danh sách các điểm mốc từ thuật toán A*	
	bool touchingTarget = false; // Mỗi lính tự kiểm tra va chạm
	Player(float x, float y, float sz);
	void Render(SDL_Renderer* r, float camX, float camY);
};
