"""Build four editable collages from verified case images and sourced supplements."""
from pathlib import Path
import hashlib
import html
import json
import re
from PIL import Image
from layouts import BOARDS, MASKS

ROOT = Path(__file__).resolve().parent
SOURCES = json.loads((ROOT / 'sources.json').read_text())
TERMS = {board['slug']: board for board in json.loads((ROOT / 'boards.json').read_text())}
FONT = '@font-face{font-family:CN;src:url(assets/fonts/2ce479b703b54faa.woff2)}@font-face{font-family:Display;src:url(assets/fonts/758883b3b8e23791.woff2);font-style:italic}'


def escape(value):
    return html.escape(str(value), quote=True)


def source_url(value):
    match = re.search(r'https?://[^\s)\]]+', value)
    return match.group() if match else ''


def prepare_pieces(slug):
    pieces = []
    for placement in BOARDS[slug]:
        source = SOURCES[placement['source']]
        piece = dict(placement)
        piece.update({
            'original': source['file'], 'case_record_id': source['caseId'],
            'case_title': source['caseTitle'], 'source_url': source_url(source['source']),
            'term_record_id': TERMS[slug]['id'], 'caseImage': source['caseImage'],
            'origin': source['origin'], 'originalSha256': source['sha256'],
        })
        pieces.append(piece)
    return pieces


def render_svg(slug, viewport, pieces, structure=False):
    mobile = viewport == 'mobile'
    width, height = (390, 1110) if mobile else (1200, 1100)
    title_size, subtitle_size = (36, 23) if mobile else (53, 29)
    title_x, title_y, subtitle_y = (12, 49, 79) if mobile else (24, 70, 102)
    term = TERMS[slug]
    style = 'text{fill:#26382f}.piece{cursor:zoom-in}.piece:focus-visible{outline:2px solid #62655c}.number{opacity:0;pointer-events:none;font:14px Georgia;stroke:white;stroke-width:4px;paint-order:stroke}.labels .number{opacity:1}'
    if structure:
        style = 'text{fill:black;font-family:serif}.number{display:none}'
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="group" aria-label="{escape(term["name"])}拼贴">',
             f'<style>{"" if structure else FONT}{style}</style><rect width="100%" height="100%" fill="white"/>',
             f'<text x="{title_x}" y="{title_y}" font-family="CN,serif" font-size="{title_size}">{escape(term["name"])}</text>',
             f'<text x="{title_x+2}" y="{subtitle_y}" font-family="Display,Georgia,serif" font-style="italic" font-size="{subtitle_size}">{escape(term["english"])}</text>']
    for index, piece in enumerate(pieces):
        x, y, w, h, rotation = piece[viewport]
        image_width, image_height = SOURCES[piece['source']]['native']
        crop = piece['crop'] or [0, 0, 1000, 1000]
        cx, cy = crop[0] * image_width / 1000, crop[1] * image_height / 1000
        cw, ch = crop[2] * image_width / 1000, crop[3] * image_height / 1000
        if not piece.get('mask'):
            if cw / ch > w / h:
                new_width = ch * w / h
                cx += (cw - new_width) / 2
                cw = new_width
            else:
                new_height = cw * h / w
                cy += (ch - new_height) / 2
                ch = new_height
        clip = ''
        if piece.get('mask'):
            clip = f'<path d="{MASKS[piece["mask"]]}" transform="scale({image_width/1000} {image_height/1000})"/>'
        elif piece.get('shape') == 'ellipse':
            clip = f'<ellipse cx="{cx+cw/2}" cy="{cy+ch/2}" rx="{cw/2}" ry="{ch/2}"/>'
        elif piece.get('shape') == 'arch':
            clip = f'<path d="M{cx},{cy+ch} V{cy+cw/2} A{cw/2},{cw/2} 0 0 1 {cx+cw},{cy+cw/2} V{cy+ch} Z"/>'
        elif piece.get('shape') == 'torn':
            points = [(0,.03),(.23,0),(.4,.025),(.7,0),(.98,.03),(1,.43),(.975,.7),(1,.98),(.7,1),(.42,.98),(.03,1),(0,.6)]
            clip = '<polygon points="' + ' '.join(f'{cx+u*cw},{cy+v*ch}' for u,v in points) + '"/>'
        uid = f'{slug}-{viewport}-{index}'
        clip_attribute = f' clip-path="url(#{uid})"' if clip else ''
        parts.append(f'<a class="piece" href="{escape(piece["original"])}" data-index="{index}" aria-label="{escape(piece["label"])}，打开原作"><g transform="translate({x} {y}) rotate({rotation} {w/2} {h/2})"><title>{escape(piece["case_title"])} · {escape(piece["label"])}</title>')
        if structure:
            parts.append(f'<rect width="{w}" height="{h}" fill="white" stroke="black"/><text x="6" y="20" font-size="{12 if mobile else 17}">{index+1:02} {escape(piece["label"])}</text>')
        else:
            defs = f'<defs><clipPath id="{uid}">{clip}</clipPath></defs>' if clip else ''
            parts.append(f'<svg width="{w}" height="{h}" viewBox="{cx} {cy} {cw} {ch}" overflow="hidden">{defs}<image href="{escape(piece.get("display", piece["original"]))}" width="{image_width}" height="{image_height}"{clip_attribute}/></svg>')
        parts.append(f'<text class="number" x="6" y="20">{index+1:02}</text></g></a>')
    return ''.join(parts) + '</svg>'


