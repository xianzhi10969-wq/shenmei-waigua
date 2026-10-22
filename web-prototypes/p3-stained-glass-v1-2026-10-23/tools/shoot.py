"""自测截图：python3 tools/shoot.py（需先在本目录 python3 -m http.server 8765）"""
import asyncio, sys
from playwright.async_api import async_playwright
URL="http://localhost:8765/index.html"
async def run():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        for name,vp,mob in (("desktop",(1440,900),False),("mobile",(390,844),True)):
            ctx=await b.new_context(viewport={"width":vp[0],"height":vp[1]},device_scale_factor=1 if not mob else 2,is_mobile=mob,has_touch=mob)
            pg=await ctx.new_page(); await pg.goto(URL); await pg.wait_for_timeout(3200)
            T=await pg.evaluate("document.querySelector('#p3').offsetTop")
            S1=T-vp[1]
            shots=[("a-v4end",S1),("b-p2to-p3-half",(S1+T)//2)]
            for q in (0,.2,.45,.7,1): shots.append((f"q{int(q*100):03d}",None,q))
            for s in shots:
                if s[1] is not None: await pg.evaluate(f"scrollTo(0,{s[1]})")
                else: await pg.evaluate(f"__q({s[2]})")
                await pg.wait_for_timeout(250)
                await pg.screenshot(path=f"checks/{name}-{s[0]}.png")
            if not mob:
                await pg.evaluate("__q(1)"); await pg.wait_for_timeout(200)
                box=await pg.evaluate("(()=>{const r=document.querySelectorAll('.win.web .hit')[2].getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()")
                await pg.mouse.move(*box); await pg.wait_for_timeout(200); await pg.screenshot(path="checks/desktop-hover-center.png")
            else:
                await pg.evaluate("__q(1)"); await pg.click("#next"); await pg.wait_for_timeout(200); await pg.screenshot(path="checks/mobile-next.png")
            await ctx.close()
        await b.close()
asyncio.run(run())
