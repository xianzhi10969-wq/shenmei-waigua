/* Synchronize a new upper-cell layer from existing cover nodes without changing them. */
(() => {
 'use strict';
 const NS='http://www.w3.org/2000/svg';
 const asset=p=>window.EMBEDDED_ASSETS?.[p]||p;
 const specs=window.EXTENSION_CELLS;
 let mode=new URLSearchParams(location.search).get('extension')||'art';
 const control=document.createElement('aside');control.className='extension-comparison';control.setAttribute('aria-label','封面延伸图层对照');
 control.innerHTML='<span>上部小格</span><div><button type="button" data-mode="off" aria-label="查看原版">原版</button><button type="button" data-mode="glass" aria-label="查看填黑版">填黑</button><button type="button" data-mode="art" aria-label="查看封面延伸版">封面延伸</button></div>';
 document.body.append(control);
 const node=(tag,attrs,parent)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(parent)parent.append(n);return n;};
 const set=(n,k,v)=>{if(n.getAttribute(k)!==String(v))n.setAttribute(k,String(v));};
 let attachedScene=null,items=[],layer=null,blackLayer=null;
 function attach(scene){
  attachedScene=scene;items=[];
  blackLayer=node('g',{'data-layer':'comparison-night-glass','aria-hidden':'true'},null);
  node('image',{href:asset('assets/small-night-glass-layer.png'),x:0,y:0,width:1448,height:1086},blackLayer);
  layer=node('g',{'data-layer':'cover-extension','aria-hidden':'true'},null);
  scene.querySelector('[data-layer="locked-base"]').after(blackLayer);blackLayer.after(layer);
  const defs=scene.querySelector('defs');
  for(const spec of specs){
   const source=scene.querySelector(`[data-art-for="${spec.pane}"]`);if(!source)continue;
   for(const suffix of ['opening','art']){
    const id='ext-'+spec.pane+'-'+suffix;
    const mask=node('mask',{id,maskUnits:'userSpaceOnUse',x:0,y:0,width:1448,height:1086,style:'mask-type:alpha'},defs);
    node('image',{href:asset(`assets/masks/extension-${spec.pane}-${suffix}.png`),x:0,y:0,width:1448,height:1086},mask);
   }
   const group=node('g',{'data-extension-for':spec.pane},layer);
   node('rect',{x:0,y:0,width:1448,height:1086,fill:'#131218',mask:`url(#ext-${spec.pane}-opening)`},group);
   const art=node('g',{mask:`url(#ext-${spec.pane}-art)`},group);
   const srcFrames=[...source.querySelectorAll('image')];
   const oldBox=window.GALLERY_REVIEW.geometry[spec.pane.startsWith('web')?'web':'mobile'].find(s=>s.id===spec.pane).box;
   // Upper-only crop: source colors and aspect ratio are preserved. Lower crop is never changed.
   const x=Math.min(oldBox[0],spec.box[0]),right=Math.max(oldBox[2],spec.box[2]);
   const top=spec.box[1],width=right-x,height=oldBox[3]-top;
   const frames=srcFrames.map(()=>node('image',{x,y:top,width,height,preserveAspectRatio:'xMidYMid slice'},art));
   items.push({source,srcFrames,frames,x,width,oldX:oldBox[0],oldWidth:oldBox[2]-oldBox[0]});
  }
 }
 function sync(){
  const scene=document.querySelector('#stage .scene');if(!scene)return;
  if(scene!==attachedScene)attach(scene);
  for(const item of items){
   set(item.frames[0].parentNode,'data-upper-order',item.source.getAttribute('data-order'));
   item.srcFrames.forEach((src,i)=>{
    const dest=item.frames[i];
    set(dest,'href',src.getAttribute('href')||'');set(dest,'data-topic-id',src.getAttribute('data-topic-id')||'');
    const phase=(Number(src.getAttribute('x'))-item.oldX)/item.oldWidth;
    set(dest,'x',item.x+phase*item.width);
   });
  }
  set(layer,'visibility',mode==='art'?'visible':'hidden');set(blackLayer,'visibility',mode==='glass'?'visible':'hidden');
  control.querySelectorAll('button').forEach(b=>set(b,'aria-pressed',String(b.dataset.mode===mode)));
 }
 control.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;mode=b.dataset.mode;sync();});
 const observer=new MutationObserver(records=>{
  if(records.some(r=>r.target===document.getElementById('stage')||(r.target.closest&&r.target.closest('[data-layer="covers"]'))))sync();
 });
 observer.observe(document.getElementById('stage'),{childList:true,subtree:true,attributes:true,attributeFilter:['x','href','data-topic-id','data-order']});
 sync();
})();
