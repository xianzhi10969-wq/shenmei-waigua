"""派生素材（不改动任何原件）：
1) 封面双色线网版：从 v9 dist/assets/art-*.png 复制原图，并派生只含 #1E1E1E/#F6F3ED 的横向线网图（线宽随明度变化，铜版“线刻”式色阶；不加颗粒、不交叉排线）。
2) 衔接层：从 v4 P2（p2_nostar.png）裁下水面波纹，映射为双色。
3) 手机 P1/P2：Figma 306:2 手机列导出图的副本；P2 手机版抹去画上的水面星（由页面中的星接管）。"""
import json, os, shutil
import numpy as np
from PIL import Image, ImageOps, ImageFilter
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO=os.path.dirname(os.path.dirname(HERE))
V9=f"{REPO}/web-prototypes/p3-p4-restored-v9-2026-10-21/dist/assets"
V4=f"{REPO}/web-prototypes/p1-p2-reveal-star-v4-2026-10-21/assets"
INK=np.array([0x1E,0x1E,0x1E],float); PAPER=np.array([0xF6,0xF3,0xED],float)
TOPICS=[("liubai","留白","Liubai","art-liubai-fbc8bc9b5ba6.png"),
        ("melancholy","忧郁","Melancholy","art-melancholy-49250bd0ac0a.png"),
        ("eros","爱欲","Eros","art-eros-71f568ce09fe.png"),
        ("arcadia","田园","Arcadia","art-arcadia-6a8f40ca5870.png"),
        ("yugen","幽玄","Yūgen","art-yugen-025450f7d0c2.png")]
os.makedirs(f"{HERE}/assets/covers/orig",exist_ok=True)

def duo(t):  # t: ink coverage 0..1 → RGB
    return (PAPER[None,None,:]*(1-t[...,None])+INK[None,None,:]*t[...,None]).astype(np.uint8)

def linescreen(src, W, H, period=6, gamma=1.7):
    im=ImageOps.fit(Image.open(src).convert("L"),(W,H),Image.LANCZOS,centering=(0.5,0.45))
    im=im.filter(ImageFilter.GaussianBlur(0.8))
    L=np.asarray(im,float)
    r=np.argsort(np.argsort(L.ravel())).reshape(L.shape)/L.size   # 明度百分位
    dark=np.clip((0.62-r)/0.62,0,1)**gamma   # 白多黑少：最亮的 38% 留白，其余按百分位渐密
    y=np.arange(H)[:,None]%period+0.5
    dist=np.abs(y-period/2)                  # 到线心的距离
    half=dark*period/2*0.85
    cov=np.clip(half-dist+0.5,0,1)           # 抗锯齿覆盖率
    cov[dark<0.06]=0
    return duo(cov)

def run():
    meta={}
    for slug,zh,la,fn in TOPICS:
        shutil.copy(f"{V9}/{fn}",f"{HERE}/assets/covers/orig/{slug}.png")
        # 网页：按所在窗格比例；手机：中窗比例。尺寸 = 显示尺寸的 2 倍，线距 6px = 3 CSS px
        for tag,(W,H) in {"web-side":(220,654),"web-center":(270,646),"mob":(360,860)}.items():
            Image.fromarray(linescreen(f"{V9}/{fn}",W,H)).save(f"{HERE}/assets/covers/{slug}-{tag}.png",optimize=True)
        meta[slug]=dict(zh=zh,la=la,orig=f"assets/covers/orig/{slug}.png")
    json.dump(meta,open(f"{HERE}/assets/covers/topics.json","w"),ensure_ascii=False,indent=1)
    # 衔接层水纹
    p2=np.asarray(Image.open(f"{V4}/p2_nostar.png").convert("L"),float)
    band=p2[600:811,0:820]; band=np.concatenate([band,band[:,::-1]],1)[:,:1440]   # 只取左侧水纹（不带楼梯），镜像补宽
    lo=np.percentile(band,50); hi=np.percentile(band,99.9)
    t=np.clip((band-lo)/(hi-lo),0,1)          # 亮(米色波纹)=1
    rgb=(INK[None,None,:]*(1-t[...,None])+PAPER[None,None,:]*t[...,None]).astype(np.uint8)
    Image.fromarray(rgb).save(f"{HERE}/assets/junction-water-desk.png",optimize=True)
    # 手机 P1/P2（Figma 导出副本）
    for n in ("p1","p2"):
        shutil.copy(f"/workspace/out/figma_mobile_{n}.png",f"{HERE}/assets/m_{n}.png")
    im=Image.open(f"{HERE}/assets/m_p2.png").convert("RGB"); a=np.array(im)
    bg=a[1600:1640,20:60].reshape(-1,3).mean(0)
    a[1655:1765,105:180]=bg.astype(np.uint8)
    Image.fromarray(a).save(f"{HERE}/assets/m_p2_nostar.png",optimize=True)
    pm=np.asarray(Image.fromarray(a).convert("L"),float)
    band=pm[1800:2120,0:240]; band=np.concatenate([band,band[:,::-1],band,band[:,::-1]],1)[:,:780]   # 只取左侧水纹（不带楼梯）
    lo=np.percentile(band,50); hi=np.percentile(band,99.9)
    t=np.clip((band-lo)/(hi-lo),0,1)
    Image.fromarray((INK[None,None,:]*(1-t[...,None])+PAPER[None,None,:]*t[...,None]).astype(np.uint8)).save(f"{HERE}/assets/junction-water-mob.png",optimize=True)
    # v4 素材副本（不改原件）
    os.makedirs(f"{HERE}/assets/v4",exist_ok=True)
    for n in ("bg","shrine","woman","text","p2_nostar"): shutil.copy(f"{V4}/{n}.png",f"{HERE}/assets/v4/{n}.png")
    shutil.copy(f"{V9}/cabinet-song.ttf",f"{HERE}/assets/cabinet-song.ttf")
run(); print("ok")
