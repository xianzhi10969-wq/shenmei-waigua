let DATA;
const app = document.getElementById('app');
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = value => { try { const u = new URL(value); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch { return ''; } };
const href = (kind, id) => `#/${kind}/${encodeURIComponent(id)}`;
const img = (path, alt, cls = '') => path ? `<img class="${cls}" src="/${e(path)}" alt="${e(alt)}" loading="lazy">` : '';
const shell = main => `<div class="shell"><header class="site-head"><a class="brand" href="#/">审美外挂</a><nav><a href="#/">首页</a><a href="#/chapters">24 章</a><a href="#/curiosity">好奇心漫游</a><a href="#/imagery">意象实验室</a><a class="nav-pill" href="#/" data-focus-search>寻找一种感觉 ↗</a></nav></header>${main}<footer class="site-foot">审美外挂 · 从「有感觉」到「有风格」<br>内容来自飞书多维表格 · 页面与交互由独立前端实现</footer></div>`;
const prose = value => {
  if (!value) return '';
  return `<div class="prose">${String(value).split(/\n\s*\n/).map(part => {
    const s = part.trim();
    const h = s.match(/^【([^】]+)】\s*\n?([\s\S]*)$/);
    if (h) return `<h3>${e(h[1])}</h3>${h[2] ? `<p>${e(h[2]).replace(/\n/g,'<br>')}</p>` : ''}`;
    return `<p>${e(s).replace(/\n/g,'<br>')}</p>`;
  }).join('')}</div>`;
};
const section = (label, title, body) => body ? `<section class="detail-section"><div class="section-label">${e(label)}</div><h2>${e(title)}</h2>${body}</section>` : '';
const chapterByName = name => DATA.chapters.find(c => c.name === name);
const termByName = name => DATA.terms.find(t => t.name === name);
const termState = t => t.state.includes('已上线') ? '' : '<span class="updated"> · 更新中</span>';

function home() {
  const featured = DATA.imagery.find(x => x.imageA === '时钟' && x.imageB === '发芽') || DATA.imagery[0];
  const chapters = DATA.chapters.map(ch => `<a class="chapter-card" href="${href('chapter',ch.id)}"><div class="visual">${img(ch.cover,ch.name)}</div><div class="copy"><span class="number">第 ${String(ch.order).padStart(2,'0')} 章</span><h3>${e(ch.name)}</h3><p class="english">${e(ch.english)}</p><p class="definition">${e(ch.definition)}</p><div class="terms">${e(ch.termNames.join('　'))}</div></div></a>`).join('');
  const feelings = DATA.feelings.map((f,i) => `<button type="button" class="feeling-pill${i >= 12 ? ' initially-hidden' : ''}" data-feeling="${i}">${e(f.name)}</button>`).join('');
  app.innerHTML = shell(`<main><section class="home-hero home-hero-new"><div class="hero-writing"><div class="eyebrow">AESTHETIC PLAYGROUND · 审美外挂</div><h1>给感觉<br><em>一个名字。</em><br>再给它一种可能。</h1><p class="tagline">认识美，发现美，创造还没有出现的美。</p><div class="hero-actions"><button class="button" type="button" data-scroll-feelings>从一种感觉开始 ↗</button><button class="button secondary" type="button" id="random-term">随便逛逛</button></div><p class="stats"><b>${DATA.chapters.length}</b> 个章节 · <b>${DATA.terms.filter(t=>t.state.includes('已上线')).length}</b> 条已上线词条 · <b>${DATA.cases.length}</b> 个案例</p></div><a class="hero-experiment" href="${featured ? href('imagery', featured.id) : '#/imagery'}"><span class="hero-experiment-top">TODAY'S EXPERIMENT <b>✳</b></span><span class="hero-experiment-line">${e(featured?.imageA || '时钟')} <i>＋</i><br>${e(featured?.imageB || '发芽')} <i>＝ ？</i></span><span class="hero-experiment-bottom">先想一个画面，再进入意象实验室 <b>↗</b></span></a></section><div class="search-zone"><div class="search-box"><input id="search" aria-label="搜索美学风格或感觉" autocomplete="off" placeholder="说一个感觉，或一种风：神秘、清冷、暗黑…"><span class="search-icon" aria-hidden="true">⌕</span></div><div id="search-results" class="search-results" hidden></div><p>既能搜风的名字，也能搜你心里那个说不清的感觉。</p></div><div class="container"><section class="home-section" id="feelings"><div class="section-label">FEELINGS</div><h2 class="section-heading">选择一种你想要的感觉｜从「<em>有感觉</em>」到「<em>有风格</em>」</h2><div class="feeling-list">${feelings}</div><button type="button" class="feeling-expand" id="expand-feelings" aria-expanded="false">展开全部 ${DATA.feelings.length} 种感觉 ↓</button><div id="feeling-panel"></div></section><section class="home-section discovery-paths"><div class="section-label">THREE WAYS IN</div><div class="path-grid"><button type="button" class="path-card" data-scroll-feelings><span>01 / 认识</span><strong>从一种感觉开始</strong><p>说不清的感觉，也能找到自己的词。</p><b>选择感觉 ↗</b></button><a class="path-card" href="#/curiosity"><span>02 / 发现</span><strong>从一个问题出发</strong><p>${e(DATA.questions?.[0]?.question || '为什么某些画面令人难忘？')}</p><b>好奇心漫游 ↗</b></a><a class="path-card" href="#/imagery"><span>03 / 创造</span><strong>让意象相遇</strong><p>选一种运算，留下等号右边的空白。</p><b>意象实验室 ↗</b></a></div></section><section class="home-section" id="chapters"><div class="section-label">CHAPTERS　每章一位定义它的人</div><h2 class="section-heading">24 种美学风格｜审美开挂ing</h2><div class="chapter-grid">${chapters}</div></section></div></main>`);
  bindHome();
}

function bindHome() {
  const search = document.getElementById('search'), results = document.getElementById('search-results');
  const index = [
    ...DATA.chapters.map(x=>({name:x.name, kind:'章节', id:x.id, path:'chapter', text:[x.name,x.english,x.definition,x.hook].join(' ')})),
    ...DATA.terms.map(x=>({name:x.name, kind:'词条', id:x.id, path:'term', text:[x.name,x.english,x.hook,x.core,x.searchTerms].join(' ')})),
    ...DATA.cases.map(x=>({name:x.name, kind:'案例', id:x.id, path:'case', text:[x.name,x.originalName,x.author,x.termName].join(' ')})),
    ...DATA.feelings.map(x=>({name:x.name, kind:'感觉', id:x.id, path:'feeling', text:[x.name,x.alias,x.description].join(' ')})),
  ];
  search.addEventListener('input', () => {
    const q = search.value.trim().toLocaleLowerCase();
    if (!q) { results.hidden = true; results.innerHTML=''; return; }
    const found = index.filter(x => x.text.toLocaleLowerCase().includes(q)).slice(0,16);
    results.innerHTML = found.length ? found.map(x=>`<a class="search-result" href="${x.path==='feeling'?'#/' : href(x.path,x.id)}" ${x.path==='feeling'?`data-feeling-name="${e(x.name)}"`:''}><b>${e(x.name)}</b><small>${x.kind}</small></a>`).join('') : '<div class="search-empty">没有找到，换个词试试。</div>';
    results.hidden = false;
    results.querySelectorAll('[data-feeling-name]').forEach(a=>a.addEventListener('click',ev=>{ev.preventDefault();const f=DATA.feelings.find(x=>x.name===a.dataset.feelingName);if(f)selectFeeling(f);results.hidden=true;search.value='';}));
  });
  search.addEventListener('keydown', ev => { if(ev.key==='Escape') {results.hidden=true;search.blur();} });
  document.querySelectorAll('[data-feeling]').forEach(b=>b.addEventListener('click',()=>selectFeeling(DATA.feelings[Number(b.dataset.feeling)])));
  document.querySelectorAll('[data-scroll-feelings]').forEach(button => button.addEventListener('click', () => document.getElementById('feelings').scrollIntoView({behavior:'smooth'})));
  document.getElementById('expand-feelings').addEventListener('click', event => {
    const open = event.currentTarget.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('.feeling-pill.initially-hidden').forEach(button => button.classList.toggle('revealed', open));
    event.currentTarget.setAttribute('aria-expanded', String(open));
    event.currentTarget.textContent = open ? '收起部分感觉 ↑' : `展开全部 ${DATA.feelings.length} 种感觉 ↓`;
  });
  document.getElementById('random-term').addEventListener('click',()=>{const pool=DATA.terms.filter(x=>x.state.includes('已上线'));const t=pool[Math.floor(Math.random()*pool.length)];location.hash=href('term',t.id);});
  const focus = document.querySelector('[data-focus-search]'); if(focus) focus.addEventListener('click',ev=>{ev.preventDefault();search.focus();scrollTo({top:0,behavior:'smooth'});});
}

function selectFeeling(f) {
  document.querySelectorAll('[data-feeling]').forEach(b=>b.classList.toggle('active',b.textContent===f.name));
  const chapters = f.chapterNames.map(name=>chapterByName(name)).filter(Boolean);
  const terms = f.termNames.map(name=>termByName(name)).filter(Boolean);
  document.getElementById('feeling-panel').innerHTML = `<div class="feeling-panel"><h3>${e(f.name)}</h3><p>${e(f.description)}</p><div class="caption">先去这些章节</div><div class="links">${chapters.map(c=>`<a class="chip" href="${href('chapter',c.id)}">${e(c.name)} ↗</a>`).join('')}</div><div class="caption">或者直接看这些词条</div><div class="links">${terms.map(t=>`<a class="chip" href="${href('term',t.id)}">${e(t.name)} ↗</a>`).join('')}</div></div>`;
  document.getElementById('feeling-panel').scrollIntoView({behavior:'smooth',block:'nearest'});
}

function curiosity() {
  const questions = (DATA.questions || []).filter(q => q.termIds?.length);
  const cards = questions.map((q, i) => `<article class="question-card"><button type="button" class="question-trigger" aria-expanded="false" aria-controls="question-answer-${i}"><span class="question-number">${String(i+1).padStart(2,'0')}</span><span class="question-text">${e(q.question)}</span><span class="question-plus" aria-hidden="true">＋</span></button><div class="question-answer" id="question-answer-${i}" hidden>${q.intro ? `<p>${e(q.intro)}</p>` : ''}<div class="section-label">沿着这个问题继续看</div><div class="chips">${q.termIds.map(id => DATA.terms.find(t => t.id === id)).filter(Boolean).map(t => `<a class="chip" href="${href('term',t.id)}">${e(t.name)} ↗</a>`).join('')}</div></div></article>`).join('');
  app.innerHTML = shell(`<main class="narrow detail curiosity-page"><div class="breadcrumb">审美外挂 › 好奇心漫游</div><a class="back" href="#/">← 返回首页</a><header class="detail-hero"><div class="kicker">CURIOSITY WALK</div><h1>好奇心漫游</h1><p class="lead">从一个问题出发，走向几种你也许还没叫出名字的美。</p><p class="muted">点开一个问题，再沿着词条继续走。这里没有标准答案。</p></header><section class="question-wall">${cards || '<p class="empty-note">问题正在整理中。</p>'}</section><nav class="next-links"><a href="#/"><small>回到首页</small>审美外挂</a><a href="#/chapters"><small>继续探索</small>24 章</a></nav></main>`);
  app.querySelectorAll('.question-trigger').forEach(button => button.addEventListener('click', () => {
    const answer = document.getElementById(button.getAttribute('aria-controls'));
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    answer.hidden = !open;
  }));
}

function imagery(initialId = '') {
  const items = DATA.imagery || [];
  const modes = [
    {name:'相遇', symbol:'＋', verb:'让两个意象相遇，寻找新的联系。', question:'它们相遇之后，会出现什么？'},
    {name:'抽离', symbol:'－', verb:'拿走一种理所当然的属性，重新认识事物。', question:'少了它，我们才看见什么？'},
    {name:'替换', symbol:'→', verb:'让一种事物承担另一种事物的角色。', question:'原来的规则会怎样改变？'},
  ];
  const initial = items.find(item => item.id === initialId);
  let mode = initial?.operation || '相遇';
  let theme = initial?.theme || '全部';
  let current = initial || null;
  let custom = false;
  let customA = '';
  let customB = '';
  const seen = new Map();
  const modeInfo = () => modes.find(item => item.name === mode);
  const pool = () => items.filter(item => item.operation === mode && (theme === '全部' || item.theme === theme));
  const themes = () => ['全部', ...new Set(items.filter(item => item.operation === mode).map(item => item.theme))];
  const equation = item => `${item.imageA} ${modeInfo().symbol} ${item.imageB} ＝ ？`;
  app.innerHTML = shell(`<main class="imagery-page"><div class="lab-wrap"><div class="breadcrumb">审美外挂 › 意象实验室</div><a class="back" href="#/">← 返回首页</a><header class="lab-intro"><div><div class="kicker">IMAGERY LAB / EXPERIMENT 01</div><h1>意象实验室<span aria-hidden="true">✳</span></h1><p>有些新的画面，始于一个没有答案的式子。</p></div><div class="lab-intro-side"><span>观察 / 拆开 / 重组</span><strong>等号右边，<br>留给你。</strong></div></header><div class="lab-layout"><aside class="lab-controls"><div class="lab-step"><span class="lab-step-index">01 / 选择实验方式</span><div class="lab-modes" role="group" aria-label="选择实验方式">${modes.map(m => `<button type="button" data-operation="${m.name}" aria-pressed="false"><span class="lab-mode-symbol">${m.symbol}</span><span>${m.name}</span></button>`).join('')}</div><p id="lab-mode-description"></p></div><div class="lab-step"><span class="lab-step-index">02 / 选择想探索的主题</span><div class="lab-themes" id="lab-themes" role="group" aria-label="选择主题"></div></div><div class="lab-source">题目与追问来自飞书题库 · ${items.length} 道实验</div></aside><section class="lab-workspace"><div class="lab-stage-top"><span>03 / 让问号发生</span><span id="lab-stage-count"></span></div><div id="imagery-stage" aria-live="polite"></div></section></div><nav class="next-links lab-next"><a href="#/curiosity"><small>从问题发现美</small>好奇心漫游</a><a href="#/chapters"><small>从风格认识美</small>24 章</a></nav></div></main>`);
  const stage = document.getElementById('imagery-stage');
  const renderThemes = () => {
    document.getElementById('lab-themes').innerHTML = themes().map(t => `<button type="button" data-theme="${e(t)}" aria-pressed="${t === theme}">${e(t)}</button>`).join('');
    app.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', () => {
      theme = button.dataset.theme;
      custom = false;
      current = null;
      renderThemes();
      draw(false);
    }));
  };
  const draw = random => {
    const choices = pool();
    if (!choices.length) { stage.innerHTML = '<p class="empty-note">这组实验正在整理中。</p>'; return; }
    const key = `${mode}/${theme}`;
    if (random) {
      let used = seen.get(key) || new Set();
      let available = choices.filter(item => !used.has(item.id) && item.id !== current?.id);
      if (!available.length) { used = new Set(); available = choices.filter(item => item.id !== current?.id); }
      current = (available.length ? available : choices)[Math.floor(Math.random() * (available.length || choices.length))];
      used.add(current.id);
      seen.set(key, used);
    } else {
      current = current && choices.includes(current) ? current : choices[0];
    }
    custom = false;
    history.replaceState(null, '', href('imagery', current.id));
    renderStage();
  };
  const renderStage = () => {
    const info = modeInfo();
    const item = custom ? {imageA:customA || '意象 A', imageB:customB || '意象 B', theme:'你的实验', prompt:''} : current;
    const count = pool().length;
    document.getElementById('lab-stage-count').textContent = custom ? '自由命题' : `${e(theme)} · ${count} 道题`;
    stage.innerHTML = `<article class="lab-paper"><div class="lab-paper-head"><span>WHAT IF … ?</span><span>${e(item.theme)} / ${e(mode)}</span></div><div class="lab-equation" aria-label="${e(equation(item))}"><span class="lab-operand">${e(item.imageA)}</span><span class="lab-operator" aria-hidden="true">${info.symbol}</span><span class="lab-operand">${e(item.imageB)}</span><span class="lab-equals" aria-hidden="true">＝ ？</span></div><div class="lab-question">${e(info.question)}</div><div class="lab-answer-note">答案尚未诞生。</div></article><div class="lab-action-bar"><button class="lab-primary" type="button" id="draw-imagery">随机抽下一题 <span aria-hidden="true">↗</span></button><button class="lab-secondary" type="button" id="copy-imagery">复制命题</button><button class="lab-secondary" type="button" id="custom-imagery">${custom ? '返回题库' : '自己出题'}</button></div>${custom ? `<div class="lab-custom"><label>意象 A<input id="custom-a" maxlength="32" placeholder="例如：月亮" value="${e(customA)}"></label><label>意象 B<input id="custom-b" maxlength="32" placeholder="例如：伤疤" value="${e(customB)}"></label><p>这是一次临时实验。输入只留在当前页面。</p></div>` : `<div class="lab-hint-area"><button id="show-imagery-hint" type="button" aria-expanded="false" aria-controls="imagery-hint">给我一点启发 <span aria-hidden="true">＋</span></button><div class="lab-hint" id="imagery-hint" hidden><span>一个追问，不是标准答案</span><p>${e(item.prompt)}</p></div></div>`}`;
    document.getElementById('draw-imagery').addEventListener('click', () => draw(true));
    document.getElementById('copy-imagery').addEventListener('click', async event => {
      if (custom && (!customA.trim() || !customB.trim())) return;
      const copied = custom ? {imageA:customA.trim(), imageB:customB.trim()} : item;
      try { await navigator.clipboard.writeText(equation(copied)); event.currentTarget.textContent = '已复制 ✓'; }
      catch { event.currentTarget.textContent = '复制失败'; }
    });
    document.getElementById('custom-imagery').addEventListener('click', () => { custom = !custom; renderStage(); });
    if (custom) {
      for (const [id, field] of [['custom-a','A'],['custom-b','B']]) {
        document.getElementById(id).addEventListener('input', event => {
          if (field === 'A') customA = event.target.value; else customB = event.target.value;
          const paper = stage.querySelector('.lab-paper');
          paper.querySelectorAll('.lab-operand')[field === 'A' ? 0 : 1].textContent = event.target.value || `意象 ${field}`;
          paper.querySelector('.lab-equation').setAttribute('aria-label', equation({imageA:customA || '意象 A', imageB:customB || '意象 B'}));
        });
      }
    } else {
      document.getElementById('show-imagery-hint').addEventListener('click', event => {
        const hint = document.getElementById('imagery-hint');
        hint.hidden = !hint.hidden;
        event.currentTarget.setAttribute('aria-expanded', String(!hint.hidden));
        event.currentTarget.innerHTML = hint.hidden ? '给我一点启发 <span aria-hidden="true">＋</span>' : '收起追问 <span aria-hidden="true">－</span>';
      });
    }
  };
  app.querySelectorAll('[data-operation]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.operation;
    if (!themes().includes(theme)) theme = '全部';
    current = null;
    custom = false;
    updateMode();
    renderThemes();
    draw(false);
  }));
  const updateMode = () => {
    app.querySelectorAll('[data-operation]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.operation === mode)));
    document.getElementById('lab-mode-description').textContent = modeInfo().verb;
  };
  updateMode();
  renderThemes();
  draw(false);
}

