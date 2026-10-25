/* Fixed pen raster -> exact opening mask -> night glass -> eroded original art -> separate title. */
(() => {
 'use strict';
 const data=window.FEISHU_TOPICS;
 if(!data?.topics?.length) throw new Error('章节封面数据未载入');
 const topics=data.topics;
 const parameters=new URLSearchParams(location.search);
 const proof=parameters.has('proof');
 if(proof) document.body.classList.add('proof');
 if(parameters.get('layer')==='base')document.body.classList.add('source-only');
 if(parameters.get('layer')==='glass')document.body.classList.add('glass-only');
 const NS='http://www.w3.org/2000/svg';
 const XHTML='http://www.w3.org/1999/xhtml';
 const asset=path=>window.EMBEDDED_ASSETS?.[path]||path;
 const stage=document.getElementById('stage');
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const mobileQuery=matchMedia('(max-width:680px)');
 const geometries={
  web:[
   {id:'web-0',box:[120,425,233,842],title:[176,891],topic:5},
   {id:'web-1',box:[255,423,385,842],title:[320,891],topic:1},
   {id:'web-2',box:[417,415,604,842],title:[510,891],focus:true},
   {id:'web-3',box:[637,423,764,842],title:[700,891],topic:2},
   {id:'web-4',box:[786,425,897,842],title:[840,891],topic:3}
  ],
  mobile:[
   {id:'mobile-0',box:[1033,447,1088,848],title:[1058,901],topic:1},
   {id:'mobile-1',box:[1116,405,1280,848],title:[1198,901],focus:true},
   {id:'mobile-2',box:[1309,447,1363,848],title:[1334,901],topic:2}
  ]
 };
 let selected=Math.max(0,Math.min(topics.length-1,parameters.has('topic')?Number(parameters.get('topic'))||0:2));
 let embla=null;
 let mainViewport=null;
 let focusLabels=[];
 let artSlots=[];
 let cancelManual=()=>{};
 const mod=n=>(n%topics.length+topics.length)%topics.length;
 function svgNode(tag,attrs={},parent){const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(parent)parent.append(n);return n;}
 function image(href,attrs,parent){return svgNode('image',{href:asset(href),...attrs},parent);}
 function fullMask(defs,id,file){const m=svgNode('mask',{id,maskUnits:'userSpaceOnUse',x:0,y:0,width:1448,height:1086,style:'mask-type:alpha'},defs);image(file,{x:0,y:0,width:1448,height:1086},m);}
 function titleLayer(parent,slot){
  const [x,y]=slot.title;
  parent=svgNode('g',{mask:`url(#${slot.id}-title)`},parent);
  // Opaque paper patches cover placeholder text, wholly inside existing title plaques.
  image('assets/paper-patch.png',{x:x-43,y:y-22,width:86,height:44,preserveAspectRatio:'none'},parent);
  if(slot.focus){
   const group=svgNode('g',{'data-title-for':slot.id},parent);
   // All ribbon contours remain inside the existing title area. Raster contours never change.
   const w=slot.id.startsWith('mobile')?146:166;
   const left=x-w/2,right=x+w/2,top=y-20,bottom=y+24;
   const fold=12;
   svgNode('path',{d:`M${left+fold} ${top+5}L${left-7} ${top+5}L${left} ${top+21}L${left-7} ${bottom-3}L${left+fold} ${bottom-3}M${right-fold} ${top+5}L${right+7} ${top+5}L${right} ${top+21}L${right+7} ${bottom-3}L${right-fold} ${bottom-3}`,fill:'#f7f3e9',stroke:'#2a2722','stroke-width':1.1},group);
   svgNode('path',{d:`M${left+fold} ${top}Q${x} ${top-3} ${right-fold} ${top}L${right-fold} ${bottom}Q${x} ${bottom-3} ${left+fold} ${bottom}Z`,fill:'#faf6ec',stroke:'#2a2722','stroke-width':1.2},group);
   svgNode('path',{d:`M${left+fold} ${top}v${bottom-top}l-7 -4M${right-fold} ${top}v${bottom-top}l7 -4`,fill:'none',stroke:'#514b40','stroke-width':.7},group);
   const cn=svgNode('text',{x,y:y+2,class:'ribbon-cn'},group);
   const en=svgNode('text',{x,y:y+16,class:'ribbon-en'},group);
   focusLabels.push({cn,en,offset:slot.offset,focus:true});
  } else {
   const cn=svgNode('text',{x,y:y+1,class:'title-cn'},parent);
   const en=svgNode('text',{x,y:y+16,class:'title-en'},parent);
   focusLabels.push({cn,en,offset:slot.offset,focus:false});
  }
 }
 function render(){
  if(embla){selected=embla.selectedScrollSnap();embla.destroy();embla=null;}
  focusLabels=[];artSlots=[];mainViewport=null;stage.replaceChildren();
  const mobile=mobileQuery.matches&&!proof;
  const kinds=proof?['web','mobile']:[mobile?'mobile':'web'];
  const scene=svgNode('svg',{class:'scene',viewBox:proof?'0 0 1448 1086':mobile?'999 45 400 947':'35 0 945 995','aria-label':'象牙白石框内的原色专题封面'},stage);
  const defs=svgNode('defs',{},scene);
  const base=svgNode('g',{'data-layer':'locked-base'},scene);
  image('assets/locked-pen-base.png',{x:0,y:0,width:1448,height:1086},base);
  const glass=svgNode('g',{'data-layer':'night-glass'},scene);
  const art=svgNode('g',{'data-layer':'covers'},scene);
  const titles=svgNode('g',{'data-layer':'titles'},scene);
  for(const kind of kinds)for(const [slotIndex,originalSlot] of geometries[kind].entries()){
   const slot={...originalSlot,offset:slotIndex-(kind==='web'?2:1)};
   fullMask(defs,slot.id+'-outer',`assets/masks/${slot.id}-opening.png`);
   fullMask(defs,slot.id+'-inner',`assets/masks/${slot.id}-art.png`);
   fullMask(defs,slot.id+'-title',`assets/masks/${slot.id}-title.png`);
   svgNode('rect',{x:0,y:0,width:1448,height:1086,fill:'#131218',mask:`url(#${slot.id}-outer)`,'data-opening':slot.id},glass);
   const group=svgNode('g',{mask:`url(#${slot.id}-inner)`,'data-art-for':slot.id},art);
   const [x0,y0,x1,y1]=slot.box;
   const w=x1-x0,h=y1-y0;
   const frames=[-1,0,1].map(()=>image('',{x:x0,y:y0,width:w,height:h,preserveAspectRatio:'xMidYMid slice','aria-hidden':'true'},group));
   artSlots.push({slot,group,frames,x:x0,y:y0,w,h});
   titleLayer(titles,slot);
  }
  // One transparent motion driver moves the entire image sequence through all fixed masks.
  // Its step is one pane; each independently clipped image strip follows the same phase.
  const driverBox=proof||!mobile?[120,415,777,427,187]:[1033,405,330,443,164];
  const [dx,dy,dw,dh,stepWidth]=driverBox;
  const interaction=svgNode('g',{'data-layer':'interaction'},scene);
  const fo=svgNode('foreignObject',{x:dx,y:dy,width:dw,height:dh},interaction);
  const viewport=document.createElementNS(XHTML,'div');viewport.className='viewport motion-driver';viewport.tabIndex=0;
  viewport.setAttribute('role','region');viewport.setAttribute('aria-roledescription','轮播');viewport.setAttribute('aria-label','左右滑动整排专题封面，每次递进一格');
  viewport.style.setProperty('--step',stepWidth+'px');
  const container=document.createElementNS(XHTML,'div');container.className='slides';
  topics.forEach((t,i)=>{const slide=document.createElementNS(XHTML,'div');slide.className='slide';slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','专题');slide.setAttribute('aria-label',`${i+1} / ${topics.length} ${t.name}`);container.append(slide);});
  viewport.append(container);fo.append(viewport);mainViewport=viewport;
  if(!window.EmblaCarousel)throw new Error('横滑组件未载入');
  const options={align:'center',slidesToScroll:1,dragFree:false,skipSnaps:false,watchDrag:false,loop:true,containScroll:false,duration:reduceMotion.matches?0:27,startIndex:selected};
  embla=window.EmblaCarousel(mainViewport,options);
  let manual=false,gesture=null,finishFrame=null;
  function syncPosition(){
   if(manual)return;
   const engine=embla.internalEngine();
   const unit=engine.scrollSnaps[0]-engine.scrollSnaps[1];
   const position=(engine.scrollSnaps[0]-engine.offsetLocation.get())/unit;
   paint(position);
  }
  embla.on('scroll',syncPosition);
  embla.on('select',()=>{selected=embla.selectedScrollSnap();update();});
  embla.on('settle',()=>{document.getElementById('status').textContent=`第 ${selected+1} 个专题：${topics[selected].name}`;});
  mainViewport.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.key==='ArrowRight'){e.preventDefault();step(1);}});
  // A gesture is capped before inertia: even a long fast fling advances one adjacent pane.
  cancelManual=()=>{if(finishFrame)cancelAnimationFrame(finishFrame);manual=false;gesture=null;embla.scrollTo(selected,true);paint(selected);};
  mainViewport.addEventListener('pointerdown',e=>{
   if(e.button!==0)return;
   cancelManual();
   gesture={id:e.pointerId,x:e.clientX,y:e.clientY,start:selected,position:selected,horizontal:false};
   mainViewport.setPointerCapture(e.pointerId);
  });
  mainViewport.addEventListener('pointermove',e=>{
   if(!gesture||e.pointerId!==gesture.id)return;
   const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
   if(!gesture.horizontal){if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy))return;gesture.horizontal=true;manual=true;}
   e.preventDefault();
   const scale=mainViewport.getBoundingClientRect().width/dw;
   gesture.position=gesture.start-Math.max(-1,Math.min(1,dx/(stepWidth*scale)));
   paint(gesture.position);
  },{passive:false});
  function release(e,cancelled=false){
   if(!gesture||e.pointerId!==gesture.id)return;
   const g=gesture;gesture=null;
   if(mainViewport.hasPointerCapture(e.pointerId))mainViewport.releasePointerCapture(e.pointerId);
   if(!g.horizontal){manual=false;return;}
   const dx=e.clientX-g.x;
   const target=g.start+(cancelled||Math.abs(dx)<18?0:dx<0?1:-1);
   const from=g.position,start=performance.now(),duration=reduceMotion.matches?0:300;
   selected=mod(target);update();manual=true;
   function finish(now){const t=duration?Math.min(1,(now-start)/duration):1;paint(from+(target-from)*(1-Math.pow(1-t,3)));if(t<1)finishFrame=requestAnimationFrame(finish);else{embla.scrollTo(selected,true);paint(target);manual=false;finishFrame=null;document.getElementById('status').textContent=`第 ${selected+1} 个专题：${topics[selected].name}`;}}
   finishFrame=requestAnimationFrame(finish);
  }
  mainViewport.addEventListener('pointerup',e=>release(e));
  mainViewport.addEventListener('pointercancel',e=>release(e,true));
  syncPosition();update();
 }
 function paint(position){
  for(const pane of artSlots){
   const p=position+pane.slot.offset;
   const first=Math.floor(p),fraction=p-first;
   pane.group.setAttribute('data-order',String(mod(Math.round(p))+1));
   for(let j=0;j<3;j++){
    const index=mod(first+j-1),frame=pane.frames[j],t=topics[index];
    if(frame.getAttribute('data-topic-id')!==t.id){frame.setAttribute('href',asset(t.cover));frame.setAttribute('data-topic-id',t.id);frame.setAttribute('aria-label',`${t.name} · ${t.credit}`);}
    frame.setAttribute('x',String(pane.x+(j-1-fraction)*pane.w));
   }
  }
 }
 function update(){
  const t=topics[selected];
  focusLabels.forEach(({cn,en,offset,focus})=>{const topic=topics[mod(selected+offset)];cn.textContent=topic.name;en.textContent=topic.english;const maxLength=focus?17:12;if(topic.english.length>maxLength){en.setAttribute('textLength',focus?116:76);en.setAttribute('lengthAdjust','spacingAndGlyphs');}else{en.removeAttribute('textLength');en.removeAttribute('lengthAdjust');}});
  document.getElementById('currentNumber').textContent=String(selected+1).padStart(2,'0');
  document.getElementById('definition').textContent=t.definition;
  document.getElementById('credit').textContent=t.credit;
  document.getElementById('previous').disabled=false;
  document.getElementById('next').disabled=false;
  if(embla)embla.slideNodes().forEach((node,i)=>node.setAttribute('aria-hidden',String(i!==selected)));
 }
 function step(delta){if(!embla)return;cancelManual();if(delta<0)embla.scrollPrev(reduceMotion.matches);else embla.scrollNext(reduceMotion.matches);}
 document.getElementById('previous').addEventListener('click',()=>step(-1));
 document.getElementById('next').addEventListener('click',()=>step(1));
 document.addEventListener('keydown',e=>{if(e.target.closest('.viewport')||e.altKey||e.metaKey||e.ctrlKey)return;if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.key==='ArrowRight'){e.preventDefault();step(1);}});
 mobileQuery.addEventListener('change',render);
 // Review controls are available only on the comparison sheet, not in the gallery.
 if(proof){const tools=document.createElement('nav');tools.className='proof-tools';tools.innerHTML='<a href="?proof&layer=base">原始底图</a><a href="?proof&layer=glass">窗洞蒙版</a><a href="?proof">完整分层</a><a href="./">打开图录</a>';document.body.append(tools);}
 window.GALLERY_REVIEW={get selected(){return selected;},get topic(){return topics[selected];},step,geometry:geometries,source:data.source};
 render();
})();
