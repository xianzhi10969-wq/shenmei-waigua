(() => {
 const pager=document.querySelector('.pager'),hint=pager.querySelector('.hint');hint.className='sr-only';
 const ruler=document.createElement('div');ruler.className='ruler';ruler.setAttribute('role','meter');ruler.setAttribute('aria-label','当前专题');ruler.setAttribute('aria-valuemin','1');ruler.setAttribute('aria-valuemax','24');
 const strip=document.createElement('div');strip.className='tick-strip';ruler.append(strip);
 for(let i=0;i<24;i++){const tick=document.createElement('i');tick.className='tick';tick.style.setProperty('--i',i);strip.append(tick);}
 const markers=[-24,0,24].map(offset=>{const marker=document.createElement('i');marker.className='current-tick';strip.append(marker);return {marker,offset};});
 pager.insertBefore(ruler,document.getElementById('next'));
 function sync(position){const p=((position%24)+24)%24;for(const {marker,offset}of markers)marker.style.setProperty('--position',p+offset);ruler.dataset.position=String(position);ruler.setAttribute('aria-valuenow',String(((Math.round(position)%24)+24)%24+1));}
 window.addEventListener('gallery-position',e=>sync(e.detail.position));sync(Number(document.getElementById('stage').dataset.position));
 // Do not fetch all 24 covers on first paint. Arm when P3 is near; decode only the visible neighbourhood first.
 document.querySelectorAll('.arrow').forEach(b=>b.disabled=true);
 const stage=document.getElementById('stage');if(stage)stage.inert=true;
 function nearbyCovers(){
  const topics=window.FEISHU_TOPICS?.topics||[];
  if(!topics.length)return[];
  const selected=window.GALLERY_REVIEW?.selected ?? 2;
  const mobile=matchMedia('(max-width:680px)').matches;
  const offsets=mobile?[-1,0,1]:[-2,-1,0,1,2];
  const need=new Set();
  for(const o of offsets)for(const j of [-1,0,1]){
   const idx=((selected+o+j)%topics.length+topics.length)%topics.length;
   need.add(topics[idx].cover);
  }
  return [...need];
 }
 let started=false;
 function arm(){
  if(started)return;started=true;
  const first=nearbyCovers();
  Promise.all(first.map(src=>{const i=new Image();i.src=src;return i.decode().catch(()=>{});})).then(()=>{
   document.querySelectorAll('.arrow').forEach(b=>b.disabled=false);
   if(stage)stage.inert=false;
   document.documentElement.dataset.ready='true';
   const rest=(window.FEISHU_TOPICS?.topics||[]).map(t=>t.cover).filter(c=>!first.includes(c));
   const warm=()=>{const next=rest.shift();if(!next)return;const i=new Image();i.onload=()=>setTimeout(warm,0);i.onerror=()=>setTimeout(warm,0);i.src=next;};
   if('requestIdleCallback' in window)requestIdleCallback(()=>warm(),{timeout:2000});else setTimeout(warm,1000);
  }).catch(()=>{document.getElementById('status').textContent='封面加载未完成，请刷新后重试。';});
 }
 window.addEventListener('p3-near',arm,{once:true});
 if(document.documentElement.dataset.p3Assets==='1'||new URLSearchParams(location.search).has('at')||new URLSearchParams(location.search).has('still'))arm();
})();
