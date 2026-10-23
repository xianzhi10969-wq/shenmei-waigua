"""Build full-colour 5-lancet (web) + mobile 3-panel from Feishu covers + 459:2 lineart."""
import numpy as np, math, json, os
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd

HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(HERE)
INK=np.array([0x1E,0x1E,0x1E],np.uint8); PAP=np.array([0xF6,0xF3,0xED],np.uint8)
S=4
ORDER=['liubai','melancholy','eros','arcadia','yugen']
EN={'liubai':'LIUBAI','melancholy':'MELANCHOLY','eros':'EROS','arcadia':'ARCADIA','yugen':'YŪGEN'}
# Approved eros crop; others: tall centre crops tuned for Gothic light
CROPS={
    'eros': (380,60,820,1480),
    'liubai': 'landscape',
    'melancholy': 'portrait',
    'arcadia': 'landscape',
    'yugen': 'portrait',
}
topics={t['slug']:t for t in json.load(open('assets/feishu/topics.json'))['topics']}
G=json.load(open('assets/lineart-geometry.json'))
erode=lambda m,n=1: nd.binary_erosion(m, iterations=n)

def load_cover(slug):
    im=Image.open(topics[slug]['cover']).convert('RGB')
    c=CROPS[slug]
    if isinstance(c,tuple): return im.crop(c)
    w,h=im.size
    if c=='landscape':
        nw=int(w*0.40); x0=(w-nw)//2; return im.crop((x0,0,x0+nw,h))
    # portrait: slight side crop to tighten
    nw=int(w*0.72); x0=(w-nw)//2; return im.crop((x0,0,x0+nw,h))

def prepare(kind):
    scale=S if kind=='web' else 3
    src=Image.open(f'assets/lineart-{kind}.png').convert('L')
    full=src.resize((src.width*scale, src.height*scale), Image.LANCZOS)
    a=np.asarray(full).astype(float); ink=a<150
    lab,_=nd.label(~nd.binary_dilation(ink, iterations=2))
    H,W=a.shape; geom=G[kind]
    rose=geom['rose']; rb=int((rose['cy']+rose['R']*1.15)*scale)
    n=len(geom['lancets']); lancets=[]
    for i in range(n):
        # mobile has 3 lancets showing topics shifted; for static render use centre=eros index
        ln=geom['lancets'][i]
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
            if cy>=rb and cy<=ytop+30 and x0+10<=cx<=x1-10:
                head|=m
        glass=nd.binary_fill_holes(body|head)
        cx2,cy2,cw,ch=[v*scale for v in ln['cart']]
        cid=lab[int(cy2+ch/2), int(cx2+cw/2)]
        lancets.append(dict(glass=glass, cart=nd.binary_fill_holes(lab==cid),
                            x0=int(x0),x1=int(x1), i=i))
    return dict(ink=ink,H=H,W=W,lancets=lancets,geom=geom,scale=scale,lab=lab)

def draw_scroll(img, cart_mask, zh, en):
    rows=np.nonzero(cart_mask.any(1))[0]; cols=np.nonzero(cart_mask.any(0))[0]
    if len(rows)==0: return img
    cy0,cy1,cx0,cx1=rows[0],rows[-1],cols[0],cols[-1]
    cartc=np.zeros_like(cart_mask); cartc[cy0+4:cy1-2, cx0+4:cx1-3]=True
    img[cartc]=INK
    fH,fW=img.shape[:2]
    L=Image.new('L',(fW*2,fH*2),0); d=ImageDraw.Draw(L); k=2
    mx=(cx0+cx1)/2; my=(cy0+cy1)/2; ww=(cx1-cx0)*0.34; hh=(cy1-cy0)*0.26
    P=lambda x,y:(x*k,y*k); lw=max(3,int(4*k)); amp=max(8,int(hh*0.15))
    def arc(y,amp,x0,x1):
        return [P(x,y-amp*math.cos((x-mx)/max(ww,1)*math.pi/2)) for x in np.linspace(x0,x1,40)]
    d.line(arc(my-hh,amp,mx-ww,mx+ww),fill=255,width=lw)
    d.line(arc(my+hh,amp,mx-ww,mx+ww),fill=255,width=lw)
    for s_ in (-1,1):
        ex=mx+s_*ww; tx=mx+s_*(ww*1.22); dy=hh*0.55
        d.line([P(ex,my-hh),P(ex,my+hh)],fill=255,width=lw)
        d.line([P(ex-s_*5,my-hh+dy),P(tx,my-hh+dy+3),P(tx-s_*ww*0.15,my+dy*0.5),
                P(tx,my+hh+dy+3),P(ex-s_*5,my+hh+dy)],fill=255,width=max(2,lw-k))
        d.line([P(ex,my+hh),P(ex-s_*5,my+hh+dy)],fill=255,width=max(2,lw-k))
    f1=ImageFont.truetype('assets/cabinet-song.ttf', max(18,int(hh*1.05*k)))
    f2=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc', max(12,int(hh*0.28*k)))
    d.text(P(mx, my-hh*0.20-amp*0.5), '　'.join(list(zh)), font=f1, fill=255, anchor='mm')
    d.text(P(mx, my+hh*0.62), '  '.join(list(en)), font=f2, fill=255, anchor='mm')
    sc=np.asarray(L.resize((fW,fH), Image.LANCZOS))>110
    img[sc & cartc]=PAP
    return img

