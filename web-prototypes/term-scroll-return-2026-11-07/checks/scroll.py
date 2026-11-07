from pathlib import Path
from playwright.sync_api import sync_playwright
import json
out=Path(__file__).resolve().parents[1];results=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for w,h in [(390,844),(1440,1080)]:
  page=b.new_page(viewport={'width':w,'height':h});errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  page.goto('http://127.0.0.1:8789/');page.evaluate('window.demoReady');page.wait_for_timeout(1500)
  assert page.locator('.opening').evaluate('(e)=>+e.style.opacity')==1
  assert page.locator('.stage').evaluate('(e)=>e.scrollTop')==0
  page.screenshot(path=str(out/f'previews/opening-{w}.png'))
  distance=page.evaluate('transitionDemo.distance');page.mouse.move(w//2,h//2);page.mouse.wheel(0,distance+5)
  page.wait_for_function('transitionDemo.progress>.25',timeout=3000)
  # Title and 01 appear first, no later entries jump ahead.
  a=page.evaluate('transitionDemo.pairs.map(p=>+p.figure.style.opacity)');assert a[0]>0 and a[-1]==0
  page.mouse.wheel(0,-1000);page.wait_for_function('document.querySelector(".stage").scrollTop===0')
  assert page.locator('.opening').evaluate('(e)=>+e.style.opacity')==1
  assert page.locator('.map-layer').get_attribute('aria-hidden')=='true'
  page.wait_for_timeout(250);assert page.locator('.stage').evaluate('(e)=>e.scrollTop')==0
  # Return to map; remembered progress resumes, scrolling does not reset the scene.
  page.mouse.wheel(0,distance+5)
  if w==390:
   page.wait_for_function('transitionDemo.waiting!==null',timeout=12000)
   blocked=page.evaluate('transitionDemo.waiting');assert blocked==7
   page.mouse.wheel(0,550)
  page.wait_for_function('transitionDemo.progress===1',timeout=12000)
  # Native scroll back from completed collage to chandelier.
  page.keyboard.press('Home');page.wait_for_function('document.querySelector(".stage").scrollTop===0')
  assert page.locator('.opening').evaluate('(e)=>+e.style.opacity')==1
  page.wait_for_timeout(200);page.locator('.stage').focus();page.keyboard.press('PageDown');page.wait_for_timeout(500)
  assert page.locator('.stage').evaluate('(e)=>e.scrollTop')>0
  page.locator('.figure-ref[data-figure="dress"]').click();assert page.evaluate('document.activeElement.id')=='case-reczz28LbKsn2qIJ'
  page.locator('#case-reczz28LbKsn2qIJ .back-to-map').click()
  assert page.locator('.map-layer').get_attribute('aria-hidden')=='false'
  page.locator('#play').click();assert page.locator('.stage').evaluate('(e)=>e.scrollTop')==0
  # inspect halfway crossfade, full map, and reading restored
  page.evaluate('document.querySelector(".stage").scrollTop=transitionDemo.distance*.7');page.wait_for_timeout(100);page.screenshot(path=str(out/f'previews/reverse-{w}.png'))
  page.goto('http://127.0.0.1:8789/?cases=1');page.evaluate('window.demoReady');assert page.locator('.case').count()==3
  assert page.locator('.cases-heading').bounding_box()['y']<50
  page.screenshot(path=str(out/f'previews/cases-{w}.png'))
  page.mouse.move(w//2,h//2);page.mouse.wheel(0,-10000);page.wait_for_function('document.querySelector(".stage").scrollTop===0')
  assert page.locator('.opening').evaluate('(e)=>+e.style.opacity')==1
  assert page.evaluate('document.querySelector(".stage").scrollWidth<=innerWidth+1')
  assert not errs;results.append({'width':w,'openingWaitsForScroll':True,'wheelBackMidReveal':True,'wheelBackAfterComplete':True,'keyboardHomePageDown':True,'sequentialReveal':True,'caseLinkReturn':True,'caseDeepLinkCanReachOpening':True});page.close()
 # Actual touch gesture events via Chrome mobile emulation.
 page=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);page.goto('http://127.0.0.1:8789/?cases=1');page.evaluate('window.demoReady')
 page.evaluate('document.querySelector(".stage").scrollTop=transitionDemo.distance+100');page.wait_for_timeout(100)
 client=page.context.new_cdp_session(page)
 client.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':195,'y':180}]})
 for y in [220,300,400,520,650,760]:
  client.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':195,'y':y}]});page.wait_for_timeout(30)
 client.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(600)
 assert page.locator('.stage').evaluate('(e)=>e.scrollTop')<100
 results.append({'mobileTouchSwipeBack':True})
 page=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');page.goto('http://127.0.0.1:8789/');page.evaluate('window.demoReady');assert page.locator('.opening').evaluate('(e)=>+e.style.opacity')==1
 page.mouse.move(195,400);page.mouse.wheel(0,600);page.wait_for_function('transitionDemo.progress==1');results.append({'reducedMotionOpeningAndCasesAccessible':True})
 b.close()
(out/'previews/scroll-checks.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False))
