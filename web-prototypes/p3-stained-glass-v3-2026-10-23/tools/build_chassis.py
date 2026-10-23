"""Build stone chassis (transparent glass) + slot geometry for swipe viewport."""
import numpy as np, json, os, math
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd

HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(HERE)
INK=np.array([0x1E,0x1E,0x1E,255],np.uint8); PAP=np.array([0xF6,0xF3,0xED,255],np.uint8)
G=json.load(open('assets/lineart-geometry.json'))
topics=json.load(open('assets/feishu/topics.json'))['topics']
ORDER=[t['slug'] for t in topics]  # already by 序号
os.makedirs('assets/panes', exist_ok=True)
os.makedirs('assets/renders', exist_ok=True)

CROPS_SPECIAL={'eros':(380,60,820,1480)}

def load_cover(slug, path):
    im=Image.open(path).convert('RGB')
    if slug in CROPS_SPECIAL: return im.crop(CROPS_SPECIAL[slug])
    w,h=im.size
    if w>h*1.15:
        nw=int(w*0.40); x0=(w-nw)//2; return im.crop((x0,0,x0+nw,h))
    nw=int(w*0.72); x0=(w-nw)//2; return im.crop((x0,0,x0+nw,h))

def prepare(kind, scale):
    src=Image.open(f'assets/lineart-{kind}.png').convert('L')
    full=src.resize((src.width*scale, src.height*scale), Image.LANCZOS)
    a=np.asarray(full).astype(float); ink=a<150
    lab,_=nd.label(~nd.binary_dilation(ink, iterations=2))
    H,W=a.shape; geom=G[kind]
    rose=geom['rose']; rb=int((rose['cy']+rose['R']*1.15)*scale)
    lancets=[]
    for i,ln in enumerate(geom['lancets']):
        x,y,w,h=[v*scale for v in ln['body']]
        lid=lab[int(y+h*0.55), int(x+w/2)]
        body=(lab==lid)
        gy,gx=np.nonzero(body); x0,x1,ytop=gx.min(),gx.max(),gy.min()
        head=np.zeros_like(body)
        for rid in range(1, int(lab.max())+1):
            if rid==lid: continue
            m=(lab==rid); area=m.sum()
            if area<40 or area>80000: continue
            my,mx=np.nonzero(m); cy,cx=my.mean(),mx.mean()
            if cy>=rb and cy<=ytop+30 and x0+10<=cx<=x1-10: head|=m
        glass=nd.binary_fill_holes(body|head)
        cx2,cy2,cw,ch=[v*scale for v in ln['cart']]
        cid=lab[int(cy2+ch/2), int(cx2+cw/2)]
        cart=nd.binary_fill_holes(lab==cid)
        lancets.append(dict(glass=glass, cart=cart, i=i))
    return ink,H,W,lancets,geom,scale

def build_chassis(kind, scale):
    ink,H,W,lancets,geom,sc=prepare(kind, scale)
    # RGBA: paper stone, ink lines, black glass+cart; glass fill area transparent for covers beneath
    img=np.zeros((H,W,4),np.uint8)
    img[:]=PAP
    img[ink]=INK
    erode=lambda m,n=1: nd.binary_erosion(m, iterations=n)
    slots=[]
    for L in lancets:
        g=L['glass']; c=L['cart']
        # night glass full
        img[erode(g)]=INK; img[erode(c)]=INK
        # transparent hole for cover (inset = night rim stays)
        fill=erode(g, 12 if kind=='web' else 10)
        if fill.sum()<500: fill=erode(g, 4)
        img[fill]=[0,0,0,0]
        ys,xs=np.nonzero(fill)
        y0,y1,x0,x1=int(ys.min()),int(ys.max()),int(xs.min()),int(xs.max())
        # cartouche box for title overlay
        cy,cx=np.nonzero(c)
        slots.append(dict(
            fill_box=[x0,y0,x1-x0+1,y1-y0+1],
            cart_box=[int(cx.min()),int(cy.min()),int(cx.max()-cx.min()+1),int(cy.max()-cy.min()+1)],
        ))
    # crop to window
    rose=geom['rose']
    Y0=max(0,int(rose['cy']*sc - rose['R']*sc*(2.2 if kind=='web' else 2.0)))
    xs=np.concatenate([np.nonzero(L['glass']|L['cart'])[1] for L in lancets])
    ys=np.concatenate([np.nonzero(L['glass']|L['cart'])[0] for L in lancets])
    X0,X1=max(0,int(xs.min())-50),min(W,int(xs.max())+50)
    Y1=min(H,int(ys.max())+40)
    chassis=Image.fromarray(img[Y0:Y1,X0:X1], 'RGBA')
    chassis.save(f'assets/renders/chassis-{kind}.png')
    # adjust slots to crop
    for s in slots:
        s['fill_box'][0]-=X0; s['fill_box'][1]-=Y0
        s['cart_box'][0]-=X0; s['cart_box'][1]-=Y0
    meta=dict(kind=kind, size=[chassis.width, chassis.height], crop=[X0,Y0,X1,Y1],
              scale=sc, slots=slots, rose_frac=[rose['cx']*sc/W, rose['cy']*sc/H])
    json.dump(meta, open(f'assets/renders/chassis-{kind}.json','w'), indent=1)
    print(kind, chassis.size, 'slots', len(slots))
    return meta

def make_panes(web_meta, mob_meta):
    """Pre-render cover images sized for each slot index (web 0..4, mobile 0..2) — actually one tall crop per topic; CSS object-fit covers the hole."""
    for t in topics:
        cov=load_cover(t['slug'], t['cover'])
        # save a normalized tall pane ~600px wide
        h=1200; s=h/cov.height; cov=cov.resize((max(1,int(cov.width*s)), h), Image.LANCZOS)
        cov.save(f"assets/panes/{t['slug']}.jpg", quality=90)
    print('panes', len(topics))

if __name__=='__main__':
    wm=build_chassis('web', 4)
    mm=build_chassis('mobile', 3)
    make_panes(wm, mm)
    # write order for JS
    order=[{'slug':t['slug'],'zh':t['章节名'],'la':t['英文名'],'define':t.get('一句定义') or '','credit':t.get('封面图注') or '','seq':t['序号'],'pane':f"assets/panes/{t['slug']}.jpg"} for t in topics]
    json.dump(dict(topics=order), open('assets/renders/strip-topics.json','w'), ensure_ascii=False, indent=1)
    print('order', len(order))
