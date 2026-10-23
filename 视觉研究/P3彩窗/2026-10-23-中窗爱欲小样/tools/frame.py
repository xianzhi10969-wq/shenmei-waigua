import numpy as np
from PIL import Image
from scipy import ndimage as nd
S=4
src=Image.open('../../../web-prototypes/p3-stained-glass-v2-2026-10-23/assets/lineart-web.png').convert('L')
X0,Y0,X1,Y1=350,372,575,940   # 中窗（含尖瓣窗头、题签、柱）
c=src.crop((X0,Y0,X1,Y1)).resize(((X1-X0)*S,(Y1-Y0)*S),Image.LANCZOS)
a=np.asarray(c).astype(float); ink=a<150
lab,n=nd.label(~nd.binary_dilation(ink,iterations=2))
H,W=a.shape
def at(x,y): return lab[int(y*S),int(x*S)]
body=at(112,300); cart=at(112,515)   # 窗身玻璃 / 题签框内
glass=(lab==body); cartm=(lab==cart)
np.save('work/glass.npy',glass); np.save('work/cart.npy',cartm); np.save('work/ink.npy',ink)
print(W,H,glass.sum(),cartm.sum())
ys,xs=np.nonzero(glass); print('glass bbox',xs.min(),xs.max(),ys.min(),ys.max())
ys,xs=np.nonzero(cartm); print('cart bbox',xs.min(),xs.max(),ys.min(),ys.max())
