/**
 * P5 presentation component. The host owns content and navigation routes.
 * All four categories have distinct stable keys; no sample content or fake URLs.
 */
const asset = name => new URL(`assets/${name}`, import.meta.url).href;

export const RESOURCE_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'visual-inspiration', label: '视觉灵感', desktopLabel: '找视觉灵感' }),
  Object.freeze({ id: 'artworks', label: '艺术作品', desktopLabel: '研究真实艺术作品' }),
  Object.freeze({ id: 'interactive-websites', label: '互动网站', desktopLabel: '寻找互动网页' }),
  Object.freeze({ id: 'creative-materials', label: '创作素材', desktopLabel: '寻找可用创作素材' }),
]);

export function mountArtResources(root, options = {}) {
  if (!(root instanceof HTMLElement)) throw new TypeError('P5 requires an HTML mount element.');
  const { onSelect, onNavigate, onContinue } = options;
  const controller = new AbortController();
  root.classList.add('p5-root');
  root.innerHTML = `
    <section class="p5-frame" aria-label="艺术资源" data-figma-mobile="968:224" data-figma-desktop="902:43">
      <div class="p5-door" aria-hidden="true">
        <img src="${asset('p5-half-door-original.png')}" alt="" width="1536" height="1024" draggable="false">
      </div>
      <div class="p5-foliage" aria-hidden="true">
        <img src="${asset('p5-foliage-v6.png')}" alt="" width="989" height="1591" draggable="false">
      </div>
      <button class="p5-navigation" type="button" data-action="navigation" aria-label="打开星星导航">
        <picture>
          <source media="(min-width: 900px)" srcset="${asset('star-desktop.svg')}">
          <img src="${asset('star-mobile.svg')}" alt="" width="44" height="44">
        </picture>
        <span>导航</span>
      </button>
      <div class="p5-reading">
        <header class="p5-heading">
          <p class="p5-kicker">艺术资源</p>
          <h1>你想找什么？</h1>
          <p class="p5-intro p5-mobile-copy">从你想做的事开始。</p>
          <p class="p5-intro p5-desktop-copy">按想做的事来选。<br>不必先记住网站名字。</p>
        </header>
        <nav class="p5-entries" aria-label="按用途选择艺术资源">
          ${RESOURCE_CATEGORIES.map((category, i) => `
            <div class="p5-entry-space">
              <button class="p5-entry${i % 2 === 0 ? ' p5-entry-inverted' : ''}"
                type="button" data-category="${category.id}" aria-label="${category.desktopLabel}">
                <span class="p5-number" aria-hidden="true">0${i + 1}</span>
                <span class="p5-entry-content">
                  <span class="p5-mobile-copy">${category.label}</span>
                  <span class="p5-desktop-copy">${category.desktopLabel}</span>
                  <span class="p5-direction" aria-hidden="true">→</span>
                </span>
              </button>
            </div>`).join('')}
        </nav>
      </div>
      <button class="p5-continue" type="button" data-action="continue">继续向下 · 意象实验室 <span aria-hidden="true">↓</span></button>
    </section>`;

  const emit = (type, detail, callback) => {
    const event = new CustomEvent(`p5:${type}`, { detail, bubbles: true, cancelable: true });
    if (root.dispatchEvent(event) && typeof callback === 'function') callback(detail);
  };
  root.addEventListener('click', event => {
    const control = event.target.closest('button');
    if (!control || !root.contains(control)) return;
    if (control.dataset.category) {
      const category = RESOURCE_CATEGORIES.find(item => item.id === control.dataset.category);
      if (category) emit('select', category, onSelect);
    } else if (control.dataset.action === 'navigation') {
      emit('navigate', {}, onNavigate);
    } else if (control.dataset.action === 'continue') {
      emit('continue', { destination: 'imagery-lab' }, onContinue);
    }
  }, { signal: controller.signal });

  // The scene is a reusable page section: suspend motion when it leaves view,
  // or the browser tab is hidden. CSS handles the reduced-motion preference.
  let inView = true;
  const updateMotion = () => root.classList.toggle('p5-motion-paused', document.hidden || !inView);
  const observer = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateMotion(); })
    : null;
  observer?.observe(root.querySelector('.p5-frame'));
  document.addEventListener('visibilitychange', updateMotion, { signal: controller.signal });
  updateMotion();

  return {
    element: root.querySelector('.p5-frame'),
    destroy() {
      observer?.disconnect();
      controller.abort();
      root.replaceChildren();
      root.classList.remove('p5-root', 'p5-motion-paused');
    },
  };
}
