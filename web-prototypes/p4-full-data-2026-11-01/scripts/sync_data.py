#!/usr/bin/env python3
"""Read-only Feishu sync. All calls explicitly use aesthetic-feishu; no browser credentials."""
import concurrent.futures as futures
import hashlib, json, os, shutil, subprocess, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PRIVATE=ROOT/'private'; PUBLIC=ROOT/'public'
BASE='IGctbcuwPaE6hMsmAoicJddpn3U'
TABLES={'chapters':'tblaYsGqDwNudnXs','terms':'tbl2gR8WBoqCQyGz','cases':'tblpdRYutnm12T0y','sections':'tblBWYZ4lQ0I0tJ2'}
FIELDS={
'chapters':'章节名 英文名 章名展示 序号 一句定义 钩子 本章分法 定义者 定义者的故事 封面图 封面图注 状态 词条'.split(),
 'terms':'词 英文 所属章节 章内序号 在本章的位置 状态 钩子 核心 封面图 做法1 做法2 做法3 做俗了 案例 接着看 配色 检索词'.split()+['Pinterest 搜索词'],
 'cases':'作品名 作品原文名 所属词条 顺序 是否保留 作者 年份 媒介 收藏地或出品方 出处行 图 图注 一句为什么 为什么好 画面 细节 手法 反转 缺席 补充讲解 官方页'.split(),
 'sections':'所属章节 序号 小标题 段落 图 图注'.split()}
def save(path,data):
 path.parent.mkdir(parents=True,exist_ok=True); temp=path.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')));temp.replace(path)
def cli(args):
 executable=os.environ.get('LARK_CLI') or shutil.which('lark-cli')
 if not executable: raise RuntimeError('Set LARK_CLI to the installed executable')
 proc=subprocess.run([executable,'--profile','aesthetic-feishu','base',*args,'--as','user'],capture_output=True,text=True,timeout=120,cwd=ROOT)
 if proc.returncode: raise RuntimeError('Feishu read failed: '+(proc.stderr or proc.stdout)[:500])
 data=json.loads(proc.stdout)
 if data.get('ok') is False: raise RuntimeError('Feishu API error')
 return data

def export_table(pair):
 name,table=pair
 schema=cli(['+field-list','--base-token',BASE,'--table-id',table,'--format','json'])
 actual={f['name'] for f in schema['data']['fields']}
 if set(FIELDS[name])-actual: raise RuntimeError('Missing fields: '+str(set(FIELDS[name])-actual))
 path=PRIVATE/(name+'.ndjson')
 args=['+record-list','--base-token',BASE,'--table-id',table,'--format','ndjson','--output',str(path.relative_to(ROOT)),'--overwrite']
 for field in FIELDS[name]: args+=['--field-id',field]
 result=cli(args);save(PRIVATE/(name+'-schema.json'),schema)
 manifest=json.loads(path.with_suffix('.manifest.json').read_text())
 if manifest.get('has_more'): raise RuntimeError('Incomplete export: '+name)
 return name,[json.loads(line) for line in path.read_text().splitlines() if line.strip()]

def fetch_media(job):
 table,record,item=job; suffix=Path(item.get('name','')).suffix.lower()
 if suffix not in {'.png','.jpg','.jpeg','.webp','.gif','.avif'}: raise RuntimeError('Unsupported image: '+suffix)
 key=hashlib.sha256(item['file_token'].encode()).hexdigest()[:24]+suffix
 path=PUBLIC/'media'/key
 if not path.exists() or not path.stat().st_size:
  temp=path.with_name(path.name+'.download')
  cli(['+record-download-attachment','--base-token',BASE,'--table-id',table,'--record-id',record,'--file-token',item['file_token'],'--output',str(temp.relative_to(ROOT)),'--overwrite'])
  if not temp.exists() or not temp.stat().st_size: raise RuntimeError('Empty attachment')
  temp.replace(path)
 return item['file_token'],'/media/'+key

