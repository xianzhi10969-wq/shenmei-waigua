"""Build an isolated, neutral gallery structure proof from the existing read-only snapshot."""
from pathlib import Path
import json, hashlib, shutil
from PIL import Image, ImageStat
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
BASE=ROOT/'aesthetic-site/public'
OUT=HERE/'public'
OUT.mkdir(exist_ok=True)
shutil.copytree(HERE/'art',OUT/'frame-art',dirs_exist_ok=True)
snapshot=HERE/'catalog-snapshot.json'
if not snapshot.exists():shutil.copy2(ROOT/'aesthetic-site/src/catalog.json',snapshot)
d=json.loads(snapshot.read_text())
def sha(src): return hashlib.sha256((BASE/src.lstrip('/')).read_bytes()).hexdigest()
credits={}
for c in d['cases']:
 for src in c['images']:
  if c.get('caption') and (BASE/src.lstrip('/')).exists():
   credits[sha(src)]={'text':c['caption'],'record':c['id'],'verification':'identical file SHA256; existing case caption'}
for c in d['chapters']:
 if c.get('cover') and c.get('coverCaption'):
  credits[sha(c['cover'])]={'text':c['coverCaption'],'record':c['id'],'verification':'identical file SHA256; existing chapter cover caption'}
# Same named attachment and byte size in the archived Feishu source; no invented attribution.
archive=ROOT/'output/feishu-field-cleanup-2026-11-07'
if archive.exists():
 oldterms=[json.loads(l) for l in (archive/'terms-before.ndjson').read_text().splitlines()]
 oldcases=[json.loads(l) for l in (archive/'cases-before.ndjson').read_text().splitlines()]
 t=next(t for t in oldterms if t.get('词')=='Cottagecore'); c=next(c for c in oldcases if c.get('作品名')=='王后的小村庄')
 a,b=t['封面图'][0],c['图'][0]
 src=next(t['cover'] for t in d['terms'] if t['name']=='Cottagecore')
 assert a['name']==b['name'] and a['size']==b['size']==(BASE/src.lstrip('/')).stat().st_size
 credits[sha(src)]={'text':c['图注'],'record':c['record_id'],'verification':'archived source attachment filename + byte size; cover link preserved','sourceAttachment':a['name'],'sourceSize':a['size']}
else:
 saved=HERE/'credits.json'
 if saved.exists():credits.update(json.loads(saved.read_text()))
(HERE/'credits.json').write_text(json.dumps(credits,ensure_ascii=False,indent=2))
terms=[]
for t in d['terms']:
 item={k:t[k] for k in ['id','name','english','state','cover','position','caseIds']}
 if t['cover']:
  im=Image.open(BASE/t['cover'].lstrip('/'));item['width'],item['height']=im.size
  thumb=im.convert('L');thumb.thumbnail((64,64));luma=ImageStat.Stat(thumb).mean[0]
  item['tone']='white' if luma<110 else 'black' if luma>170 else 'gray'
  item['credit']=credits.get(sha(t['cover']))
 else:item.update(width=0,height=0,tone='white',credit=None)
 # Deliberate candidate sequence in the reference chapter; all choices remain overrideable.
 if t['name'] in ['治愈','Cottagecore','盛夏']:item['tone']={'治愈':'white','Cottagecore':'gray','盛夏':'black'}[t['name']]
 terms.append(item)
data={'chapters':[{k:c[k] for k in ['id','name','english','order','definition','termIds']} for c in d['chapters']],'terms':terms,'sourceRevisions':d['revisions']}
(OUT/'gallery.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
# Shared original assets remain untouched. Symlinks are local preview conveniences only.
for name in ['media','assets','terms','api','entrance','cases','features','term-assets','site.css','site-navigation.mjs','route-key.js']:
 src=BASE/name;dst=OUT/name
 if src.exists() and not dst.exists():dst.symlink_to(src,target_is_directory=src.is_dir())
for name in ['index.html','gallery.css','gallery.js','mobile-structure.svg','desktop-structure.svg','frame-construction.svg','ornate.js','ornate.css']:
 if (HERE/name).exists():shutil.copy2(HERE/name,OUT/name)
print(json.dumps({'chapters':len(data['chapters']),'terms':len(terms),'withCover':sum(bool(t['cover']) for t in terms),'verifiedCredits':sum(bool(t['credit']) for t in terms)},ensure_ascii=False))
