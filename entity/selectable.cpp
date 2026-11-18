#include "selectable.h"
#include <SDL3/SDL.h>

#include <algorithm>
#include <cmath>

Selectable::Selectable(float x, float y, float sz) : x(x), y(y), squareSize(sz) {}
