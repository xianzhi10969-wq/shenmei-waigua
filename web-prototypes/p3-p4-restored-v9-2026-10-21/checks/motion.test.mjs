import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {scenePose,homography,project,FLAP_SOURCE} from '../dist/motion-geometry.mjs';
import {pageGeometry} from '../dist/folio-content.mjs';

const near=(a,b,tolerance=1e-5)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
let states=0;
for(const [w,h] of [[320,568],[360,800],[390,844],[430,932],[460,740],[460,420],[1024,768],[1280,800],[1440,900],[1920,1080],[2560,1440],[3440,1440]]){
 for(let i=0;i<=10000;i++){
  const q=scenePose(i/10000,w,h);states++;
  for(const r of q.rods)for(const pt of [r.a,r.b])near(Math.hypot(pt[0]-r.joint[0],pt[1]-r.joint[1]),220,.001);
  if(!q.edge){
   const planes=[[FLAP_SOURCE,q.flap],...(q.showBook?[[q.layout.pageSource,q.page],[q.layout.frontSource,q.front]]:[])];
   for(const [src,dst] of planes){const m=homography(src,dst);assert.ok(m.every(Number.isFinite));src.forEach((pt,k)=>project(m,pt).forEach((v,j)=>near(v,dst[k][j])))}
   const hinge=homography(FLAP_SOURCE,q.flap);for(let k=0;k<2;k++)near(project(hinge,FLAP_SOURCE[k])[1],854);
  }
 }
 const end=scenePose(1,w,h),layout=end.layout;
 const page=pageGeometry(layout,h);
 for(const quad of page.quads)for(const [x,y] of quad){assert.ok(x>=0&&x<=layout.width);assert.ok(y>=0&&y<layout.split,'Printed content crosses the desk-front split')}
 near(end.page[0][0],0);near(end.page[0][1],0);near(end.page[2][0],w);near(end.page[2][1],layout.wide?h*layout.split/layout.height:h*.86);near(end.front[2][1],h);
 if(layout.wide){
  near(w/layout.width,h/layout.height);
  const m=homography(layout.pageSource,end.page),scale=Math.min(layout.width/1672,layout.height/941),rx=(layout.width-1672*scale)/2,ry=(layout.height-941*scale)/2;
  const a=project(m,[rx,ry]),b=project(m,[rx+1672*scale,ry+941*scale]);
  near((b[0]-a[0])/(b[1]-a[1]),1672/941);
  assert.ok(a[0]>=-1e-5&&a[1]>=-1e-5&&b[0]<=w+1e-5&&b[1]<=h+1e-5,'Complete spread fits viewport');
 }
 for(const p of [0,.1,.499,.5,.99,1])assert.equal(scenePose(p,w,h,true).p,p<.5?0:1);
}
for(const baseline of JSON.parse(readFileSync(new URL('./accepted-mobile-baseline.json',import.meta.url),'utf8'))){
 const states=[];
 for(let i=0;i<=1000;i++){const q=scenePose(i/1000,baseline.width,baseline.height);states.push([q.camera,q.flap,q.page,q.front,q.side,q.showBook,q.canBrowse])}
 assert.equal(createHash('sha256').update(JSON.stringify(states)).digest('hex'),baseline.hash,'Accepted mobile trajectory changed');
}

