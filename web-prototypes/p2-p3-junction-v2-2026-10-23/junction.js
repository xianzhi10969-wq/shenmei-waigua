import {solveMotion} from './motion.mjs';
/* 新目录里的接缝适配器；v4 iframe 的源码、图层、动效及着陆时刻不变。 */
const Q=new URLSearchParams(location.search),$=s=>document.querySelector(s);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=t=>Math.max(0,Math.min(1,t)),smooth=t=>{t=clamp(t);return t*t*(3-2*t)},lerp=(a,b,t)=>a+(b-a)*t;
const [FRAMES,DATA]=await Promise.all([fetch('assets/frame-geometry.json').then(r=>r.json()),fetch('assets/topics.json').then(r=>r.json())]);
const TOPICS=DATA.topics,N=TOPICS.length,star=$('#traveller'),win=$('#window');
if(Q.has('chain')){document.body.classList.add('chain');$('#baseline iframe').src=$('#baseline iframe').dataset.src;}
if(Q.has('lineonly'))document.body.classList.add('lineonly');
let mobile=false,idx=1,geo,scale=1,slotEls=[],v4scale=1,phase=0;
const waterArt=new Image();waterArt.src='assets/water-ink-paper.png';await waterArt.decode();
const p2Image=$('#p2 img'),veil=$('#veil'),ripple=$('#sill-ripple');
const rippleArt=document.createElement('canvas'),waterMask=document.createElement('canvas');
let sceneHeight=innerHeight,span=Math.round(innerHeight*1.6);
buildRipple();
function buildRipple(){
 // 已有专色水纹只分离纸色 alpha，曲线形状与取样位置不重绘。
 waterMask.width=waterArt.width;waterMask.height=waterArt.height;
 const wc=waterMask.getContext('2d',{willReadFrequently:true});wc.drawImage(waterArt,0,0);
 const d=wc.getImageData(0,0,waterMask.width,waterMask.height);
 for(let i=0;i<d.data.length;i+=4)d.data[i+3]=d.data[i]<124?255:0;
 wc.putImageData(d,0,0);
 const sy=Math.round(waterArt.height*.645),sh=Math.round(waterArt.height*.12);
 rippleArt.width=waterArt.width;rippleArt.height=sh;
 rippleArt.getContext('2d').drawImage(waterMask,0,sy,waterArt.width,sh,0,0,waterArt.width,sh);
}
function canvasSize(c){const d=Math.min(2,devicePixelRatio||1),w=$('#stage').clientWidth,h=$('#stage').clientHeight;c.width=Math.round(w*d);c.height=Math.round(h*d);const ctx=c.getContext('2d');ctx.setTransform(d,0,0,d,0,0);return ctx;}
const wrap=n=>(n%N+N)%N;
function paint(){
 const middle=mobile?1:2;
 slotEls.forEach((s,i)=>{const t=TOPICS[wrap(idx+i-middle)];s.img.src='../p3-stained-glass-v3-2026-10-23/'+t.pane;s.img.alt=t.zh+' · '+t.credit;
  s.title.replaceChildren();if(i===middle){const zh=document.createElement('span'),la=document.createElement('small');zh.textContent=t.zh;la.textContent=t.la.toUpperCase();s.title.append(zh,la);}});
 const t=TOPICS[idx];$('#counter').textContent=`${t.seq} / ${N}　${t.zh}`;
}
function snap(n){idx=wrap(idx+n);paint()}
function layout(){
 mobile=innerWidth<700;geo=FRAMES[mobile?'mobile':'web'];
 scale=Math.min((innerWidth-(mobile?24:100))/geo.size[0],(innerHeight-110)/geo.size[1]);
 scale=Math.max(.2,scale);win.style.width=geo.size[0]*scale+'px';win.style.height=geo.size[1]*scale+'px';
 $('#frame').src=`assets/frame-${mobile?'mobile':'web'}.svg`;
 $('#panes').replaceChildren();$('#titles').replaceChildren();slotEls=[];
 geo.slots.forEach((s,i)=>{const d=document.createElement('div'),im=new Image(),title=document.createElement('div');d.append(im);$('#panes').append(d);$('#titles').append(title);
  const [x,y,w,h]=s.fill_box;Object.assign(d.style,{left:x*scale+'px',top:y*scale+'px',width:w*scale+'px',height:h*scale+'px',clipPath:`polygon(0 ${48*scale}px,26% ${10*scale}px,50% 0,74% ${10*scale}px,100% ${48*scale}px,100% 100%,0 100%)`});
  const [tx,ty,tw,th]=s.cart_box;Object.assign(title.style,{left:tx*scale+'px',top:ty*scale+'px',width:tw*scale+'px',height:th*scale+'px',fontSize:Math.max(14,th*scale*.27)+'px'});
  slotEls.push({el:d,img:im,title});});
 v4scale=Math.min(1,innerWidth/1440);$('#baseline').style.height=1711*v4scale+'px';const f=$('#baseline iframe');f.style.height=innerHeight/v4scale+'px';f.style.transform=`scale(${v4scale}) translateX(-50%)`;
 sceneHeight=$('#stage').clientHeight;span=Math.round(sceneHeight*1.6);$('#journey').style.height=(document.body.classList.contains('lineonly')?sceneHeight:sceneHeight+span)+'px';
 canvasSize(veil);canvasSize(ripple);paint();update();
}
function update(){
 const chain=document.body.classList.contains('chain'),T=$('#journey').offsetTop;
 let q=clamp((scrollY-T)/span);if(document.body.classList.contains('lineonly'))q=1;
 if(reduce)q=q<.5?0:1;
 if(chain){const f=$('#baseline iframe');try{f.contentWindow.scrollTo(0,Math.max(0,Math.min(scrollY,T))/v4scale);f.contentDocument.querySelector('#p2star').style.visibility=scrollY>T?'hidden':'';}catch{};$('#stage').style.visibility=scrollY<T?'hidden':'';}
 const width=$('#stage').clientWidth,H=sceneHeight,wr=win.getBoundingClientRect(),sr=$('#stage').getBoundingClientRect();
 const imageScale=width/p2Image.naturalWidth,imageH=p2Image.naturalHeight*imageScale,p2Top=H-imageH;
 const origin=mobile?{x:70*width/390,y:p2Top+Math.min(859,p2Image.naturalHeight*.77)*width/390,size:90*width/390}:{x:382*width/1440,y:p2Top+548*width/1440,size:156*width/1440};
 const rose={x:wr.left-sr.left+geo.rose[0]*scale,y:wr.top-sr.top+geo.rose[1]*scale,size:Math.min(geo.rose[2]*1.7*scale,mobile?76:126)};
 const sill={y:wr.top-sr.top+(geo.size[1]-20)*scale,width:wr.width*.985};
 const stripHeight=mobile?235:Math.min(330,H*.34),m=solveMotion(q,{height:H,stripHeight,origin,rose,sill,width});
 const ctx=veil.getContext('2d');ctx.clearRect(0,0,width,H);
 if(q<.66){
  ctx.save();ctx.beginPath();ctx.rect(0,0,width,Math.max(0,m.veilY));ctx.clip();ctx.fillStyle='#1E1E1E';ctx.fillRect(0,0,width,H);
  // P2 只移动镜头，不重绘、不改色，来源仍是原静态素材。
  const py=p2Top-m.p2Shift;if(py>0){ctx.fillStyle='#F6F3ED';ctx.fillRect(0,0,width,py);}
  ctx.drawImage(p2Image,0,py,width,imageH);ctx.restore();ctx.drawImage(waterMask,0,m.veilY,width,stripHeight);
 }
 const rc=ripple.getContext('2d');rc.clearRect(0,0,width,H);
 if(m.rippleVisible)rc.drawImage(rippleArt,(width-m.rippleWidth)/2,m.rippleY-m.rippleHeight/2,m.rippleWidth,m.rippleHeight);
 star.hidden=document.body.classList.contains('lineonly')||(chain&&scrollY<=T);
 Object.assign(star.style,{left:m.starX+'px',top:m.starY+'px',width:m.starSize+'px',height:m.starSize+'px'});
 const inRose=Math.hypot((m.starX-rose.x)/(geo.rose[2]*scale),(m.starY-rose.y)/(geo.rose[2]*scale))<1;
 const onNight=q<.66&&m.starY<m.veilY+stripHeight*.44,mode=(onNight||inRose)?'cream':'ink';
 const src='../p3-stained-glass-v3-2026-10-23/layers/star-B-'+mode+'.svg';if(!star.src.endsWith('star-B-'+mode+'.svg'))star.src=src;
 document.querySelectorAll('.browsing button').forEach(b=>b.disabled=!m.ready);win.inert=!m.ready;
 document.documentElement.dataset.phase=q.toFixed(4);document.documentElement.dataset.ready=m.ready?'true':'false';
}
// 固定镜头获得键盘焦点后，纵向按键仍滚动文档，不滚进内部图层。
$('#stage').addEventListener('keydown',e=>{
 const T=$('#journey').offsetTop;
 const positions={Home:0,End:T+span,PageUp:scrollY-sceneHeight*.85,PageDown:scrollY+sceneHeight*.85,ArrowUp:scrollY-60,ArrowDown:scrollY+60};
 if(e.key in positions){e.preventDefault();scrollTo(0,Math.max(0,positions[e.key]));update();}
});
$('#prev').onclick=()=>snap(-1);$('#next').onclick=()=>snap(1);
addEventListener('keydown',e=>{if(document.documentElement.dataset.ready!=='true')return;if(e.key==='ArrowLeft')snap(-1);if(e.key==='ArrowRight')snap(1)});
let px=null;win.addEventListener('pointerdown',e=>{px=e.clientX;win.setPointerCapture?.(e.pointerId)});win.addEventListener('pointerup',e=>{if(px!==null&&Math.abs(e.clientX-px)>36)snap(e.clientX<px?1:-1);px=null});win.addEventListener('pointercancel',()=>px=null);
let locked=false;win.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)*1.2||Math.abs(e.deltaX)<8)return;e.preventDefault();if(!locked){snap(e.deltaX>0?1:-1);locked=true;setTimeout(()=>locked=false,280)}},{passive:false});
let queued=false;addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;update()})}},{passive:true});addEventListener('resize',layout);
$('#baseline iframe').addEventListener('load',update);
await Promise.all([...document.querySelectorAll('#p2 img')].map(im=>im.decode().catch(()=>{})));
layout();
await Promise.all([$('#frame').decode(),...slotEls.map(s=>s.img.decode()),document.fonts.ready]);
// QA 导航只定位滚动，不替换运行中的动效状态；无时间轴或调试条进入产品。
if(Q.has('at')){const at=clamp(Number(Q.get('at')));scrollTo(0,$('#journey').offsetTop+at*span);update();}
document.body.classList.add('loaded');update();
if(reduce){document.documentElement.dataset.reducedMotion='true';}