function chapter(ch) {
  const i = DATA.chapters.indexOf(ch);
  const terms = ch.termNames.map((name,j)=>termByName(name)).filter(Boolean);
  const termCards = terms.map((t,j)=>`<a class="term-card" href="${href('term',t.id)}">${img(t.cover,t.name)}<div class="copy"><span class="index">${String(j+1).padStart(2,'0')} ${e(t.position)}</span><h3>${e(t.name)}${termState(t)}</h3><p>${e(t.hook||t.core||'')}</p></div></a>`).join('');
  const body = ch.sections?.length ? ch.sections.map(s=>`${s.title?`<h3>${e(s.title)}</h3>`:''}${prose(s.text)}${s.cover?`<figure class="article-figure">${img(s.cover,s.caption||s.title)}<figcaption>${e(s.caption)}</figcaption></figure>`:''}`).join('') : prose(ch.body);
  app.innerHTML = shell(`<main class="narrow detail"><div class="breadcrumb">审美外挂 › 第 ${String(ch.order).padStart(2,'0')} 章</div><a class="back" href="#/chapters">← 返回 24 章</a><header class="detail-hero"><h1>${e(ch.name)}</h1><p class="latin">${e(ch.english)}</p><p class="lead">${e(ch.definition)}</p>${ch.cover?`<figure class="hero-figure">${img(ch.cover,ch.name)}<figcaption>${e(ch.coverCaption)}</figcaption></figure>`:''}</header>${section('VARIATIONS',`${terms.length} 种 ${ch.name}`,`<div class="term-list">${termCards}</div>`)}${section('ORIGIN','这种感觉从哪来',body||prose(ch.hook))}${section('THE DEFINER','定义这种感觉的人',ch.definer?`<div class="definer"><strong>${e(ch.definer)}</strong>${prose(ch.definerStory)}</div>`:'')}<nav class="chapter-next">${i>0?`<a href="${href('chapter',DATA.chapters[i-1].id)}"><small>‹ 上一章</small>${e(DATA.chapters[i-1].name)}</a>`:'<span></span>'}${i<DATA.chapters.length-1?`<a href="${href('chapter',DATA.chapters[i+1].id)}"><small>下一章 ›</small>${e(DATA.chapters[i+1].name)}</a>`:''}</nav></main>`);
}

