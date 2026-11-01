const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/Applications/ChatGPT.app/Contents/Resources/cua_node/lib/node_modules/playwright-core');
const fs=require('fs');const assert=require('assert').strict;
const BASE='http://127.0.0.1:8791';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 let expectedFailure=false;const errors=[],failures=[],notes=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!expectedFailure&&!r.url().includes('missing'))failures.push(r.status()+' '+r.url())});
 const cat=await (await page.request.get(BASE+'/api/catalog')).json();assert.equal(cat.chapters.length,24);assert.equal(cat.terms.length,101);
 await page.goto(BASE);await page.waitForSelector('.gallery-card');
 async function settledImages(){await page.evaluate(async()=>{document.querySelectorAll('img[loading="lazy"]').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await document.fonts.ready;});await page.waitForTimeout(80);}
 async function shot(name){await settledImages();await page.screenshot({path:`checks/browser-${name}.png`,fullPage:true});}
 await shot('mobile');await page.setViewportSize({width:1440,height:1000});await shot('desktop');
 const widths=[320,390,430,768,1440];let checks=0;
 for(const width of widths){await page.setViewportSize({width,height:900});for(const c of cat.chapters){await page.goto(BASE+'/#/chapter/'+c.id);await page.waitForSelector('.chapter-identity');assert.equal(await page.locator('.gallery-card').count(),c.termIds.length,c.name);const bad=await page.locator('.caption,.identity-title,.term-index button,.definition,.chapter-footer').evaluateAll(nodes=>nodes.filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right > innerWidth+1 || e.scrollWidth>e.clientWidth+2}).map(e=>({text:e.textContent,w:e.clientWidth,scroll:e.scrollWidth,right:e.getBoundingClientRect().right})));if(bad.length)notes.push({width,chapter:c.name,overflow:bad});checks++;}}
 const long=cat.chapters.find(c=>c.name==='乡愁');await page.setViewportSize({width:390,height:844});await page.goto(BASE+'/#/chapter/'+long.id);await page.waitForSelector('.gallery-card');await shot('eight-topics');
 let termChecks=0;
 for(const t of cat.terms){await page.goto(BASE+'/#/term/'+t.id);await page.waitForSelector('.term-hero,.pending-page');assert.equal(await page.locator('h1').innerText(),t.name);if(t.state.includes('已上线'))assert.equal(await page.locator('.case-block[id]').count(),t.caseIds.length,t.name);termChecks++;}
 const y=cat.chapters.find(c=>c.name==='幽玄'),soft=cat.terms.find(t=>t.name==='Softcore');
 await page.goto(BASE+'/#/chapter/'+y.id);await page.waitForSelector('.gallery-card');await page.locator(`[data-term="${soft.id}"] a`).click();await page.waitForSelector('.term-hero');assert.match(await page.locator('.topbar a').first().innerText(),/幽玄/);
 await page.locator('.case-links a[href^="#/case/"]').first().click();await page.waitForSelector('.case-page');await page.locator('.topbar a').first().click();await page.waitForSelector('.term-hero');assert.match(await page.locator('.topbar a').first().innerText(),/幽玄/);
 await page.locator('.hero-cover').click();assert.equal(await page.locator('#lightbox').evaluate(e=>e.open),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#lightbox').evaluate(e=>e.open),false);assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('hero-cover')),true);
 await page.locator('.topbar a').first().click();await page.waitForSelector('.gallery-card');assert.match(page.url(),new RegExp(y.id));
 await page.locator('[data-choose]').click();assert.equal(await page.locator('#chooser a').count(),24);await page.keyboard.press('Escape');
 await page.locator('.gallery-card a').first().click();await page.waitForSelector('.term-hero');await shot('term');await page.screenshot({path:'checks/browser-term-first.png'});await page.goBack();await page.waitForSelector('.gallery-card');
 await page.goto(BASE+'/#/chapters');await page.waitForSelector('#search');await page.locator('#search').fill('Softcore');assert.equal(await page.locator('.search-terms a').count(),1);
 // Preserved P1–P3 → real selected chapter.
 await page.goto(BASE+'/entrance/?at=1&topic=3');await page.waitForFunction(()=>window.GALLERY_REVIEW?.topic);await page.waitForSelector('.p4-entry a');await page.waitForTimeout(1200);assert.equal(await page.locator('.p4-entry a').first().getAttribute('href'),'/#/chapter/'+y.id);await page.screenshot({path:'checks/browser-p3.png'});await page.locator('.p4-entry a').first().click();await page.waitForSelector('.gallery-card');assert.equal(await page.locator('h1').innerText(),'幽玄');
 // Failed API, retry, and unknown route.
 expectedFailure=true;await page.route('**/api/terms/*',r=>r.fulfill({status:503,body:'{}'}));await page.goto(BASE+'/#/term/'+soft.id);await page.waitForSelector('.error-page');await page.unroute('**/api/terms/*');expectedFailure=false;await page.locator('[data-retry]').click();await page.waitForSelector('.term-hero');
 await page.goto(BASE+'/#/chapter/missing');await page.waitForSelector('.error-page');
 const report={chapterViewportChecks:checks,termRoutes:termChecks,errors,failedRequests:failures,layoutIssues:notes,interactions:['P3 selected topic → P4','P4 → term → case → term preserves chapter','lightbox Escape + focus restore','24-topic chooser','search','browser back','API failure + retry','unknown route']};fs.writeFileSync('checks/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();if(errors.length||failures.length||notes.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