def build():
    (ROOT / 'data').mkdir(exist_ok=True)
    all_pieces = {slug: prepare_pieces(slug) for slug in BOARDS}
    # Save editable black-line structures before rendering the image layers.
    for slug, pieces in all_pieces.items():
        for viewport in ['desktop', 'mobile']:
            (ROOT / f'{slug}-{viewport}-structure.svg').write_text(render_svg(slug, viewport, pieces, True))
    for slug, pieces in all_pieces.items():
        for viewport in ['desktop', 'mobile']:
            (ROOT / f'{slug}-{viewport}.svg').write_text(render_svg(slug, viewport, pieces))
        (ROOT / f'data/{slug}-layout.json').write_text(json.dumps(pieces, ensure_ascii=False, indent=2))
        term = TERMS[slug]
        mapping = json.dumps(pieces, ensure_ascii=False).replace('</', '<\\/')
        page = f'''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(term['name'])} · 拼贴候选</title><link rel="stylesheet" href="styles.css"><nav><a href="index.html">← 四张新拼贴</a><label><input type="checkbox" id="labels">显示编号</label><a href="{slug}-desktop.svg" target="_blank">打开图版</a></nav><main><div class="desktop">{render_svg(slug,'desktop',pieces)}</div><div class="mobile">{render_svg(slug,'mobile',pieces)}</div><p class="core">{len(pieces)} 个片段 · {len(set(p['case_record_id'] for p in pieces))} 个有图案例 · 点击查看完整原作</p></main><dialog id="viewer"><button id="close" aria-label="关闭原图">×</button><img id="full" alt=""><footer><p id="caption"></p><a id="origin" target="_blank" rel="noopener">原作出处 ↗</a><a id="file" target="_blank">单独打开原图 ↗</a></footer></dialog><script id="mapping" type="application/json">{mapping}</script><script src="viewer.js"></script></html>'''
        (ROOT / f'{slug}.html').write_text(page)
    rows = ''.join(f'<a href="{slug}.html"><img src="previews/{slug}-desktop.jpg" alt="{escape(TERMS[slug]["name"])}拼贴"><h2>{escape(TERMS[slug]["name"])}</h2><p>{len(pieces)}片段 · 候选待审</p></a>' for slug,pieces in all_pieces.items())
    (ROOT / 'index.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>四张新拼贴</title><link rel="stylesheet" href="styles.css"><style>header{max-width:1200px;margin:32px auto;padding:0 24px}h1{font-size:32px;font-weight:400}.grid{display:grid;grid-template-columns:repeat(2,1fr);max-width:1200px;margin:auto;gap:32px;padding:24px}.grid a{text-decoration:none}.grid img{width:100%;display:block}.grid h2{font-size:24px;font-weight:400}.grid p{font:14px/1.5 system-ui}@media(max-width:700px){.grid{grid-template-columns:1fr}}</style><header><a href="http://127.0.0.1:8840/collages/">整站拼贴目录 ↗</a><h1>四种感觉，继续拼贴</h1><p>画报风、低能量、拉扯感、暗黑 · 2026.11.07 · 待审图</p></header><div class="grid">' + rows + '</div></html>')
    (ROOT / 'masks.json').write_text(json.dumps(MASKS, ensure_ascii=False, indent=2))
    print({slug: len(pieces) for slug,pieces in all_pieces.items()})


if __name__ == '__main__':
    build()
