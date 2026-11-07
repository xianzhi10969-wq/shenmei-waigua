from pathlib import Path
import json,html,shutil,hashlib
from layouts import B,MASKS
R=Path(__file__).parent
TERMS={x['record_id']:x for x in map(json.loads,(R/'audit/terms.ndjson').read_text().splitlines())}
CASES={x['record_id']:x for x in map(json.loads,(R/'audit/cases.ndjson').read_text().splitlines())}
INDEX={x['slug']:x for x in json.loads((R/'image-index.json').read_text())}
DIMS=json.loads((R/'audit/image-dimensions.json').read_text())
FONT="@font-face{font-family:CN;src:url(assets/fonts/2ce479b703b54faa.woff2)}@font-face{font-family:Display;src:url(assets/fonts/758883b3b8e23791.woff2);font-style:italic}"
def e(v):return html.escape(str(v),quote=True)
for d in ['data','previews','assets']:(R/d).mkdir(exist_ok=True)
for slug,items in B.items():
 t=INDEX[slug];term=TERMS[t['id']]
 for p in items:
  origin=t['images'][p['source']-1];p.update(origin);p['original']=f'assets/{slug}/{p["file"]}';case=CASES[p['case_record_id']];p['case_title']=case['作品名'];p['source_url']=case.get('官方页') or '';p['term_record_id']=t['id']
  src=R/'originals'/p['case_record_id']/p['file'];dest=R/p['original'];dest.parent.mkdir(exist_ok=True)
  if src.exists():shutil.copy2(src,dest)
 (R/'data'/f'{slug}-content.json').write_text(json.dumps({'term':term,'cases':[CASES[x] for x in t['case_ids']]},ensure_ascii=False,indent=2))

