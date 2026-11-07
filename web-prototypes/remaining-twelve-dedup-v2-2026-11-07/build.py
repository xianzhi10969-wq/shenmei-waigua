"""Build editable two-size SVGs and the review gallery from boards.json."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).parent
BOARDS = json.loads((ROOT / "boards.json").read_text(encoding="utf-8"))
SIZES = {"mobile": (390, 1110), "desktop": (1200, 1100)}


def esc(value):
    return html.escape(str(value), quote=True)


def source_link(piece):
    if piece["official"]:
        return piece["official"]
    original_path = piece["source_path"]
    revision = (
        "67f96cc7df340be85db57b35767e8853d691ef24"
        if original_path.startswith("web-prototypes/")
        else "67a9ea780baa4daba728377fdd3f31d3da395f4f"
    )
    from urllib.parse import quote

    return f"https://github.com/xianzhi10969-wq/shenmei-waigua/blob/{revision}/{quote(original_path)}"


def crop_window(piece, slot):
    _, _, width, height, _ = slot
    source_width, source_height = piece["size"]
    focus_x, focus_y = piece.get("focus", [0.5, 0.5])
    scale = min(source_width / width, source_height / height)
    crop_width, crop_height = width * scale, height * scale
    x = min(max(0, focus_x * source_width - crop_width / 2), source_width - crop_width)
    y = min(max(0, focus_y * source_height - crop_height / 2), source_height - crop_height)
    return x, y, crop_width, crop_height


def render_svg(board, mode, *, structure=False):
    width, height = SIZES[mode]
    mobile = mode == "mobile"
    slug = board["slug"]
    title = esc(board["name"])
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="group" aria-label="{title}拼贴">',
        '<rect width="100%" height="100%" fill="white"/>',
        f'<g class="board-heading" fill="#26382f"><text x="{12 if mobile else 24}" y="{49 if mobile else 70}" font-family="CN, Songti SC, Noto Serif CJK SC, serif" font-size="{36 if mobile else 53}">{title}</text>',
        f'<text x="{14 if mobile else 26}" y="{79 if mobile else 102}" font-family="Display, Georgia, serif" font-style="italic" font-size="{23 if mobile else 29}">{esc(board["english"])}</text></g>',
    ]
    for i, piece in enumerate(board["pieces"], 1):
        x, y, w, h, angle = piece[mode]
        source = esc(piece["asset"])
        label = esc(piece["title"])
        transform = f"translate({x} {y}) rotate({angle} {w/2} {h/2})"
        link = f'<a href="{source}" xlink:href="{source}" data-piece="{i-1}" aria-label="{label}，打开原图">'
        out.append(("" if structure else link) + f'<g transform="{transform}"><title>{label}</title>')
        if structure:
            out.append(f'<rect width="{w}" height="{h}" fill="white" stroke="#222"/><text x="7" y="20" font-size="13">{i:02d}</text>')
        else:
            cx, cy, cw, _ = crop_window(piece, piece[mode])
            iw, ih = piece["size"]
            scale = w / cw
            clip = f"{slug}-{mode}-{i}"
            out.append(f'<defs><clipPath id="{clip}"><rect width="{w}" height="{h}"/></clipPath></defs>')
            out.append(f'<image href="{source}" xlink:href="{source}" x="{-cx*scale:.3f}" y="{-cy*scale:.3f}" width="{iw*scale:.3f}" height="{ih*scale:.3f}" clip-path="url(#{clip})"/>')
        out.append("</g>" if structure else "</g></a>")
    return "".join(out) + "</svg>"


def build():
    directory = ROOT / "structure"
    directory.mkdir(exist_ok=True)
    sections = []
    nav = []
    for board in BOARDS:
        slug = board["slug"]
        for mode in SIZES:
            (ROOT / f"{slug}-{mode}.svg").write_text(render_svg(board, mode), encoding="utf-8")
            (directory / f"{slug}-{mode}.svg").write_text(render_svg(board, mode, structure=True), encoding="utf-8")
        svgs = "".join(f'<div class="{mode}">{render_svg(board, mode)}</div>' for mode in SIZES)
        sources = []
        for piece in board["pieces"]:
            title = esc(piece["title"])
            caption = " · 补充参考" if piece["reference"] else ""
            original = f'<a href="{esc(piece["asset"])}">原图</a>'
            source_url = source_link(piece)
            official = f' · <a href="{esc(source_url)}">出处</a>' 
            sources.append(f"<li>{title}{caption} · {original}{official}</li>")
        name = esc(board["name"])
        nav.append(f'<a href="#{slug}">{name}</a>')
        sections.append(f'<section id="{slug}">{svgs}<details><summary>用图与出处</summary><ol>{"".join(sources)}</ol></details></section>')
    data = json.dumps({b["slug"]: [{**p, "official": source_link(p)} for p in b["pieces"]] for b in BOARDS}, ensure_ascii=False).replace("<", "\\u003c")
    page = f"""<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>十二张拼贴 · 去重修订</title><link rel="stylesheet" href="review.css">
<header><h1>十二张拼贴 · 去重修订</h1><p>点图看完整原图。标注「补充参考」的作品来自其他词条或项目素材，原案例关系照旧。</p><nav>{"".join(nav)}</nav></header>
<main>{"".join(sections)}</main>
<dialog id="viewer" aria-labelledby="caption"><button type="button" aria-label="关闭原图">×</button><img alt=""><p id="caption"></p><a target="_blank" rel="noopener">作品出处 ↗</a></dialog>
<script type="application/json" id="boards">{data}</script><script src="review.js"></script></html>
"""
    (ROOT / "index.html").write_text(page, encoding="utf-8")


if __name__ == "__main__":
    build()
