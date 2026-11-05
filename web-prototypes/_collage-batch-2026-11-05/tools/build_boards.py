#!/usr/bin/env python3
"""Build dual-end collage trial boards from selection-plan + downloaded originals."""
from __future__ import annotations
import json, hashlib, colorsys, math, shutil
from pathlib import Path
from PIL import Image

ROOT = Path('/workspace/shenmei-waigua/web-prototypes')
PLAN = json.load(open(ROOT/'_collage-batch-2026-11-05/selection-plan.json'))
CSS_TMPL = (ROOT/'_collage-batch-2026-11-05/tools/styles.template.css').read_text()

# Layout recipes: list of (x,y,w,h,r,z) desktop; mobile derived
# Board desktop 1320x1080; mobile 390 x variable

RECIPES = {
  # 8 units: hero left, tall right stack, bottom row
  8: [
    (40, 80, 520, 560, -2, 2),
    (540, 60, 300, 380, 3, 4),
    (860, 48, 260, 300, -4, 3),
    (860, 370, 250, 220, 2, 4),
    (540, 460, 300, 240, -1, 3),
    (40, 680, 360, 280, 2, 5),
    (420, 720, 280, 250, -3, 4),
    (740, 700, 340, 260, 4, 5),
  ],
  7: [
    (36, 70, 540, 580, -2, 2),
    (560, 55, 320, 360, 4, 4),
    (900, 50, 260, 300, -3, 3),
    (900, 370, 260, 230, 2, 4),
    (560, 440, 320, 260, -1, 3),
    (48, 700, 460, 270, 2, 5),
    (540, 740, 500, 240, -2, 4),
  ],
  6: [
    (40, 70, 560, 600, -2, 2),
    (620, 55, 340, 400, 3, 4),
    (980, 70, 240, 280, -4, 3),
    (980, 380, 240, 220, 2, 4),
    (40, 720, 480, 260, 1, 5),
    (560, 700, 520, 280, -3, 4),
  ],
  5: [
    (40, 80, 600, 620, -2, 2),
    (670, 60, 360, 420, 3, 4),
    (1040, 80, 220, 280, -3, 3),
    (670, 520, 360, 260, 2, 3),
    (40, 740, 620, 250, -1, 5),
  ],
  4: [
    (48, 90, 620, 640, -2, 2),
    (700, 70, 380, 440, 3, 4),
    (700, 540, 280, 300, -2, 3),
    (1000, 540, 240, 300, 4, 5),
  ],
}

# Alternate recipe sets for visual variety (rotated/shifted variants)
RECIPES_B = {
  8: [
    (520, 50, 560, 520, 2, 2),
    (40, 70, 280, 360, -3, 4),
    (340, 60, 200, 260, 4, 3),
    (40, 450, 260, 240, 2, 3),
    (320, 360, 220, 280, -4, 5),
    (560, 600, 360, 280, 1, 4),
    (940, 520, 260, 300, -2, 5),
    (940, 60, 260, 280, 3, 3),
  ],
  7: [
    (480, 60, 580, 540, 2, 2),
    (40, 80, 260, 340, -3, 4),
    (320, 70, 180, 240, 4, 3),
    (40, 460, 280, 260, 1, 3),
    (340, 380, 200, 280, -2, 5),
    (480, 640, 420, 280, 2, 4),
    (940, 620, 260, 300, -3, 5),
  ],
  6: [
    (460, 55, 600, 560, 2, 2),
    (40, 70, 280, 380, -3, 4),
    (340, 80, 140, 220, 5, 3),
    (40, 480, 300, 280, 2, 3),
    (360, 420, 180, 260, -2, 5),
    (460, 660, 600, 280, 1, 4),
  ],
  5: [
    (40, 60, 420, 520, -2, 3),
    (480, 80, 560, 500, 2, 2),
    (40, 620, 300, 300, 3, 4),
    (360, 640, 360, 280, -2, 5),
    (760, 620, 360, 300, 1, 4),
  ],
  4: [
    (40, 80, 480, 560, -3, 2),
    (560, 60, 520, 480, 2, 3),
    (40, 700, 420, 260, 2, 4),
    (520, 600, 560, 320, -2, 5),
  ],
}

def safe_name(name: str) -> str:
  return ''.join(c if c.isalnum() or c in '._-+' else '_' for c in name)

