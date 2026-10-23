"""装饰层（新绘，待夕里审）：在夕里线稿 459:2 的封闭区域里生成——
 · 拱肩/花窗小开口：雕版式平行排线（交替 ±45°，按区域大小调间距）出明暗
 · 线脚带（外拱券、玫瑰窗环、窗台带、柱身）：沿中轴等距的串珠/菱形节奏
只用墨色 #1E1E1E（透明底 PNG，叠在线稿上），线宽 1px 细线 + 串珠实心，配合线稿的粗外轮廓。
区域由线稿本身分割得到，不改动线稿。"""
import numpy as np, json, math, os
from PIL import Image, ImageDraw
from scipy import ndimage as nd
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(HERE)
G=json.load(open('assets/lineart-geometry.json')); SS=3; INK=(0x1E,0x1E,0x1E)
for k in ('web','mobile'):
    g=G[k]; a=np.asarray(Image.open(f'assets/lineart-{k}.png').convert('L'))
    ink=nd.binary_dilation(a<170,iterations=1); lab,n=nd.label(~ink)
    H,W=a.shape; cv=Image.new('L',(W*SS,H*SS),0); d=ImageDraw.Draw(cv)
    hatch=np.zeros((H,W),bool); yy,xx=np.mgrid[:H,:W]
    bodies=[ln['body'] for ln in g['lancets']]+[ln['cart'] for ln in g['lancets']]
    r=g['rose']; sill_y=g['sill'][0]
    for i,s in enumerate(nd.find_objects(lab),1):
        m=lab==i; area=m.sum()
        if area<120: continue
        if s[0].start==0 or s[1].start==0 or s[0].stop==H or s[1].stop==W: continue   # 外部
        ys,xs=np.nonzero(m); cy,cx=ys.mean(),xs.mean()
        if any(x<=cx<=x+w and y-60<=cy<=y+h for x,y,w,h in bodies): continue          # 窗身/题签框留给封面与题名
        if (cx-r['cx'])**2+(cy-r['cy'])**2<(r['R']+4)**2: continue                   # 玫瑰窗心留给星
        dt=nd.distance_transform_edt(m); w=dt.max()
        hh=s[0].stop-s[0].start; ww=s[1].stop-s[1].start
        if hh>4*ww and s[0].start>g['lancets'][0]['body'][1]-80: continue           # 柱身保持素净（避免过密）
        if area/(w*w)>60 and w<=9:                                                    # 细长 = 线脚带 → 串珠
            ridge=np.argwhere((dt>=w-0.8)); placed=[]
            step=max(9,w*3.2) if cy<sill_y else max(12,w*4)
            for (py,px) in ridge[np.lexsort((ridge[:,1],ridge[:,0]))]:
                if all((py-qy)**2+(px-qx)**2>=step*step for qy,qx in placed[-60:]):
                    placed.append((py,px))
            if len(placed)<4: continue
            rad=max(1.2,w*0.42)
            for j,(py,px) in enumerate(placed):
                X,Y=(px+.5)*SS,(py+.5)*SS
                if j%2==0: d.ellipse([X-rad*SS,Y-rad*SS,X+rad*SS,Y+rad*SS],fill=255)
                else: R2=rad*1.25*SS; d.polygon([(X,Y-R2),(X+R2*.6,Y),(X,Y+R2),(X-R2*.6,Y)],outline=255,width=SS)
        elif cy<g['lancets'][0]['body'][1]+10:                                         # 拱肩 / 开口 → 排线
            inner=nd.binary_erosion(m,iterations=3)
            sp=4 if area>3000 else 3
            dirn=(i%2)*2-1
            hatch|=inner&(((xx+dirn*yy)%sp)==0)
    hl=Image.fromarray((hatch*255).astype(np.uint8)).resize((W*SS,H*SS),Image.NEAREST)
    cv=Image.fromarray(np.maximum(np.asarray(cv),np.asarray(hl)))
    al=cv.resize((W,H),Image.LANCZOS)
    alpha=np.asarray(al).astype(float)*0.9                                             # 排线略轻于主线
    out=np.zeros((H,W,4),np.uint8); out[...,:3]=INK; out[...,3]=np.clip(alpha,0,255).astype(np.uint8)
    Image.fromarray(out,'RGBA').save(f'assets/ornament-{k}.png',optimize=True)
    comp=Image.open(f'assets/lineart-{k}.png').convert('RGBA'); comp.alpha_composite(Image.fromarray(out,'RGBA'))
    comp.convert('RGB').save(f'/tmp/orn_{k}.png'); print(k)
