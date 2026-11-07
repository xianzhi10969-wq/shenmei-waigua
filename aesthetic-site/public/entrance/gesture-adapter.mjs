/* Additive input layer; inherited app.js, covers, masks and art remain untouched. */
export function attachGalleryGestures({cinema,stage,p3,scrollTo}){
 const notify=()=>{if(parent!==window)parent.postMessage({type:'review-interaction'},location.origin);};
 // Horizontal input is owned only by the shared gallery motion controller.
 // Mouse dragging in the phone review should behave like a vertical finger drag.
 // Real touch continues to use native pan-y and pinch zoom.
 let vertical=null;
 cinema.addEventListener('pointerdown',e=>{notify();if(innerWidth<=680&&e.pointerType==='mouse'&&e.button===0&&!e.target.closest('button,a,input,summary'))vertical={id:e.pointerId,x:e.clientX,y:e.clientY,scroll:window.scrollY,active:false};});
 cinema.addEventListener('pointermove',e=>{if(!vertical||vertical.id!==e.pointerId)return;const dx=e.clientX-vertical.x,dy=e.clientY-vertical.y;if(!vertical.active){if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.15){vertical=null;return;}if(Math.abs(dy)<12||Math.abs(dy)<Math.abs(dx)*1.15)return;vertical.active=true;cinema.setPointerCapture(e.pointerId);}e.preventDefault();scrollTo(vertical.scroll-dy);},{passive:false});
 function stopVertical(e){if(vertical?.id===e.pointerId){vertical=null;if(cinema.hasPointerCapture(e.pointerId))cinema.releasePointerCapture(e.pointerId);}}
 cinema.addEventListener('pointerup',stopVertical);cinema.addEventListener('pointercancel',stopVertical);
 cinema.addEventListener('wheel',notify,{passive:true,capture:true});cinema.addEventListener('keydown',notify,{capture:true});
}
