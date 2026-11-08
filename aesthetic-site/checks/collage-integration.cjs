const {chromium}=require('/Users/yuriko/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),rows=JSON.parse(fs.readFileSync(path.join(root,'src/collages.json')));
(async()=>{
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const errors=[],reports=[];
const page=await browser.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
for(const width of [390,1440]){
 await page.setViewportSize({width,height:900});
 for(const row of rows){
 const route='/terms/'+Buffer.from(row.termId).toString('hex')+'/?collage=1';
 await page.goto('http://127.0.0.1:8840'+route);
 await page.waitForFunction(()=>window.demoReady&&document.querySelector('.collage-art')?.contentDocument?.querySelector('a[tabindex]'));
 await page.evaluate(()=>window.demoReady);
 const check=await page.evaluate(async()=>{
 const data=JSON.parse(document.querySelector('#collage-data').textContent),art=document.querySelector('.collage-art'),doc=art.contentDocument;
 const links=[...doc.querySelectorAll('a.piece,a.unit')];let clicks=0,caseLinks=0;
 for(const link of links){
 link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
 const modal=document.querySelector('.collage-dialog');if(!modal.open)throw Error('Original did not open');
 const p=data.pieces[link.hasAttribute('data-index')?Number(link.dataset.index):Number(link.dataset.number)-1];
 if(modal.querySelector('img').getAttribute('src')!==p.original)throw Error('Wrong original');
 if(p.caseId){if(!document.getElementById('case-'+p.caseId))throw Error('Missing case');caseLinks++;}
 await modal.querySelector('img').decode();
 modal.close();clicks++;
 }
 const r=art.getBoundingClientRect();
 return {clicks,caseLinks,visible:document.querySelector('.map-layer').getAttribute('aria-hidden')==='false',width:r.width,height:r.height,overflow:document.documentElement.scrollWidth>innerWidth+1,svgWidth:doc.documentElement.getBoundingClientRect().width};
 });
 if(check.overflow||!check.visible||check.clicks!==row.pieces.length||check.width<width*.7||Math.abs(check.width-check.svgWidth)>2)throw Error(row.slug+' '+JSON.stringify(check));
 reports.push({slug:row.slug,width,...check});
 if(['translucent','softcore','zen'].includes(row.slug)){
 await page.screenshot({path:path.join(root,`checks/integrated-${row.slug}-${width}.png`)});
 // Native pointer click, read its actual case when available, then return and reverse-scroll.
 await page.evaluate(()=>{const a=document.querySelector('.collage-art');a.contentDocument.querySelector('a').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));});
 const read=page.locator('.read-case');if(await read.isVisible()){
 await read.click();await page.locator('.case').filter({has:page.locator(':focus')}).count();
 await page.evaluate(()=>{const focused=document.activeElement;focused.querySelector('.back-to-map').click();});
 }
 await page.evaluate(()=>{document.querySelector('.stage').scrollTop=0});
 await page.waitForTimeout(50);
 if(!await page.evaluate(()=>document.querySelector('.opening').getAttribute('aria-hidden')==='false'))throw Error('Opening return failed');
 }
 }
}
await page.goto('http://127.0.0.1:8840/collages/');if(await page.locator('li').count()!==rows.length+1)throw Error('Index count');
await browser.close();
fs.writeFileSync(path.join(root,'checks/collage-integration.json'),JSON.stringify({reports,errors},null,2));
console.log(JSON.stringify({views:reports.length,clicks:reports.reduce((s,r)=>s+r.clicks,0),errors}));if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
