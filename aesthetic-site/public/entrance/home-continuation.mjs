import { mountArtResources } from '/resources/p5.mjs';

// Existing P5 artwork and P6 functionality, in the homepage's native scroll flow.
// The legacy lab has its own global styles; a fitted same-origin frame isolates them.
const resources = document.querySelector('#home-resources');
const lab = document.querySelector('#home-imagery');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const go = el => el.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
mountArtResources(resources, {
  onSelect: ({ id }) => location.assign('/features/#/resources/' + id),
  onNavigate: () => window.starNavigation?.open(),
  onContinue: () => go(lab),
});

const frame = lab.querySelector('iframe');
frame.addEventListener('load', () => {
  const doc = frame.contentDocument;
  if (!doc) return;
  const style = doc.createElement('style');
  style.textContent = `html,body{height:auto!important;min-height:0!important;overflow:hidden!important;margin:0}
    .feature-header,.site-directory-slot,.imagery-page .breadcrumb,.imagery-page .back{display:none!important}
    .imagery-page{min-height:0!important}.shell{min-height:0!important}`;
  doc.head.append(style);
  let raf = 0;
  const fit = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const content = doc.querySelector('#app');
      if (!content) return;
      const height = Math.ceil(content.getBoundingClientRect().height);
      if (height > 100 && Math.abs(frame.clientHeight - height) > 1) frame.style.height = height + 'px';
    });
  };
  new ResizeObserver(fit).observe(doc.querySelector('#app'));
  doc.fonts.ready.then(fit);
  fit();
  doc.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const url = new URL(link.href, doc.baseURI);
    if (url.origin !== location.origin) return;
    event.preventDefault();
    url.searchParams.delete('embedded');
    location.assign(url.href);
  }, true);
});
frame.src = '/features/?embedded=home#/imagery';

window.homeContinuation = { resources: () => go(resources), imagery: () => go(lab) };
