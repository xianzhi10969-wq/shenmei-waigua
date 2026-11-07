#!/usr/bin/env python3
"""Build all term and case pages from the verified, read-only content snapshot."""
from pathlib import Path
import html
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
CATALOG = json.loads((ROOT / 'src/catalog.json').read_text())
TEMPLATE = (ROOT / 'src/term/index.html').read_text()
COQUETTE_ID = 'reczz28HJJL2GJHl'
COLLAGES = {row['termId']: row for row in json.loads((ROOT / 'src/collages.json').read_text())} if (ROOT / 'src/collages.json').exists() else {}


def route_key(record_id):
    return record_id.encode('utf-8').hex()


def escape(value):
    return html.escape(str(value or ''), quote=True)


def paragraphs(value):
    return ''.join('<p>' + escape(part) + '</p>' for part in str(value or '').replace('\\n', '\n').split('\n\n') if part.strip())


def safe_url(value):
    if isinstance(value, dict):
        value = value.get('link', '')
    value = str(value or '').strip()
    markdown_link = re.fullmatch(r'\[[^\]]*\]\((https?://[^\s]+)\)', value)
    if markdown_link:
        value = markdown_link.group(1)
    return value if str(value).startswith(('https://', 'http://')) else ''


def case_markup(case, index, term=None):
    case_id = 'case-' + case['id']
    images = case['images']
    gallery = ''
    caption_markup = '<p class="work-credit">' + escape(case['caption']) + '</p>' if case.get('caption') else ''
    original_name_markup = '<p class="original-name">' + escape(case['originalName']) + '</p>' if case.get('originalName') else ''
    insight_markup = '<p class="case-insight">' + escape(case['why']) + '</p>' if case.get('why') else ''
    if images:
        thumbnails = ''.join(
            f'<button type="button" class="gallery-thumb" data-src="{escape(src)}" aria-label="查看作品图 {i + 1}" aria-pressed="{str(i == 0).lower()}">'
            f'<img src="{escape(src)}" alt="{escape(case["name"])}，作品图 {i + 1}" loading="lazy"></button>'
            for i, src in enumerate(images)
        )
        gallery = (
            f'<div class="gallery"><a class="gallery-main" href="{escape(images[0])}" target="_blank" rel="noopener" aria-label="打开作品原图">'
            f'<img src="{escape(images[0])}" alt="{escape(case["name"])}，作品图 1" loading="lazy"></a>'
            f'<div class="gallery-thumbs" role="group" aria-label="切换作品组图">{thumbnails}</div>'
            f'<p class="gallery-caption"><span class="gallery-count" aria-live="polite">01 / {len(images):02}</span><span>点击大图查看原图 ↗</span></p>'
            f'{caption_markup}</div>'
        )
    official = safe_url(case.get('official', ''))
    source = f'<a class="official" href="{escape(official)}" target="_blank" rel="noopener">官方页 ↗</a>' if official else ''
    destination = '#top' if term and (term['id'] == COQUETTE_ID or term['id'] in COLLAGES) else '#opening'
    back_label = '↑ 回到风格图谱' if destination == '#top' else '↑ 回到词条开场'
    metadata = ' · '.join(str(case.get(field, '')) for field in ['author', 'year', 'medium', 'collection'] if case.get(field))
    layout_class = 'case-layout' if images else 'case-layout text-only'
    return (
        f'<section class="case" id="{case_id}" data-record-id="{case["id"]}" tabindex="-1" aria-labelledby="{case_id}-title">'
        f'<header class="case-header"><p class="case-index">案例 {index + 1:02} <span>／ {escape(case.get("medium"))}</span></p>'
        f'<h3 id="{case_id}-title">{escape(case["name"])}</h3>'
        f'{original_name_markup}'
        f'<p class="case-meta">{escape(metadata)} {source}</p></header>'
        f'<div class="{layout_class}">{gallery}<div class="case-analysis">'
        f'{insight_markup}'
        f'<div class="case-prose">{paragraphs(case.get("method"))}{paragraphs(case.get("whyLong"))}</div>'
        f'<a class="back-to-map" href="{destination}">{back_label}</a></div></div></section>'
    )


