#!/usr/bin/env bash
# 建置 Enigma Machine Docker image
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

docker build \
  -t enigma-machine \
  -f "${SCRIPT_DIR}/Dockerfile" \
  "${PROJECT_ROOT}"
