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
function paintWater(){
 const c=$('#junction canvas'),r=$('#junction').getBoundingClientRect(),dpr=3;c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);c.style.width='100%';c.style.height='100%';
 const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(waterArt,0,0,c.width,c.height);const im=ctx.getImageData(0,0,c.width,c.height);
 // 图像生成只负责线的形，展示时严格落成两种专色，排除生成图固有纸纹与灰场。
 for(let i=0;i<im.data.length;i+=4){const v=(im.data[i]+im.data[i+1]+im.data[i+2])/3<124?[30,30,30]:[246,243,237];im.data[i]=v[0];im.data[i+1]=v[1];im.data[i+2]=v[2];im.data[i+3]=255;}ctx.putImageData(im,0,0);
}
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
 paintWater();paint();update();
}
function rosePoint(){const r=win.getBoundingClientRect();return{x:r.left+geo.rose[0]*scale,y:r.top+scrollY+geo.rose[1]*scale}}
function update(){
 const chain=document.body.classList.contains('chain'),p2=chain?$('#baseline'):$('#p2'),r=p2.getBoundingClientRect(),top=r.top+scrollY;
 const H=p2.offsetHeight,stepEnd=top+H-innerHeight;
 if(chain){const f=$('#baseline iframe');try{f.contentWindow.scrollTo(0,Math.max(0,Math.min(scrollY,stepEnd))/v4scale);f.contentDocument.querySelector('#p2star').style.visibility=scrollY>stepEnd?'hidden':'';}catch{} }
 const target=rosePoint(),P=$('#p3').offsetTop;
 const k=mobile?innerWidth/390:Math.min(innerWidth,1440)/1440;
 const origin=chain?{x:(innerWidth-1440*v4scale)/2+382*v4scale,y:1448*v4scale}:{x:mobile?70*k:(innerWidth-1440*k)/2+382*k,y:mobile?859*k:548*k};
 // 新运动只在 P2 完成之后生效；反向滚动完全由当前位置求值。
 const begin=chain?stepEnd:Math.max(0,H-innerHeight*.88),end=P-24;
 const t=smooth((scrollY-begin)/Math.max(1,end-begin));phase=t;
 if(chain&&scrollY<=stepEnd){star.hidden=true;return;}star.hidden=document.body.classList.contains('lineonly');
 const x=lerp(origin.x,target.x,smooth(t*1.7)),y=lerp(origin.y,target.y,t);
 const size=lerp((mobile?90:156)*k,Math.min(geo.rose[2]*1.7*scale,mobile?76:126),t);
 Object.assign(star.style,{left:x+'px',top:y+'px',width:size+'px',height:size+'px'});
 // 色彩交接只换原有双色星资产，不使用灰色混合或透明渐变。
 const ink=t>.17&&t<.91;
 star.src='../p3-stained-glass-v3-2026-10-23/layers/star-B-'+(ink?'ink':'cream')+'.svg';
 document.documentElement.dataset.phase=t.toFixed(3);

}
$('#prev').onclick=()=>snap(-1);$('#next').onclick=()=>snap(1);
addEventListener('keydown',e=>{if(e.key==='ArrowLeft')snap(-1);if(e.key==='ArrowRight')snap(1)});
let px=null;win.addEventListener('pointerdown',e=>{px=e.clientX;win.setPointerCapture?.(e.pointerId)});win.addEventListener('pointerup',e=>{if(px!==null&&Math.abs(e.clientX-px)>36)snap(e.clientX<px?1:-1);px=null});win.addEventListener('pointercancel',()=>px=null);
let locked=false;win.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)*1.2||Math.abs(e.deltaX)<8)return;e.preventDefault();if(!locked){snap(e.deltaX>0?1:-1);locked=true;setTimeout(()=>locked=false,280)}},{passive:false});
let queued=false;addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;update()})}},{passive:true});addEventListener('resize',layout);
$('#baseline iframe').addEventListener('load',update);
await Promise.all([...document.querySelectorAll('#p2 img')].map(im=>im.decode().catch(()=>{})));
layout();
// QA 导航只定位滚动，不替换运行中的动效状态；无时间轴或调试条进入产品。
if(Q.has('at')){const at=Number(Q.get('at'));requestAnimationFrame(()=>{scrollTo(0,lerp(Math.max(0,$('#p2').offsetHeight-innerHeight*.88),$('#p3').offsetTop-24,at));update()});}
if(reduce){document.documentElement.dataset.reducedMotion='true';}
