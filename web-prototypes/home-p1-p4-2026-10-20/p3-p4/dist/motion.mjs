import {BAY,FLAP_SOURCE,OUTER_SOURCE,clamp,homography,cssMatrix,scenePose,folioLayout,cabinetLayout} from './motion-geometry.mjs';
import {topics} from './topics.mjs';
import {initFolio} from './folio-content.mjs';
const $=id=>document.getElementById(id);
const stage=$('stage'),world=$('world'),sequence=$('sequence'),room=$('room'),rail=$('cabinet-viewport'),plane=$('flap-plane'),outer=$('flap-outer'),book=$('book-body'),front=$('desk-front'),rods=$('support-rods'),slider=$('progress'),play=$('play'),counter=$('counter'),status=$('status');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const folio=initFolio();
let width=390,height=844,start=0,distance=1,p=0,playing=0,queued=false,ready=false,currentIndex=0,lastScale=1,drag=null,step=941,maxIndex=topics.length-1;
let slotTracks=[];
function setPlane(el,source,destination){el.style.transform=cssMatrix(homography(source,destination))}
function paint(value){
 p=clamp(value);const q=scenePose(p,width,height,reduced.matches),c=q.camera;
 lastScale=c.scale;
 $('cabinet-content').style.opacity=String(q.contentAlpha);
 document.querySelector('.cabinet-back').style.top=q.cabinet.offset+'px';
 room.style.transform=`translate(${width/2-c.x*c.scale}px,${height*c.anchor-c.y*c.scale}px) scale(${c.scale})`;
 plane.toggleAttribute('hidden',q.side!=='inner'||q.edge);outer.toggleAttribute('hidden',q.side!=='outer'||q.edge);
 if(!q.edge){setPlane(plane,FLAP_SOURCE,q.flap);setPlane(outer,OUTER_SOURCE,[q.flap[3],q.flap[2],q.flap[1],q.flap[0]])}
 book.hidden=!q.showBook;front.hidden=!q.showBook;
 if(q.showBook){setPlane(book,q.layout.pageSource,q.page);setPlane(front,q.layout.frontSource,q.front)}
 folio.paint(q.p);
 rods.style.visibility=q.showRods?'visible':'hidden';
 q.rods.forEach((r,i)=>{
  const d=`M${r.a} L${r.joint} L${r.b}`;
  $(`rod-${i}`).setAttribute('d',d);$(`rod-core-${i}`).setAttribute('d',d);
  for(const [j,v] of [r.a,r.joint,r.b].entries()){$(`joint-${i}-${j}`).setAttribute('cx',v[0]);$(`joint-${i}-${j}`).setAttribute('cy',v[1])}
 });
 rail.inert=!q.canBrowse;rail.setAttribute('aria-hidden',String(!q.canBrowse));book.setAttribute('aria-hidden',String(!q.showBook));
 $('gallery-navigation').hidden=!q.wide||!q.canBrowse;
 if(!q.canBrowse&&drag)finishDrag();
 slider.value=Math.round(p*1000);counter.value=Math.round(p*100)+'%';$('phase').textContent=p<.2?'收藏柜':p<.7?'展开索引':'细看图册';
 if(!ready)status.textContent='正在加载线稿与原图…';
 else status.textContent=reduced.matches?'已随系统设置减少动态效果。':p<.18?'左右滑动浏览专题，向下滚动展开图册。':p<.7?'柜板沿下沿铰链展开，图册随书台显露。':'继续向下，靠近图册。';
}
function stop(){if(playing)cancelAnimationFrame(playing);playing=0;play.textContent=p>.995?'重播':'播放'}
function seek(value){p=clamp(value);window.scrollTo({top:start+p*distance,behavior:'instant'});paint(p)}
function read(){queued=false;paint((window.scrollY-start)/distance)}
function resize(){
 const prior=p;width=world.clientWidth;height=stage.clientHeight;
 const layout=folioLayout(width,height);
 book.setAttribute('aria-label',layout.wide?'清冷与Coquette双页视觉图鉴试排':'清冷与Coquette单页视觉图鉴试排');
 for(const el of [book,front]){el.style.width=layout.width+'px';el.style.height=layout.height+'px';el.style.backgroundImage=`url('assets/${layout.asset}')`;el.style.backgroundSize='contain';el.style.backgroundPosition='center center';el.style.backgroundColor='var(--paper)'}
 book.style.clipPath=`inset(0 0 ${layout.height-layout.split}px 0)`;
 front.style.clipPath=`inset(${layout.split}px 0 0)`;
 folio.resize(layout,height);
 configureCabinet(cabinetLayout(width,height));
 start=sequence.getBoundingClientRect().top+window.scrollY;distance=Math.max(1,sequence.offsetHeight-height);paint(prior);if(window.scrollY>=start&&window.scrollY<=start+distance+height*.1)seek(prior);
}
const entries=topics;
function paintBrowse(){
 const position=rail.scrollLeft/step;
 slotTracks.forEach((tracks,i)=>tracks.forEach(el=>{el.style.transform='translateX('+(-(position+i)*100)+'%)'}));
 currentIndex=clamp(Math.round(position),0,maxIndex);updateBrowseButtons();
 const active=entries[currentIndex];rail.setAttribute('aria-label','一级美学专题收藏柜，当前'+active.name+'，左右滑动浏览，共'+entries.length+'个原专题');
}
function configureCabinet(layout){
 step=layout.step;maxIndex=Math.max(0,entries.length-layout.slots.length);currentIndex=clamp(currentIndex,0,maxIndex);
 const art=$('cabinet-art'),content=$('cabinet-content');
 art.src='assets/'+layout.asset;art.style.height=layout.head+'px';
 rail.style.height=layout.head+'px';content.style.height=layout.head+'px';
 content.style.setProperty('--title-size',layout.wide?'20px':'40px');content.style.setProperty('--latin-size',layout.wide?'9px':'20px');
 rail.firstElementChild.innerHTML=Array.from({length:maxIndex+1},()=>'<span class="browse-snap" style="width:'+step+'px"></span>').join('');
 rail.firstElementChild.style.width=(941+maxIndex*step)+'px';
 content.innerHTML=layout.slots.map((slot,i)=>{
  const rect=(r)=>'left:'+(r[0]*941)+'px;top:'+(r[1]*layout.head)+'px;width:'+(r[2]*941)+'px;height:'+(r[3]*layout.head)+'px';
  return '<div class="picture-window" style="'+rect(slot.image)+'"><div class="slot-track" data-slot="'+i+'">'+entries.map(t=>'<div class="topic-picture"><img src="assets/'+t.src+'" width="'+t.width+'" height="'+t.height+'" alt="" draggable="false"></div>').join('')+'</div></div><div class="label-window" style="'+rect(slot.label)+'"><div class="slot-track" data-slot="'+i+'">'+entries.map(t=>'<div class="topic-label"><strong>'+t.name+'</strong><small>'+t.en+'</small></div>').join('')+'</div></div>';
 }).join('');
 slotTracks=layout.slots.map((_,i)=>Array.from(content.querySelectorAll('[data-slot="'+i+'"]')));
 rail.scrollLeft=currentIndex*step;paintBrowse();
}
function updateBrowseButtons(){$('previous-topic').disabled=currentIndex===0;$('next-topic').disabled=currentIndex===maxIndex}
function browse(direction){stop();rail.scrollTo({left:clamp(currentIndex+direction,0,maxIndex)*step,behavior:reduced.matches?'instant':'smooth'})}
rail.addEventListener('scroll',paintBrowse,{passive:true});
rail.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();browse(e.key==='ArrowRight'?1:-1)}});
$('previous-topic').onclick=()=>browse(-1);$('next-topic').onclick=()=>browse(1);updateBrowseButtons();
rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||rail.inert)return;stop();drag={id:e.pointerId,x:e.clientX,left:rail.scrollLeft,scale:lastScale};rail.setPointerCapture(e.pointerId);rail.style.scrollSnapType='none';rail.classList.add('dragging');e.preventDefault()});
rail.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;rail.scrollLeft=clamp(drag.left-(e.clientX-drag.x)/drag.scale,0,(maxIndex)*step)});
function finishDrag(){if(!drag)return;const id=drag.id;drag=null;rail.style.scrollSnapType='';rail.classList.remove('dragging');if(rail.hasPointerCapture(id))rail.releasePointerCapture(id);rail.scrollTo({left:clamp(Math.round(rail.scrollLeft/step),0,maxIndex)*step,behavior:reduced.matches?'instant':'smooth'})}
rail.addEventListener('pointerup',finishDrag);rail.addEventListener('pointercancel',finishDrag);rail.addEventListener('lostpointercapture',finishDrag);
window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(read)}},{passive:true});window.addEventListener('resize',resize);new ResizeObserver(resize).observe(stage);
for(const event of ['touchstart','wheel','pointerdown'])stage.addEventListener(event,stop,{passive:true});
window.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))stop()});
slider.addEventListener('input',()=>{stop();seek(Number(slider.value)/1000)});
play.onclick=()=>{if(playing){stop();return}if(p>.995)seek(0);const origin=p,began=performance.now(),duration=(1-origin)*8200;play.textContent='暂停';const tick=t=>{const next=origin+(t-began)/duration*(1-origin);seek(next);if(next<1)playing=requestAnimationFrame(tick);else{playing=0;play.textContent='重播'}};playing=requestAnimationFrame(tick)};
$('restart').onclick=()=>{stop();seek(0)};
$('collapse').onclick=()=>{const controls=$('controls'),collapsed=controls.classList.toggle('collapsed');$('collapse').setAttribute('aria-expanded',String(!collapsed));$('collapse').textContent=collapsed?'进度':'收起'};
reduced.addEventListener('change',()=>{stop();play.disabled=reduced.matches;paint(p)});
resize();read();play.disabled=reduced.matches;
const assets=['p3-mobile-botanical-v1.png','p3-desktop-botanical-v1.png','secretary-botanical-v2.png','p4-mobile-botanical-v1.png','p4-desktop-botanical-v2.png',...entries.map(e=>e.src),...folio.assets];
Promise.all([...assets.map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(Error(src));img.src='assets/'+src})),...(document.fonts?[document.fonts.load('40px CabinetSong','忧郁爱欲田园幽玄酒神留白')]:[])]).then(()=>{ready=true;paint(p)}).catch(()=>{status.textContent='有素材加载失败，请刷新重试。';status.classList.add('error')});
const query=new URLSearchParams(location.search),requested=Number(query.get('p'));if(Number.isFinite(requested)&&requested>0)seek(requested);
