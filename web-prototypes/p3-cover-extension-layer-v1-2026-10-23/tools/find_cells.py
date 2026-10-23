"""Inventory closed paper cells; no source pixels or contours are edited."""
import pathlib,json
import numpy as np
from PIL import Image,ImageFilter,ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1]
im=Image.open(ROOT/'dist/assets/locked-pen-base.png').convert('RGB')
ink=Image.fromarray(np.where(np.asarray(im.convert('L'))<150,255,0).astype('uint8')).filter(ImageFilter.MaxFilter(3))
white=np.asarray(ink)==0
parents=[];runs=[];previous=[]
def root(i):
 while parents[i]!=i:
  parents[i]=parents[parents[i]];i=parents[i]
 return i
for y,row in enumerate(white):
 edges=np.diff(np.pad(row.astype('int8'),(1,1)));starts=np.where(edges==1)[0];ends=np.where(edges==-1)[0]
 current=[];p=0
 for a,b in zip(starts,ends):
  label=len(parents);parents.append(label)
  while p<len(previous) and previous[p][1]<=a:p+=1
  j=p
  while j<len(previous) and previous[j][0]<b:
   parents[root(label)]=root(previous[j][2]);j+=1
  current.append((int(a),int(b),label));runs.append((y,int(a),int(b),label))
 previous=current
cells={}
for y,a,b,l in runs:
 r=root(l)
 if r not in cells:cells[r]={'id':r,'area':0,'box':[a,y,b,y+1],'seed':[a,y]}
 c=cells[r];c['area']+=b-a;x0,y0,x1,y1=c['box'];c['box']=[min(a,x0),min(y,y0),max(b,x1),max(y+1,y1)]
selected=[]
for c in cells.values():
 x0,y0,x1,y1=c['box']
 if c['area']<70 or y0<80 or y1>510:continue
 if not ((90<x0 and x1<930) or (1015<x0 and x1<1380)):continue
 selected.append(c)
selected.sort(key=lambda c:(c['box'][0]>990,c['box'][1],c['box'][0]))
debug=im.copy();d=ImageDraw.Draw(debug)
for i,c in enumerate(selected):
 c['number']=i+1;x0,y0,x1,y1=c['box'];d.rectangle(c['box'],outline='red');d.text(((x0+x1)//2,(y0+y1)//2),str(i+1),fill='red')
debug.crop((40,60,1400,530)).resize((2040,705)).save(ROOT/'checks/cell-inventory.png')
(ROOT/'checks/cells.json').write_text(json.dumps(selected,indent=2))
np.savez_compressed(ROOT/'checks/cell-runs.npz',runs=np.array([(y,a,b,root(l)) for y,a,b,l in runs],dtype='int32'))
print(json.dumps(selected,indent=2))
