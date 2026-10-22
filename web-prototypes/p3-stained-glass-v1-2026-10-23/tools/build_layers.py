"""生成 P3 彩窗 v1 的结构图层（SVG）与布局数据（layout.json）。
python3 tools/build_layers.py   —— 只依赖标准库。"""
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from geom import *

INK="#1E1E1E"; PAPER="#F6F3ED"

def build(kind):
    P=[]  # (layer, cls, d, y_for_order)
    clipped=[False]
    def add(layer,cls,d,y): P.append((layer,cls,d,y,clipped[0]))
    if kind=="web":
        W,H=1240,1460; xL,xR=40,1200; ys=800; K=1.3; offs=[0,14,30]
        sill_top,sill_bot=1396,1430
        lan_ys=860; body_bot=1262; cart=(1272,1352)
        inner0,inner1=xL+42,xR-42; m=16
        ratios=[1,1,1.3,1,1]
        rose=(620,420,170); sub_k=1.5; lan_k=1.5
        q_small=[(424,606,32),(816,606,32)]
    else:
        W,H=600,1300; xL,xR=24,576; ys=600; K=1.3; offs=[0,10,22]
        sill_top,sill_bot=1250,1278
        lan_ys=690; body_bot=1124; cart=(1134,1206)
        inner0,inner1=xL+30,xR-30; m=14
        rose=(300,392,94); sub_k=None; lan_k=1.25
        q_small=[(112,585,28),(488,585,28)]
    # ---- 外框：三重线脚（外粗内细），两侧竖框到窗台
    for i,d in enumerate(offs):
        p,_=arch(xL,xR,ys,K,d)
        cls="o" if i==0 else ("m" if i==1 else "f")
        add("tracery",cls,p,ys-300)
        add("tracery",cls,f"M{f(xL+d)},{f(ys)} V{f(sill_top)}",(ys+sill_top)/2)
        add("tracery",cls,f"M{f(xR-d)},{f(ys)} V{f(sill_top)}",(ys+sill_top)/2)
    # 起拱线处的柱头短横（结构，不加花）
    for x in (xL,xR):
        sgn=1 if x==xL else -1
        add("tracery","m",f"M{f(x-sgn*8)},{f(ys)} H{f(x+sgn*(offs[-1]+6))}",ys)
    # 窗台
    add("tracery","o",f"M{f(xL-14)},{f(sill_top)} H{f(xR+14)} V{f(sill_bot)} H{f(xL-14)}Z",sill_top+30)
    add("tracery","f",f"M{f(xL+offs[-1])},{f(sill_top-34)} H{f(xR-offs[-1])}",sill_top)
    # ---- 窗格（lights）
    lancets=[]
    if kind=="web":
        total=inner1-inner0-4*m; u=total/sum(ratios); x=inner0
        for r in ratios:
            w=u*r; lancets.append((x,x+w)); x+=w+m
    else:
        cw=300; c0=300-cw/2
        lancets=[(c0-m-cw*0.66,c0-m),(c0,c0+cw),(c0+cw+m,c0+cw+m+cw*0.66)]
    clipL,clipR=xL+offs[-1],xR-offs[-1]
    lancet_meta=[]
    clipped[0]=(kind=='mobile')
    for i,(a,b) in enumerate(lancets):
        hw=(b-a)/2
        head,apex=arch(a,b,lan_ys,lan_k,0)
        add("tracery","m",head,lan_ys-60)
        cus,Lp,Rp=cusped(a,b,lan_ys,lan_k,7,depth=0.2)
        inner,_=arch(a,b,lan_ys,lan_k,7)
        add("tracery","f",inner,lan_ys-50)
        add("tracery","f",cus,lan_ys-40)
        # 窗格两侧竖线（直到题签底）
        for x in (a,b):
            add("tracery","m",f"M{f(x)},{f(lan_ys)} V{f(sill_top-34)}",(lan_ys+sill_top)/2)
        for x in (a+7,b-7):
            add("tracery","f",f"M{f(x)},{f(lan_ys)} V{f(body_bot)}",(lan_ys+body_bot)/2)
        # 题签分隔横线
        add("tracery","f",f"M{f(a)},{f(body_bot)} H{f(b)}",body_bot)
        # 封面采光形 = 三叶头 + 窗身
        clip=cus+f" L{f(b-7)},{f(body_bot-6)} L{f(a+7)},{f(body_bot-6)}Z"
        lancet_meta.append(dict(i=i,x0=a,x1=b,clip=clip,
            body=[a+7,apex,b-a-14,body_bot-6-apex],
            cart=[a+10,cart[0],b-a-20,cart[1]-cart[0]]))
        add("cartouche","m",cartouche(a+10,cart[0],b-10,cart[1],8),cart[0])
        add("cartouche","f",cartouche(a+15,cart[0]+5,b-15,cart[1]-5,6),cart[0])
    clipped[0]=False
    # 竖棂柱头（capital）：小方块，结构性
    for j in range(len(lancets)-1):
        x0=lancets[j][1]; x1=lancets[j+1][0]
        add("tracery","f",f"M{f(x0-3)},{f(lan_ys)} H{f(x1+3)} M{f(x0-3)},{f(lan_ys+8)} H{f(x1+3)}",lan_ys)
    # ---- 窗头花格（tracery head）
    if kind=="web":
        # 两组成对尖拱（覆盖 1–2、4–5 窗格），内置四叶圆窗
        pairs=[(lancets[0][0],lancets[1][1]),(lancets[3][0],lancets[4][1])]
        for a,b in pairs:
            p,ap=arch(a,b,lan_ys,sub_k,0); add("tracery","m",p,lan_ys-200)
            p2,_=arch(a,b,lan_ys,sub_k,8); add("tracery","f",p2,lan_ys-190)
            cx=(a+b)/2; cy=ap+ (lan_ys-ap)*0.42; R=min(62,(lan_ys-ap)*0.26)
            add("tracery","m",circle(cx,cy,R),cy); add("tracery","f",foil(cx,cy,R*0.9,4,0),cy)
        # 中窗外包尖拱
        a,b=lancets[2][0]-m,lancets[2][1]+m
        p,ap=arch(a,b,lan_ys,1.8,0); add("tracery","m",p,lan_ys-160)
    # 小四叶
    for (cx,cy,r) in q_small:
        add("tracery","m",circle(cx,cy,r),cy); add("tracery","f",foil(cx,cy,r*0.88,4,0),cy)
    # 玫瑰窗：双环 + 内四叶(45°) + 星位圆
    cx,cy,R=rose
    add("tracery","o",circle(cx,cy,R),cy-R); add("tracery","f",circle(cx,cy,R-10),cy-R+10)
    add("tracery","m",foil(cx,cy,R-12,4,math.pi/4,a=0.44,rho=0.52),cy)
    add("tracery","f",circle(cx,cy,R*0.40),cy)
    # 玫瑰窗下接竖棂的短柱（把玫瑰窗“坐”在中轴上）
    if kind=="web":
        slots=[dict(id="A",label="装饰位 A · 左拱肩（待逐件绘制）",ellipse=[190,600,95,150]),
               dict(id="A2",label="装饰位 A · 右拱肩（镜像）",ellipse=[1050,600,95,150]),
               dict(id="B",label="装饰位 B · 玫瑰窗外环饰带",circle=[cx,cy,R+26]),
               dict(id="C",label="装饰位 C · 尖拱顶饰（拱心）",ellipse=[620,170,60,55]),
               dict(id="D",label="装饰位 D · 窗台饰带",rect=[xL-14,sill_top,xR-xL+28,sill_bot-sill_top])]
    else:
        slots=[dict(id="B",label="装饰位 B · 玫瑰窗外环",circle=[cx,cy,R+18]),
               dict(id="C",label="装饰位 C · 拱心",ellipse=[300,300,36,30]),
               dict(id="D",label="装饰位 D · 窗台饰带",rect=[xL-14,sill_top,xR-xL+28,sill_bot-sill_top])]
    meta=dict(kind=kind,slots=slots,W=W,H=H,rose=dict(cx=cx,cy=cy,R=R),sill=[sill_top,sill_bot],
              clipFrame=[clipL,clipR],lancets=lancet_meta)
    return P,meta

