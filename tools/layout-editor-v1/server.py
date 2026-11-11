#!/usr/bin/env python3
"""Loopback-only, dependency-free layout editor with atomic saves."""
import argparse
import base64
import json
import mimetypes
import os
import re
import threading
import time
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parent
LOCK = threading.Lock()
MAX_BODY = 64 * 1024 * 1024


def blank():
    return {'schema': 1, 'name': '我的排版项目', 'assets': [], 'pages': [
        {'id': 'page-1', 'name': '场景 01', 'layouts': {
            'desktop': {'width': 1200, 'height': 800, 'background': '#ffffff', 'elements': []},
            'mobile': {'width': 390, 'height': 844, 'background': '#ffffff', 'elements': []}}}]}


def validate(doc):
    if not isinstance(doc, dict) or doc.get('schema') != 1:
        raise ValueError('不支持的项目格式')
    if not isinstance(doc.get('name'), str) or len(doc['name']) > 200:
        raise ValueError('项目名称无效')
    pages, assets = doc.get('pages'), doc.get('assets')
    if not isinstance(pages, list) or not 1 <= len(pages) <= 100:
        raise ValueError('项目需要 1–100 个场景')
    if not isinstance(assets, list) or len(assets) > 1000:
        raise ValueError('素材列表无效')
    aids = set()
    def number(value, lo, hi):
        return type(value) in (int, float) and lo <= value <= hi
    def color(value):
        return isinstance(value, str) and re.fullmatch(r'#[0-9a-fA-F]{6}', value)
    for asset in assets:
        if not isinstance(asset, dict) or not isinstance(asset.get('id'), str) or asset['id'] in aids:
            raise ValueError('素材 ID 重复或无效')
        aids.add(asset['id'])
        if not re.fullmatch(r'/assets/[a-f0-9]{32}\.(png|jpg|webp|gif)', asset.get('url', '')):
            raise ValueError('素材必须先导入本机素材库')
        if not isinstance(asset.get('name'), str) or not all(number(asset.get(k), 1, 50000) for k in ('width', 'height')):
            raise ValueError('素材信息无效')
    pids = set()
    slots = set()
    for page in pages:
        if not isinstance(page, dict) or not isinstance(page.get('id'), str) or page['id'] in pids or not isinstance(page.get('name'), str):
            raise ValueError('场景信息无效')
        pids.add(page['id'])
        slot = page.get('artSlot', '')
        if slot:
            if not isinstance(slot, str) or not re.fullmatch(r'[a-z0-9-]{1,80}', slot) or slot in slots:
                raise ValueError('网页素材位无效或重复')
            slots.add(slot)
        for mode in ('desktop', 'mobile'):
            layout = page.get('layouts', {}).get(mode, {})
            if not all(number(layout.get(k), 100, 12000) for k in ('width', 'height')) or not color(layout.get('background')):
                raise ValueError('画布尺寸或颜色无效')
            elements = layout.get('elements')
            if not isinstance(elements, list) or len(elements) > 1000:
                raise ValueError('图层列表无效')
            ids = set()
            for el in elements:
                if not isinstance(el, dict) or not isinstance(el.get('id'), str) or el['id'] in ids:
                    raise ValueError('图层 ID 重复或无效')
                ids.add(el['id'])
                if el.get('type') not in ('image', 'text', 'shape'):
                    raise ValueError('未知图层类型')
                for key in ('x', 'y', 'width', 'height', 'rotation', 'opacity'):
                    lo, hi = (-100000, 100000)
                    if key in ('width', 'height'): lo, hi = (1, 24000)
                    if key == 'opacity': lo, hi = (0, 1)
                    if not number(el.get(key), lo, hi): raise ValueError('图层数值无效：' + key)
                if el['type'] == 'image' and el.get('assetId') not in aids:
                    raise ValueError('图层引用了不存在的素材')
                if el['type'] in ('text', 'shape') and not color(el.get('color')):
                    raise ValueError('图层颜色无效')
                if el['type'] == 'text':
                    if not isinstance(el.get('text'), str) or len(el['text']) > 50000 or not number(el.get('fontSize'), 6, 600):
                        raise ValueError('文字内容无效')
                    if el.get('fontFamily') not in ('sans-serif', 'serif', 'monospace') or el.get('align') not in ('left', 'center', 'right'):
                        raise ValueError('文字样式无效')
    return doc


