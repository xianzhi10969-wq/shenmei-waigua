import {solveMotion,clamp,smoother,mix} from './motion.mjs';
import {createWaterRefraction} from './water-refraction.mjs';
const Q=new URLSearchParams(location.search),$=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),cinema=$('#cinema'),journey=$('#journey'),p3=$('#adopted-p3'),aperture=$('#aperture'),veil=$('#night-veil'),traveller=$('#traveller'),night=$('#night-solid'),baseline=$('#baseline'),v4=$('#v4');
function stageWidth(){return document.getElementById("stage").offsetWidth;}
const waterCanvas=document.createElement("canvas");waterCanvas.id="water-refraction";cinema.append(waterCanvas);
let water=null;try{if(!reduced.matches)water=createWaterRefraction(waterCanvas);}catch(e){console.warn("Water refraction fallback",e.message);}
if(water)document.body.classList.add("gpu-water");
let metrics,span=1,start=0,v4scale=1,lenis=null;
const chain=Q.has('chain')&&innerWidth>680;if(chain){document.body.classList.add('chain');v4.src=v4.dataset.src;}
function layout(){
 const mobile=innerWidth<=680,W=cinema.clientWidth,H=innerHeight,contentH=Math.max(H,p3.scrollHeight);
 cinema.style.height=contentH+'px';const scene=$('#stage .scene'),r=scene.getBoundingClientRect(),v=scene.viewBox.baseVal,s=stageWidth()/v.width;
 // Layout positions, independent of the current animated transform or document scroll.
 const stage=$('#stage'),gallery=$('.gallery'),sx=(W-stage.offsetWidth)/2,sy=stage.offsetTop-gallery.offsetTop;
 const rose={x:sx+((mobile?1199:511)-v.x)*s,y:sy+((mobile?277:238)-v.y)*s,size:(mobile?162:184)*s};
 const imageScale=Math.min(W,1440)/(mobile?390:1440);
 const origin={x:(mobile?70:382)*imageScale+(W-Math.min(W,1440))/2,y:H-(mobile?1060-859:811-548)*imageScale,size:(mobile?90:156)*imageScale};
 metrics={height:H,width:W,origin,rose};
 p3.style.setProperty('--rose-x',rose.x+'px');p3.style.setProperty('--rose-y',rose.y+'px');night.style.setProperty('--origin-x',origin.x+'px');night.style.setProperty('--origin-y',origin.y+'px');
 span=Math.round(H*(mobile?1.45:1.55));journey.style.height=(contentH+span)+'px';
 if(chain){v4scale=Math.min(1,W/1440);const fh=H/v4scale,limit=Math.max(0,1711-fh);baseline.style.height=(limit*v4scale+H)+'px';v4.style.height=fh+'px';v4.style.transform=`scale(${v4scale}) translateX(-50%)`;}
 start=journey.offsetTop;if(water&&$('#p2-art').complete)water.resize(W,H,$('#p2-art'),origin);render();
}
function render(){
 if(!metrics)return;let q=Q.has('still')?1:clamp((scrollY-start)/span);if(reduced.matches)q=q<.5?0:1;
 if(chain){try{v4.contentWindow.scrollTo(0,Math.min(scrollY,start)/v4scale);}catch{}cinema.style.visibility=scrollY<start?'hidden':'';}
 const m=solveMotion(q,metrics);
 if(water){water.draw(q);aperture.style.clipPath='none';p3.style.transform='none';}else{
 const ellipse=mix(.34,1,smoother(q/.65)),amp=Math.min(10,m.aperture*.025)*(1-smoother((q-.65)/.2));
 const points=[];for(let i=0;i<96;i++){const a=i/96*Math.PI*2,rr=m.aperture+amp*Math.sin(a*7-q*9)+amp*.4*Math.sin(a*11+q*7);points.push(`${(m.starX+Math.cos(a)*rr).toFixed(2)}px ${(m.starY+Math.sin(a)*rr*ellipse).toFixed(2)}px`);}
 aperture.style.clipPath=q>=.9?'none':`polygon(${points.join(',')})`;
 p3.style.transform=`translate3d(${m.cameraX.toFixed(3)}px,${m.cameraY.toFixed(3)}px,0) scale(${m.p3Scale.toFixed(5)})`;
 night.style.transform=`scale(${m.p2Scale.toFixed(5)})`;veil.style.opacity=m.nightOpacity;} 
 traveller.style.transform=`translate3d(${m.starX-78}px,${m.starY-78}px,0) scale(${m.starSize/156})`;traveller.style.opacity=m.starOpacity;
 traveller.querySelector('.ink').style.opacity=m.ink;traveller.querySelector('.cream').style.opacity=1-m.ink;
 p3.inert=!m.ready;$('.scroll-invitation').style.opacity=1-smoother(q/.12);
 document.documentElement.dataset.progress=q.toFixed(5);document.documentElement.dataset.ready=String(m.ready);
}
function go(y,immediate=false){y=Math.max(0,y);if(lenis)lenis.scrollTo(y,{immediate,duration:1.3,easing:smoother});else scrollTo({top:y,behavior:immediate||reduced.matches?'instant':'smooth'});}
let pending=false;addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;render()})}},{passive:true});addEventListener('resize',()=>requestAnimationFrame(layout));
cinema.addEventListener('keydown',e=>{if(e.target.matches('button,a,input,summary'))return;const target={Home:0,End:start+span,PageUp:scrollY-innerHeight*.8,PageDown:scrollY+innerHeight*.8,ArrowUp:scrollY-65,ArrowDown:scrollY+65};if(e.key in target){e.preventDefault();go(target[e.key]);}});
if(window.Lenis&&!reduced.matches&&matchMedia('(pointer:fine)').matches){lenis=new Lenis({autoRaf:false,lerp:.12,smoothWheel:true,syncTouch:false});function tick(t){lenis.raf(t);requestAnimationFrame(tick)}requestAnimationFrame(tick);}
await Promise.all([document.fonts.ready,...[...document.querySelectorAll('img')].map(i=>i.decode().catch(()=>{}))]);const base=new Image();base.src='assets/locked-pen-base.png';await base.decode();layout();document.body.classList.add('loaded');
if(Q.has('at'))go(start+clamp(Number(Q.get('at')))*span,true);
addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='review-scroll')return;go(start+clamp(e.data.progress)*span,e.data.immediate!==false);});
reduced.addEventListener('change',()=>{if(reduced.matches){lenis?.destroy();lenis=null;water?.destroy();water=null;waterCanvas.style.display='none';document.body.classList.remove('gpu-water');}render();});
new ResizeObserver(()=>requestAnimationFrame(layout)).observe($('#stage'));
