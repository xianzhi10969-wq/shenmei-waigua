const {chromium}=require('/Users/yuriko/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const fs=require('fs'),path=require('path');const out=__dirname;
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const errors=[],views=[];
for(const [width,height] of [[320,568],[390,690],[390,844],[430,932],[768,1024],[1440,900]]){
 const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(String(e)));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});await p.goto('http://127.0.0.1:8840/entrance/?at=1&topic=0');await p.waitForSelector('.topic-hit');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
 for(let i=0;i<24;i++){
 await p.waitForTimeout(45);
 const m=await p.evaluate(()=>{const g=document.querySelector('.gallery'),s=document.querySelector('#stage'),a=document.querySelector('.all-topics-link'),c=document.querySelector('.credits'),topic=GALLERY_REVIEW.topic,link=document.querySelector('.topic-hit');return {name:topic.name,id:topic.id,link:link.getAttribute('href'),top:s.getBoundingClientRect().top,bottom:c.getBoundingClientRect().bottom,allTop:a.getBoundingClientRect().top,allBottom:a.getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth,galleryHeight:g.getBoundingClientRect().height}});
 if(m.link!=='/#/chapter/'+m.id||m.top<0||m.bottom>height+1||m.allTop<0||m.allBottom>height||m.overflow)throw Error(JSON.stringify({width,height,i,...m}));views.push({width,height,...m});
 if(i===20&&[390,1440].includes(width))await p.screenshot({path:path.join(out,`future-${width}-${height}.png`)});
 await p.locator('#next').click();
 }
 // Tap the active artwork, then return to the same chapter in the gallery.
 const target=await p.locator('.topic-hit').getAttribute('href');const rect=await p.locator('.topic-hit').boundingBox();await p.mouse.click(rect.x+rect.width/2,rect.y+rect.height*.5);await p.waitForURL('**'+target);await p.waitForSelector('.chapter-identity');
 await p.locator('.chapter-nav a').click();await p.waitForURL('**/entrance/**');await p.waitForSelector('.topic-hit');await p.waitForTimeout(150);
 const restored=await p.locator('.topic-hit').getAttribute('href');if(restored!==target)throw Error('Wrong return topic');
 // The plaque itself has the same native link.
 const r=await p.locator('.ribbon-cn').boundingBox();await p.mouse.click(r.x+r.width/2,r.y+r.height/2);await p.waitForURL('**'+target);
 await p.goBack();await p.waitForSelector('.all-topics-link');await p.locator('.all-topics-link').click();await p.waitForURL('**/#/chapters');await p.waitForSelector('.chapter-tile');if(await p.locator('.chapter-tile').count()!==24)throw Error('Index missing');await p.close();
}
// Real horizontal drag must not navigate; vertical dragging must still return upward.
const p=await b.newPage({viewport:{width:390,height:844}});await p.goto('http://127.0.0.1:8840/entrance/?at=1&topic=2');await p.waitForSelector('.topic-hit');await p.waitForTimeout(300);let r=await p.locator('.topic-hit').boundingBox();await p.mouse.move(r.x+r.width*.75,r.y+r.height*.5);await p.mouse.down();await p.mouse.move(r.x+r.width*.1,r.y+r.height*.5,{steps:12});await p.mouse.up();await p.waitForTimeout(400);if(!p.url().includes('/entrance/'))throw Error('Swipe navigated');const selected=await p.evaluate(()=>GALLERY_REVIEW.selected);if(selected!==3)throw Error('Swipe did not change one topic');
const before=await p.evaluate(()=>scrollY);r=await p.locator('.topic-hit').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.mouse.move(r.x+r.width/2,r.y+r.height/2+150,{steps:10});await p.mouse.up();await p.waitForTimeout(150);if(await p.evaluate(()=>scrollY)>=before)throw Error('Vertical drag failed');
await p.goto('http://127.0.0.1:8840/entrance/?at=1&topic=2');await p.waitForSelector('.topic-hit');await p.locator('.topic-hit').focus();await p.keyboard.press('Enter');await p.waitForURL('**/#/chapter/**');
await b.close();const report={views,errors,actualArtAndPlaqueClicks:12,chapterReturns:6,allTopicsRoutes:6,horizontalSwipe:true,verticalDrag:true,keyboardEntry:true};fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));console.log({views:views.length,errors,interactions:'pass'});if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
