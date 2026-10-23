"""New upper cells only. Existing art, geometry and image files remain byte-identical."""
import hashlib,json,pathlib
import numpy as np
from PIL import Image,ImageChops,ImageFilter
ROOT=pathlib.Path(__file__).resolve().parents[1]
cells=json.loads((ROOT/'checks/cells.json').read_text());runs=np.load(ROOT/'checks/cell-runs.npz')['runs']
selection={'web-0':[47],'web-1':[76],'web-2':[77,78],'web-3':[75],'web-4':[48],'mobile-0':[132],'mobile-1':[145,146],'mobile-2':[133]}
protected=Image.new('L',(1448,1086),0)
for suffix in ['opening','title']:
 for file in (ROOT/'dist/assets/masks').glob('*-'+suffix+'.png'):protected=ImageChops.lighter(protected,Image.open(file).getchannel('A'))
meta=[];all_mask=Image.new('L',(1448,1086),0)
for pane,numbers in selection.items():
 ids={c['id'] for c in cells if c['number'] in numbers};arr=np.zeros((1086,1448),dtype='uint8')
 for y,a,b,label in runs:
  if int(label) in ids:arr[y,a:b]=255
 outer=ImageChops.subtract(Image.fromarray(arr),protected);inner=outer.filter(ImageFilter.MinFilter(5))
 for label,mask in [('opening',outer),('art',inner)]:
  rgba=Image.new('RGBA',outer.size,'white');rgba.putalpha(mask);rgba.save(ROOT/f'dist/assets/masks/extension-{pane}-{label}.png')
 all_mask=ImageChops.lighter(all_mask,outer)
 meta.append({'pane':pane,'cells':numbers,'box':list(outer.getbbox()),'pixels':int(np.count_nonzero(np.asarray(outer)))})
(ROOT/'dist/assets/extension-cells.json').write_text(json.dumps(meta,indent=2))
(ROOT/'dist/assets/extension-cells.js').write_text('window.EXTENSION_CELLS='+json.dumps(meta)+';\n')
old=ROOT.parent/'p3-pen-layered-v1-2026-10-23/dist'
locked=['app.js','styles.css','assets/locked-pen-base.png','assets/topics.js','assets/topics.json']
locked+=[str(p.relative_to(old)) for p in (old/'assets/masks').glob('*')]
locked+=[str(p.relative_to(old)) for p in (old/'assets/covers').glob('*')]
report={'paneGroups':len(meta),'smallCells':sum(len(v) for v in selection.values()),'existingFilesChecked':len(locked),'existingFilesByteIdentical':all((old/p).read_bytes()==(ROOT/'dist'/p).read_bytes() for p in locked),'existingOpeningAndTitleOverlapPixels':int(np.count_nonzero(np.asarray(ImageChops.multiply(all_mask,protected)))),'artInsetPx':2,'sourceSHA256':hashlib.sha256((old/'assets/locked-pen-base.png').read_bytes()).hexdigest(),'status':'新增层试验待审'}
(ROOT/'checks/layer-integrity.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False))
