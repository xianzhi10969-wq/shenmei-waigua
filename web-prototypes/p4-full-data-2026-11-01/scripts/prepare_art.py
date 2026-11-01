"""Translate Figma's static frame slice CSS; preserve source raster assets unedited."""
import re,json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
s=(R/'checks/figma-mobile-reference.txt').read_text()
assets=dict(re.findall(r'const (\w+) = `\$\{assetPathPrefix\}/([^`]+)`',s))
def extract(nid):
 start=s.index('<div',s.index('data-node-id="'+nid+'"')-240)
 # Find the opening tag which actually contains the selected ID.
 match=re.search(r'<div[^>]*data-node-id="'+nid+r'"[^>]*>',s);start=match.start();end=match.end();depth=1
 for m in re.finditer(r'</?div\b[^>]*>',s[end:]):
  depth+= -1 if m.group().startswith('</') else 1
  if depth==0:return s[start:end+m.end()]
def css(classes):
 out=[]
 aliases={'absolute':'position:absolute','relative':'position:relative','inset-0':'inset:0','left-0':'left:0','top-0':'top:0','overflow-clip':'overflow:hidden','overflow-hidden':'overflow:hidden','pointer-events-none':'pointer-events:none','max-w-none':'max-width:none','h-full':'height:100%','mix-blend-darken':'mix-blend-mode:darken'}
 props={'h':'height','w':'width','left':'left','top':'top'}
 for c in classes.split():
  if c in aliases:out.append(aliases[c])
  m=re.match(r'(h|w|left|top)-\[(.+)\]',c)
  if m:out.append(props[m[1]]+':'+m[2])
 return ';'.join(out)
frames=[]
for typ,nid,w,h,slot in [(2,'898:104',342,244,[30.639,25.236,284.862,190.951,6.26]),(1,'898:122',220,350,[28.905,67.453,161.387,256.32,6.329]),(3,'898:140',236,290,[30.936,61.785,169.708,198.594,7.222]),(4,'898:158',318,239,[34.182,33.496,251.707,171.8,8]),(5,'898:175',306,210,[27.818,35.168,251.233,139.574,8])]:
 html=extract(nid)
 html=re.sub(r'className="([^"]+)"',lambda m:'style="'+css(m[1])+'"',html)
 html=re.sub(r'src=\{(\w+)\}',lambda m:'src="/assets/'+assets[m[1]]+'"',html)
 html=re.sub(r' data-name="[^"]*"','',html)
 frames.append({'type':typ,'width':w,'height':h,'slot':slot,'html':html})
(R/'public/assets/frames.json').write_text(json.dumps(frames,ensure_ascii=False))
print('Prepared 5 native frame assemblies without editing any source pixels')
