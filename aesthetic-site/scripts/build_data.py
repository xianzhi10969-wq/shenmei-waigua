#!/usr/bin/env python3
"""Build the public, static snapshot from Feishu Base record exports."""
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data' / 'source'
CACHE = ROOT / 'data' / '.cache'
DIST = ROOT / 'dist'
MEDIA = DIST / 'media'
MEDIA.mkdir(parents=True, exist_ok=True)


def load(name):
    return [json.loads(line) for line in (SOURCE / f'{name}.ndjson').open()]


media_map_path = CACHE / 'media-map.json'
media_map = json.loads(media_map_path.read_text()) if media_map_path.exists() else {}
used_media = set()


def asset(attachment):
    if not attachment:
        return ''
    token = attachment.get('file_token')
    if not token:
        return ''
    output = MEDIA / f'{token}.webp'
    if not output.exists():
        item = media_map.get(token)
        if not item:
            return ''
        source = CACHE / item['path']
        if not source.exists():
            return ''
        try:
            with Image.open(source) as im:
                im = ImageOps.exif_transpose(im)
                im.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
                im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
                im.save(output, 'WEBP', quality=79, method=5)
        except Exception:
            suffix = source.suffix.lower() or '.bin'
            output = MEDIA / f'{token}{suffix}'
            shutil.copyfile(source, output)
    elif not output.exists():
        return ''
    used_media.add(output.name)
    return 'media/' + output.name


def assets(row, field):
    return [path for item in row.get(field) or [] if (path := asset(item))]


chapters_raw = load('chapters')
terms_raw = load('terms')
cases_raw = load('cases')
feelings_raw = load('feelings')
sections_raw = load('chapter-sections')
curiosity_raw = load('curiosity')
imagery_raw = load('imagery')

chapters = []
for row in sorted(chapters_raw, key=lambda x: x.get('序号') or 999):
    cid, name = row['record_id'], row.get('章节名') or ''
    sections = []
    for s in sections_raw:
        linked = any(item.get('id') == cid for item in s.get('所属章节') or [])
        if linked or (s.get('章节') == name and not s.get('所属章节')):
            sections.append({
                'id': s['record_id'], 'order': s.get('序号') or 0,
                'title': s.get('小标题') or '', 'text': s.get('段落') or '',
                'cover': assets(s, '图')[0] if s.get('图') else '',
                'caption': s.get('图注') or '',
            })
    sections.sort(key=lambda s: s['order'])
    chapters.append({
        'id': cid, 'name': name, 'displayName': row.get('章名展示') or '',
        'english': row.get('英文名') or '', 'order': row.get('序号') or 0,
        'definition': row.get('一句定义') or '', 'hook': row.get('钩子') or '',
        'method': row.get('本章分法') or '',
        'termNames': [part.strip() for part in (row.get('词条') or '').replace('，', ',').split(',') if part.strip()],
        'body': row.get('章首页正文') or '', 'definer': row.get('定义者') or '',
        'definerStory': row.get('定义者的故事') or '',
        'cover': assets(row, '封面图')[0] if row.get('封面图') else '',
        'coverCaption': row.get('封面图注') or '', 'state': row.get('状态') or '',
        'sections': sections if any(s['title'] for s in sections) else [],
    })

terms = []
for row in terms_raw:
    terms.append({
        'id': row['record_id'], 'name': row.get('词') or '', 'english': row.get('英文') or '',
        'chapterNames': row.get('所属章节') or [], 'order': row.get('章内序号') or 0,
        'position': row.get('在本章的位置') or '', 'state': row.get('状态') or [],
        'hook': row.get('钩子') or '', 'core': row.get('核心') or '',
        # 正文 is a legacy long-form compilation (it repeats hook, cases and methods).
        # The term page is composed from their dedicated Base fields and case records.
        'steps': [row.get('做法1') or '', row.get('做法2') or '', row.get('做法3') or ''],
        'mistake': row.get('做俗了') or '', 'caseNames': row.get('案例') or '',
        'nextNames': row.get('接着看') or [],
        'colors': row.get('配色') or '', 'searchTerms': row.get('检索词') or '',
        'cover': assets(row, '封面图')[0] if row.get('封面图') and '已上线' in (row.get('状态') or []) else '',
    })

cases = []
for row in cases_raw:
    cases.append({
        'id': row['record_id'], 'name': row.get('作品名') or '',
        'originalName': row.get('作品原文名') or '', 'termName': row.get('所属词条') or '',
        'order': row.get('顺序') or 0, 'keep': bool(row.get('是否保留')),
        'author': row.get('作者') or '', 'year': row.get('年份') or '',
        'medium': row.get('媒介') or '', 'collection': row.get('收藏地或出品方') or '',
        'subtitle': row.get('出处行') or '',
        'images': assets(row, '图') if row.get('是否保留') else [],
        'caption': row.get('图注') or '', 'why': row.get('一句为什么') or '',
        'whyLong': row.get('为什么好') or '', 'scene': row.get('画面') or '',
        'detail': row.get('细节') or '', 'method': row.get('手法') or '',
        'twist': row.get('反转') or '', 'absence': row.get('缺席') or '',
        'extra': row.get('补充讲解') or '', 'official': row.get('官方页') or '',
        'source': row.get('事实来源') or '',
    })

feelings = [{
    'id': row['record_id'], 'name': row.get('感觉词') or '',
    'alias': row.get('也叫') or '', 'description': row.get('一句解释') or '',
    'order': row.get('顺序') or 0, 'chapterNames': row.get('推荐章节') or [],
    'termNames': row.get('推荐词条') or [],
} for row in sorted(feelings_raw, key=lambda x: x.get('顺序') or 999)]

online_term_ids = {t['id'] for t in terms if '已上线' in t['state']}
questions = [{
    'id': row['record_id'], 'question': row.get('问题') or '',
    'intro': row.get('展开导语') or '', 'order': row.get('排序') or 999,
    'termIds': [item['id'] for item in row.get('关联词条') or []
                if item.get('id') in online_term_ids],
} for row in curiosity_raw if '可用' in (row.get('状态') or []) and row.get('问题')]
questions.sort(key=lambda q: (q['order'], q['id']))

imagery = [{
    'id': row['record_id'], 'title': row.get('题目') or '',
    'theme': row.get('主题') or '',
    'operation': (row.get('运算类型') or [''])[0],
    'imageA': row.get('意象 A') or '', 'imageB': row.get('意象 B') or '',
    'prompt': row.get('提示语') or '', 'order': row.get('排序') or 999,
} for row in imagery_raw if '可用' in (row.get('状态') or []) and row.get('题目')]
imagery.sort(key=lambda item: (item['order'], item['id']))

data = {'generatedAt': datetime.now(timezone.utc).isoformat(), 'baseToken': 'IGctbcuwPaE6hMsmAoicJddpn3U',
        'chapters': chapters, 'terms': terms, 'cases': cases, 'feelings': feelings,
        'questions': questions, 'imagery': imagery}
(DIST / 'data.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
for file in MEDIA.iterdir():
    if file.is_file() and file.name not in used_media:
        file.unlink()
print(f'Built {len(chapters)} chapters, {len(terms)} terms, {len(cases)} cases, {len(feelings)} feelings, {len(questions)} questions, {len(imagery)} imagery prompts, {len(used_media)} media files')
