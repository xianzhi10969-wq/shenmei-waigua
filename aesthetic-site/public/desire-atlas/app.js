const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NS = 'http://www.w3.org/2000/svg';
const STORE = 'shenmei.desire-atlas.v1';
let desires=[], concepts=[], dmap, cmap, selected=new Set(), focus='D01', scope='focus', tab='map', detailStack=[], lastFocus=null;
let view={x:0,y:0,k:1}, graphNodes=[], graphEdges=[], storageOK=true;
const state = { get selected(){return [...selected]}, get view(){return {...view}} };
window.atlasState=state;

async function boot(){
  try {
    const res=await Promise.all(['desires.json','concepts.json'].map(async p=>{const r=await fetch(p);if(!r.ok)throw Error(p);return r.json()}));
    desires=res[0];concepts=res[1].concepts;dmap=new Map(desires.map(d=>[d.id,d]));cmap=new Map(concepts.map(c=>[c.id,c]));
    try {const saved=JSON.parse(localStorage.getItem(STORE)||'{}');if(Array.isArray(saved.selected))selected=new Set(saved.selected.filter(id=>dmap.has(id)));} catch {storageOK=false}
    if(selected.size)focus=[...selected][0];
    bind();render();
  } catch(err){$('#map-note').textContent='图谱暂时没有加载出来，请刷新再试。';$('#choose').disabled=true;$('#graph-wrap').innerHTML='<div class="empty">暂时无法读取图谱<br><button onclick="location.reload()">重新加载 ↻</button></div>';console.error(err)}
}
function save(){try{localStorage.setItem(STORE,JSON.stringify({selected:[...selected],version:1}));storageOK=true}catch{storageOK=false}}
function toggle(id){if(!dmap.has(id))return;if(selected.has(id))selected.delete(id);else selected.add(id);save();renderPicker();render(false);}
function setTab(t){tab=t;for(const name of ['map','response']){const active=t===name;$('#'+name+'-tab').setAttribute('aria-selected',active);$('#'+name+'-tab').tabIndex=active?0:-1;$('#'+name+'-panel').hidden=!active}if(t==='map')requestAnimationFrame(()=>renderGraph());else renderResponses()}
function openDialog(el){lastFocus=document.activeElement;el.showModal();document.body.style.overflow='hidden'}
function closeDialog(el){el.close();}
function bind(){
  $('#choose').onclick=()=>{renderPicker();openDialog($('#picker'))};
  $('#see-map').onclick=()=>{closeDialog($('#picker'));focus=[...selected][0]||'D01';scope=selected.size>1?'selected':'focus';setTab('map');render()};
  $('#search').oninput=renderPicker;
  $('#clear').onclick=()=>{selected.clear();save();renderPicker();render(false)};
  $('#map-tab').onclick=()=>setTab('map');$('#response-tab').onclick=()=>setTab('response');
  $('.view-tabs').onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setTab(tab==='map'?'response':'map');$('#'+tab+'-tab').focus()}};
  $('#scope').onclick=()=>{scope=scope==='all'?'focus':'all';renderGraph();renderStrip()};
  $('#fit').onclick=fitGraph;
  $('#zoom-in').onclick=()=>zoomAt(1.3,graphSize().w/2,graphSize().h/2);
  $('#zoom-out').onclick=()=>zoomAt(1/1.3,graphSize().w/2,graphSize().h/2);
  $('#about').onclick=()=>showDetail('about');
  document.querySelectorAll('dialog').forEach(el=>{
    el.querySelector('[data-close]').onclick=()=>closeDialog(el);
    el.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus()});
    el.addEventListener('click',e=>{if(e.target===el){const r=el.getBoundingClientRect();if(e.clientY<r.top||e.clientX<r.left||e.clientX>r.right)closeDialog(el)}})
  });
  $('#detail-body').addEventListener('click',e=>{
    const btn=e.target.closest('button');if(!btn)return;
    if(btn.dataset.toggle){toggle(btn.dataset.toggle);renderDetail(detailStack.at(-1));return}
    if(btn.dataset.detail){detailStack.push(btn.dataset.detail);renderDetail(btn.dataset.detail);$('#detail').scrollTop=0;return}
    if(btn.dataset.back!==undefined){detailStack.pop();renderDetail(detailStack.at(-1));$('#detail').scrollTop=0;return}
    if(btn.dataset.focus){focus=btn.dataset.focus;scope='focus';closeDialog($('#detail'));setTab('map');render();return}
  });
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(tab==='map')renderGraph()},120)});
  bindGestures();
}
function render(redraw=true){
  $('#selected-count').textContent=`${selected.size} / 30　↗`;
  $('#choose-label').textContent=selected.size?'再认领几句话':'哪几句是你？';
  $('#response-count').textContent=ranked().length;
  $('#save-status').textContent=!storageOK?'本次选择仍可使用；浏览器未能保存。':selected.size?'选择已留在这台设备，可以随时改变。':'点几句就好，不用先想明白。';
  renderStrip();if(tab==='response')renderResponses();if(redraw&&tab==='map')renderGraph();else updateGraphSelection();
}
function renderPicker(){
  const q=$('#search').value.trim().toLowerCase();const list=desires.filter(d=>(d.label+d.line).toLowerCase().includes(q));
  $('#picker-count').textContent=`已选 ${selected.size} 句`;
  $('#desire-list').innerHTML=list.length?list.map(d=>`<button class="desire-row" data-id="${d.id}" aria-pressed="${selected.has(d.id)}"><span class="num">${d.id.slice(1)}</span><span class="words"><strong>${esc(d.label)}</strong><small>${esc(d.line)}</small></span><span class="check" aria-hidden="true">${selected.has(d.id)?'✓':''}</span></button>`).join(''):'<p class="empty">没有找到这句话。试试更短的词。</p>';
  $('#desire-list').querySelectorAll('button').forEach(b=>b.onclick=()=>{const id=b.dataset.id;toggle(id);$('#desire-list').querySelector(`[data-id="${id}"]`)?.focus({preventScroll:true})});
  $('#see-map').innerHTML=`${selected.size?'看看我的图谱 · '+selected.size+' 句':'先随便逛逛'} <span>↗</span>`;
  $('#clear').disabled=!selected.size;
}
function renderStrip(){
  const ids=selected.size?[...selected]:['D01','D02','D03','D11','D18'];
  $('#focus-strip').innerHTML=ids.map(id=>`<button data-focus="${id}" class="${scope==='focus'&&focus===id?'active':''}">${esc(dmap.get(id).label)}</button>`).join('');
  $('#focus-strip').querySelectorAll('button').forEach(b=>b.onclick=()=>{focus=b.dataset.focus;scope='focus';renderGraph();renderStrip()});
}
function ranked(){
  const scores=new Map();for(const id of selected)for(const e of dmap.get(id).styles){const item=scores.get(e.styleId)||{concept:cmap.get(e.styleId),score:0,reasons:[]};item.score+=e.weight;item.reasons.push({desire:dmap.get(id),...e});scores.set(e.styleId,item)}
  return [...scores.values()].sort((a,b)=>b.score-a.score||b.reasons.length-a.reasons.length||a.concept.id.localeCompare(b.concept.id));
}
function renderResponses(){
  const rankedItems=ranked();
  if(!selected.size){$('#responses').innerHTML='<div class="response-section empty">还没有认领心里话。<br>先点几句，再来看它们的交汇。<button class="primary" id="choose-empty">去认领 <span>↗</span></button></div>';$('#choose-empty').onclick=()=>$('#choose').click();return}
  const oppositeIds=[...new Set([...selected].map(id=>dmap.get(id).opposite).filter(id=>id&&!selected.has(id)))];
  const other=desires.filter(d=>!selected.has(d.id)&&!oppositeIds.includes(d.id));
  const unexplored=[...oppositeIds.map(id=>dmap.get(id)),...other].slice(0,4);
  const shared=rankedItems.find(r=>r.reasons.length>=2);
  $('#responses').innerHTML=`<div class="response-section response-intro"><div class="eyebrow">此刻的选择 / ${selected.size} 句</div><h2>你一直在要的</h2><div class="selected-phrases">${[...selected].map(id=>`<button data-detail="${id}">${esc(dmap.get(id).label)}</button>`).join('')}</div></div>
    ${shared?`<div class="response-section cross-note">${esc(shared.concept.name)}，出现在 ${shared.reasons.length} 句话的交汇处。<br><span class="fine">${shared.reasons.map(r=>esc(r.desire.label)).join(' · ')}</span></div>`:''}
    <div class="response-section line-rule"><h3>这些方向，可能在回应你</h3><p class="fine">先看关联最强的 8 个方向。点开，看每条关联的来由。</p>${rankedItems.slice(0,8).map(r=>`<button class="answer-row" data-detail="${r.concept.id}"><span class="top"><strong>${esc(r.concept.name)}</strong><span class="tag">回应 ${r.reasons.length} 句　↗</span></span><p>${esc(r.reasons[0].answer)}</p></button>`).join('')}</div>
    <div class="response-section line-rule"><h3>还没走到的那一边</h3><p class="fine">没选，不等于不喜欢。也许只是今天还没想起。${oppositeIds.length?'相反的愿望，也不必互相排除。':''}</p><div class="unexplored">${unexplored.map(d=>`<button data-detail="${d.id}">○　${esc(d.label)}　↗</button>`).join('')}</div></div>`;
  $('#responses').querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>showDetail(b.dataset.detail));
}
function showDetail(id){detailStack=[id];renderDetail(id);if(!$('#detail').open)openDialog($('#detail'));$('#detail').scrollTop=0;}
function renderDetail(id){
  const back=detailStack.length>1?'<button class="quiet detail-back" data-back>← 返回上一条</button>':'';
  if(id==='about'){
    $('#detail-kind').textContent='关于这张图';
    $('#detail-body').innerHTML=`<h2 id="detail-title">一张可以改写的地图</h2><div class="about-copy"><p>它从「我想要什么」出发，尝试连接美学方向和已有作品。你可以认领、取消、同时认领相反的两句，也可以只逛一逛。</p><p><strong>连线是解释的候选，不是心理测验。</strong>美学偏好不能证明一个人隐藏的欲望，没选中的部分也不是厌恶。节点距离只为便于阅读，不表示心理距离。</p><p>30 句欲望来自这次讨论。D01、D02、D03、D11、D18 的连线来自 Claude 草稿；其余 25 组是为了试用补充的候选，图上用虚线表示，尚未逐条审定。</p><p>右侧节点统称「美学方向」，包含原有专题与词条；这不代表它们都被确认为历史风格。</p><p>作品与出处沿用飞书的 2026-11-07 只读快照；不是本次实时同步，也不自动证明这条欲望解释。没有作品的方向会明确留空。</p><p>D18 的现有连线更接近「熟悉中的异常」，与「不喜欢整齐」未必相同，暂保留草稿供你比较。D17/D18、D22/D23 可作为两端探索，不作互斥判断。</p><p>选择只保存在当前浏览器，不上传。黑白结构试作，页面与连线均待审。</p></div>`;return;
  }
  if(dmap.has(id)){
    const d=dmap.get(id);$('#detail-kind').textContent=`${d.id} / ${d.status==='draft'?'讨论草稿':'试连线 · 待审'}`;
    $('#detail-body').innerHTML=`${back}<h2 id="detail-title">${esc(d.label)}</h2><p class="sub">${esc(d.line)}</p><button class="primary detail-action" data-toggle="${id}" aria-pressed="${selected.has(id)}">${selected.has(id)?'已认领 · 再点取消':'这句是我'}<span>${selected.has(id)?'✓':'＋'}</span></button><h3>它可能通向这些地方</h3>${d.styles.map(e=>`<button class="answer-row" data-detail="${e.styleId}"><span class="top"><strong>${esc(cmap.get(e.styleId).name)}</strong><span class="tag">${['','局部相关','明显相关','主要关联'][e.weight]}　↗</span></span><p>${esc(e.answer)}</p></button>`).join('')}${d.crossNote?`<div class="cross-note">${esc(d.crossNote)}</div>`:''}${d.opposite?`<h3>也可以看看另一端</h3><button class="answer-row" data-detail="${d.opposite}">${esc(dmap.get(d.opposite).label)} ↗</button><p class="fine">这两句可以同时认领，不会相互抵消。</p>`:''}<p class="fine">${d.status==='draft'?'来自本次讨论草稿，关联仍待逐条核验。':'本组为试用补充的候选连线，尚未逐条核验。'}${id==='D18'?'「熟悉中的异常」和「不喜欢整齐」未必是一回事，先保留草稿比较。':''}</p><button class="quiet" data-focus="${id}">在图谱中看这句话 ↗</button>`;
  }else if(cmap.has(id)){
    const c=cmap.get(id);const all=desires.flatMap(d=>d.styles.filter(e=>e.styleId===id).map(e=>({desire:d,...e}))).sort((a,b)=>Number(selected.has(b.desire.id))-Number(selected.has(a.desire.id))||b.weight-a.weight);
    $('#detail-kind').textContent=`美学方向 / 原有${c.kind==='chapter'?'专题':'词条'}`;
    $('#detail-body').innerHTML=`${back}<h2 id="detail-title">${esc(c.name)}</h2><p class="sub">同一个方向，也可能回应不同的愿望。</p><h3>它在回答的要求</h3>${all.slice(0,3).map(r=>`<button class="answer-row" data-detail="${r.desire.id}"><span class="top"><strong style="font-size:16px">${esc(r.desire.label)}</strong><span class="tag">${selected.has(r.desire.id)?'已认领':'↗'}</span></span><p>${esc(r.answer)}</p></button>`).join('')}<h3>从真实作品继续看</h3><p class="fine">原有${c.kind==='chapter'?'专题':'词条'}中的作品。作品来源可追溯，欲望解释仍是候选。</p>${c.cases.length?c.cases.map(caseHTML).join(''):'<p class="sub">这个方向暂时没有已关联的作品。先留在这里，不补造证据。</p>'}<a class="primary detail-action" href="${esc(c.href)}">打开${c.kind==='chapter'?'专题':'词条'}原页 <span>↗</span></a>`;
  }
}
function caseHTML(c){
  const links=[...new Set((c.official||'').match(/https?:\/\/[^\s<>\]）)]+/g)||[])].filter(s=>{try{return ['https:','http:'].includes(new URL(s).protocol)}catch{return false}});
  return `<article class="case">${c.images?.length?`<img loading="lazy" src="${esc(c.images[0])}" alt="${esc(c.name)}">`:''}<h3>${esc(c.name)}</h3><p class="meta">${esc([c.author,c.year,c.medium].filter(Boolean).join(' · '))}</p>${c.why?`<p>${esc(c.why)}</p>`:''}${links.map((l,i)=>`<a href="${esc(l)}" target="_blank" rel="noopener noreferrer">${i?'更多出处':'作品出处'} ↗</a>`).join('')}<a href="/#/case/${encodeURIComponent(c.id)}">读完整案例 ↗</a></article>`;
}
function svgEl(name,attrs={},text){const el=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;return el}
function graphSize(){const r=$('#graph').getBoundingClientRect();return {w:r.width||390,h:r.height||396}}
function splitLabel(s,n=9){const a=Array.from(s);const lines=[];for(let i=0;i<a.length;i+=n)lines.push(a.slice(i,i+n).join(''));return lines}
function renderGraph(){
  if(!dmap)return;
  const {w,h}=graphSize();let ds;
  if(scope==='all')ds=desires;else if(scope==='selected'&&selected.size)ds=[...selected].map(id=>dmap.get(id));else{scope='focus';ds=[dmap.get(focus)||desires[0]]}
  const ids=[...new Set(ds.flatMap(d=>d.styles.map(e=>e.styleId)))];
  graphNodes=[...ds.map(d=>({id:d.id,label:d.label,type:'desire'})),...ids.map(id=>({id,label:cmap.get(id).name,type:'concept'}))];
  graphEdges=ds.flatMap(d=>d.styles.map(e=>({from:d.id,to:e.styleId,weight:e.weight,trial:d.status==='trial'})));
  graphNodes.forEach(n=>{n.lines=splitLabel(n.label,n.type==='desire'?9:12);n.w=n.type==='desire'?Math.min(160,Math.max(...n.lines.map(l=>l.length))*15+22):Math.max(62,Math.max(...n.lines.map(l=>l.length))*14+22);n.h=Math.max(44,n.lines.length*21+18)});
  if(ds.length===1){
    const center=graphNodes[0];center.x=w/2;center.y=h/2-10;
    const cs=graphNodes.slice(1);cs.forEach((n,i)=>{const a=-Math.PI/2+2*Math.PI*i/cs.length;n.x=w/2+Math.sin(a)*(w/2-65);n.y=h/2-10+Math.cos(a)*(h/2-65)});
    // Resolve label collisions without a perpetual animation or drifting targets.
    for(let k=0;k<90;k++)separateNodes(graphNodes,center);
  }else{
    const total=graphNodes.length,R=Math.max(280,Math.sqrt(total)*62);
    graphNodes.forEach((n,i)=>{const a=i*2.3999632297,r=R*Math.sqrt((i+.5)/total);n.x=w/2+Math.cos(a)*r;n.y=h/2+Math.sin(a)*r});
    const byId=new Map(graphNodes.map(n=>[n.id,n]));
    for(let iter=0;iter<200;iter++){
      for(const e of graphEdges){const a=byId.get(e.from),b=byId.get(e.to),dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||1;const force=(dist-170)*.006;a.x+=dx/dist*force;a.y+=dy/dist*force;b.x-=dx/dist*force;b.y-=dy/dist*force}
      separateNodes(graphNodes);
    }
  }
  const byId=new Map(graphNodes.map(n=>[n.id,n]));$('#edges').replaceChildren();$('#nodes').replaceChildren();
  for(const e of graphEdges){const a=byId.get(e.from),b=byId.get(e.to);$('#edges').append(svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,'stroke-width':.5+e.weight*.35,class:'edge'+(e.trial?' trial':'')}))}
  for(const n of graphNodes){
    const g=svgEl('g',{class:`node ${n.type}${selected.has(n.id)?' selected':''}`,transform:`translate(${n.x} ${n.y})`,role:'button',tabindex:'0','aria-label':`${n.type==='desire'?'欲望':'美学方向'}：${n.label}${selected.has(n.id)?'，已认领':''}`,'data-id':n.id});
    g.append(svgEl('title',{},n.label),svgEl('rect',{x:-n.w/2-5,y:-n.h/2-3,width:n.w+10,height:n.h+6,rx:6,class:'hit'}),svgEl('rect',{x:-n.w/2,y:-n.h/2,width:n.w,height:n.h,rx:n.type==='desire'?n.h/2:2,class:'body'}));
    n.lines.forEach((l,i)=>g.append(svgEl('text',{x:0,y:(i-(n.lines.length-1)/2)*21+5},l)));
    g.addEventListener('click',()=>{if(!suppressClick)showDetail(n.id)});g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showDetail(n.id)}});$('#nodes').append(g);
  }
  $('#map-caption').textContent=scope==='all'?`全图 · 30 句欲望 / ${concepts.length} 个方向`:scope==='selected'?`${selected.size} 句话的交汇 · ${ids.length} 个方向`:(selected.has(ds[0].id)?'你认领的：':'游览中：')+ds[0].label;
  $('#scope').textContent=scope==='all'?'回到一句话 ↙':'展开全图 ↗';
  $('#map-note').textContent=scope==='all'?'放大后点节点；实线来自讨论草稿，虚线是试连线。':scope==='selected'?'交汇处是多句话共同连接的方向。下方点一句，可以单独看。':'点任意节点看关联。拖动空白移动，拖动节点整理位置。';
  fitGraph();
}
function separateNodes(nodes,fixed){
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
    const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,ox=(a.w+b.w)/2+14-Math.abs(dx),oy=(a.h+b.h)/2+14-Math.abs(dy);
    if(ox>0&&oy>0){const xAxis=ox<oy;const push=(xAxis?ox:oy)*.52,sign=(xAxis?dx:dy)>=0?1:-1;const key=xAxis?'x':'y';if(a!==fixed)a[key]-=push*sign;if(b!==fixed)b[key]+=push*sign}
  }
}
function updateGraphSelection(){document.querySelectorAll('#nodes .node').forEach(g=>{g.classList.toggle('selected',selected.has(g.dataset.id));const d=dmap.get(g.dataset.id);if(d)g.setAttribute('aria-label',`欲望：${d.label}${selected.has(d.id)?'，已认领':''}`)})}
function fitGraph(){if(!graphNodes.length)return;const {w,h}=graphSize();const minX=Math.min(...graphNodes.map(n=>n.x-n.w/2)),maxX=Math.max(...graphNodes.map(n=>n.x+n.w/2)),minY=Math.min(...graphNodes.map(n=>n.y-n.h/2)),maxY=Math.max(...graphNodes.map(n=>n.y+n.h/2));const k=Math.min(1.15,(w-32)/(maxX-minX),(h-64)/(maxY-minY));view={x:w/2-(minX+maxX)/2*k,y:(h-24)/2-(minY+maxY)/2*k,k};applyView()}
function applyView(){$('#world').setAttribute('transform',`translate(${view.x} ${view.y}) scale(${view.k})`)}
function zoomAt(f,x,y){const old=view.k;view.k=Math.max(.15,Math.min(3,old*f));view.x=x-(x-view.x)*view.k/old;view.y=y-(y-view.y)*view.k/old;applyView()}
let suppressClick=false;
function bindGestures(){
  const svg=$('#graph'),pointers=new Map();let drag=null,pinch=null;
  const local=e=>{const r=svg.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  const beginPinch=()=>{const [a,b]=[...pointers.values()];pinch={dist:Math.hypot(a.x-b.x,a.y-b.y)||1,mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},view:{...view}}};
  svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;const p=local(e);pointers.set(e.pointerId,p);svg.setPointerCapture(e.pointerId);suppressClick=false;const id=e.target.closest('.node')?.dataset.id;drag={start:p,last:p,node:graphNodes.find(n=>n.id===id),moved:false};if(pointers.size===2){beginPinch();suppressClick=true}});
  svg.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId))return;const p=local(e);pointers.set(e.pointerId,p);
    if(pointers.size>=2&&pinch){const[a,b]=[...pointers.values()],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const k=Math.max(.15,Math.min(3,pinch.view.k*Math.hypot(a.x-b.x,a.y-b.y)/pinch.dist));view={k,x:mid.x-(pinch.mid.x-pinch.view.x)*k/pinch.view.k,y:mid.y-(pinch.mid.y-pinch.view.y)*k/pinch.view.k};applyView();suppressClick=true;return}
    if(!drag)return;if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>5)drag.moved=true;if(!drag.moved)return;suppressClick=true;
    const dx=p.x-drag.last.x,dy=p.y-drag.last.y;
    if(drag.node){drag.node.x+=dx/view.k;drag.node.y+=dy/view.k;refreshPositions()}else{view.x+=dx;view.y+=dy;applyView()}drag.last=p;
  });
  const end=e=>{const tapped=drag?.node&&!drag.moved&&!suppressClick&&pointers.size===1&&e.type==='pointerup'?drag.node.id:null;pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;if(!pointers.size){const moved=drag?.moved||suppressClick;drag=null;suppressClick=Boolean(moved||tapped);if(tapped)showDetail(tapped);setTimeout(()=>{suppressClick=false},100)}else{const p=[...pointers.values()][0];drag={start:p,last:p,node:null,moved:true}}};
  svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  svg.addEventListener('wheel',e=>{e.preventDefault();const p=local(e);zoomAt(Math.exp(-e.deltaY*.002),p.x,p.y)},{passive:false});
}
function refreshPositions(){const byId=new Map(graphNodes.map(n=>[n.id,n]));$('#nodes').querySelectorAll('g').forEach(g=>{const n=byId.get(g.dataset.id);g.setAttribute('transform',`translate(${n.x} ${n.y})`)});[...$('#edges').children].forEach((el,i)=>{const e=graphEdges[i],a=byId.get(e.from),b=byId.get(e.to);for(const[k,v]of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))el.setAttribute(k,v)})}
boot();
