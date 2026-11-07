/* Adopted mobile P1: original star appears → disappears → appears, 2026-11-01. */
(() => {
  const scene = document.getElementById('mp1-scene');
  const image = document.getElementById('mp1');
  if (!scene || !image) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const shape = 'M145 1155L182 1190 199 1227 183 1265 145 1290 106 1265 91 1227 106 1189Z';
  const ns = 'http://www.w3.org/2000/svg';
  let overlay, marker, animation, observer, resizeObserver, visible = false, queued = false;

  function updateVisibility() {
    queued = false;
    if (!animation || !marker) return;
    const r = marker.getBoundingClientRect();
    const next = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && !document.hidden;
    if (next === visible) return;
    visible = next;
    if (visible) animation.play();
    else animation.pause();
  }

  function afterScroll() {
    if (queued) return;
    queued = true;
    // The continuous page moves mstack in rAF. Read its resulting position.
    requestAnimationFrame(() => requestAnimationFrame(updateVisibility));
  }

  function remove() {
    animation?.cancel();
    observer?.disconnect();
    resizeObserver?.disconnect();
    overlay?.remove();
    marker?.remove();
    removeEventListener('scroll', afterScroll);
    removeEventListener('resize', afterScroll);
    document.removeEventListener('visibilitychange', updateVisibility);
    overlay = marker = animation = observer = resizeObserver = null;
    visible = false;
  }

  function mount() {
    if (animation || reduced.matches || !image.complete || !image.naturalWidth) return;
    if (scene.dataset.revealing === 'pending' || scene.dataset.revealing === 'running') return;

    overlay = document.createElementNS(ns, 'svg');
    overlay.setAttribute('viewBox', '0 0 780 1688');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.add('mobile-star-blink');
    overlay.dataset.twinkle = 'adopted';
    overlay.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    // The paper patch hides the baked-in star. The animated copy uses original pixels.
    overlay.innerHTML = `<defs><clipPath id="p1-blink-star"><path d="${shape}"/></clipPath></defs><path d="${shape}" fill="#faf7f1"/><g clip-path="url(#p1-blink-star)" data-blink-star><image width="780" height="1688"/></g>`;
    overlay.querySelector('image').setAttribute('href', image.currentSrc || image.src);
    scene.append(overlay);

    marker = document.createElement('span');
    marker.setAttribute('aria-hidden', 'true');
    marker.dataset.blinkMarker = '';
    marker.style.cssText = 'position:absolute;left:11.666667%;top:68.424171%;width:13.846154%;height:7.99763%;pointer-events:none';
    scene.append(marker);

    animation = overlay.querySelector('[data-blink-star]').animate([
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: .4, easing: 'ease-in-out' },
      { opacity: 0, offset: .52 },
      { opacity: 0, offset: .65, easing: 'ease-in-out' },
      { opacity: 1, offset: .8 },
      { opacity: 1, offset: 1 },
    ], { duration: 3200, iterations: Infinity, easing: 'linear' });
    animation.pause();
    animation.currentTime = 0;

    observer = new IntersectionObserver(updateVisibility, { threshold: [0, .01, 1] });
    observer.observe(marker);
    resizeObserver = new ResizeObserver(afterScroll);
    resizeObserver.observe(scene);
    addEventListener('scroll', afterScroll, { passive: true });
    addEventListener('resize', afterScroll, { passive: true });
    document.addEventListener('visibilitychange', updateVisibility);
    updateVisibility();
  }

  const opening = new MutationObserver(mount);
  opening.observe(scene, { attributes: true, attributeFilter: ['data-revealing'] });
  image.addEventListener('load', mount, { once: true });
  reduced.addEventListener('change', () => reduced.matches ? remove() : mount());
  mount();
})();
