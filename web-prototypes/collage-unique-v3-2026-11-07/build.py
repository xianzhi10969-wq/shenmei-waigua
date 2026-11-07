from pathlib import Path
from PIL import Image
import json,html,base64
R=Path(__file__).parent;N=R/'new';S=R/'source/web-prototypes';masks=json.loads((R/'masks.json').read_text())
font=base64.b64encode((R/'assets/title.ttf').read_bytes()).decode()
# Source keys below retain existing case IDs; extra files are alternate originals of the same case.
extra={'softcore':{'potato':(1,'sparrow_official_5.jpg'),'purple':(2,'passage_05.jpg'),'bluechair':(4,'nendo_04.jpg'),'blueseat':(4,'nendo_15.jpg')},'midsummer':{'day':(6,'sp_02.jpg'),'back':(1,'ip_4.jpg')},'decadence':{'woman':(1,'mm_442885.jpg')}}
# source, x,y,w,h, rotation, mask, normalized crop; h=None keeps natural silhouette ratio.
def i(src,x,y,w,h=None,r=0,mask=None,crop=None):return dict(src=src,x=x,y=y,w=w,h=h,rotation=r,mask=mask,crop=crop or [0,0,1000,1000])
from layouts import D,M
external=json.loads((R/'additions/manifest.json').read_text())
names={'softcore':('Softcore',''),'midsummer':('Midsummer','盛夏'),'dopamine':('Dopamine','多巴胺'),'decadence':('Decadence','颓废美学'),'retro-rock':('Retro Rock','复古摇滚')}
masks['potato']='M 332,597 Q 353,485 435,436 Q 489,407 531,386 Q 574,375 605,413 Q 633,445 634,503 Q 633,566 582,626 Q 539,692 462,716 Q 390,748 346,686 Q 323,651 332,597 Z'
masks['strawberry']='M 636,694 Q 643,660 672,658 L 683,642 694,659 716,652 721,674 Q 749,682 754,712 Q 761,752 748,791 Q 731,819 709,829 Q 681,825 660,797 Q 642,766 636,731 Z'
allgeo={};sources={}
identities=json.loads((R/'object-identities.json').read_text())
for slug,items in D.items():
 if __import__('os').environ.get('BOARD') and slug!=__import__('os').environ['BOARD']:continue
 units=json.loads((S/f'term-collage-trial-{slug}-2026-11-05/data/units.json').read_text())
 def source(key):
  if isinstance(key,int):
   u=dict(units[key-1]);u['object_id']=identities.get(u['source_file'].split('/')[-1],slug+'-'+u['source_file'].split('/')[-1]);u['origin']='existing-case';return u
  if key in external:
   u=dict(external[key]);u['object_id']=identities.get(key,key);return u
  n,f=extra[slug][key];u=dict(units[n-1]);u['source_file']='assets/originals/'+f;u['object_id']=identities.get(f,slug+'-'+f);u['origin']='existing-case';return u
 sources[slug]=[source(a['src']) for a in items]
 allgeo[slug]={}
 assert len({u['object_id'] for u in sources[slug]})==len(items),f'Duplicate object: {slug}'
 assert [a['src'] for a in M[slug]]==[a['src'] for a in items],f'Device mismatch: {slug}'
 for device,ls in [('desktop',items),('mobile',M[slug])]:
  w,h=(1200,1000) if device=='desktop' else (390,1080);desk=device=='desktop';out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><style>@font-face{{font-family:Board;src:url(data:font/ttf;base64,{font})}}.title{{font-family:Board,Georgia,serif;font-style:italic;fill:#222}}.label{{font:12px Georgia;fill:#222;stroke:white;stroke-width:4;paint-order:stroke;opacity:0;pointer-events:none}}.show-labels .label{{opacity:1}}.unit{{cursor:zoom-in}}</style><rect width="100%" height="100%" fill="white"/>'];title,cn=names[slug]
  out.append(f'<text class="title" x="{25 if desk else 15}" y="{106 if desk else 72}" font-size="{88 if desk else 49}">{title}</text>')
  if cn:out.append(f'<text x="{27 if desk else 17}" y="{132 if desk else 95}" fill="#333" font-family="serif" font-size="{14 if desk else 12}">{cn}</text>')
  geo=[]
  for j,a in enumerate(ls):
   u=source(a['src']);p=(R/u['source_file']) if u['origin']=='external-reference' else S/f'term-collage-trial-{slug}-2026-11-05'/u['source_file'];iw,ih=Image.open(p).size
   x,y,bw,bh,rot,mask=a['x'],a['y'],a['w'],a['h'],a['rotation'],a['mask'];cx,cy,cw,ch=a['crop']
   if mask and mask.startswith('cut:'):
    cut=N/(mask[4:]+'-cut.png');box=Image.open(cut).getchannel('A').point(lambda x:255 if x>40 else 0).getbbox();cx,cy,cw,ch=box[0]*1000/iw,box[1]*1000/ih,(box[2]-box[0])*1000/iw,(box[3]-box[1])*1000/ih
   if bh is None:bh=bw*ih/iw*ch/cw
   else:
    target=bw/bh*ih/iw
    if cw/ch>target:nw=ch*target;cx+=(cw-nw)/2;cw=nw
    else:nh=cw/target;cy+=(ch-nh)/2;ch=nh
   href='../source/web-prototypes/'+f'term-collage-trial-{slug}-2026-11-05/'+u['source_file'];original=href
   if u['origin']=='external-reference':href='../'+u['source_file'];original=href
   if mask and mask.startswith('cut:'):href=mask[4:]+'-cut.png'
   if mask in ['figure','brooch','chaise','woman','ring']:href=mask+'-cut.png'
   if mask in ['dress','carlton']:href=mask+'-cut.png'
   if mask in masks:shape=f'<path d="{masks[mask]}" fill-rule="evenodd" clip-rule="evenodd"/>'
   elif mask=='oval':shape=f'<ellipse cx="{cx+cw/2}" cy="{cy+ch/2}" rx="{cw/2}" ry="{ch/2}"/>'
   else:shape=f'<rect x="{cx}" y="{cy}" width="{cw}" height="{ch}"/>'
   if mask in ['figure','brooch','chaise']:shape=f'<rect x="{cx}" y="{cy}" width="{cw}" height="{ch}"/>'
   out.append(f'<a class="unit" href="{html.escape(original)}" target="_blank" data-origin="{u["origin"]}" data-number="{j+1}" data-title="{html.escape(u["alt"])}" data-url="{html.escape(u["url"])}"><g transform="translate({x} {y}) rotate({rot} {bw/2} {bh/2})"><svg width="{bw}" height="{bh}" viewBox="{cx} {cy} {cw} {ch}" preserveAspectRatio="none"><defs><clipPath id="c{j}">{shape}</clipPath></defs><image href="{html.escape(href)}" width="1000" height="1000" preserveAspectRatio="none" clip-path="url(#c{j})"/></svg><text class="label" x="6" y="18">{j+1:02}</text></g></a>')
   geo.append({**a,'h':bh,'crop':[cx,cy,cw,ch],'unit':j+1,'source_file':original,'object_id':u['object_id'],'origin':u['origin'],'case_record_id':u['case_record_id'],'term_record_id':u['term_record_id']})
  out.append('</svg>');svg=''.join(out)
  (N/f'{slug}-{device}.svg').write_text(svg)
  js="""<script>document.querySelectorAll('a.unit').forEach(a=>a.onclick=e=>{if(parent!==window){e.preventDefault();parent.postMessage({type:'original',src:new URL(a.getAttribute('href'),location.href).href,title:a.dataset.title,url:a.dataset.url,number:a.dataset.number,origin:a.dataset.origin},location.origin)}});addEventListener('message',e=>{if(e.origin===location.origin&&e.data.type==='labels')document.querySelector('svg').classList.toggle('show-labels',e.data.show)})</script>"""
  (N/f'{slug}-{device}.html').write_text('<!doctype html><meta charset="utf-8"><style>body{margin:0}svg{display:block;max-width:100%;height:auto}</style>'+svg+js)
  allgeo[slug][device]=geo
(N/'geometry.json').write_text(json.dumps(allgeo,ensure_ascii=False,indent=2));(N/'sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2));print({s:len(v) for s,v in D.items()})
