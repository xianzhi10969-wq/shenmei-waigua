/* Additive experiment: existing scene groups, art, masks and motion code are untouched. */
(() => {
 'use strict';
 let enabled=new URLSearchParams(location.search).get('smallglass')!=='off';
 const asset=path=>window.EMBEDDED_ASSETS?.[path]||path;
 const control=document.createElement('aside');
 control.className='glass-comparison';control.setAttribute('aria-label','小格夜玻璃对照');
 control.innerHTML='<span>小格夜玻璃</span><div><button type="button" data-mode="off" aria-label="查看原版">原版</button><button type="button" data-mode="on" aria-label="查看新增夜玻璃">新增层</button></div>';
 document.body.append(control);
 function sync(){
  const scene=document.querySelector('#stage .scene');if(!scene)return;
  let layer=scene.querySelector('[data-layer="small-night-glass"]');
  if(!layer){
   layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.setAttribute('data-layer','small-night-glass');layer.setAttribute('aria-hidden','true');
   const image=document.createElementNS('http://www.w3.org/2000/svg','image');image.setAttribute('href',asset('assets/small-night-glass-layer.png'));image.setAttribute('width','1448');image.setAttribute('height','1086');
   layer.append(image);scene.querySelector('[data-layer="locked-base"]').after(layer);
  }
  const next=enabled?'visible':'hidden';if(layer.getAttribute('visibility')!==next)layer.setAttribute('visibility',next);
  control.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.mode==='on')===enabled)));
 }
 control.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;enabled=button.dataset.mode==='on';sync();});
 new MutationObserver(sync).observe(document.getElementById('stage'),{childList:true,subtree:true});
 sync();
})();
