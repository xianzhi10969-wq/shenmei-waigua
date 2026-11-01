/* One phase drives every window and the ruler. Exact critically-damped integration.
   Follow hand speed: stack targets on every step; snappy spring; wheel can re-step while scrolling. */
(function(root){
 const W=110; // was 40 (~0.33s); 110 ≈ ~0.1s settle — visibly snappy for rapid flips
 const advance=(x,v,target,dt)=>{const w=W,a=x-target,b=v+w*a,e=Math.exp(-w*dt);return {x:target+(a+b*dt)*e,v:(v-w*b*dt)*e};};
 function create({element,start,stepPixels,paint,settle,reduced}){
  let x=start,v=0,target=start,raf=0,last=0,gesture=null,wheelTime=0,wheelSum=0,wheelStepAt=0;
  const abort=new AbortController(),on=(node,name,fn,options={})=>node.addEventListener(name,fn,{...options,signal:abort.signal});
  function show(){paint(x);element.dataset.target=String(target);}
  function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;({x,v}=advance(x,v,target,dt));show();
   if(Math.abs(x-target)<.00005&&Math.abs(v)<.001){x=target;v=0;raf=0;show();settle(x);}else raf=requestAnimationFrame(tick);
  }
  function run(){if(reduced()){cancelAnimationFrame(raf);raf=0;x=target;v=0;show();settle(x);return;}if(!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
  function step(d){
   if(gesture)return;
   target+=Math.sign(d);
   // Nudge hard toward new target so stacked flips catch up almost immediately.
   const dist=target-x;
   if(dist!==0){
    const toward=Math.sign(dist);
    if(Math.sign(v)!==toward)v=0;
    v=toward*Math.max(Math.abs(v),Math.min(90,W*Math.abs(dist)*0.55));
   }
   run();
  }
  on(element,'pointerdown',e=>{if(e.button!==0)return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,from:x,base:Math.round(x),lastX:e.clientX,lastT:e.timeStamp,horizontal:false,blocked:false};});
  on(element,'pointermove',e=>{const g=gesture;if(!g||g.id!==e.pointerId||g.blocked)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;
   if(!g.horizontal){if(Math.max(Math.abs(dx),Math.abs(dy))<7)return;if(Math.abs(dy)>Math.abs(dx)){g.blocked=true;return;}g.horizontal=true;cancelAnimationFrame(raf);raf=0;g.from=x;g.base=Math.round(x);element.setPointerCapture(e.pointerId);}
   e.preventDefault();const next=Math.max(g.base-1,Math.min(g.base+1,g.from-dx/stepPixels()));
   const dt=(e.timeStamp-g.lastT)/1000;if(dt>0)v=(next-x)/dt;x=next;g.lastT=e.timeStamp;g.lastX=e.clientX;show();
  },{passive:false});
  function release(e,cancel=false){const g=gesture;if(!g||g.id!==e.pointerId)return;gesture=null;
   if(element.hasPointerCapture(e.pointerId))element.releasePointerCapture(e.pointerId);if(!g.horizontal)return;
   const delta=x-g.from,travel=e.clientX-g.x;
   target=g.base+(cancel?0:Math.abs(travel)>=18||Math.abs(delta)>.16?Math.sign(delta):0);
   if(e.timeStamp-g.lastT>90)v=0;
   const distance=target-x;v=Math.sign(distance)*Math.min(Math.max(0,v*Math.sign(distance)),W*Math.abs(distance));run();
  }
  on(element,'pointerup',e=>release(e));on(element,'pointercancel',e=>release(e,true));
  // Wheel: re-arm every ~40ms; lower sum threshold so trackpad keeps up with hand speed.
  on(element,'wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();
   const now=performance.now();if(now-wheelTime>200)wheelSum=0;wheelTime=now;wheelSum+=e.deltaX;
   if(Math.abs(wheelSum)>14&&now-wheelStepAt>=40){wheelStepAt=now;step(Math.sign(wheelSum));wheelSum=0;}
  },{passive:false});
  on(document,'visibilitychange',()=>{last=performance.now();});
  return {step,destroy(){abort.abort();cancelAnimationFrame(raf);},get position(){return x;}};
 }
 root.createGalleryMotion=create;root.galleryAdvance=advance;
 if(typeof module!=='undefined')module.exports={advance};
})(typeof window==='undefined'?globalThis:window);
