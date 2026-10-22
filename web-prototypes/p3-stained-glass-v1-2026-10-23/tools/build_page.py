"""把各图层拼成 index.html（内联 SVG，便于逐线揭示），同时写出独立图层文件。"""
import json, os, re
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(HERE)
INK="#1E1E1E"; PAPER="#F6F3ED"
TOP=json.load(open("assets/covers/topics.json"))
ORDER=["liubai","melancholy","eros","arcadia","yugen"]

# ---- 星 B：沿用 v4 star-svg/B_ink.svg 的几何，仅把颜色统一到双色
src=open("../p1-p2-reveal-star-v4-2026-10-21/star-svg/B_ink.svg").read()
inner=re.search(r"<svg[^>]*>(.*)</svg>",src,re.S).group(1)
def star_inner(col,bg):
    b=inner.replace("#1a1815",col).replace("var(--bg)",bg)
    t="i" if col==INK else "c"
    for a,c in ((".o{",f".s{t}o{{"),(".f{",f".s{t}f{{"),(".dot{",f".s{t}d{{"),('class="o"',f'class="s{t}o"'),('class="f"',f'class="s{t}f"'),('class="dot"',f'class="s{t}d"')): b=b.replace(a,c)
    return b
def star_svg(col,bg):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -60 120 120">{star_inner(col,bg)}</svg>'
open("layers/star-B-ink.svg","w").write(star_svg(INK,PAPER))
open("layers/star-B-cream.svg","w").write(star_svg(PAPER,INK))

def paths_of(fn):
    s=open(fn).read(); s=re.sub(r"<svg[^>]*>|</svg>|<style>.*?</style>","",s,flags=re.S)
    return s.replace("<path ",'<path pathLength="1" ')

