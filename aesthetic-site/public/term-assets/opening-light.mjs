// Short, simultaneous movement study using the unchanged chandelier bitmap.
// No strobe, no dark interval, no forced scroll, and no loop.
export async function mountOpeningLight(ready) {
  const stage=document.querySelector('.stage'),inner=document.querySelector('.opening-inner');
  const lamp=inner.querySelector('.chandelier'),title=inner.querySelector('.term-name');
  const copy=[...inner.querySelector('.opening-copy').children].filter(el=>el!==title);
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/term-assets/opening-light.css';document.head.append(sheet);
  const animations=[];let stopped=false,halo,overlay;
  const animate=(el,frames,timing)=>{const a=el.animate(frames,{fill:'both',easing:'ease-out',...timing});animations.push(a);return a};
  // A cancellable hold avoids a title flash while the original image/font decodes.
  const hold=animate(title,[{opacity:0},{opacity:0}],{duration:1});
  const holds=copy.map(el=>animate(el,[{opacity:0},{opacity:0}],{duration:1}));
  const controller=new AbortController(),options={passive:true,signal:controller.signal};
  function finish(keepLight=false){
    if(stopped)return;stopped=true;animations.forEach(a=>a.cancel());
    if(keepLight===true&&halo){halo.style.opacity='.62';window.addEventListener('resize',()=>halo.remove(),{once:true});reduced.addEventListener('change',()=>halo.remove(),{once:true});}else halo?.remove();overlay?.remove();inner.classList.remove('opening-light-active');
    inner.dataset.lightPhase='done';controller.abort();clearTimeout(failsafe);
  }
  const failsafe=setTimeout(finish,4500);
  stage.addEventListener('scroll',()=>{if(stage.scrollTop>12)finish()},options);
  stage.addEventListener('wheel',finish,options);stage.addEventListener('touchstart',finish,options);
  stage.addEventListener('keydown',e=>{if(['Tab','ArrowDown','PageDown','End',' '].includes(e.key))finish()},options);
  window.addEventListener('resize',finish,options);reduced.addEventListener('change',finish,options);
  window.addEventListener('pagehide',finish,options);
  await ready;
  if(stopped||stage.scrollTop>12||reduced.matches){finish();return;}
  inner.classList.add('opening-light-active');inner.dataset.lightPhase='falling';
  const r=inner.getBoundingClientRect(),l=lamp.getBoundingClientRect(),t=title.getBoundingClientRect();
  const left=l.left-r.left,top=l.top-r.top,scale=l.width/1122;
  const ns='http://www.w3.org/2000/svg';
  halo=document.createElementNS(ns,'svg');halo.classList.add('opening-light-halo');
  halo.setAttribute('viewBox','0 0 1122 1402');halo.setAttribute('aria-hidden','true');
  halo.style.cssText=`left:${left}px;top:${top}px;width:${l.width}px;height:${l.height}px`;
  // Centers measured against the original 1122×1402 artwork's eight flame tips.
  const flames=[[132,637],[222,721],[309,468],[426,636],[655,715],[754,468],[874,677],[988,600]];
  halo.innerHTML='<defs><radialGradient id="opening-candle-glow"><stop stop-color="#fff9dc" stop-opacity=".7"/><stop offset=".3" stop-color="#fff2bd" stop-opacity=".28"/><stop offset="1" stop-color="#fff2bd" stop-opacity="0"/></radialGradient></defs>'+flames.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="58" fill="url(#opening-candle-glow)"/>`).join('');
  inner.append(halo);
  overlay=document.createElementNS(ns,'svg');overlay.classList.add('opening-light-overlay');overlay.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);overlay.setAttribute('aria-hidden','true');
  const sx=left+570*scale,sy=top+1375*scale;
  const mobile=matchMedia('(max-width:700px)').matches;
  const range=document.createRange();range.selectNodeContents(title);const textBounds=range.getBoundingClientRect();
  const ex=mobile?Math.min(sx,textBounds.left-r.left+Math.min(textBounds.width,240)*.6):sx-12;
  const ey=mobile?Math.max(sy+35,t.top-r.top+12):sy+65;
  const coords=Array.from({length:51},(_,i)=>{const p=i/50;return {transform:`translate(${sx+(ex-sx)*p*p}px,${sy+(ey-sy)*p*p}px) scale(${.65+.35*p})`,opacity:i===0?0:i>44?(50-i)/6:1}});
  overlay.innerHTML='<defs><radialGradient id="opening-drop-glow"><stop stop-color="#fff9de" stop-opacity=".5"/><stop offset="1" stop-color="#fff2bd" stop-opacity="0"/></radialGradient></defs><g data-drop><circle r="19" fill="url(#opening-drop-glow)"/><path d="M0 -9C-1 -4 -5 1 -5 4A5 5 0 0 0 5 4C5 1 1 -4 0 -9Z" fill="#fbf5dc"/><path d="M-1 0Q-4 4 -1 6" fill="none" stroke="white" stroke-width="1"/></g>';
  inner.append(overlay);
  animate(lamp,[{transform:'rotate(0deg)'},{transform:'rotate(.45deg)',offset:.3},{transform:'rotate(-.2deg)',offset:.65},{transform:'rotate(0deg)'}],{duration:1400});
  animate(halo,[{transform:'rotate(0deg)',opacity:.62},{transform:'rotate(.45deg)',opacity:.9,offset:.3},{transform:'rotate(-.2deg)',opacity:.75,offset:.65},{transform:'rotate(0deg)',opacity:.62}],{duration:1400});
  animate(overlay.querySelector('[data-drop]'),coords,{duration:850,easing:'linear'});
  hold.cancel();holds.forEach(a=>a.cancel());
  animate(title,[{opacity:0,filter:'blur(3px)',textShadow:'0 0 0px #fff1bd00'},{opacity:1,filter:'blur(0px)',textShadow:'0 0 22px #fff1bd88',offset:.55},{opacity:1,filter:'blur(0px)',textShadow:'0 0 0px #fff1bd00'}],{delay:620,duration:780});
  copy.forEach(el=>animate(el,[{opacity:0},{opacity:1}],{delay:850,duration:450}));
  setTimeout(()=>finish(true),1450);
  window.openingLight={finish,duration:1450,simultaneous:true};
}
