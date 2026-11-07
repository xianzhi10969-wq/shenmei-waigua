/* Clickable active topic and viewport fitting for the existing P3 composition. */
(()=>{
 const p3=document.querySelector('#adopted-p3');if(!p3)return;
 const gallery=p3.querySelector('.gallery'),stage=p3.querySelector('#stage'),header=gallery.querySelector('header');
 const all=document.createElement('a');all.className='all-topics-link';all.href='/#/chapters';all.textContent='全部专题 ↗';
 all.setAttribute('aria-label','查看全部24个专题');header.firstElementChild.replaceWith(all);
 const NS='http://www.w3.org/2000/svg';let frame=0,gesture=null,suppressClick=false;
 const credits=gallery.querySelector('.credits');
 function fit(){
  frame=0;const scene=stage.querySelector('.scene');if(!scene)return;
  const css=getComputedStyle(gallery),height=innerHeight;
  let overhead=parseFloat(css.paddingTop)+parseFloat(css.paddingBottom);
  for(const element of gallery.children){
   if(element===stage||getComputedStyle(element).position==='absolute')continue;
   const s=getComputedStyle(element);overhead+=(element===credits?credits.querySelector("summary").getBoundingClientRect().height:element.getBoundingClientRect().height)+parseFloat(s.marginTop||0)+parseFloat(s.marginBottom||0);
  }
  const st=getComputedStyle(stage);overhead+=parseFloat(st.marginTop||0)+parseFloat(st.marginBottom||0);
  const view=scene.viewBox.baseVal,ratio=view.width/view.height;
  const width=Math.max(0,Math.min(gallery.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight),(height-overhead-2)*ratio));
  if(Math.abs(stage.getBoundingClientRect().width-width)>.25)stage.style.width=width+'px';
  gallery.style.minHeight=height+'px';
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(fit);}
 function attach(){
  const scene=stage.querySelector('.scene');if(!scene)return;
  if(!scene.querySelector('.topic-hit')){
   const mobile=scene.viewBox.baseVal.x>900;
   const link=document.createElementNS(NS,'a');link.classList.add('topic-hit');link.setAttribute('tabindex','0');
   const hit=document.createElementNS(NS,'rect');
   Object.entries(mobile?{x:1116,y:405,width:164,height:540}:{x:417,y:415,width:187,height:522}).forEach(([k,v])=>hit.setAttribute(k,v));
   hit.setAttribute('fill','transparent');hit.setAttribute('pointer-events','all');link.append(hit);scene.append(link);
   link.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();location.assign(link.getAttribute('href'));}});
  }
  update();schedule();
 }
 function update(){
  const topic=window.GALLERY_REVIEW?.topic;if(!topic)return;
  const link=stage.querySelector('.topic-hit');if(link){link.setAttribute('href','/#/chapter/'+topic.id);link.setAttribute('aria-label','进入「'+topic.name+'」专题');}
  for(const cn of stage.querySelectorAll('.ribbon-cn')){
   cn.dataset.long=String(cn.textContent.length>3);
   const group=cn.closest('[data-title-for]'),mobile=group.dataset.titleFor.startsWith('mobile');
   cn.setAttribute('y',mobile?907:897);
   group.querySelector('.ribbon-en').setAttribute('y',mobile?921:911);
  }
 }
 // A swipe still belongs to the gallery; only an actual tap follows the link.
 stage.addEventListener('pointerdown',e=>{gesture={x:e.clientX,y:e.clientY,id:e.pointerId};suppressClick=false;},{capture:true});
 stage.addEventListener('pointermove',e=>{if(gesture?.id===e.pointerId&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>7)suppressClick=true;},{capture:true});
 stage.addEventListener('pointercancel',()=>{suppressClick=true;gesture=null;},{capture:true});
 stage.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},{capture:true});
 new MutationObserver(attach).observe(stage,{childList:true});
 new ResizeObserver(schedule).observe(gallery.querySelector('#definition'));
 new ResizeObserver(schedule).observe(header);
 credits.addEventListener('toggle',()=>{schedule();requestAnimationFrame(()=>dispatchEvent(new Event('resize')));});addEventListener('resize',()=>{update();schedule();});
 addEventListener('gallery-position',()=>requestAnimationFrame(()=>{update();schedule();}));
 document.fonts.ready.then(schedule);attach();
})();
