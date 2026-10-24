/* Additive input layer; inherited app.js, covers, masks and art remain untouched. */
export function attachGalleryGestures({cinema,stage,p3,scrollTo}){
 const notify=()=>{if(parent!==window)parent.postMessage({type:'review-interaction'},location.origin);};
 const enabled=()=>!p3.inert&&!!window.GALLERY_REVIEW;
 let wheelIdle=null,wheelSum=0,wheelStepped=false;
 stage.addEventListener('wheel',e=>{
  if(!enabled()||Math.abs(e.deltaX)<=Math.abs(e.deltaY)*1.1)return;
  e.preventDefault();e.stopPropagation();notify();
  const amount=e.deltaX*(e.deltaMode===1?16:e.deltaMode===2?stage.clientWidth:1);
  wheelSum+=amount;clearTimeout(wheelIdle);wheelIdle=setTimeout(()=>{wheelSum=0;wheelStepped=false;},180);
  if(!wheelStepped&&Math.abs(wheelSum)>=18){wheelStepped=true;window.GALLERY_REVIEW.step(wheelSum>0?1:-1);}
 },{passive:false,capture:true});
 // Original continuous dragging inside the openings is retained. Extend one-step
 // dragging to the surrounding architecture, where no input surface existed.
 let horizontal=null;
 stage.addEventListener('pointerdown',e=>{
  if(!enabled()||!e.isPrimary||e.button!==0||e.target.closest('.motion-driver'))return;
  horizontal={id:e.pointerId,x:e.clientX,y:e.clientY,active:false};
 });
 stage.addEventListener('pointermove',e=>{
  if(!horizontal||horizontal.id!==e.pointerId)return;
  const dx=e.clientX-horizontal.x,dy=e.clientY-horizontal.y;
  if(!horizontal.active){if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)*1.15){horizontal=null;return;}if(Math.abs(dx)<10||Math.abs(dx)<Math.abs(dy)*1.15)return;horizontal.active=true;stage.setPointerCapture(e.pointerId);}
  e.preventDefault();
 },{passive:false});
 function end(e,cancelled=false){if(!horizontal||horizontal.id!==e.pointerId)return;const g=horizontal;horizontal=null;if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);if(g.active&&!cancelled&&Math.abs(e.clientX-g.x)>=22)window.GALLERY_REVIEW.step(e.clientX<g.x?1:-1);}
 stage.addEventListener('pointerup',e=>end(e));stage.addEventListener('pointercancel',e=>end(e,true));
 // Mouse dragging in the phone review should behave like a vertical finger drag.
 // Real touch continues to use native pan-y and pinch zoom.
 let vertical=null;
 cinema.addEventListener('pointerdown',e=>{notify();if(innerWidth<=680&&e.pointerType==='mouse'&&e.button===0&&!e.target.closest('button,a,input,summary'))vertical={id:e.pointerId,x:e.clientX,y:e.clientY,scroll:window.scrollY,active:false};});
 cinema.addEventListener('pointermove',e=>{if(!vertical||vertical.id!==e.pointerId)return;const dx=e.clientX-vertical.x,dy=e.clientY-vertical.y;if(!vertical.active){if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.15){vertical=null;return;}if(Math.abs(dy)<12||Math.abs(dy)<Math.abs(dx)*1.15)return;vertical.active=true;cinema.setPointerCapture(e.pointerId);}e.preventDefault();scrollTo(vertical.scroll-dy);},{passive:false});
 function stopVertical(e){if(vertical?.id===e.pointerId){vertical=null;if(cinema.hasPointerCapture(e.pointerId))cinema.releasePointerCapture(e.pointerId);}}
 cinema.addEventListener('pointerup',stopVertical);cinema.addEventListener('pointercancel',stopVertical);
 cinema.addEventListener('wheel',notify,{passive:true,capture:true});cinema.addEventListener('keydown',notify,{capture:true});
}
