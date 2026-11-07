from pathlib import Path
from playwright.sync_api import sync_playwright
import json,math
root=Path(__file__).resolve().parents[1];out=root/'checks/home-seam';out.mkdir(exist_ok=True);report=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for w,h,dpr in [(390,844,2),(430,932,3),(320,740,2)]:
  page=b.new_page(viewport={'width':w,'height':h},device_scale_factor=dpr)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:errors.append(str(r.status)+' '+r.url) if r.status>=400 else None)
  page.goto('http://127.0.0.1:8840/entrance/');page.wait_for_timeout(3200)
  limit=page.evaluate('document.querySelector("#journey").offsetTop');rows=[]
  for n in range(101):
   y=limit*n/100;page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(22)
   row=page.locator('#mstack').evaluate('(e)=>({...e.dataset})');rows.append(row)
   localY=float(row['flightY'])*390/w
   if 1060<localY<1448:
    x=float(row['flightX'])*390/w;size=float(row['flightSize'])*390/w
    assert x+size/4<28,(n,x,size,localY)
  def rect(selector):return page.locator(selector).bounding_box()
  a=rect('#mstar');assert page.locator('#mstar').evaluate('(e)=>getComputedStyle(e).visibility')=='visible'
  page.evaluate('(y)=>scrollTo(0,y)',limit+1);page.wait_for_timeout(60);c=rect('#traveller')
  assert max(abs(a[k]-c[k]) for k in ['x','y','width','height'])<.1,(a,c)
  # The same scroll positions reproduce the same state in reverse.
  for n in [85,70,50,30,10,0]:
   page.evaluate('(y)=>scrollTo(0,y)',limit*n/100);page.wait_for_timeout(35)
   row=page.locator('#mstack').evaluate('(e)=>({...e.dataset})');assert row==rows[n],(n,row,rows[n])
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  assert not errors,errors
  report.append({'width':w,'height':h,'dpr':dpr,'scrollSamples':101,'reverse':'identical states','handoffMaxCSSpx':max(abs(a[k]-c[k]) for k in ['x','y','width','height']),'textMargin':'visible star stays left of number column','errors':errors})
  page.close()
 (out/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 # Record the real browser runtime, including the opening and reverse scrolling.
 context=b.new_context(viewport={'width':390,'height':844},record_video_dir=str(out/'video'),record_video_size={'width':390,'height':844})
 page=context.new_page();page.goto('http://127.0.0.1:8840/entrance/');page.wait_for_timeout(3300)
 page.mouse.wheel(0,1);page.wait_for_timeout(100)
 for target,duration in [(1060,4800),(1550,2200),(0,6000)]:
  page.evaluate('''({target,duration})=>new Promise(resolve=>{const from=scrollY,start=performance.now();function frame(t){const p=Math.min(1,(t-start)/duration);scrollTo(0,from+(target-from)*(p*p*(3-2*p)));if(p<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);})''',{'target':target,'duration':duration})
  page.wait_for_timeout(350)
 video=page.video;page.close();video.save_as(str(out/'scroll-preview.webm'));context.close()
 b.close()
(out/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False))
