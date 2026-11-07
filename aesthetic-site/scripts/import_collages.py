#!/usr/bin/env python3
"""Import archived SVG compositions unchanged, with their local dependencies."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
PUBLIC = ROOT / 'public'
CATALOG = json.loads((ROOT / 'src/catalog.json').read_text())
TERMS = {t['id']: t for t in CATALOG['terms']}
MEDIA = {}
for p in (PUBLIC / 'media').iterdir():
    if p.is_file():
        MEDIA[hashlib.sha256(p.read_bytes()).hexdigest()] = '/media/' + p.name


def import_batch(batch, entries, unique=False, status='accepted'):
    source = WORKSPACE / 'output' / batch
    target = PUBLIC / 'collages' / batch
    copied = set()

    def copy(relative):
        path = (source / relative).resolve()
        relative = path.relative_to(source.resolve())
        if relative in copied:
            return
        copied.add(relative)
        destination = target / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, destination)
        if path.suffix == '.svg':
            text = path.read_text()
            refs = re.findall(r'(?:href|xlink:href)="([^"]+)"', text)
            refs += re.findall(r'url\(([^)]+)\)', text)
            for ref in refs:
                ref = ref.strip('"\'')
                if not ref.startswith(('#', 'data:', 'http:', 'https:')):
                    copy(path.parent.relative_to(source.resolve()) / ref)

    rows = []
    unique_sources = json.loads((source / 'new/sources.json').read_text()) if unique else {}
    for slug, term_id in entries:
        term = TERMS[term_id]
        pieces = unique_sources[slug] if unique else json.loads((source / f'data/{slug}-layout.json').read_text())
        normalized = []
        for piece in pieces:
            original = piece['local_original'] if unique else piece['original']
            copy(original)
            file = source / original
            case_id = piece.get('case_record_id')
            case = next((c for c in CATALOG['cases'] if c['id'] == case_id), None)
            image = MEDIA.get(hashlib.sha256(file.read_bytes()).hexdigest())
            normalized.append({
                'original': '/collages/' + batch + '/' + original,
                'title': piece.get('alt') or piece['case_title'],
                'label': piece.get('label', ''),
                'source': piece.get('url') or piece.get('source_url', ''),
                'caseId': case_id if case and case_id in term['caseIds'] else None,
                'caseImage': image if case and image in case['images'] else None,
                'origin': piece.get('origin', 'existing-case'),
            })
        row = {'slug': slug, 'termId': term_id, 'name': term['name'], 'batch': batch,
               'status': status, 'pieces': normalized}
        for viewport in ['desktop', 'mobile']:
            svg = ('new/' if unique else '') + f'{slug}-{viewport}.svg'
            copy(svg)
            root = ET.parse(source / svg).getroot()
            viewbox = root.attrib['viewBox'].split()
            row[viewport] = '/collages/' + batch + '/' + svg
            row[viewport + 'Ratio'] = float(viewbox[2]) / float(viewbox[3])
        rows.append(row)
    for name in ['README.md', 'ROUND-CHANGELOG.md', 'ACCEPTANCE.md']:
        if (source / name).exists():
            copy(name)
    for license in (source / 'licenses').glob('*'):
        if license.is_file():
            copy(license.relative_to(source))
    return rows


def main():
    registry = import_batch('three-pinterest-dense-v2-2026-11-07', [
        ('translucent', 'reczz28HJJL2GNqc'), ('hustle', 'reczz28HJJL2GMxt'), ('new-chinese', 'reczz28HJJL2GNOa')])
    source = WORKSPACE / 'output/collage-unique-v3-2026-11-07/new/sources.json'
    entries = [(slug, next(p['term_record_id'] for p in pieces if p.get('term_record_id')))
               for slug, pieces in json.loads(source.read_text()).items()]
    registry += import_batch('collage-unique-v3-2026-11-07', entries, unique=True)
    candidates = json.loads((WORKSPACE / 'output/remaining-twelve-dense-2026-11-07/candidates.json').read_text())
    registry += import_batch('remaining-twelve-dense-2026-11-07', [(c['slug'], c['id']) for c in candidates], status='pending-review')
    existing_path = ROOT / 'src/collages.json'
    refreshed_ids = {row['termId'] for row in registry}
    if existing_path.exists():
        registry += [row for row in json.loads(existing_path.read_text()) if row['termId'] not in refreshed_ids]
    (ROOT / 'src/collages.json').write_text(json.dumps(registry, ensure_ascii=False, indent=2))
    print(f'Imported {len(registry)} compositions, {sum(len(r["pieces"]) for r in registry)} pieces.')


if __name__ == '__main__':
    main()
