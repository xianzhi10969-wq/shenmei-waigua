#!/usr/bin/env python3
import asyncio, json, http.server, socketserver, threading, os, time
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image

ROOT=Path('/workspace/shenmei-waigua/web-prototypes')
PLAN=json.load(open(ROOT/'_collage-batch-2026-11-05/selection-plan.json'))
PORT=8791

class Quiet(http.server.SimpleHTTPRequestHandler):
  def log_message(self,*a): pass

def start_server():
  os.chdir(ROOT)
  socketserver.TCPServer.allow_reuse_address=True
  httpd=socketserver.TCPServer(('127.0.0.1',PORT), Quiet)
  t=threading.Thread(target=httpd.serve_forever, daemon=True); t.start()
  return httpd

async def shot_one(browser, p):
  d=ROOT/p['dir']
  if not (d/'index.html').exists():
    return {'term':p['term'],'status':'no_html'}
  prev=d/'previews'; prev.mkdir(exist_ok=True)
  url=f'http://127.0.0.1:{PORT}/{p["dir"]}/index.html'
  try:
    ctx=await browser.new_context(viewport={'width':1400,'height':1200}, device_scale_factor=1)
    page=await ctx.new_page()
    await page.goto(url, wait_until='networkidle', timeout=90000)
    await page.wait_for_timeout(600)
    await page.locator('.board').screenshot(path=str(prev/'desktop-board.png'))
    await page.screenshot(path=str(prev/'desktop-full.png'), full_page=True)
    await ctx.close()

    ctx=await browser.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page=await ctx.new_page()
    await page.goto(url, wait_until='networkidle', timeout=90000)
    await page.wait_for_timeout(600)
    await page.locator('.board').screenshot(path=str(prev/'mobile-board.png'))
    await page.screenshot(path=str(prev/'mobile-full.png'), full_page=True)
    await ctx.close()

    for name in ('desktop-board','mobile-board'):
      png=prev/f'{name}.png'
      if png.exists():
        Image.open(png).convert('RGB').save(prev/f'{name}-chat.jpg', 'JPEG', quality=88, optimize=True)
    return {'term':p['term'],'status':'shot','dir':p['dir']}
  except Exception as e:
    return {'term':p['term'],'status':'error','error':str(e)}

async def main():
  httpd=start_server()
  time.sleep(0.3)
  results=[]
  async with async_playwright() as pw:
    browser=await pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--disable-gpu'])
    for p in PLAN['plans']:
      r=await shot_one(browser, p)
      print(r, flush=True)
      results.append(r)
    await browser.close()
  httpd.shutdown()
  json.dump(results, open(ROOT/'_collage-batch-2026-11-05/shoot-results.json','w'), ensure_ascii=False, indent=2)
  print('SHOT', sum(1 for r in results if r.get('status')=='shot'), '/', len(results), flush=True)

asyncio.run(main())
