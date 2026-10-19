#!/bin/sh
set -eu
BASE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if command -v xdg-open >/dev/null 2>&1; then
  exec xdg-open "$BASE/QiwuZhijian.html"
fi
printf '%s\n' '请使用支持 WebGL 的浏览器打开同目录的 QiwuZhijian.html。'
exit 1