def board(slug,mode,structure=False):
 W,H=(390,1110) if mode=='mobile' else (1200,1100);mobile=mode=='mobile';t=INDEX[slug];term=TERMS[t['id']];out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="group" aria-label="{e(t["name"])}拼贴"><style>{FONT}text{{fill:#26382f}}.piece{{cursor:zoom-in}}.num{{opacity:0;pointer-events:none;font:14px Georgia;paint-order:stroke;stroke:white;stroke-width:4px}}.labels .num{{opacity:1}}</style><rect width="100%" height="100%" fill="white"/>',f'<text x="{12 if mobile else 24}" y="{49 if mobile else 70}" font-family="CN,serif" font-size="{36 if mobile else 53}">{e(term["词"])}</text>',f'<text x="{14 if mobile else 26}" y="{79 if mobile else 102}" font-family="Display,Georgia,serif" font-style="italic" font-size="{23 if mobile else 29}">{e(term["英文"])}</text>']
 for n,p in enumerate(B[slug]):
  x,y,w,h,rot=p[mode];dim=DIMS[p['file']];iw,ih=dim['width'],dim['height'];c=p['crop'] or [0,0,1000,1000];cx,cy,cw,ch=c[0]*iw/1000,c[1]*ih/1000,c[2]*iw/1000,c[3]*ih/1000
  if not p.get('mask'):
   if cw/ch>w/h:nw=ch*w/h;cx+=(cw-nw)/2;cw=nw
   else:nh=cw*h/w;cy+=(ch-nh)/2;ch=nh
  clip='';clipattr='';uid=f'{slug}-{mode}-{n}'
  if p.get('mask'):clip=f'<path d="{MASKS[p["mask"]]}" transform="scale({iw/1000} {ih/1000})"/>'
  elif p.get('shape')=='round':clip=f'<rect x="{cx}" y="{cy}" width="{cw}" height="{ch}" rx="{cw*.26}"/>'
  elif p.get('shape')=='torn':
   points=[(0,.03),(.23,0),(.39,.024),(.68,.006),(.98,.025),(1,.36),(.97,.6),(1,.98),(.72,1),(.46,.98),(.19,1),(.015,.97),(.03,.7),(.0,.42)]
   clip='<polygon points="'+' '.join(f'{cx+u*cw},{cy+v*ch}' for u,v in points)+'"/>'
  if clip:clip=f'<defs><clipPath id="{uid}">{clip}</clipPath></defs>';clipattr=f' clip-path="url(#{uid})"'
  out+=[f'<a class="piece" href="{e(p["original"])}" data-index="{n}" aria-label="{e(p["label"])}：打开原图"><g transform="translate({x} {y}) rotate({rot} {w/2} {h/2})"><title>{e(p["case_title"])} · {e(p["label"])}</title>']
  if structure:out +=[f'<rect width="{w}" height="{h}" fill="white" stroke="black"/><text x="6" y="20" font-size="12">{n+1:02} {e(p["label"])}</text>']
  else:out +=[f'<svg width="{w}" height="{h}" viewBox="{cx} {cy} {cw} {ch}" overflow="hidden">{clip}<image href="{e(p["original"])}" width="{iw}" height="{ih}"{clipattr}/></svg>']
  out +=[f'<text class="num" x="6" y="20">{n+1:02}</text></g></a>']
 return ''.join(out)+'</svg>'

for slug,items in B.items():
 t=INDEX[slug];term=TERMS[t['id']];ids=list(dict.fromkeys(p['case_record_id'] for p in items))
 for mode in ['desktop','mobile']:
  (R/f'{slug}-{mode}.svg').write_text(board(slug,mode));(R/f'{slug}-{mode}-structure.svg').write_text(board(slug,mode,True))
 (R/'data'/f'{slug}-layout.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
 casehtml=''.join(f'<li><a href="{e(CASES[cid].get("官方页") or "#")}" target="_blank" rel="noopener">{e(CASES[cid]["作品名"])}</a><span>{e(CASES[cid].get("作者") or "")}</span></li>' for cid in ids)
 (R/f'{slug}.html').write_text(f'''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(t['name'])} · 密铺拼贴</title><link rel="stylesheet" href="styles.css"><nav><a href="index.html">← 十二张拼贴</a><label><input type="checkbox" id="labels">显示编号</label><a href="{slug}-desktop.svg" target="_blank">打开图版</a></nav><main><div class="desktop">{board(slug,'desktop')}</div><div class="mobile">{board(slug,'mobile')}</div><p class="core">{e(term.get('核心') or '')}</p><details><summary>{len(items)} 个片段 · {len(ids)} 个作品 · 点击图片看原图</summary><ul>{casehtml}</ul></details></main><dialog id="viewer"><button id="close" aria-label="关闭原图">×</button><img id="full" alt=""><footer><p id="caption"></p><a id="origin" target="_blank" rel="noopener">原作出处 ↗</a><a id="file" target="_blank">单独打开原图 ↗</a></footer></dialog><script id="mapping" type="application/json">{json.dumps(items,ensure_ascii=False)}</script><script src="viewer.js"></script></html>''')
# The approved font/UI shell stays shared; the image compositions are individual.
prev=R.parent/'three-pinterest-dense-v2-2026-11-07'
if prev.exists():
 shutil.copy2(prev/'styles.css',R/'styles.css');shutil.copy2(prev/'viewer.js',R/'viewer.js');shutil.copytree(prev/'assets/fonts',R/'assets/fonts',dirs_exist_ok=True);shutil.copytree(prev/'licenses',R/'licenses',dirs_exist_ok=True)
css=(R/'styles.css').read_text();css=css.replace('.labels .number','.labels .num');(R/'styles.css').write_text(css)
(R/'index.html').write_text('''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>十二词条 · 密铺拼贴</title><link rel="stylesheet" href="styles.css"><style>header{max-width:1440px;margin:40px auto 25px;padding:0 24px}h1{font-size:32px;font-weight:400}header p{font:14px/1.8 system-ui;color:#68706b}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px 24px;padding:0 24px 50px;max-width:1440px;margin:auto}.grid img{width:100%}.grid a{text-decoration:none}.grid h2{font-weight:400;font-size:23px;margin:12px 0}.grid p{font:13px/1.7 system-ui;color:#777;margin:0}@media(max-width:700px){.grid{grid-template-columns:1fr}} </style><header><h1>十二种感觉，重新拼满</h1><p>2026.11.07 · 新一轮候选<br>点开拼贴，再点任意片段查看完整原作。</p><p><a href="../three-pinterest-dense-v2-2026-11-07/index.html">查看已认可的清透、烟火味、新中式 ↗</a></p></header><div class="grid">'''+''.join(f'<a href="{s}.html"><img src="previews/{s}-desktop.jpg" alt="{e(INDEX[s]["name"])}拼贴"><h2>{e(INDEX[s]["name"])}</h2><p>{len(items)} 个片段 · {len(set(p["case_record_id"] for p in items))} 个作品</p></a>' for s,items in B.items())+'</div></html>')
(R/'masks.json').write_text(json.dumps(MASKS,ensure_ascii=False,indent=2))
print({s:len(items) for s,items in B.items()})
