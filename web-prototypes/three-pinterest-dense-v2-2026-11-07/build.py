from pathlib import Path
import json,html,shutil,hashlib
R=Path(__file__).parent
MASKS=json.loads((R/'masks.json').read_text())
DIMS={Path(x['file']).name:(x['width'],x['height']) for x in json.loads((R/'audit/image-decode.json').read_text())}
CASES={x['record_id']:x for x in map(json.loads,(R/'audit/cases.ndjson').read_text().splitlines())}
FILES={p.name:p for p in (R/'assets').glob('*/*') if p.suffix.lower() in ['.jpg','.jpeg','.png']}
FILES.update({p.name:p for p in (R/'originals').glob('*/*')})
FILE_CASES={a['name']:cid for cid,c in CASES.items() for a in c['图']}
def P(file,d,m,label,crop=None,mask=None):return dict(file=file,desktop=d,mobile=m,label=label,crop=crop,mask=mask)
B={
 'translucent':[
 P('illum_01_R.jpg',[18,125,465,390,-2],[8,96,225,260,-2],'水与透光'),
 P('illum_03_L.jpg',[458,120,370,325,2],[221,102,161,217,2],'树隙中的光'),
 P('rain_jb_35.jpg',[815,132,370,446,-2],[245,316,138,247,2],'雨瓶阵列'),
 P('illum_04_L.jpg',[20,498,392,335,2],[8,356,199,246,2],'海水的旋涡'),
 P('well_kub_og3.jpg',[382,450,470,320,-2],[125,579,253,178,-2],'玻璃装置全景'),
 P('illum_02_R.jpg',[29,814,365,265,-2],[8,767,189,178,-3],'叶片上的水珠'),
 P('liquid_11.jpg',[395,794,440,285,2],[174,897,208,198,2],'蓝色玻璃凳'),
 P('well_pinault_2.jpg',[826,745,357,332,-1],[8,947,163,146,-2],'水色与建筑'),
 P('illum_cover.jpg',[655,316,200,225,-6],[9,602,130,159,-5],'透光的花瓣'),
 P('illum_02_L.jpg',[25,354,175,174,-5],[288,753,94,114,5],'蓝色折射'),
 P('rain_sketch.jpg',[427,169,164,225,-4],[163,770,116,130,4],'雨的形态手稿'),
 P('liquid_03.jpg',[280,375,525,423,0],[67,355,242,195,0],'完整玻璃桌',crop=[77,103,850,867],mask='table'),
 P('well_alt_143255.jpeg',[919,579,240,268,5],[274,578,107,140,4],'蓝色玻璃近景',crop=[130,220,750,650]),
 P('liquid_12.jpg',[595,646,360,225,-5],[98,675,181,121,-4],'波浪玻璃器皿'),
 P('rain_02.jpg',[197,619,103,230,-6],[21,175,61,156,-5],'一瓶雨'),
 P('liquid_10.jpg',[1008,274,165,285,5],[292,122,78,151,4],'透明椅'),
 P('illum_03_R.jpg',[456,887,155,169,-5],[196,985,107,107,-4],'掌心里的小生命'),
 ],
 'hustle':[
 P('wolf_back_door_01.jpg',[20,124,416,353,-2],[8,100,218,231,-2],'晾晒与城市'),
 P('wolf_back_door_03.jpg',[789,124,394,356,2],[219,106,162,223,2],'劳动留下的手套'),
 P('wolf_back_door_05.jpg',[20,470,332,342,2],[8,373,149,233,2],'铁网上的杯子'),
 P('wastenot_domestic_2k.jpg',[352,752,515,321,-2],[124,856,256,237,2],'生活物件的积累'),
 P('wolf_back_door_12.jpg',[886,722,295,348,2],[257,606,124,240,-2],'墙上的小种植'),
 P('wastenot_caps_2k.jpg',[21,823,341,252,-3],[8,942,129,150,-3],'瓶盖的密集色彩'),
 P('storefront_03.jpg',[425,122,368,556,1],[171,282,207,322,2],'蓝色店铺'),
 P('wolf_back_door_02.jpg',[798,452,373,287,-3],[8,613,192,187,-3],'街巷里的白椅'),
 P('storefront_01.jpg',[78,311,356,307,-4],[21,265,190,165,-4],'肉店与招牌'),
 P('storefront_p036-037.jpg',[698,848,223,211,4],[181,743,194,160,3],'桥下的水族店',crop=[0,270,680,690]),
 P('spoerri_kunst.jpg',[376,600,304,259,4],[8,784,191,164,-4],'餐桌上的碗碟'),
 P('wolf_back_door_09.jpg',[1087,313,95,203,4],[313,840,65,146,3],'挂着的粉色手套'),
 P('spoerri_buffalo_full.jpg',[579,358,419,426,-3],[96,483,237,241,-3],'早餐留下的物件',crop=[19,38,962,921],mask='breakfast'),
 P('storefront_p020-021.jpg',[275,866,172,198,5],[25,482,99,132,4],'商店零物手绘',crop=[170,25,270,210]),
 P('wolf_back_door_08.jpg',[25,131,132,195,-5],[8,108,82,123,-4],'门与一棵树'),
 ],
 'new-chinese':[
 P('brick_corridor.jpg',[19,123,643,491,-2],[8,109,266,258,-2],'院墙、水面与树'),
 P('samuel_vogue.jpg',[850,122,333,505,2],[230,111,151,238,2],'黑色造型全貌'),
 P('brick_aerial.jpg',[25,659,727,417,1],[9,682,270,235,-2],'水面与连廊'),
 P('samuel_vogue2.jpg',[834,717,346,360,-2],[254,895,127,200,2],'红鞋与几何地面',crop=[300,720,600,280]),
 P('brick_corridor.jpg',[614,122,247,286,3],[8,919,240,177,2],'层层砖石',crop=[570,300,400,530]),
 P('brick_corridor.jpg',[604,395,307,672,-1],[247,495,134,411,1],'砖墙的肌理',crop=[680,180,300,720]),
 P('brick_courtyard.jpg',[45,445,292,378,-4],[8,354,171,230,-3],'建筑师的手稿'),
 P('samuel_vogue.jpg',[299,829,202,235,-5],[270,354,110,154,3],'绿包与衣服的结',crop=[450,370,300,350]),
 P('shaofan_wright.jpg',[853,583,326,185,4],[134,934,142,147,-4],'钢管的弧线',crop=[180,100,460,280]),
 P('samuel_vogue2.jpg',[340,127,338,849,0],[140,251,193,557,0],'红色造型完整轮廓',crop=[320,110,446,855],mask='red'),
 P('shaofan_wright.jpg',[647,377,342,470,0],[224,547,153,210,0],'不锈钢圈椅',crop=[206,100,600,825],mask='chair'),
 P('samuel_vogue2.jpg',[33,860,212,206,-5],[10,598,122,117,-3],'衣领与布料',crop=[375,260,290,200]),
 P('brick_aerial.jpg',[517,927,235,146,4],[27,817,145,95,4],'水中的倒影',crop=[0,570,1000,430]),
 ]}