def avg_colors(path: Path, n=5):
  im = Image.open(path).convert('RGB')
  im = im.resize((48, 48))
  pixels = list(im.getdata())
  # k-means-ish: pick by brightness buckets
  buckets = {}
  for r,g,b in pixels:
    key = (r//40, g//40, b//40)
    buckets.setdefault(key, []).append((r,g,b))
  top = sorted(buckets.values(), key=len, reverse=True)[:n]
  cols=[]
  for group in top:
    r=sum(p[0] for p in group)//len(group)
    g=sum(p[1] for p in group)//len(group)
    b=sum(p[2] for p in group)//len(group)
    cols.append(f'#{r:02x}{g:02x}{b:02x}')
  while len(cols)<n:
    cols.append('#cccccc')
  return cols

def make_display(src: Path, dest: Path, max_side=1600):
  im = Image.open(src)
  im = im.convert('RGB') if im.mode not in ('RGB','L') else im.convert('RGB')
  w,h = im.size
  scale = min(1.0, max_side/max(w,h))
  if scale < 1:
    im = im.resize((int(w*scale), int(h*scale)), Image.Resampling.LANCZOS)
  dest.parent.mkdir(parents=True, exist_ok=True)
  im.save(dest, 'JPEG', quality=88, optimize=True)
  return im.size, hashlib.sha256(src.read_bytes()).hexdigest()[:16]

def mobile_layout(desktop_units, board_h_hint=None):
  """Re-flow for 390px width: stack with size variation, not shrink of desktop."""
  # Sort by visual weight (area)
  ordered = sorted(enumerate(desktop_units), key=lambda iv: -(iv[1][2]*iv[1][3]))
  placements=[]
  y=36
  # first = hero full width-ish
  for idx,(di, (x,y0,w,h,r,z)) in enumerate(ordered):
    ar = h/max(w,1)
    if idx==0:
      mw=358; mh=int(358*min(max(ar,0.7),1.15)); mx=16; mr=max(min(r,-1),-3) if r<0 else min(max(r,1),3)
    elif idx==1:
      mw=210; mh=int(210*min(max(ar,0.75),1.3)); mx=16; mr=r
    elif idx==2:
      mw=154; mh=int(154*min(max(ar,0.8),1.4)); mx=220; # place beside 1 later
      mr=r
    else:
      # alternate left/right
      if idx%2==0:
        mw=176; mh=int(176*min(max(ar,0.75),1.35)); mx=16
      else:
        mw=164; mh=int(164*min(max(ar,0.8),1.4)); mx=210
      mr=r
    placements.append((di, mx, y, mw, mh, mr, z))
    if idx==1:
      # remember for pairing
      pair_y=y
      pair_h=mh
    if idx==2:
      # align with unit 1 top
      placements[-1] = (di, 220, pair_y, mw, min(mh, pair_h+40), mr, z)
      y = max(y+pair_h, pair_y + placements[-1][4]) + 16
      continue
    y += mh + (18 if idx>0 else 22)
  # restore original order
  by_di={di:pl for di,*pl in [(p[0],)+tuple(p[1:]) for p in placements]}
  # fix: placements stored as (di,mx,my,mw,mh,mr,mz)
  result=[]
  for i in range(len(desktop_units)):
    mx,my,mw,mh,mr,mz = by_di[i]
    result.append((mx,my,mw,mh,mr,mz))
  mobile_h = max(pl[1]+pl[3] for pl in result) + 40
  return result, max(mobile_h, 1100)

def ref_pos(x,y,w,h, side='br'):
  if side=='br':
    return (x+w-20, y+h+8)
  if side=='tr':
    return (x+w-10, y-28)
  return (x-8, y+h+8)

def build_one(p):
  d = ROOT/p['dir']
  orig = d/'assets'/'originals'
  imgdir = d/'assets'/'images'
  imgdir.mkdir(parents=True, exist_ok=True)
  units_meta=[]
  available=[]
  for u in p['units_plan']:
    safe=safe_name(u['file_name'])
    src=orig/safe
    if not src.exists() or src.stat().st_size<500:
      continue
    try:
      Image.open(src).load()
    except Exception:
      continue
    available.append((u, src, safe))
  if len(available)<4:
    return {'term':p['term'],'status':'insufficient','have':len(available)}

  n=len(available)
  # pick recipe set by slug hash for variety
  use_b = (sum(ord(c) for c in p['slug']) % 2)==1
  recipes = RECIPES_B if use_b else RECIPES
  # clamp to available recipe
  key=n if n in recipes else max(k for k in recipes if k<=n)
  available=available[:key]
  n=len(available)
  desk = recipes[n]

  # prepare display images + roles
  roles=['主图','补充','细节','环境','对照','细节','补充','细节']
  prepared=[]
  colors_all=[]
  for i,(u,src,safe) in enumerate(available):
    h16=hashlib.sha256(src.read_bytes()).hexdigest()[:16]
    disp=imgdir/f'{h16}.jpg'
    size, _ = make_display(src, disp)
    cols=avg_colors(src)
    colors_all.extend(cols[:2])
    prepared.append({
      'unit_id': f"u{i+1:02d}-{safe[:24]}",
      'display_number': f'{i+1:02d}',
      'role': roles[i] if i < len(roles) else '补充',
      'image': f'assets/images/{disp.name}',
      'source_file': f'assets/originals/{safe}',
      'case_record_id': u['case_id'],
      'term_record_id': p['record_id'],
      'alt': f"{u['case_title']} · {u.get('media') or ''}",
      'url': u.get('url') or f"assets/originals/{safe}",
      'native': size,
      'colors': cols,
    })

  mob, mob_h = mobile_layout(desk)
  units=[]
  for i, prep in enumerate(prepared):
    x,y,w,h,r,z = desk[i]
    mx,my,mw,mh,mr,mz = mob[i]
    rx,ry = ref_pos(x,y,w,h, 'br' if i%2==0 else 'tr')
    mrx,mry = ref_pos(mx,my,mw,mh, 'br')
    # clamp refs
    rx=min(max(rx,8),1280); ry=min(max(ry,8),1040)
    mrx=min(max(mrx,8),350); mry=min(max(mry,8), mob_h-20)
    units.append({
      **prep,
      'desktop':[x,y,w,h,r,z],
      'mobile':[mx,my,mw,mh,mr,mz],
      'ref_desktop':[rx,ry],
      'ref_mobile':[mrx,mry],
    })

  # palette: unique-ish
  pal=[]; seen=set()
  for c in colors_all:
    if c not in seen:
      pal.append(c); seen.add(c)
    if len(pal)>=5: break
  labels=['主色','辅色','浅','深','点缀']

  # write units.json
  (d/'data').mkdir(exist_ok=True)
  json.dump(units, open(d/'data'/'units.json','w'), ensure_ascii=False, indent=2)
  json.dump({
    'snapshot_date':'2026-11-05',
    'source':{'base':'IGctbcuwPaE6hMsmAoicJddpn3U','term_table':'tbl2gR8WBoqCQyGz','case_table':'tblpdRYutnm12T0y','profile':'aesthetic-feishu','as':'user','read_only':True},
    'term':{'record_id':p['record_id'],'词':p['term'],'英文':p['english'],'所属章节':p['chapter'],'在本章的位置':p.get('position'),'核心':p.get('core')},
    'cases':p['cases'],
    'editorial':{'see':p['see'],'clues':[u['alt'] for u in units[:4]],'avoid':'不与无关词条混图；不因附件多而硬凑'}
  }, open(d/'data'/'content.json','w'), ensure_ascii=False, indent=2)
  json.dump({'status':'visual_pending','license':'local_review_only','title':False,'numbers':'hideable'}, open(d/'data'/'status.json','w'), ensure_ascii=False, indent=2)

  # HTML pieces
  pieces=[]
  refs=[]
  sources=[]
  for u in units:
    x,y,w,h,r,z=u['desktop']; mx,my,mw,mh,mr,mz=u['mobile']
    pieces.append(
      f'<figure class="piece" data-unit="{u["unit_id"]}" style="--x:{x}px;--y:{y}px;--w:{w}px;--h:{h}px;--r:{r}deg;--z:{z};'
      f'--mx:{mx}px;--my:{my}px;--mw:{mw}px;--mh:{mh}px;--mr:{mr}deg;--mz:{mz}">'
      f'<img src="{u["image"]}" alt="{u["alt"]}"></figure>'
    )
    rx,ry=u['ref_desktop']; mrx,mry=u['ref_mobile']
    refs.append(
      f'<a class="figure-ref" data-figure="{u["unit_id"]}" href="#source-{u["display_number"]}" '
      f'aria-label="图像 {u["display_number"]}，{u["alt"]}，查看来源" '
      f'style="--rx:{rx}px;--ry:{ry}px;--mrx:{mrx}px;--mry:{mry}px"><span aria-hidden="true">{u["display_number"]}</span></a>'
    )
    href=u['url'] if str(u['url']).startswith('http') else u['source_file']
    sources.append(f'<li id="source-{u["display_number"]}"><span>{u["display_number"]}</span><a href="{href}">{u["alt"]}</a></li>')

  swatches=''.join(f'<span class="swatch"><i style="background:{c}"></i>{labels[i]}</span>' for i,c in enumerate(pal))
  html=f'''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{p['term']} · 拼贴试稿</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="toolbar">
  <span>审美外挂 / 词条拼贴试稿 · {p['term']}</span>
  <span><a class="desktop-only" href="mobile.html">390px 手机预览</a><span class="desktop-only"> · </span><a href="#sources">来源</a></span>
</header>
<main>
  <div class="board-shell">
    <section class="board" id="top" aria-label="{p['term']}图像拼贴">
      <div class="title-slot" aria-hidden="true"></div>
      {''.join(pieces)}
      {''.join(refs)}
    </section>
  </div>
  <section class="notes">
    <div class="note-top">
      <p>{p['see']}</p>
      <div class="palette" aria-label="从原图观察的颜色">{swatches}</div>
    </div>
    <details id="sources" open>
      <summary>图像来源与制作说明</summary>
      <ul>{''.join(sources)}</ul>
      <p>本版 2026-11-05 用 lark-cli --profile aesthetic-feishu --as user 只读拉取飞书主 Base。词条「{p['term']}」record_id {p['record_id']}；选用 {len(p['cases'])} 个关联案例中的 {len(units)} 个图像单元。保留原色，仅裁切与缩放；未生图，未用网图。</p>
      <p class="small">标题、中英副题、下方核心句本轮不做。编号可隐藏。独立试稿目录，未改正式页/Coquette/liminal、未部署、未写飞书。许可未核定，仅本地审阅。</p>
    </details>
  </section>
</main>
<script src="app.js"></script>
</body>
</html>
'''
  (d/'index.html').write_text(html)
  css=CSS_TMPL.replace('VAR_MOBILE_H', str(int(mob_h)))
  (d/'styles.css').write_text(css)
  (d/'app.js').write_text("document.querySelectorAll('.figure-ref').forEach(a=>a.addEventListener('click',()=>{const s=document.querySelector('#sources');if(s)s.open=true;const t=document.querySelector(a.hash);if(!t)return;t.setAttribute('tabindex','-1');setTimeout(()=>t.focus({preventScroll:true}),0)}));\n")
  (d/'mobile.html').write_text(f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=390">
<title>{p['term']} · 390px</title>
<style>html,body{{margin:0;background:#111}}iframe{{border:0;width:390px;height:{int(mob_h)+200}px;display:block;margin:24px auto;background:#fff}}</style>
</head><body><iframe src="index.html" title="{p['term']}手机预览"></iframe></body></html>
''')
  (d/'README.md').write_text(f'''# {p['term']} · 词条拼贴试稿（成品图像板）

日期：2026-11-05。词条 record_id：`{p['record_id']}`。独立试稿，**未部署、未改正式页、未写飞书**。

标题 / 副题 / 核心句本轮不做。编号可隐藏。

## 打开
```bash
cd web-prototypes/{p['dir']}
python3 -m http.server 8000 --bind 127.0.0.1
```
http://127.0.0.1:8000/ · 手机 http://127.0.0.1:8000/mobile.html

## 本板要让人看见什么
{p['see']}

## 素材
- 案例 {len(p['cases'])}，本板单元 {len(units)}。
- 许可未核定，仅本地审阅。
''')
  return {'term':p['term'],'status':'built','units':len(units),'dir':p['dir'],'mobile_h':mob_h}

def main():
  results=[]
  for p in PLAN['plans']:
    try:
      r=build_one(p)
    except Exception as e:
      r={'term':p['term'],'status':'error','error':str(e)}
    print(r)
    results.append(r)
  json.dump(results, open(ROOT/'_collage-batch-2026-11-05/build-results.json','w'), ensure_ascii=False, indent=2)
  built=sum(1 for r in results if r.get('status')=='built')
  print(f'BUILT {built}/{len(results)}')

if __name__=='__main__':
  main()
