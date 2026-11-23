cmake_minimum_required(VERSION 3.13)
add_library(sheet_renderer_original SHARED IMPORTED GLOBAL)
set_target_properties(sheet_renderer_original PROPERTIES
 IMPORTED_LOCATION "${CMAKE_CURRENT_LIST_DIR}/../../../prebuilt/${ANDROID_ABI}/libreact_codegen_SheetViewSpec.so")
# RN adds compile options to this target; the implementation stays in the original binary.
add_library(react_codegen_SheetViewSpec OBJECT bridge.cpp)
target_include_directories(react_codegen_SheetViewSpec PUBLIC "${CMAKE_CURRENT_LIST_DIR}/../../../build/generated/source/codegen/jni")
target_link_libraries(react_codegen_SheetViewSpec sheet_renderer_original)