"""Validate draft provenance and render the review copy; production stays untouched."""
from pathlib import Path
import hashlib
import json
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def load(path):
    return json.loads(path.read_text())


def validate_shape(value, rule):
    """Check the schema keyword subset used here, without third-party packages."""
    supported = {'$schema', 'title', 'type', 'items', 'required', 'properties',
                 'additionalProperties', 'const', 'enum', 'minLength', 'minItems', 'uniqueItems'}
    assert set(rule) <= supported, 'Unsupported schema keyword'
    if 'const' in rule:
        assert value == rule['const']
    if 'enum' in rule:
        assert value in rule['enum']
    kind = rule.get('type')
    if kind == 'object':
        assert isinstance(value, dict)
        assert set(rule.get('required', [])) <= set(value)
        props = rule.get('properties', {})
        if rule.get('additionalProperties') is False:
            assert set(value) <= set(props)
        for key, child in value.items():
            if key in props:
                validate_shape(child, props[key])
    elif kind == 'array':
        assert isinstance(value, list) and len(value) >= rule.get('minItems', 0)
        if rule.get('uniqueItems'):
            assert len({json.dumps(x, sort_keys=True) for x in value}) == len(value)
        for child in value:
            validate_shape(child, rule['items'])
    elif kind == 'string':
        assert isinstance(value, str) and len(value) >= rule.get('minLength', 0)
    else:
        assert kind is None, 'Unsupported schema type'


catalog = load(ROOT / 'aesthetic-site/src/catalog.json')
features = load(ROOT / 'aesthetic-site/src/features.json')
audit = load(HERE / 'content-audit.json')
samples = load(HERE / 'samples.json')
sources = {x['id']: x for x in load(HERE / 'sources.json')}
terms = {x['id']: x for x in catalog['terms']}
cases = {x['id']: x for x in catalog['cases']}
feelings = {x['id'] for x in features['feelings']}
validate_shape(samples, load(HERE / 'schema.json'))
assert len({x['termId'] for x in samples}) == len(samples)
assert {x['id'] for x in audit['terms']} == set(terms)
for name, info in audit['sourceFiles'].items():
    assert hashlib.sha256((ROOT / 'aesthetic-site/src' / name).read_bytes()).hexdigest() == info['sha256']
for s in samples:
    original = terms[s['termId']]
    assert s['name'] == original['name'] and s['coreSnapshot'] == original['core']
    assert set(s['relatedTermIds']) <= set(terms)
    assert set(s['feelingIds']) <= feelings
    assert set(s['connections']['sourceIds']) <= set(sources)
    for values in s['sensations'].values():
        for item in values:
            assert set(item['caseIds']) <= set(original['caseIds'])
    for item in s['caseReadings']:
        assert item['caseId'] in original['caseIds']
        assert set(item['sourceIds']) <= set(sources)
    assert not re.search(r'你(?:一定|必然|天生)|你有.*创伤', s['resonance'])
lines = ['# 三条词条内容样稿｜待审', '',
         '本批只增加独立编辑层，现行页面和原核心逐字保留。以下“被什么吸引”和作品阅读属于编辑解读；作品事实另列并提供实际核验的原站。', '',
         '先看读起来是否有你要的“看法”，再决定页面怎么承载。不把这些段落全部堆上首屏。', '']
labels = {'visual': '看', 'sound': '听', 'smell': '闻', 'touch': '触', 'taste': '味', 'emotion': '情绪'}
for s in samples:
    lines += ['## ' + s['name'], '', '**原核心（保留）**', '', s['coreSnapshot'], '',
              '**被什么吸引**', '', s['resonance'], '', '**感觉词**', '']
    for key, values in s['sensations'].items():
        if values:
            lines += [f"- {labels[key]}：" + '、'.join(x['word'] for x in values) +
                      ('（联想）' if all(x['kind'] == 'association' for x in values) else '（作品事实/可观察内容）')]
    lines += ['', '未列出的感官留空。', '', '**与近似感觉的区别**', '', s['distinction'], '',
              '**作品中的呼应**', '', s['connections']['text'], '', '**从作品继续读**', '']
    for item in s['caseReadings']:
        a = cases[item['caseId']]
        links = ' · '.join(f"[{sid} 原站]({sources[sid]['url']})" for sid in item['sourceIds'])
        lines += ['### ' + a['name'], '', item['fact'] + ' ' + links, '',
                  '**编辑解读：**' + item['reading'], '']
    lines += ['**容易被简化的地方**', '', s['simplification'], '', '**继续看**', '',
              '、'.join(terms[i]['name'] for i in s['relatedTermIds']) or '暂不强配反面风格。', '',
              '**本稿的核验边界**', ''] + ['- ' + x for x in s['limits']] + ['', '---', '']
(HERE / 'samples.md').write_text('\n'.join(lines).rstrip() + '\n')
result = {'date': '2026-11-08', 'schemaValid': True, 'samples': len(samples),
          'termCoverage': len(audit['terms']), 'sourceRecords': len(sources),
          'coreSnapshotsUnchanged': True, 'referenceIntegrity': True, 'sourceSnapshotHashesMatch': True,
          'limits': ['Program checks structure and references, not artistic quality or truth of interpretations.',
                     'Validator supports only the explicitly used JSON Schema keyword subset.',
                     'Sources were opened for limited claims; no production browser test performed.']}
(HERE / 'validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result, ensure_ascii=False, indent=2))
