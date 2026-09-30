#!/bin/sh
# Sirve la galería en http://localhost:8765 (también abre por file://)
cd "$(dirname "$0")" && python3 -m http.server 8765