class Store:
    def __init__(self, path):
        self.path = Path(path)
        (self.path / 'assets').mkdir(parents=True, exist_ok=True)
        (self.path / 'backups').mkdir(exist_ok=True)
        self.file = self.path / 'project.json'
    def read(self):
        if self.file.exists():
            return json.loads(self.file.read_text(encoding='utf-8'))
        return {'revision': 0, 'document': blank()}
    def save(self, doc, revision):
        validate(doc)
        current = self.read()
        if revision != current['revision']:
            return None
        for asset in doc['assets']:
            if not (self.path / asset['url'].lstrip('/')).is_file():
                raise ValueError('素材原文件缺失，请重新导入')
        payload = {'revision': revision + 1, 'document': doc}
        if self.file.exists():
            backup = self.path / 'backups' / ('%08d.json' % revision)
            backup.write_bytes(self.file.read_bytes())
        tmp = self.path / ('project-' + uuid.uuid4().hex + '.tmp')
        with tmp.open('w', encoding='utf-8') as stream:
            json.dump(payload, stream, ensure_ascii=False, allow_nan=False)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(tmp, self.file)
        for old in sorted((self.path / 'backups').glob('*.json'))[:-20]:
            old.unlink()
        return payload


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        if args and '200' not in str(args): super().log_message(fmt, *args)
    def allowed(self):
        host = self.headers.get('Host', '')
        if host not in ('127.0.0.1:%s' % self.server.server_port, 'localhost:%s' % self.server.server_port): return False
        origin = self.headers.get('Origin')
        return not origin or origin == 'http://' + host
    def respond(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)
    def body(self):
        size = int(self.headers.get('Content-Length', 0))
        if not 0 < size <= MAX_BODY: raise ValueError('文件过大或请求为空（上限 64 MB）')
        return json.loads(self.rfile.read(size))
    def do_GET(self):
        if not self.allowed(): return self.respond(403, {'error': '仅允许本机同源访问'})
        path = unquote(urlparse(self.path).path)
        if path == '/api/state':
            try:
                with LOCK: result = self.server.store.read()
                return self.respond(200, result)
            except Exception: return self.respond(500, {'error': '无法读取项目，请保留 data 文件夹并检查备份'})
        if re.fullmatch(r'/assets/[a-f0-9]{32}\.(png|jpg|webp|gif)', path):
            target = self.server.store.path / path.lstrip('/')
        elif path in ('/', '/index.html', '/preview.html', '/style.css', '/app.js', '/renderer.js', '/pixel.mjs'):
            target = ROOT / ('index.html' if path == '/' else path[1:])
        else: return self.respond(404, {'error': '文件不存在'})
        if not target.is_file(): return self.respond(404, {'error': '文件不存在'})
        body = target.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', mimetypes.guess_type(str(target))[0] or 'application/octet-stream')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(body)
    def do_PUT(self):
        if not self.allowed(): return self.respond(403, {'error': '仅允许本机同源访问'})
        if self.path != '/api/state': return self.respond(404, {'error': '未知接口'})
        try:
            data = self.body()
            with LOCK: result = self.server.store.save(data['document'], data['revision'])
            if result is None: return self.respond(409, {'error': '另一个窗口已保存新版本'})
            return self.respond(200, {'revision': result['revision']})
        except (ValueError, KeyError, TypeError) as err: return self.respond(400, {'error': str(err)})
        except Exception: return self.respond(500, {'error': '保存失败，请检查磁盘空间并导出项目备份'})
    def do_POST(self):
        if not self.allowed(): return self.respond(403, {'error': '仅允许本机同源访问'})
        if self.path != '/api/assets': return self.respond(404, {'error': '未知接口'})
        try:
            data = self.body()
            match = re.fullmatch(r'data:image/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=\s]+)', data['dataUrl'])
            if not match: raise ValueError('支持 PNG、JPEG、WebP、GIF；SVG 请先导出为 PNG')
            kind, encoded = match.groups()
            raw = base64.b64decode(encoded, validate=True)
            signatures = {'png': raw.startswith(b'\x89PNG\r\n\x1a\n'), 'jpeg': raw.startswith(b'\xff\xd8\xff'),
                          'gif': raw.startswith((b'GIF87a', b'GIF89a')), 'webp': raw[:4] == b'RIFF' and raw[8:12] == b'WEBP'}
            if not signatures[kind] or len(raw) > 12 * 1024 * 1024: raise ValueError('图片格式不符或超过 12 MB')
            name = uuid.uuid4().hex + '.' + ('jpg' if kind == 'jpeg' else kind)
            (self.server.store.path / 'assets' / name).write_bytes(raw)
            return self.respond(201, {'url': '/assets/' + name})
        except (ValueError, KeyError, TypeError) as err: return self.respond(400, {'error': str(err)})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--data-dir', default=str(ROOT / 'data'))
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    server.store = Store(args.data_dir)
    print('排版工作室：http://127.0.0.1:%s/' % server.server_port, flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()


if __name__ == '__main__': main()
