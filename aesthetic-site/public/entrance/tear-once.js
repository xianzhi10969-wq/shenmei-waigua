/* Adopted from research/2026-11-01-p1-tear-reveal: original pixels, once per load. */
(() => {
  const scene = document.getElementById('mp1-scene');
  const image = document.getElementById('mp1');
  if (!scene || !image || scene.dataset.tearOnce) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) { scene.dataset.tearOnce = 'static'; return; }
  const ns = 'http://www.w3.org/2000/svg';
  const shape = 'M539.3 904.8C542.2 903.3 546.9 905.3 547.5 908.8C548.2 913.5 545.7 916.5 541.6 916.3C538.2 916.1 536.5 913.7 536.7 910.7C536.9 908.1 538.0 906.3 539.3 904.8Z';
  let overlay, ready = false, watchingWoman = false, mounted = false;
  scene.dataset.tearOnce = 'waiting';
  scene.dataset.tearStarts = '0';

  function faceIsVisible() {
    const r = image.getBoundingClientRect();
    const top = r.top + r.height * 903 / 1688;
    const bottom = r.top + r.height * 919 / 1688;
    return r.width > 0 && bottom > 0 && top < innerHeight && !document.hidden;
  }

  function maybeStart() {
    if (!mounted || !ready || scene.dataset.tearOnce !== 'waiting') return;
    overlay.style.visibility = 'visible';
    if (!faceIsVisible()) return;
    scene.dataset.tearOnce = 'revealing';
    scene.dataset.tearStarts = String(Number(scene.dataset.tearStarts) + 1);
    const tear = overlay.querySelector('[data-tear]');
    const rect = overlay.querySelector('[data-tear-wipe]');
    const timing = { duration: 1100, delay: 280, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both', iterations: 1 };
    const fade = tear.animate([{ opacity: 0 }, { opacity: 1 }], timing);
    const wipe = rect.animate([{ height: '0px' }, { height: '18px' }], timing);
    const clock = document.timeline.currentTime;
    fade.startTime = wipe.startTime = clock;
    Promise.all([fade.finished, wipe.finished]).then(() => {
      scene.dataset.tearOnce = 'done';
      overlay.remove();
      observer.disconnect();
      removeEventListener('scroll', afterScroll);
      document.removeEventListener('visibilitychange', maybeStart);
    });
  }

  function afterScroll() { requestAnimationFrame(() => requestAnimationFrame(maybeStart)); }

  function patchWoman() {
    const woman = scene.querySelector('[data-layer="woman"]');
    const copy = woman?.querySelector('image');
    if (copy && !copy.dataset.tearMasked) {
      copy.dataset.tearMasked = '1';
      const opening = woman.ownerSVGElement;
      const mask = document.createElementNS(ns, 'mask');
      mask.id = 'tear-absent-during-woman';
      mask.setAttribute('maskUnits', 'userSpaceOnUse');
      mask.setAttribute('x', '0');mask.setAttribute('y', '0');mask.setAttribute('width', '780');mask.setAttribute('height', '1688');
      mask.innerHTML = `<rect width="780" height="1688" fill="white"/><path d="${shape}" fill="black"/>`;
      opening.querySelector('defs').append(mask);
      // Skin replacement stays inside the woman's own reveal track.
      const skin = document.createElementNS(ns, 'g');skin.setAttribute('mask','url(#tear-skin-soft)');const skinCopy=document.createElementNS(ns,'image');skinCopy.setAttribute('href',image.currentSrc||image.src);skinCopy.setAttribute('width','780');skinCopy.setAttribute('height','1688');skinCopy.setAttribute('transform','matrix(2 0 0 1 -560 0)');skin.append(skinCopy);woman.append(skin);
    }
    if (woman && !watchingWoman) {
      watchingWoman = true;
      const entry = woman.getAnimations()[0];
      if (entry) entry.finished.then(() => { ready = true;maybeStart(); }, () => { if (scene.dataset.revealing === 'done') { ready = true;maybeStart(); } });
    }
    if (scene.dataset.revealing === 'done') { ready = true;maybeStart(); }
  }

  function mount() {
    if (mounted || !image.complete || !image.naturalWidth) return;
    mounted = true;
    overlay = document.createElementNS(ns, 'svg');
    overlay.setAttribute('viewBox', '0 0 780 1688');overlay.setAttribute('aria-hidden', 'true');overlay.dataset.tearOverlay = '';
    overlay.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;visibility:hidden';
    overlay.innerHTML = `<defs><filter id="tear-skin-edge" x="-50%" y="-50%" width="200%" height="200%"><feMorphology operator="dilate" radius=".8"/><feGaussianBlur stdDeviation=".85"/></filter><mask id="tear-skin-soft" maskUnits="userSpaceOnUse" x="532" y="900" width="21" height="22"><path d="${shape}" fill="white" filter="url(#tear-skin-edge)"/></mask><linearGradient id="tear-skin-fill" gradientUnits="userSpaceOnUse" x1="537" y1="903" x2="547" y2="918"><stop stop-color="#f6f2ed"/><stop offset="1" stop-color="#f4f0ea"/></linearGradient><clipPath id="tear-original-shape"><path d="${shape}"/></clipPath><clipPath id="tear-once-wipe"><rect data-tear-wipe x="534" y="902" width="17" height="18"/></clipPath></defs><g mask="url(#tear-skin-soft)"><image data-skin-copy width="780" height="1688" transform="matrix(2 0 0 1 -560 0)"/></g><g clip-path="url(#tear-original-shape)"><g clip-path="url(#tear-once-wipe)"><g data-tear style="opacity:0"><image width="780" height="1688"/></g></g></g>`;
    overlay.querySelectorAll('image').forEach(copy=>copy.setAttribute('href', image.currentSrc || image.src));scene.append(overlay);patchWoman();
  }

  const observer = new MutationObserver(() => { mount();patchWoman(); });
  observer.observe(scene, { attributes: true, attributeFilter: ['data-revealing'], childList: true, subtree: true });
  image.addEventListener('load', mount, { once: true });
  addEventListener('scroll', afterScroll, { passive: true });
  document.addEventListener('visibilitychange', maybeStart);
  mount();
})();