FONT="@font-face{font-family:CN;src:url(assets/fonts/2ce479b703b54faa.woff2)}@font-face{font-family:Display;src:url(assets/fonts/758883b3b8e23791.woff2);font-style:italic}"
def e(s):return html.escape(str(s),quote=True)
def svg(slug,items,mode,structure=False):
 mobile=mode=='mobile';W,H=(390,1110) if mobile else (1200,1100)
 c=json.loads((R/'data'/f'{slug}-content.json').read_text());name=c['term']['词'];en=c['term']['英文']
 out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="group" aria-label="{name}密铺拼贴"><style>{FONT}text{{fill:#26382f}}.piece{{cursor:zoom-in}}.piece:focus-visible{{outline:2px solid #62655c}}.number{{opacity:0;pointer-events:none;font:14px Georgia;paint-order:stroke;stroke:white;stroke-width:4px}}.labels .number{{opacity:1}}</style><rect width="100%" height="100%" fill="#fff"/>']
 out += [f'<text x="{12 if mobile else 24}" y="{49 if mobile else 70}" font-family="CN,serif" font-size="{36 if mobile else 53}">{name}</text>',f'<text x="{14 if mobile else 26}" y="{79 if mobile else 102}" font-family="Display,Georgia,serif" font-style="italic" font-size="{23 if mobile else 29}">{en}</text>']
 for n,p in enumerate(items,1):
  x,y,w,h,rot=p[mode];f=FILES[p['file']];case=CASES[FILE_CASES[p['file']]];iw,ih=DIMS[p['file']];crop=p['crop'] or [0,0,1000,1000];clip=''
  if p['mask']:
   vb,path=MASKS[p['mask']];_,_,iw,ih=map(float,vb.split());clip=f'<defs><clipPath id="{mode}-{n}"><path d="{path}" clip-rule="evenodd"/></clipPath></defs>'
  cx,cy,cw,ch=[crop[0]/1000*iw,crop[1]/1000*ih,crop[2]/1000*iw,crop[3]/1000*ih]
  # Center crop within the selected detail, with image proportions preserved.
  if not p['mask']:
   target=w/h
   if cw/ch>target: nw=ch*target;cx+=(cw-nw)/2;cw=nw
   else:nh=cw/target;cy+=(ch-nh)/2;ch=nh
  src=f'assets/{slug}/{p["file"]}'
  p['case_record_id']=FILE_CASES[p['file']];p['original']=src;p['case_title']=case['作品名'];p['source_url']=case.get('官方页') or ''
  out +=[f'<a class="piece" href="{src}" data-index="{n-1}" data-label="{e(p["label"])}" aria-label="{e(p["label"])}：打开{e(case["作品名"])}原图"><g transform="translate({x} {y}) rotate({rot} {w/2} {h/2})"><title>{e(p["label"])}</title>']
  if structure:out +=[f'<rect width="{w}" height="{h}" fill="white" stroke="black"/><text x="6" y="20" font-size="13">{n:02} {e(p["label"])}</text>']
  else:out +=[f'<svg width="{w}" height="{h}" viewBox="{cx} {cy} {cw} {ch}" overflow="hidden">{clip}<image href="{src}" width="{iw}" height="{ih}" '+(f'clip-path="url(#{mode}-{n})" ' if clip else '')+'/></svg>']
  out +=[f'<text class="number" x="6" y="20">{n:02}</text></g></a>']
 return ''.join(out)+'</svg>'
(R/'previews').mkdir(exist_ok=True)
for slug,items in B.items():
 dest=R/'assets'/slug;dest.mkdir(exist_ok=True)
 for p in items:
  if FILES[p['file']].resolve() != (dest/p['file']).resolve():shutil.copy2(FILES[p['file']],dest/p['file'])
 c=json.loads((R/'data'/f'{slug}-content.json').read_text())
 for mode in ['desktop','mobile']:
  (R/f'{slug}-{mode}.svg').write_text(svg(slug,items,mode));(R/f'{slug}-{mode}-structure.svg').write_text(svg(slug,items,mode,True))
 (R/'data'/f'{slug}-layout.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
 caseids=list(dict.fromkeys(p['case_record_id'] for p in items))
 sources=''.join(f'<li><a href="{e(CASES[cid].get("官方页") or "#")}" target="_blank" rel="noopener">{e(CASES[cid]["作品名"])}</a><span>{e(CASES[cid].get("作者") or "")}</span></li>' for cid in caseids)
 (R/f'{slug}.html').write_text(f'''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{c['term']['词']} · 密铺 v2</title><link rel="stylesheet" href="styles.css"><nav><a href="index.html">← 三张拼贴</a><label><input type="checkbox" id="labels">显示编号</label><a href="before/{slug}.jpg">上一版</a></nav><main><div class="desktop">{svg(slug,items,'desktop')}</div><div class="mobile">{svg(slug,items,'mobile')}</div><p class="core">{e(c['term']['核心'])}</p><details><summary>{len(items)} 个拼贴片段 · {len(caseids)} 个作品 · 点击图片看原图</summary><ul>{sources}</ul></details></main><dialog id="viewer"><button id="close" aria-label="关闭原图">×</button><img id="full" alt=""><footer><p id="caption"></p><a id="origin" target="_blank" rel="noopener">原作出处 ↗</a><a id="file" target="_blank">单独打开原图 ↗</a></footer></dialog><script id="mapping" type="application/json">{json.dumps(items,ensure_ascii=False)}</script><script src="viewer.js"></script></html>''')
(R/'styles.css').write_text(FONT+'''*{box-sizing:border-box}body{margin:0;background:white;color:#26382f;font-family:CN,'Songti SC',serif}a{color:inherit;text-underline-offset:4px}nav{max-width:1200px;margin:auto;padding:18px 24px 8px;display:flex;justify-content:space-between;font:12px system-ui;gap:15px}main{max-width:1200px;margin:auto}.desktop svg,.mobile svg{display:block;width:100%;height:auto}.mobile{display:none}.core{font-size:22px;line-height:1.7;margin:20px 28px 35px}details{margin:0 28px 60px;border-top:1px solid #ddd;padding-top:22px;font:14px/1.8 system-ui}summary{cursor:pointer}li{display:flex;justify-content:space-between;gap:20px;padding:10px 0}dialog{border:0;padding:22px;width:min(1100px,96vw);max-height:94vh;background:#f6f6f3}dialog::backdrop{background:#171b19da}dialog img{display:block;max-width:100%;height:72vh;object-fit:contain;margin:auto}dialog footer{font:14px/1.5 system-ui;padding:0 12px}dialog footer a{margin-right:24px}#close{position:absolute;right:7px;top:5px;border:0;background:white;width:44px;height:44px;font-size:30px;cursor:pointer}button:focus-visible,a:focus-visible{outline:2px solid #526355;outline-offset:3px}@media(max-width:700px){.desktop{display:none}.mobile{display:block}nav{padding:14px 13px 5px;font-size:11px}.core{font-size:18px;margin:18px 18px 28px}details{margin:0 18px 40px;font-size:12px}dialog{padding:40px 8px 14px}dialog img{height:60vh}li{display:block}li span{display:block;color:#777}}''')
(R/'viewer.js').write_text('''const items=JSON.parse(document.querySelector('#mapping').textContent),viewer=document.querySelector('#viewer');let trigger;document.querySelectorAll('.piece').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();trigger=a;const p=items[+a.dataset.index];document.querySelector('#full').src=p.original;document.querySelector('#full').alt=p.case_title;document.querySelector('#caption').textContent=p.case_title+' · '+p.label;document.querySelector('#origin').href=p.source_url;document.querySelector('#file').href=p.original;viewer.showModal()}));document.querySelector('#close').onclick=()=>viewer.close();viewer.addEventListener('click',e=>{if(e.target===viewer){let r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close()}});document.querySelector('#labels').onchange=e=>document.querySelectorAll('main>div>svg').forEach(s=>s.classList.toggle('labels',e.target.checked));''')
(R/'before').mkdir(exist_ok=True)
for s in B:
 old=R.parent/'collage-rework-three-2026-11-06/rework/previews'/f'{s}-desktop.jpg';
 if old.exists():shutil.copy2(old,R/'before'/f'{s}.jpg')
(R/'index.html').write_text('''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>三张拼贴 · 密铺 v2</title><link rel="stylesheet" href="styles.css"><style>header{max-width:1280px;margin:40px auto 25px;padding:0 24px}h1{font-size:32px;font-weight:400}header p{font:14px/1.8 system-ui;color:#68706b}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:0 24px 50px;max-width:1440px;margin:auto}.grid img{width:100%}.grid a{text-decoration:none}.grid h2{font-weight:400;font-size:23px}.grid p{font:13px system-ui;color:#777}@media(max-width:700px){.grid{grid-template-columns:1fr}} </style><header><h1>把感觉铺满</h1><p>清透 · 烟火味 · 新中式 / 密铺 v2 · 待审<br>点开拼贴，再点任意片段查看完整原图。</p></header><div class="grid">'''+''.join(f'<a href="{s}.html"><img src="previews/{s}-desktop.jpg" alt="{json.loads((R/"data"/f"{s}-content.json").read_text())["term"]["词"]}密铺拼贴"><h2>{json.loads((R/"data"/f"{s}-content.json").read_text())["term"]["词"]}</h2><p>{len(items)} 个片段 · 可查看原作</p></a>' for s,items in B.items())+'</div></html>')
print({s:len(v) for s,v in B.items()})
