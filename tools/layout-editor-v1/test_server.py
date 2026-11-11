import base64
import copy
import json
import tempfile
import threading
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from server import Store, blank, Handler, ThreadingHTTPServer, validate


class PersistenceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Store(self.temp.name)
    def tearDown(self):
        self.temp.cleanup()
    def test_restart_preserves_independent_layouts_and_backup(self):
        doc = blank()
        doc['pages'][0]['layouts']['mobile']['height'] = 1200
        self.store.save(doc, 0)
        self.assertEqual(Store(self.temp.name).read()['document'], doc)
        self.assertEqual(doc['pages'][0]['layouts']['desktop']['height'], 800)
        changed = copy.deepcopy(doc)
        changed['name'] = '下一版'
        self.store.save(changed, 1)
        backup = json.loads((Path(self.temp.name) / 'backups/00000001.json').read_text())
        self.assertEqual(backup['document'], doc)
    def test_stale_window_cannot_overwrite_newer_save(self):
        self.store.save(blank(), 0)
        stale = blank()
        stale['name'] = '过期窗口'
        self.assertIsNone(self.store.save(stale, 0))
        self.assertNotEqual(self.store.read()['document']['name'], '过期窗口')
    def test_invalid_geometry_and_external_assets_are_rejected(self):
        for value in [float('nan'), float('inf'), -1, 13000]:
            doc = blank()
            doc['pages'][0]['layouts']['desktop']['width'] = value
            with self.assertRaises(ValueError): validate(doc)
        doc = blank()
        doc['assets'] = [{'id':'one','name':'external','width':10,'height':10,'url':'https://example.com/a.png'}]
        with self.assertRaises(ValueError): validate(doc)
    def test_deleted_placement_does_not_delete_original(self):
        name = 'a' * 32 + '.png'
        (Path(self.temp.name) / 'assets' / name).write_bytes(b'original')
        doc = blank()
        doc['assets'].append({'id':'art','name':'原图','url':'/assets/'+name,'width':100,'height':100})
        el = {'id':'placed','type':'image','assetId':'art','x':0,'y':0,'width':100,'height':100,'rotation':0,'opacity':1}
        doc['pages'][0]['layouts']['desktop']['elements'].append(el)
        self.store.save(doc, 0)
        doc['pages'][0]['layouts']['desktop']['elements'].clear()
        self.store.save(doc, 1)
        self.assertEqual(len(self.store.read()['document']['assets']), 1)
        self.assertEqual((Path(self.temp.name) / 'assets' / name).read_bytes(), b'original')


class HTTPTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.server.store = Store(self.temp.name)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = 'http://127.0.0.1:%d' % self.server.server_port
    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.temp.cleanup()
    def request(self, path, data=None, method=None, headers=None):
        return urlopen(Request(self.base + path, data=json.dumps(data).encode() if data is not None else None, method=method, headers=headers or {}))
    def test_http_conflict_and_private_files(self):
        payload = {'revision':0,'document':blank()}
        self.assertEqual(self.request('/api/state',payload,'PUT').status,200)
        with self.assertRaises(HTTPError) as caught: self.request('/api/state',payload,'PUT')
        self.assertEqual(caught.exception.code,409)
        for path in ['/data/project.json','/../server.py','/server.py']:
            with self.assertRaises(HTTPError) as caught: self.request(path)
            self.assertEqual(caught.exception.code,404)
    def test_cross_origin_mutation_is_blocked(self):
        with self.assertRaises(HTTPError) as caught:
            self.request('/api/state',{'revision':0,'document':blank()},'PUT',{'Origin':'https://example.com'})
        self.assertEqual(caught.exception.code,403)
    def test_uploaded_asset_serves_identical_bytes_and_rejects_disguised_html(self):
        original = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=')
        result = json.load(self.request('/api/assets', {'dataUrl':'data:image/png;base64,'+base64.b64encode(original).decode()}, 'POST'))
        self.assertEqual(self.request(result['url']).read(),original)
        with self.assertRaises(HTTPError) as caught:
            self.request('/api/assets',{'dataUrl':'data:image/png;base64,'+base64.b64encode(b'<script>alert(1)</script>').decode()},'POST')
        self.assertEqual(caught.exception.code,400)


if __name__ == '__main__': unittest.main(verbosity=2)
