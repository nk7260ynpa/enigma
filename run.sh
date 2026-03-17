#!/usr/bin/env bash
# 啟動 Enigma Machine 網頁應用
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 停止舊的 container（若存在）
docker rm -f enigma-machine 2>/dev/null || true

# 建置 image
bash "${SCRIPT_DIR}/docker/build.sh"

# 確保 logs 目錄存在
mkdir -p "${SCRIPT_DIR}/logs"

# 啟動 container
docker run -d \
  --name enigma-machine \
  -p 8080:80 \
  -v "${SCRIPT_DIR}/logs:/var/log/nginx" \
  --rm \
  enigma-machine

echo "Enigma Machine 已啟動：http://localhost:8080"
