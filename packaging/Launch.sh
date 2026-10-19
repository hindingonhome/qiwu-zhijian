#!/bin/sh
set -eu
BASE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
chmod u+x "$BASE/物派.AppImage"
APPIMAGE_EXTRACT_AND_RUN=1 exec "$BASE/物派.AppImage" "$@"
