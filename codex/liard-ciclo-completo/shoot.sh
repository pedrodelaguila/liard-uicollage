#!/bin/sh
set -eu
LIARD_MOCK_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
export LIARD_MOCK_ROOT
python3 "$LIARD_MOCK_ROOT/shoot.py" "${1:-v2}"
