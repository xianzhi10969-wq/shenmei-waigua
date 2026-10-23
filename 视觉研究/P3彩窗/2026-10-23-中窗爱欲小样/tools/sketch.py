import numpy as np, math
from PIL import Image, ImageDraw, ImageFont
g=np.load('work/glass.npy');c=np.load('work/cart.npy');ink=np.load('work/ink.npy')
H,W=g.shape; row=g[1200]; xs=np.nonzero(row)[0]
# 主段
segs=np.split(xs,np.where(np.diff(xs)>1)[0]+1); seg=max(segs,key=len); xl,xr=seg[0],seg[-1]
ys=np.arange(H)[:,None]; xx=np.arange(W)[None,:]
cart_top=np.nonzero(c[:,450])[0].min()
glass=g&(xx>=xl)&(xx<=xr)&(ys<cart_top)
cart=c&(xx>=xl)&(xx<=xr)&(ys<2230)
np.save('work/glass2.npy',glass); np.save('work/cart2.npy',cart)
print(xl,xr,cart_top)
# 构图速写
im=Image.new('RGB',(W,H),(255,255,255)); a=np.asarray(im).copy()
a[ink]=(30,30,30); a[glass&~ink]=(225,225,225); a[cart&~ink]=(205,205,215); im=Image.fromarray(a); d=ImageDraw.Draw(im)
cx=(xl+xr)//2; top=np.nonzero(glass[:,cx])[0].min()
f=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc',30)
R=(190,30,30)
d.line([(cx,top),(cx,cart_top)],fill=(120,120,255),width=2)                      # 中轴
# 人物：拉长的 S 形身线，脚在 88%，头在 33%，双臂上举托一朵玫瑰进入尖瓣窗头
foot=cart_top-90; head=top+520
pts=[(cx+30*math.sin((t/40)*math.pi*1.2), foot-(foot-head)*t/40) for t in range(41)]
d.line(pts,fill=R,width=6); d.ellipse([cx-38,head-95,cx+38,head-5],outline=R,width=6)
d.line([(cx-20,head-60),(cx-60,top+300),(cx-10,top+150)],fill=R,width=5); d.line([(cx+20,head-60),(cx+55,top+300),(cx+10,top+150)],fill=R,width=5)
d.ellipse([cx-55,top+40,cx+55,top+150],outline=R,width=6)                       # 玫瑰在尖瓣窗头
d.polygon([(cx-150,foot+10),(cx+150,foot+10),(cx+60,head+40),(cx-60,head+40)],outline=R,width=3)  # 长袍外形
# 藤蔓地：两侧稀疏的螺旋，留黑
for sx,sy,s in ((xl+70,top+700,1),(xr-70,top+1000,-1),(xl+80,top+1300,1),(xr-80,top+1500,-1)):
    p=[(sx+s*(40+3*t)*math.cos(t/6),sy+(40+3*t)*math.sin(t/6)) for t in range(30)]
    d.line(p,fill=(30,130,60),width=3)
# 卷轴题签
cy=(cart_top+2230)//2; d.line([(xl+40,cy),(xr-40,cy)],fill=(150,90,0),width=40); 
d.text((cx-40,cy-70),'爱欲 / EROS',font=f,fill=(30,30,30))
for i,(t) in enumerate(['红：人物（中等线宽）头在 33%，脚在 88%','红圈：玫瑰入尖瓣窗头（可越过）','绿：稀疏藤蔓地（最细线），留大量黑','灰：黑玻璃区　蓝灰：题签→卷轴带','蓝线：中轴；白：石作窗棂粗线']):
    d.text((xl+20,top+40+i*44+1500),t,font=f,fill=(0,0,0))
im.save('../2026-10-23-中窗爱欲小样/01_构图速写.png'); print('ok')
