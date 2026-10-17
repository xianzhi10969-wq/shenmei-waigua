#!/bin/zsh
cd "${0:A:h}"
if /usr/bin/curl -fsS http://127.0.0.1:8766/ >/dev/null 2>&1; then
  /usr/bin/open http://127.0.0.1:8766/
else
  /usr/bin/open http://127.0.0.1:8766/
  /Users/yuriko/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -m http.server 8766 --bind 0.0.0.0 --directory .
fi
