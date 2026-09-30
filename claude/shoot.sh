#!/bin/sh
# Capturas de la galería → shots/<versión>/
cd "$(dirname "$0")" && node tools/shoot.js "${1:-v1}" "$2"
