"""Run against the standalone HTTP preview using an installed Chrome and Playwright."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent
URL = 'http://127.0.0.1:8765/'

async def main():
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless=True,
        )
        for width, height in [(320, 844), (390, 844), (430, 932), (768, 1024), (1000, 800), (1440, 1000)]:
            page = await browser.new_page(viewport={'width': width, 'height': height}, device_scale_factor=1)
            errors, failed = [], []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('response', lambda r: failed.append(f'{r.status}: {r.url}') if r.status >= 400 else None)
            await page.goto(URL)
            await page.evaluate('document.fonts.ready')
            await page.evaluate('Promise.all([document.fonts.load(\'300 32px "P5 Noto Serif SC"\'),document.fonts.load(\'400 20px "P5 Noto Serif SC"\')])')
            await page.locator('.p5-frame').wait_for()
            await page.evaluate('Promise.all([...document.images].map(i => i.decode().catch(() => {})))')
            metrics = await page.evaluate('''() => {
              const frame = document.querySelector('.p5-frame').getBoundingClientRect();
              const buttons = [...document.querySelectorAll('.p5-entry')];
              const inside = n => { const b=n.getBoundingClientRect(); return b.left>=frame.left-.1 && b.right<=frame.right+.1; };
              const entries = buttons.map(b => {const r=b.getBoundingClientRect(); return {key:b.dataset.category,width:r.width,height:r.height};});
              const labels = [...document.querySelectorAll('.p5-entry-content')];
              return {
                frame:{width:frame.width,height:frame.height}, entries,
                fontsLoaded:document.fonts.check('300 32px "P5 Noto Serif SC"') && document.fonts.check('400 20px "P5 Noto Serif SC"'),
                allLocalImages:[...document.images].every(i=>i.complete&&i.naturalWidth>0&&new URL(i.currentSrc).origin===location.origin),
                noHorizontalOverflow:document.documentElement.scrollWidth===innerWidth,
                labelsInside:labels.every(inside),
                fourDistinctKeys:new Set(entries.map(e=>e.key)).size===4,
                touchTargets:entries.every(e=>e.width>=44&&e.height>=44),
                mobileBlackWhite:innerWidth>=900 || buttons.filter((b,i)=>i%2===0).every(b=>getComputedStyle(b.querySelector('.p5-entry-content')).color==='rgb(246, 243, 237)'),
              };
            }''')
            for button, label in [('[data-category="visual-inspiration"]','视觉灵感'), ('[data-category="artworks"]','艺术作品'), ('[data-category="interactive-websites"]','互动网站'), ('[data-category="creative-materials"]','创作素材')]:
                await page.locator(button).click()
                assert label in await page.locator('#p5-review-output').inner_text()
            await page.locator('[data-action="navigation"]').click()
            assert '星星导航' in await page.locator('#p5-review-output').inner_text()
            await page.locator('[data-action="continue"]').focus()
            await page.keyboard.press('Enter')
            assert '意象实验室' in await page.locator('#p5-review-output').inner_text()
            # Verify the cancellable event contract without navigating away from the preview.
            await page.evaluate('''() => {
                window.p5Observed=[];
                document.querySelector('#p5').addEventListener('p5:select',e=>{window.p5Observed.push(e.detail.id);e.preventDefault();},{once:true});
            }''')
            await page.locator('[data-category="artworks"]').click()
            assert await page.evaluate('window.p5Observed') == ['artworks']
            assert '意象实验室' in await page.locator('#p5-review-output').inner_text()
            await page.evaluate('document.activeElement.blur()')
            if width in [390, 430, 1440]:
                await page.locator('.p5-frame').screenshot(path=str(ROOT / f'p5-{width}.png'))
            metrics['actionsPassed'] = True
            metrics['consoleErrors'] = errors
            metrics['failedResponses'] = failed
            assert not errors and not failed, (errors,failed)
            for key in ['fontsLoaded','allLocalImages','noHorizontalOverflow','labelsInside','fourDistinctKeys','touchTargets','mobileBlackWhite']:
                assert metrics[key], (width,key,metrics)
            results.append({'viewport':{'width':width,'height':height},**metrics})
            await page.close()
        await browser.close()
    (ROOT/'browser-validation.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
    print(f'{len(results)} viewport checks passed; category, navigation, keyboard and cancellation checks passed.')

asyncio.run(main())
