/* Original cabinet construction. No artwork or production data dependencies. */
const compartments = Array.from({length: 6}, (_, i) => ({
  id: i + 1,
  // Reserved transparent artwork slots. A future approved asset uses src + alt;
  // its aspect ratio is preserved inside these viewBox coordinates.
  slots: [{shelf: 3 + i % 2, x: 48, width: 70 + i % 3 * 12, height: 38, src: null, alt: ''}]
}));
const num = n => String(n).padStart(2, '0');
function cabinetSVG(count = 6, active = 0, prefix = 'main') {
  const cell = 200, left = 60, top = 40, height = 510, width = count * cell;
  const full = width + 120;
  const defs = `<defs>
    <linearGradient id="${prefix}-back" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#d5ded7"/><stop offset=".22" stop-color="#eff2e9"/><stop offset=".65" stop-color="#e1e8df"/><stop offset="1" stop-color="#cbd6ce"/></linearGradient>
    <linearGradient id="${prefix}-metal"><stop stop-color="#5c6d64"/><stop offset=".16" stop-color="#dce2dc"/><stop offset=".36" stop-color="#fbfcf7"/><stop offset=".5" stop-color="#c2ccc4"/><stop offset=".8" stop-color="#829187"/><stop offset="1" stop-color="#d9dfd6"/></linearGradient>
    <linearGradient id="${prefix}-rail" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#fafff8"/><stop offset=".3" stop-color="#c5d0c7"/><stop offset=".58" stop-color="#7c9083"/><stop offset=".8" stop-color="#c1cec1"/><stop offset="1" stop-color="#edf3e9"/></linearGradient>
    <linearGradient id="${prefix}-glass" x1="0" y1="0" x2="1" y2=".23"><stop stop-color="#fafff4" stop-opacity=".09"/><stop offset=".43" stop-color="#fff" stop-opacity=".02"/><stop offset=".49" stop-color="#fff" stop-opacity=".33"/><stop offset=".63" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#9db6aa" stop-opacity=".08"/></linearGradient>
    <linearGradient id="${prefix}-shelf" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e7eee3" stop-opacity=".1"/><stop offset="1" stop-color="#adc3b4" stop-opacity=".45"/></linearGradient>
    <linearGradient id="${prefix}-shade"><stop stop-color="#334e3e" stop-opacity=".18"/><stop offset="1" stop-color="#516852" stop-opacity="0"/></linearGradient>
    <filter id="${prefix}-shadow" x="-20%" y="-20%" width="150%" height="160%"><feGaussianBlur stdDeviation="12"/></filter>
    <clipPath id="${prefix}-clip"><rect x="${left}" y="${top}" width="${width}" height="${height}"/></clipPath>
  </defs>`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${full} 632" aria-hidden="true">${defs}`;
  s += `<rect x="${left+15}" y="${top+19}" width="${width+8}" height="${height+8}" fill="#435349" opacity=".15" filter="url(#${prefix}-shadow)"/>
    <path d="M${left},${top} l24,-17 h${width} l-24,17Z" fill="#dce3da" stroke="#a9b4a9" stroke-width=".8"/>
    <path d="M${left+width},${top} l24,-17 v${height} l-24,17Z" fill="#bac7bc" fill-opacity=".55" stroke="#9baa9d" stroke-width=".9"/>
    <rect x="${left}" y="${top}" width="${width}" height="${height}" fill="url(#${prefix}-back)"/>`;
  for (let c=0;c<count;c++) {
    const x=left+c*cell, data=compartments[count===1?active:c];
    s+=`<path d="M${x+5},${top+5} h20 v${height-9} h-20Z" fill="url(#${prefix}-shade)"/><path d="M${x+cell-17},${top+5} v${height-10}" stroke="#9eafa1" stroke-opacity=".55" stroke-width="2"/>`;
    for (let i=0;i<19;i++) s+=`<circle cx="${x+12}" cy="${top+22+i*25}" r=".9" fill="#7e8d81" opacity=".55"/><circle cx="${x+cell-13}" cy="${top+22+i*25}" r=".9" fill="#7e8d81" opacity=".55"/>`;
    for(let row=1;row<=8;row++){
      const y=top+row*56;
      s+=`<path d="M${x+3},${y+11} L${x+23},${y-2} H${x+cell-16} L${x+cell-3},${y+11}Z" fill="url(#${prefix}-shelf)" stroke="#aabdaf" stroke-opacity=".7" stroke-width=".7"/><path d="M${x+23},${y-2} H${x+cell-16}" stroke="#819c88" stroke-opacity=".35"/><rect x="${x+3}" y="${y+11}" width="${cell-6}" height="2.8" fill="url(#${prefix}-rail)"/><path d="M${x+3},${y+14} h${cell-6}" stroke="#667e6a" stroke-opacity=".22"/><rect x="${x+7}" y="${y+12}" width="6" height="3" fill="#889a8b"/><rect x="${x+cell-12}" y="${y+12}" width="6" height="3" fill="#889a8b"/>`;
    }
    for(const slot of data.slots){
      const sy=top+slot.shelf*56+10, sx=x+slot.x;
      if(slot.src){
        // DOM assignment below is intentionally not used with untrusted URLs.
        // Future assets must be local, approved files with a descriptive alt.
        const safe=slot.src.replace(/[&<>"']/g,'');
        s+=`<image href="${safe}" x="${sx}" y="${sy-slot.height}" width="${slot.width}" height="${slot.height}" preserveAspectRatio="xMidYMax meet"><title>${slot.alt.replace(/[&<>]/g,'')}</title></image>`;
      } else {
        s+=`<rect x="${sx}" y="${sy-slot.height}" width="${slot.width}" height="${slot.height}" fill="none" stroke="#708a77" stroke-opacity=".32" stroke-width=".75" stroke-dasharray="3 4"/><text x="${sx+slot.width/2}" y="${sy-slot.height/2+3}" text-anchor="middle" fill="#758579" font-family="sans-serif" font-size="7" letter-spacing="1.5">占位 ${num(data.id)}</text>`;
      }
    }
    s+=`<rect x="${x+3}" y="${top+3}" width="${cell-6}" height="${height-6}" fill="url(#${prefix}-glass)"/><path d="M${x+cell-12},${top+9} v${height-19}" stroke="#fafff6" stroke-opacity=".65"/>`;
    // A slender latch and two small hinges give the transparent face a physical scale.
    s+=`<rect x="${x+cell-12}" y="${top+height*.48}" width="3.5" height="26" rx="1" fill="url(#${prefix}-metal)" stroke="#8b9c8c" stroke-width=".5"/>`;
    [91,411].forEach(h=>s+=`<rect x="${x+2}" y="${top+h}" width="5" height="12" fill="url(#${prefix}-metal)" stroke="#9aa89b" stroke-width=".5"/>`);
  }
  s+=`<g clip-path="url(#${prefix}-clip)" fill="#fff"><path d="M${left+width*.14},${top} h${width*.05} l-120,${height} h-${width*.05}Z" opacity=".15"/><path d="M${left+width*.65},${top} h${width*.11} l-120,${height} h-${width*.11}Z" opacity=".12"/></g>`;
  for(let c=0;c<=count;c++) s+=`<rect x="${left+c*cell-2.8}" y="${top-1}" width="5.6" height="${height+2}" fill="url(#${prefix}-metal)" stroke="#809282" stroke-width=".35"/>`;
  s+=`<rect x="${left-3}" y="${top-3}" width="${width+6}" height="6" fill="url(#${prefix}-rail)" stroke="#98a898" stroke-width=".6"/><rect x="${left-3}" y="${top+height-2}" width="${width+6}" height="7" fill="url(#${prefix}-rail)" stroke="#93a390" stroke-width=".6"/><path d="M${left+width+5},${top+height+3} l18,-15" fill="none" stroke="#869a88"/><path d="M${left+24},${top-16} h${width}" stroke="#fcfff7" stroke-width="1.5"/></svg>`;
  return s;
}
const $ = id => document.getElementById(id);
$('cabinet-art').innerHTML = cabinetSVG();
const viewport=$('viewport'), dialog=$('observation');
let current=0, openIndex=0, returnFocus=null, savedScroll=0, savedPage=0;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
compartments.forEach((c,i)=>{
  const button=document.createElement('button');button.type='button';button.className='compartment';button.setAttribute('aria-label',`打开第 ${num(c.id)} 格观察视图`);button.setAttribute('aria-haspopup','dialog');button.innerHTML=`<span class="compartment-number">${num(c.id)}</span>`;
  button.addEventListener('click',()=>openCompartment(i,button));$('targets').append(button);
  const map=document.createElement('button');map.type='button';map.setAttribute('aria-label',`浏览第 ${num(c.id)} 格`);map.addEventListener('click',()=>moveTo(i));$('minimap').append(map);
});
function updatePosition(i){current=Math.max(0,Math.min(5,i));$('position').textContent=`${num(current+1)} / 06`;$('minimap').querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-current',String(j===current)));$('previous').disabled=current===0;$('next').disabled=current===5;}
function moveTo(i){
  i=Math.max(0,Math.min(5,i));
  if(document.body.classList.contains('overview'))toggleOverview(false);
  const travel=viewport.scrollWidth-viewport.clientWidth;
  viewport.scrollTo({left:travel*i/5,behavior:reduced()?'instant':'smooth'});updatePosition(i);
}
let raf=0;viewport.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{if(document.body.classList.contains('overview'))return;const travel=viewport.scrollWidth-viewport.clientWidth;updatePosition(travel>0?Math.round(viewport.scrollLeft/travel*5):0);});},{passive:true});
$('previous').addEventListener('click',()=>moveTo(current-1));$('next').addEventListener('click',()=>moveTo(current+1));
function toggleOverview(force){const state=force??!document.body.classList.contains('overview');document.body.classList.toggle('overview',state);$('overview').setAttribute('aria-pressed',String(state));$('overview').textContent=state?'靠近看 ↙':'看全柜 ↗';if(state)viewport.scrollLeft=0;}
$('overview').addEventListener('click',()=>{const was=document.body.classList.contains('overview');toggleOverview();if(was)moveTo(current);});
function renderDetail(i){openIndex=i;$('detail-art').innerHTML=cabinetSVG(1,i,'detail');$('observation-title').textContent=`观察格室 ${num(i+1)}`;$('detail-number').textContent=`COMPARTMENT ${num(i+1)} / 06`;$('detail-position').textContent=`${num(i+1)} / 06`;$('detail-prev').disabled=i===0;$('detail-next').disabled=i===5;}
function openCompartment(i,button){returnFocus=button;savedScroll=viewport.scrollLeft;savedPage=window.scrollY;renderDetail(i);dialog.showModal();document.body.style.overflow='hidden';}
function closeCompartment(){dialog.close();}
$('close').addEventListener('click',closeCompartment);
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeCompartment();});
dialog.addEventListener('close',()=>{document.body.style.overflow='';returnFocus?.focus({preventScroll:true});viewport.scrollLeft=savedScroll;window.scrollTo({top:savedPage,behavior:'instant'});});
$('detail-prev').addEventListener('click',()=>{renderDetail(openIndex-1);if($('detail-prev').disabled)$('detail-next').focus();});$('detail-next').addEventListener('click',()=>{renderDetail(openIndex+1);if($('detail-next').disabled)$('detail-prev').focus();});
updatePosition(0);
// Keep keyboard navigation inside the observation layer, including reverse Tab.
dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...dialog.querySelectorAll('button:not(:disabled),[href],input,[tabindex="0"]')];
  const first=controls[0], last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
