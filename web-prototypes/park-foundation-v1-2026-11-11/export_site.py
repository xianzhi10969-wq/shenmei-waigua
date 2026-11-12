#!/usr/bin/env python3
"""Freeze only the site's bound artwork into a portable static directory."""
import argparse
import copy
import hashlib
import importlib.util
import json
import shutil
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EDITOR = ROOT.parent.parent / 'tools/layout-editor-v1'
SLOTS = {s['id'] for s in json.loads((EDITOR / 'site-slots.json').read_text(encoding='utf-8'))}
RUNTIME = ('index.html', 'style.css', 'app.mjs', 'core.mjs', 'art-bridge.mjs')


def art_snapshot(editor_data):
    source = editor_data / 'project.json'
    if not source.exists():
        return {'revision': 0, 'document': {'pages': [], 'assets': []}}, []
    state = json.loads(source.read_text(encoding='utf-8'))
    spec = importlib.util.spec_from_file_location('layout_export_validation', EDITOR / 'server.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.validate(state['document'])
    doc = copy.deepcopy(state['document'])
    doc['pages'] = [p for p in doc['pages'] if p.get('artSlot') in SLOTS]
    used = {e['assetId'] for p in doc['pages'] for layout in p['layouts'].values()
            for e in layout['elements'] if e['type'] == 'image'}
    doc['assets'] = [a for a in doc['assets'] if a['id'] in used]
    files = []
    for asset in doc['assets']:
        name = Path(asset['url']).name
        original = editor_data / 'assets' / name
        if not original.is_file():
            raise ValueError('已绑定素材缺少原图：' + asset['name'])
        asset['url'] = './editor-assets/' + name
        files.append((original, Path('editor-assets') / name))
    # Project title and unbound scenes are editor-only information.
    snapshot = {'revision': state['revision'], 'document': {
        'pages': doc['pages'], 'assets': doc['assets']}}
    return snapshot, files


def export_site(destination, editor_data=EDITOR / 'data', source=ROOT):
    destination = Path(destination).resolve()
    editor_data = Path(editor_data).resolve()
    if destination.exists():
        raise ValueError('输出位置已经存在，请使用新目录；旧导出不会覆盖。')
    art, art_files = art_snapshot(editor_data)
    destination.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix='.park-export-', dir=destination.parent))
    try:
        for name in RUNTIME:
            shutil.copy2(source / name, staging / name)
        html = (staging / 'index.html').read_text(encoding='utf-8')
        config = '<meta name="park-art-layout" content="./data/art-layout.json" data-live="false">'
        if '</head>' not in html:
            raise ValueError('网页入口缺少 head，未导出。')
        (staging / 'index.html').write_text(html.replace('</head>', config + '</head>', 1), encoding='utf-8')
        (staging / 'data').mkdir()
        for name in ('catalog', 'features', 'experience', 'provenance'):
            shutil.copy2(source / 'data' / (name + '.json'), staging / 'data' / (name + '.json'))
        shutil.copytree(source / 'media', staging / 'media')
        shutil.copy2(EDITOR / 'renderer.js', staging / 'layout-renderer.js')
        (staging / 'data/art-layout.json').write_text(json.dumps(art, ensure_ascii=False, indent=2), encoding='utf-8')
        for original, relative in art_files:
            (staging / relative).parent.mkdir(exist_ok=True)
            shutil.copy2(original, staging / relative)
        (staging / '使用说明.txt').write_text(
            '审美外挂 · 可携带功能预览\n\n'
            'Mac 双击「打开预览.command」，保留终端窗口，然后打开 http://127.0.0.1:8873/ 。\n'
            '其他系统：安装 Python 3 后在此目录执行 python3 -m http.server 8873 --bind 127.0.0.1 。\n'
            '也可以把此目录交给支持静态网站的托管服务。直接双击 index.html 不支持读取数据。\n\n'
            '这是导出时的静态快照，之后修改编辑器需要重新导出。导出不代表美术定稿或已发布。\n'
            '只包含当前网页使用的素材位及其引用原图，不包含编辑器其他场景、备份、用户票根或草稿。\n'
            '词条数据沿用 2026-11-07 快照；感觉句仍按原数据留空。\n'
            '票根按浏览器与网址分别保存，换网址前可从票根本导出，再在新网址导入。\n', encoding='utf-8')
        launcher = staging / '打开预览.command'
        launcher.write_text('#!/bin/zsh\ncd "$(dirname "$0")" || exit 1\n'
                            'echo "预览地址：http://127.0.0.1:8873/ （请在浏览器打开）"\n'
                            'python3 -m http.server 8873 --bind 127.0.0.1\n', encoding='utf-8')
        launcher.chmod(0o755)
        manifest = {'artRevision': art['revision'], 'slots': [p['artSlot'] for p in art['document']['pages']], 'files': []}
        for path in sorted(staging.rglob('*')):
            if path.is_file():
                payload = path.read_bytes()
                manifest['files'].append({'path': path.relative_to(staging).as_posix(),
                                          'bytes': len(payload), 'sha256': hashlib.sha256(payload).hexdigest()})
        (staging / 'EXPORT-MANIFEST.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
        staging.rename(destination)
        return manifest
    except BaseException:
        shutil.rmtree(staging)
        raise


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True)
    parser.add_argument('--editor-data', default=str(EDITOR / 'data'))
    args = parser.parse_args()
    try:
        result = export_site(args.output, args.editor_data)
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, '未导出：' + str(error) + '\n')
    print(json.dumps({'output': str(Path(args.output).resolve()), 'files': len(result['files']),
                      'boundSlots': result['slots']}, ensure_ascii=False))
