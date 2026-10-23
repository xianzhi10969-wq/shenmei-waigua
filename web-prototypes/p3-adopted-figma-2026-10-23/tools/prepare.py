import json,re,struct
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parents[1];D=R/'dist';out=R/'figma';out.mkdir(exist_ok=True)
T=json.loads((D/'assets/topics.json').read_text())['topics']
E=json.loads((D/'assets/extension-cells.json').read_text())
print('extension type',type(E),str(E)[:160]);print('topic',T[0])
# Trace exact existing binary mask boundaries; no frame contour redesign.
def trace(file):
 im=Image.open(file).convert('RGBA');a=im.getchannel('A');p=a.load();w,h=a.size
 edges={}
 def edge(x,y,X,Y):edges.setdefault((x,y),[]).append((X,Y))
 for y in range(h):
  for x in range(w):
   if p[x,y]<128:continue
   if y==0 or p[x,y-1]<128:edge(x,y,x+1,y)
   if x==w-1 or p[x+1,y]<128:edge(x+1,y,x+1,y+1)
   if y==h-1 or p[x,y+1]<128:edge(x+1,y+1,x,y+1)
   if x==0 or p[x-1,y]<128:edge(x,y+1,x,y)
 paths=[]
 while edges:
  s=next(iter(edges));v=s;pts=[s]
  while True:
   ends=edges[v];n=ends.pop()
   if not ends:del edges[v]
   v=n
   if v==s:break
   pts.append(v)
  simp=[]
  for i,b in enumerate(pts):
   a,c=pts[i-1],pts[(i+1)%len(pts)]
   if (b[0]-a[0])*(c[1]-b[1])!=(b[1]-a[1])*(c[0]-b[0]):simp.append(b)
  if len(simp)>2:paths.append('M'+'L'.join(f'{x} {y}' for x,y in simp)+'Z')
 return ''.join(paths)
masks={p.stem:trace(p) for p in (D/'assets/masks').glob('*.png') if not p.stem.startswith('small')}
(out/'masks.json').write_text(json.dumps(masks));(out/'topics.json').write_text(json.dumps(T,ensure_ascii=False));(out/'extensions.json').write_text(json.dumps(E))
html=(D/'index.html').read_text().replace('</head>','<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script></head>')
(D/'capture.html').write_text(html)
print('masks',len(masks),'totalbytes',sum(map(len,masks.values())))
# font name without optional fontTools
b=(D/'assets/song.ttf').read_bytes();num=struct.unpack('>H',b[4:6])[0]
for i in range(num):
 tag,cs,off,ln=struct.unpack('>4sIII',b[12+i*16:28+i*16])
 if tag==b'name':
  z=b[off:off+ln];_,n,st=struct.unpack('>HHH',z[:6]);names=[]
  for j in range(n):
   pl,en,lang,id,l,o=struct.unpack('>HHHHHH',z[6+j*12:18+j*12])
   if id in (1,2):names.append(z[st+o:st+o+l].decode('utf-16-be' if pl in (0,3) else 'mac-roman',errors='replace'))
  print('fontnames',names)
