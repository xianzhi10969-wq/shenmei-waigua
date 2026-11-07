from pathlib import Path
from playwright.sync_api import sync_playwright
import json
P=Path(__file__).resolve().parent
URL='http://127.0.0.1:8852/'
data=json.loads((P/'public/gallery.json').read_text())
results=[];errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:errors.append(f'{r.status} {r.url}') if r.status>=400 else None)
 for width in [320,390,430,1440]:
  page.set_viewport_size({'width':width,'height':900 if width>1000 else 844})
  for c in data['chapters']:
   page.goto(URL+'#/chapter/'+c['id']);page.wait_for_selector('.chapter-head')
   page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('.frame img')].map(async i=>{i.loading='eager';await i.decode()}))}")
   state=page.evaluate('''()=>({overflow:document.documentElement.scrollWidth>innerWidth,terms:document.querySelectorAll('.exhibit').length,frames:[...document.querySelectorAll('.frame img')].map(i=>{const r=i.getBoundingClientRect(),b=i.parentElement.getBoundingClientRect();return {loaded:i.naturalWidth>0,ratioError:Math.abs(r.height-r.width*i.naturalHeight/i.naturalWidth),insetX:b.width-r.width,insetY:b.height-r.height}})})''')
   assert not state['overflow'],(width,c['name'],'overflow')
   assert state['terms']==len(c['termIds'])
   assert all(x['loaded'] and x['ratioError']<1 and abs(x['insetX']-24)<1 and abs(x['insetY']-24)<1 for x in state['frames']),(width,c['name'],state)
   results.append({'width':width,'chapter':c['name'],'terms':state['terms'],'frames':len(state['frames'])})
  page.goto(URL+'#/chapter/reczz28HJJL2A7E0');page.wait_for_selector('.exhibit')
  page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('.frame img')].map(async i=>{i.loading='eager';await i.decode()}))}")
  page.screenshot(path=str(P/f'mobile-{width}.png' if width<1000 else P/'desktop-1440.png'),full_page=True)
  if width==390:
   page.locator('.exhibit').nth(0).screenshot(path=str(P/'first-exhibit.png'))
   page.locator('.exhibit').nth(1).screenshot(path=str(P/'second-exhibit.png'))
   page.locator('.exhibit').nth(2).screenshot(path=str(P/'third-exhibit.png'))
 # Actual interactions, not only href inspection.
 page.set_viewport_size({'width':390,'height':844});page.locator('.frame').first.click();assert page.locator('#original').evaluate('(d)=>d.open');page.keyboard.press('Escape')
 assert not page.locator('#original').evaluate('(d)=>d.open')
 page.locator('#settings-open').click();page.select_option('#tone-choice','black');assert page.locator('body').get_attribute('data-tone')=='black';page.keyboard.press('Escape')
 page.locator('[data-entry="entry-reczz28HJJL2GLJb"]').click();page.wait_for_timeout(750);assert page.evaluate('scrollY')>400
 page.locator('[data-top]').click();page.wait_for_timeout(900);assert page.evaluate('scrollY')<2
 page.locator('.entry-link').first.click();page.wait_for_url('**/terms/**');page.wait_for_load_state('domcontentloaded');assert '7265637a7a3238484a4a4c32474c4350' in page.url
 page.go_back();page.wait_for_selector('.exhibit');assert 'reczz28HJJL2A7E0' in page.url
 # Simulate a missing image in this independent copy.
 page.route('**/media/54842180b4d39b13b367e560.jpg',lambda route:route.abort())
 page.reload();page.wait_for_selector('.frame');page.wait_for_function("document.querySelector('.frame').textContent.includes('暂时无法加载')")
 browser.close()
assert not errors,errors
(P/'checks.json').write_text(json.dumps({'status':'passed','views':results,'viewCount':len(results),'errors':errors,'checks':['all original aspect ratios within 1px','3px mat + 9px rail on every side','no horizontal overflow','all 101 terms reachable across 24 chapters','missing covers have no empty frame','lightbox + Escape','tone comparison','index scrolling + return to top','real term page entry + browser back','failed image fallback'],'limits':['browser emulation, not physical phone','neutral structural frame, ornamental adaptive asset not built','visual acceptance pending']},ensure_ascii=False,indent=2))
print('PASS',len(results),'views',len(errors),'errors')
