(() => {
 const pager=document.querySelector('.pager'),hint=pager.querySelector('.hint');hint.className='sr-only';
 const ruler=document.createElement('div');ruler.className='ruler';ruler.setAttribute('role','meter');ruler.setAttribute('aria-label','当前专题');ruler.setAttribute('aria-valuemin','1');ruler.setAttribute('aria-valuemax','24');
 const strip=document.createElement('div');strip.className='tick-strip';ruler.append(strip);
 for(let i=0;i<24;i++){const tick=document.createElement('i');tick.className='tick';tick.style.setProperty('--i',i);strip.append(tick);}
 const markers=[-24,0,24].map(offset=>{const marker=document.createElement('i');marker.className='current-tick';strip.append(marker);return {marker,offset};});
 pager.insertBefore(ruler,document.getElementById('next'));
 function sync(position){const p=((position%24)+24)%24;for(const {marker,offset}of markers)marker.style.setProperty('--position',p+offset);ruler.dataset.position=String(position);ruler.setAttribute('aria-valuenow',String(((Math.round(position)%24)+24)%24+1));}
 window.addEventListener('gallery-position',e=>sync(e.detail.position));sync(Number(document.getElementById('stage').dataset.position));
 // Decode once before accepting gestures, so the first crossing never waits on an image.
 document.querySelectorAll('.arrow').forEach(b=>b.disabled=true);document.getElementById('stage').inert=true;
 Promise.all(window.FEISHU_TOPICS.topics.map(t=>{const i=new Image();i.src=t.cover;return i.decode();})).then(()=>{document.querySelectorAll('.arrow').forEach(b=>b.disabled=false);document.getElementById('stage').inert=false;document.documentElement.dataset.ready='true';}).catch(()=>{document.getElementById('status').textContent='封面加载未完成，请刷新后重试。';});
})();
