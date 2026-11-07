'use strict';
history.scrollRestoration='manual';
const main = document.querySelector('#main');
const lightbox = document.querySelector('#lightbox');
const chooser = document.querySelector('#chooser');
let catalog, frames, generation = 0, currentRoute = '', currentFocus = '', restoreFocus;
const positions = new Map(JSON.parse(sessionStorage.getItem('catalog-positions') || '[]'));
window.addEventListener('pagehide',()=>{if(currentRoute)positions.set(currentRoute,scrollY);sessionStorage.setItem('catalog-positions',JSON.stringify([...positions]));});
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs = value => String(value || '').replace(/\\n/g,'\n').split(/\n+/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
const online = t => t.state.includes('已上线');
const pad = n => String(n).padStart(2, '0');
const chapterById = id => catalog.chapters.find(c => c.id === id);
const termById = id => catalog.terms.find(t => t.id === id);
const termURL = (t, chapter) => `#/term/${t.id}${chapter ? '?from=' + chapter.id : ''}`;
const safeLink = v => { try { const u = new URL(typeof v === 'object' ? v.link : v); return /^https?:$/.test(u.protocol) ? esc(u.href) : ''; } catch { return ''; } };
const photo = (url, alt, cls = '', lazy = true) => `<img class="${cls}" src="${esc(url)}" alt="${esc(alt)}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`;
async function api(path) { const r = await fetch(path); if (!r.ok) throw new Error(r.status === 404 ? '这条内容暂时找不到。' : '内容暂时无法加载。'); return r.json(); }
function title(value) { document.title = `${value} · 审美外挂`; }
function backBar(label, href, dark = false) { return `<nav class="topbar ${dark ? 'dark' : ''}" aria-label="页面导航"><a href="${href}">← ${esc(label)}</a><a href="#/chapters">审美外挂</a></nav>`; }
function primaryTerms(chapter) {
 const terms = chapter.termIds.map(termById).filter(Boolean);
 // Presentation order is separate from content and image dimensions. Unlisted additions still appear.
 const order = chapter.name === '幽玄' ? ['朦胧','清冷','Softcore','梦境','空灵'] : [];
 return terms.map((t,i) => ({t,i})).sort((a,b) => (order.includes(a.t.name) ? order.indexOf(a.t.name) : a.i + order.length) - (order.includes(b.t.name) ? order.indexOf(b.t.name) : b.i + order.length)).map(x=>x.t);
}
function frameCard(t, index, chapter) {
 const art = frames[index % 5], [x,y,w,h,p] = art.slot;
 const ready = online(t), label = ready ? '打开词条 ↗' : '更新中';
 return `<article class="gallery-card shape-${index % 5}" id="entry-${t.id}" data-term="${t.id}" style="--frame-width:${art.width};--frame-height:${art.height}">
 <a class="card-link" href="${termURL(t,chapter)}" aria-label="${esc(t.name)}，${label}"><div class="frame-stage" style="aspect-ratio:${art.width}/${art.height}"><div class="native-art" style="width:${art.width}px;height:${art.height}px">${art.html}<div class="mount" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;padding:${p}px">${t.cover ? photo(t.cover,t.name,'artwork',index>1) : `<span class="image-state">${ready?'作品图待补':'更新中'}</span>`}</div></div></div><div class="caption"><h2>${esc(t.name)}</h2><span>${label}</span></div></a></article>`;
}
function chapterView(c) {
 title(c.name);const terms=primaryTerms(c);
 const groups=[];for(let i=0;i<terms.length;i+=5)groups.push(`<div class="gallery-group">${terms.slice(i,i+5).map((t,j)=>frameCard(t,i+j,c)).join('')}</div>`);
 main.innerHTML=`<div class="chapter-page paper"><nav class="chapter-nav"><a href="/entrance/?at=1&topic=${catalog.chapters.findIndex(item=>item.id===c.id)}">← 返回一级专题</a><button data-choose>切换专题 ↓</button></nav><div class="chapter-body"><header class="chapter-identity"><div class="identity-title"><h1 class="${c.name.length>3?'long-title':''}">${esc(c.name)}</h1><div class="identity-aside"><p>${esc(c.english)}</p><small>第${esc(c.order)}章 · ${pad(c.order)} / ${catalog.chapters.length}</small></div></div><p class="definition">${esc(c.definition).replace('，','，<wbr>')}</p><nav class="term-index" aria-label="本章分类">${terms.map(t=>`<button data-scroll="entry-${t.id}">${esc(t.name)}</button>`).join('')}</nav></header><section class="gallery-section" aria-label="${esc(c.name)}的二级专题"><div class="column" aria-hidden="true"><img src="/assets/84f05.png" alt=""></div><div class="column-fade" aria-hidden="true"></div><div class="cornice" aria-hidden="true"><div><img src="/assets/84f05.png" alt=""></div></div><div class="gallery">${groups.join('') || '<p class="empty">本章专题正在整理中。</p>'}</div></section></div><footer class="chapter-footer"><span>${terms.length} 个专题 · ${terms.filter(online).length} 个已展开</span><a href="#/chapter-story/${c.id}">读本章引言 ↗</a></footer></div>`;
 scaleFrames();
}
function chapterIndex(query='') {
 title('一级专题');
 main.innerHTML=`<div class="index-page paper">${backBar('首页','/entrance/')}<header><p class="eyebrow">A FIELD GUIDE TO AESTHETICS</p><h1>审美的二十四章</h1><p>从一种感觉，走进它的不同面貌。</p></header><label class="search-label">找专题或词条<input id="search" type="search" placeholder="例如：幽玄、梦核、Softcore" value="${esc(query)}"></label><div id="search-results"></div></div>`;
 filterIndex(query);document.querySelector('#search').addEventListener('input',e=>filterIndex(e.target.value));
}
function filterIndex(query) {
 const q=query.trim().toLowerCase(),found=catalog.chapters.filter(c=>(c.name+' '+c.english).toLowerCase().includes(q));
 const terms=q?catalog.terms.filter(t=>(t.name+' '+t.english+' '+t.chapterNames.join(' ')).toLowerCase().includes(q)):[];
 document.querySelector('#search-results').innerHTML=`<div class="chapter-grid">${found.map(c=>`<a href="#/chapter/${c.id}" class="chapter-tile"><span class="chapter-num">${pad(c.order)}</span><h2>${esc(c.name)}</h2><span class="chapter-en">${esc(c.english)}</span><p>${esc(c.definition)}</p><small>${c.termIds.length} 个专题 ↗</small></a>`).join('')}</div>${terms.length?`<h2 class="result-title">词条 · ${terms.length}</h2><div class="search-terms">${terms.map(t=>`<a href="${termURL(t)}">${esc(t.name)}<small>${online(t)?'打开词条 ↗':'更新中'}</small></a>`).join('')}</div>`:''}${!found.length&&!terms.length?'<p class="empty">没有找到，试试另一个名称。</p>':''}`;
}
function caseIndex() {
 title('作品案例');
 main.innerHTML=`<div class="index-page paper">${backBar('首页','/entrance/')}<header><h1>作品案例</h1></header><label class="search-label">搜索作品或作者<input id="case-search" type="search"></label><div id="case-results"></div></div>`;
 const render=query=>{document.querySelector('#case-results').innerHTML=allCases.filter(c=>(c.name+' '+c.author+' '+c.termName).toLowerCase().includes(query.toLowerCase())).map(c=>`<a class="case-index-link" href="#/case/${c.id}"><strong>${esc(c.name)}</strong><span>${esc([c.author,c.year,c.termName].filter(Boolean).join(' · '))}</span></a>`).join('');};
 render('');document.querySelector('#case-search').addEventListener('input',event=>render(event.target.value));
}
let allCases=[];
function chapterStory(c) {
 title(c.name+' · 引言');main.innerHTML=`<div class="story-page paper">${backBar(c.name+'图鉴',`#/chapter/${c.id}`)}<article class="reading"><p class="eyebrow">CHAPTER ${pad(c.order)}</p><h1>${esc(c.name)}</h1><p class="lead">${esc(c.hook)}</p>${c.cover?`<button class="image-button" data-image="${c.cover}" data-caption="${esc(c.coverCaption)}">${photo(c.cover,c.coverCaption)}</button><p class="credit">${esc(c.coverCaption)}</p>`:''}${c.sections.length?c.sections.map(s=>`<section><h2>${esc(s.title)}</h2>${paragraphs(s.text)}${s.images.map(src=>`<button class="image-button" data-image="${src}" data-caption="${esc(s.caption)}">${photo(src,s.caption)}</button>`).join('')}${s.caption?`<p class="credit">${esc(s.caption)}</p>`:''}</section>`).join(''):paragraphs(c.definerStory)}<a class="text-link" href="#/chapter/${c.id}">进入${esc(c.name)}图鉴 ↗</a></article></div>`;
}
function caseMarkup(c, index, standalone=false, origin=null) {
 const meta=[c.author,c.year,c.medium,c.collection].filter(Boolean).map(esc).join(' · ');
 const gallery=c.images.length?`<div class="case-images">${c.images.map((src,i)=>`<button class="image-button ${i?'secondary':''}" data-image="${esc(src)}" data-caption="${esc(c.name)}">${photo(src,c.name)}</button>`).join('')}</div>`:'';
 const fields=[['画面',c.scene],['细节',c.detail],['手法',c.method],['反转',c.twist],['缺席',c.absence],['补充讲解',c.extra]].filter(([,text])=>text);
 const official=safeLink(c.official);
 return `<section class="case-block" id="case-${c.id}"><header class="case-heading"><p class="eyebrow">CASE ${pad(index+1)}</p><h2>${esc(c.name)}</h2><p class="case-meta">${meta}</p></header><div class="standalone-case-layout">${gallery}<div class="case-copy">${c.why?`<p class="case-why">${esc(c.why)}</p>`:''}${paragraphs(c.whyLong)}${fields.map(([label,text])=>`<section><h3>${label}</h3>${paragraphs(text)}</section>`).join('')}${official?`<a href="${official}" target="_blank" rel="noopener">作品官方页面 ↗</a>`:''}</div></div></section>`;
}
const observer=new ResizeObserver(entries=>{for(const {target,contentRect} of entries){const a=target.querySelector('.native-art');if(a)a.style.transform=`scale(${contentRect.width/parseFloat(a.style.width)})`;}});
function scaleFrames(){observer.disconnect();document.querySelectorAll('.frame-stage').forEach(el=>observer.observe(el));}
function hydrate(){
 document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;if(img.classList.contains('artwork'))img.parentElement.innerHTML='<span class="image-state">图片暂时无法加载</span>';else if(img.closest('.image-button'))img.parentElement.innerHTML='<span class="missing-image">图片暂时无法加载</span>';},{once:true}));
}
async function route(){
 if(currentRoute){positions.set(currentRoute,scrollY);currentFocus=document.activeElement?.closest('[data-term]')?.dataset.term||'';}
 const seq=++generation;observer.disconnect();if(lightbox.open)lightbox.close();if(chooser.open)chooser.close();
 if(!location.hash){location.replace('/entrance/');return;}
 const hash=location.hash;
 currentRoute=hash;const [path,search='']=hash.slice(1).split('?');const [,kind,id]=path.split('/');
 const origin=chapterById(new URLSearchParams(search).get('from'));
 try {
  if(kind==='chapters')chapterIndex();
  else if(kind==='cases')caseIndex();
  else if(kind==='chapter'||kind==='chapter-story'){const c=chapterById(id);if(!c)throw new Error('没有找到这个专题。');kind==='chapter'?chapterView(c):chapterStory(c);}
  else if(kind==='term'){location.assign('/terms/'+encodeURIComponent(id)+'/'+(origin?'?from='+encodeURIComponent(origin.id):''));return;}
  else if(kind==='case'){main.innerHTML='<p class="loading" role="status">正在展开案例…</p>';const c=await api('/api/cases/'+encodeURIComponent(id));if(seq!==generation)return;const t=catalog.terms.find(t=>t.name===c.termName);title(c.name);main.innerHTML=`<div class="case-page paper">${backBar(t?t.name:'全部专题',t?termURL(t,origin):'#/chapters')}<article class="reading">${caseMarkup(c,0,true)}</article></div>`;}
  else throw new Error('没有找到这个页面。');
  hydrate();main.focus({preventScroll:true});requestAnimationFrame(()=>{if(seq===generation)scrollTo(0,positions.get(hash)||0);});
 }catch(error){if(seq!==generation)return;main.innerHTML=`<div class="error-page paper"><h1>${esc(error.message)}</h1><p>你可以重试，或返回专题目录。</p><button data-retry>重新加载</button><a href="#/chapters">全部专题 ↗</a></div>`;}
}
function openImage(button){restoreFocus=button;lightbox.querySelector('img').src=button.dataset.image;lightbox.querySelector('img').alt=button.dataset.caption||'作品原图';lightbox.querySelector('p').textContent=button.dataset.caption||'';lightbox.showModal();}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.matches('[data-choose]')){restoreFocus=b;chooser.querySelector('.chapter-options').innerHTML=catalog.chapters.map(c=>`<a href="#/chapter/${c.id}"><span>${pad(c.order)}</span>${esc(c.name)}</a>`).join('');chooser.showModal();}
 if(b.dataset.scroll){const el=document.getElementById(b.dataset.scroll);el?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});el?.querySelector('a')?.focus({preventScroll:true});}
 if(b.dataset.image)openImage(b);
 if(b.matches('.close'))b.closest('dialog').close();
 if(b.matches('[data-retry]'))catalog?route():start();
});
for(const dialog of [lightbox,chooser]){dialog.addEventListener('close',()=>restoreFocus?.isConnected&&restoreFocus.focus({preventScroll:true}));dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});}
window.addEventListener('hashchange',()=>catalog&&route());
async function start(){try{[catalog,frames,allCases]=await Promise.all([api('/api/catalog'),api('/assets/frames.json'),api('/cases/index.json')]);await route();}catch{main.innerHTML='<div class="error-page"><h1>图鉴暂时无法加载</h1><p>请稍后重试。</p><button data-retry>重新加载</button></div>';}}
start();