function term(t) {
  const ch = chapterByName(t.chapterNames[0]);
  const cases = DATA.cases.filter(c=>c.keep && c.termName===t.name).sort((a,b)=>a.order-b.order);
  const cards = cases.map((c,i)=>`<a class="case-card" href="${href('case',c.id)}"><div class="visual">${img(c.images[0],c.name)}</div><div class="copy"><div class="index">CASE ${String(i+1).padStart(2,'0')} · ${e(c.medium)}</div><h3>${e(c.name)}</h3><p>${e(c.why)}</p></div></a>`).join('');
  const steps = t.steps.filter(Boolean);
  const related = t.nextNames.map(name=>termByName(name)).filter(Boolean);
  const feeling = `${t.hook ? `<p>${e(t.hook)}</p>` : ''}${t.core ? `<blockquote class="term-core">${e(t.core)}</blockquote>` : ''}`;
  app.innerHTML = shell(`<main class="narrow detail"><div class="breadcrumb">审美外挂 › ${ch?`<a href="${href('chapter',ch.id)}">${e(ch.name)}</a> › `:''}词条</div><a class="back" href="${ch?href('chapter',ch.id):'#/chapters'}">← 返回${ch?e(ch.name):'章节'}</a><header class="detail-hero"><h1>${e(t.name)}</h1><p class="latin">${e(t.english)}</p>${t.position?`<p class="term-position">${e(t.position)}</p>`:''}${t.cover?`<figure class="hero-figure">${img(t.cover,t.name)}</figure>`:''}</header>${section('THE FEELING','看见这种感觉',feeling?`<div class="term-feeling">${feeling}</div>`:'')}${section('CASES',`从 ${cases.length} 个案例看它如何成立`,cards?`<div class="case-grid">${cards}</div>`:'<p class="empty-note">案例正在整理中。</p>')}${section('METHODS','三个做法',steps.length?`<ol class="step-list">${steps.map(s=>`<li>${e(s)}</li>`).join('')}</ol>`:'')}${section('WATCH OUT','别这样做',t.mistake?`<div class="warning">${e(t.mistake)}</div>`:'')}${section('PALETTE','配色与检索',t.colors||t.searchTerms?`${t.colors?`<p>${e(t.colors)}</p>`:''}${t.searchTerms?`<p class="muted">检索词：${e(t.searchTerms)}</p>`:''}`:'')}${section('KEEP EXPLORING','接着看',related.length?`<div class="chips">${related.map(x=>`<a class="chip" href="${href('term',x.id)}">${e(x.name)} ↗</a>`).join('')}</div>`:'')}<nav class="next-links"><a href="${ch?href('chapter',ch.id):'#/chapters'}"><small>回到章节</small>${e(ch?.name||'24 章')}</a><a href="#/"><small>回到首页</small>审美外挂</a></nav></main>`);
}

