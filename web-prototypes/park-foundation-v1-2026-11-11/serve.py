#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, unquote
import argparse
import json
import re

ROOT = Path(__file__).resolve().parent
EDITOR = ROOT.parent.parent / 'tools' / 'layout-editor-v1'


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs): super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_GET(self):
        host = self.headers.get('Host', '')
        if host not in ('127.0.0.1:%s' % self.server.server_port, 'localhost:%s' % self.server.server_port):
            return self.send_error(403)
        path = unquote(urlparse(self.path).path)
        if path == '/api/art-layout':
            try:
                source = EDITOR / 'data/project.json'
                state = json.loads(source.read_text()) if source.exists() else {'revision': 0, 'document': {'pages': [], 'assets': []}}
                for asset in state['document']['assets']: asset['url'] = '/editor-assets/' + Path(asset['url']).name
                body = json.dumps(state, ensure_ascii=False).encode()
                self.send_response(200); self.send_header('Content-Type','application/json; charset=utf-8'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body); return
            except (ValueError, OSError, KeyError): return self.send_error(503)
        if path == '/layout-renderer.js': target = EDITOR / 'renderer.js'
        elif re.fullmatch(r'/editor-assets/[a-f0-9]{32}\.(png|jpg|webp|gif)',path): target = EDITOR / 'data/assets' / Path(path).name
        else: target = None
        if target is not None:
            if not target.is_file(): return self.send_error(404)
            body=target.read_bytes();self.send_response(200);self.send_header('Content-Type',self.guess_type(str(target)));self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
        target = (ROOT / path.lstrip('/')).resolve()
        if path == '/': target = ROOT / 'index.html'
        if ROOT not in target.parents or not target.is_file() or target.suffix not in ('.html','.css','.js','.mjs','.json','.png','.jpg','.jpeg','.webp','.gif','.svg'):
            return self.send_error(404)
        return super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options','nosniff')
        super().end_headers()


if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8871);args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print('游乐园功能预览：http://127.0.0.1:%s/' % args.port,flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()
