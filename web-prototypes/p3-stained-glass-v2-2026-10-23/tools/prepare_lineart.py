"""从 Figma 459:2（夕里线稿底层原图，1448×1086，与她提供的文件逐字节相同）派生网页/手机两张线稿层：
只做四件事：①裁出 WEB/MOBILE 两部分；②把窗身里的 X 占位线和 topic cover 字样、题签里的 title 字样、玫瑰窗旁的 star 标注与引线擦成纸色；
③擦去她画的八角星（由同位置的星 B 接替，两颗星不重叠）；④把灰度映射到 #1E1E1E / #F6F3ED 两色（保留抗锯齿）。线条本身一笔不改。"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=f"{HERE}/assets/figma/459-2_夕里线稿底层_1448x1086_original.png"
g=np.asarray(Image.open(SRC).convert("L")).astype(float)
PAPER=255.0
def fill(x0,y0,x1,y1): g[int(y0):int(y1),int(x0):int(x1)]=PAPER
dark=g<150
# ---- 网页：五个窗身、五个题签
WEB_L=[(122,236),(258,390),(421,598),(628,760),(782,896)]
WEB_C=[(127,231),(264,385),(427,593),(633,755),(787,891)]
for a,b in WEB_L: fill(a+4,494,b-3,843)   # 窗头三叶尖拱止于约 y490（起拱处），其下才是占位 X 线
for a,b in WEB_C: fill(a+5,859,b-4,923)
MOB_TOP=int(os.environ.get('MOB_TOP',470)); MOB_SIDE=int(os.environ.get('MOB_SIDE',520))
# ---- 手机：中窗 + 两侧半窗、中间题签
fill(1116,MOB_TOP,1272,858); fill(1024,MOB_SIDE,1081,858); fill(1308,MOB_SIDE,1364,858)
fill(1125,876,1263,934)
# ---- 星的标注字与引线
fill(488,88,540,114)                 # 网页 "star"
fill(1205,40,1265,80)                # 手机 "star"
def erase_leader(pts,half=2):
    """沿引线折线擦除；与其他结构线的交叉点（两侧沿某方向都有墨线）保留。"""
    orig=dark.copy()
    for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
      sd=math.atan2(y1-y0,x1-x0)
      def crossing(x,y):
        for dx,dy in ((6,0),(5,2),(5,-2),(5,3),(5,-3),(4,4),(4,-4),(0,6),(2,5),(-2,5)):
            d=abs((math.atan2(dy,dx)-sd+math.pi/2)%math.pi-math.pi/2)
            if d<math.radians(35): continue          # 与被擦线同方向的不算交叉
            if orig[y+dy,x+dx] and orig[y-dy,x-dx]: return True
        return False
      if True:
        n=int(max(abs(x1-x0),abs(y1-y0)))*2+1
        for t in np.linspace(0,1,n):
            cx=x0+(x1-x0)*t; cy=y0+(y1-y0)*t
            for x in range(int(round(cx))-half,int(round(cx))+half+1):
                y=int(round(cy))
                if orig[y,x] and crossing(x,y): continue
                g[y,x]=PAPER
erase_leader([(512,110),(512,168)])
def track_leader(x,y_top,y_bot,half=3):
    orig=dark.copy(); slope=0.0
    for y in range(y_top,y_bot):
        px=x+slope
        xs=[i for i in range(int(round(px))-3,int(round(px))+4) if orig[y,i]]
        wide=np.sum(orig[y,int(px)-12:int(px)+13])>10
        if xs and not wide:
            nx=sum(xs)/len(xs); slope=0.8*slope+0.2*(nx-x); x=nx
            g[y,int(round(x))-half:int(round(x))+half+1]=PAPER
        else: x=px
erase_leader([(1236.5,88),(1236,108),(1234,118),(1231,126),(1228,132),(1225,140),(1221,148),(1218,154),(1215,160),(1212,168),(1208.5,176),(1205,184),(1203,190),(1201,196),(1199,204),(1197,210)],half=2)   # 逐行实测的引线位置
for (cx,cy,r) in ((512,169,6),(1196,214,6)):   # 引线末端圆点
    yy,xx=np.ogrid[:g.shape[0],:g.shape[1]]; g[(xx-cx)**2+(yy-cy)**2<=r*r]=PAPER
# ---- 擦去八角星（八芒星多边形 + 2px 余量）
def erase_star(cx,cy,R):
    im=Image.new("L",(g.shape[1],g.shape[0]),0); d=ImageDraw.Draw(im); pts=[]
    for k in range(16):
        ang=-math.pi/2+k*math.pi/8; rr=R if k%2==0 else R*0.40
        pts.append((cx+rr*math.cos(ang),cy+rr*math.sin(ang)))
    d.polygon(pts,fill=255); m=np.asarray(im)>0
    from scipy.ndimage import binary_dilation
    m=binary_dilation(m,iterations=4)
    yy,xx=np.ogrid[:g.shape[0],:g.shape[1]]; m&=((xx-cx)**2+(yy-cy)**2)<(R-3)**2
    g[m]=PAPER
STAR_W=(512,240,84); STAR_M=(1196,280,68)
erase_star(*STAR_W); erase_star(*STAR_M)
for (cx,cy,R) in (STAR_W,STAR_M):            # 八个芒尖触到内环的短线头
    for k in range(8):
        a=-math.pi/2+k*math.pi/4; p0=(cx+(R-10)*math.cos(a),cy+(R-10)*math.sin(a)); p1=(cx+(R+9)*math.cos(a),cy+(R+9)*math.sin(a))
        erase_leader([p0,p1],half=2)
def duo(sub):
    t=np.clip((sub-40)/(236-40),0,1)[...,None]   # 纸面杂色(>236)归为纸色，线(<40)归为墨色
    t=t*t*(3-2*t)
    ink=np.array([0x1E,0x1E,0x1E]); pap=np.array([0xF6,0xF3,0xED])
    return (ink*(1-t)+pap*t).astype(np.uint8)
CROPS={"web":(50,8,965,996),"mobile":(1000,80,1392,996)}
meta={}
for k,(x0,y0,x1,y1) in CROPS.items():
    Image.fromarray(duo(g[y0:y1,x0:x1])).save(f"{HERE}/assets/lineart-{k}.png",optimize=True)
    if k=="web":
        lan=[dict(body=[a+4-x0,500-y0,b-a-7,338],cart=[c0-x0,853-y0,c1-c0,75]) for (a,b),(c0,c1) in zip(WEB_L,WEB_C)]
        sx,sy,R=STAR_W; sill=948
    else:
        lan=[dict(body=[1024-x0,524-y0,57,330],cart=[1021-x0,871-y0,62,68]),
             dict(body=[1116-x0,474-y0,156,382],cart=[1125-x0,871-y0,138,68]),
             dict(body=[1308-x0,524-y0,56,330],cart=[1305-x0,871-y0,62,68])]
        sx,sy,R=STAR_M; sill=939
    meta[k]=dict(W=x1-x0,H=y1-y0,rose=dict(cx=sx-x0,cy=sy-y0,R=R),sill=[sill-y0,y1-y0],lancets=lan,crop=[x0,y0,x1,y1])
json.dump(meta,open(f"{HERE}/assets/lineart-geometry.json","w"),indent=1)
print(meta["web"]["W"],meta["web"]["H"],meta["mobile"]["W"],meta["mobile"]["H"])
