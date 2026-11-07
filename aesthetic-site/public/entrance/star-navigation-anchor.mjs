// The control has no drawing of its own: it follows the star already in each scene.
// Coordinates refer to the protected artwork / the existing transition's rose anchor.
export function createSceneStarTrigger() {
  const trigger = document.createElement('button');
  trigger.id = 'star-nav-trigger'; trigger.type = 'button';
  trigger.className = 'star-nav-trigger'; trigger.hidden = true;
  trigger.setAttribute('aria-label', '打开全站导航');
  trigger.title = '打开全站导航';
  document.body.append(trigger);
  const root = document.documentElement;
  let queued = false, idleTimer = 0, moving = false, pointer = null;

  const rectAnchor = (element, scene) => {
    if (!element) return null;
    const r = element.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, size: r.width, scene };
  };
  function anchor() {
    const cinema = document.getElementById('cinema');
    const mobile = innerWidth <= 680;
    if (cinema && getComputedStyle(cinema).visibility !== 'hidden' && Number(getComputedStyle(cinema).opacity) > .99) {
      const q = Number(root.dataset.progress || 0);
      if (q >= .999 && root.dataset.ready === 'true') {
        const stage = document.getElementById('stage');
        // Wait for the gallery's own spring to settle; never interrupt its motion.
        if (Math.abs(Number(stage?.dataset.position || 0) - Number(stage?.dataset.target ?? stage?.dataset.position ?? 0)) > .00005) return null;
        const scene = stage?.querySelector('.scene'), matrix = scene?.getScreenCTM();
        if (!matrix) return null;
        const p = new DOMPoint(mobile ? 1199 : 512, mobile ? 279 : 239).matrixTransform(matrix);
        return { x: p.x, y: p.y, size: 72 * Math.hypot(matrix.a, matrix.b), scene: 'p3' };
      }
      if (q <= .03) return rectAnchor(document.getElementById('traveller'), 'p2');
      return null; // The travelling star belongs to the transition until it is seated.
    }
    if (mobile) {
      const stack = document.getElementById('mstack');
      if (stack?.dataset.starFlight === 'true') {
        // Match desktop: the star becomes a control after it seats in the water.
        if (stack.dataset.starSeated !== 'true') return null;
        return rectAnchor(document.getElementById('mstar'), 'p2');
      }
      const image = document.getElementById('mp1'), scene = document.getElementById('mp1-scene');
      if (image?.complete && image.naturalWidth && !['pending', 'running'].includes(scene?.dataset.revealing)) {
        const r = image.getBoundingClientRect();
        const p1 = { x: r.x + r.width * 145 / 780, y: r.y + r.height * 1227 / 1688, size: r.width * 135 / 780, scene: 'p1' };
        if (p1.y > 0 && p1.y < innerHeight) return p1;
      }
      const star = document.getElementById('mstar');
      return star?.complete && star.naturalWidth && getComputedStyle(star).visibility !== 'hidden' ? rectAnchor(star, 'p2') : null;
    }
    // The protected desktop opening lives in a same-origin, scaled iframe.
    const frame = document.getElementById('v4');
    try {
      const doc = frame?.contentDocument, win = frame?.contentWindow;
      if (!doc || !win) return null;
      const ink = doc.getElementById('starIn');
      if (!ink || win.getComputedStyle(ink).animationName !== 'none') return null;
      const travel = win.scrollY / Math.max(1, doc.documentElement.scrollHeight - win.innerHeight);
      if (travel > .03 && travel < .999) return null;
      const star = doc.getElementById(travel >= .999 ? 'p2star' : 'star');
      const p = rectAnchor(star, travel >= .999 ? 'p2' : 'p1');
      if (!p) return null;
      const r = frame.getBoundingClientRect(), scale = r.width / frame.offsetWidth;
      return { ...p, x: r.x + p.x * scale, y: r.y + p.y * scale, size: p.size * scale };
    } catch { return null; }
  }
  function update() {
    queued = false;
    if (root.dataset.starNavOpen === 'true') return;
    const p = anchor();
    const size = p ? Math.max(44, Math.min(96, p.size)) : 44;
    const visible = p && p.x >= size / 2 && p.x <= innerWidth - size / 2 && p.y >= size / 2 && p.y <= innerHeight - size / 2;
    trigger.hidden = !visible;
    trigger.disabled = moving || !visible;
    if (!visible) return;
    trigger.dataset.scene = p.scene;
    Object.assign(trigger.style, { left: `${p.x - size / 2}px`, top: `${p.y - size / 2}px`, width: `${size}px`, height: `${size}px` });
  }
  function schedule() {
    if (queued) return;
    queued = true;
    // Existing layout/scroll rAF writes run first; read the resulting artwork position.
    requestAnimationFrame(() => requestAnimationFrame(update));
  }
  addEventListener('scroll', () => {
    if (root.dataset.starNavOpen === 'true') return;
    moving = true; if (pointer) pointer.cancelled = true;
    trigger.disabled = true; clearTimeout(idleTimer);
    schedule(); idleTimer = setTimeout(() => { moving = false; schedule(); }, 180);
  }, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('gallery-position', schedule);
  addEventListener('star-navigation-closed', schedule);
  document.addEventListener('load', schedule, true);
  const scene = document.getElementById('mp1-scene');
  if (scene) new MutationObserver(schedule).observe(scene, { attributes: true, attributeFilter: ['data-revealing'] });
  const stage = document.getElementById('stage');
  if (stage) new ResizeObserver(schedule).observe(stage);
  const frame = document.getElementById('v4');
  const watchOpening = () => {
    try { frame.contentDocument?.addEventListener('animationend', schedule); } catch {}
    schedule();
  };
  frame?.addEventListener('load', watchOpening); watchOpening();

  trigger.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) { if (pointer) pointer.cancelled = true; return; }
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, scroll: scrollY, cancelled: false, pressed: true, type: event.pointerType };
  });
  addEventListener('pointermove', event => {
    if (!pointer?.pressed || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (Math.hypot(dx, dy) > 8) pointer.cancelled = true;
    // Match the host's mouse-as-finger vertical drag in the mobile preview.
    if (pointer.type === 'mouse' && innerWidth <= 680 && pointer.cancelled && Math.abs(dy) > Math.abs(dx)) {
      event.preventDefault(); window.scrollTo({ top: pointer.scroll - dy, behavior: 'instant' });
    }
  }, { passive: false });
  addEventListener('pointerup', event => { if (pointer?.id === event.pointerId) pointer.pressed = false; });
  addEventListener('pointercancel', event => { if (pointer?.id === event.pointerId) { pointer.cancelled = true; pointer.pressed = false; } });
  addEventListener('blur', () => { if (pointer) { pointer.cancelled = true; pointer.pressed = false; } });
  trigger.addEventListener('click', event => {
    const valid = !trigger.disabled && !trigger.hidden && (event.detail === 0 || (pointer && !pointer.cancelled && Math.abs(scrollY - pointer.scroll) < 2));
    pointer = null;
    if (!valid) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, { capture: true });
  schedule();
  return trigger;
}
