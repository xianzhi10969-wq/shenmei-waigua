(() => {
 const dataEl = document.querySelector('#collage-data');
 if (!dataEl) return;
 const data = JSON.parse(dataEl.textContent), art = document.querySelector('.collage-art');
 const dialog = document.createElement('dialog');
 dialog.className = 'collage-dialog';
 dialog.setAttribute('aria-labelledby', 'collage-original-title');
 dialog.innerHTML = '<button class="dialog-close" aria-label="关闭原图">关闭 ×</button><img alt=""><h2 id="collage-original-title"></h2><p class="origin-note"></p><nav><button class="read-case">阅读案例 ↓</button><a class="original-link" target="_blank" rel="noopener">打开完整原图 ↗</a><a class="source-link" target="_blank" rel="noopener">查看出处 ↗</a></nav>';
 document.body.append(dialog);
 let selected = null;
 dialog.querySelector('.dialog-close').onclick = () => dialog.close();
 dialog.addEventListener('click', event => { if (event.target === dialog) {const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();} });
 dialog.querySelector('.read-case').onclick = () => {
   const target = document.getElementById('case-' + selected.caseId);
   dialog.close();
   if (target) window.termCollageNavigation.openCase(target, selected.caseImage);
 };
 function openOriginal(index) {
   selected = data.pieces[index];
   if (!selected) return;
   const img = dialog.querySelector('img');img.src = selected.original;img.alt = selected.title;
   dialog.querySelector('h2').textContent = selected.title;
   dialog.querySelector('.origin-note').textContent = selected.origin === 'external-reference' ? '拼贴参考作品' : selected.label;
   dialog.querySelector('.read-case').hidden = !selected.caseId || !document.getElementById('case-' + selected.caseId);
   dialog.querySelector('.original-link').href = selected.original;
   const source = dialog.querySelector('.source-link');
   source.hidden = !/^https?:\/\//.test(selected.source);source.href = source.hidden ? '#' : selected.source;
   dialog.showModal();
 }
 function bind() {
   const doc = art.contentDocument;
   if (!doc) return;
   // SVG roots have fixed native sizes in the archive; scale only the complete canvas.
   doc.documentElement.style.width = '100%';doc.documentElement.style.height = '100%';
   doc.querySelectorAll('a.piece,a.unit').forEach((link) => {
     const index = link.hasAttribute('data-index') ? Number(link.dataset.index) : Number(link.dataset.number) - 1;
     link.setAttribute('tabindex', '0');link.setAttribute('aria-label', data.pieces[index].title + '，查看原图');
     link.addEventListener('click', event => { event.preventDefault();openOriginal(index); });
     link.addEventListener('keydown', event => {if(event.key==='Enter'||event.key===' '){event.preventDefault();openOriginal(index);}});
   });
 }
 art.addEventListener('load', bind);
 const mobile = matchMedia('(max-width:700px)');
 function resize(){const src=mobile.matches?art.dataset.mobile:art.dataset.desktop;if(art.getAttribute('data')!==src)art.setAttribute('data',src);}
 mobile.addEventListener('change', resize);resize();
})();
