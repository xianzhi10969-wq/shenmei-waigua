#!/usr/bin/env python3
"""Rebuild the feature data bundle from the included read-only snapshots."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

def main():
    data = json.loads((ROOT / 'src/catalog.json').read_text())
    data.update(json.loads((ROOT / 'src/features.json').read_text()))
    for case in data['cases']:
        case['keep'] = True
    (ROOT / 'public/features/data.json').write_text(json.dumps(data, ensure_ascii=False))
    print('Rebuilt feature data from the included snapshot.')

if __name__ == '__main__':
    main()