function casePage(c) {
  const t = termByName(c.termName);
  const ch = t && chapterByName(t.chapterNames[0]);
  const facts = [['画面',c.scene],['细节',c.detail],['手法',c.method],['反转',c.twist],['缺席',c.absence]].filter(x=>x[1]);
  const official = url(c.official);
  app.innerHTML = shell(`<main class="narrow detail"><div class="breadcrumb">审美外挂 › ${ch?`<a href="${href('chapter',ch.id)}">${e(ch.name)}</a> › `:''}${t?`<a href="${href('term',t.id)}">${e(t.name)}</a> › `:''}案例</div><a class="back" href="${t?href('term',t.id):'#/'}">← 返回${e(t?.name||'首页')}</a><header class="detail-hero"><div class="kicker">CASE ${String(c.order).padStart(2,'0')}</div><h1>${e(c.name)}</h1>${c.originalName?`<p class="latin">${e(c.originalName)}</p>`:''}<p class="case-meta">${e([c.author,c.year,c.medium,c.collection].filter(Boolean).join(' · '))}</p>${c.why?`<p class="lead">${e(c.why)}</p>`:''}${c.images.length?`<div class="case-gallery">${c.images.map(path=>img(path,c.name)).join('')}</div>`:''}${c.caption?`<p class="muted" style="font-size:11px;text-align:center">${e(c.caption)}</p>`:''}</header>${section('WHY IT WORKS','为什么好',prose(c.whyLong))}${section('LOOK CLOSER','画面里的方法',facts.length?`<div>${facts.map(([label,value])=>`<div class="fact-row"><b>${e(label)}</b><p>${e(value)}</p></div>`).join('')}</div>`:'')}${section('MORE','补充讲解',prose(c.extra))}${official?`<section class="detail-section"><a class="source-link" href="${e(official)}" target="_blank" rel="noopener noreferrer">查看作品官方页 ↗</a></section>`:''}<nav class="next-links"><a href="${t?href('term',t.id):'#/'}"><small>回到词条</small>${e(t?.name||'首页')}</a><a href="#/"><small>回到首页</small>审美外挂</a></nav></main>`);
}

