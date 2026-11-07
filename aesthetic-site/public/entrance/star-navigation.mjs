import { entries } from './star-navigation-data.mjs';

const asset = name => new URL(`assets/star-navigation/${name}`, import.meta.url).href;

/** Mount once per host. Routes may supply { href, navigate }; absent routes stay explicit. */
export function mountStarNavigation({ trigger, routes = {}, initial = 'topics' } = {}) {
  if (document.getElementById('star-navigation')) return;
  const abort = new AbortController();
  const on = (el, type, fn, options = {}) => el.addEventListener(type, fn, { ...options, signal: abort.signal });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!trigger) throw new Error('A scene star trigger is required');
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'star-navigation');
  trigger.setAttribute('aria-expanded', 'false');

  const dialog = document.createElement('dialog');
  dialog.id = 'star-navigation'; dialog.className = 'star-nav';
  dialog.setAttribute('aria-labelledby', 'star-nav-heading');
  dialog.innerHTML = `<div class="star-nav-art" aria-hidden="true"></div>
    <button type="button" class="star-nav-close" aria-label="关闭全站目录"><img src="${asset('star.svg')}" alt="" width="52" height="52"><span>× 关闭目录</span></button>
    <div class="star-nav-content"><h2 id="star-nav-heading">去往何处</h2><nav class="star-nav-entries" aria-label="全站板块"></nav></div>
    <p class="star-nav-note">从有感觉，到有风格。</p>
    <p class="star-nav-message" role="status" aria-live="polite"></p>`;
  document.body.append(dialog);
  const artLayer = dialog.querySelector('.star-nav-art');
  const nav = dialog.querySelector('.star-nav-entries');
  const message = dialog.querySelector('.star-nav-message');
  const closeButton = dialog.querySelector('.star-nav-close');
  const controls = [], pictures = [];
  let selected = Math.max(0, entries.findIndex(e => e.id === initial));
  let open = false, closing = null, scroll = 0, previousRootOverflow = '', previousFocus = null, sequence = 0;
  const loads = new Map();

  entries.forEach((entry, index) => {
    const route = routes[entry.id];
    const control = document.createElement(route ? 'a' : 'button');
    control.className = 'star-nav-entry'; control.dataset.id = entry.id;
    if (route) control.href = route.href;
    else { control.type = 'button'; control.setAttribute('aria-disabled', 'true'); }
    const number = document.createElement('span'); number.className = 'star-nav-number';
    number.textContent = String(index + 1).padStart(2, '0'); number.setAttribute('aria-hidden', 'true');
    const title = document.createElement('span'); title.className = 'star-nav-title'; title.textContent = entry.name;
    control.append(number, title);
    if (!route) { const status = document.createElement('span'); status.className = 'star-nav-pending'; status.textContent = '准备中'; control.append(status); }
    nav.append(control); controls.push(control);
    const picture = document.createElement('img');
    picture.alt = ''; picture.dataset.id = entry.id; picture.decoding = 'async';
    artLayer.append(picture); pictures.push(picture);
    on(control, 'pointerenter', event => { if (event.pointerType !== 'touch') preview(index); });
    on(control, 'focus', () => preview(index));
    on(control, 'click', async event => {
      // Preserve native open-in-new-tab behavior on the real link.
      if (route && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return;
      event.preventDefault();
      if (!route) { preview(index); message.textContent = `「${entry.name}」还在准备中，可以先浏览美学专题。`; return; }
      await close();
      try { if (route.navigate) await route.navigate(); else location.assign(route.href); }
      catch { location.assign(route.href); }
    });
  });

  async function preview(index) {
    if (!open) return;
    selected = index; message.textContent = '';
    controls.forEach((el, i) => el.classList.toggle('is-preview', i === index));
    pictures.forEach(el => el.classList.remove('is-visible'));
    dialog.dataset.preview = entries[index].id;
    const token = ++sequence, picture = pictures[index];
    // No illustration requests before the menu opens; cache each visited image.
    if (!loads.has(index)) {
      picture.src = asset(entries[index].art);
      loads.set(index, picture.decode().then(() => true, () => false));
    }
    const loaded = await loads.get(index);
    if (!open || token !== sequence) return;
    if (loaded) picture.classList.add('is-visible');
    else message.textContent = '插画暂时未能加载，导航仍可使用。';
  }

  function show() {
    if (open || closing || trigger.disabled || trigger.hidden) return;
    open = true; scroll = window.scrollY;
    previousFocus = trigger;
    previousRootOverflow = document.documentElement.style.overflow;
    // Lock the document only: making body a scroll container shifts the host's sticky scenes.
    document.documentElement.style.overflow = 'hidden';
    window.scrollTo({ top: scroll, behavior: 'instant' });
    document.documentElement.dataset.starNavOpen = 'true';
    trigger.setAttribute('aria-expanded', 'true');
    dialog.showModal();
    // Initial focus stays on close, so focusing does not replace the last preview.
    closeButton.focus({ preventScroll: true });
    preview(selected);
    requestAnimationFrame(() => { if (open) dialog.classList.add('is-open'); });
  }

  function close() {
    if (closing) return closing;
    if (!open) return Promise.resolve();
    open = false; sequence++;
    dialog.classList.remove('is-open');
    closing = new Promise(resolve => {
      setTimeout(() => {
        dialog.close();
        document.documentElement.style.overflow = previousRootOverflow;
        delete document.documentElement.dataset.starNavOpen;
        trigger.setAttribute('aria-expanded', 'false');
        window.scrollTo({ top: scroll, behavior: 'instant' });
        const focus = previousFocus?.isConnected ? previousFocus : trigger;
        focus?.focus({ preventScroll: true });
        closing = null;
        window.dispatchEvent(new Event('star-navigation-closed'));
        resolve();
      }, reduced.matches ? 0 : 380);
    });
    return closing;
  }

  on(trigger, 'click', show);
  on(closeButton, 'click', close);
  // Keep gestures inside the modal. CSS contains overscroll; the root stays locked.
  for (const type of ['wheel', 'touchmove']) on(dialog, type, event => event.stopPropagation(), { passive: true });
  on(dialog, 'cancel', event => { event.preventDefault(); close(); });
  // Capture before the gallery's document-wide arrow handlers. The native modal
  // isolates pointer input; this also prevents hidden-gallery keyboard movement.
  on(window, 'keydown', event => {
    if (!dialog.open) return;
    event.stopImmediatePropagation();
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (!open) { event.preventDefault(); return; }
    const focusable = [closeButton, ...controls], at = focusable.indexOf(document.activeElement);
    if (event.key === 'Tab') {
      event.preventDefault(); focusable[(at + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus({ preventScroll: true });
    } else if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? 4 : (selected + (['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1) + 5) % 5;
      controls[index].focus({ preventScroll: true });
    }
  }, { capture: true });
  return { open: show, close };
}
