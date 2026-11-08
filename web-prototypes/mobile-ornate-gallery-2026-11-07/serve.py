from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
import runpy
HERE=Path(__file__).resolve().parent
runpy.run_path(str(HERE/'build.py'))
class Handler(SimpleHTTPRequestHandler):
 def translate_path(self,path):
  result=Path(super().translate_path(path))
  if result.exists():return str(result)
  relative=result.relative_to(HERE/'public')
  return str(HERE.parents[1]/'aesthetic-site/public'/relative)
if __name__=='__main__':
 print('http://127.0.0.1:8853/#/chapter/reczz28HJJL2A7E0',flush=True)
 ThreadingHTTPServer(('127.0.0.1',8853),partial(Handler,directory=str(HERE/'public'))).serve_forever()
