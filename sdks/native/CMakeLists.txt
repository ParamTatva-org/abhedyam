cmake_minimum_required(VERSION 3.10)
project(abhedya_sdk VERSION 1.0.5 LANGUAGES C CXX)

include(GNUInstallDirs)

# Core Library (Pre-built Rust)
# User must provide path to libabhedya_ffi.so/dylib/dll via -DABHEDYA_LIB_DIR
# or we assume standard target directory for dev.

set(ABHEDYA_LIB_NAME abhedya_ffi)

find_library(ABHEDYA_LIB 
    NAMES ${ABHEDYA_LIB_NAME}
    HINTS 
        "${CMAKE_CURRENT_SOURCE_DIR}/../../target/release"
        "${CMAKE_CURRENT_SOURCE_DIR}/lib"
        $ENV{ABHEDYA_LIB_DIR}
    REQUIRED
)

add_library(abhedya SHARED IMPORTED)
set_target_properties(abhedya PROPERTIES
    IMPORTED_LOCATION "${ABHEDYA_LIB}"
    INTERFACE_INCLUDE_DIRECTORIES "${CMAKE_CURRENT_SOURCE_DIR}/include"
)

# Installation
install(FILES include/abhedya.h DESTINATION ${CMAKE_INSTALL_INCLUDEDIR})
install(FILES ${ABHEDYA_LIB} DESTINATION ${CMAKE_INSTALL_LIBDIR})

# PkgConfig
configure_file(abhedya.pc.in abhedya.pc @ONLY)
install(FILES ${CMAKE_CURRENT_BINARY_DIR}/abhedya.pc DESTINATION ${CMAKE_INSTALL_LIBDIR}/pkgconfig)
