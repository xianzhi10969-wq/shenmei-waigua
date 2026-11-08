"""Read repository snapshots; never modify source content or production pages."""
from pathlib import Path
import hashlib
import json
import subprocess
from collections import Counter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SOURCE = ROOT / 'aesthetic-site/src'


def read(name):
    return json.loads((SOURCE / name).read_text())


def run():
    catalog, features, collages = read('catalog.json'), read('features.json'), read('collages.json')
    cases = {x['id']: x for x in catalog['cases']}
    # Coquette is the original shared template; the 20-entry manifest lists additions.
    collage_ids = {x['termId'] for x in collages}
    collage_ids.update(x['id'] for x in catalog['terms'] if x['name'] == 'Coquette')
    new_fields = ['resonance', 'sensations', 'distinction', 'connections', 'caseReadings', 'relatedFeelings']
    rows = []
    for t in catalog['terms']:
        linked = [cases[x] for x in t['caseIds'] if x in cases]
        rows.append({
            'id': t['id'], 'name': t['name'], 'state': t['state'], 'chapters': t['chapterNames'],
            'url': '/terms/' + t['id'].encode().hex() + '/',
            'corePresent': bool(t['core'].strip()), 'bodyPresent': bool(t['body'].strip()),
            'mistakePresent': bool(t['mistake'].strip()), 'legacyStepsCount': len(t['steps']),
            'caseIds': [a['id'] for a in linked], 'caseCount': len(linked),
            'brokenCaseIds': [x for x in t['caseIds'] if x not in cases],
            'rawMedia': sorted({a['medium'] for a in linked if a['medium']}),
            'sourceLinkCount': sum(bool(a['official']) for a in linked),
            'imageCaseCount': sum(bool(a['images']) for a in linked),
            'collageInMaster': t['id'] in collage_ids,
            'newFieldsAbsent': [key for key in new_fields if key not in t],
            'nextAction': '保留更新中，不补造新字段' if '已上线' not in t['state'] else
                          ('先核验作品与补足解释' if len(linked) < 2 else '可进入编辑样稿候选池'),
        })
    linked_ids = {i for r in rows for i in r['caseIds']}
    summary = {
        'chapters': len(catalog['chapters']), 'terms': len(rows),
        'publishedTerms': sum('已上线' in r['state'] for r in rows),
        'pendingTerms': sum('已上线' not in r['state'] for r in rows),
        'retainedCases': len(cases), 'unlinkedCaseIds': sorted(set(cases) - linked_ids),
        'termsWithCases': sum(r['caseCount'] > 0 for r in rows),
        'termsWithCore': sum(r['corePresent'] for r in rows),
        'termsWithMistake': sum(r['mistakePresent'] for r in rows),
        'termsWithLegacySteps': sum(r['legacyStepsCount'] > 0 for r in rows),
        'collagesInMaster': len(collage_ids),
        'caseCountDistribution': dict(sorted(Counter(r['caseCount'] for r in rows).items())),
        'features': {k: len(v) for k, v in features.items()},
    }
    report = {
        'date': '2026-11-08', 'scope': 'repository snapshot only; not a live Feishu audit',
        'sourceRevisions': catalog['revisions'],
        'sourceFiles': {name: {'gitBlob': subprocess.check_output(
            ['git', 'hash-object', str(SOURCE / name)], text=True).strip(),
            'sha256': hashlib.sha256((SOURCE / name).read_bytes()).hexdigest()}
            for name in ['catalog.json', 'features.json', 'collages.json']},
        'notes': ['rawMedia are original labels, not normalized medium counts',
                  'sourceLinkCount means non-empty link, not verified claim',
                  'newFieldsAbsent describes schema gaps, not absence of good prose',
                  'master collage integration is not visual acceptance'],
        'summary': summary, 'terms': rows,
    }
    (HERE / 'content-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    lines = [
        '# 101词条内容盘点｜2026-11-08', '',
        '只读核对仓库快照；未实时读取飞书。来源blob与逐ID字段见[JSON](content-audit.json)。', '',
        '## 实际范围', '',
        f"24章节、{summary['terms']}词条：{summary['publishedTerms']}条原状态已上线、{summary['pendingTerms']}条更新中；{summary['retainedCases']}保留案例。",
        f"{summary['termsWithCases']}词条有案例，{summary['termsWithCore']}条有核心短文，{summary['termsWithMistake']}条有‘做俗了’，{summary['termsWithLegacySteps']}条保留三个做法素材。",
        f"主分支有{summary['collagesInMaster']}条拼贴（20条manifest＋原Coquette），不含其他Work的新增候选。", '',
        '新字段需要编辑补充，不能等同于现有内容全部无效；已有core和whyLong中已有从人出发的好内容。',
        '媒介列保留原始标签，未把“街头摄影”和“黑白摄影”当成不同大类证明跨媒介。来源链接有值不等于内容核验完成。', '',
        '## 逐条任务底表', '',
        '| 词条 | 原状态 | 核心 | 案例 | 有出处/有图案例 | 原始媒介标签 | 拼贴在master | 下一动作 |',
        '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ]
    for r in rows:
        cells = [r['name'], '、'.join(r['state']), '有' if r['corePresent'] else '空', str(r['caseCount']),
                 f"{r['sourceLinkCount']}/{r['imageCaseCount']}", '、'.join(r['rawMedia']) or '—',
                 '是' if r['collageInMaster'] else '否', r['nextAction']]
        lines.append('| ' + ' | '.join(v.replace('|', '\\|').replace('\n', ' ') for v in cells) + ' |')
    (HERE / 'content-audit.md').write_text('\n'.join(lines) + '\n')
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    run()
