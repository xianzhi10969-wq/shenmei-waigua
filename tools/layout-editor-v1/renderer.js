export function makeElement(el, assets) {
  const node = document.createElement('div');
  node.className = 'art-element';
  node.dataset.id = el.id;
  Object.assign(node.style, {
    position: 'absolute', boxSizing: 'border-box', left: el.x + 'px', top: el.y + 'px',
    width: el.width + 'px', height: el.height + 'px', transform: `rotate(${el.rotation}deg)`,
    opacity: el.opacity, display: el.hidden ? 'none' : 'block'
  });
  if (el.type === 'image') {
    const asset = assets.find(a => a.id === el.assetId);
    const img = document.createElement('img');
    img.src = asset?.url || ''; img.alt = asset?.name || ''; img.draggable = false;
    Object.assign(img.style, { width:'100%', height:'100%', objectFit:'contain', display:'block', pointerEvents:'none' });
    if (el.pixelated) img.style.imageRendering = 'pixelated';
    node.append(img);
  } else if (el.type === 'text') {
    node.textContent = el.text;
    Object.assign(node.style, { color:el.color, fontSize:el.fontSize+'px', fontFamily:el.fontFamily,
      fontWeight:el.bold ? '700' : '400', textAlign:el.align, lineHeight:'1.35', whiteSpace:'pre-wrap', overflowWrap:'anywhere' });
  } else {
    node.style.background = el.color;
    node.style.border = '1px solid rgba(0,0,0,.12)';
  }
  return node;
}

export function renderLayout(container, layout, assets) {
  container.replaceChildren();
  Object.assign(container.style, {position:'relative', width:layout.width+'px', height:layout.height+'px', background:layout.background, overflow:'hidden'});
  layout.elements.forEach(el => container.append(makeElement(el, assets)));
}
