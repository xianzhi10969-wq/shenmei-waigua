import math,asyncio
from playwright.async_api import async_playwright
def P(x,y): return f'{x:.2f},{y:.2f}'
def rot(x,y,a): c,s=math.cos(a),math.sin(a); return x*c-y*s, x*s+y*c
def kite(ang,L,w,inner,tilt=0):
  # ray pointing at angle ang (0=up, clockwise), length L, half-width w at base distance inner
  a=math.radians(ang)+tilt
  tip=rot(0,-L,a); l=rot(-w,-inner,a); r=rot(w,-inner,a); b=(0,0)
  out=f'<path d="M{P(*b)} L{P(*l)} L{P(*tip)} L{P(*r)} Z" class="o"/>'
  crease=f'<path d="M{P(*rot(0,-inner*0.6,a))} L{P(*rot(0,-L*0.86,a))}" class="f"/>'
  return out+crease
def astroid(rx_up,rx_side,k=0.18):
  # concave 4-point star: tips at up/right/down/left, sides curve via control near centre
  t=[(0,-rx_up),(rx_side,0),(0,rx_up),(-rx_side,0)]
  d=f'M{P(*t[0])}'
  for i in range(4):
    a,b=t[i],t[(i+1)%4]; cx,cy=(a[0]+b[0])*k,(a[1]+b[1])*k
    d+=f' Q{P(cx,cy)} {P(*b)}'
  return d+' Z'
A=(f'<path d="{astroid(43,26)}" class="o"/>'
   f'<path d="{astroid(25,15,0.22)}" class="f"/>'
   '<path d="M0,-38 L0,38 M-22,0 L22,0" class="f"/>'
   '<circle cx="0" cy="0" r="1.7" class="dot"/>')
B=''.join(kite(a,L,w,i) for a,L,w,i in [(0,44,4.2,9),(90,30,3.6,8),(180,44,4.2,9),(270,30,3.6,8)])
B+=''.join(kite(a,15,2.4,6) for a in [45,135,225,315])
B+='<circle cx="0" cy="0" r="5.2" class="o" style="fill:var(--bg)"/><circle cx="0" cy="0" r="2.6" class="f"/>'
tl=math.radians(15)
C=''.join(kite(a,L,w,i,tl) for a,L,w,i in [(0,55,4.4,10),(90,24,3.4,7),(180,33,3.8,8),(270,27,3.4,7)])
C+=''.join(kite(a,13,2.2,5,tl) for a in [45,135,225,315])
C+='<circle cx="0" cy="0" r="2.4" class="o" style="fill:var(--bg)"/>'
designs={'A':A,'B':B,'C':C}
def svg(body,col,bg,scale):
  s=120*scale
  return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{s}" height="{s}" viewBox="-60 -60 120 120" style="--bg:{bg}">'
    f'<style>.o{{fill:none;stroke:{col};stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:12}}'
    f'.f{{fill:none;stroke:{col};stroke-width:.6;stroke-linecap:round}}.dot{{fill:{col}}}</style>{body}</svg>')
INK,CREAM='#1a1815','#eee5d0'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page()
    for k,body in designs.items():
      for nm,col,bg in [('ink',INK,'#f6f3ee'),('cream',CREAM,'#14191e')]:
        for sc in (1,3):
          s=svg(body,col,bg,sc); open(f'{k}_{nm}.svg','w').write(svg(body,col,bg,1))
          await pg.set_content(f'<body style="margin:0;background:transparent">{s}</body>')
          await pg.locator('svg').screenshot(path=f'{k}_{nm}_{sc}x.png',omit_background=True)
    await b.close()
asyncio.run(main())
