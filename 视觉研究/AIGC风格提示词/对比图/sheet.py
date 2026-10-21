import sys
from PIL import Image,ImageDraw
import numpy as np
out=sys.argv[1]; files=sys.argv[2:]
refs=['ref_p1_crop.png','ref_p2_light.png']
H=420
def stat(f):
  a=np.asarray(Image.open(f).convert('L'));bg=np.median(a)
  rgb=np.asarray(Image.open(f).convert('RGB')).reshape(-1,3);c=np.median(rgb,0).astype(int)
  return f"paper {tuple(c)} ink<80:{(a<80).mean()*100:.1f}% blank:{(abs(a.astype(int)-bg)<12).mean()*100:.0f}%"
ims=[]
for f in refs+files:
  im=Image.open(f).convert('RGB');im=im.resize((int(im.width*H/im.height),H));
  c=Image.new('RGB',(im.width,H+40),'white');c.paste(im,(0,0));d=ImageDraw.Draw(c);d.text((5,H+4),f,fill='black');d.text((5,H+20),stat(f),fill='black');ims.append(c)
rows=[ims[:2],ims[2:]]
W=max(sum(i.width for i in r)+10*len(r) for r in rows)
S=Image.new('RGB',(W,(H+50)*2),'#888')
y=0
for r in rows:
  x=0
  for i in r:S.paste(i,(x,y));x+=i.width+10
  y+=H+50
S.save(out);print(out)
for f in refs+files:print(f,stat(f))
