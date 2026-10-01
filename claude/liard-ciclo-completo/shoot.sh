#!/usr/bin/env bash
# Capturas: ./shoot.sh v1 [sección...]  → shots/v1/0-galeria.png, shots/v1/<sección>.png, shots/v1/pantallas/*.png
# Usa Playwright con el Chrome del sistema (Chrome por línea de comandos no baja de ~500 px de ancho y corta los teléfonos).
# Playwright: npm i playwright en cualquier carpeta y exportá PW_DIR=<carpeta>/node_modules/playwright.
set -euo pipefail
cd "$(dirname "$0")"
node tools/shoot.mjs "${1:-v1}" "${@:2}"
