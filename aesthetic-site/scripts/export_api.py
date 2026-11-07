#!/usr/bin/env python3
"""Export case-sensitive record IDs as portable static file names."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'src/catalog.json').read_text())
public = ROOT / 'public'
for kind in ['chapters', 'terms', 'cases']:
    directory = public / 'api' / kind
    directory.mkdir(parents=True, exist_ok=True)
    for record in data[kind]:
        item = dict(record)
        if kind == 'terms':
            item['cases'] = [case for case_id in item['caseIds'] for case in data['cases'] if case['id'] == case_id]
        key = record['id'].encode('utf-8').hex()
        (directory / (key + '.json')).write_text(json.dumps(item, ensure_ascii=False))
(public / 'api/catalog').write_text(json.dumps({key: data[key] for key in ['generatedAt', 'chapters', 'terms']}, ensure_ascii=False))
