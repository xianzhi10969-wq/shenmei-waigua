const ns='http://www.w3.org/2000/svg';
const ART='../../web-prototypes/p3-stained-glass-v3-2026-10-23/assets/m_p1_notext_original_v20261101.png';
const BRAND='../../web-prototypes/p1-p3-continuous-2026-10-31/assets/p1-brand-companion-v20261101.svg';
const layouts={
 original:{main:[13.56,82,272.4,272.85],sub:[66,355.7,160,22.4]},
 a:{main:[1,114,300,300.496],sub:[94,483,144,20.16]},
 b:{main:[68,65,224,224.37],sub:[102,292,156,21.84]}
};
window.studyLayouts=layouts;
function svgEl(name,attrs){const e=document.createElementNS(ns,name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e}
function frame(){return svgEl('svg',{viewBox:'0 0 390 844','aria-hidden':'true'})}
function structure(layout){const s=frame();s.classList.add('structure');s.innerHTML='<rect width="390" height="844" fill="white"/><g fill="none" stroke="#222" stroke-width="1.2"><path d="M234 440 Q251 389 289 392 Q331 390 351 461 L390 520 L390 844 L233 844 L205 789 L206 584 L144 571 L132 566 L137 557 L159 557 L215 570 L270 563 L270 509 Q247 480 234 440Z"/><path d="M0 563 L26 522 Q61 499 71 468 L66 439 L72 412 L78 439 L74 468 Q91 500 123 522 L141 563 L141 680 L166 697 L143 712 L0 712 M19 680 L19 566 Q25 546 72 516 Q122 546 126 566 L126 680 M72 563 L72 679"/><path d="M72 592 L77 610 L95 613 L78 618 L72 638 L67 618 L48 613 L67 610Z"/><path d="M0 760 L205 760 M0 806 L205 806 M0 844 L206 771" stroke-dasharray="3 5"/></g>';
 for(const [key,label]of [['main','主字标'],['sub','从有感觉到有风格']]){const[x,y,w,h]=layout[key];s.append(svgEl('rect',{x,y,width:w,height:h,fill:'white',stroke:'#222','stroke-width':1}));const t=svgEl('text',{x:x+w/2,y:y+h/2,'text-anchor':'middle','dominant-baseline':'middle','font-size':key==='main'?25:11,fill:'#222'});t.textContent=label;s.append(t)}return s}
async function init(){const response=await fetch(BRAND);if(!response.ok)throw Error('字标加载失败');const xml=new DOMParser().parseFromString(await response.text(),'image/svg+xml');const originals=xml.documentElement.querySelector('g > svg').children;
 for(const figure of document.querySelectorAll('figure[data-name]')){const key=figure.dataset.name,l=layouts[key],page=figure.querySelector('.page');const img=new Image();img.className='art';img.alt='原始首页插画';img.src=ART;page.append(img);const svg=frame();svg.classList.add('lettering');svg.setAttribute('role','img');svg.setAttribute('aria-label','审美外挂，从有感觉到有风格');svg.removeAttribute('aria-hidden');for(const [i,name]of ['main','sub'].entries()){const element=document.importNode(originals[i],true);const[x,y,w,h]=l[name];for(const[k,v]of Object.entries({x,y,width:w,height:h,id:key+'-'+name}))element.setAttribute(k,v);svg.append(element)}page.append(svg,structure(l))}
 document.documentElement.dataset.ready='true';
}
for(const button of document.querySelectorAll('[data-version]'))button.addEventListener('click',()=>{for(const b of document.querySelectorAll('[data-version]'))b.setAttribute('aria-pressed',String(b===button));for(const f of document.querySelectorAll('figure[data-name]'))f.classList.toggle('selected',f.dataset.name===button.dataset.version)});
document.getElementById('wire').addEventListener('click',e=>{const on=document.body.classList.toggle('wire');e.currentTarget.setAttribute('aria-pressed',String(on));e.currentTarget.textContent=on?'看原画试排':'看黑线结构'});
init().catch(e=>{document.querySelector('header p').textContent=e.message;console.error(e)});
