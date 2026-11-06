from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path(__file__).parent/'previews';out.mkdir(exist_ok=True)
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for w,h in [(390,844),(1440,1000),(320,740),(430,932)]:
  page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:8776/')
  page.screenshot(path=str(out/f'{w}-opening.png'))
  page.locator('#open-board').scroll_into_view_if_needed();y=page.evaluate('scrollY')
  page.screenshot(path=str(out/f'{w}-entry.png'))
  page.locator('#open-board').click();page.locator('dialog[open]').wait_for()
  frame=page.frame_locator('#board-frame')
  frame.locator('.piece img').first.wait_for()
  page.wait_for_timeout(250)
  page.screenshot(path=str(out/f'{w}-board.png'))
  count=frame.locator('.piece').count();assert count==10
  assert frame.locator('.piece img').evaluate_all('(imgs)=>imgs.every(i=>i.complete&&i.naturalWidth>0)')
  assert frame.locator('body').evaluate('()=>document.documentElement.scrollWidth<=innerWidth')
  frame.locator('.figure-ref').first.click();assert frame.locator('#sources').get_attribute('open') is not None
  frame.locator('#source-01').press('Escape')
  page.wait_for_function('!document.querySelector("#plate").open')
  page.wait_for_function('document.activeElement.id==="open-board" && document.body.style.position!=="fixed"')
  returned=page.evaluate('scrollY');assert abs(returned-y)<2,(w,y,returned)
  page.locator('#open-board').click();page.locator('#close-board').click()
  page.wait_for_function('document.activeElement.id==="open-board" && document.body.style.position!=="fixed"')
  assert abs(page.evaluate('scrollY')-y)<2
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert not errors,errors
  results.append({'width':w,'pieces':count,'entry_scroll':y,'returned_scroll':returned,'escape_from_board':True,'button_close':True,'focus_restored':True,'no_horizontal_overflow':True,'errors':errors})
  page.close()
 browser.close()
(out/'checks.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results))
