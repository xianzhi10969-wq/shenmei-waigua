from pathlib import Path
from playwright.sync_api import sync_playwright
import json
P=Path(__file__).resolve().parent;URL='http://127.0.0.1:8853/'
data=json.loads((P/'public/gallery.json').read_text());checks=[];errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True);page=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:errors.append(f'{r.status}: {r.url}') if r.status>=400 else None)
 for width in [320,390,430,1440]:
  page.set_viewport_size({'width':width,'height':844})
  for c in data['chapters']:
   page.goto(URL+'#/chapter/'+c['id']);page.wait_for_selector('.chapter-head')
   page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('.frame>img')].map(async i=>{i.loading='eager';await i.decode()}))}")
   page.wait_for_timeout(50)
   state=page.evaluate('''()=>({overflow:document.documentElement.scrollWidth>innerWidth,count:document.querySelectorAll('.exhibit').length,frames:[...document.querySelectorAll('.ornate')].map(f=>{let i=f.querySelector('img'),r=i.getBoundingClientRect(),pieces=f.querySelector('.ornate-pieces'),s=+f.style.getPropertyValue('--ornament-scale');return {ratioError:Math.abs(r.height-r.width*i.naturalHeight/i.naturalWidth),corners:[...pieces.children].filter(el=>['1','5'].includes(el.style.gridColumn)&&['1','5'].includes(el.style.gridRow)).map(el=>{let r=el.getBoundingClientRect(),v=el.viewBox.baseVal;return Math.abs(r.width/v.width-r.height/v.height)}),rows:getComputedStyle(pieces).gridTemplateRows.split(' ').map(parseFloat),columns:getComputedStyle(pieces).gridTemplateColumns.split(' ').map(parseFloat),source:pieces.querySelector('image').getAttribute('href')}})})''')
   assert not state['overflow'],(width,c['name'])
   assert state['count']==len(c['termIds'])
   assert all(f['ratioError']<1 and max(f['corners'])<.001 and min(f['rows'])>=0 and min(f['columns'])>=0 for f in state['frames']),(width,c['name'],state)
   checks.append({'width':width,'chapter':c['name'],'frameCount':len(state['frames'])})
  page.goto(URL+'#/chapter/reczz28HJJL2A7E0');page.wait_for_selector('.ornate');page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('.frame>img')].map(async i=>{i.loading='eager';await i.decode()}))}");page.wait_for_timeout(250)
  page.screenshot(path=str(P/f'view-{width}.png'),full_page=True)
  if width==390:
   for i in range(3):
    page.locator('.exhibit').nth(i).screenshot(path=str(P/f'exhibit-{i+1}.png'))
    page.locator('.frame').nth(i).screenshot(path=str(P/f'frame-{i+1}.png'))
 page.set_viewport_size({'width':390,'height':844})
 page.locator('#settings-open').click()
 for tone in ['black','gray','white','auto']:
  page.select_option('#tone-choice',tone)
  page.wait_for_function("t=>[...document.querySelectorAll('.ornate')].every(f=>f.querySelector('image').getAttribute('href').includes(t==='auto'?f.dataset.tone:t))",arg=tone)
 page.keyboard.press('Escape')
 page.locator('.frame').first.click();assert page.locator('#original').evaluate('(d)=>d.open');page.keyboard.press('Escape')
 page.locator('.entry-link').first.click();page.wait_for_url('**/terms/**');page.go_back();page.wait_for_selector('.ornate')
 b.close()
assert not errors,errors
(P/'checks.json').write_text(json.dumps({'passed':True,'views':checks,'errors':errors,'checks':['96 views / 24 chapters / 4 viewport widths','artwork aspect ratios within 1px','all corner aspect ratios preserved','no negative stretch rails','no horizontal overflow','white gray black actual asset switching','original image dialog','real term entry and browser back'],'limits':['browser emulation, not physical device','one ornamental family, not all five former frame types','colors are generated candidates, pending aesthetic review']},ensure_ascii=False,indent=2))
print('PASS',len(checks),'views')
