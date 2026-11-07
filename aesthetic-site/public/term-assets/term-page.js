const stage=document.querySelector('.stage'),opening=document.querySelector('.opening'),paper=document.querySelector('.paper'),map=document.querySelector('.map-layer'),slider=document.querySelector('#progress'),phase=document.querySelector('#phase'),play=document.querySelector('#play');
const query=new URLSearchParams(location.search),capture=query.has('capture'),reduced=matchMedia('(prefers-reduced-motion: reduce)');if(capture)document.body.classList.add('capture');
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const pairs=[...document.querySelectorAll('.figure-ref')].sort((a,b)=>Number(a.textContent)-Number(b.textContent)).map((ref,i)=>({number:i+1,start:.24+i*.065,end:.29+i*.065,ref,figure:document.querySelector('.piece.'+ref.dataset.figure)}));
const title=document.querySelector('.board .title'),index=document.querySelector('.map-index'),core=document.querySelector('.core'),tail=[...document.querySelectorAll('.map-layer .reading,.map-layer .notes,.map-layer .font-credits')];
let reveal=.22,raf=0,last=0,waiting=null,manual=capture,distance=0,loaded=false,introLead=0;
function layout(){
 const inner=opening.querySelector('.opening-inner');
 const mobile=matchMedia('(max-width:700px)').matches;
 const contentHeight=inner.scrollHeight-(mobile?120:0);
 const introHeight=Math.max(stage.clientHeight,contentHeight);
 introLead=introHeight-stage.clientHeight;
 stage.style.setProperty('--intro-height',introHeight+'px');
 stage.style.setProperty('--intro-top',-introLead+'px');
 distance=Math.max(420,Math.round(stage.clientHeight*.72));
 stage.style.setProperty('--transition-distance',distance+'px');
 render();
}
function alpha(e,a){e.style.opacity=a;}
function render(){
 const t=clamp((stage.scrollTop-introLead)/distance),visible=reduced.matches?(t>=.9?1:0):smooth((t-.55)/.45);
 alpha(opening,reduced.matches?(t<.9?1:0):1-smooth((t-.08)/.68));opening.style.transform='none';alpha(paper,reduced.matches?(t>=.9?1:0):smooth((t-.15)/.65));
 map.style.transform=`translateY(${Math.min(Math.max(stage.scrollTop-introLead,0),distance)-distance}px)`;alpha(map,visible);alpha(title,1);alpha(index,1);
 map.inert=t<.9;map.setAttribute('aria-hidden',String(t<.9));opening.inert=t>=.9;opening.setAttribute('aria-hidden',String(t>=.9));
 for(const pair of pairs){const a=smooth((reveal-pair.start)/.05);alpha(pair.figure,a);alpha(pair.ref,a);pair.figure.setAttribute('aria-hidden',String(a===0));pair.ref.setAttribute('aria-hidden',String(a===0));pair.ref.tabIndex=a>=.999?0:-1;pair.ref.style.pointerEvents=a>=.999?'auto':'none';}
 alpha(core,smooth((reveal-.90)/.05));for(const e of tail){alpha(e,smooth((reveal-.95)/.05));e.inert=reveal<.999;}
 slider.value=Math.round((t<1?t*.22:reveal)*1000);
 const active=pairs.find(p=>reveal>=p.start&&reveal<p.end);
 phase.textContent=t<.05?'下滑看图谱':t<1?'吊灯 → 图谱':waiting?`下滑继续 ${String(waiting).padStart(2,'0')}`:reveal<.24?'风格图谱':active?`显现 ${String(active.number).padStart(2,'0')}`:reveal<.9?'依次显现':'继续阅读';
}
function ready(pair){const r=pair.figure.getBoundingClientRect(),v=stage.getBoundingClientRect();return r.bottom<v.top||r.top+Math.min(r.height*.5,80)<=v.bottom-24;}
function tick(now){raf=0;const dt=Math.min(80,last?now-last:0);last=now;if(!manual&&stage.scrollTop>=introLead+distance-1&&reveal<1){
 if(!pairs.length||reduced.matches||document.querySelector('.board').getBoundingClientRect().bottom<stage.getBoundingClientRect().top){reveal=1;waiting=null;}
 else{const proposed=Math.min(1,reveal+dt/7200),blocked=pairs.find(p=>reveal<=p.start+.00001&&proposed>=p.start&&!ready(p));if(blocked){reveal=blocked.start;waiting=blocked.number;}else{reveal=proposed;waiting=null;}}
 render();if(reveal<1&&!waiting)raf=requestAnimationFrame(tick);
 }}
