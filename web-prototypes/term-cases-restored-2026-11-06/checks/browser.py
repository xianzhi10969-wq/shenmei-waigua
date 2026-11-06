from pathlib import Path
import json
from playwright.sync_api import sync_playwright
out=Path(__file__).resolve().parents[1];data=json.loads((out/'cases.json').read_text());results=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for w,h in [(320,780),(390,844),(430,932),(768,1024),(1440,1080)]:
  page=b.new_page(viewport={'width':w,'height':h});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8788/?capture=1');page.evaluate('window.demoReady')
  assert page.evaluate('[...document.images].every(i=>i.complete&&i.naturalWidth>0)')
  page.evaluate('transitionDemo.setProgress(.22)');assert page.evaluate('+document.querySelector(".title").style.opacity===1&&transitionDemo.pairs.every(p=>+p.figure.style.opacity===0)')
  for i in range(10):
   page.evaluate('(p)=>transitionDemo.setProgress(p)',.24+i*.065+.025)
   pairs=page.evaluate('transitionDemo.pairs.map(p=>({art:+p.figure.style.opacity,ref:+p.ref.style.opacity}))')
   assert all(abs(q['art']-q['ref'])<1e-8 for q in pairs)
   assert all(q['art']>.999 for q in pairs[:i]) and abs(pairs[i]['art']-.5)<.001 and all(q['art']==0 for q in pairs[i+1:])
  page.evaluate('transitionDemo.setProgress(1)');assert page.locator('.case').count()==3;assert page.locator('.practice').count()==0
  for n,c in enumerate(data['cases']):
   case=page.locator('.case').nth(n);assert case.get_attribute('data-record-id')==c['id']
   assert case.locator('h3').inner_text()==c['title'];assert case.locator('.case-insight').inner_text()==c['insight']
   assert case.locator('.case-prose p').all_text_contents()==c['analysis'].split('\n\n')
   assert case.locator('.official').get_attribute('href')==c['official']
   case.locator('.gallery-thumb').nth(2).click();assert case.locator('.gallery-main img').get_attribute('src')==c['images'][2]
   assert case.locator('.gallery-count').inner_text()=='03 / 03'
  for u in data['units']:
   ref=page.locator('.figure-ref[data-figure="'+u['unit_id']+'"]');ref.click()
   if u['case_record_id']:
    case=page.locator('#case-'+u['case_record_id']);assert case.locator('.gallery-main img').get_attribute('src')==u['source_file']
    assert page.evaluate('document.activeElement.id')=='case-'+u['case_record_id'];case.locator('.back-to-map').click()
    assert ref.evaluate('(e)=>document.activeElement===e')
   else:assert page.locator('#sources').get_attribute('open') is not None
  overflow=page.evaluate('document.querySelector(".map-layer").scrollWidth>innerWidth+1');assert not overflow,(w,overflow)
  if w in [390,1440]:
   page.evaluate('document.querySelectorAll(".case").forEach(c=>c.querySelector(".gallery-thumb").click())')
   page.evaluate('document.querySelector(".cases-heading").scrollIntoView({block:"start"})');page.screenshot(path=str(out/f'previews/cases-{w}.png'))
   page.evaluate('document.querySelectorAll(".case-insight")[0].scrollIntoView({block:"start"})');page.screenshot(path=str(out/f'previews/analysis-{w}.png'))
  page.evaluate('transitionDemo.setProgress(0)');assert page.evaluate('transitionDemo.pairs.every(p=>p.figure.style.opacity==0&&p.ref.tabIndex==-1)')
  assert not errors;results.append({'width':w,'titleThen01to10':True,'pairedArtNumbers':True,'threeExactCases':True,'nineGalleryImages':True,'allTenLinks':True,'noOverflow':True});page.close()
 page=b.new_page(viewport={'width':390,'height':844});page.goto('http://127.0.0.1:8788/');page.evaluate('window.demoReady');page.evaluate('transitionDemo.replay()');page.wait_for_function('transitionDemo.waiting!==null',timeout=15000)
 first=page.evaluate('({wait:transitionDemo.waiting,p:transitionDemo.progress,a:transitionDemo.pairs.map(p=>+p.figure.style.opacity)})');assert first['a'][first['wait']-1]==0
 page.wait_for_timeout(300);assert abs(page.evaluate('transitionDemo.progress')-first['p'])<.00001
 page.evaluate('document.querySelector(".map-layer").scrollTop=500');page.wait_for_function('transitionDemo.progress==1',timeout=10000)
 results.append({'mobileViewportGate':True,'firstWait':first['wait'],'offscreenHeld':True,'continuedAfterScroll':True});page.close()
 page=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');page.goto('http://127.0.0.1:8788/');page.evaluate('window.demoReady');assert page.evaluate('transitionDemo.progress')==1;results.append({'reducedMotionAllContentAccessible':True});b.close()
(out/'previews/checks.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False))
