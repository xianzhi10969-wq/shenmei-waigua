import {starMotion} from './star-motion.mjs';
import {paperMotion,clamp,ease} from './paper-motion.mjs';
import {attachGalleryGestures} from './gesture-adapter.mjs';
import {createMobileHomeStar} from './mobile-home-star.mjs?v=20261107-seam';
const $=s=>document.querySelector(s),Q=new URLSearchParams(location.search),NS='http://www.w3.org/2000/svg';
try{history.scrollRestoration='manual'}catch{}
const cinema=$('#cinema'),journey=$('#journey'),p3=$('#adopted-p3'),paper=$('#aperture'),traveller=$('#traveller');
let starStart={x:0,y:0,size:90},starEnd={x:0,y:0};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const baseline=$('#baseline'),v4=$('#v4'),mstack=$('#mstack');let v4scale=1,bmode='',bLimit=0;
let renderMobileStar=null;
let span=1,start=0,height=innerHeight,holdNight=Q.has('night'),sceneRef=null;
const needP3Now=Q.has('at')||Q.has('still')||Q.has('night');
let journeyHydrated=false,masksPrefetched=false,p3Signaled=false;
const node=(tag,attrs,parent)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);parent?.append(n);return n;};
const svg=node('svg',{id:'paper-mask-defs','aria-hidden':'true'},cinema),defs=node('defs',{},svg);
const filter=node('filter',{id:'paper-black',x:'0%',y:'0%',width:'100%',height:'100%','color-interpolation-filters':'sRGB'},defs);
node('feColorMatrix',{type:'matrix',values:'0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'},filter);
const mask=node('mask',{id:'paper-cut',maskUnits:'userSpaceOnUse',maskContentUnits:'userSpaceOnUse',x:0,y:0,style:'mask-type:luminance'},defs);
const solid=node('rect',{x:0,y:0,fill:'white'},mask),holes=node('g',{},mask);
const hydrate=el=>{if(!el)return;if(el.dataset.src&&!el.getAttribute('src'))el.setAttribute('src',el.dataset.src);if(el.dataset.srcset&&!el.getAttribute('srcset'))el.setAttribute('srcset',el.dataset.srcset);};
function hydrateMobileBase(){hydrate($('#mp1'));}
function hydrateMobileRest(){hydrate($('#mp2'));hydrate($('#mstar'));}
function hydrateJourney(){
 if(journeyHydrated)return;journeyHydrated=true;
 hydrate($('#p2-art'));
 document.querySelectorAll('#traveller img').forEach(hydrate);
 const source=document.querySelector('#night-solid source');hydrate(source);
}
function signalP3(){
 if(p3Signaled)return;p3Signaled=true;
 document.documentElement.dataset.p3Assets='1';
 hydrateJourney();
 prefetchMasks();
 window.dispatchEvent(new Event('p3-near'));
 // Gallery boot is sync on p3-near; rebuild paper holes once the scene exists.
 requestAnimationFrame(()=>layout());
}
function prefetchMasks(){
 if(masksPrefetched)return;masksPrefetched=true;
 for(const kind of [innerWidth<=680?'mobile':'web']){
  const n=kind==='web'?5:3;
  for(let i=0;i<n;i++){
   for(const filename of [`${kind}-${i}-opening.png`,`extension-${kind}-${i}-opening.png`]){
    const img=new Image();img.src=`assets/masks/${filename}`;
   }
  }
 }
}
function syncV4(){
 if(bmode!=='d'||!v4?.contentWindow)return;
 try{v4.contentWindow.scrollTo(0,Math.min(scrollY,start)/v4scale);}catch{}
}
v4?.addEventListener('load',syncV4);
function layout(){
 height=innerHeight;const W=cinema.clientWidth,H=Math.max(height,p3.scrollHeight||height),mobile=innerWidth<=680;
 cinema.style.height=H+'px';span=Math.round(height*1.55);journey.style.height=(H+span)+'px';
 // P1→P2: protected desktop v4; mobile original scenes + independent v4 star flight.
 const want=mobile?'m':'d';if(want!==bmode){bmode=want;document.body.dataset.base=want;if(mobile)hydrateMobileBase();if(!mobile&&!v4.src){v4.src=v4.dataset.src;}}
 if(mobile){const k=W/390,docH=(844+1060)*k;bLimit=Math.max(0,docH-height);mstack.style.width=W+'px';const st=$('#mstar');st.style.width=st.style.height=90*k+'px';st.style.left=(70-45)*k+'px';st.style.top=(844+859-45)*k+'px';
  if(!renderMobileStar){
   let scene=$('#mp1-scene');
   if(!scene){scene=document.createElement('div');scene.id='mp1-scene';$('#mp1').before(scene);scene.append($('#mp1'));}
   renderMobileStar=createMobileHomeStar(mstack,scene,st);
  }
 }
 else{v4scale=Math.min(1,W/1440);const fh=height/v4scale;bLimit=Math.max(0,1711-fh)*v4scale;v4.style.height=fh+'px';v4.style.transform=`scale(${v4scale}) translateX(-50%)`;}
 baseline.style.height=(bLimit+height)+'px';journey.style.marginTop=(-height)+'px';start=journey.offsetTop;
 mask.setAttribute('width',W);mask.setAttribute('height',H);solid.setAttribute('width',W);solid.setAttribute('height',H);
 const stage=$('#stage'),scene=stage?.querySelector('.scene');
 if(scene){
  const v=scene.viewBox.baseVal,s=stage.offsetWidth/v.width;
  const sx=(W-stage.offsetWidth)/2,sy=stage.offsetTop-$('.gallery').offsetTop;
  holes.setAttribute('transform',`translate(${sx-v.x*s} ${sy-v.y*s}) scale(${s})`);
  if(scene!==sceneRef){sceneRef=scene;holes.replaceChildren();
   for(const opening of scene.querySelectorAll('[data-opening]')){
    const id=opening.dataset.opening;
    for(const filename of [`${id}-opening.png`,`extension-${id}-opening.png`])node('image',{href:`assets/masks/${filename}`,x:0,y:0,width:1448,height:1086,filter:'url(#paper-black)'},holes);
   }
  }
  const imageScale=Math.min(W,1440)/(mobile?390:1440),x=(mobile?70:382)*imageScale+(W-Math.min(W,1440))/2,y=height-(mobile?201:263)*imageScale,size=(mobile?90:156)*imageScale;
  starStart={x,y,size};
  const rose=mobile?{x:1199,y:279}:{x:512,y:239};
  starEnd={x:sx+(rose.x-v.x)*s,y:sy+(rose.y-v.y)*s};
 } else {
  // Gallery not booted yet: keep star endpoints in a safe P2-ish place; holes stay empty until scene exists.
  const imageScale=Math.min(W,1440)/(mobile?390:1440),x=(mobile?70:382)*imageScale+(W-Math.min(W,1440))/2,y=height-(mobile?201:263)*imageScale,size=(mobile?90:156)*imageScale;
  starStart={x,y,size};starEnd={x:W/2,y:height*0.28};
 }
 render();
}
function render(){
 const b=Math.min(scrollY,start);if(bmode==='d'){syncV4();}else if(bmode==='m'){
  // offsetTop rounds to CSS pixels. Map its endpoint back to the exact image
  // height so 430px phones reach the seated star before the P3 handoff.
  const mobileScroll=start>0?b*bLimit/start:0;
  mstack.style.transform=`translate3d(0,${-mobileScroll}px,0)`;
  renderMobileStar(mobileScroll,bLimit,cinema.clientWidth,reduced.matches);
 }
 // paper.css forces child layers visible; hiding the parent alone lets the
 // deferred night layer cover P1. Opacity hides the entire composited scene.
 const beforeJourney=!p3Signaled||scrollY<start-1;
 cinema.style.visibility=beforeJourney?'hidden':'';
 cinema.style.opacity=beforeJourney?'0':'';
 cinema.style.pointerEvents=beforeJourney?'none':'';
 let q=Q.has('still')?1:clamp((scrollY-start)/span);if(reduced.matches)q=q<.5?0:1;
 const m=paperMotion(q,height,holdNight);
 paper.style.transform=`translate3d(0,${m.y}px,0)`;
 // One traveller remains above the rising paper. Color switches at the real paper edge.
 const star=starMotion(q,starStart,starEnd,m.y);
 const {x:sx,y:sy,size,cut}=star;
 traveller.style.transform=`translate3d(${sx-78}px,${sy-78}px,0) scale(${size/156})`;
 traveller.style.visibility=star.visible?'visible':'hidden';
 const cream=traveller.querySelector('.cream'),ink=traveller.querySelector('.ink');
 cream.style.opacity=1;ink.style.opacity=1;
 cream.style.clipPath=`inset(0 0 ${100-cut}% 0)`;
 ink.style.clipPath=`inset(${cut}% 0 0 0)`;
 document.documentElement.dataset.starX=sx.toFixed(3);document.documentElement.dataset.starY=sy.toFixed(3);
holes.setAttribute('opacity',1-m.covers);
 paper.style.setProperty('--paper-ui',m.ui);p3.inert=!m.ready;
 $('.scroll-invitation').style.opacity=1-ease(q/.12);
 Object.assign(document.documentElement.dataset,{progress:q.toFixed(5),ready:String(m.ready),paperY:m.y.toFixed(3),coverReveal:m.covers.toFixed(5),nightHeld:String(holdNight)});
 if(parent!==window)parent.postMessage({type:'review-progress',progress:q,ready:m.ready},location.origin);
}
const go=(y,immediate=true)=>scrollTo({top:Math.max(0,y),behavior:immediate||reduced.matches?'instant':'smooth'});
let userMoved=false, bootGuardUntil=0;
const markMoved=()=>{userMoved=true;};
for(const t of ['wheel','touchstart','keydown','pointerdown'])addEventListener(t,markMoved,{once:true,passive:true});
function lockP1(){if(Q.has('at')||userMoved)return;go(0);}
function maybePrefetch(){
 if(bmode==='m'&&scrollY>40)hydrateMobileRest();
 // A tall viewport / zoomed-out page must not prefetch P3 at scrollY=0.
 if(needP3Now||(scrollY>40&&scrollY>=Math.max(0,start-height*0.85)))signalP3();
}
let pending=false;addEventListener('scroll',()=>{
 if(!userMoved&&!Q.has('at')&&performance.now()<bootGuardUntil&&scrollY>1){go(0);return;}
 maybePrefetch();
 if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;render();});}
},{passive:true});
addEventListener('resize',()=>requestAnimationFrame(layout));
cinema.addEventListener('keydown',e=>{if(e.target.closest('button,a,input,summary'))return;const y={Home:0,End:start+span,PageUp:scrollY-height*.8,PageDown:scrollY+height*.8,ArrowUp:scrollY-65,ArrowDown:scrollY+65}[e.key];if(y!==undefined){e.preventDefault();go(y);}});
// P1 is already loading via baseline-boot. Gallery fonts and image decoding
// must not gate layout, scroll handlers or the first visible frame.
if(needP3Now)signalP3();
layout();lockP1();document.body.classList.add('loaded');
bootGuardUntil=performance.now()+1500;
if(Q.has('at'))go(start+clamp(Number(Q.get('at')))*span);
// Beat late scroll restoration / bfcache that would land on P2/P3.
requestAnimationFrame(()=>{lockP1();requestAnimationFrame(lockP1);});
const guard=setInterval(()=>{if(performance.now()>=bootGuardUntil){clearInterval(guard);return;}lockP1();},100);
addEventListener('pageshow',e=>{if(Q.has('at'))return;if(e.persisted){userMoved=false;bootGuardUntil=performance.now()+1500;}lockP1();});
maybePrefetch();
addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type==='review-scroll')go(start+clamp(e.data.progress)*span,e.data.immediate!==false);if(e.data?.type==='review-night'){holdNight=!!e.data.value;render();}});
reduced.addEventListener('change',render);new ResizeObserver(()=>requestAnimationFrame(layout)).observe($('#stage'));
attachGalleryGestures({cinema,stage:$('#stage'),p3,scrollTo:y=>go(y)});
if(parent!==window)parent.postMessage({type:'review-ready'},location.origin);

// Navigation adapter: use the existing scroll-driven transition and gallery state.
export function goToTopics() {
 userMoved = true; holdNight = false;
 signalP3(); layout(); go(start + span); render();
 cinema.focus({preventScroll:true});
}
