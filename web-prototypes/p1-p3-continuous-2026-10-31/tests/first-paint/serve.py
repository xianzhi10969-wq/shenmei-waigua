from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit,unquote
import json,time
QA=Path(__file__).resolve().parent
ROOT=QA.parents[3]/'deploy/netlify-p1p3-continuous-2026-10-31'
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  path=unquote(urlsplit(self.path).path)
  parts=path.lstrip('/').split('/',1)
  mode=parts[0];relative=parts[1] if len(parts)>1 else ''
  if mode in ('before','after','slow-before','slow-after'):
   relative=relative or 'index.html'
   f=ROOT/relative
   if mode.endswith('before') and (QA/'before'/relative).is_file():f=QA/'before'/relative
   if mode.startswith('slow-') and relative=='transition.mjs':time.sleep(5)
  else:f=QA/(path.lstrip('/') or 'harness.html')
  if not f.is_file():self.send_error(404);return
  data=f.read_bytes();self.send_response(200);self.send_header('Content-Type',self.guess_type(str(f)));self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store');self.end_headers()
  try:self.wfile.write(data)
  except (BrokenPipeError,ConnectionResetError):pass
 def do_POST(self):
  body=self.rfile.read(int(self.headers.get('Content-Length',0)))
  try:
   data=json.loads(body);(QA/'results.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
  except Exception:pass
  self.send_response(200);self.end_headers();self.wfile.write(b'ok')
 def log_message(self,fmt,*args):
  if args and ('404' in str(args) or 'POST' in str(args)):super().log_message(fmt,*args)
ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
