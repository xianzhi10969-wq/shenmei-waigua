"""Check candidate completeness and source protection, never editorial approval."""
import hashlib
import json
import re
from pathlib import Path
from collections import Counter

here = Path(__file__).resolve().parent
root = here.parents[1]
d = json.loads((here/'proposal.json').read_text())
catalog = json.loads((root/'aesthetic-site/src/catalog.json').read_text())
features = json.loads((root/'aesthetic-site/src/features.json').read_text())
rows, vocab = d['entries'], d['vocabulary']
assert len(rows) == len(catalog['terms']) == 101
assert [r['termId'] for r in rows] == [t['id'] for t in catalog['terms']]
assert [r['row'] for r in rows] == [f'{i:03}' for i in range(1,102)]
assert len({r['plainName'] for r in rows}) == 101
assert 60 <= len(vocab) <= 80
assert len({v['id'] for v in vocab}) == len({v['name'] for v in vocab}) == len(vocab)
names = {v['name'] for v in vocab}
aliases = [a for v in vocab for a in v['aliases']]
assert len(aliases) == len(set(aliases)) and not names.intersection(aliases)
v_by_id = {v['id']: v for v in vocab}
assert {v['category'] for v in vocab} == {'五感','情绪'}
assert {v['subcategory'] for v in vocab if v['category']=='五感'} == {'视觉','听觉','触觉','嗅觉','味觉'}
for r, t in zip(rows, catalog['terms']):
    assert r['pageType'] in ('mood','style')
    assert r['originalName'] == t['name'] and r['englishOriginal'] == t['english']
    assert r['nameApproval']=='待签' and r['typeApproval']=='待审' and r['tagApproval']=='待审'
    assert r['reviewNote'] and r['typeReason'] and r['tags']
    assert not re.search(r'如何|打造|训练|提升|从.{0,20}开始|你可以试着',r['plainName'])
    assert len({x['tagId'] for x in r['tags']}) == len(r['tags'])
    for tag in r['tags']:
        assert v_by_id[tag['tagId']]['name'] == tag['name'] and tag['degree'] in (1,2,3)
assert len(d['legacyFeelingMap']) == 40
assert {l['sourceId'] for l in d['legacyFeelingMap']} == {f['id'] for f in features['feelings']}
for item in d['legacyFeelingMap']:
    assert [v_by_id[x]['name'] for x in item['targetIds']] == item['targetNames']
styles = {r['termId']: r for r in rows if r['pageType']=='style'}
expected = {(r['termId'], t['tagId'], t['degree']) for r in styles.values() for t in r['tags']}
actual = {(e['termId'], e['tagId'], e['degree']) for e in d['styleTagEdges']}
assert actual == expected and len(actual)==len(d['styleTagEdges'])
for name in ['忧郁','低能量']:
    assert any(e['name']==name for e in d['styleTagEdges'])
assert next(r for r in rows if r['originalName']=='低能量')['pageType']=='mood'
assert next(r for r in rows if r['originalName']=='颓废美学')['pageType']=='style'
for path, digest in d['metadata']['sourceHashes'].items():
    assert hashlib.sha256((root/path).read_bytes()).hexdigest() == digest
assert d['metadata']['signedNames']==0 and d['metadata']['nextStageAllowed'] is False
for name in ['01-routing.md','02-names.md']:
    assert len(re.findall(r'^\| \d{3} \|', (here/name).read_text(),re.M)) == 101
result = dict(result='PASS', entries=101, pageTypes=dict(Counter(r['pageType'] for r in rows)),
              plainNames=101, signedNames=0, vocabulary=len(vocab), legacyFeelingsCovered=40,
              styleTagEdges=len(actual), sourceHashesUnchanged=True, stage1Allowed=False,
              limits='未验证用户认可、心理解释、外部出处或页面上线；本轮不写正文或运行代码')
(here/'validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))
