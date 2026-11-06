const stage=document.querySelector('.stage'),opening=document.querySelector('.opening'),paper=document.querySelector('.paper'),map=document.querySelector('.map-layer'),slider=document.querySelector('#progress'),phase=document.querySelector('#phase'),play=document.querySelector('#play');
const capture=new URLSearchParams(location.search).has('capture');if(capture)document.body.classList.add('capture');
const clamp=x=>Math.max(0,Math.min(1,x));const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const pairs=[...document.querySelectorAll('.figure-ref')].sort((a,b)=>Number(a.textContent)-Number(b.textContent)).map((ref,i)=>({number:i+1,start:.24+i*.065,end:.29+i*.065,ref,figure:document.querySelector('.piece.'+ref.dataset.figure)}));
const title=document.querySelector('.board .title'),index=document.querySelector('.map-index'),core=document.querySelector('.core'),tail=[...document.querySelectorAll('.map-layer .reading,.map-layer .notes,.map-layer .font-credits')];
let raf=0,current=0,waiting=null;
function alpha(e,a){e.style.opacity=a;}
function setProgress(p){current=clamp(p);waiting=null;const base=current/.3,outgoing=1-smooth((base-.02)/.38),ground=smooth((base-.14)/.34),heading=smooth((current-.16)/.06);alpha(opening,outgoing);opening.style.transform=`translateY(${-24*(1-outgoing)}px)`;alpha(paper,ground);alpha(map,1);map.style.transform='none';alpha(title,heading);alpha(index,heading);for(const pair of pairs){const a=smooth((current-pair.start)/.05);alpha(pair.figure,a);alpha(pair.ref,a);pair.figure.setAttribute('aria-hidden',String(a===0));pair.ref.setAttribute('aria-hidden',String(a===0));pair.ref.tabIndex=a>=.999?0:-1;pair.ref.style.pointerEvents=a>=.999?'auto':'none';}alpha(core,smooth((current-.90)/.05));for(const e of tail){alpha(e,smooth((current-.95)/.05));e.inert=current<.999;}const readable=current>=.22;stage.classList.toggle('map-readable',readable);stage.classList.toggle('at-end',current>=.999);map.inert=!readable;map.setAttribute('aria-hidden',String(!readable));opening.inert=current>.12;opening.setAttribute('aria-hidden',String(current>.12));slider.value=Math.round(current*1000);const active=pairs.find(pair=>current>=pair.start&&current<pair.end);phase.textContent=current<.16?'暗场转纸白':current<.24?'风格图谱':active?`显现 ${String(active.number).padStart(2,'0')}`:current<.9?'依次显现':current<.95?'图谱核心':'继续阅读';}
function ready(pair){const r=pair.figure.getBoundingClientRect(),v=stage.getBoundingClientRect();return r.bottom<v.top||r.top+Math.min(r.height*.5,80)<=v.bottom-24;}
function stop(){cancelAnimationFrame(raf);raf=0;waiting=null;play.textContent='重播';}
function replay(){stop();map.scrollTop=0;setProgress(0);play.textContent='暂停';let last=performance.now(),hold=900;function frame(now){let dt=Math.min(80,now-last);last=now;if(hold>0){hold-=dt;raf=requestAnimationFrame(frame);return;}let proposed=Math.min(1,current+dt/7200);const blocked=pairs.find(pair=>current<=pair.start+.00001&&proposed>=pair.start&&!ready(pair));if(blocked){setProgress(blocked.start);waiting=blocked.number;phase.textContent=`下滑继续 ${String(waiting).padStart(2,'0')}`;}else setProgress(proposed);if(current<1)raf=requestAnimationFrame(frame);else stop();}raf=requestAnimationFrame(frame);}
play.onclick=()=>raf?stop():replay();slider.oninput=()=>{stop();map.scrollTop=0;setProgress(Number(slider.value)/1000)};
window.transitionDemo={setProgress,stop,replay,pairs,get progress(){return current},get waiting(){return waiting}};
function selectImage(caseEl,src){
 const gallery=caseEl.querySelector('.gallery'),thumbs=[...gallery.querySelectorAll('.gallery-thumb')],i=thumbs.findIndex(t=>t.dataset.src===src);
 if(i<0)return;
 const main=gallery.querySelector('.gallery-main');main.href=src;main.querySelector('img').src=src;main.querySelector('img').alt=thumbs[i].querySelector('img').alt;
 thumbs.forEach((t,n)=>t.setAttribute('aria-pressed',String(i===n)));
 gallery.querySelector('.gallery-count').textContent=`${String(i+1).padStart(2,'0')} / ${String(thumbs.length).padStart(2,'0')}`;
}
document.querySelectorAll('.gallery-thumb').forEach(button=>button.addEventListener('click',()=>selectImage(button.closest('.case'),button.dataset.src)));
let returnToRef=null;
document.querySelectorAll('.figure-ref').forEach(a=>a.addEventListener('click',e=>{
 e.preventDefault();returnToRef=a;stop();setProgress(1);
 const target=document.querySelector(a.hash);
 if(a.dataset.caseImage)selectImage(target,a.dataset.caseImage);else document.querySelector('#sources').open=true;
 target.setAttribute('tabindex','-1');target.scrollIntoView({block:'start',behavior:'auto'});target.focus({preventScroll:true});
}));
document.querySelectorAll('.back-to-map').forEach(a=>a.addEventListener('click',e=>{
 e.preventDefault();const target=returnToRef||document.querySelector('.board .title');target.setAttribute('tabindex','-1');target.scrollIntoView({block:'center',behavior:'auto'});target.focus({preventScroll:true});if(returnToRef)returnToRef.tabIndex=0;
}));
const query=new URLSearchParams(location.search);setProgress(0);window.demoReady=Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode().catch(()=>{}))]);window.demoReady.then(()=>{if(query.has('cases')){setProgress(1);document.querySelector('.cases-heading').scrollIntoView({block:'start'});}else if(!capture&&!matchMedia('(prefers-reduced-motion: reduce)').matches)replay();else if(!capture)setProgress(1)});
