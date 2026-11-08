// Native frame pixels: fixed corners and central motifs, extensible connecting rails.
(() => {
 const sources={white:'/frame-art/frame-white.png',gray:'/frame-art/frame-gray.png',black:'/frame-art/frame-black.png'};
 const activeFrames=new Set();
 const sourceFor=frame=>sources[document.body.dataset.tone&&document.body.dataset.tone!=='auto'?document.body.dataset.tone:frame.dataset.tone]||sources.white;
 const cutsX=[0,400,600,900,1084,1484],cutsY=[0,330,450,600,730,1060];
 function paint(frame){
  if(frame.dataset.ornate)return;
  const img=frame.querySelector('img');if(!img)return;
  frame.dataset.ornate='true';frame.classList.add('ornate');
  const wrap=document.createElement('span');wrap.className='ornate-pieces';wrap.setAttribute('aria-hidden','true');
  for(let y=0;y<5;y++)for(let x=0;x<5;x++){
   if(x>0&&x<4&&y>0&&y<4)continue;
   let sx=cutsX[x],sy=cutsY[y],sw=cutsX[x+1]-cutsX[x],sh=cutsY[y+1]-cutsY[y];
   // A narrow straight native rail keeps ink density constant when extended.
   if((x===0||x===4)&&y===1){sy=395;sh=10;}
   if((x===0||x===4)&&y===3){sy=660;sh=10;}
   const el=document.createElementNS('http://www.w3.org/2000/svg','svg');
   el.setAttribute('viewBox',`${sx} ${sy} ${sw} ${sh}`);el.setAttribute('preserveAspectRatio','none');
   el.style.gridColumn=x+1;el.style.gridRow=y+1;
   const art=document.createElementNS('http://www.w3.org/2000/svg','image');art.setAttribute('href',sourceFor(frame));art.setAttribute('width',1484);art.setAttribute('height',1060);el.append(art);wrap.append(el);
  }
  frame.append(wrap);
  function size(){
   const w=frame.clientWidth,r=Number(img.getAttribute('width'))/Number(img.getAttribute('height'));
   if(!w||!r)return;
   // Prevent fixed ornaments from colliding even around very wide panoramas.
   const s=Math.min(w<500?.21:.26,.88*w/1100,.93*(w-8)/(438*r+383));
   frame.style.setProperty('--ornament-scale',s);
   frame.style.setProperty('--left',`${193*s+4}px`);frame.style.setProperty('--right',`${190*s+4}px`);
   frame.style.setProperty('--top',`${182*s+4}px`);frame.style.setProperty('--bottom',`${190*s+4}px`);
   wrap.style.gridTemplateColumns=`${400*s}px 1fr ${300*s}px 1fr ${400*s}px`;
   wrap.style.gridTemplateRows=`${330*s}px 1fr ${150*s}px 1fr ${330*s}px`;
  }
  const ro=new ResizeObserver(size);ro.observe(frame);frame._ornateObserver=ro;activeFrames.add(frame);size();
 }
 const root=document.querySelector('#main');
 const mo=new MutationObserver(()=>{for(const frame of activeFrames)if(!frame.isConnected){frame._ornateObserver.disconnect();activeFrames.delete(frame)}root.querySelectorAll('.frame:not([data-ornate])').forEach(paint)});mo.observe(root,{childList:true,subtree:true});root.querySelectorAll('.frame').forEach(paint);
 new MutationObserver(()=>{for(const frame of activeFrames)frame.querySelectorAll('.ornate-pieces image').forEach(i=>i.setAttribute('href',sourceFor(frame)))}).observe(document.body,{attributes:true,attributeFilter:['data-tone']});
})();
