import asyncio
from playwright.async_api import async_playwright
URL="http://localhost:8765/index.html"
async def run():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        for name,vp,mob in (("desktop",(1440,900),False),("mobile",(390,844),True)):
            ctx=await b.new_context(viewport={"width":vp[0],"height":vp[1]},device_scale_factor=1 if not mob else 2,is_mobile=mob,has_touch=mob)
            pg=await ctx.new_page(); await pg.goto(URL); await pg.wait_for_timeout(3000)
            for q in (0,.35,.7,.92):
                await pg.evaluate(f"__q({q})"); await pg.wait_for_timeout(300)
                await pg.screenshot(path=f"checks/{name}-q{int(q*100):03d}.png")
            if mob:
                await pg.evaluate("__q(0.92)")
                for k in range(5):
                    await pg.evaluate(f"__setMob({k})"); await pg.wait_for_timeout(250)
                    await pg.screenshot(path=f"checks/mobile-topic-{k}.png")
            await ctx.close()
        await b.close()
asyncio.run(run())
print('shot ok')
