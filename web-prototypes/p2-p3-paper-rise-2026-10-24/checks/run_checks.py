"""自测 + 截图。用法: python3 run_checks.py  (需先在原型目录 python3 -m http.server 8777)
输出: /workspace/out/p2p3-frames/*.png, /workspace/out/p2p3-contact-sheet.png, checks/results.json"""
import json, io, numpy as np
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
URL='http://127.0.0.1:8777/'
OUT='/workspace/out/p2p3-frames/'
PAPER=(248,246,239); HOLE=(19,18,24)
FR=[('00',0,'p=0 P2钉住'),('25',.25,'p=.25 纸升起'),('35',.35,'p=.35 纸升到一半'),('50',.5,'p=.5 纸升起'),('75',.75,'p=.75 停稳'),('87',.87,'p=.87 封面显影中'),('100',1,'p=1 终态')]
DEV={'web':(1440,900,False),'mobile':(390,844,True)}
res={}
def shot(pg,p):
    pg.evaluate(f'gotoP({p})'); pg.wait_for_timeout(120)
    return np.array(Image.open(io.BytesIO(pg.screenshot())).convert('RGB')).astype(int)
def pap_top(img):
    # 纸上沿：第一行整行都是 PAPER
    full=(np.abs(img-np.array(PAPER)).max(-1)==0).all(1)
    ys=np.where(full)[0]; return int(ys[0]) if len(ys) else None
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for dev,(w,h,mob) in DEV.items():
        ctx=b.new_context(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=mob,is_mobile=mob)
        pg=ctx.new_page(); pg.goto(URL); pg.wait_for_function('document.getElementById("reveal").complete&&document.getElementById("chassis").complete'); pg.wait_for_timeout(500)
        r={}
        base=shot(pg,0)
        # 保存关键帧
        for tag,p,_ in FR:
            im=shot(pg,p); Image.fromarray(im.astype('uint8')).save(f'{OUT}{dev}-{tag}.png')
        # 验收1：扫 0..1 共 201 个进度，纸上沿以上的行与 p=0 逐像素相同(无阴影/渐变/羽化)，纸上沿整行纯纸色，上一行不是纸色
        bad=[];n=0
        for i in range(0,201):
            p=i/200; im=shot(pg,p); y=pap_top(im)
            if y is None or y>=h: continue   # 纸还没上来
            n+=1
            above_same = (y==0) or (np.abs(im[:y]-base[:y]).max()==0)
            edge_row_pure=(im[y]==np.array(PAPER)).all()
            prev_nonpaper = (y==0) or ((np.abs(im[y-1]-np.array(PAPER)).max(-1)==0).mean()<0.02)
            below_ok=True  # 纸上沿以下第一行没有夜色泄漏在石框外：整行已是纯纸色
            if not (above_same and edge_row_pure and prev_nonpaper): bad.append((p,y,bool(above_same),bool(edge_row_pure),bool(prev_nonpaper)))
        r['check1_frames_tested']=n; r['check1_bad']=bad
        # 验收2：一半时，洞里纯夜色
        pg.evaluate('gotoP(.35)'); pg.wait_for_timeout(150)
        box=pg.evaluate('(()=>{const r=document.getElementById("win").getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()')
        ch=Image.open(f'/workspace/shenmei-waigua/web-prototypes/p2-p3-paper-rise-2026-10-24/assets/chassis-{dev}.png').split()[3]
        L,T,W,H=box; x0,y0=int(round(L)),int(round(T)); W,H=int(round(W)),int(round(H))
        am=np.array(ch.resize((W,H),Image.BILINEAR))
        hole=(am==0)
        from scipy.ndimage import binary_erosion
        hole=binary_erosion(hole,iterations=3)
        im=shot(pg,.35); ytop=pap_top(im)
        sub=im[max(0,y0):y0+H, max(0,x0):x0+W]
        hm=hole[max(0,y0)-y0:, max(0,x0)-x0:][:sub.shape[0],:sub.shape[1]]
        ys=np.arange(sub.shape[0])+max(0,y0)
        vis=(ys>=ytop)[:,None]&hm
        px=sub[vis]; ok=(np.abs(px-np.array(HOLE)).max(-1)<=2)
        r['check2_hole_pixels_visible']=int(vis.sum()); r['check2_pure_night_frac']=float(ok.mean()); r['check2_ytop']=ytop
        # 验收3：三拍互不重叠 + 倒滚原样
        seq=[]
        for i in range(0,101):
            p=i/100; pg.evaluate(f'gotoP({p})')
            s=pg.evaluate('(()=>{const m=new DOMMatrixReadOnly(getComputedStyle(document.getElementById("sheet")).transform).m42;const c=getComputedStyle(document.getElementById("reveal")).clipPath;return [m,c]})()')
            seq.append((p,s[0],s[1]))
        ys=[s[1] for s in seq]; cp=[float(__import__('re').findall(r'[\d.]+',s[2].split(' ')[2])[0]) if 'inset' in s[2] else 100 for s in seq]
        mv=[i for i in range(1,len(seq)) if ys[i]!=ys[i-1]]; rv=[i for i in range(1,len(seq)) if cp[i]!=cp[i-1]]
        r['beat1_rise_p']=[mv[0]/100,mv[-1]/100]; r['beat3_reveal_p']=[rv[0]/100,rv[-1]/100]
        r['beats_overlap']=bool(set(mv)&set(rv)); r['gap_between_beats_p']=[mv[-1]/100,rv[0]/100]
        fwd=shot(pg,.5); shot(pg,1); shot(pg,.0); back_after_full=shot(pg,.5)
        # 真实滚轮来回：向下滚再向上滚回
        pg.evaluate('scrollTo(0,0)'); 
        span=pg.evaluate('document.getElementById("run").offsetHeight-document.getElementById("stage").clientHeight')
        pg.evaluate(f'scrollTo(0,{span*.5})'); pg.wait_for_timeout(200); a=np.array(Image.open(io.BytesIO(pg.screenshot())).convert('RGB')).astype(int)
        pg.evaluate(f'scrollTo(0,{span})'); pg.wait_for_timeout(200)
        pg.evaluate(f'scrollTo(0,{span*.5})'); pg.wait_for_timeout(200); c=np.array(Image.open(io.BytesIO(pg.screenshot())).convert('RGB')).astype(int)
        r['check3_reverse_identical_gotoP']=bool(np.abs(fwd-back_after_full).max()==0)
        r['check3_reverse_identical_realscroll']=bool(np.abs(a-c).max()==0)
        res[dev]=r; ctx.close()
    b.close()
json.dump(res,open('/workspace/shenmei-waigua/web-prototypes/p2-p3-paper-rise-2026-10-24/checks/results.json','w'),ensure_ascii=False,indent=1)
print(json.dumps(res,ensure_ascii=False,indent=1))
# 总览
f=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',22) if __import__('os').path.exists('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc') else ImageFont.load_default()
th={'web':(480,300),'mobile':(104,225)}
cw=490; rows=[]
sheet=Image.new('RGB',(len(FR)*(cw)+20, 300+60+300+60),(255,255,255)); d=ImageDraw.Draw(sheet)
for ri,dev in enumerate(['web','mobile']):
    for ci,(tag,p,lab) in enumerate(FR):
        im=Image.open(f'{OUT}{dev}-{tag}.png'); 
        if dev=='web': t=im.resize((480,300),Image.LANCZOS)
        else: t=im.resize((139,300),Image.LANCZOS)
        x=10+ci*cw; y=10+ri*360
        sheet.paste(t,(x,y+30)); d.text((x,y),f'{dev} {lab}',fill=(0,0,0),font=f)
sheet.save('/workspace/out/p2p3-contact-sheet.png')
