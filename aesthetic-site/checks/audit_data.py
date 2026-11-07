from pathlib import Path
from html.parser import HTMLParser
import json,re,hashlib,urllib.request
root=Path(__file__).resolve().parents[1];pub=root/'public';data=json.loads((root/'src/catalog.json').read_text());checked=0;missing=[]
class References(HTMLParser):
 def handle_starttag(self,tag,attrs):
  for key,value in attrs:
   if key in ['src','href'] and value and value.startswith('/') and not value.startswith('//'):
    path=value.split('?')[0].split('#')[0]
    if path:
     file=pub/path.lstrip('/')
     if file.is_dir():file=file/'index.html'
     if not file.exists():missing.append([path,self.getpos()])
for term in data['terms']:
 path=pub/'terms'/term['id']/'index.html';text=path.read_text();References().feed(text)
 assert len(re.findall('class="case"',text))==len(term['caseIds']),term['name']
 for cid in term['caseIds']:
  case=next(c for c in data['cases'] if c['id']==cid)
  assert 'case-'+cid in text
  assert all(__import__('html').unescape(p) in __import__('html').unescape(re.sub('<[^>]+>','',text)) for p in case['whyLong'].replace('\\n','\n').split('\n\n') if p.strip()),case['name']
 checked+=1
for case in data['cases']:
 with urllib.request.urlopen('http://127.0.0.1:8840/api/cases/'+case['id']) as response:
  assert json.load(response)==case
for case in data['cases']:
 for src in case['images']:assert (pub/src.lstrip('/')).is_file()
assert not missing,missing[:10]
report={'terms':checked,'caseEndpoints':len(data['cases']),'localMedia':len(list((pub/'media').iterdir())),'brokenLocalTermReferences':missing,'fullCaseAnalysis':'verified for every linked case','sourceRevisions':data['revisions']}
(root/'checks/full-data.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False))