def build_term(term):
    chapter = next((c for c in CATALOG['chapters'] if c['name'] in term['chapterNames']), None)
    case_index = {c['id']: c for c in CATALOG['cases']}
    cases = [case_index[cid] for cid in term['caseIds'] if cid in case_index]
    page = TEMPLATE
    page = page.replace('Coquette 词条，向下阅读，向上返回开场', escape(term['name']) + '词条，向下阅读，向上返回开场')
    page = page.replace('Coquette 介绍', escape(term['name']) + '介绍')
    page = page.replace('assets/', '/term-assets/')
    for css in ['styles.css', 'connected.css', 'demo.css', 'scroll.css', 'cases.css']:
        page = page.replace(f'href="{css}"', f'href="/term-assets/{css}"')
    page = page.replace('src="demo.js"', 'src="/term-assets/term-page.js"')
    page = page.replace('</head>', '<link rel="stylesheet" href="/term-assets/site-term.css"></head>')
    page = re.sub(r'<title>.*?</title>', f'<title>{escape(term["name"])} · 审美外挂</title>', page)
    opening_copy_start = page.index('<div class="opening-copy">')
    opening_copy_end = page.index('</div></div></section>', opening_copy_start)
    chinese = bool(re.search(r'[\u3400-\u9fff]', term['name']))
    title_class = 'term-name chinese-name' if chinese else 'term-name'
    definition = '带着调情意味的甜美风格' if term['id'] == COQUETTE_ID else (term['english'] if term['english'] != term['name'] else '')
    intro = term['hook']
    if term['id'] == COQUETTE_ID:
        intro = '镜前的人把缎带系好，又故意留下一截没收齐的带尾。你看得出她为被看见做了准备，却不能确定她想让谁看。'
    pending = '<p class="term-status">更新中</p>' if '已上线' not in term['state'] else ''
    opening_copy = (
        f'<div class="opening-copy">{pending}<h1 class="{title_class}" lang="{"zh-CN" if chinese else "en"}">{escape(term["name"])}</h1>'
        f'<p class="term-definition">{escape(definition)}</p><p class="introduction">{escape(intro or term["core"])}</p>'
    )
    page = page[:opening_copy_start] + opening_copy + page[opening_copy_end:]
    page = page.replace('<section class="opening"', '<section id="opening" class="opening"', 1)
    if term['id'] != COQUETTE_ID:
        start = page.index('<div class="board-shell">')
        end = page.index('<article class="reading"', start)
        board = (
            f'<div class="board-shell"><section class="board text-board" id="top" aria-label="{escape(term["name"])}的作品阅读">'
            f'<h2 class="title">{escape(term["name"])}</h2><p class="map-index"></p>'
            f'<p class="core">{escape(term["core"])}</p></section></div>'
        )
        if term['id'] in COLLAGES:
            collage = COLLAGES[term['id']]
            board = (
                f'<div class="board-shell"><section class="board collage-board" id="top" aria-label="{escape(term["name"])}风格图谱">'
                f'<h2 class="title sr-only">{escape(term["name"])}风格图谱</h2><p class="map-index" hidden></p>'
                f'<object class="collage-art" type="image/svg+xml" aria-label="{escape(term["name"])}拼贴，点击作品查看原图" '
                f'data-desktop="{collage["desktop"]}" data-mobile="{collage["mobile"]}" '
                f'style="--desktop-ratio:{collage["desktopRatio"]};--mobile-ratio:{collage["mobileRatio"]}">'
                f'<a href="{collage["desktop"]}" target="_blank">打开完整拼贴</a></object>'
                f'<p class="core collage-core">{escape(term["core"])}</p></section></div>'
                '<script type="application/json" id="collage-data">' + json.dumps(collage, ensure_ascii=False).replace('</', '<\\/') + '</script>'
            )
            page = page.replace('</head>', '<link rel="stylesheet" href="/term-assets/collage.css"><script defer src="/term-assets/collage.js"></script></head>')
        # Recalculate because the optional head tags shift the substring offsets.
        start = page.index('<div class="board-shell">')
        end = page.index('<article class="reading"', start)
        page = page[:start] + board + page[end:]
    start = page.index('<article class="reading"')
    end = page.index('<section class="notes">', start)
    introduction = term.get('body', '') if '已上线' in term['state'] else ''
    if term.get('hook') and introduction.startswith(term['hook']):
        introduction = introduction[len(term['hook']):].strip()
    body = f'<section class="understanding">{paragraphs(introduction)}</section>' if introduction else ''
    content = ''.join(case_markup(case, i, term) for i, case in enumerate(cases))
    if not cases:
        content = '<p class="content-status">这一页的案例正在整理中。</p>'
    related = [other for name in term.get('nextNames', []) for other in CATALOG['terms'] if other['name'] == name]
    related_markup = ''.join(f'<a href="/terms/{route_key(other["id"])}/">{escape(other["name"])} ↗</a>' for other in related)
    page = page[:start] + f'<article class="reading" aria-label="词条与案例">{body}<section class="cases" aria-labelledby="cases-title"><header class="cases-heading"><h2 id="cases-title">大师如何处理{escape(term["name"])}</h2></header>{content}</section><nav class="related-terms">{related_markup}</nav></article>\n' + page[end:]
    if term['id'] != COQUETTE_ID:
        start = page.index('<section class="notes">')
        end = page.index('<details class="font-credits">', start)
        page = page[:start] + page[end:]
    parent_url = '/#/chapter/' + chapter['id'] if chapter else '/#/chapters'
    parent_name = chapter['name'] + '图鉴' if chapter else '全部专题'
    page = page.replace('<div class="scene">', f'<div class="scene"><nav class="term-parent" data-parents="{escape(json.dumps([c["id"] for c in CATALOG["chapters"] if c["name"] in term["chapterNames"]]))}"><a href="{parent_url}">← {escape(parent_name)}</a><a href="/#/chapters">全部专题</a></nav>')
    origins = json.loads((ROOT / 'src/collage-origins.json').read_text())
    for original, current in origins.items():
        page = page.replace('data-case-image="' + original + '"', 'data-case-image="' + current + '"')
    directory = PUBLIC / 'terms' / route_key(term['id'])
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'index.html').write_text(page)