// Headless DOM stubs exercise controller logic only; these are not browser/visual tests.
const elements=new Map(),frames=new Map();let frame=0;
class Element{
 constructor(id){this.id=id;this.style={};this.attributes=new Map();this.events={};this.clientWidth=390;this.clientHeight=844;this.offsetHeight=id==='sequence'?2532:844;this.scrollLeft=0;this.classList={add(){},remove(){},toggle(){return false}};this.firstElementChild={innerHTML:''};this.captured=new Set()}
 setAttribute(k,v){this.attributes.set(k,String(v))}
 toggleAttribute(k,on){if(on)this.attributes.set(k,'');else this.attributes.delete(k)}
 addEventListener(k,fn){this.events[k]=fn}
 getBoundingClientRect(){return {top:-window.scrollY}}
 scrollTo({left}){this.scrollLeft=left;this.events.scroll?.()}
 setPointerCapture(id){this.captured.add(id)}
 hasPointerCapture(id){return this.captured.has(id)}
 releasePointerCapture(id){this.captured.delete(id)}
 querySelectorAll(selector){
  if(selector==='[data-specimen]')return ['snow','trees','organza','silhouette'].map(key=>{const el=document.getElementById('sample-'+key);el.dataset={specimen:key};return el});
  if(selector==='[data-page]')return [0,1,0,1].map((value,i)=>{const el=document.getElementById('tab-'+i);el.dataset={page:String(value)};return el});
  return [];
 }
 querySelector(selector){if(selector==='h2')return document.getElementById(this.id==='page-clear'?'clear-title':'coquette-title');return null}
 focus(){document.activeElement=this}
 showModal(){this.open=true}
 close(){this.open=false;this.events.close?.()}
}
globalThis.document={getElementById(id){if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)}};
globalThis.window={scrollY:0,events:{},scrollTo({top}){this.scrollY=top},addEventListener(k,fn){this.events[k]=fn}};
const media={matches:false,addEventListener(_,fn){this.change=fn}};
globalThis.matchMedia=()=>media;globalThis.ResizeObserver=class{constructor(fn){this.fn=fn}observe(){}};
globalThis.requestAnimationFrame=fn=>{frames.set(++frame,fn);return frame};globalThis.cancelAnimationFrame=id=>frames.delete(id);
globalThis.Image=class{set src(value){queueMicrotask(()=>this.onload?.())}};
globalThis.location={search:''};
await import('../dist/motion.mjs');await new Promise(resolve=>setImmediate(resolve));
const el=id=>elements.get(id);
const scrub=p=>{el('progress').value=p*1000;el('progress').events.input()};
assert.ok(el('flap-plane').attributes.has('hidden'));
assert.ok(!el('flap-outer').attributes.has('hidden'));
scrub(.7);assert.ok(!el('flap-plane').attributes.has('hidden'));assert.equal(el('book-body').hidden,false);
scrub(1);assert.match(el('book-body').style.transform,/matrix3d/);assert.equal(el('counter').value,'100%');
el('restart').onclick();assert.equal(el('counter').value,'0%');
el('play').onclick();assert.equal(el('play').textContent,'暂停');el('stage').events.touchstart();assert.equal(el('play').textContent,'播放');
el('cabinet-viewport').events.keydown({key:'ArrowRight',preventDefault(){}});near(el('cabinet-viewport').scrollLeft,941/3);
scrub(.6);media.matches=true;media.change();assert.equal(el('play').disabled,true);assert.equal(el('book-body').hidden,false);
scrub(.4);assert.equal(el('book-body').hidden,true);
media.matches=false;media.change();scrub(.63);
el('world').clientWidth=1440;el('stage').clientHeight=900;el('sequence').offsetHeight=2520;window.events.resize();
assert.equal(el('counter').value,'63%');assert.match(el('book-body').style.backgroundImage,/book-desktop-approved/);assert.equal(el('book-body').style.backgroundSize,'contain');
scrub(0);assert.equal(el('gallery-navigation').hidden,false);
const rail=el('cabinet-viewport'),startScroll=rail.scrollLeft,desktopScale=scenePose(0,1440,900).camera.scale;
rail.events.pointerdown({pointerType:'mouse',button:0,pointerId:7,clientX:600,preventDefault(){}});
rail.events.pointermove({pointerId:7,clientX:600-941/3*desktopScale});rail.events.pointerup();near(rail.scrollLeft,startScroll+941/3);assert.equal(rail.hasPointerCapture(7),false);
el('next-topic').onclick();near(rail.scrollLeft,startScroll+2*941/3);
el('previous-topic').onclick();near(rail.scrollLeft,startScroll+941/3);
rail.scrollLeft=5*941/3;rail.events.scroll();assert.equal(el('next-topic').disabled,true);el('next-topic').onclick();near(rail.scrollLeft,5*941/3);
scrub(1);el('world').clientWidth=390;el('stage').clientHeight=844;el('sequence').offsetHeight=2532;window.events.resize();
assert.equal(el('counter').value,'100%');assert.match(el('book-body').style.backgroundImage,/book-eba616b5d0c5/);assert.equal(el('book-body').style.clipPath,'inset(0 0 14%)');assert.equal(el('gallery-navigation').hidden,true);
assert.equal(el('page-clear').hidden,false);assert.equal(el('page-coquette').hidden,true);
el('tab-1').onclick();assert.equal(el('page-clear').hidden,true);assert.equal(el('page-coquette').hidden,false);assert.equal(document.activeElement.id,'coquette-title');
el('sample-organza').onclick();assert.equal(el('specimen-dialog').open,true);assert.match(el('specimen-image').src,/organza/);assert.equal(el('specimen-source').href,'https://ceciliebahnsen.com/pages/ss24');
el('close-specimen').onclick();assert.equal(el('specimen-dialog').open,false);assert.equal(document.activeElement.id,'sample-organza');
el('title-font').onclick();assert.equal(el('folio-content').attributes.get('data-title-font'),'fractured');el('title-font').onclick();assert.equal(el('folio-content').attributes.get('data-title-font'),'original');el('title-font').onclick();assert.equal(el('folio-content').attributes.get('data-title-font'),'engraved');
el('toggle-folio').onclick();assert.equal(el('folio-content').hidden,true);el('toggle-folio').onclick();assert.equal(el('folio-content').hidden,false);
scrub(0);el('sample-snow').onclick();assert.equal(el('specimen-dialog').open,false);assert.equal(el('folio-content').inert,true);
scrub(1);el('world').clientWidth=1440;el('stage').clientHeight=900;el('sequence').offsetHeight=2520;window.events.resize();assert.equal(el('page-clear').hidden,false);assert.equal(el('page-coquette').hidden,false);
console.log(`PASS ${states} geometric states; accepted mobile baselines unchanged; original desktop spread proportions; input/resize controllers; printed-page containment; mobile page selection, image dialog/focus, font cycle, blank comparison. Browser visual and touch QA not performed.`);
