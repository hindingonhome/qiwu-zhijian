#!/bin/sh
set -eu
BASE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$HOME/.local/share/applications"
# Escape desktop-entry string values without evaluating the source path as code.
EXEC_PATH=$(printf '%s' "$BASE/Launch.sh" | sed 's/\\/\\\\/g; s/"/\\"/g; s/`/\\`/g; s/\$/\\$/g; s/%/%%/g')
ICON_PATH=$(printf '%s' "$BASE/Branding/icon.png" | sed 's/\\/\\\\/g')
cat > "$HOME/.local/share/applications/wupai.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=物派
Comment=器物与纹样工作室
Exec=sh "$EXEC_PATH"
Icon=$ICON_PATH
Terminal=false
Categories=Graphics;
EOF
printf '%s\n' '已创建物派应用菜单入口。移动文件夹后，请重新运行本脚本。'
