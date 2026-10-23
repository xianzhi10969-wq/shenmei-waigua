import hashlib,json,pathlib
import numpy as np
from PIL import Image,ImageChops
ROOT=pathlib.Path(__file__).resolve().parents[1]
cells=json.loads((ROOT/'checks/cells.json').read_text())
chosen=[47,48,56,57,66,67,73,74,75,76,132,133,145,146,147,148]
ids={c['id'] for c in cells if c['number'] in chosen}
runs=np.load(ROOT/'checks/cell-runs.npz')['runs']
mask=np.zeros((1086,1448),dtype='uint8')
for y,a,b,label in runs:
 if int(label) in ids:mask[y,a:b]=255
mask=Image.fromarray(mask)
protected=Image.new('L',mask.size,0)
for file in (ROOT/'dist/assets/masks').glob('*-opening.png'):
 protected=ImageChops.lighter(protected,Image.open(file).getchannel('A'))
for file in (ROOT/'dist/assets/masks').glob('*-title.png'):
 protected=ImageChops.lighter(protected,Image.open(file).getchannel('A'))
mask=ImageChops.subtract(mask,protected)
layer=Image.new('RGBA',mask.size,(19,18,24,0));layer.putalpha(mask)
layer.save(ROOT/'dist/assets/small-night-glass-layer.png')
source=Image.open(ROOT/'dist/assets/locked-pen-base.png').convert('RGBA')
Image.alpha_composite(source,layer).save(ROOT/'checks/glass-on-base.png')
old=ROOT.parent/'p3-pen-layered-v1-2026-10-23/dist'
locked=['app.js','styles.css','assets/locked-pen-base.png','assets/topics.js','assets/topics.json']
locked+=[str(p.relative_to(old)) for p in (old/'assets/masks').glob('*')]
locked+=[str(p.relative_to(old)) for p in (old/'assets/covers').glob('*')]
same=all((old/p).read_bytes()==(ROOT/'dist'/p).read_bytes() for p in locked)
report={'selectedCells':chosen,'cellCount':len(chosen),'addedPixels':int(np.count_nonzero(np.asarray(mask))),'protectedOpeningAndTitleOverlapPixels':int(np.count_nonzero(np.asarray(ImageChops.multiply(mask,protected)))),'existingFilesVerified':len(locked),'existingFilesByteIdentical':same,'sourceSHA256':hashlib.sha256((old/'assets/locked-pen-base.png').read_bytes()).hexdigest(),'status':'独立试验，待审，未发布'}
(ROOT/'checks/layer-integrity.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False))
