import {renderLayout} from './layout-renderer.js';

// The editable art and the editor preview use the exact same renderer and saved document.
// Functional controls remain independent, accessible HTML above/after the art.
let documentState=null,revision=-1;
const artConfig=document.querySelector('meta[name="park-art-layout"]');
const artSource=artConfig?.getAttribute('content')||'./api/art-layout';
const liveArt=artConfig?.dataset.live!=='false';
export function applyArt() {
  if(!documentState)return;
  const mode=innerWidth<=700?'mobile':'desktop';
  for(const target of document.querySelectorAll('.asset-slot[data-art-slot],.entrance-scene[data-art-slot]')){
    const page=documentState.pages.find(p=>p.artSlot===target.dataset.artSlot);
    const existing=target.querySelector(':scope > .shared-art');
    const layout=page?.layouts[mode];
    if(!layout?.elements.length){existing?.remove();if(target.classList.contains('entrance-scene'))target.querySelectorAll('.entrance-layer').forEach(n=>n.hidden=false);else if(target.dataset.originalMarkup!==undefined){target.innerHTML=target.dataset.originalMarkup;target.classList.remove('art-bound');target.style.height='';}continue;}
    if(target.dataset.originalMarkup===undefined&&target.classList.contains('asset-slot'))target.dataset.originalMarkup=target.innerHTML;
    const frame=existing||document.createElement('div');frame.className='shared-art';
    const art=document.createElement('div');renderLayout(art,layout,documentState.assets);
    const width=target.clientWidth||layout.width,scale=width/layout.width;
    art.style.transform=`scale(${scale})`;art.style.transformOrigin='top left';
    frame.replaceChildren(art);frame.style.height=layout.height*scale+'px';
    if(target.classList.contains('entrance-scene')){frame.style.position='absolute';frame.style.inset='0';target.querySelectorAll('.entrance-layer').forEach(n=>n.hidden=true);if(!existing)target.prepend(frame);}
    else {target.classList.add('art-bound');target.style.height=layout.height*scale+'px';target.replaceChildren(frame);}
  }
}
export async function refreshArt() {
  try{const response=await fetch(artSource);if(!response.ok)return;const state=await response.json();if(state.revision===revision)return;revision=state.revision;documentState=state.document;applyArt();}catch{/* Missing local editor does not block the functional prototype. */}
}
export function startArtBridge(){refreshArt();const timer=liveArt?setInterval(refreshArt,2500):null;let resizeTimer;const resize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(applyArt,100);};window.addEventListener('resize',resize);return()=>{if(timer!==null)clearInterval(timer);clearTimeout(resizeTimer);window.removeEventListener('resize',resize);};}
