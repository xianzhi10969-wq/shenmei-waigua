import numpy as np,scipy.ndimage as nd
from PIL import Image
A=np.asarray(Image.open('painting_full.png').convert('RGB')).astype(float)
bg=np.asarray(Image.open('layers/bg.png')).copy()
hole=bg[...,3]==0
g=A.mean(-1); paper=(g>225)&~hole
# nearest paper colour, then smooth
idx=nd.distance_transform_edt(~paper,return_distances=False,return_indices=True)
fill=A[idx[0],idx[1]]
fill=np.stack([nd.uniform_filter(fill[...,c],15) for c in range(3)],-1)
out=bg.astype(float); out[hole,:3]=fill[hole]; out[hole,3]=255
Image.fromarray(out.astype('uint8')).save('layers/bg_filled.png')
# text overlay from original frame screenshot
F=np.asarray(Image.open('p1_orig.png').convert('RGB')).astype(int)
comp=np.zeros_like(F); comp[64:]=A.astype(int); 
d=np.abs(F-comp).max(-1)>14; d[:64]=True
d=nd.binary_dilation(d,iterations=1); d[64:65]=True
T=np.zeros((900,1440,4),'uint8'); T[...,:3]=F; T[...,3]=d*255
Image.fromarray(T).save('reveal/assets/text.png')
print(Image.open('p1_orig.png').getpixel((5,5)), A[400,300])