def win_svg(kind):
    L=json.load(open(f"layers/{kind}/layout.json")); W,H=L["W"],L["H"]; p=kind[0]
    fr=L["clipFrame"]
    defs=[f'<clipPath id="{p}-frame"><rect x="{fr[0]}" y="0" width="{fr[1]-fr[0]}" height="{H}"/></clipPath>']
    covers=[];cart=[];hits=[];slots=[]
    n=len(L["lancets"])
    for ln in L["lancets"]:
        i=ln["i"]; x,y,w,h=ln["body"]
        if kind=="web": slug=ORDER[i]; img=f"assets/covers/{slug}-web-{'center' if i==2 else 'side'}.png"
        else: slug=ORDER[(2+i-1)%5]; img=f"assets/covers/{slug}-mob.png"
        defs.append(f'<clipPath id="{p}-c{i}"><path d="{ln["clip"]}"/></clipPath>')
        defs.append(f'<clipPath id="{p}-r{i}"><rect class="rv" x="{x-8:.1f}" y="{y+h:.1f}" width="{w+16:.1f}" height="0" data-y="{y:.1f}" data-h="{h:.1f}"/></clipPath>')
        covers.append(f'<g clip-path="url(#{p}-c{i})"><g clip-path="url(#{p}-r{i})"><image class="cov" data-i="{i}" data-slug="{slug}" href="{img}" x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" preserveAspectRatio="xMidYMid slice"/></g></g>')
        cx,cy,cw,ch=ln["cart"]; mx=cx+cw/2
        zs=30 if (kind=="web" and i==2) or (kind=="mobile" and i==1) else 26
        cart.append(f'<g class="lab" data-i="{i}"><clipPath id="{p}-t{i}"><rect class="tv" x="{cx}" y="{cy}" width="0" height="{ch}" data-w="{cw}"/></clipPath>'
                    f'<rect class="cfill" x="{cx+5}" y="{cy+5}" width="{cw-10}" height="{ch-10}" rx="5"/>'
                    f'<g clip-path="url(#{p}-t{i})"><text class="zh" x="{mx:.1f}" y="{cy+ch*0.56:.1f}" font-size="{zs}">{TOP[slug]["zh"]}</text>'
                    f'<text class="la" x="{mx:.1f}" y="{cy+ch*0.84:.1f}" font-size="{11 if kind=="web" else 12}">{TOP[slug]["la"].upper()}</text></g></g>')
        hits.append(f'<path class="hit" data-i="{i}" tabindex="0" role="button" aria-label="专题 {TOP[slug]["zh"]}" d="{ln["clip"]} M{cx},{cy} h{cw} v{ch} h{-cw}Z"/>')
        hits.append(f'<path class="hot-frame" data-i="{i}" d="{ln["clip"]}" style="display:none"/>')
    for sl in L["slots"]:
        if "ellipse" in sl: a=sl["ellipse"]; g=f'<ellipse cx="{a[0]}" cy="{a[1]}" rx="{a[2]}" ry="{a[3]}"/>'; tx,ty=a[0],a[1]
        elif "circle" in sl: a=sl["circle"]; g=f'<circle cx="{a[0]}" cy="{a[1]}" r="{a[2]}"/>'; tx,ty=a[0],a[1]-a[2]-8
        else: a=sl["rect"]; g=f'<rect x="{a[0]}" y="{a[1]}" width="{a[2]}" height="{a[3]}"/>'; tx,ty=a[0]+a[2]/2,a[1]+a[3]+22
        slots.append(f'{g}<text x="{tx}" y="{ty}">{sl["label"]}</text>')
    rose=L["rose"]
    trac=paths_of(f"layers/{kind}/01-tracery.svg"); car=paths_of(f"layers/{kind}/04-cartouche.svg")
    cov="".join(covers); 
    if kind=="mobile": cov=f'<g clip-path="url(#{p}-frame)">{cov}</g>'; labs=f'<g clip-path="url(#{p}-frame)">{"".join(cart)}</g>'
    else: labs="".join(cart)
    rs=rose["R"]*1.6
    body=(f'<defs>{"".join(defs)}</defs><g class="L-covers">{cov}</g><g class="L-tracery">{trac}</g>'
          f'<g class="L-cart">{car}</g><g class="L-titles">{labs}</g><g class="L-slots">{"".join(slots)}</g>'
          f'<use class="roseStar" href="#starInk" x="{rose["cx"]-rs/2*1.0:.1f}" y="{rose["cy"]-rs/2:.1f}" width="{rs:.1f}" height="{rs:.1f}"/>'
          f'<g class="L-hit">{"".join(hits)}</g>')
    # 独立图层文件
    open(f"layers/{kind}/02-ornament-slots.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><style>*{{fill:none;stroke:{INK};stroke-width:1;stroke-dasharray:4 5}}text{{fill:{INK};stroke:none;font:16px serif;text-anchor:middle}}</style>{"".join(slots)}</svg>')
    open(f"layers/{kind}/03-covers.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}"><defs>{"".join(d for d in defs if "-r" not in d)}</defs>'+re.sub(r'<g clip-path="url\(#.-r\d\)">(.*?)</g>',r"\1",cov).replace('href="assets','href="../../assets')+"</svg>")
    open(f"layers/{kind}/05-star.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><svg x="{rose["cx"]-rs/2:.1f}" y="{rose["cy"]-rs/2:.1f}" width="{rs:.1f}" height="{rs:.1f}" viewBox="-60 -60 120 120">{star_inner(INK,PAPER)}</svg></svg>')
    return f'<svg class="win {kind}" viewBox="0 0 {W} {H}" aria-label="彩窗专题入口">{body}</svg>', L

web_svg,LW=win_svg("web"); mob_svg,LM=win_svg("mobile")
star_sym=f'<svg width="0" height="0" style="position:absolute"><defs><symbol id="starInk" viewBox="-60 -60 120 120">{star_inner(INK,PAPER)}</symbol></defs></svg>'
tpl=open("tools/page_template.html").read()
html=(tpl.replace("%%WEB_SVG%%",web_svg).replace("%%MOB_SVG%%",mob_svg).replace("%%STAR_SYM%%",star_sym)
      .replace("%%STAR_INK%%",star_svg(INK,PAPER)).replace("%%STAR_CREAM%%",star_svg(PAPER,INK))
      .replace("%%LAYOUT%%",json.dumps({"web":{k:LW[k] for k in ("W","H","rose","sill")},"mobile":{k:LM[k] for k in ("W","H","rose","sill")}}))
      .replace("%%TOPICS%%",json.dumps({k:TOP[k] for k in ORDER},ensure_ascii=False)))
open("index.html","w").write(html); print("index.html",len(html))
