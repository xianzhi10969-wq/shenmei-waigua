import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from export_site import RUNTIME, art_snapshot, export_site


class ExportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.editor = self.root / 'editor'
        (self.editor / 'assets').mkdir(parents=True)
        self.filename = 'a' * 32 + '.png'
        self.original = b'original-image-bytes'
        (self.editor / 'assets' / self.filename).write_bytes(self.original)
        layer = {'id': 'image-1', 'type': 'image', 'assetId': 'asset-1', 'x': 23, 'y': 47,
                 'width': 64, 'height': 96, 'rotation': 0, 'opacity': 1, 'pixelated': True}
        layout = {'width': 390, 'height': 844, 'background': '#ffffff', 'elements': [layer]}
        page = {'id': 'p1', 'name': '场景', 'artSlot': 'p1-scene',
                'layouts': {'mobile': layout, 'desktop': copy.deepcopy(layout)}}
        page['layouts']['desktop']['width'] = 1200
        page['layouts']['desktop']['elements'][0]['x'] = 230
        private = copy.deepcopy(page)
        private.update(id='private', name='不属于网页的草稿', artSlot='')
        self.state = {'revision': 7, 'document': {'schema': 1, 'name': '个人工作区名称',
            'pages': [page, private], 'assets': [
                {'id': 'asset-1', 'name': '采用图', 'url': '/assets/' + self.filename, 'width': 64, 'height': 96},
                {'id': 'unused', 'name': '未采用图', 'url': '/assets/' + 'b'*32 + '.png', 'width': 64, 'height': 64}]}}
        self.write_state()
        self.source = self.root / 'site'
        (self.source / 'data').mkdir(parents=True)
        (self.source / 'media').mkdir()
        for name in RUNTIME:
            (self.source / name).write_text('<head></head>' if name == 'index.html' else 'runtime')
        for name in ('catalog', 'features', 'experience', 'provenance'):
            (self.source / 'data' / (name + '.json')).write_text('{}')
        (self.source / 'media/original.jpg').write_bytes(b'fact-media')
        self.dest = self.root / 'export'

    def write_state(self):
        (self.editor / 'project.json').write_text(json.dumps(self.state, ensure_ascii=False))

    def test_only_bound_scenes_and_used_assets_with_exact_geometry(self):
        art, files = art_snapshot(self.editor)
        self.assertEqual(len(art['document']['pages']), 1)
        self.assertEqual(len(art['document']['assets']), 1)
        self.assertNotIn('name', art['document'])
        self.assertEqual(art['document']['pages'][0], self.state['document']['pages'][0])
        self.assertEqual(art['document']['assets'][0]['url'], './editor-assets/' + self.filename)
        self.assertEqual(len(files), 1)

    def test_full_bundle_is_static_verifiable_and_preserves_sources(self):
        before = (self.editor / 'project.json').read_bytes()
        manifest = export_site(self.dest, self.editor, self.source)
        self.assertIn('data-live="false"', (self.dest / 'index.html').read_text())
        self.assertTrue((self.dest / 'layout-renderer.js').is_file())
        self.assertEqual((self.dest / 'editor-assets' / self.filename).read_bytes(), self.original)
        self.assertEqual((self.editor / 'project.json').read_bytes(), before)
        for entry in manifest['files']:
            self.assertEqual(hashlib.sha256((self.dest / entry['path']).read_bytes()).hexdigest(), entry['sha256'])
        self.assertFalse((self.dest / 'project.json').exists())

    def test_missing_selected_art_stops_export_without_partial_output(self):
        (self.editor / 'assets' / self.filename).unlink()
        with self.assertRaisesRegex(ValueError, '缺少原图'):
            export_site(self.dest, self.editor, self.source)
        self.assertFalse(self.dest.exists())

    def test_existing_export_is_never_overwritten(self):
        self.dest.mkdir()
        (self.dest / 'keep').write_text('保留')
        with self.assertRaisesRegex(ValueError, '不会覆盖'):
            export_site(self.dest, self.editor, self.source)
        self.assertEqual((self.dest / 'keep').read_text(), '保留')

    def test_no_editor_project_exports_empty_art(self):
        manifest = export_site(self.dest, self.root / 'no-editor', self.source)
        self.assertEqual(manifest['slots'], [])
        self.assertEqual(json.loads((self.dest / 'data/art-layout.json').read_text())['document']['pages'], [])

    def test_interrupted_build_leaves_no_partial_package(self):
        (self.source / 'data/catalog.json').unlink()
        with self.assertRaises(FileNotFoundError):
            export_site(self.dest, self.editor, self.source)
        self.assertFalse(self.dest.exists())
        self.assertEqual(list(self.root.glob('.park-export-*')), [])

    def test_invalid_asset_reference_is_rejected(self):
        self.state['document']['pages'][0]['layouts']['mobile']['elements'][0]['assetId'] = 'missing'
        self.write_state()
        with self.assertRaisesRegex(ValueError, '不存在的素材'):
            art_snapshot(self.editor)


if __name__ == '__main__':
    unittest.main()
