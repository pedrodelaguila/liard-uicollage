#!/usr/bin/env bash
# Sirve la galería por http (además de abrirla por file://): http://localhost:8765
cd "$(dirname "$0")" && python3 -m http.server "${1:-8765}"
