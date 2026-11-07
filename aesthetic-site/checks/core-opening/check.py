from pathlib import Path
from html.parser import HTMLParser
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2];terms=json.loads((root/'src/catalog.json').read_text())['terms'];out=Path(__file__).parent
class Intro(HTMLParser):
 def __init__(self):super().__init__();self.inside=False;self.text='';self.field=None
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='p' and a.get('class')=='introduction':self.inside=True;self.field=a.get('data-source-field')
 def handle_endtag(self,tag):
  if tag=='p':self.inside=False
 def handle_data(self,data):
  if self.inside:self.text+=data
for t in terms:
 parser=Intro();parser.feed((root/'public/terms'/t['id'].encode().hex()/'index.html').read_text());assert parser.text==t['core'],t['name'];assert parser.field=='核心'
errors=[];views=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 for width,height in [(390,700),(1440,900)]:
  page=b.new_page(viewport={'width':width,'height':height});page.on('pageerror',lambda e:errors.append(str(e)))
  for name in ['治愈','Coquette','模拟恐怖']:
   t=next(t for t in terms if t['name']==name);page.goto('http://127.0.0.1:8840/terms/'+t['id'].encode().hex()+'/?opening=light');page.evaluate('window.demoReady');page.wait_for_timeout(1700)
   assert page.locator('.introduction').inner_text()==t['core']
   if name=='治愈':page.screenshot(path=str(out/f'healing-{width}.png'))
   views.append({'name':name,'width':width,'openingEqualsCore':True})
  page.close()
 for file,w,h in [('mobile-320',320,640),('mobile',390,700),('mobile-430',430,740),('desktop',1440,900)]:
  page=b.new_page(viewport={'width':w,'height':h});page.goto('http://127.0.0.1:8840/research/term-layout-2026-11-07/'+file+'.svg');t=next(t for t in terms if t['name']=='治愈');assert page.locator('#introduction').text_content()==t['core']
  assert page.evaluate('Array.from(document.querySelectorAll("#editable-copy text")).every(e=>{const r=e.getBBox();return r.x>=0&&r.y>=0&&r.x+r.width<=innerWidth&&r.y+r.height<=innerHeight})')
  page.screenshot(path=str(out/f'layout-{file}.png'));page.close()
 report={'staticTermsChecked':len(terms),'coreNonEmpty':sum(bool(t['core']) for t in terms),'emptyNoFallback':sum(not t['core'] for t in terms),'browserViews':views,'revisedCoreSketches':4,'errors':errors};(out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False));assert not errors
 b.close()