function schedule(){if(loaded&&!manual&&!raf&&reveal<1&&stage.scrollTop>=introLead+distance-1){last=0;raf=requestAnimationFrame(tick);}}
function stop(){cancelAnimationFrame(raf);raf=0;last=0;waiting=null;}
function finishReveal(){stop();reveal=1;manual=false;render();}
function replay(){stop();manual=false;reveal=.22;stage.scrollTop=0;render();stage.focus({preventScroll:true});}
function setProgress(p){stop();manual=true;p=clamp(p);reveal=Math.max(.22,p);stage.scrollTop=p<.22?introLead+distance*p/.22:introLead+distance;render();}
play.onclick=replay;slider.oninput=()=>setProgress(Number(slider.value)/1000);
stage.addEventListener('scroll',()=>{render();schedule();},{passive:true});
for(const event of ['wheel','touchstart','keydown'])stage.addEventListener(event,()=>{manual=false;schedule();},{passive:true});
window.addEventListener('resize',layout);reduced.addEventListener('change',()=>{render();schedule();});
window.transitionDemo={setProgress,stop,replay,pairs,get progress(){return stage.scrollTop<introLead+distance?clamp((stage.scrollTop-introLead)/distance)*.22:reveal},get waiting(){return waiting},get distance(){return distance}};
function scrollToContent(target,center=false){
 stage.scrollTop=Math.max(introLead+distance,stage.scrollTop);render();
 const r=target.getBoundingClientRect(),v=stage.getBoundingClientRect();
 stage.scrollTop=Math.max(introLead+distance,stage.scrollTop+r.top-v.top-(center?stage.clientHeight/2-r.height/2:24));render();
}
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
 e.preventDefault();returnToRef=a;finishReveal();
 const target=document.querySelector(a.hash);
 if(a.dataset.caseImage)selectImage(target,a.dataset.caseImage);else document.querySelector('#sources').open=true;
 target.setAttribute('tabindex','-1');scrollToContent(target);target.focus({preventScroll:true});
}));
document.querySelectorAll('.back-to-map').forEach(a=>a.addEventListener('click',e=>{
 e.preventDefault();if(a.hash==='#opening'){replay();return;}const target=returnToRef||document.querySelector('.board .title');target.setAttribute('tabindex','-1');scrollToContent(target,true);target.focus({preventScroll:true});if(returnToRef)returnToRef.tabIndex=0;
}));
layout();window.demoReady=Promise.all([document.fonts.ready,...[...document.querySelectorAll('.opening img,.board img')].map(i=>i.decode().catch(()=>{}))]);window.demoReady.then(()=>{loaded=true;layout();if(query.has('collage')){finishReveal();scrollToContent(document.querySelector('.board'));}else if(query.has('cases')){finishReveal();scrollToContent(document.querySelector('.cases-heading'));}else{stage.scrollTop=0;render();stage.focus({preventScroll:true});}schedule();});

// Preserve an explicitly selected parent chapter for terms that belong to more than one.
const parentNavigation = document.querySelector('.term-parent');
const requestedParent = query.get('from');
const allowedParents = JSON.parse(parentNavigation?.dataset.parents || '[]');
if (requestedParent && allowedParents.includes(requestedParent)) {
  parentNavigation.querySelector('a').href = '/#/chapter/' + encodeURIComponent(requestedParent);
}

// Shared bridge for archived SVG collages; keep Coquette's reveal behavior unchanged.
window.termCollageNavigation={openCase(target,src){finishReveal();returnToRef=null;if(src)selectImage(target,src);scrollToContent(target);target.focus({preventScroll:true});}};