def main():
    for name in ['styles.css', 'connected.css', 'demo.css', 'scroll.css', 'cases.css']:
        text = (ROOT / 'src/term' / name).read_text().replace('url(assets/', 'url(/term-assets/')
        (PUBLIC / 'term-assets' / name).write_text(text)
    for term in CATALOG['terms']:
        build_term(term)
    build_collage_index()
    case_dir = PUBLIC / 'cases'
    case_dir.mkdir(exist_ok=True)
    (case_dir / 'index.json').write_text(json.dumps(CATALOG['cases'], ensure_ascii=False))
    print(f'Built {len(CATALOG["terms"])} terms and retained {len(CATALOG["cases"])} cases.')


def build_collage_index():
    rows = [{'termId': COQUETTE_ID, 'name': 'Coquette', 'status': 'accepted'}] + list(COLLAGES.values())
    links = ''.join(f'<li><a href="/terms/{route_key(row["termId"])}/?collage=1">{escape(row["name"])}</a><span>{"待审图" if row["status"] == "pending-review" else "已确认拼贴"}</span></li>' for row in rows)
    directory = PUBLIC / 'collages'
    directory.mkdir(exist_ok=True)
    (directory / 'index.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>拼贴目录 · 审美外挂</title><link rel="stylesheet" href="/assets/fonts.css"><style>body{max-width:760px;margin:48px auto;padding:0 24px;background:#f8f6ef;color:#263c32;font:18px/1.8 Georgia,"Songti SC",serif}a{color:inherit;text-underline-offset:5px}h1{font-size:32px;font-weight:400}ul{padding:0;list-style:none}li{display:flex;justify-content:space-between;gap:24px;padding:12px 0;border-bottom:1px solid #263c3222}span{font-size:13px;color:#6c756d}</style><nav><a href="/">← 整站首页</a> · <a href="/#/chapters">全部专题</a></nav><h1>风格图谱 · 拼贴目录</h1><p>21 张拼贴已接入词条。点击直达图谱，往上回到开场，往下阅读完整案例。</p><ul>' + links + '</ul></html>')


if __name__ == '__main__':
    main()
