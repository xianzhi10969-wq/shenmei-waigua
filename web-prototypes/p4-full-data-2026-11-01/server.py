#!/usr/bin/env python3
"""Local/VM production-shaped read-only API; static files are confined to public/."""
import argparse, hashlib, json, mimetypes, os, threading, time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote
from scripts.sync_data import ROOT, PRIVATE, PUBLIC, sync

class Catalog:
 def __init__(self):
  self.lock=threading.Lock();self.data=None;self.last_check=None;self.failed=False
  self.reload()
 def reload(self):
  path=PRIVATE/'catalog.json'
  if path.exists():
   value=json.loads(path.read_text())
   with self.lock:self.data=value
 def refresh(self):
  try:
   value=sync()
   with self.lock:self.data=value;self.failed=False;self.last_check=time.time()
  except Exception as exc:
   self.failed=True;print('Sync failed; last complete catalog retained: '+str(exc),flush=True)
 def background(self,interval):
  while True:
   self.refresh();time.sleep(interval)
STORE=Catalog()
def path_is_entrance(path):return path.startswith('/entrance/') or path.startswith('/p1-p2-reveal-star-v4-2026-10-21/')
class Handler(BaseHTTPRequestHandler):
 def do_HEAD(self):self.respond(head=True)
 def do_GET(self):self.respond()
 def log_message(self,*args):pass
 def send_json(self,obj,status=200,head=False):
  body=json.dumps(obj,ensure_ascii=False,separators=(',',':')).encode();self.send_bytes(body,'application/json; charset=utf-8',status,head)
 def send_bytes(self,body,mime,status=200,head=False):
  etag='"'+hashlib.sha256(body).hexdigest()[:20]+'"'
  if status==200 and self.headers.get('If-None-Match')==etag:
   self.send_response(304);self.send_header('ETag',etag);self.end_headers();return
  self.send_response(status);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(body)))
  self.send_header('ETag',etag);self.send_header('Cache-Control','no-cache' if 'json' in mime or 'html' in mime or self.path.startswith('/api/') else 'public, max-age=3600')
  self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','strict-origin-when-cross-origin')
  inline_scripts=" 'unsafe-inline'" if path_is_entrance(self.path) else ""
  self.send_header('Content-Security-Policy',f"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'{inline_scripts}; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'")
  self.end_headers()
  if not head:self.wfile.write(body)
 def respond(self,head=False):
  path=unquote(urlsplit(self.path).path)
  if path.startswith('/api/'):
   with STORE.lock:data=STORE.data
   if path=='/api/health':return self.send_json({'ready':data is not None,'stale':STORE.failed,'generatedAt':data and data['generatedAt'],'lastCheckedAt':STORE.last_check},200 if data else 503,head)
   if data is None:return self.send_json({'error':'内容暂时无法加载，请稍后重试。'},503,head)
   if path=='/api/p3-topics.js':
    payload={'source':{'count':len(data['chapters']),'readOnly':True,'complete':True},'topics':[{'id':c['id'],'name':c['name'],'english':c['english'],'order':c['order'],'definition':c['definition'],'credit':c['coverCaption'],'cover':c['cover']} for c in data['chapters']]}
    return self.send_bytes(('window.FEISHU_TOPICS = '+json.dumps(payload,ensure_ascii=False)+';').encode(),'application/javascript; charset=utf-8',head=head)
   if path=='/api/catalog':return self.send_json({k:data[k] for k in ('generatedAt','chapters','terms')},head=head)
   parts=path.strip('/').split('/')
   if len(parts)==3 and parts[1] in ('chapters','terms','cases'):
    item=next((x for x in data[parts[1]] if x['id']==parts[2]),None)
    if item:
     out=dict(item)
     if parts[1]=='terms':out['cases']=[c for c in data['cases'] if c['id'] in item['caseIds']]
     return self.send_json(out,head=head)
   return self.send_json({'error':'没有找到这条内容。'},404,head)
  if path.endswith('/'):path+='index.html'
  target=(PUBLIC/path.lstrip('/')).resolve()
  if PUBLIC.resolve() not in target.parents or not target.is_file():return self.send_json({'error':'Not found'},404,head)
  if target.suffix not in {'.html','.js','.mjs','.css','.json','.png','.jpg','.jpeg','.gif','.webp','.svg','.woff','.woff2','.ttf','.avif'}:return self.send_json({'error':'Not found'},404,head)
  try:self.send_bytes(target.read_bytes(),mimetypes.guess_type(target.name)[0] or 'application/octet-stream',head=head)
  except (BrokenPipeError,ConnectionResetError):pass

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8768);parser.add_argument('--host',default='127.0.0.1');parser.add_argument('--sync-interval',type=int,default=300);parser.add_argument('--offline',action='store_true');args=parser.parse_args()
 if not args.offline:threading.Thread(target=STORE.background,args=(max(60,args.sync_interval),),daemon=True).start()
 print('Preview: http://'+args.host+':'+str(args.port),flush=True)
 ThreadingHTTPServer((args.host,args.port),Handler).serve_forever()
if __name__=='__main__':main()