def build(raw,media,revisions):
 def s(r,k): return r.get(k) or ''
 def images(r,k): return [media[a['file_token']] for a in r.get(k,[]) or [] if a['file_token'] in media]
 def cover(r): return next(iter(images(r,'封面图')),'')
 chapters=[]
 for r in sorted(raw['chapters'],key=lambda r:r.get('序号') or 999):
  sections=[]
  for p in raw['sections']:
   if any(x['id']==r['record_id'] for x in p.get('所属章节',[]) or []):
    sections.append({'id':p['record_id'],'order':p.get('序号') or 0,'title':s(p,'小标题'),'text':s(p,'段落'),'images':images(p,'图'),'caption':s(p,'图注')})
  chapters.append({'id':r['record_id'],'name':s(r,'章节名'),'english':s(r,'英文名'),'order':r.get('序号') or 0,'definition':s(r,'一句定义'),'hook':s(r,'钩子'),'cover':cover(r),'coverCaption':s(r,'封面图注'),'definer':s(r,'定义者'),'definerStory':s(r,'定义者的故事'),'sections':sorted(sections,key=lambda x:x['order']),'termNames':[x.strip() for x in s(r,'词条').replace('，',',').split(',') if x.strip()]})
 terms=[]
 for r in raw['terms']:
  terms.append({'id':r['record_id'],'name':s(r,'词'),'english':s(r,'英文'),'chapterNames':r.get('所属章节') or [],'order':r.get('章内序号') or 0,'state':r.get('状态') or [],'position':s(r,'在本章的位置'),'hook':s(r,'钩子'),'core':s(r,'核心'),'cover':cover(r) if '已上线' in (r.get('状态') or []) else '', 'steps':[s(r,k) for k in ('做法1','做法2','做法3') if s(r,k)],'mistake':s(r,'做俗了'),'colors':s(r,'配色'),'searchTerms':s(r,'检索词'),'pinterest':s(r,'Pinterest 搜索词'),'nextNames':r.get('接着看') or []})
 cases=[]
 for r in raw['cases']:
  if not r.get('是否保留'): continue
  c={'id':r['record_id'],'order':r.get('顺序') or 0,'images':images(r,'图')}
  for dest,source in {'name':'作品名','originalName':'作品原文名','termName':'所属词条','author':'作者','year':'年份','medium':'媒介','collection':'收藏地或出品方','caption':'图注','why':'一句为什么','whyLong':'为什么好','scene':'画面','detail':'细节','method':'手法','twist':'反转','absence':'缺席','extra':'补充讲解','official':'官方页'}.items():c[dest]=s(r,source)
  cases.append(c)
 names={c['name'] for c in chapters};term_names={t['name'] for t in terms}
 unresolved=[(t['id'],n) for t in terms for n in t['chapterNames'] if n not in names]
 if unresolved:raise RuntimeError('Unknown chapters: '+str(unresolved))
 if len(term_names)!=len(terms):raise RuntimeError('Duplicate term names require explicit mapping')
 for c in chapters:
  rank={name:i for i,name in enumerate(c['termNames'])}
  c['termIds']=[t['id'] for t in sorted(terms,key=lambda t:(rank.get(t['name'],999),t['order'],t['id'])) if c['name'] in t['chapterNames']]
 for t in terms:
  t['caseIds']=[c['id'] for c in sorted(cases,key=lambda c:(c['order'],c['id'])) if c['termName']==t['name']]
 report={'rawCounts':{k:len(v) for k,v in raw.items()},'publicCases':len(cases),'publishedTerms':sum('已上线' in t['state'] for t in terms),'publishedMissingCover':[t['name'] for t in terms if '已上线' in t['state'] and not t['cover']],'chapters':[{'name':c['name'],'count':len(c['termIds'])} for c in chapters],'unmatchedCases':[c['id'] for c in cases if c['termName'] not in term_names]}
 return {'generatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'revisions':revisions,'chapters':chapters,'terms':terms,'cases':cases,'report':report}

def sync(force=False):
 PRIVATE.mkdir(parents=True,exist_ok=True);(PUBLIC/'media').mkdir(parents=True,exist_ok=True)
 info=cli(['+table-list','--base-token',BASE,'--format','json'])['data']['tables']
 revisions={k:next(t['rev'] for t in info if t['id']==v) for k,v in TABLES.items()}
 target=PRIVATE/'catalog.json'
 if target.exists() and not force:
  old=json.loads(target.read_text())
  if old['revisions']==revisions:return old
 with futures.ThreadPoolExecutor(max_workers=4) as pool:raw=dict(pool.map(export_table,TABLES.items()))
 for name,rows in raw.items():
  expected=next(t['records_count'] for t in info if t['id']==TABLES[name])
  if len(rows)!=expected:raise RuntimeError('Export count mismatch: '+name)
 jobs={}
 for name,rows in raw.items():
  for r in rows:
   if name=='cases' and not r.get('是否保留'):continue
   if name=='terms' and '已上线' not in (r.get('状态') or []):continue
   for item in r.get('封面图' if name in ('chapters','terms') else '图',[]) or []:jobs[item['file_token']]=(TABLES[name],r['record_id'],item)
 print('Exported all records; downloading '+str(len(jobs))+' unique images.',flush=True)
 with futures.ThreadPoolExecutor(max_workers=4) as pool:media=dict(pool.map(fetch_media,jobs.values()))
 after=cli(['+table-list','--base-token',BASE,'--format','json'])['data']['tables']
 final_revisions={k:next(t['rev'] for t in after if t['id']==v) for k,v in TABLES.items()}
 if final_revisions!=revisions:raise RuntimeError('Source changed during sync; keeping previous complete snapshot and retrying next cycle')
 data=build(raw,media,revisions);save(target,data);save(ROOT/'checks'/'data-audit.json',data['report'])
 print(json.dumps({'counts':data['report'],'media':len(media),'revisions':revisions},ensure_ascii=False),flush=True)
 return data
if __name__=='__main__':sync('--force' in __import__('sys').argv)
