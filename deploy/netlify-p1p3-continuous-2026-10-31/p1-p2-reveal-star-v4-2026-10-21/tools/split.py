import numpy as np,scipy.ndimage as nd
from PIL import Image,ImageDraw
P=Image.open('painting_full.png').convert('RGBA'); A=np.asarray(P); H,W=A.shape[:2]
g=np.asarray(P.convert('L')).astype(float)
lab=np.load('lab.npy')
def poly(pts,off=560):
  m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon([(x+off,y) for x,y in pts],fill=1); return np.asarray(m).astype(bool)
wall=np.isin(lab,[3,13,23,25,22])
woman=poly([(330,280),(345,276),(372,300),(388,182),(420,150),(452,135),(490,150),(518,195),(556,252),(600,380),(700,560),(800,660),(872,738),(780,752),(600,756),(430,742),(332,730),(385,640),(378,330),(330,300)])&~wall
woman=woman|(nd.binary_dilation(woman,iterations=12)&(g<120))
shrine=(poly([(240,82),(256,180),(300,258),(338,288),(342,520),(362,530),(362,622),(112,622),(112,530),(132,520),(138,288),(176,258),(224,180)])|poly([(36,540),(140,540),(140,728),(36,728)])|poly([(80,490),(120,490),(120,545),(80,545)]))&~wall&~woman
yy,xx=np.mgrid[0:H,0:W]
orn=((np.hypot(xx-798,yy-358)<40)|((abs(xx-798)<12)&(yy>292)&(yy<470)))
star=orn&nd.binary_dilation(g<225,iterations=2)
woman&=~star; shrine&=~star
bg=~(woman|shrine|star)
names={'bg':bg,'shrine':shrine,'woman':woman,'star':star}
cov=np.zeros((H,W),int)
for n,m in names.items():
  o=A.copy(); o[...,3]=np.where(m,A[...,3],0); Image.fromarray(o).save(f'layers/{n}.png'); cov+=m
comp=Image.new('RGBA',(W,H))
for n in names: comp.alpha_composite(Image.open(f'layers/{n}.png'))
c=np.asarray(comp); match=(np.abs(c.astype(int)-A.astype(int)).max(-1)==0).mean()
print('coverage exactly-once',(cov==1).mean(),'match',match)
d=(np.abs(c.astype(int)-A.astype(int)).max(-1)*20).clip(0,255).astype('uint8'); Image.fromarray(d).save('layers/diff.png')
cream=(243,239,231,255); th=[]
for n in names:
  b=Image.new('RGBA',(W,H),cream); b.alpha_composite(Image.open(f'layers/{n}.png')); b=b.resize((720,418)); ImageDraw.Draw(b).text((10,10),n,fill=(200,0,0,255)); th.append(b)
cs=Image.new('RGBA',(1440,836),cream)
for i,t in enumerate(th): cs.paste(t,((i%2)*720,(i//2)*418))
cs.save('layers/contact.png')