function route() {
  if (!DATA) return;
  const raw = location.hash.replace(/^#\/?/,'').split('/');
  const kind = raw[0], id = raw[1] ? decodeURIComponent(raw[1]) : '';
  if (kind==='curiosity') {curiosity();document.title='好奇心漫游 · 审美外挂';scrollTo(0,0);return;}
  if (kind==='imagery') {imagery(id);document.title='意象实验室 · 审美外挂';scrollTo(0,0);return;}
  if (kind==='chapter') {const ch=DATA.chapters.find(x=>x.id===id);if(ch){chapter(ch);document.title=`${ch.name} · 审美外挂`;scrollTo(0,0);return;}}
  if (kind==='term') {const t=DATA.terms.find(x=>x.id===id);if(t){term(t);document.title=`${t.name} · 审美外挂`;scrollTo(0,0);return;}}
  if (kind==='case') {const c=DATA.cases.find(x=>x.id===id);if(c){casePage(c);document.title=`${c.name} · 审美外挂`;scrollTo(0,0);return;}}
  home(); document.title='审美外挂';
  if (kind==='chapters') document.getElementById('chapters').scrollIntoView(); else scrollTo(0,0);
}

fetch('/data.json').then(r=>{if(!r.ok)throw Error('数据加载失败');return r.json()}).then(data=>{DATA=data;route();addEventListener('hashchange',route);}).catch(()=>{app.innerHTML='<main class="narrow detail"><h1>暂时无法加载内容</h1><p>请稍后刷新页面。</p></main>';});
