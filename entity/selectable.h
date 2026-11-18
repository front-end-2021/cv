#pragma once
#include <SDL3/SDL.h>

class Selectable
{
public:
	float x = 0.0f;
	float y = 0.0f;
	float squareSize;
	float sizeY;
	bool selected = false;

	Selectable(float x, float y, float sz);
	virtual ~Selectable() = default; // Hàm hủy ảo bắt buộc khi dùng kế thừa

private:

};

class Target : public Selectable {
public:
	Target(float x, float y, float sz);
	void Render(SDL_Renderer* r, float camX, float camY);
};

class Player : public Selectable {
public:
	float moveX = 0.0f;
	float moveY = 0.0f;
	Player(float x, float y, float sz);
	void Render(SDL_Renderer* r, bool touching, float camX, float camY);
};