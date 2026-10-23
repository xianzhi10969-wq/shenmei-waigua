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
 let selected=Math.max(0,Math.min(topics.length-1,Number(parameters.get('topic'))||0));
 let embla=null;
 let mainViewport=null;
 let focusLabels=[];
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
   focusLabels.push({cn,en});
  } else {
   const t=topics[slot.topic];
   svgNode('text',{x,y:y+1,class:'title-cn'},parent).textContent=t.name;
   const en=svgNode('text',{x,y:y+16,class:'title-en'},parent);
   en.textContent=t.english;
   if(t.english.length>12){en.setAttribute('textLength',76);en.setAttribute('lengthAdjust','spacingAndGlyphs');}
  }
 }
 function render(){
  if(embla){selected=embla.selectedScrollSnap();embla.destroy();embla=null;}
  focusLabels=[];mainViewport=null;stage.replaceChildren();
  const mobile=mobileQuery.matches&&!proof;
  const kinds=proof?['web','mobile']:[mobile?'mobile':'web'];
  const scene=svgNode('svg',{class:'scene',viewBox:proof?'0 0 1448 1086':mobile?'999 45 400 947':'35 0 945 995','aria-label':'象牙白石框内的原色专题封面'},stage);
  const defs=svgNode('defs',{},scene);
  const base=svgNode('g',{'data-layer':'locked-base'},scene);
  image('assets/locked-pen-base.png',{x:0,y:0,width:1448,height:1086},base);
  const glass=svgNode('g',{'data-layer':'night-glass'},scene);
  const art=svgNode('g',{'data-layer':'covers'},scene);
  const titles=svgNode('g',{'data-layer':'titles'},scene);
  const viewports=[];
  for(const kind of kinds)for(const slot of geometries[kind]){
   fullMask(defs,slot.id+'-outer',`assets/masks/${slot.id}-opening.png`);
   fullMask(defs,slot.id+'-inner',`assets/masks/${slot.id}-art.png`);
   fullMask(defs,slot.id+'-title',`assets/masks/${slot.id}-title.png`);
   svgNode('rect',{x:0,y:0,width:1448,height:1086,fill:'#131218',mask:`url(#${slot.id}-outer)`,'data-opening':slot.id},glass);
   const group=svgNode('g',{mask:`url(#${slot.id}-inner)`,'data-art-for':slot.id},art);
   const [x0,y0,x1,y1]=slot.box;
   const w=x1-x0,h=y1-y0;
   if(slot.focus){
    const fo=svgNode('foreignObject',{x:x0,y:y0,width:w,height:h},group);
    const viewport=document.createElementNS(XHTML,'div');viewport.className='viewport';viewport.tabIndex=0;
    viewport.setAttribute('role','region');viewport.setAttribute('aria-roledescription','轮播');viewport.setAttribute('aria-label','左右滑动切换专题封面，方向键逐格翻阅');
    const container=document.createElementNS(XHTML,'div');container.className='slides';
    for(const [i,t] of topics.entries()){
     const slide=document.createElementNS(XHTML,'div');slide.className='slide';slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','专题');slide.setAttribute('aria-label',`${i+1} / ${topics.length} ${t.name}`);
     const img=document.createElementNS(XHTML,'img');img.src=asset(t.cover);img.alt=`${t.name} · ${t.credit}`;img.draggable=false;
     img.decoding='async';img.loading=Math.abs(i-selected)<2?'eager':'lazy';
     slide.append(img);container.append(slide);
    }
    viewport.append(container);fo.append(viewport);viewports.push(viewport);
   }else{
    const t=topics[slot.topic];image(t.cover,{x:x0,y:y0,width:w,height:h,preserveAspectRatio:'xMidYMid slice','data-topic-id':t.id},group);
   }
   titleLayer(titles,slot);
  }
  if(!window.EmblaCarousel)throw new Error('横滑组件未载入');
  mainViewport=viewports[0];
  const options={align:'center',slidesToScroll:1,dragFree:false,skipSnaps:false,loop:false,containScroll:'keepSnaps',duration:reduceMotion.matches?0:27,startIndex:selected};
  embla=window.EmblaCarousel(mainViewport,options);
  const linked=viewports.slice(1).map(v=>window.EmblaCarousel(v,{...options,watchDrag:false}));
  embla.on('select',()=>{selected=embla.selectedScrollSnap();linked.forEach(api=>api.scrollTo(selected,true));update();});
  embla.on('settle',()=>{document.getElementById('status').textContent=`第 ${selected+1} 个专题：${topics[selected].name}`;});
  mainViewport.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.key==='ArrowRight'){e.preventDefault();step(1);}});
  // Keep one gesture bounded to one adjacent snap, including high-velocity touch flings.
  let dragStartIndex=selected;
  embla.on('pointerDown',()=>{dragStartIndex=embla.selectedScrollSnap();});
  embla.on('pointerUp',()=>{requestAnimationFrame(()=>{const target=embla.selectedScrollSnap();if(Math.abs(target-dragStartIndex)>1)embla.scrollTo(dragStartIndex+Math.sign(target-dragStartIndex),reduceMotion.matches);});});
  update();
 }
 function update(){
  const t=topics[selected];
  focusLabels.forEach(({cn,en})=>{cn.textContent=t.name;en.textContent=t.english;if(t.english.length>17){en.setAttribute('textLength',116);en.setAttribute('lengthAdjust','spacingAndGlyphs');}else{en.removeAttribute('textLength');en.removeAttribute('lengthAdjust');}});
  document.getElementById('currentNumber').textContent=String(selected+1).padStart(2,'0');
  document.getElementById('definition').textContent=t.definition;
  document.getElementById('credit').textContent=t.credit;
  document.getElementById('previous').disabled=selected===0;
  document.getElementById('next').disabled=selected===topics.length-1;
  if(embla)embla.slideNodes().forEach((node,i)=>node.setAttribute('aria-hidden',String(i!==selected)));
 }
 function step(delta){if(!embla)return;embla.scrollTo(Math.min(topics.length-1,Math.max(0,embla.selectedScrollSnap()+delta)),reduceMotion.matches);}
 document.getElementById('previous').addEventListener('click',()=>step(-1));
 document.getElementById('next').addEventListener('click',()=>step(1));
 document.addEventListener('keydown',e=>{if(e.target.closest('.viewport')||e.altKey||e.metaKey||e.ctrlKey)return;if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.key==='ArrowRight'){e.preventDefault();step(1);}});
 mobileQuery.addEventListener('change',render);
 // Review controls are available only on the comparison sheet, not in the gallery.
 if(proof){const tools=document.createElement('nav');tools.className='proof-tools';tools.innerHTML='<a href="?proof&layer=base">原始底图</a><a href="?proof&layer=glass">窗洞蒙版</a><a href="?proof">完整分层</a><a href="./">打开图录</a>';document.body.append(tools);}
 window.GALLERY_REVIEW={get selected(){return selected;},get topic(){return topics[selected];},step,geometry:geometries,source:data.source};
 render();
})();
