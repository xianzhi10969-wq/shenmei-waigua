"""把 v2 各图层拼成 index.html，并写出独立图层文件。
数据：assets/feishu/topics.json（tools/fetch_feishu.py 只读拉取）；线稿：assets/lineart-*.png（tools/prepare_lineart.py 由 Figma 459:2 派生）。"""
import json, os, re, html
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(HERE)
INK="#1E1E1E"; PAPER="#F6F3ED"
G=json.load(open("assets/lineart-geometry.json")); FS=json.load(open("assets/feishu/topics.json"))
T={t["slug"]:t for t in FS["topics"]}; ORDER=[t["slug"] for t in FS["topics"]]
src=open("../p1-p2-reveal-star-v4-2026-10-21/star-svg/B_ink.svg").read()
inner=re.search(r"<svg[^>]*>(.*)</svg>",src,re.S).group(1)
def star_inner(col,bg):
    b=inner.replace("#1a1815",col).replace("var(--bg)",bg); t="i" if col==INK else "c"
    for a,c in ((".o{",f".s{t}o{{"),(".f{",f".s{t}f{{"),(".dot{",f".s{t}d{{"),('class="o"',f'class="s{t}o"'),('class="f"',f'class="s{t}f"'),('class="dot"',f'class="s{t}d"')): b=b.replace(a,c)
    return b
def star_svg(col,bg): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -60 120 120">{star_inner(col,bg)}</svg>'
open("layers/star-B-ink.svg","w").write(star_svg(INK,PAPER)); open("layers/star-B-cream.svg","w").write(star_svg(PAPER,INK))
e=html.escape
def win(kind):
    g=G[kind]; W,H=g["W"],g["H"]; p=kind[0]; n=len(g["lancets"]); mid=n//2
    defs=[f'<clipPath id="{p}-frame"><rect x="0" y="0" width="{W}" height="{H}"/></clipPath>']; cov=[]; lab=[]; hit=[]
    for i,ln in enumerate(g["lancets"]):
        x,y,w,h=ln["body"]; cx,cy,cw,ch=ln["cart"]
        slug=ORDER[i] if kind=="web" else ORDER[(2+i-1)%5]; t=T[slug]
        defs.append(f'<clipPath id="{p}-r{i}"><rect class="rv" x="{x}" y="{y+h}" width="{w}" height="0" data-y="{y}" data-h="{h}"/></clipPath>')
        cov.append(f'<g clip-path="url(#{p}-r{i})"><image class="cov" data-i="{i}" href="{t["cover"]}" x="{x+5}" y="{y+5}" width="{w-10}" height="{h-10}" preserveAspectRatio="xMidYMid meet"/></g>')
        big=(i==mid); zs=(26 if kind=="web" else 24) if big else (20 if kind=="web" else 18)
        lab.append(f'<g class="lab" data-i="{i}"><clipPath id="{p}-t{i}"><rect class="tv" x="{cx}" y="{cy}" width="0" height="{ch}" data-w="{cw}"/></clipPath>'
                   f'<rect class="cfill" x="{cx+8}" y="{cy+8}" width="{cw-16}" height="{ch-16}"/>'
                   f'<g clip-path="url(#{p}-t{i})"><text class="zh" x="{cx+cw/2}" y="{cy+ch*0.55}" font-size="{zs}">{e(t["章节名"])}</text>'
                   f'<text class="la" x="{cx+cw/2}" y="{cy+ch*0.80}" font-size="{9 if kind=="web" else 9}">{e(t["英文名"].upper())}</text></g></g>')
        hit.append(f'<rect class="hit" data-i="{i}" tabindex="0" role="button" aria-label="专题 {e(t["章节名"])}" x="{x}" y="{y-60}" width="{w}" height="{cy+ch-y+60}"/>'
                   f'<rect class="hot-frame" data-i="{i}" x="{x+2}" y="{y+2}" width="{w-4}" height="{h-4}" style="display:none"/>')
    r=g["rose"]; rs=r["R"]*1.55
    covers=f'<g clip-path="url(#{p}-frame)">{"".join(cov)}</g>'; labs=f'<g clip-path="url(#{p}-frame)">{"".join(lab)}</g>'
    # 独立图层文件
    os.makedirs(f"layers/{kind}",exist_ok=True)
    open(f"layers/{kind}/03-covers.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">'+re.sub(r'<g clip-path="url\(#.-r\d\)">(.*?)</g>',r"\1","".join(cov)).replace('href="assets','href="../../assets')+"</svg>")
    open(f"layers/{kind}/04-titles.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><style>text{{fill:{INK};text-anchor:middle;font-family:serif}}.cfill{{fill:none}}</style>'+re.sub(r'<clipPath.*?</clipPath>|clip-path="[^"]*"',"","".join(lab))+"</svg>")
    open(f"layers/{kind}/05-star.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><svg x="{r["cx"]-rs/2}" y="{r["cy"]-rs/2}" width="{rs}" height="{rs}" viewBox="-60 -60 120 120">{star_inner(INK,PAPER)}</svg></svg>')
    open(f"layers/{kind}/01-lineart.README.txt","w").write(f"结构线稿层 = ../../assets/lineart-{kind}.png（{W}×{H}，由 Figma 459:2 原图裁出并清除占位标注，见 tools/prepare_lineart.py）\n")
    return (f'<div class="win {kind}"><img class="lineart" src="assets/lineart-{kind}.png" alt="" width="{W}" height="{H}"><img class="orn" src="assets/ornament-{kind}.png" alt="" width="{W}" height="{H}">'
            f'<svg viewBox="0 0 {W} {H}" aria-label="彩窗专题入口"><defs>{"".join(defs)}</defs><g class="L-covers">{covers}</g><g class="L-titles">{labs}</g>'
            f'<use class="roseStar" href="#starInk" x="{r["cx"]-rs/2}" y="{r["cy"]-rs/2}" width="{rs}" height="{rs}"/><g class="L-hit">{"".join(hit)}</g></svg></div>')
star_sym=f'<svg width="0" height="0" style="position:absolute"><defs><symbol id="starInk" viewBox="-60 -60 120 120">{star_inner(INK,PAPER)}</symbol></defs></svg>'
tpl=open("tools/page_template.html").read()
LAY={k:{kk:G[k][kk] for kk in ("W","H","rose","sill")} for k in G}
TOP={s:dict(zh=T[s]["章节名"],la=T[s]["英文名"],cover=T[s]["cover"],define=T[s]["一句定义"],credit=T[s]["封面图注"],record=T[s]["record_id"]) for s in ORDER}
html_=(tpl.replace("%%WEB%%",win("web")).replace("%%MOB%%",win("mobile")).replace("%%STAR_SYM%%",star_sym)
      .replace("%%STAR_INK%%",star_svg(INK,PAPER)).replace("%%STAR_CREAM%%",star_svg(PAPER,INK))
      .replace("%%LAYOUT%%",json.dumps(LAY)).replace("%%TOPICS%%",json.dumps(TOP,ensure_ascii=False)))
open("index.html","w").write(html_); print("index.html",len(html_))
