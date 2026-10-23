#!/usr/bin/env python3
"""爱欲封面 → 两色线稿 → 中窗夜玻璃合成。见同目录 README。"""
import numpy as np, cv2, math, os
from PIL import Image, ImageDraw, ImageFont
from skimage import morphology
from scipy import ndimage as nd
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V2='/workspace/shenmei-waigua/web-prototypes/p3-stained-glass-v2-2026-10-23'
os.chdir(HERE)
# Frame (build if missing)
if not os.path.exists('work/frame.npz'):
    S=4; src=Image.open(f'{V2}/assets/lineart-web.png').convert('L')
    X0,Y0,X1,Y1=350,372,575,940
    c=src.crop((X0,Y0,X1,Y1)).resize(((X1-X0)*S,(Y1-Y0)*S),Image.LANCZOS)
    a=np.asarray(c).astype(float); ink=a<150
    lab,_=nd.label(~nd.binary_dilation(ink,iterations=2)); H,W=a.shape
    def at(x,y): return lab[int(y*S),int(x*S)]
    glass=(lab==at(112,300)); cartm=(lab==at(112,515))
    xs=np.nonzero(glass[1200])[0]; segs=np.split(xs,np.where(np.diff(xs)>1)[0]+1); xl,xr=max(segs,key=len)[0],max(segs,key=len)[-1]
    ys=np.arange(H)[:,None]; xx=np.arange(W)[None,:]; cart_top=np.nonzero(cartm[:,450])[0].min()
    glass2=glass&(xx>=xl)&(xx<=xr)&(ys<cart_top); cart2=cartm&(xx>=xl)&(xx<=xr)&(ys<2230)
    os.makedirs('work',exist_ok=True); np.savez('work/frame.npz',glass=glass2,cart=cart2,ink=ink,W=W,H=H)
