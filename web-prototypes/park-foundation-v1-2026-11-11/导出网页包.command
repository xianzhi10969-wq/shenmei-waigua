#!/bin/zsh
cd "$(dirname "$0")" || exit 1
park_export_stamp=$(date +%Y%m%d-%H%M%S)
park_export_dir="../../output/park-portable-${park_export_stamp}"
python3 export_site.py --output "$park_export_dir"
echo "按回车关闭此窗口。"
read -r
