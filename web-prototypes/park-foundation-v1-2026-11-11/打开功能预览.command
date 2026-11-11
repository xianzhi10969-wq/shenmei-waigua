#!/bin/zsh
cd "${0:A:h}"
if curl -fsS http://127.0.0.1:8871/data/provenance.json >/dev/null 2>&1; then
  open http://127.0.0.1:8871/
  exit 0
fi
python3 serve.py --port 8871 &
PARK_SERVER_PID=$!
trap 'kill "$PARK_SERVER_PID" 2>/dev/null' EXIT INT TERM
for PARK_ATTEMPT in {1..30}; do
  if curl -fsS http://127.0.0.1:8871/data/provenance.json >/dev/null 2>&1; then
    open http://127.0.0.1:8871/
    print '功能预览已打开。请保留此终端窗口，关闭会停止服务。'
    wait "$PARK_SERVER_PID"
    exit 0
  fi
  sleep 0.2
done
print '启动失败，请检查上方提示。'
read '?按回车退出'
