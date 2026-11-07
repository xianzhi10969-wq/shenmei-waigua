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


def escape(value):
    return html.escape(str(value or ''), quote=True)


def paragraphs(value):
    return ''.join('<p>' + escape(part) + '</p>' for part in str(value or '').replace('\\n', '\n').split('\n\n') if part.strip())


def safe_url(value):
    if isinstance(value, dict):
        value = value.get('link', '')
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
    supplementary = []
    for field, label in [('scene', '画面'), ('detail', '细节'), ('method', '手法'), ('twist', '反转'), ('absence', '缺席'), ('extra', '补充讲解')]:
        if case.get(field):
            supplementary.append(f'<section class="case-detail"><h4>{label}</h4>{paragraphs(case[field])}</section>')
    official = safe_url(case.get('official', ''))
    source = f'<a class="official" href="{escape(official)}" target="_blank" rel="noopener">查看作品官方页面 ↗</a>' if official else ''
    destination = '#top' if term and term['id'] == COQUETTE_ID else '#opening'
    back_label = '↑ 回到风格图谱' if destination == '#top' else '↑ 回到词条开场'
    metadata = ' · '.join(str(case.get(field, '')) for field in ['author', 'year', 'collection'] if case.get(field))
    layout_class = 'case-layout' if images else 'case-layout text-only'
    return (
        f'<section class="case" id="{case_id}" data-record-id="{case["id"]}" tabindex="-1" aria-labelledby="{case_id}-title">'
        f'<header class="case-header"><p class="case-index">案例 {index + 1:02} <span>／ {escape(case.get("medium"))}</span></p>'
        f'<h3 id="{case_id}-title">{escape(case["name"])}</h3>'
        f'{original_name_markup}'
        f'<p class="case-meta">{escape(metadata)}</p></header>'
        f'<div class="{layout_class}">{gallery}<div class="case-analysis">'
        f'{insight_markup}'
        f'<div class="case-prose">{paragraphs(case.get("whyLong"))}{"".join(supplementary)}</div>{source}'
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
        page = page[:start] + (
            f'<div class="board-shell"><section class="board text-board" id="top" aria-label="{escape(term["name"])}的作品阅读">'
            f'<h2 class="title">{escape(term["name"])}</h2><p class="map-index"></p>'
            f'<p class="core">{escape(term["core"])}</p></section></div>'
        ) + page[end:]
    start = page.index('<article class="reading"')
    end = page.index('<section class="notes">', start)
    body = '<section class="understanding"><p>Coquette 最初并不是一种关于粉色、蕾丝、蝴蝶结的美学，而是一种关于「如何制造吸引力」的行为艺术。这件事早在一百多年前，就有社会学家专门研究过。</p></section>' if term['id'] == COQUETTE_ID else ''
    content = ''.join(case_markup(case, i, term) for i, case in enumerate(cases))
    if not cases:
        content = '<p class="content-status">这一页的案例正在整理中。</p>'
    related = [other for name in term.get('nextNames', []) for other in CATALOG['terms'] if other['name'] == name]
    related_markup = ''.join(f'<a href="/terms/{other["id"]}/">{escape(other["name"])} ↗</a>' for other in related)
    page = page[:start] + f'<article class="reading" aria-label="词条与案例">{body}<section class="cases" aria-labelledby="cases-title"><header class="cases-heading"><h2 id="cases-title">看它如何成为画面。</h2></header>{content}</section><nav class="related-terms">{related_markup}</nav></article>\n' + page[end:]
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
    directory = PUBLIC / 'terms' / term['id']
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'index.html').write_text(page)


def main():
    for name in ['styles.css', 'connected.css', 'demo.css', 'scroll.css', 'cases.css']:
        text = (ROOT / 'src/term' / name).read_text().replace('url(assets/', 'url(/term-assets/')
        (PUBLIC / 'term-assets' / name).write_text(text)
    for term in CATALOG['terms']:
        build_term(term)
    case_dir = PUBLIC / 'cases'
    case_dir.mkdir(exist_ok=True)
    (case_dir / 'index.json').write_text(json.dumps(CATALOG['cases'], ensure_ascii=False))
    print(f'Built {len(CATALOG["terms"])} terms and retained {len(CATALOG["cases"])} cases.')


if __name__ == '__main__':
    main()
