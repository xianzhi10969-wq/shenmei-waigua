import {STORAGE_KEY,DRAFT_KEY,OPERATIONS,isOpen,queryTerms,randomTerm,pick,routeFor,parseRoute,validateExperience,lineFor,firstPerson,makeSections,promptText,filterImagery,emptyNotebook,readNotebook,updateNotebook,recordVisit,saveIdea,mergeNotebook} from './core.mjs';
import {applyArt,startArtBridge} from './art-bridge.mjs';

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL=value=>{if(typeof value!=='string'||!/^https?:\/\//i.test(value.trim()))return '';try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}};
const link=(label,href,cls='button')=>`<a class="${cls}" href="${esc(href)}">${esc(label)}</a>`;
const slot=(name,key)=>`<div class="asset-slot" data-art-slot="${key}">${esc(name)}<br>素材位置</div>`;
const heading=(code,title,description='')=>`<div class="page-heading"><div class="eyebrow">${esc(code)}</div><h1>${esc(title)}</h1>${description?`<p>${esc(description)}</p>`:''}</div>`;
const empty=(title,text)=>`<div class="empty"><strong>${esc(title)}</strong>${esc(text)}</div>`;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let catalog,features,experience,provenance,currentRoute,cleanup=()=>{},lastHash='',toastTimer,notebook=emptyNotebook();
let storageError='',browse={query:'',onlyOpen:false},previousGacha=null,questionId=null,notebookTab='visits';
let lab={operation:'encounter',theme:'',search:'',imageA:'',imageB:'',prompt:'',response:'',id:'',sourceId:null};
const scrollPositions=new Map();

function notice(message){$('notice').textContent=message;$('notice').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('notice').hidden=true,4500);}
function readSaved(){try{notebook=readNotebook(localStorage);storageError='';}catch(e){storageError=e.message;notebook=emptyNotebook();notice(e.message);}updateCount();}
function updateCount(){$('ticket-count').textContent=Object.keys(notebook.visits).length+Object.keys(notebook.ideas).length;}
function persist(action){try{notebook=action();storageError='';updateCount();return true;}catch(error){storageError=error.message;notice('没有保存成功：'+error.message);return false;}}
function confirm(title,text){return new Promise(resolve=>{const dialog=$('confirm-dialog');$('confirm-title').textContent=title;$('confirm-text').textContent=text;dialog.returnValue='cancel';dialog.onclose=()=>resolve(dialog.returnValue==='ok');dialog.showModal();});}
function term(id){return catalog.terms.find(t=>t.id===id);}
function chapter(id){return catalog.chapters.find(c=>c.id===id);}
function thumb(t){return t.cover||(t.caseIds||[]).map(id=>catalog.cases.find(c=>c.id===id)?.images?.[0]).find(Boolean)||'';}
function lamp(t,from=location.hash,feeling=''){
  const opened=isOpen(t),image=thumb(t),href=routeFor('ride',t.id,{from,feeling});
  return `<${opened?'a':'article'} class="lamp ${opened?'':'closed'}" ${opened?`href="${esc(href)}"`:'aria-label="'+esc(t.name)+'，即将开放"'} data-term-id="${esc(t.id)}">
    ${image?`<img src="${esc(image)}" alt="${esc(t.name)}的作品缩略图" loading="lazy">`:'<div class="thumb-empty">作品缩略图待补</div>'}
    <div class="lamp-label"><strong>${esc(t.name)}</strong><small>${esc(t.english)}</small>${opened?'':'<div class="coming">即将开放 · COMING SOON</div>'}</div>
  </${opened?'a':'article'}>`;
}
function crumbs(items){$('breadcrumbs').innerHTML=items.map(([title,url])=>url?`<a href="${esc(url)}">${esc(title)}</a>`:`<span aria-current="page">${esc(title)}</span>`).join('<span aria-hidden="true">›</span>');}
const homeCrumb=['入园',routeFor('entrance')],avenueCrumb=['园区大道',routeFor('avenue')],browseCrumb=['浏览区',routeFor('browse')],arcadeCrumb=['街机厅',routeFor('arcade')];
function fromCrumbs(route){
  const from=parseRoute(route.query.from||'#/browse');
  if(from.name==='chapter'){const c=chapter(from.id);if(c)return [avenueCrumb,browseCrumb,[c.name+'园',routeFor('chapter',c.id)]];}
  if(from.name==='line'){const line=lineFor(from.id,catalog.terms,experience);if(line)return [avenueCrumb,['地图亭',routeFor('feelings')],[line.feeling.sentence,routeFor('line',from.id)]];}
  if(from.name==='curiosity')return [avenueCrumb,arcadeCrumb,['好奇心漫游',routeFor('curiosity')]];
  if(from.name==='notebook')return [avenueCrumb,['票根本',routeFor('notebook')]];
  return [avenueCrumb,browseCrumb];
}
function renderEntrance(){
  crumbs([]);
  $('app').innerHTML=`<div class="entrance-scene" data-art-slot="p1-scene"><div class="entrance-layer" data-depth="0.12">远景 · 天空 / 云 / 设施天际线</div><div class="entrance-layer" data-depth="0.25">中景 · 大门与设施</div><div class="entrance-layer" data-depth="0.4">近景 · 摊位 / 地面 / 小人</div><div class="entrance-title"><div class="eyebrow">WELCOME TO YOUR PARK</div><h1>审美外挂</h1><span class="subtitle">定调文案待确认</span>${link('入园 →',routeFor('avenue'),'button primary')}</div></div><p class="note muted">从这里开始，往下走进乐园。</p>`;
  const layers=[...document.querySelectorAll('.entrance-layer')];let queued=false;
  const update=()=>{queued=false;for(const el of layers)el.style.transform=`translateY(${reduced()?0:Math.round(scrollY*Number(el.dataset.depth))}px)`;};
  const onScroll=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};window.addEventListener('scroll',onScroll,{passive:true});cleanup=()=>window.removeEventListener('scroll',onScroll);
}
function renderAvenue(){
  crumbs([homeCrumb,['园区大道']]);
  const stops=[['浏览区','看看都有些什么','browse','气球摊入口'],['地图亭','从你的感觉出发','feelings','地图亭入口'],['街机厅','自己玩玩','arcade','街机厅入口']];
  $('app').innerHTML=heading('P3 · PARK AVENUE','园区大道','往下走，挑一个你想去的地方。')+(!notebook.welcomeSeen?`<section id="welcome" class="welcome"><h2>这是你的地图和票根本。</h2><p>地图带你回到这里，票根本留下你在乐园里的发现。</p><div class="welcome-gifts"><span>园区地图</span><span>票根本</span></div><button id="skip-welcome">收好，开始逛 →</button></section>`:'')+stops.map(([title,copy,path,art],i)=>`<section id="avenue-stop-${i}" class="avenue-stop">${slot(art,'p3-'+path)}<div><div class="eyebrow">0${i+1}</div><h2>${title}</h2><p>${copy}</p>${link('走进去 →',routeFor(path))}</div></section>`).join('')+`<section class="section">${link('走到兑奖柜台 · 打开票根本',routeFor('notebook'))}</section>`;
  let timer,finished=false;
  const finish=(scroll=true)=>{if(finished)return;finished=true;clearTimeout(timer);persist(()=>updateNotebook(localStorage,n=>n.welcomeSeen=true));$('welcome')?.remove();if(scroll)$('avenue-stop-0')?.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});};
  if(!notebook.welcomeSeen){$('skip-welcome').onclick=()=>finish(true);if(reduced())finish(false);else timer=setTimeout(()=>finish(true),2600);}
  const manual=()=>{if(!finished&&!notebook.welcomeSeen)finish(false);};window.addEventListener('wheel',manual,{passive:true,once:true});window.addEventListener('touchstart',manual,{passive:true,once:true});
  cleanup=()=>{clearTimeout(timer);window.removeEventListener('wheel',manual);window.removeEventListener('touchstart',manual);};
}
function revealLamps(root){
  if(reduced())return ()=>{};let count=0;
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.style.animationDelay=(count++%4)*50+'ms';entry.target.classList.add('revealing');observer.unobserve(entry.target);}},{threshold:.1});
  root.querySelectorAll('.lamp:not(.closed)').forEach(el=>observer.observe(el));return ()=>observer.disconnect();
}
function renderBrowse(){
  crumbs([avenueCrumb,['浏览区']]);
  $('app').innerHTML=heading('P4-A · EXPLORE','随便逛逛','按专题找、自己翻，或者让运气替你挑一个。')+`<section><div class="section-title"><h2>气球摊</h2><span>${catalog.chapters.length} 个专题</span></div>${slot('小丑与气球群','p4a-balloons')}<div class="chapter-grid">${catalog.chapters.map(c=>`<a class="chapter-token" href="${routeFor('chapter',c.id)}">${esc(c.name)}<small>${esc(c.english)}</small></a>`).join('')}</div></section><section class="section" id="lamp-wall"><div class="section-title"><h2>灯牌墙</h2><span id="term-count"></span></div><div class="catalog-tools"><input type="search" id="term-search" aria-label="搜索词条" placeholder="搜一个词，或慢慢往下看" value="${esc(browse.query)}"><label><input type="checkbox" id="only-open" ${browse.onlyOpen?'checked':''}>只看已开放</label></div><div class="lamp-grid" id="lamp-grid"></div></section><section class="section" id="gacha-section"><div class="section-title"><h2>交给运气</h2><span>扭蛋机</span></div><div class="gacha" id="gacha">${slot('扭蛋机','p4a-gacha')}<div><div id="gacha-result" class="gacha-result"><p class="muted">不知道看什么，就先抽一个。</p></div><button id="draw-gacha" class="primary">投一枚币，转一下</button></div></div></section>`;
  let cancelReveal=()=>{},timer;
  const draw=()=>{cancelReveal();const list=queryTerms(catalog.terms,browse.query,browse.onlyOpen);$('term-count').textContent=list.length+' 个词条';$('lamp-grid').innerHTML=list.length?list.map(t=>lamp(t,routeFor('browse'))).join(''):empty('没有找到这个词','试试另一种写法，或关闭“只看已开放”。');cancelReveal=revealLamps($('lamp-grid'));};draw();
  $('term-search').oninput=event=>{browse.query=event.target.value;draw();};$('only-open').onchange=event=>{browse.onlyOpen=event.target.checked;draw();};
  $('draw-gacha').onclick=()=>{const button=$('draw-gacha');button.disabled=true;$('gacha').classList.add('busy');$('gacha-result').innerHTML='<p class="muted" role="status">转动中…</p>';timer=setTimeout(()=>{const t=randomTerm(catalog.terms,previousGacha);$('gacha').classList.remove('busy');button.disabled=false;if(!t){$('gacha-result').innerHTML='<p>还没有开放的设施。</p>';return;}previousGacha=t.id;$('gacha-result').innerHTML=`<small>这次是</small><h3>${esc(t.name)}</h3><p>${link('坐上这个设施 →',routeFor('ride',t.id,{from:routeFor('browse')}))}</p>`;button.textContent='再转一次';},reduced()?0:1100);};
  cleanup=()=>{cancelReveal();clearTimeout(timer);};
}
function renderChapter(route){
  const c=chapter(route.id);if(!c)return renderNotFound();
  crumbs([avenueCrumb,browseCrumb,[c.name+'园']]);
  const list=catalog.terms.filter(t=>(c.termIds||[]).includes(t.id));
  $('app').innerHTML=heading('P4-A-2 · THEME PARK',c.name+' '+c.english,c.definition)+`<div class="reading">${slot('专题牌楼','chapter-gate')}${c.cover?`<img class="chapter-hero" src="${esc(c.cover)}" alt="${esc(c.coverCaption||c.name)}"><p class="caption">${esc(c.coverCaption)}</p>`:''}${c.sections?.filter(s=>s.text).map(s=>`<section class="chapter-intro">${s.title?`<h2>${esc(s.title)}</h2>`:''}<div class="prose">${esc(s.text)}</div>${(s.images||[]).map(src=>artImage(src,s.caption)).join('')}</section>`).join('')||''}${c.definerStory?`<section class="chapter-intro"><div class="eyebrow">ORIGIN · ${esc(c.definer)}</div><div class="prose">${esc(c.definerStory)}</div></section>`:''}</div><section class="section"><div class="section-title"><h2>园区里的设施</h2><span>${list.length} 个词条</span></div><div class="lamp-grid">${list.map(t=>lamp(t,routeFor('chapter',c.id))).join('')}</div></section>`;
  cleanup=revealLamps($('app'));
}
function renderFeelings(){
  crumbs([avenueCrumb,['地图亭']]);
  $('app').innerHTML=heading('P4-B-1 · FEELING STATIONS','从你的感觉出发','认出一句像自己的话，看看它会带你去哪里。')+slot('地图亭内景','p4b-interior')+(experience.feelings.length?experience.feelings.map(f=>{const line=lineFor(f.id,catalog.terms,experience);return `<a class="feeling-sign" href="${routeFor('line',f.id)}"><strong>${esc(f.sentence)}</strong><small>${line.stations.length} 站 →</small></a>`;}).join(''):empty('第一批感觉线路正在整理','站牌和换乘功能已预留。这里会放第一人称句，旧的形容词入口不作为替代。'));
}
function renderLine(route){
  const line=lineFor(route.id,catalog.terms,experience);if(!line)return renderNotFound();
  crumbs([avenueCrumb,['地图亭',routeFor('feelings')],[line.feeling.sentence]]);
  $('app').innerHTML=`<div class="line-sentence">正在行驶：${esc(line.feeling.sentence)}</div>`+heading('P4-B-2 · ONE LINE','沿着这句话往前走',`${line.stations.length} 个站点，可以在有支线的站台换乘。`)+(line.stations.length?`<div class="line-stations">${line.stations.map((s,i)=>`<section class="line-station" id="line-${i}"><div class="eyebrow">STATION ${i+1}</div>${lamp(s.term,routeFor('line',route.id),route.id)}${s.transfers.length?`<div class="transfers">换乘：${s.transfers.map(f=>link(f.sentence,routeFor('line',f.id),'')).join('')}</div>`:''}</section>`).join('')}</div>`:empty('这条线路还没有设施','关联内容补齐后，站点会自动出现在这里。'));
  const stopReveal=revealLamps($('app'));
  const track=document.querySelector('.line-stations');let pending=false;
  if(track){const train=document.createElement('span');train.className='line-train';train.textContent='车';train.setAttribute('aria-label','当前小火车位置');track.prepend(train);
    const update=()=>{pending=false;const y=Math.max(0,Math.min(track.scrollHeight-28,innerHeight*.4-track.getBoundingClientRect().top));train.style.top=Math.round(y)+'px';};
    const onScroll=()=>{if(!pending){pending=true;requestAnimationFrame(update);}};window.addEventListener('scroll',onScroll,{passive:true});update();cleanup=()=>{stopReveal();window.removeEventListener('scroll',onScroll);};
  }else cleanup=stopReveal;
}
function renderArcade(){
  crumbs([avenueCrumb,['街机厅']]);
  $('app').innerHTML=heading('P4-C · ARCADE','轮到你来玩','选一台机器，慢慢试。')+`<a class="arcade-machine" href="${routeFor('curiosity')}" data-art-slot="curiosity-cabinet"><div class="screen"><div class="eyebrow">MACHINE 01</div><h2>好奇心漫游</h2><p>沿着一个问题，遇见没想到的东西。</p></div><span class="machine-control">按下开始 →</span></a><a class="arcade-machine" href="${routeFor('lab')}" data-art-slot="lab-cabinet"><div class="screen"><div class="eyebrow">MACHINE 02</div><h2>意象实验室</h2><p>观察 / 拆开 / 重组。等号右边，留给你。</p></div><span class="machine-control">按下开始 →</span></a>`;
}
function renderCuriosity(){
  crumbs([avenueCrumb,arcadeCrumb,['好奇心漫游']]);
  const q=features.questions.find(q=>q.id===questionId)||features.questions[0];
  if(!q){$('app').innerHTML=heading('P4-C-1','好奇心漫游')+empty('问题正在整理','准备好以后，从这里出发。');return;}
  questionId=q.id;const linked=(q.termIds||[]).map(term).filter(Boolean);
  $('app').innerHTML=heading('P4-C-1 · CURIOSITY','好奇心漫游')+(!experience.questionsReviewed?'<p class="data-warning">以下为现有题库原文，尚待按 V2 的“问读者本人”要求审核。</p>':'')+`<div class="question-card" data-art-slot="curiosity-screen"><div class="eyebrow">QUESTION ${features.questions.findIndex(x=>x.id===q.id)+1} / ${features.questions.length}</div><h2>${esc(q.question)}</h2><details><summary>展开一点思考线索</summary><div class="prose">${esc(q.intro)}</div></details><button id="next-question">换一个问题 ↻</button></div><section class="section"><div class="section-title"><h2>沿着这个问题继续看</h2></div><div class="lamp-grid">${linked.map(t=>lamp(t,routeFor('curiosity'))).join('')}</div></section>`;
  $('next-question').onclick=()=>{questionId=pick(features.questions,questionId)?.id;renderCuriosity();};
}
function saveDraft(){try{sessionStorage.setItem(DRAFT_KEY,JSON.stringify(lab));}catch{notice('当前窗口无法保存草稿，请及时复制或存入票根本。');}}
function refreshLabPrompt(useSource=false){
  if(!useSource){lab.prompt=promptText(lab.operation,lab.imageA,lab.imageB);lab.sourceId=null;lab.id='';}
  $('lab-equation').textContent=lab.imageA&&lab.imageB?`${lab.imageA} ${OPERATIONS[lab.operation].symbol} ${lab.imageB} ＝`:'先选两个意象';
  $('lab-prompt').textContent=lab.prompt||'可以从题库抽取，也可以自己输入。';
  $('save-idea').disabled=!lab.prompt;$('copy-idea').disabled=!lab.prompt;saveDraft();
}
function renderLab(){
  crumbs([avenueCrumb,arcadeCrumb,['意象实验室']]);
  const themes=[...new Set(features.imagery.filter(i=>i.operation===OPERATIONS[lab.operation].label).map(i=>i.theme))];if(lab.theme&&!themes.includes(lab.theme))lab.theme='';
  $('app').innerHTML=heading('P4-C-2 · IMAGERY LAB','意象实验室','有些新的画面，始于一个没有答案的式子。')+`<div class="reading"><div class="operation-buttons">${Object.entries(OPERATIONS).map(([key,o])=>`<button class="${key===lab.operation?'active':''}" data-operation="${key}"><b>${o.symbol}</b><small>${o.label}</small></button>`).join('')}</div><div class="lab-controls"><label>主题<select id="lab-theme"><option value="">全部主题</option>${themes.map(t=>`<option ${t===lab.theme?'selected':''}>${esc(t)}</option>`).join('')}</select></label><label>在题库中搜索<input type="search" id="lab-search" placeholder="意象、题目或关键词" value="${esc(lab.search)}"></label></div><p class="lab-count" id="lab-count"></p><button id="draw-idea">从题库抽取一组 ↻</button><div class="image-inputs"><label>意象 A<input id="image-a" maxlength="120" value="${esc(lab.imageA)}" placeholder="也可以自己填"></label><span class="operator">${OPERATIONS[lab.operation].symbol}</span><label>意象 B<input id="image-b" maxlength="120" value="${esc(lab.imageB)}" placeholder="也可以自己填"></label></div><div class="lab-panel" data-art-slot="lab-panel"><div class="eyebrow">等号右边，留给你</div><h2 id="lab-equation"></h2><p id="lab-prompt" class="muted note"></p><label class="answer-label" for="lab-response">你的联想</label><textarea id="lab-response" class="answer-screen" aria-label="等号右边的空白屏幕，写下你的联想" maxlength="50000">${esc(lab.response)}</textarea><div class="button-row"><button id="copy-idea">复制带走</button><button id="save-idea" class="primary">存入票根本</button>${link('打开票根本',routeFor('notebook'))}</div></div></div>`;
  const pool=()=>filterImagery(features.imagery,lab.operation,lab.theme,lab.search);
  const count=()=>{$('lab-count').textContent=`当前可抽取 ${pool().length} 条 · 全题库 ${features.imagery.length} 条`; $('draw-idea').disabled=!pool().length;saveDraft();};
  document.querySelectorAll('[data-operation]').forEach(b=>b.onclick=async()=>{if(b.dataset.operation===lab.operation)return;if(lab.response&&!await confirm('切换运算','当前联想还在屏幕中。切换会清空本次草稿；需要保留时，请先存入票根本。'))return;lab={...lab,operation:b.dataset.operation,theme:'',imageA:'',imageB:'',prompt:'',response:'',id:'',sourceId:null};saveDraft();renderLab();});
  $('lab-theme').onchange=e=>{lab.theme=e.target.value;count();};$('lab-search').oninput=e=>{lab.search=e.target.value;count();};
  $('draw-idea').onclick=async()=>{if(lab.response&&!await confirm('抽取新命题','新命题会替换当前草稿。需要保留时，请先存入票根本。'))return;const item=pick(pool(),lab.sourceId);if(!item)return;lab={...lab,imageA:item.imageA,imageB:item.imageB,prompt:item.prompt,response:'',sourceId:item.id,id:crypto.randomUUID()};$('image-a').value=lab.imageA;$('image-b').value=lab.imageB;$('lab-response').value='';refreshLabPrompt(true);};
  $('image-a').oninput=e=>{lab.imageA=e.target.value;refreshLabPrompt();};$('image-b').oninput=e=>{lab.imageB=e.target.value;refreshLabPrompt();};$('lab-response').oninput=e=>{lab.response=e.target.value;saveDraft();};
  $('copy-idea').onclick=()=>copyText(lab.prompt+(lab.response?'\n\n'+lab.response:''));
  $('save-idea').onclick=()=>{if(!lab.id)lab.id=crypto.randomUUID();if(persist(()=>saveIdea(localStorage,{id:lab.id,prompt:lab.prompt,response:lab.response,operation:lab.operation,imageA:lab.imageA,imageB:lab.imageB}))){notice('已放进票根本的「我留下的」。');saveDraft();}};
  count();refreshLabPrompt(true);
}
function artImage(src,caption='',official=''){
  return `<img class="work-image" src="${esc(src)}" alt="${esc(caption||'作品原图')}" loading="lazy" tabindex="0" role="button" data-art-src="${esc(src)}" data-art-caption="${esc(caption)}" data-art-source="${esc(official)}"><p class="caption">${esc(caption)}</p>`;
}
function renderRide(route){
  const t=term(route.id);if(!t)return renderNotFound();
  crumbs([...fromCrumbs(route),[t.name]]);
  if(!isOpen(t)){$('app').innerHTML=heading('P5 · COMING SOON',t.name)+empty('这个设施即将开放','先去别处逛逛，灯亮起来时再见。')+`<p>${link('回灯牌墙',routeFor('browse'))}</p>`;return;}
  const sections=makeSections(t,catalog.cases),statement=firstPerson(t.id,route.query.feeling,experience),claimed=!!(route.query.feeling&&statement);
  const next=(t.nextNames||[]).map(name=>catalog.terms.find(x=>x.name===name)).filter(x=>x&&isOpen(x));
  const stops=[{id:'ride-wait',label:'候车'},...sections.map((s,i)=>({id:'ride-'+s.id,label:String(i+1)})),{id:'ride-exit',label:'出站'}];
  $('app').innerHTML=`<div class="ride-body"><section id="ride-wait" class="waiting-room station"><div class="eyebrow">P5 · 候车区</div><h1>${esc(t.name)}</h1><div class="theme-note">${esc(t.english)}</div>${statement?`<p class="statement">${esc(statement)}</p>`:'<p class="note muted">第一人称感觉句待补</p>'}${statement&&!claimed?'<button id="claim-feeling">这句话像我</button>':''}</section><div class="tunnel-transition" aria-label="进入隧道"><i></i><i></i><i></i></div><div class="reading">${sections.map((s,i)=>`<section class="station" id="ride-${s.id}" data-section-type="${s.type}"><div class="station-label">布景 ${String(i+1).padStart(2,'0')} / ${String(sections.length).padStart(2,'0')}</div><h2>${esc(s.title)}</h2>${s.type==='text'?`<div class="prose">${esc(s.text)}</div>`:`${s.case.images?.map(src=>artImage(src,s.case.caption||[s.case.name,s.case.author,s.case.year,s.case.collection].filter(Boolean).join(' · '),s.case.official)).join('')||'<p class="note muted">作品图待补</p>'}<div class="prose">${esc(s.case.whyLong||s.case.why||'')}</div>${safeURL(s.case.official)?`<p class="caption"><a href="${esc(safeURL(s.case.official))}" target="_blank" rel="noopener noreferrer">作品出处 ↗</a></p>`:''}`}</section>`).join('')}${!sections.length?empty('这段内容还在整理','本轮不使用旧钩子或拼装正文填补缺失内容。'):''}<section class="station ride-finish" id="ride-exit"><div class="eyebrow">EXIT · 出站</div><h2>这一站，到这里。</h2><div id="ride-ticket" class="ticket"><h3>${esc(t.name)}</h3><p>${esc(statement||'本次乘坐记录')}</p><small id="ticket-status">到达出站处后，票根会存入票根本。</small></div><div class="button-row">${link('打开票根本',routeFor('notebook'))}${link('回园区大道',routeFor('avenue'))}</div>${next.length?`<section class="section"><div class="section-title"><h2>下一站，也许是</h2></div><div class="lamp-grid">${next.slice(0,3).map(n=>lamp(n,route.query.from||routeFor('browse'),route.query.feeling||'')).join('')}</div></section>`:''}</section></div></div><nav class="ride-progress" aria-label="乘坐进度">${stops.map((s,i)=>`<a href="#${s.id}" data-jump="${s.id}" aria-label="${i===0?'候车区':i===stops.length-1?'出站':'跳到布景 '+i}">${esc(s.label)}</a>`).join('')}</nav>`;
  let claim=claimed||!!notebook.visits[t.id]?.claimed,recorded=false;
  const collect=()=>{if(recorded)return;if(persist(()=>recordVisit(localStorage,t.id,statement,claim))){recorded=true;$('ticket-status').textContent=statement&&claim?'已认领，票根已收好。':'已保存乘坐记录。';$('ride-ticket').classList.add('stamped');}};
  if($('claim-feeling'))$('claim-feeling').onclick=()=>{claim=true;$('claim-feeling').textContent='已认领这句话';$('claim-feeling').disabled=true;if(recorded)persist(()=>recordVisit(localStorage,t.id,statement,true));};
  document.querySelectorAll('[data-jump]').forEach(a=>a.onclick=e=>{e.preventDefault();$(a.dataset.jump)?.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});});
  const exitObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))collect();},{threshold:.12});exitObserver.observe($('ride-ticket'));
  const progress=document.querySelector('.ride-progress');const car=document.createElement('span');car.className='progress-car';car.textContent='车';car.setAttribute('aria-label','乘坐进度小车');progress.append(car);
  let scheduled=false;
  const update=()=>{scheduled=false;let active=stops[0].id;for(const s of stops){if($(s.id).getBoundingClientRect().top<innerHeight*.45)active=s.id;}document.querySelectorAll('[data-jump]').forEach(a=>{a.classList.toggle('active',a.dataset.jump===active);if(a.dataset.jump===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});const first=$('ride-wait').getBoundingClientRect().top,last=$('ride-exit').getBoundingClientRect().top;const fraction=Math.max(0,Math.min(1,(innerHeight*.45-first)/Math.max(1,last-first)));car.style.top=Math.round(fraction*Math.max(0,progress.clientHeight-22))+'px';};
  const onScroll=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};window.addEventListener('scroll',onScroll,{passive:true});update();
  cleanup=()=>{exitObserver.disconnect();window.removeEventListener('scroll',onScroll);document.querySelector('.ride-progress')?.remove();};
}
function renderNotebook(){
  readSaved();crumbs([avenueCrumb,['兑奖柜台']]);
  const visits=Object.values(notebook.visits).filter(v=>term(v.termId)).sort((a,b)=>b.lastVisit.localeCompare(a.lastVisit)),ideas=Object.values(notebook.ideas).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  $('app').innerHTML=heading('P6 · YOUR NOTEBOOK','带走一点属于你的东西','票根收好，想到的新画面也留下。')+`<div class="button-row"><button id="export-notebook">导出票根本</button><button id="import-notebook">导入备份</button></div>${storageError?`<p class="data-warning">${esc(storageError)}</p>`:''}<div class="notebook-tabs"><button data-tab="visits" class="${notebookTab==='visits'?'active':''}">我认领的 · ${visits.length}</button><button data-tab="ideas" class="${notebookTab==='ideas'?'active':''}">我留下的 · ${ideas.length}</button></div><section id="notebook-list">${notebookTab==='visits'?(visits.length?visits.map(v=>{const t=term(v.termId);return `<article class="ticket"><small>${v.claimed?'我认领的':'乘坐记录 · 认领句待补'}</small><h3>${esc(t.name)}</h3><p>${esc(v.statement||'')}</p>${link('再坐一次 →',routeFor('ride',t.id,{from:routeFor('notebook')}))}</article>`;}).join(''):empty('还没有票根','走完一个设施，票根会自动收在这里。')):(ideas.length?ideas.map(i=>`<article class="ticket idea"><small>我留下的</small><h3>${esc(i.prompt)}</h3>${i.response?`<p>${esc(i.response)}</p>`:'<p class="muted note">等号右边，还可以慢慢想。</p>'}<button data-copy-idea="${esc(i.id)}">复制带走</button></article>`).join(''):empty('还没有留下命题','去意象实验室，试一次相遇、抽离或替换。'))}</section><section class="section"><div class="section-title"><h2>纪念品店 · 艺术资源</h2><span>${features.resources.length} 条</span></div><ul class="resource-list">${features.resources.filter(r=>safeURL(r.url)).map(r=>`<li><a href="${esc(safeURL(r.url))}" target="_blank" rel="noopener noreferrer"><span>${esc(r.name)}</span><span aria-hidden="true">↗</span></a></li>`).join('')}</ul></section>`;
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{notebookTab=b.dataset.tab;renderNotebook();});
  $('export-notebook').onclick=()=>{const raw=localStorage.getItem(STORAGE_KEY)||JSON.stringify(emptyNotebook());download(raw,'审美外挂-票根本-'+new Date().toISOString().slice(0,10)+'.json');notice('已导出票根本备份。');};
  $('import-notebook').onclick=()=>$('notebook-import').click();
  document.querySelectorAll('[data-copy-idea]').forEach(b=>b.onclick=()=>{const idea=notebook.ideas[b.dataset.copyIdea];copyText(idea.prompt+(idea.response?'\n\n'+idea.response:''));});
}
function renderNotFound(){crumbs([avenueCrumb,['没有找到']]);$('app').innerHTML=heading('NOT FOUND','这条路还没开放')+`<p>${link('回园区大道',routeFor('avenue'),'button primary')}</p>`;}
async function copyText(text){try{await navigator.clipboard.writeText(text);notice('已复制，可以带走了。');}catch{const field=document.createElement('textarea');field.value=text;document.body.append(field);field.select();const success=document.execCommand('copy');field.remove();notice(success?'已复制。':'复制未成功，请选择屏幕上的文字手动复制。');}}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);}
function renderRoute(){
  if(lastHash)scrollPositions.set(lastHash,scrollY);
  cleanup();cleanup=()=>{};currentRoute=parseRoute(location.hash);lastHash=location.hash||'#/entrance';
  document.body.dataset.route=currentRoute.name;
  const routes={entrance:renderEntrance,avenue:renderAvenue,browse:renderBrowse,chapter:renderChapter,feelings:renderFeelings,line:renderLine,arcade:renderArcade,curiosity:renderCuriosity,lab:renderLab,ride:renderRide,notebook:renderNotebook};
  (routes[currentRoute.name]||renderNotFound)(currentRoute);
  applyArt();
  const pageTitles={entrance:'入园',avenue:'园区大道',browse:'浏览区',chapter:'专题园区',feelings:'地图亭',line:'感觉线路',arcade:'街机厅',curiosity:'好奇心漫游',lab:'意象实验室',ride:'乘坐',notebook:'票根本'};
  document.title=(pageTitles[currentRoute.name]||'未开放')+' · 审美外挂';
  const top=scrollPositions.get(lastHash)||0;requestAnimationFrame(()=>{window.scrollTo({top,behavior:'instant'});$('app').focus({preventScroll:true});});
}
document.addEventListener('click',event=>{const img=event.target.closest('[data-art-src]');if(!img)return;openArt(img);});
document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-art-src]')){event.preventDefault();openArt(event.target);}});
function openArt(el){$('art-image').src=el.dataset.artSrc;$('art-image').alt=el.dataset.artCaption;$('art-caption').textContent=el.dataset.artCaption;const url=safeURL(el.dataset.artSource);$('art-source').hidden=!url;$('art-source').href=url||'#';$('art-dialog').showModal();}
$('close-art').onclick=()=>$('art-dialog').close();
$('art-dialog').onclick=event=>{if(event.target===$('art-dialog')){const r=$('art-dialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('art-dialog').close();}};
$('notebook-import').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>5*1024*1024)throw new Error('备份不能大于 5 MB');const incoming=JSON.parse(await file.text());const {notebook:merged,ignored}=mergeNotebook(readNotebook(localStorage),incoming,new Set(catalog.terms.map(t=>t.id)));if(!await confirm('合并票根本','已有票根会保留。重复票根合并，命题按更新时间保留。'))return;localStorage.setItem(STORAGE_KEY,JSON.stringify(merged));readSaved();if(currentRoute.name==='notebook')renderNotebook();notice('已合并备份。'+(ignored?`${ignored} 条无效记录未导入。`:''));}catch(error){notice('导入失败：'+error.message);}finally{event.target.value='';}};
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){readSaved();if(currentRoute?.name==='notebook')renderNotebook();}});
window.addEventListener('hashchange',renderRoute);
async function init(){
  try{[catalog,features,experience,provenance]=await Promise.all(['catalog','features','experience','provenance'].map(async name=>{const r=await fetch('./data/'+name+'.json');if(!r.ok)throw new Error('内容文件没有读到：'+name);return r.json();}));
    const errors=validateExperience(experience,catalog.terms);if(errors.length)throw new Error(errors.join('；'));
    readSaved();try{const raw=sessionStorage.getItem(DRAFT_KEY);if(raw){const draft=JSON.parse(raw);if(OPERATIONS[draft.operation])lab={...lab,...draft};}}catch{}
    renderRoute();startArtBridge();
  }catch(error){$('app').innerHTML=heading('OPENING ERROR','暂时没能打开乐园')+empty('内容未加载',error.message)+'<p>请从本机服务地址打开，而不是直接双击 HTML。</p>';}
}
init();
