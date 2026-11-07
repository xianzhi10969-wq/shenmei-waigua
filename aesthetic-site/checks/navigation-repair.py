from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]; out=root/'checks'; results=[]; errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for w,h in [(390,844),(1440,1000)]:
  page=b.new_page(viewport={'width':w,'height':h})
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('response',lambda r:errors.append(f'{r.status} {r.url}') if r.status>=400 else None)
  page.goto('http://127.0.0.1:8840/entrance/')
  page.wait_for_function('window.homeContinuation && window.GALLERY_REVIEW?.topic?.id')
  page.wait_for_timeout(4500)
  if w<680:
   assert page.locator('#mp1-scene').get_attribute('data-tear-once')=='done'
   assert page.locator('#mp1-scene').get_attribute('data-tear-starts')=='1'
  page.evaluate("import('/entrance/transition.mjs?v=20261107-seam').then(m=>m.goToTopics())")
  page.wait_for_timeout(500)
  bounds=page.locator('#adopted-p3 .gallery').bounding_box()
  title=page.locator('.ribbon-cn').first.bounding_box()
  assert title and title['y']>=0 and title['y']+title['height']<=h,(w,title)
  page.screenshot(path=str(out/f'repair-gallery-{w}.png'))
  page.evaluate('window.homeContinuation.resources()')
  page.wait_for_timeout(1000)
  assert page.locator('.p5-entry').count()==4
  page.screenshot(path=str(out/f'repair-resources-{w}.png'))
  page.locator('.p5-continue').click()
  page.wait_for_timeout(1000)
  lab=page.frame_locator('#home-imagery iframe')
  lab.locator('#draw-imagery').click()
  lab.locator('#show-imagery-hint').click()
  page.wait_for_timeout(300)
  assert lab.locator('#imagery-hint').is_visible()
  frame=page.locator('#home-imagery iframe')
  fit=frame.evaluate('(e)=>({height:e.clientHeight,content:e.contentDocument.querySelector("#app").getBoundingClientRect().height})')
  assert abs(fit['height']-fit['content'])<=2,fit
  page.screenshot(path=str(out/f'repair-imagery-{w}.png'))
  # Wheel over iframe must move the outer document, not a hidden inner viewport.
  page.evaluate('window.scrollTo(0,document.body.scrollHeight)');page.wait_for_timeout(200)
  before=page.evaluate('scrollY');page.mouse.move(w//2,h//2);page.mouse.wheel(0,-500);page.wait_for_timeout(500)
  assert page.evaluate('scrollY')<before
  page.evaluate('scrollTo(0,0)');page.wait_for_timeout(300)
  if w<680: assert page.locator('#mp1-scene').get_attribute('data-tear-starts')=='1'
  page.evaluate('window.homeContinuation.resources()');page.wait_for_timeout(800)
  page.locator('.p5-entry').first.click();page.wait_for_selector('.resource-row');assert page.locator('.resource-row').count()==60
  page.goto('http://127.0.0.1:8840/terms/7265637a7a3238484a4a4c32474c4350/?from=reczz28HJJL2A7E0')
  page.evaluate('window.demoReady');page.wait_for_timeout(200)
  assert page.locator('.opening-copy > .term-parent').count()==1
  nav=page.locator('.term-parent').bounding_box();intro=page.locator('.introduction').bounding_box()
  assert nav['y']>=intro['y']+intro['height']
  page.screenshot(path=str(out/f'repair-healing-{w}.png'))
  page.locator('.term-parent a').first.click();page.wait_for_selector('.chapter-identity')
  results.append({'width':w,'tearOnce':w<680,'galleryTitleVisible':True,'homeResourcesLab':True,'nativeWheel':True,'labHintResizes':True,'resourceRoute60':True,'termNavClear':True})
  page.close()
 page=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 page.goto('http://127.0.0.1:8840/entrance/');page.wait_for_function('document.querySelector("#mp1-scene")?.dataset.tearOnce === "static"')
 b.close()
report={'results':results,'errors':errors};(out/'navigation-repair.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False));assert not errors
