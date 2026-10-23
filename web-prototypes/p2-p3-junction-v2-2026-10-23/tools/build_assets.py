"""只生成接缝位图与结构 SVG；不生产装饰美术，不改来源目录。"""
from pathlib import Path
import json, math, shutil, hashlib
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE=Path(__file__).resolve().parents[1]
ROOT=HERE.parent.parent
V3=HERE.parent/'p3-stained-glass-v3-2026-10-23'
V4=HERE.parent/'p1-p2-reveal-star-v4-2026-10-21'
PAPER=(246,243,237); INK=(30,30,30)

def qfoil(cx,cy,r):
    # 四叶饰是石作开口的边界，属于结构骨架。
    a=r*.42
    return f'M{cx-a},{cy-a} C{cx-r*1.45},{cy-r*1.45} {cx+r*1.45},{cy-r*1.45} {cx+a},{cy-a} C{cx+r*1.45},{cy-r*1.45} {cx+r*1.45},{cy+r*1.45} {cx+a},{cy+a} C{cx+r*1.45},{cy+r*1.45} {cx-r*1.45},{cy+r*1.45} {cx-a},{cy+a} C{cx-r*1.45},{cy+r*1.45} {cx-r*1.45},{cy-r*1.45} {cx-a},{cy-a}Z'

def structure(kind):
    old=json.loads((V3/f'assets/renders/chassis-{kind}.json').read_text())
    geom=json.loads((V3/'assets/lineart-geometry.json').read_text())[kind]
    sc=old['scale']; X,Y=old['crop'][:2]
    W,H=geom['W'],geom['H']; cx=geom['rose']['cx'];cy=geom['rose']['cy'];R=geom['rose']['R']
    mobile=kind=='mobile'; paths=[]
    def p(d,width=1.8,fill='none',klass=''):
        paths.append(f'<path class="{klass}" d="{d}" fill="{fill}" stroke="#1E1E1E" stroke-width="{width}" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>')
    left=8;right=W-10; shoulder=440 if not mobile else 350; tip=8; bottom=H-40
    for inset in (0,10,23):
        l=left+inset;r=right-inset;top=tip+inset*.9
        p(f'M{l},{bottom}V{shoulder} C{l},{shoulder*.52} {cx-150 if not mobile else cx-60},{top+65} {cx},{top} C{cx+150 if not mobile else cx+60},{top+65} {r},{shoulder*.52} {r},{shoulder} V{bottom}',2 if inset==0 else 1.25)
    # 独立玫瑰窗，完整保留；动画中的星 B 最后进入这个开口。
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="{R+7}" fill="#F6F3ED" stroke="#1E1E1E" stroke-width="1.8" vector-effect="non-scaling-stroke"/>')
    paths.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="#1E1E1E" stroke="#1E1E1E" stroke-width="1.2" vector-effect="non-scaling-stroke"/>')
    # 玫瑰窗的四瓣窗棂，线随结构走，不增加纹样。
    for a in (0,90,180,270):
        ar=math.radians(a);sx=cx+math.cos(ar)*R;sy=cy+math.sin(ar)*R
        ex=cx+math.cos(ar+math.pi/2)*R;ey=cy+math.sin(ar+math.pi/2)*R
        paths.append(f'<path d="M{sx},{sy} Q{cx},{cy} {ex},{ey}" fill="none" stroke="#F6F3ED" stroke-width="1.15" vector-effect="non-scaling-stroke"/>')
    # 拱肩石作与四叶饰位置对应夕里线稿。
    for side in (-1,1):
        fx=cx+side*(218 if not mobile else 123);fy=cy+(78 if not mobile else 80);rr=29 if not mobile else 19
        p(qfoil(fx,fy,rr),1.35, '#F6F3ED')
        p(f'M{fx},{fy-rr*2.6} Q{fx-side*rr*2.5},{fy} {fx},{fy+rr*2.5} Q{fx+side*rr*2.5},{fy} {fx},{fy-rr*2.6}Z',1.3)
        if not mobile:p(qfoil(cx+side*70,cy+169,18),1.25,'#F6F3ED')
    slots=[]
    for i,s in enumerate(old['slots']):
        x,y,w,h=[v/sc for v in s['fill_box']];x+=X/sc;y+=Y/sc
        tx,ty,tw,th=[v/sc for v in s['cart_box']];tx+=X/sc;ty+=Y/sc
        # 保留原 v3 的封面矩形和裁切，只补其上方尖拱的结构外边。
        b=y+h
        # v3 分区算法把上方四叶饰也归进了 glass；保留封面原文件，恢复主窗开口。
        y=max(y,([424,397,424,397,424][i] if not mobile else [382,389,382][i]))
        h=b-y
        apex=y-14; sideTop=y+48
        d=f'M{x},{b} V{sideTop} C{x},{y+22} {x+w*.26},{y+10} {x+w/2},{apex} C{x+w*.74},{y+10} {x+w},{y+22} {x+w},{sideTop} V{b}Z'
        p(d,1.65,'none')
        p(f'M{x-7},{b+th+22} V{sideTop} C{x-7},{y+10} {x+w*.24},{y-3} {x+w/2},{apex-13} C{x+w*.76},{y-3} {x+w+7},{y+10} {x+w+7},{sideTop} V{b+th+22}',1.3)
        # 封面开口与 v3 内容尺寸相同；尖拱只属于框。
        slots.append(dict(fill_box=[x,y,w,h],cart_box=[tx,ty,tw,th],clip=d))
        # 柱头、柱身、柱础
        for col in (x-12,x+w+12):
            p(f'M{col-4},{sideTop+3}h8v7h-8z M{col-2},{sideTop+10}V{bottom-17} M{col+2},{sideTop+10}V{bottom-17} M{col-5},{bottom-17}h10v6h-10z M{col-7},{bottom-11}h14v7h-14z',1.1,'#F6F3ED')
        p(f'M{tx},{ty}H{tx+tw}V{ty+th}H{tx}Z',1.2,'#1E1E1E')
        # 卷轴沿用 v3 的版式位置，仅中心题字在 HTML，侧格留空。
        ym=ty+th*.49; xa=tx+tw*.14;xb=tx+tw*.86;hh=th*.27
        p(f'M{xa},{ym-hh}Q{(xa+xb)/2},{ym-hh-4} {xb},{ym-hh} V{ym+hh} Q{(xa+xb)/2},{ym+hh-4} {xa},{ym+hh}Z',1.1)
        paths[-1]=paths[-1].replace('stroke="#1E1E1E"','stroke="#F6F3ED"')
    p(f'M{left-3},{bottom}H{right+3}V{bottom+10}H{left-3}Z M{left-6},{bottom+10}H{right+6}V{bottom+20}H{left-6}Z',1.5,'#F6F3ED')
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><title>按夕里底层拟合的建筑结构骨架；不是铜版装饰美术</title>'+''.join(paths)+'</svg>'
    (HERE/f'assets/frame-{kind}.svg').write_text(svg)
    return dict(size=[W,H],rose=[cx,cy,R],slots=slots)

if __name__=='__main__':
    data={k:structure(k) for k in ('web','mobile')}
    (HERE/'assets/frame-geometry.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
    (HERE/'assets/topics.json').write_bytes((V3/'assets/renders/strip-topics.json').read_bytes())
    print('建筑结构 / 24专题清单已生成；来源目录只读')
