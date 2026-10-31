import {starMotion} from './star-motion.mjs';
import {paperMotion,clamp,ease} from './paper-motion.mjs';
import {attachGalleryGestures} from './gesture-adapter.mjs';
const $=s=>document.querySelector(s),Q=new URLSearchParams(location.search),NS='http://www.w3.org/2000/svg';
const cinema=$('#cinema'),journey=$('#journey'),p3=$('#adopted-p3'),paper=$('#aperture'),traveller=$('#traveller');
let starStart={x:0,y:0,size:90},starEnd={x:0,y:0};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const baseline=$('#baseline'),v4=$('#v4'),mstack=$('#mstack');let v4scale=1,bmode='',bLimit=0;
let span=1,start=0,height=innerHeight,holdNight=Q.has('night'),sceneRef=null;
const node=(tag,attrs,parent)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);parent?.append(n);return n;};
const svg=node('svg',{id:'paper-mask-defs','aria-hidden':'true'},cinema),defs=node('defs',{},svg);
const filter=node('filter',{id:'paper-black',x:'0%',y:'0%',width:'100%',height:'100%','color-interpolation-filters':'sRGB'},defs);
node('feColorMatrix',{type:'matrix',values:'0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'},filter);
const mask=node('mask',{id:'paper-cut',maskUnits:'userSpaceOnUse',maskContentUnits:'userSpaceOnUse',x:0,y:0,style:'mask-type:luminance'},defs);
const solid=node('rect',{x:0,y:0,fill:'white'},mask),holes=node('g',{},mask);
function layout(){
 height=innerHeight;const W=cinema.clientWidth,H=Math.max(height,p3.scrollHeight),mobile=innerWidth<=680;
 cinema.style.height=H+'px';span=Math.round(height*1.55);journey.style.height=(H+span)+'px';
 // P1→P2: desktop = protected v4 iframe untouched, scroll-synced (water-iris v2 ?chain=1 rule); phone = 390 originals stacked.
 const want=mobile?'m':'d';if(want!==bmode){bmode=want;document.body.dataset.base=want;if(!mobile&&!v4.src)v4.src=v4.dataset.src;}
 if(mobile){const k=W/390,docH=(844+1060)*k;bLimit=Math.max(0,docH-height);mstack.style.width=W+'px';const st=$('#mstar');st.style.width=st.style.height=90*k+'px';st.style.left=(70-45)*k+'px';st.style.top=(844+859-45)*k+'px';}
 else{v4scale=Math.min(1,W/1440);const fh=height/v4scale;bLimit=Math.max(0,1711-fh)*v4scale;v4.style.height=fh+'px';v4.style.transform=`scale(${v4scale}) translateX(-50%)`;}
 baseline.style.height=(bLimit+height)+'px';journey.style.marginTop=(-height)+'px';start=journey.offsetTop;
 mask.setAttribute('width',W);mask.setAttribute('height',H);solid.setAttribute('width',W);solid.setAttribute('height',H);
 const stage=$('#stage'),scene=stage.querySelector('.scene'),v=scene.viewBox.baseVal,s=stage.offsetWidth/v.width;
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

 render();
}
function render(){
 const b=Math.min(scrollY,start);if(bmode==='d'){try{v4.contentWindow.scrollTo(0,b/v4scale);}catch{}}else if(bmode==='m'){mstack.style.transform=`translate3d(0,${-b}px,0)`;}
 cinema.style.visibility=scrollY<start-1?'hidden':'';
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
let pending=false;addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;render();});}},{passive:true});
addEventListener('resize',()=>requestAnimationFrame(layout));
cinema.addEventListener('keydown',e=>{if(e.target.closest('button,a,input,summary'))return;const y={Home:0,End:start+span,PageUp:scrollY-height*.8,PageDown:scrollY+height*.8,ArrowUp:scrollY-65,ArrowDown:scrollY+65}[e.key];if(y!==undefined){e.preventDefault();go(y);}});
await Promise.all([document.fonts.ready,...[...document.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})),...['web','mobile'].flatMap(kind=>Array.from({length:kind==='web'?5:3},(_,i)=>[`${kind}-${i}-opening.png`,`extension-${kind}-${i}-opening.png`])).flat().map(file=>{const i=new Image();i.src=`assets/masks/${file}`;return i.decode();})]);
layout();document.body.classList.add('loaded');
if(Q.has('at'))go(start+clamp(Number(Q.get('at')))*span);
addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type==='review-scroll')go(start+clamp(e.data.progress)*span,e.data.immediate!==false);if(e.data?.type==='review-night'){holdNight=!!e.data.value;render();}});
reduced.addEventListener('change',render);new ResizeObserver(()=>requestAnimationFrame(layout)).observe($('#stage'));
attachGalleryGestures({cinema,stage:$('#stage'),p3,scrollTo:y=>go(y)});
if(parent!==window)parent.postMessage({type:'review-ready'},location.origin);
