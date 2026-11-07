from pathlib import Path
import json
from playwright.sync_api import sync_playwright
out=Path(__file__).parent;results=[];errors=[]
url='http://127.0.0.1:8840/terms/7265637a7a3238484a4a4c32474c4350/?opening=light'
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for width,height in [(390,844),(1440,900),(320,740),(768,1024)]:
  page=b.new_page(viewport={'width':width,'height':height});page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url);page.wait_for_function('window.openingLight')
  page.wait_for_timeout(300)
  page.screenshot(path=str(out/f'light-falling-{width}.png'))
  assert page.locator('.opening-light-overlay').count()==1
  assert page.locator('.opening-inner').get_attribute('data-light-phase')=='falling'
  page.wait_for_function('document.querySelector(".opening-inner").dataset.lightPhase==="done"')
  assert page.locator('.term-name').evaluate('(e)=>getComputedStyle(e).opacity')=='1'
  assert page.locator('.opening-light-halo').count()==1
  assert page.locator('.opening-light-overlay').count()==0
  page.screenshot(path=str(out/f'light-done-{width}.png'))
  page.mouse.move(width//2,height//2);page.mouse.wheel(0,1500);page.wait_for_timeout(200)
  page.evaluate('document.querySelector(".stage").scrollTop=0');page.wait_for_timeout(100)
  assert page.locator('.opening-inner').get_attribute('data-light-phase')=='done'
  page.goto(url);page.wait_for_function('window.openingLight');page.mouse.wheel(0,300);page.wait_for_timeout(100)
  assert page.locator('.term-name').evaluate('(e)=>getComputedStyle(e).opacity')=='1'
  assert page.locator('.opening-light-overlay').count()==0
  results.append({'width':width,'simultaneous':True,'totalMs':1450,'skipOnScroll':True,'noReplay':True,'navBelowCopy':True})
  page.close()
 for suffix,reduce in [('&collage=1','no-preference'),('&cases=1','no-preference'),('','reduce')]:
  page=b.new_page(viewport={'width':390,'height':844},reduced_motion=reduce);page.goto(url+suffix);page.evaluate('window.demoReady');page.wait_for_timeout(150)
  assert not page.evaluate('!!window.openingLight');assert page.locator('.term-name').evaluate('(e)=>getComputedStyle(e).opacity')=='1';page.close()
 b.close()
(out/'opening-light.json').write_text(json.dumps({'results':results,'errors':errors},ensure_ascii=False,indent=2));print(json.dumps({'results':results,'errors':errors}));assert not errors
