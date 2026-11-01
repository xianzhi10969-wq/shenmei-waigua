'use strict';
history.scrollRestoration='manual';
const main = document.querySelector('#main');
const lightbox = document.querySelector('#lightbox');
const chooser = document.querySelector('#chooser');
let catalog, frames, generation = 0, currentRoute = '', currentFocus = '', restoreFocus;
const positions = new Map();
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
function chapterStory(c) {
 title(c.name+' · 引言');main.innerHTML=`<div class="story-page paper">${backBar(c.name+'图鉴',`#/chapter/${c.id}`)}<article class="reading"><p class="eyebrow">CHAPTER ${pad(c.order)}</p><h1>${esc(c.name)}</h1><p class="lead">${esc(c.hook)}</p>${c.cover?`<button class="image-button" data-image="${c.cover}" data-caption="${esc(c.coverCaption)}">${photo(c.cover,c.coverCaption)}</button><p class="credit">${esc(c.coverCaption)}</p>`:''}${c.sections.length?c.sections.map(s=>`<section><h2>${esc(s.title)}</h2>${paragraphs(s.text)}${s.images.map(src=>`<button class="image-button" data-image="${src}" data-caption="${esc(s.caption)}">${photo(src,s.caption)}</button>`).join('')}${s.caption?`<p class="credit">${esc(s.caption)}</p>`:''}</section>`).join(''):paragraphs(c.definerStory)}<a class="text-link" href="#/chapter/${c.id}">进入${esc(c.name)}图鉴 ↗</a></article></div>`;
}
function caseMarkup(c, index, standalone=false, origin=null) {
 const official=safeLink(c.official);
 const body=[['画面',c.scene],['为什么好',c.whyLong],['细节',c.detail],['手法',c.method],['反转',c.twist],['缺席',c.absence],['补充',c.extra]].filter(x=>x[1]);
 return `<section class="case-block" id="case-${c.id}"><div class="case-heading"><p class="eyebrow">CASE ${pad(index+1)} · ${esc(c.medium)}</p><h2>${esc(c.name)}</h2>${c.originalName?`<p class="original-name">${esc(c.originalName)}</p>`:''}<p class="case-meta">${[c.author,c.year,c.collection].filter(Boolean).map(esc).join(' · ')}</p></div>${c.images.length?`<div class="case-images">${c.images.map((src,i)=>`<button class="image-button ${i?'secondary':''}" data-image="${src}" data-caption="${esc(c.name+' · '+(c.caption||c.author))}" aria-label="查看${esc(c.name)}原图 ${i+1}">${photo(src,c.caption||c.name)}</button>`).join('')}</div>`:'<p class="missing-image">作品图待补，文字内容可先阅读。</p>'}${c.caption?`<p class="credit">${esc(c.caption)}</p>`:''}${c.why?`<p class="case-why">${esc(c.why)}</p>`:''}<div class="case-copy">${body.map(([label,text])=>`<section><h3>${label}</h3>${paragraphs(text)}</section>`).join('')}</div><div class="case-links">${official?`<a href="${official}" target="_blank" rel="noopener noreferrer">作品出处 ↗</a>`:''}${!standalone?`<a href="#/case/${c.id}${origin?'?from='+origin.id:''}">单独阅读此案例 ↗</a>`:''}</div></section>`;
}
function termView(t, origin) {
 const c=origin&&t.chapterNames.includes(origin.name)?origin:catalog.chapters.find(c=>t.chapterNames.includes(c.name));
 title(t.name);
 if(!online(t)) {
  main.innerHTML=`<div class="pending-page paper">${backBar(c?c.name+'图鉴':'全部专题',c?'#/chapter/'+c.id:'#/chapters')}<article class="reading"><p class="eyebrow">IN THE MAKING</p><h1>${esc(t.name)}</h1><p class="english">${esc(t.english)}</p><p class="lead">这一页正在整理中。</p><p>先沿着同一章，看看已经展开的专题。</p><div class="related">${(c?primaryTerms(c):catalog.terms).filter(x=>online(x)&&x.id!==t.id).map(x=>`<a href="${termURL(x,c)}">${esc(x.name)} ↗</a>`).join('')}</div></article></div>`;return;
 }
 const related=(Array.isArray(t.nextNames)?t.nextNames:[]).map(name=>catalog.terms.find(x=>x.name===name)).filter(Boolean);
 main.innerHTML=`<div class="term-page">${backBar(c?c.name+'图鉴':'全部专题',c?'#/chapter/'+c.id:'#/chapters',true)}<header class="term-hero"><img class="engraving" src="/assets/b37fc.png" alt=""><img class="flourish" src="/assets/6708d.png" alt=""><div class="hero-content"><p class="eyebrow">${esc(c?.name||'审美图鉴')} / ${esc(t.name)}</p><h1>${esc(t.name)}</h1>${t.english&&t.english!==t.name?`<p class="hero-english">${esc(t.english)}</p>`:''}<div class="hero-bottom"><p>${esc(t.position||t.core)}</p>${t.cover?`<button class="image-button hero-cover" data-image="${t.cover}" data-caption="${esc(t.name)}">${photo(t.cover,t.name,'',false)}</button>`:''}</div></div></header><div class="term-intro paper"><div class="reading"><p class="eyebrow">01 / 从一种感觉开始</p><div class="intro-hook">${paragraphs(t.hook)}</div><p class="core">${esc(t.core)}</p></div></div><div class="term-cases"><div class="reading">${t.cases.length?t.cases.map((item,i)=>caseMarkup(item,i,false,c)).join(''):'<section class="case-block"><p class="eyebrow">作品案例</p><p>案例正在整理中。</p></section>'}</div></div>${t.steps.length||t.mistake?`<section class="practice paper"><div class="reading"><p class="eyebrow">把感觉用起来</p><h2>可以这样试</h2><ol>${t.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${t.mistake?`<h3>容易做俗的地方</h3>${paragraphs(t.mistake)}`:''}</div></section>`:''}<footer class="term-footer"><div class="reading"><p class="eyebrow">继续找，继续看</p><h2>${esc(t.name)}，还可以往哪里走？</h2>${t.pinterest||t.searchTerms?`<p class="keywords">${esc(t.pinterest||t.searchTerms)}</p>`:''}<div class="related">${related.map(x=>`<a href="${termURL(x,c)}">${esc(x.name)} ↗</a>`).join('')}</div><a href="${c?'#/chapter/'+c.id:'#/chapters'}">← 回到${esc(c?.name||'全部专题')}图鉴</a></div></footer></div>`;
}
const observer=new ResizeObserver(entries=>{for(const {target,contentRect} of entries){const a=target.querySelector('.native-art');if(a)a.style.transform=`scale(${contentRect.width/parseFloat(a.style.width)})`;}});
function scaleFrames(){observer.disconnect();document.querySelectorAll('.frame-stage').forEach(el=>observer.observe(el));}
function hydrate(){
 document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;if(img.classList.contains('artwork'))img.parentElement.innerHTML='<span class="image-state">图片暂时无法加载</span>';else if(img.closest('.image-button'))img.parentElement.innerHTML='<span class="missing-image">图片暂时无法加载</span>';},{once:true}));
}
async function route(){
 if(currentRoute){positions.set(currentRoute,scrollY);currentFocus=document.activeElement?.closest('[data-term]')?.dataset.term||'';}
 const seq=++generation;observer.disconnect();if(lightbox.open)lightbox.close();if(chooser.open)chooser.close();
 const hash=location.hash||'#/chapter/'+catalog.chapters.find(c=>c.name==='幽玄').id;
 currentRoute=hash;const [path,search='']=hash.slice(1).split('?');const [,kind,id]=path.split('/');
 const origin=chapterById(new URLSearchParams(search).get('from'));
 try {
  if(kind==='chapters')chapterIndex();
  else if(kind==='chapter'||kind==='chapter-story'){const c=chapterById(id);if(!c)throw new Error('没有找到这个专题。');kind==='chapter'?chapterView(c):chapterStory(c);}
  else if(kind==='term'){main.innerHTML='<p class="loading" role="status">正在展开词条…</p>';const t=await api('/api/terms/'+encodeURIComponent(id));if(seq!==generation)return;termView(t,origin);}
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
async function start(){try{[catalog,frames]=await Promise.all([api('/api/catalog'),api('/assets/frames.json')]);await route();}catch{main.innerHTML='<div class="error-page"><h1>图鉴暂时无法加载</h1><p>请稍后重试。</p><button data-retry>重新加载</button></div>';}}
start();
