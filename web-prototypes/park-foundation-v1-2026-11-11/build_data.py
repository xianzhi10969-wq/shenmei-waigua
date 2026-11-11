#!/usr/bin/env python3
"""Copy factual snapshots only; never read old UI styles or manufacture new content."""
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent.parent
SOURCE = PROJECT / 'aesthetic-site'


def build():
    target = ROOT / 'data'
    target.mkdir(parents=True, exist_ok=True)
    (ROOT / 'media').mkdir(exist_ok=True)
    catalog = json.loads((SOURCE / 'src/catalog.json').read_text())
    features = json.loads((SOURCE / 'src/features.json').read_text())
    paths = set()
    def walk(value):
        if isinstance(value, dict):
            return {k: walk(v) for k, v in value.items()}
        if isinstance(value, list): return [walk(v) for v in value]
        if isinstance(value, str) and value.startswith('/media/'):
            paths.add(value)
            return '.' + value
        return value
    catalog = walk(catalog)
    features = {k: walk(features[k]) for k in ('questions', 'imagery', 'resources')}
    missing = []
    for path in sorted(paths):
        origin = SOURCE / 'public' / path.lstrip('/')
        destination = ROOT / path.lstrip('/')
        if origin.is_file():
            if not destination.exists(): shutil.copy2(origin, destination)
        else: missing.append(path)
    def write(name, value):
        (target / name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')
    write('catalog.json', catalog)
    # Preserve the exact factual snapshot bytes. The local server serves /media/ at its root.
    shutil.copy2(SOURCE / 'src/catalog.json', target / 'catalog.json')
    write('features.json', features)
    config_file = target / 'experience.json'
    if not config_file.exists():
        write('experience.json', {
            'schema': 1, 'feelings': [], 'termFeelingIds': {}, 'termStatements': {},
            'questionsReviewed': False,
            'note': '第一人称感觉句和关联待用户整理；不从旧形容词入口推断。'
        })
    source_status = json.loads((SOURCE / 'src/source-status.json').read_text())
    write('provenance.json', {
        'snapshotDate': source_status['verifiedDate'],
        'source': source_status['source'],
        'liveFeishuReadThisRound': False,
        'sourceHashes': {name: hashlib.sha256((SOURCE/'src'/name).read_bytes()).hexdigest()
                         for name in ('catalog.json', 'features.json', 'source-status.json')},
        'sourceRevisions': source_status['revisions'],
        'counts': {'chapters': len(catalog['chapters']), 'terms': len(catalog['terms']),
                   'cases': len(catalog['cases']), 'imagery': len(features['imagery']),
                   'questions': len(features['questions']), 'resources': len(features['resources']),
                   'firstPersonFeelings': len(json.loads(config_file.read_text()).get('feelings', [])), 'copiedMedia': len(paths)-len(missing)},
        'missingMedia': missing,
        'notImported': ['旧 CSS、插画与版式', '旧 40 个形容词感觉入口', '旧感觉分流关系'],
        'pending': ['全站配色与像素尺寸', '20–30 条第一人称感觉句及关联',
                    '好奇心问题改写审核', 'P5 三类布景的内容定义', '新美术与实际浏览器验收']
    })
    print(json.dumps({'counts': json.loads((target/'provenance.json').read_text())['counts'],
                      'missingMedia': missing}, ensure_ascii=False))


if __name__ == '__main__': build()
