"""Package protected P1–P3 as a separate local entry, preserving artwork/motion."""
from pathlib import Path
import shutil,re,hashlib,json
ROOT=Path(__file__).resolve().parents[1];PROTOTYPES=ROOT.parent;OUT=ROOT/'public'
projects=['p1-p3-continuous-2026-10-31','p1-p2-reveal-star-v4-2026-10-21','p3-stained-glass-v3-2026-10-23']
allowed={'.html','.css','.js','.mjs','.png','.jpg','.jpeg','.svg','.webp','.gif','.ttf','.woff','.woff2'}
manifest=[]
for project in projects:
 source=PROTOTYPES/project;target=OUT/('entrance' if project==projects[0] else project)
 for path in source.rglob('*'):
  if not path.is_file() or path.suffix.lower() not in allowed or any(p in ('tests','scripts','checks') for p in path.relative_to(source).parts):continue
  # Raw old data contains attachment tokens. Runtime receives only sanitized API fields.
  if path.name=='topics.js':continue
  dest=target/path.relative_to(source);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,dest)
  manifest.append({'source':str(path.relative_to(PROTOTYPES)),'output':str(dest.relative_to(OUT)),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
index=OUT/'entrance/index.html';s=index.read_text().replace('assets/topics.js?v=20261101-p1','/api/p3-topics.js')
s=s.replace('</head>','<link rel="stylesheet" href="/entrance-link.css"><script defer src="/entrance-link.js"></script></head>');index.write_text(s)
(ROOT/'checks/entrance-provenance.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));print('Packaged',len(manifest),'files')
