"""构图方向速写：在夕里 459:2 线稿（v2 派生的两色版）上只用纯黑/纸白排明度，不用灰排线。"""
import numpy as np, json, math
from PIL import Image, ImageDraw
from scipy import ndimage as nd
V2='../../../web-prototypes/p3-stained-glass-v2-2026-10-23/'
INK=np.array([0x1E,0x1E,0x1E],np.uint8); PAP=np.array([0xF6,0xF3,0xED],np.uint8)
G=json.load(open(V2+'assets/lineart-geometry.json')); TOP=json.load(open(V2+'assets/feishu/topics.json'))['topics']
def load(k):
    a=np.asarray(Image.open(V2+f'assets/lineart-{k}.png').convert('L')).astype(float)
    ink=nd.binary_dilation(a<170,iterations=1); lab,n=nd.label(~ink); g=G[k]; H,W=a.shape
    regs=[]
    for i,s in enumerate(nd.find_objects(lab),1):
        m=lab==i; area=m.sum()
        if area<60 or s[0].start==0 or s[1].start==0 or s[0].stop==H or s[1].stop==W: continue
        dt=nd.distance_transform_edt(m); w=dt.max(); ys,xs=np.nonzero(m)
        regs.append(dict(m=m,area=area,w=w,cx=xs.mean(),cy=ys.mean(),band=(area/(w*w)>60 and w<=9),bb=s))
    return a,regs,g
def base(a):  # 线稿 → RGB
    t=np.clip(a/255,0,1)[...,None]; return (INK*(1-t)+PAP*t).astype(np.uint8)
def fill(img,m,col): img[m]=col
def in_body(r,g): return any(x-2<=r['cx']<=x+w+2 and y-70<=r['cy']<=y+h for x,y,w,h in [l['body'] for l in g['lancets']])
def in_cart(r,g): return any(x<=r['cx']<=x+w and y<=r['cy']<=y+h for x,y,w,h in [l['cart'] for l in g['lancets']])
def is_rose(r,g): R=g['rose']; return (r['cx']-R['cx'])**2+(r['cy']-R['cy'])**2<(R['R']*0.5)**2 and r['area']>3000
def covers(img,g,k,lit=True):
    im=Image.fromarray(img)
    order=[t['cover'] for t in TOP] if k=='web' else [TOP[1]['cover'],TOP[2]['cover'],TOP[3]['cover']]
    for ln,c in zip(g['lancets'],order):
        x,y,w,h=ln['body']; cv=Image.open(V2+c).convert('RGB'); cv.thumbnail((w-10,h-10))
        im.paste(cv,(int(x+(w-cv.width)/2),int(y+(h-cv.height)/2)))
    return np.asarray(im).copy()
def star(img,g,cream,scale=1.0):
    R=g['rose']; cx,cy=R['cx'],R['cy']; L=R['R']*0.72*scale; im=Image.fromarray(img); d=ImageDraw.Draw(im,'RGBA')
    col=tuple(PAP) if cream else tuple(INK)
    for k,f in ((0,1),(1,0.42)):
        for j in range(4):
            a=math.pi/2*j+k*math.pi/4; l=L*f; o=a+math.pi/2
            d.polygon([(cx+l*math.cos(a),cy+l*math.sin(a)),(cx+0.12*L*math.cos(o),cy+0.12*L*math.sin(o)),(cx,cy),(cx-0.12*L*math.cos(o),cy-0.12*L*math.sin(o))],fill=col)
    d.ellipse([cx-3,cy-3,cx+3,cy+3],fill=tuple(INK) if cream else tuple(PAP))
    return np.asarray(im).copy()
def rays(img,g,mask,n=48,col=PAP,r0=0,width=1):
    R=g['rose']; cx,cy=R['cx'],R['cy']; H,W=mask.shape; L=Image.new('L',(W,H),0); d=ImageDraw.Draw(L)
    for j in range(n):
        a=2*math.pi*j/n; ww=width+ (1 if j%4==0 else 0)
        d.line([(cx+r0*math.cos(a),cy+r0*math.sin(a)),(cx+2000*math.cos(a),cy+2000*math.sin(a))],fill=255,width=ww)
    m=(np.asarray(L)>0)&mask; img[m]=col
def direction(k,which):
    a,regs,g=load(k); img=base(a); H,W=a.shape
    sill=np.zeros_like(a,bool); sill[int(g['sill'][0])+3:,:]=True
    if which=='A':   # 几乎全纸白；唯一的黑 = 玫瑰窗心（星的夜）+ 窗台带
        for r in regs:
            if is_rose(r,g): fill(img,r['m'],INK)
            if r['band'] and r['cy']>g['sill'][0]: fill(img,r['m'],INK)
        img=covers(img,g,k); img=star(img,g,True)
    if which=='B':   # 穆夏光轮：玫瑰窗心黑底 + 纸白放射线；轴线上方拱肩用细墨线延续光芒，其余全白
        rose=None
        for r in regs:
            if is_rose(r,g): fill(img,r['m'],INK); rose=r
        rays(img,g,rose['m'],n=32,col=PAP,r0=g['rose']['R']*0.35)
        ax=np.zeros_like(a,bool)
        for r in regs:
            if not r['band'] and not in_body(r,g) and not is_rose(r,g) and abs(r['cx']-g['rose']['cx'])<g['rose']['R']*1.9 and r['cy']<g['rose']['cy']+g['rose']['R']*1.6:
                ax|=nd.binary_erosion(r['m'],iterations=3)
        rays(img,g,ax,n=96,col=INK,width=1)
        for r in regs:
            if r['band'] and r['cy']>g['sill'][0]: fill(img,r['m'],INK)
        img=covers(img,g,k); img=star(img,g,True,1.15)
    if which=='C':   # 夜玻璃：所有玻璃开口纯黑，石作留白；封面是被点亮的窗格，星在黑窗心里为纸白
        for r in regs:
            if r['band'] or in_cart(r,g): continue
            if r['cy']>g['sill'][0]-5: continue
            fill(img,r['m'],INK)
        img=covers(img,g,k); img=star(img,g,True)
    return img
if __name__=='__main__':
    import sys
    out={}
    for k,w in (('web','A'),('web','B'),('web','C'),('mobile','A'),('mobile','B'),('mobile','C')):
        out[(k,w)]=direction(k,w); Image.fromarray(out[(k,w)]).save(f'sketch-{w}-{k}.png')
    print('ok')
