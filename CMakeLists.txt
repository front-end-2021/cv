cmake_minimum_required(VERSION 3.16)
project(MiniRTS LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Tự tải và build SDL3 (cần Git và internet ở lần cấu hình đầu tiên). Build tĩnh để không phải copy SDL3.dll cạnh file .exe.
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

# ==============================================================================
# 1. THƯ VIỆN LÕI DÙNG CHUNG (Biên dịch 1 lần duy nhất cho cả Game và Tests)
# ==============================================================================
set(MINIRTS_CORE_SOURCES
    Common.h Tile.h Path.h PathGrid.h DataParse.h
    TileMap.h TileMap.cpp
    Pathfinder.h Pathfinder.cpp
    FlowField.h FlowField.cpp
    Utils.h Utils.cpp
    camera/camera.h camera/camera.cpp
    entity/Team.h entity/Animation.h
    entity/Entity.h entity/Entity.cpp
    entity/UnitType.h entity/UnitType.cpp
    entity/BuildingType.h entity/BuildingType.cpp
    entity/Footprint.h
    entity/Building.h entity/Building.cpp
    entity/ResourceNode.h entity/ResourceNode.cpp
    entity/Unit.h entity/Unit.cpp
    game/GameState.h game/GameState.cpp
    game/PathRequest.h
    game/PathService.h game/PathService.cpp
    game/Movement.h game/Movement.cpp
    game/World.h game/World.cpp
    game/Formation.h game/Formation.cpp
    game/Orders.h game/Orders.cpp
    game/Ai.h game/Ai.cpp
    game/Economy.h game/Economy.cpp
    game/Construction.h game/Construction.cpp
    game/Production.h game/Production.cpp
    game/Work.h game/Work.cpp
    game/Commands.h game/Commands.cpp
    game/Simulation.h game/Simulation.cpp
    game/Selection.h game/Selection.cpp
    game/Hud.h game/Hud.cpp
    game/Game.h game/Game.cpp
    game/Render.h game/Render.cpp
)

add_library(MiniRTSCore STATIC ${MINIRTS_CORE_SOURCES})
# Dùng PUBLIC để MiniRTS và các bộ Test tự động kế thừa đường dẫn include và SDL3
target_include_directories(MiniRTSCore PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(MiniRTSCore PUBLIC SDL3::SDL3)

if(MSVC)
    target_compile_options(MiniRTSCore PRIVATE /utf-8 /W4)
endif()

# ==============================================================================
# 2. FILE THỰC THI GAME CHÍNH
# ==============================================================================
# Chưa dùng WIN32 để còn thấy cửa sổ console và SDL_Log khi học.
add_executable(MiniRTS
    main.cpp
    ui/Menu.h ui/Menu.cpp
)
target_link_libraries(MiniRTS PRIVATE MiniRTSCore)

if(MSVC)
    target_compile_options(MiniRTS PRIVATE /utf-8 /W4)
endif()

# ==============================================================================
# 3. BỘ KIỂM THỬ UNIT TEST (GoogleTest)
# ==============================================================================
# Mặc định BẬT:
option(MINIRTS_BUILD_TESTS "Build bo kiem thu unit test MiniRTS" ON)
if(MINIRTS_BUILD_TESTS)
    FetchContent_Declare(
        googletest
        GIT_REPOSITORY https://github.com/google/googletest.git
        GIT_TAG        v1.18.0
        GIT_SHALLOW    TRUE
    )
    # Tránh xung đột cờ Runtime Library (/MD vs /MT) trên Windows (MSVC)
    set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
    FetchContent_MakeAvailable(googletest)

    enable_testing()
    include(GoogleTest)

    # Hàm hỗ trợ tạo target test gọn gàng, tránh lặp code và tự động cấu hình MSVC
    function(add_minirts_test TEST_NAME SOURCE_PATH GTEST_TARGET)
        if(EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/${SOURCE_PATH})
            add_executable(${TEST_NAME} ${SOURCE_PATH})
            target_link_libraries(${TEST_NAME} PRIVATE MiniRTSCore ${GTEST_TARGET})
            if(MSVC)
                target_compile_options(${TEST_NAME} PRIVATE /utf-8 /W4)
                target_compile_definitions(${TEST_NAME} PRIVATE _CRT_SECURE_NO_WARNINGS) # Tắt cảnh báo C4996 (như std::getenv trong UiTests) trên Windows
            endif()
            gtest_discover_tests(${TEST_NAME} WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR})
        endif()
    endfunction()

    # 1. Target AiTests dùng GoogleTest
    add_minirts_test(AiTests tests/AiTests.cpp GTest::gtest_main)

    # 2. Target PathingTests (tự viết main để giữ cờ --bench)
    add_minirts_test(PathingTests tests/PathingTests.cpp GTest::gtest)

    # 3. Target StressTest (tự viết main để giữ cờ --bench)
    add_minirts_test(StressTest tests/StressTest.cpp GTest::gtest)

    # 4. Target EconomyTests: kinh tế & xây dựng
    add_minirts_test(EconomyTests tests/EconomyTests.cpp GTest::gtest_main)

    # 5. Target CombatTests: lệnh chiến đấu
    add_minirts_test(CombatTests tests/CombatTests.cpp GTest::gtest_main)

    # 6. Target UiTests: giao diện & điều khiển bước 5
    add_minirts_test(UiTests tests/UiTests.cpp GTest::gtest_main)
endif()

# ==============================================================================
# 4. TÀI NGUYÊN (ASSETS)
# ==============================================================================
# Sao chép thư mục Maps và Data vào thư mục chạy của executable.
file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/Maps DESTINATION ${CMAKE_CURRENT_BINARY_DIR})
file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/Data DESTINATION ${CMAKE_CURRENT_BINARY_DIR})
