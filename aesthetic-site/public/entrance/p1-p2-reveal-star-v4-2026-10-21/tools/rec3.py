import asyncio,os,shutil
from playwright.async_api import async_playwright
D='/tmp/f3'; shutil.rmtree(D,ignore_errors=True); os.makedirs(D)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1440,'height':900})
    await pg.goto('http://localhost:8765/index.html'); await pg.wait_for_load_state('networkidle')
    await pg.evaluate("document.getAnimations().forEach(a=>a.pause())")
    i=0
    async def shot():
      nonlocal i; await pg.screenshot(path=f'{D}/{i:05d}.png'); i+=1
    for k in range(0,int(3.2*60)):
      t=k*1000/60; await pg.evaluate(f"document.getAnimations().forEach(a=>a.currentTime={t})"); await shot()
    await pg.evaluate("document.getAnimations().forEach(a=>a.finish()); window.__forceReady()")
    for k in range(30): await shot()          # hold 0.5s
    N=int(4.5*60)
    for k in range(N+1):
      f=k/N; e=f*f*(3-2*f)
      await pg.evaluate(f"window.scrollTo(0,{811*e}); __forceReady()"); await shot()
    for k in range(45): await shot()
    await b.close()
asyncio.run(main())
