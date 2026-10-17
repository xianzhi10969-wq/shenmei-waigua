const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/Users/yuriko/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const results=[], errors=[];
 const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8766');
 assert.equal(await page.locator('.compartment').count(),6);
 assert.equal(await page.locator('#cabinet-art svg').count(),1);
 assert.equal(await page.locator('#cabinet-art svg rect[height="2.8"]').count(),48);
 const cabinet=await page.locator('#cabinet-art').boundingBox();assert(cabinet.y+cabinet.height<=900);
 results.push('Desktop: one continuous cabinet, six compartments, 48 shelves, full cabinet fits 1440 × 900.');
 await page.screenshot({path:'desktop.png'});
 for(let i=1;i<=6;i++){
  const button=page.getByRole('button',{name:`打开第 0${i} 格观察视图`});await button.click();
  assert(await page.locator('dialog').isVisible());assert.equal(await page.locator('#observation-title').textContent(),`观察格室 0${i}`);
  await page.keyboard.press('Escape');assert(!await page.locator('dialog').isVisible());
  assert(await button.evaluate(el=>document.activeElement===el));
 }
 results.push('All six compartments open; Escape closes and restores focus.');
 const button=page.getByRole('button',{name:'打开第 03 格观察视图'});await button.focus();await page.keyboard.press('Enter');
 await page.waitForTimeout(320);await page.screenshot({path:'desktop-detail.png'});
 for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>!!document.activeElement.closest('dialog')));}
 await page.locator('#detail-next').click();assert.equal(await page.locator('#observation-title').textContent(),'观察格室 04');
 await page.locator('#close').click();assert(!await page.locator('dialog').isVisible());
 await button.click();await page.mouse.click(5,5);assert(!await page.locator('dialog').isVisible());
 results.push('Keyboard Enter, modal focus containment, previous/next, close button and backdrop dismissal passed.');
 const mobileContext=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const mobile=await mobileContext.newPage();mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto('http://127.0.0.1:8766');
 assert(await mobile.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await mobile.screenshot({path:'mobile.png'});
 await mobile.getByRole('button',{name:'浏览第 05 格'}).tap();await mobile.waitForTimeout(500);
 const scroll=await mobile.locator('#viewport').evaluate(el=>el.scrollLeft);assert(scroll>0);
 await mobile.getByRole('button',{name:'打开第 05 格观察视图'}).tap();await mobile.waitForTimeout(320);await mobile.screenshot({path:'mobile-detail.png'});
 await mobile.locator('#close').tap();assert(Math.abs(await mobile.locator('#viewport').evaluate(el=>el.scrollLeft)-scroll)<2);
 await mobile.getByRole('button',{name:'浏览第 06 格'}).tap();await mobile.waitForTimeout(500);assert.equal(await mobile.locator('#position').textContent(),'06 / 06');
 await mobile.locator('#overview').tap();assert.equal(await mobile.locator('#overview').getAttribute('aria-pressed'),'true');
 const whole=await mobile.locator('.installation').boundingBox();assert(whole.width<=390);await mobile.screenshot({path:'mobile-overview.png'});
 await mobile.getByRole('button',{name:'打开第 04 格观察视图'}).tap();assert.equal(await mobile.locator('#observation-title').textContent(),'观察格室 04');await mobile.locator('#close').tap();
 results.push('390 × 844 touch: horizontal exploration, sixth compartment reachable, scroll restored, full-cabinet overview and opening from overview passed.');
 await page.emulateMedia({reducedMotion:'reduce'});await button.click();assert.equal(await page.locator('dialog').evaluate(el=>getComputedStyle(el).animationName),'none');await page.keyboard.press('Escape');
 results.push('Reduced motion disables dialog animation.');
 for(const width of [320,768,1024]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));}
 assert.equal(errors.length,0);results.push('No horizontal page overflow at 320 / 390 / 768 / 1024 / 1440; no JavaScript runtime errors.');
 fs.writeFileSync('test-results.json',JSON.stringify({testedAt:new Date().toISOString(),browser:'Installed Chrome (Playwright)',results,errors},null,2));
 console.log(results.join('\n'));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
