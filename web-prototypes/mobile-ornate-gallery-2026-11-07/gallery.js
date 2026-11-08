'use strict';
const main=document.querySelector('#main'),settings=document.querySelector('#settings'),original=document.querySelector('#original');
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
let data,chapter,lastFocus;
const scrollPositions=new Map();let previousHash='';
const key=id=>Array.from(new TextEncoder().encode(id),n=>n.toString(16).padStart(2,'0')).join('');
function termURL(t){return `/terms/${key(t.id)}/?from=${encodeURIComponent(chapter.id)}`}
function art(t,i){
 if(!t.cover)return '';
 const ratio=t.width/t.height,format=ratio<.9?'portrait':ratio>2?'panorama':'landscape';
 return `<figure class="art-figure"><div class="art-holder" data-format="${format}" style="--art-max:${Math.min(t.width,900)}px"><button class="frame" data-tone="${t.tone}" data-original="${e(t.id)}" style="--ratio:${t.width}/${t.height}" aria-label="查看${e(t.name)}封面原图"><img src="${e(t.cover)}" alt="${e(t.credit?.text||t.name+'词条封面')}" width="${t.width}" height="${t.height}" ${i?'loading="lazy"':'fetchpriority="high"'} decoding="async"></button></div><figcaption class="work-credit"><span class="credit-label">本节封面</span>${t.credit?e(t.credit.text):'作品出处待补，暂不标注作者与年代。'}</figcaption></figure>`;
}
function item(t,i){
 const ready=t.state.includes('已上线');
 return `<article class="exhibit ${t.cover?'':'unpictured'}" id="entry-${t.id}" data-term="${t.id}"><header class="section-label"><span class="exhibit-no">${pad(i+1)}</span><h2>${e(t.name)}${t.english&&t.english!==t.name?`<span lang="en">${e(t.english)}</span>`:''}</h2>${t.position?`<p class="position">${e(t.position)}</p>`:''}${!t.cover?`<p class="status">${ready?'封面待补，词条内容可阅读。':'本节更新中'}</p>`:''}</header>${art(t,i)}${ready||t.caseIds.length?`<a class="entry-link" href="${termURL(t)}"><span>走进${e(t.name)} ↗</span><small>${t.caseIds.length?`${t.caseIds.length} 个案例`: '阅读词条'}</small></a>`:''}</article>`;
}
function render(){
 if(previousHash)scrollPositions.set(previousHash,scrollY);
 const id=location.hash.split('/')[2]||'reczz28HJJL2A7E0';
 chapter=data.chapters.find(c=>c.id===id)||data.chapters[0];
 const order=chapter.name==='幽玄'?['朦胧','清冷','Softcore','梦境','空灵']:[];
 let terms=chapter.termIds.map(id=>data.terms.find(t=>t.id===id)).filter(Boolean);
 if(order.length)terms=terms.map((t,i)=>({t,i})).sort((a,b)=>(order.includes(a.t.name)?order.indexOf(a.t.name):a.i+order.length)-(order.includes(b.t.name)?order.indexOf(b.t.name):b.i+order.length)).map(x=>x.t);
 document.title=`${chapter.name} · 雕花画框自适应试样`;
 main.innerHTML=`<div class="page"><nav class="nav"><a href="http://127.0.0.1:8840/entrance/?at=1&topic=${data.chapters.indexOf(chapter)}">← 返回一级专题</a><button data-choose>切换专题 ↓</button></nav><header class="chapter-head"><p class="chapter-no">CHAPTER ${pad(chapter.order)} / ${data.chapters.length}</p><div class="identity"><h1>${e(chapter.name)}</h1><span lang="en">${e(chapter.english)}</span></div><p class="definition">${e(chapter.definition)}</p><div class="chapter-intro"><a href="http://127.0.0.1:8840/#/chapter-story/${chapter.id}">读本章引言 ↗</a></div><nav class="chapter-index" aria-label="本章观看顺序">${terms.map((t,i)=>`<a href="#entry-${t.id}" data-entry="entry-${t.id}"><small>${pad(i+1)}</small>${e(t.name)}</a>`).join('')}</nav></header><section class="gallery" aria-label="${e(chapter.name)}图录">${terms.map(item).join('')}</section><footer class="chapter-end"><span>${terms.length} 节 · ${terms.filter(t=>t.state.includes('已上线')).length} 节已展开</span><button data-top>回到章首 ↑</button></footer></div>`;
 document.querySelector('#chapter-choice').value=chapter.id;
 document.querySelector('#old-view').href=`http://127.0.0.1:8840/#/chapter/${chapter.id}`;
 previousHash=location.hash;
 main.focus({preventScroll:true});
 requestAnimationFrame(()=>scrollTo(0,scrollPositions.get(location.hash)||0));
 main.querySelectorAll('.frame img').forEach(img=>img.addEventListener('error',()=>{const b=img.closest('button');b.textContent='作品图暂时无法加载';b.style.lineHeight='1.8';b.style.padding='24px';},{once:true}));
}
function openSettings(b){lastFocus=b;settings.showModal()}
document.querySelector('#settings-open').onclick=event=>openSettings(event.currentTarget);
document.querySelector('#chapter-choice').onchange=event=>{location.hash=`/chapter/${event.target.value}`;settings.close()};
document.querySelector('#tone-choice').onchange=event=>document.body.dataset.tone=event.target.value;
document.addEventListener('click',event=>{
 const target=event.target.closest('a,button');if(!target)return;
 if(target.matches('[data-close]'))target.closest('dialog').close();
 if(target.matches('[data-choose]'))openSettings(target);
 if(target.matches('[data-top]'))scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 if(target.dataset.entry){event.preventDefault();document.getElementById(target.dataset.entry)?.scrollIntoView({block:'start'});}
 if(target.dataset.original){lastFocus=target;const t=data.terms.find(t=>t.id===target.dataset.original);const img=original.querySelector('img');img.src=t.cover;img.alt=t.credit?.text||t.name+'词条封面';original.querySelector('p').textContent=t.credit?.text||t.name+'词条封面，作品出处待补';original.showModal();}
});
for(const dialog of [settings,original])dialog.addEventListener('close',()=>lastFocus?.isConnected&&lastFocus.focus({preventScroll:true}));
window.addEventListener('hashchange',()=>data&&render());
fetch('gallery.json').then(r=>{if(!r.ok)throw new Error();return r.json()}).then(d=>{data=d;document.querySelector('#chapter-choice').innerHTML=d.chapters.map(c=>`<option value="${c.id}">${pad(c.order)} ${e(c.name)}</option>`).join('');render()}).catch(()=>main.innerHTML='<p class="error">图录暂时无法加载，请刷新重试。</p>');
