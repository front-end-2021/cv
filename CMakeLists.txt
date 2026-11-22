cmake_minimum_required(VERSION 3.16)
project(MiniRTS LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Tự tải và build SDL3 (cần Git và internet ở lần cấu hình đầu tiên).
# Build tĩnh để không phải copy SDL3.dll cạnh file .exe.
set(SDL_STATIC ON  CACHE BOOL "" FORCE)
set(SDL_SHARED OFF CACHE BOOL "" FORCE)

include(FetchContent)
FetchContent_Declare(
    SDL3
    GIT_REPOSITORY https://github.com/libsdl-org/SDL.git
    GIT_TAG        release-3.2.0   # có thể đổi sang bản mới hơn trên trang Releases của SDL
    GIT_SHALLOW    TRUE
)
FetchContent_MakeAvailable(SDL3)

# Chưa dùng WIN32 để còn thấy cửa sổ console và SDL_Log khi học.
add_executable(MiniRTS 
    main.cpp
    Common.h Tile.h
    TileMap.h TileMap.cpp
    Pathfinder.h Pathfinder.cpp
    Utils.h Utils.cpp
    camera/camera.h camera/camera.cpp
    entity/Team.h entity/Animation.h
    entity/Entity.h entity/Entity.cpp
    entity/UnitType.h entity/UnitType.cpp
    entity/Unit.h entity/Unit.cpp
    game/GameState.h game/GameState.cpp
    game/World.h game/World.cpp
    game/Formation.h game/Formation.cpp
    game/Orders.h game/Orders.cpp
    game/Ai.h game/Ai.cpp
    game/Simulation.h game/Simulation.cpp
    game/Selection.h game/Selection.cpp
    game/Game.h game/Game.cpp
    game/Render.h game/Render.cpp
    ui/Menu.h ui/Menu.cpp)
# Cho phép #include "entity/Unit.h", "game/World.h"... từ mọi thư mục con.
target_include_directories(MiniRTS PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(MiniRTS PRIVATE SDL3::SDL3)

if(MSVC)
    target_compile_options(MiniRTS PRIVATE /utf-8 /W4)
endif()

# Sao chep thu muc Maps vao thu muc chay cua executable.
file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/Maps DESTINATION ${CMAKE_CURRENT_BINARY_DIR})
file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/Data DESTINATION ${CMAKE_CURRENT_BINARY_DIR})