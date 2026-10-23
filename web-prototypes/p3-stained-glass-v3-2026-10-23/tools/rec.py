"""逐帧滚动录制预览（Playwright + ffmpeg）：python3 tools/rec.py；输出 preview_desktop.mp4 / preview_mobile.mp4"""
import asyncio, os, shutil, subprocess
from playwright.async_api import async_playwright
async def one(b,name,vp,mob,N):
    d=f"/tmp/rec_{name}"; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
    ctx=await b.new_context(viewport={"width":vp[0],"height":vp[1]},device_scale_factor=1,is_mobile=mob,has_touch=mob)
    pg=await ctx.new_page(); await pg.goto("http://localhost:8765/index.html"); await pg.wait_for_timeout(3200)
    T=await pg.evaluate("document.querySelector('#p3').offsetTop"); E=await pg.evaluate("document.documentElement.scrollHeight-innerHeight")
    a=max(0,T-vp[1]-500); b_=min(E,T+await pg.evaluate("document.querySelector('#p3').offsetHeight-innerHeight"))
    k=0
    for i in range(N):
        t=i/(N-1); t=t*t*(3-2*t)
        await pg.evaluate(f"scrollTo(0,{a+(b_-a)*t:.1f})"); await pg.wait_for_timeout(30)
        await pg.screenshot(path=f"{d}/{k:04d}.png"); k+=1
    for _ in range(30): shutil.copy(f"{d}/{k-1:04d}.png",f"{d}/{k:04d}.png"); k+=1
    if not mob:
        box=await pg.evaluate("(()=>{const r=document.querySelectorAll('.win.web .hit')[1].getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()")
        await pg.mouse.move(*box); await pg.wait_for_timeout(100)
    else:
        await pg.click("#next"); await pg.wait_for_timeout(100)
    for _ in range(30): await pg.screenshot(path=f"{d}/{k:04d}.png"); k+=1
    await ctx.close()
    subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate","30","-i",f"{d}/%04d.png","-vf","scale=trunc(iw/2)*2:trunc(ih/2)*2","-pix_fmt","yuv420p",f"preview_{name}.mp4"],check=True)
async def run():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        await one(b,"desktop",(1440,900),False,240); await one(b,"mobile",(390,844),True,200)
        await b.close()
asyncio.run(run())
