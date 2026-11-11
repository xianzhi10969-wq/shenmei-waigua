#!/bin/zsh
cd "${0:A:h}"
if curl -fsS http://127.0.0.1:8765/api/state >/dev/null 2>&1; then
  open http://127.0.0.1:8765/
  exit 0
fi
python3 server.py --port 8765 &
EDITOR_SERVER_PID=$!
trap 'kill "$EDITOR_SERVER_PID" 2>/dev/null' EXIT INT TERM
for EDITOR_ATTEMPT in {1..30}; do
  if curl -fsS http://127.0.0.1:8765/api/state >/dev/null 2>&1; then
    open http://127.0.0.1:8765/
    print '编辑器已打开。使用期间请保留此终端窗口；关闭窗口会停止服务。'
    wait "$EDITOR_SERVER_PID"
    exit 0
  fi
  sleep 0.2
done
print '无法启动。端口 8765 可能被占用，请查看上面的错误。'
read '?按回车退出'