def place_cover(img, glass, cover_im, inset=12):
    fill=erode(glass, inset)
    if fill.sum()<800: fill=erode(glass, max(2,inset//2))
    ys,xs=np.nonzero(fill)
    y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max()
    fh,fw=y1-y0+1, x1-x0+1
    s=max(fh/cover_im.height, fw/cover_im.width)*1.03
    cw,ch=int(cover_im.width*s), int(cover_im.height*s)
    cover=cover_im.resize((cw,ch), Image.LANCZOS)
    ox=x0+(fw-cw)//2; oy=y0+(fh-ch)//2 - int(fh*0.03)
    layer=np.zeros_like(img)
    sx0,sy0=max(0,ox),max(0,oy); sx1,sy1=min(img.shape[1],ox+cw),min(img.shape[0],oy+ch)
    patch=np.asarray(cover)[sy0-oy:sy0-oy+(sy1-sy0), sx0-ox:sx0-ox+(sx1-sx0)]
    layer[sy0:sy1,sx0:sx1]=patch
    out=img.copy(); out[fill]=layer[fill]
    return out

def render_web():
    P=prepare('web'); H,W,ink,lancets=P['H'],P['W'],P['ink'],P['lancets']
    img=np.zeros((H,W,3),np.uint8); img[:]=PAP; img[ink]=INK
    for L in lancets:
        img[erode(L['glass'])]=INK; img[erode(L['cart'])]=INK
    for i,L in enumerate(lancets):
        slug=ORDER[i]; cov=load_cover(slug); cov.save(f'work/crop_{slug}.jpg')
        img=place_cover(img, L['glass'], cov, inset=12)
        img=draw_scroll(img, L['cart'], topics[slug]['章节名'], EN[slug])
    rose=P['geom']['rose']; sc=P['scale']
    Y0=max(0,int(rose['cy']*sc - rose['R']*sc*2.2))
    xs=np.concatenate([np.nonzero(L['glass']|L['cart'])[1] for L in lancets])
    ys=np.concatenate([np.nonzero(L['glass']|L['cart'])[0] for L in lancets])
    X0,X1=max(0,xs.min()-50),min(W,xs.max()+50); Y1=min(H,ys.max()+40)
    out=Image.fromarray(img[Y0:Y1,X0:X1])
    os.makedirs('assets/renders',exist_ok=True)
    out.save('assets/renders/window-web-full.png')
    out.save('assets/window-web.png')
    print('web', out.size)
    return out

def render_mobile(center_idx=2):
    """Mobile: 3 lights — half | full | half, topics centred on center_idx."""
    P=prepare('mobile'); H,W,ink,lancets=P['H'],P['W'],P['ink'],P['lancets']
    assert len(lancets)==3
    # topic indices for left half, centre, right half
    idxs=[(center_idx-1)%5, center_idx%5, (center_idx+1)%5]
    img=np.zeros((H,W,3),np.uint8); img[:]=PAP; img[ink]=INK
    for L in lancets:
        img[erode(L['glass'])]=INK; img[erode(L['cart'])]=INK
    for L,ti in zip(lancets, idxs):
        slug=ORDER[ti]; cov=load_cover(slug)
        img=place_cover(img, L['glass'], cov, inset=10)
        # only full centre cartouche gets readable title; sides too narrow — still draw
        img=draw_scroll(img, L['cart'], topics[slug]['章节名'], EN[slug])
    rose=P['geom']['rose']; sc=P['scale']
    Y0=max(0,int(rose['cy']*sc - rose['R']*sc*2.0))
    xs=np.concatenate([np.nonzero(L['glass']|L['cart'])[1] for L in lancets])
    ys=np.concatenate([np.nonzero(L['glass']|L['cart'])[0] for L in lancets])
    X0,X1=max(0,xs.min()-30),min(W,xs.max()+30); Y1=min(H,ys.max()+30)
    out=Image.fromarray(img[Y0:Y1,X0:X1])
    out.save(f'assets/renders/window-mobile-c{center_idx}.png')
    if center_idx==2:
        out.save('assets/window-mobile.png')
    print('mobile', center_idx, out.size)
    return out

if __name__=='__main__':
    os.makedirs('work',exist_ok=True)
    render_web()
    for i in range(5):
        render_mobile(i)
    print('ok')
