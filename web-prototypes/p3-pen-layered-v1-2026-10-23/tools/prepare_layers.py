"""Extract fixed opening masks from the locked raster. Does not modify its pixels."""
import hashlib, json, pathlib, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT.parents[1]/'视觉研究/P3彩窗/2026-10-23-钢笔完成稿-v1/哥特彩窗-Web-Mobile-钢笔完成稿-v1.png'
assets = ROOT/'dist/assets'
if not SOURCE.exists():
    SOURCE = assets/'locked-pen-base.png'
if SOURCE.resolve() != (assets/'locked-pen-base.png').resolve():
    shutil.copyfile(SOURCE, assets/'locked-pen-base.png')
shutil.copyfile(ROOT.parent/'p3-stained-glass-v3-2026-10-23/assets/cabinet-song.ttf', assets/'song.ttf')
original = Image.open(SOURCE).convert('RGB')
gray = np.asarray(original.convert('L'))
ink = Image.fromarray(np.where(gray < 150, 255, 0).astype('uint8')).filter(ImageFilter.MaxFilter(3))
seeds = [('web-0', (175,600)), ('web-1',(320,600)), ('web-2',(510,600)), ('web-3',(700,600)), ('web-4',(840,600)), ('mobile-0',(1060,600)), ('mobile-1',(1195,600)), ('mobile-2',(1330,600))]
slots=[]
debug=original.copy()
for name,seed in seeds:
    flood=ink.copy()
    ImageDraw.floodfill(flood, seed, 128, thresh=0)
    selected=Image.fromarray(np.where(np.asarray(flood)==128,255,0).astype('uint8'))
    # Fill label-shaped islands, retaining the exact closed architectural boundary.
    outside=Image.eval(selected, lambda x:255-x)
    ImageDraw.floodfill(outside,(0,0),128,thresh=0)
    selected=Image.fromarray(np.where(np.asarray(outside)==128,0,255).astype('uint8'))
    box=selected.getbbox()
    if not box or box[2]-box[0]>230 or box[3]-box[1]<250 or box[1]<300:
        raise RuntimeError(f'Opening extraction leaked or split: {name} {box}')
    # The outer mask is inside the ink by one pixel; artwork is eroded a further 6px.
    inner=selected.filter(ImageFilter.MinFilter(13))
    for suffix,mask in [('opening',selected),('art',inner)]:
        rgba=Image.new('RGBA',original.size,'white'); rgba.putalpha(mask)
        rgba.save(assets/'masks'/f'{name}-{suffix}.png')
    tint=Image.new('RGB',original.size,(25,25,31))
    debug.paste(tint,(0,0),selected)
    slots.append({'id':name,'seed':seed,'box':list(box),'artBox':list(inner.getbbox()),'insetPx':6})
for name,seed in [('web-0',(176,918)),('web-1',(320,918)),('web-2',(510,918)),('web-3',(700,918)),('web-4',(840,918)),('mobile-0',(1058,918)),('mobile-1',(1198,918)),('mobile-2',(1334,918))]:
    flood=ink.copy();ImageDraw.floodfill(flood,seed,128,thresh=0)
    title=Image.fromarray(np.where(np.asarray(flood)==128,255,0).astype('uint8'))
    outside=Image.eval(title,lambda x:255-x);ImageDraw.floodfill(outside,(0,0),128,thresh=0)
    title=Image.fromarray(np.where(np.asarray(outside)==128,0,255).astype('uint8'))
    box=title.getbbox()
    if not box or box[2]-box[0]>200 or box[3]-box[1]>120:
        raise RuntimeError(f'Title extraction leaked: {name} {box}')
    rgba=Image.new('RGBA',original.size,'white');rgba.putalpha(title);rgba.save(assets/'masks'/f'{name}-title.png')
original.crop((12,20,212,120)).save(assets/'paper-patch.png')
debug.save(ROOT/'checks/mask-extraction.png')
meta={'sourceSHA256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'copiedSHA256':hashlib.sha256((assets/'locked-pen-base.png').read_bytes()).hexdigest(), 'sourceSize':list(original.size), 'boundarySafetyPx':1, 'artErosionPx':6, 'slots':slots}
(assets/'layers.json').write_text(json.dumps(meta,indent=2))
print(json.dumps(meta,indent=2))