def write(kind):
    P,meta=build(kind); W,H=meta["W"],meta["H"]
    os.makedirs(f"layers/{kind}",exist_ok=True)
    style=(f"<style>path{{fill:none;stroke:{INK};stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}}"
           ".o{stroke-width:2.2}.m{stroke-width:1.3}.f{stroke-width:.7}</style>")
    for layer in ("tracery","cartouche"):
        body="".join(f'<path class="{c}" data-y="{y:.0f}" d="{d}"/>' for l,c,d,y,cl in P if l==layer and not cl)
        cb="".join(f'<path class="{c}" data-y="{y:.0f}" d="{d}"/>' for l,c,d,y,cl in P if l==layer and cl)
        if cb: body+=f'<clipPath id="fr-{layer}"><rect x="{meta["clipFrame"][0]}" y="0" width="{meta["clipFrame"][1]-meta["clipFrame"][0]}" height="{H}"/></clipPath><g clip-path="url(#fr-{layer})">{cb}</g>'
        open(f"layers/{kind}/{'01-tracery' if layer=='tracery' else '04-cartouche'}.svg","w").write(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{style}{body}</svg>')
    json.dump(meta,open(f"layers/{kind}/layout.json","w"),ensure_ascii=False,indent=1)
    print(kind,len(P),"paths")
for k in ("web","mobile"): write(k)
