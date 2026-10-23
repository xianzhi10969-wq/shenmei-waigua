import numpy as np, sys, math
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd
gen=sys.argv[1]; out=sys.argv[2]; TH=int(sys.argv[3]) if len(sys.argv)>3 else 190
BOLD=int(sys.argv[4]) if len(sys.argv)>4 else 0
INK=np.array([0x1E,0x1E,0x1E],np.uint8); PAP=np.array([0xF6,0xF3,0xED],np.uint8)
glass=np.load('work/glass2.npy'); cart=np.load('work/cart2.npy'); ink=np.load('work/ink.npy')
H,W=glass.shape
ys,xs=np.nonzero(glass); gx0,gx1,gy0,gy1=xs.min(),xs.max(),ys.min(),ys.max()
art=Image.open(gen).convert('L'); a=np.asarray(art)
m=a<200; yy,xx=np.nonzero(m)
bx0,bx1,by0,by1=xx.min(),xx.max(),yy.min(),yy.max()
art=art.crop((bx0,by0,bx1+1,by1+1))
# 适配：内容高 = 玻璃高 * 0.93，宽不超过玻璃宽 * 0.94
s=min((gy1-gy0)*0.93/art.height,(gx1-gx0)*0.94/art.width)
art=art.resize((int(art.width*s),int(art.height*s)),Image.LANCZOS)
A=np.asarray(art); line=A<TH
if BOLD:
    closed=nd.binary_closing(nd.binary_dilation(line,iterations=2),iterations=3)
    bg=~closed; lab,_=nd.label(bg); outside=lab==lab[0,0]
    fig=nd.binary_fill_holes(~outside)
    lab2,n2=nd.label(fig); sizes=nd.sum(fig,lab2,range(1,n2+1)); keep=np.isin(lab2,np.argsort(sizes)[::-1][:1]+1)
    keep=nd.binary_opening(keep,iterations=4)
    edge=keep & ~nd.binary_erosion(keep,iterations=BOLD)
    line=line|edge
canvas=np.zeros((H,W),bool)
ox=int((gx0+gx1)/2-art.width/2); oy=int(gy0+(gy1-gy0)*0.04)
canvas[oy:oy+art.height,ox:ox+art.width]=line
# 合成：石作=纸白+墨线（夕里原线）；玻璃=墨黑+奶油线
img=np.zeros((H,W,3),np.uint8); img[:]=PAP; img[ink]=INK
glassc=nd.binary_erosion(nd.binary_fill_holes(glass),iterations=2)
cy0_,cy1_=np.nonzero(cart.any(1))[0][[0,-1]]; cx0_,cx1_=np.nonzero(cart.any(0))[0][[0,-1]]
cartc=np.zeros_like(cart); cartc[cy0_+3:cy1_-1,cx0_+3:cx1_-2]=True   # 题签框内整片黑玻璃（去掉旧角框，换卷轴）
img[glassc|cartc]=INK
img[canvas&glassc]=PAP
# 卷轴题签（结构件，奶油线）
cy0,cy1=np.nonzero(cart.any(1))[0][[0,-1]]; cx0,cx1=np.nonzero(cart.any(0))[0][[0,-1]]
L=Image.new('L',(W*2,H*2),0); d=ImageDraw.Draw(L); k=2
mx=(cx0+cx1)/2; my=(cy0+cy1)/2; w=(cx1-cx0)*0.33; h=(cy1-cy0)*0.24
def P(x,y): return (x*k,y*k)
lw=4*k
def arcpts(y,amp,x0,x1,n=40): return [P(x,y-amp*math.cos((x-mx)/(w)*math.pi/2)) for x in np.linspace(x0,x1,n)]
amp=14
band_t=arcpts(my-h,amp,mx-w,mx+w); band_b=arcpts(my+h,amp,mx-w,mx+w)
d.line(band_t,fill=255,width=lw); d.line(band_b,fill=255,width=lw)
for s_ in (-1,1):
    ex=mx+s_*w; tx=mx+s_*(w*1.24); dy=h*0.55
    # 端头折到背后：从主带端点向外下方的尾段，末端燕尾缺口
    d.line([P(ex,my-h),P(ex,my+h)],fill=255,width=lw)
    tail=[P(ex-s_*6,my-h+dy),P(tx,my-h+dy+4),P(tx-s_*w*0.16,my+dy*0.5),P(tx,my+h+dy+4),P(ex-s_*6,my+h+dy)]
    d.line(tail,fill=255,width=lw-k)
    d.line([P(ex,my+h),P(ex-s_*6,my+h+dy)],fill=255,width=lw-k)
f1=ImageFont.truetype('../../../web-prototypes/p3-stained-glass-v2-2026-10-23/assets/cabinet-song.ttf',int(h*1.15*k))
f2=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc',int(h*0.32*k))
d.text(P(mx,my-h*0.22-amp*0.6),'爱　欲',font=f1,fill=255,anchor='mm')
d.text(P(mx,my+h*0.68),'E  R  O  S',font=f2,fill=255,anchor='mm')
sc=np.asarray(L.resize((W,H),Image.LANCZOS))>110
img[sc&cartc]=PAP
Image.fromarray(img).save(out)
u=np.unique(img.reshape(-1,3),axis=0); print('colours',len(u),u.tolist())
