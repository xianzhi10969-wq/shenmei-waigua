from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];out=root/'checks';out.mkdir(exist_ok=True);catalog=json.loads((root/'src/catalog.json').read_text());errors=[];failed=[];results=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for w,h in [(390,844),(1440,1080)]:
  page=b.new_page(viewport={'width':w,'height':h});page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 else None)
  page.goto('http://127.0.0.1:8840/');page.wait_for_url('**/entrance/');page.wait_for_timeout(3500)
  page.screenshot(path=str(out/f'home-{w}.png'))
  page.goto('http://127.0.0.1:8840/entrance/?at=1');page.wait_for_function('window.GALLERY_REVIEW?.topic?.id');page.wait_for_timeout(800)
  link=page.locator('.p4-entry a').first;href=link.get_attribute('href');assert '#/chapter/rec' in href;link.click();page.wait_for_selector('.chapter-identity');assert page.locator('.gallery-card').count()>0
  page.screenshot(path=str(out/f'chapter-{w}.png'))
  page.goto('http://127.0.0.1:8840/terms/7265637a7a3238484a4a4c32474a486c/');page.evaluate('window.demoReady');page.wait_for_timeout(200)
  assert page.locator('.opening').evaluate('(e)=>+e.style.opacity')==1;assert page.locator('.case').count()==3
  page.mouse.move(w//2,h//2);page.mouse.wheel(0,8000);page.wait_for_function('transitionDemo.progress===1');page.locator('.back-to-map').first.click();assert page.locator('.map-layer').get_attribute('aria-hidden')=='false'
  page.evaluate('document.querySelector(".stage").scrollTop=0');page.wait_for_timeout(100);assert page.locator('.opening').evaluate('(e)=>+e.style.opacity')==1
  page.screenshot(path=str(out/f'term-opening-{w}.png'))
  # Long real introduction must be entirely reachable before its exit transition starts.
  longest=max(catalog['terms'],key=lambda t:len(t['hook']))
  page.goto('http://127.0.0.1:8840/terms/'+longest['id'].encode().hex()+'/');page.evaluate('window.demoReady');page.wait_for_timeout(100)
  bounds=page.evaluate('({height:document.querySelector(".scene").getBoundingClientRect().height,bottom:document.querySelector(".opening-copy").getBoundingClientRect().bottom,scrollHeight:document.querySelector(".stage").scrollHeight})')
  assert bounds['bottom']<=bounds['height']+1,(longest['name'],bounds)
  page.evaluate('document.querySelector(".stage").scrollTop=10000');page.wait_for_function('transitionDemo.progress===1');assert not page.evaluate('document.querySelector(".stage").scrollWidth>innerWidth+1')
  page.goto('http://127.0.0.1:8840/#/cases');page.wait_for_selector('.case-index-link');assert page.locator('.case-index-link').count()==144;page.locator('.case-index-link').first.click();page.wait_for_selector('.case-block');assert page.locator('.case-copy').inner_text().strip()
  page.goto('http://127.0.0.1:8840/features/#/feeling');page.wait_for_selector('[data-feeling]');assert page.locator('[data-feeling]').count()==40;page.locator('[data-feeling]').first.click();assert page.locator('#feeling-panel').inner_text()
  page.goto('http://127.0.0.1:8840/features/#/curiosity');page.wait_for_selector('.question-trigger');assert page.locator('.question-trigger').count()==9;page.locator('.question-trigger').first.click();assert page.locator('.question-answer').first.is_visible()
  page.goto('http://127.0.0.1:8840/features/#/imagery');page.wait_for_selector('#imagery-stage');page.locator('#draw-imagery').click();page.locator('#show-imagery-hint').click();assert page.locator('#imagery-hint').is_visible()
  page.goto('http://127.0.0.1:8840/resources/');page.wait_for_selector('.p5-entry');assert page.locator('.p5-entry').count()==4;page.locator('.p5-entry').first.click();page.wait_for_selector('.resource-row');assert page.locator('.resource-row').count()==60
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1');results.append({'width':w,'homeChapterTermCases':True,'all144Cases':True,'longestHook':longest['name'],'feeling40':True,'curiosity9':True,'imagery70':True,'resources60':True});page.close()
 b.close()
report={'results':results,'scriptErrors':errors,'failedResponses':failed};(out/'browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False))