cover=Image.open(f'{V2}/assets/feishu/covers/eros.jpg'); cover.crop((380,60,820,1480)).save('work/cover_crop_tall.jpg')
cover_cv=cv2.imread('work/cover_crop_tall.jpg'); cover_cv=cv2.resize(cover_cv,None,fx=2.5,fy=2.5,interpolation=cv2.INTER_LANCZOS4)
H,W=cover_cv.shape[:2]
s=cv2.bilateralFilter(cover_cv,9,50,50); s=cv2.edgePreservingFilter(s, flags=1, sigma_s=40, sigma_r=0.25)
lab=cv2.cvtColor(s,cv2.COLOR_BGR2LAB).astype(float); L,A,B=lab[:,:,0],lab[:,:,1],lab[:,:,2]
hsv=cv2.cvtColor(s,cv2.COLOR_BGR2HSV)
yellow=((hsv[:,:,0]>=15)&(hsv[:,:,0]<=45)&(hsv[:,:,1]>40)&(hsv[:,:,2]>80))
skin=((L>140)&(A>128)&(A<155)&(B>130)&(B<165)&(hsv[:,:,1]<90))
letter=(L>200)&(hsv[:,:,1]<40)
window=((hsv[:,:,0]>=90)&(hsv[:,:,0]<=130)&(hsv[:,:,2]<120))|(L<60)
cupid_zone=np.zeros((H,W),bool); cupid_zone[:H//2,:]=True; dark_paint=(L<90)&cupid_zone
fig=nd.binary_fill_holes(nd.binary_closing(yellow|skin|letter, iterations=4))
fig=morphology.remove_small_objects(fig, max_size=500)
lab2,n=nd.label(fig)
if n:
    sizes=nd.sum(fig,lab2,range(1,n+1)); keep=np.argsort(sizes)[-min(3,n):]+1; fig=np.isin(lab2,keep)
outline=fig & ~nd.binary_erosion(fig, iterations=3)
gray=cv2.cvtColor(s,cv2.COLOR_BGR2GRAY)
canny=cv2.Canny(cv2.GaussianBlur(gray,(3,3),0),40,120)>0
roi=nd.binary_dilation(fig,iterations=25)|nd.binary_dilation(window,iterations=5)|nd.binary_dilation(dark_paint,iterations=3)
fine=canny & roi; win_e=canny & nd.binary_dilation(window,iterations=8); cupid_e=canny & dark_paint
bold=nd.binary_dilation(outline, iterations=2)
thin=nd.binary_dilation(morphology.skeletonize(fine|win_e|cupid_e), iterations=1)
final=morphology.remove_small_objects(bold|thin, max_size=12)
Image.fromarray(np.where(final[...,None], [0x1E,0x1E,0x1E], [0xF6,0xF3,0xED]).astype(np.uint8)).save('02_线稿提取_黑线纸底.png')
f=np.load('work/frame.npz'); glass,cart,ink=f['glass'],f['cart'],f['ink']; fH,fW=int(f['H']),int(f['W'])
ys,xs=np.nonzero(glass); gx0,gx1,gy0,gy1=xs.min(),xs.max(),ys.min(),ys.max(); gh,gw=gy1-gy0,gx1-gx0
scale=min(gw*0.96/W, gh*0.97/H); nw,nh=int(W*scale),int(H*scale)
mask_r=np.array(Image.fromarray(final.astype(np.uint8)*255).resize((nw,nh),Image.NEAREST))>127
ox=gx0+(gw-nw)//2; oy=gy0+int(gh*0.02)
placed=np.zeros((fH,fW),bool); placed[oy:oy+nh,ox:ox+nw]=mask_r
INK=np.array([0x1E,0x1E,0x1E],np.uint8); PAP=np.array([0xF6,0xF3,0xED],np.uint8)
img=np.zeros((fH,fW,3),np.uint8); img[:]=PAP; img[ink]=INK
glassc=nd.binary_erosion(nd.binary_fill_holes(glass),iterations=2)
cy0,cy1=np.nonzero(cart.any(1))[0][[0,-1]]; cx0,cx1=np.nonzero(cart.any(0))[0][[0,-1]]
cartc=np.zeros_like(cart); cartc[cy0+3:cy1-1,cx0+3:cx1-2]=True
img[glassc|cartc]=INK; img[placed&glassc]=PAP
Limg=Image.new('L',(fW*2,fH*2),0); d=ImageDraw.Draw(Limg); k=2
mx=(cx0+cx1)/2; my=(cy0+cy1)/2; ww=(cx1-cx0)*0.33; hh=(cy1-cy0)*0.24
P=lambda x,y:(x*k,y*k); lw=4*k; amp=14
arc=lambda y,amp,x0,x1:[P(x,y-amp*math.cos((x-mx)/(ww)*math.pi/2)) for x in np.linspace(x0,x1,40)]
d.line(arc(my-hh,amp,mx-ww,mx+ww),fill=255,width=lw); d.line(arc(my+hh,amp,mx-ww,mx+ww),fill=255,width=lw)
for s_ in (-1,1):
    ex=mx+s_*ww; tx=mx+s_*(ww*1.24); dy=hh*0.55
    d.line([P(ex,my-hh),P(ex,my+hh)],fill=255,width=lw)
    d.line([P(ex-s_*6,my-hh+dy),P(tx,my-hh+dy+4),P(tx-s_*ww*0.16,my+dy*0.5),P(tx,my+hh+dy+4),P(ex-s_*6,my+hh+dy)],fill=255,width=lw-k)
    d.line([P(ex,my+hh),P(ex-s_*6,my+hh+dy)],fill=255,width=lw-k)
f1=ImageFont.truetype(f'{V2}/assets/cabinet-song.ttf',int(hh*1.15*k))
f2=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc',int(hh*0.32*k))
d.text(P(mx,my-hh*0.22-amp*0.6),'爱　欲',font=f1,fill=255,anchor='mm')
d.text(P(mx,my+hh*0.68),'E  R  O  S',font=f2,fill=255,anchor='mm')
img[np.asarray(Limg.resize((fW,fH),Image.LANCZOS))>110]=PAP
# only paint scroll on cart
img2=img.copy(); img2[~(cartc)]=img[~(cartc)]  # noop keep
# fix: scroll should only show on cart — rebuild properly
img=np.zeros((fH,fW,3),np.uint8); img[:]=PAP; img[ink]=INK; img[glassc|cartc]=INK; img[placed&glassc]=PAP
sc=np.asarray(Limg.resize((fW,fH),Image.LANCZOS))>110; img[sc&cartc]=PAP
Image.fromarray(img).save('03_中窗爱欲_素材填入_小样.png'); print('wrote final')
