// V2 is a presentation-only experiment. The existing Feishu snapshot remains the sole content source.
const app = document.querySelector('#app');
const names = ['清冷', '多巴胺', '废土'];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const media = path => `../${String(path || '').replace(/^\/+/, '')}`;
const displayModes = ['original', 'line', 'board'];
const query = new URLSearchParams(location.search);
const isDisplayStudy = query.get('study') === '1';
const displayMode = displayModes.includes(query.get('display')) ? query.get('display') : 'original';
const studyHref = (name, display = displayMode) => {
  const params = new URLSearchParams({ term: name });
  if (isDisplayStudy) {
    params.set('study', '1');
    params.set('display', display);
  }
  return `?${params.toString()}`;
};
const selected = () => {
  const name = query.get('term');
  return names.includes(name) ? name : names[0];
};

function render(data) {
  const name = selected();
  const term = data.terms.find(item => item.name === name && item.state.includes('已上线'));
  if (!term) throw new Error(`找不到已上线词条：${name}`);
  const cases = data.cases.filter(item => item.keep && item.termName === name && item.images?.length).sort((a,b) => a.order - b.order);
  const lead = cases[0];
  const secondary = cases[1];
  document.title = `${name} · V2 视觉试验 · 审美外挂`;
  app.innerHTML = `
    <header class="masthead">
      <a class="brand" href="../#/" aria-label="返回审美外挂沙盒首页"><img src="./assets/brand-pixel.png" alt="审美外挂" width="205" height="55"></a>
      <span class="masthead-edition">AESTHETIC ATLAS <i>∙</i> VISUAL STUDY No. 02</span>
      <a class="sandbox-link" href="../#/term/${encodeURIComponent(term.id)}">完整词条 ↗</a>
    </header>
    <main>
      <nav class="term-switch" aria-label="V2 同一版式测试三种美学风格">
        <span class="switch-label">同一套视觉系统 / 三种内容</span>
        <div class="switch-items">${names.map((n,i)=>`<a href="${esc(studyHref(n))}" ${n === name ? 'aria-current="page"' : ''}><small>0${i+1}</small>${esc(n)}</a>`).join('')}</div>
        <span class="switch-end">仅本地预览</span>
      </nav>
      ${isDisplayStudy ? `<nav class="display-study" aria-label="封面作品边界实验"><span>作品边界实验 / 同一规则应用于三条词条</span><div>${[['original','原样'],['line','极细边线'],['board','窄深灰展板']].map(([mode,label])=>`<a href="${esc(studyHref(name,mode))}" ${mode === displayMode ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</div></nav>` : ''}
      <section class="poster" aria-labelledby="term-title">
        <div class="poster-grain" aria-hidden="true"></div>
        <div class="poster-dots" aria-hidden="true"></div>
        <img class="poster-arch" src="./assets/baroque-arch.webp" alt="" aria-hidden="true">
        <img class="poster-swash" src="./assets/swash.svg" alt="" aria-hidden="true">
        <div class="poster-topline"><span>STYLE / ${esc(term.chapterNames?.[0] || '美学风格')}</span><span>AN ATLAS OF AESTHETIC STYLES</span><span>© 审美外挂</span></div>
        <div class="poster-content">
          <div class="poster-copy">
            <span class="poster-index">${esc(term.chapterNames?.[0] || '美学风格')} / 视觉词条 / ${String(names.indexOf(name)+1).padStart(2,'0')}</span>
            <h1 id="term-title">${esc(term.name)}</h1>
            <div class="latin">${esc(term.english)}</div>
            <p class="core">${esc(term.core)}</p>
            <a class="discover" href="#case-study">走进真实作品 <span>↘</span></a>
          </div>
          <figure class="hero-art display-${displayMode}">
            <img src="${esc(media(term.cover))}" alt="${esc(term.name)}词条的原始封面作品" loading="eager">
            <figcaption>ARCHIVE IMAGE <span>◆</span> ${esc(term.name)} / FEISHU BASE</figcaption>
          </figure>
        </div>
        <div class="poster-bottomline"><span>LOOK CLOSER / 再看一眼</span><span>THE IMAGE IS THE EVIDENCE</span><span>↓ SCROLL TO EXPLORE</span></div>
      </section>
      <section class="definition" aria-label="词条定义">
        <div class="definition-index">I / THE FEELING</div>
        <div class="definition-text"><p>${esc(term.hook)}</p><span class="definition-mark" aria-hidden="true">✳</span></div>
        <div class="definition-caption">从感觉<br>到能被辨认的视觉语言</div>
      </section>
      <section class="case-section" id="case-study" aria-labelledby="case-heading">
        <div class="case-heading"><div class="case-heading-meta">II / IN THE WORLD<br>真实作品，是真正的论据</div><h2 id="case-heading">看它如何<br><em>成为画面。</em></h2><span class="case-heading-count">${String(cases.length).padStart(2,'0')} OBJECTS</span></div>
        ${lead ? `<article class="case-feature"><figure class="case-image"><img src="${esc(media(lead.images[0]))}" alt="${esc(lead.name)}" loading="lazy"></figure><div class="case-copy"><span class="case-no">FIG. 01 / ${esc(term.name)}</span><h3>${esc(lead.name)}</h3><p>${esc(lead.why)}</p><a href="../#/case/${encodeURIComponent(lead.id)}">阅读作品与分析 <span>↗</span></a></div></article>` : ''}
        ${secondary ? `<article class="case-secondary"><div class="case-secondary-intro"><span>FIG. 02 / STILL LOOKING</span><p>再换一件作品，看相同的感觉如何以另一种形式成立。</p></div><figure><img src="${esc(media(secondary.images[0]))}" alt="${esc(secondary.name)}" loading="lazy"></figure><div class="case-secondary-caption"><strong>${esc(secondary.name)}</strong><p>${esc(secondary.why)}</p><a href="../#/case/${encodeURIComponent(secondary.id)}">查看案例 ↗</a></div></article>` : ''}
      </section>
      <section class="method" aria-labelledby="method-title"><span>III / TAKE IT WITH YOU</span><div><h2 id="method-title">把感觉用出来。</h2><ol>${(term.steps || []).map(step=>`<li>${esc(step)}</li>`).join('')}</ol></div></section>
    </main>
    <footer><span>审美外挂 <i>✳</i> V2 视觉试验</span><span>内容来自飞书多维表格 · 当前数据快照 ${esc((data.generatedAt || '').slice(0,10))}</span><a href="../#/term/${encodeURIComponent(term.id)}">回到完整词条 ↗</a></footer>`;
}

fetch('../data.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw new Error(`数据快照读取失败：${response.status}`);
  return response.json();
}).then(render).catch(error => {
  app.innerHTML = `<main class="error"><h1>预览暂时无法显示</h1><p>${esc(error.message)}</p><a href="../#/">返回沙盒首页</a></main>`;
});
