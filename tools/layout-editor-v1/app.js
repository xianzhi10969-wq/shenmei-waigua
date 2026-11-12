import { renderLayout } from './renderer.js';
import { snapCoordinate, integerImageSize } from './pixel.mjs';
import { assignSlot, missingScenes, bindingReport, replaceLayerImage } from './site-bindings.mjs';

const $ = id => document.getElementById(id);
const clone = value => structuredClone(value);
const id = () => crypto.randomUUID();
let doc, revision = 0, pageId, mode = 'desktop', selected = null, scale = 1, autoFit = true;
let history = [], historyIndex = -1, dirty = false, saving = false, conflict = false, sequence = 0;
let saveTimer, toastTimer, gesture = null, ioBusy = false;
let siteSlots=[];
const page = () => doc.pages.find(p => p.id === pageId) || doc.pages[0];
const layout = () => page().layouts[mode];
const element = () => layout().elements.find(e => e.id === selected);
const notify = message => { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 5500); };
function status(message) { $('save-status').textContent = message; }
async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers:{'Content-Type':'application/json', ...options.headers} });
  const result = await response.json();
  if (!response.ok) { const error = new Error(result.error || '操作未完成'); error.status = response.status; throw error; }
  return result;
}
function scheduleSave() { dirty = true; sequence++; status('待保存…'); clearTimeout(saveTimer); saveTimer = setTimeout(save, 500); }
async function save() {
  if (!dirty || saving || conflict || gesture) return false;
  saving = true; const serial = sequence;
  status('正在保存…');
  try {
    const result = await api('/api/state', {method:'PUT', body:JSON.stringify({revision, document:doc})});
    revision = result.revision; dirty = sequence !== serial;
    status(dirty ? '待保存…' : '已保存到本机');
    return true;
  } catch (error) {
    if (error.status === 409) { conflict = true; $('conflict').hidden = false; status('版本冲突 · 请处理'); }
    else { status('未保存 · 将重试'); notify(error.message || '本地服务未连接，修改仍留在当前窗口，请导出备份。'); }
    return false;
  } finally { saving = false; if (dirty && !conflict) saveTimer = setTimeout(save, 2200); }
}
function record() {
  history.splice(historyIndex + 1);
  history.push(clone(doc));
  if (history.length > 60) history.shift();
  historyIndex = history.length - 1;
  $('undo').disabled = historyIndex <= 0; $('redo').disabled = true;
}
function change(fn) {
  const before = JSON.stringify(doc);
  fn();
  if (JSON.stringify(doc) !== before) { record(); scheduleSave(); }
  render();
}
function undo(delta) {
  const next = historyIndex + delta;
  if (next < 0 || next >= history.length || gesture) return;
  historyIndex = next; doc = clone(history[next]); selected = null;
  if (!doc.pages.some(p => p.id === pageId)) pageId = doc.pages[0].id;
  scheduleSave(); render();
}
function field(label, key, value, opts = {}) {
  const box = document.createElement('label'); box.className = 'field' + (opts.full ? ' full' : '');
  const title = document.createElement('span'); title.textContent = label; box.append(title);
  const input = document.createElement(opts.choices ? 'select' : opts.area ? 'textarea' : 'input');
  input.dataset.prop = key; input.setAttribute('aria-label', label);
  if (opts.choices) for (const [v, text] of opts.choices) { const option = document.createElement('option'); option.value = v; option.textContent = text; input.append(option); }
  else if (!opts.area) { input.type = opts.type || 'text'; if (opts.min !== undefined) input.min = opts.min; if (opts.max !== undefined) input.max = opts.max; input.step = opts.step || 1; }
  input.value = value; box.append(input);
  input.addEventListener('change', () => {
    const current = opts.canvas ? layout() : element(); if (!current) return;
    let value = input.value;
    if (opts.type === 'number') { value = Number(value); if (!Number.isFinite(value)) return renderProperties(); value = Math.min(opts.max ?? 100000, Math.max(opts.min ?? -100000, value)); }
    change(() => {
      if (key === 'opacity') value /= 100;
      if ((key === 'width' || key === 'height') && !opts.canvas && current.type === 'image' && current.keepRatio !== false) {
        const other = key === 'width' ? 'height' : 'width'; current[other] = Math.max(1, Math.min(24000, current[other] * value / current[key]));
      }
      current[key] = value;
      if (!opts.canvas && layout().snapGrid && ['x','y'].includes(key)) current[key] = snapCoordinate(current[key], layout().gridSize || 1);
      if (!opts.canvas && current.pixelated && current.type === 'image' && ['width','height'].includes(key)) {
        const asset = doc.assets.find(a=>a.id===current.assetId);
        const size = integerImageSize(asset,current.width,current.height);current.width=size.width;current.height=size.height;
      }
    });
  });
  return box;
}
function check(label, value, action) {
  const box = document.createElement('label'); box.className = 'check';
  const input = document.createElement('input'); input.type = 'checkbox'; input.checked = value;
  input.addEventListener('change', () => change(() => action(input.checked))); box.append(input, document.createTextNode(label)); return box;
}
function renderProperties() {
  const root = $('properties'); root.replaceChildren(); const el = element();
  $('properties-title').textContent = el ? (el.locked ? '图层属性 · 已锁定' : '图层属性') : '画布设置';
  if (!el) {
    const grid = document.createElement('div'); grid.className = 'field-grid';
    grid.append(field('宽度', 'width', layout().width, {type:'number', min:100, max:12000, canvas:true}), field('高度', 'height', layout().height, {type:'number', min:100, max:12000, canvas:true}));
    root.append(grid, field('背景颜色', 'background', layout().background, {type:'color', canvas:true}));
    const slotLabel=document.createElement('label');slotLabel.className='field';slotLabel.textContent='放到网页的哪个位置';
    const slotInput=document.createElement('select');slotInput.setAttribute('aria-label','网页位置');
    const choices=[{id:'',name:'暂不连接网页'},...siteSlots];
    if(page().artSlot&&!siteSlots.some(s=>s.id===page().artSlot))choices.push({id:page().artSlot,name:'旧自定义位置（尚未接入网页）'});
    for(const slot of choices){const option=document.createElement('option');option.value=slot.id;const owner=slot.id&&doc.pages.find(p=>p.id!==pageId&&p.artSlot===slot.id);option.textContent=slot.name+(owner?' · 已被「'+owner.name+'」使用':'');option.disabled=!!owner;slotInput.append(option);}
    slotInput.value=page().artSlot||'';
    slotInput.onchange=()=>{try{change(()=>assignSlot(doc,pageId,slotInput.value,siteSlots));}catch(error){notify(error.message);renderProperties();}};slotLabel.append(slotInput);root.append(slotLabel);
    const connection=siteSlots.find(s=>s.id===page().artSlot);
    if(connection){const hint=document.createElement('p');hint.className='properties-help';hint.textContent='保存后更新网页。'+(connection.hint||'手机和桌面分别读取对应布局。');root.append(hint);const visit=document.createElement('button');visit.textContent='保存并看网页 ↗';visit.onclick=()=>openSite(connection.route);root.append(visit);}
    root.append(check('拖动吸附到像素网格',!!layout().snapGrid,v=>layout().snapGrid=v));
    if (layout().snapGrid) root.append(field('网格间距（画布像素）','gridSize',layout().gridSize||1,{type:'number',min:1,max:64,canvas:true}));
    const help = document.createElement('p'); help.className = 'properties-help'; help.textContent = '桌面和手机各自保存画布与图层。切换尺寸不会自动改排另一端。'; root.append(help);
    const copy = document.createElement('button'); copy.textContent = '复制另一端布局到这里'; copy.style.width = '100%';
    copy.onclick = async () => {
      const other = mode === 'desktop' ? 'mobile' : 'desktop';
      if (!await ask('复制布局', '将替换当前端的图层，原布局可用撤销恢复。按画布宽度等比缩放后，仍需要手动调整。')) return;
      change(() => { const ratio = layout().width / page().layouts[other].width; layout().elements = clone(page().layouts[other].elements).map(el => ({...el, id:id(), x:el.x*ratio, y:el.y*ratio, width:Math.max(1,el.width*ratio), height:Math.max(1,el.height*ratio), ...(el.type === 'text' ? {fontSize:Math.max(6,Math.min(600,el.fontSize*ratio))} : {})})); });
    }; root.append(copy); return;
  }
  root.append(field('图层名称', 'name', el.name));
  if (el.type === 'text') root.append(field('文字内容', 'text', el.text, {area:true}));
  const grid = document.createElement('div'); grid.className = 'field-grid';
  for (const [label, key] of [['X','x'],['Y','y'],['宽度','width'],['高度','height'],['旋转 °','rotation'],['不透明度 %','opacity']]) {
    grid.append(field(label,key,key === 'opacity' ? Math.round(el[key]*100) : Math.round(el[key]*10)/10, {type:'number',min:key==='opacity'?0:['width','height'].includes(key)?1:-100000,max:key==='opacity'?100:['width','height'].includes(key)?24000:100000,step:key==='rotation'?1:0.1}));
  }
  root.append(grid);
  if (el.type === 'image') {
    const replacement=document.createElement('label');replacement.className='field';replacement.textContent='替换这一层的图片';
    const picker=document.createElement('select');picker.setAttribute('aria-label','替换图片');
    for(const a of doc.assets){const option=document.createElement('option');option.value=a.id;option.textContent=a.name;picker.append(option);}picker.value=el.assetId;
    picker.onchange=()=>{try{change(()=>replaceLayerImage(el,doc.assets.find(a=>a.id===picker.value)));}catch(error){notify(error.message);renderProperties();}};
    replacement.append(picker);root.append(replacement);
    const replaceHelp=document.createElement('p');replaceHelp.className='properties-help';replaceHelp.textContent='只替换这一层，原图和其他场景保留。位置与层级不变；像素模式按新图取最近整数倍尺寸。';root.append(replaceHelp);
    root.append(check('保持图片比例',el.keepRatio !== false,v => el.keepRatio=v));
    const asset=doc.assets.find(a=>a.id===el.assetId);
    root.append(check('像素素材：整数倍缩放，关闭旋转',!!el.pixelated,v=>{
      if(v&&Math.max(asset.width,asset.height)>24000){notify('原图过大，请换用小尺寸像素素材');return;}
      el.pixelated=v;if(v){const size=integerImageSize(asset,el.width,el.height);el.width=size.width;el.height=size.height;el.rotation=0;el.keepRatio=true;el.x=Math.round(el.x);el.y=Math.round(el.y);}
    }));
    if(el.pixelated){
      root.querySelector('[data-prop="rotation"]').disabled=true;
      const buttons=document.createElement('div');buttons.className='scene-actions';
      for(const factor of [1,2,3,4]){const button=document.createElement('button');button.textContent=factor+'×';button.disabled=el.locked||Math.max(asset.width,asset.height)*factor>24000;button.onclick=()=>change(()=>{el.width=asset.width*factor;el.height=asset.height*factor;});buttons.append(button);}
      root.append(buttons);const note=document.createElement('p');note.className='properties-help';note.textContent=`原图 ${asset.width} × ${asset.height}；以文件像素为准，不强制 32 色或 96×96。`;root.append(note);
    }
  }
  if (el.type === 'text') {
    const textGrid = document.createElement('div'); textGrid.className = 'field-grid';
    textGrid.append(field('字号','fontSize',el.fontSize,{type:'number',min:6,max:600}),field('文字颜色','color',el.color,{type:'color'}),field('字体','fontFamily',el.fontFamily,{choices:[['sans-serif','无衬线'],['serif','衬线'],['monospace','等宽']]}),field('对齐','align',el.align,{choices:[['left','左对齐'],['center','居中'],['right','右对齐']]})); root.append(textGrid,check('粗体',el.bold,v => el.bold=v));
  } else if (el.type === 'shape') root.append(field('占位颜色','color',el.color,{type:'color'}));
  if (el.locked) root.querySelectorAll('input,select,textarea').forEach(input => input.disabled = true);
}
function renderPages() {
  $('pages').replaceChildren();
  doc.pages.forEach((p,index) => { const button = document.createElement('button'); button.className = 'page-button' + (p.id === pageId ? ' active' : ''); const number = document.createElement('span'); number.textContent = String(index+1).padStart(2,'0'); button.append(number,document.createTextNode(p.name)); button.onclick = () => {pageId=p.id;selected=null;autoFit=true;render();}; $('pages').append(button); });
  $('delete-page').disabled = doc.pages.length === 1;
}
function renderAssets() {
  $('assets').replaceChildren(); $('asset-count').textContent = doc.assets.length; $('asset-empty').hidden = !!doc.assets.length;
  doc.assets.forEach(asset => { const tile = document.createElement('button'); tile.className = 'asset-tile'; tile.title = '放入画布：' + asset.name; const image = document.createElement('img'); image.src = asset.url; image.alt = asset.name; const name = document.createElement('span'); name.textContent = asset.name; tile.append(image,name); tile.onclick = () => addImage(asset); tile.draggable = true; tile.ondragstart = event => event.dataTransfer.setData('application/x-layout-asset',asset.id); $('assets').append(tile); });
}
function renderLayers() {
  $('layers').replaceChildren(); const els = layout().elements;
  $('layer-count').textContent = els.length; $('layers-empty').hidden = !!els.length;
  [...els].reverse().forEach(el => {
    const row = document.createElement('div'); row.className = 'layer'+(el.id===selected?' selected':'')+(el.hidden?' hidden-layer':''); row.tabIndex=0; row.setAttribute('role','button'); row.setAttribute('aria-label','选择图层 '+el.name);
    const type = document.createElement('span'); type.className='layer-type'; type.textContent={text:'T',image:'▧',shape:'□'}[el.type];
    const name = document.createElement('span'); name.className='layer-name'; name.textContent=el.name;
    const hide = document.createElement('button'); hide.textContent=el.hidden?'隐藏':'可见'; hide.title='切换图层可见性'; hide.onclick = event => {event.stopPropagation();change(() => el.hidden=!el.hidden);};
    const lock = document.createElement('button'); lock.textContent=el.locked?'锁定':'自由'; lock.title='切换图层锁定'; lock.onclick = event => {event.stopPropagation();change(() => el.locked=!el.locked);};
    row.append(type,name,hide,lock); row.onclick = () => {selected=el.id;renderSelection();renderLayers();renderProperties();}; row.onkeydown = event => {if(event.key==='Enter') row.click();}; $('layers').append(row);
  });
  const index = els.findIndex(e=>e.id===selected), locked = element()?.locked;
  $('layer-up').disabled = index < 0 || index === els.length-1 || locked;
  $('layer-down').disabled = index <= 0 || locked;
  $('delete-element').disabled = index < 0 || locked; $('duplicate-element').disabled = index < 0;
}
function computeScale() {
  if (!autoFit) return;
  const viewport = $('viewport'); const padding = innerWidth < 850 ? 50 : 96;
  scale = Math.min(1, Math.max(.025, Math.min((viewport.clientWidth-padding)/layout().width,(viewport.clientHeight-padding)/layout().height)));
}
function renderCanvas() {
  computeScale(); const l = layout();
  renderLayout($('canvas'),l,doc.assets);
  $('canvas').style.overflow = 'visible'; $('canvas').style.transform = `scale(${scale})`;
  $('stage-wrap').style.width=l.width*scale+'px';$('stage-wrap').style.height=l.height*scale+'px';
  $('canvas').querySelectorAll('.art-element').forEach(node => {const el=l.elements.find(e=>e.id===node.dataset.id);node.classList.toggle('locked',!!el.locked);node.addEventListener('pointerdown',event => startGesture(event,el.id,'move'));});
  $('canvas-dimensions').textContent=`${l.width} × ${l.height}`; $('zoom-label').textContent=Math.round(scale*100)+'%';
  $('empty-guide').hidden=l.elements.length>0;
  renderSelection();
}
function renderSelection() {
  $('canvas').querySelector('.selection-box')?.remove(); const el = element();
  $('selection-info').textContent=el ? `${el.name} · ${Math.round(el.width)} × ${Math.round(el.height)}${el.locked?' · 已锁定':''}`:'未选择图层';
  if (!el || el.hidden) return;
  const box = document.createElement('div'); box.className='selection-box';
  Object.assign(box.style,{left:el.x+'px',top:el.y+'px',width:el.width+'px',height:el.height+'px',transform:`rotate(${el.rotation}deg)`,borderWidth:1.5/scale+'px'});
  if (!el.locked) { const handle = document.createElement('div'); handle.className='resize-handle'; handle.setAttribute('aria-label','拖动调整尺寸'); handle.style.width=10/scale+'px';handle.style.height=10/scale+'px';handle.style.right=-5/scale+'px';handle.style.bottom=-5/scale+'px';handle.style.borderWidth=1/scale+'px';handle.onpointerdown=event=>startGesture(event,el.id,'resize');box.append(handle); }
  $('canvas').append(box);
}
function render() {
  if (!doc.pages.some(p=>p.id===pageId)) pageId=doc.pages[0].id;
  if (selected && !element()) selected=null;
  $('project-name').value=doc.name;
  $('desktop').classList.toggle('active',mode==='desktop');$('mobile').classList.toggle('active',mode==='mobile');
  $('undo').disabled=historyIndex<=0;$('redo').disabled=historyIndex>=history.length-1;
  renderPages();renderAssets();renderLayers();renderProperties();renderCanvas();
  if($('bindings-dialog').open)renderBindings();
}
function renderBindings(){
  const rows=bindingReport(doc,siteSlots),root=$('binding-list');root.replaceChildren();
  const connected=rows.filter(r=>r.pageId).length;
  $('binding-summary').textContent=`${connected} / ${siteSlots.length} 个位置已连接。`+(dirty?'当前修改尚未保存。':'以当前已读取的布局为准。')+' 图层数量不代表美术已确认。';
  for(const row of rows){
    const card=document.createElement('article');card.className='binding-card';
    const title=document.createElement('h3');title.textContent=row.name;card.append(title);
    const owner=document.createElement('p');owner.textContent=row.pageId?'连接场景：'+row.pageName:'尚未连接场景';card.append(owner);
    if(row.duplicate){const warning=document.createElement('p');warning.className='binding-warning';warning.textContent='多个场景占用了同一位置，请解除重复连接。';card.append(warning);}
    if(row.pageId){for(const [key,label] of [['desktop','桌面'],['mobile','手机']]){const detail=document.createElement('p');detail.textContent=label+'：'+row[key].label;card.append(detail);for(const msg of row[key].warnings){const warning=document.createElement('p');warning.className='binding-warning';warning.textContent=label+' · '+msg;card.append(warning);}}
      const edit=document.createElement('button');edit.textContent='编辑这个场景';edit.onclick=()=>{pageId=row.pageId;selected=null;autoFit=true;$('bindings-dialog').close();render();};card.append(edit);
    }
    root.append(card);
  }
  const unknown=doc.pages.filter(p=>p.artSlot&&!siteSlots.some(s=>s.id===p.artSlot));
  if(unknown.length){const note=document.createElement('p');note.className='binding-warning';note.textContent='尚未接入网页的自定义场景：'+unknown.map(p=>p.name).join('、')+'。可在画布设置中改选网页位置。';root.append(note);}
  $('add-site-scenes').textContent=connected===siteSlots.length?'所有位置均已有场景':`补齐 ${siteSlots.length-connected} 个空白场景`;
  $('add-site-scenes').disabled=connected===siteSlots.length;
}
function addSiteScenes(){
  try{const pages=missingScenes(doc,siteSlots,id);if(!pages.length)return;
    change(()=>{doc.pages.push(...pages);pageId=pages[0].id;selected=null;});notify('已追加空白场景。现有场景保留，可用撤销恢复。');
  }catch(error){notify(error.message);}
}
async function openSite(route='#/entrance'){
  const target=window.open('about:blank','park-preview');if(!target)return notify('请允许本地编辑器打开预览窗口。');
  if(dirty)await save();
  if(dirty||saving||conflict){target.close();return notify('请先完成保存或处理版本冲突，再看网页。');}
  target.location.href='http://127.0.0.1:8871/'+route;
}
async function exportWebsite(){
  if(ioBusy)return notify('请等待当前文件操作完成');
  if(dirty)await save();
  if(dirty||saving||conflict)return notify('请先保存修改或处理版本冲突，再下载网页包。');
  ioBusy=true;$('export-website').disabled=true;notify('正在打包网页、布局和原图，请稍候…');
  try{const result=await api('/api/export-site',{method:'POST',body:JSON.stringify({revision})});
    const link=document.createElement('a');link.href=result.url;link.download=result.filename;link.click();
    notify('网页包已生成。它是当前保存版本的独立副本，后续修改需重新下载。');
  }catch(error){notify('未能打包：'+error.message);}finally{ioBusy=false;$('export-website').disabled=false;}
}
function startGesture(event, elementId, kind) {
  if (event.button !== 0) return;
  const el=layout().elements.find(e=>e.id===elementId);if(el.locked)return;
  event.preventDefault();event.stopPropagation();selected=elementId;
  gesture={kind,startX:event.clientX,startY:event.clientY,original:clone(el),before:JSON.stringify(doc),pointerId:event.pointerId};
  renderSelection();renderLayers();renderProperties();
}
window.addEventListener('pointermove',event=>{
  if(!gesture || event.pointerId!==gesture.pointerId)return;
  const el=element(), g=gesture; const dx=(event.clientX-g.startX)/scale,dy=(event.clientY-g.startY)/scale;
  if(g.kind==='move') {el.x=Math.round(g.original.x+dx);el.y=Math.round(g.original.y+dy);}
  else {
    const theta=g.original.rotation*Math.PI/180, localX=dx*Math.cos(theta)+dy*Math.sin(theta),localY=-dx*Math.sin(theta)+dy*Math.cos(theta);
    let w=Math.max(8,Math.min(24000,g.original.width+localX)),h=Math.max(8,Math.min(24000,g.original.height+localY));
    if(el.type==='image' && el.keepRatio!==false || event.shiftKey) {const ratio=g.original.width/g.original.height;if(Math.abs(localX)>Math.abs(localY))h=w/ratio;else w=h*ratio;const factor=Math.min(1,24000/w,24000/h);w*=factor;h*=factor;}
    if(el.type==='image' && el.pixelated){const size=integerImageSize(doc.assets.find(a=>a.id===el.assetId),w,h);w=size.width;h=size.height;}
    // Keep the rotated top-left corner fixed while resizing about the CSS centre.
    const dw=w-g.original.width,dh=h-g.original.height;
    el.x=g.original.x+(dw*Math.cos(theta)-dh*Math.sin(theta)-dw)/2;
    el.y=g.original.y+(dw*Math.sin(theta)+dh*Math.cos(theta)-dh)/2;
    el.width=Math.round(w*10)/10;el.height=Math.round(h*10)/10;
  }
  if(layout().snapGrid){el.x=snapCoordinate(el.x,layout().gridSize||1);el.y=snapCoordinate(el.y,layout().gridSize||1);}
  renderCanvas();
});
function endGesture(cancel=false){
  if(!gesture)return;
  if(cancel)Object.assign(element(),gesture.original);
  const changed=JSON.stringify(doc)!==gesture.before;gesture=null;
  if(changed){record();scheduleSave();}else if(dirty&&!conflict){clearTimeout(saveTimer);saveTimer=setTimeout(save,500);}render();
}
window.addEventListener('pointerup',()=>endGesture());window.addEventListener('pointercancel',()=>endGesture(true));window.addEventListener('blur',()=>endGesture());
function baseElement(type,name,width,height) {return {id:id(),type,name,x:Math.round((layout().width-width)/2),y:Math.round((layout().height-height)/2),width,height,rotation:0,opacity:1,hidden:false,locked:false};}
function addImage(asset) {change(()=>{const factor=Math.min(1,layout().width*.6/asset.width,layout().height*.65/asset.height);const el={...baseElement('image',asset.name,Math.round(asset.width*factor),Math.round(asset.height*factor)),assetId:asset.id,keepRatio:true};layout().elements.push(el);selected=el.id;});}
function addText(){change(()=>{const width=Math.min(400,layout().width*.8),el={...baseElement('text','文字',width,100),text:'在这里写下你的文字',fontSize:mode==='mobile'?24:36,color:'#303a32',fontFamily:'sans-serif',align:'left',bold:false};layout().elements.push(el);selected=el.id;});}
function addShape(){change(()=>{const el={...baseElement('shape','占位块',Math.round(layout().width*.4),Math.round(layout().height*.3)),color:'#e5e9e3'};layout().elements.push(el);selected=el.id;});}
function duplicateElement(){const current=element();if(!current)return;change(()=>{const copy={...clone(current),id:id(),name:current.name+' 副本',x:current.x+20,y:current.y+20,locked:false};layout().elements.push(copy);selected=copy.id;});}
function deleteElement(){if(!element()||element().locked)return;change(()=>{layout().elements=layout().elements.filter(e=>e.id!==selected);selected=null;});}
function reorder(delta){const els=layout().elements,index=els.findIndex(e=>e.id===selected);if(index<0||element().locked||index+delta<0||index+delta>=els.length)return;change(()=>{[els[index],els[index+delta]]=[els[index+delta],els[index]];});}
function ask(title,description,value) {
  return new Promise(resolve=>{const dialog=$('prompt-dialog');$('dialog-title').textContent=title;$('dialog-description').textContent=description;$('dialog-input').hidden=value===undefined;$('dialog-input').value=value||'';dialog.returnValue='cancel';dialog.onclose=()=>resolve(dialog.returnValue==='ok'?(value===undefined?true:$('dialog-input').value.trim()||value):null);dialog.showModal();if(value!==undefined)$('dialog-input').select();});
}
function asDataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('无法读取文件'));reader.readAsDataURL(blob);});}
function imageSize(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve({width:image.naturalWidth,height:image.naturalHeight});image.onerror=()=>reject(new Error('图片无法解码'));image.src=url;});}
async function uploadData(dataUrl,name) {
  const dimensions=await imageSize(dataUrl);
  if(dimensions.width>50000||dimensions.height>50000)throw new Error('图片尺寸过大');
  const result=await api('/api/assets',{method:'POST',body:JSON.stringify({dataUrl})});
  return {id:id(),name,url:result.url,...dimensions};
}
async function uploadFiles(files){
  if(ioBusy)return notify('上一个文件操作还在进行，请稍候');ioBusy=true;
  let added=0;
  try {for(const file of files){if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)||file.size>12*1024*1024){notify(file.name+'：请使用 12 MB 内的 PNG/JPG/WebP/GIF');continue;}const asset=await uploadData(await asDataURL(file),file.name);change(()=>doc.assets.push(asset));added++;}if(added)notify(`已导入 ${added} 张原图。点击素材即可放进画布。`);}
  catch(error){notify('导入未全部完成：'+error.message);}finally{ioBusy=false;$('asset-input').value='';}
}
function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function exportProject(){
  if(ioBusy)return notify('请等待文件操作完成');ioBusy=true;notify('正在打包项目和原图…');
  try {const copy=clone(doc);for(const asset of copy.assets){const response=await fetch(asset.url);if(!response.ok)throw new Error('原图读取失败：'+asset.name);asset.dataUrl=await asDataURL(await response.blob());delete asset.url;}download(JSON.stringify(copy,null,2),doc.name.replace(/[\\/:*?"<>|]/g,'-')+'.json','application/json');notify('项目已导出，包含原图、所有场景和两端布局。');}
  catch(error){notify('导出失败：'+error.message);}finally{ioBusy=false;}
}
function validateImport(input){
  if(input?.schema!==1 || !Array.isArray(input.pages) || !input.pages.length || input.pages.length>100 || !Array.isArray(input.assets) || input.assets.length>1000)throw new Error('不是支持的排版项目');
  if(doc.pages.length+input.pages.length>100 || doc.assets.length+input.assets.length>1000)throw new Error('合并后场景或素材数量超出上限');
  const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
  const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
  const aids=new Set();
  for(const a of input.assets){if(typeof a.id!=='string'||aids.has(a.id)||typeof a.name!=='string'||!/^data:image\/(png|jpeg|webp|gif);base64,/.test(a.dataUrl||''))throw new Error('项目素材不完整，请使用“导出项目”生成的文件');aids.add(a.id);}
  for(const p of input.pages){if(typeof p.name!=='string')throw new Error('场景名称无效');for(const m of ['desktop','mobile']){const l=p.layouts?.[m];if(!l||!finite(l.width,100,12000)||!finite(l.height,100,12000)||!color(l.background)||!Array.isArray(l.elements)||l.elements.length>1000)throw new Error('画布格式无效');for(const e of l.elements){if(!['text','image','shape'].includes(e.type)||!finite(e.x,-100000,100000)||!finite(e.y,-100000,100000)||!finite(e.width,1,24000)||!finite(e.height,1,24000)||!finite(e.rotation,-100000,100000)||!finite(e.opacity,0,1))throw new Error('图层数值无效');if(e.type==='image'&&!aids.has(e.assetId))throw new Error('图片图层缺少素材');if(e.type!=='image'&&!color(e.color))throw new Error('图层颜色无效');if(e.type==='text'&&(typeof e.text!=='string'||e.text.length>50000||!finite(e.fontSize,6,600)||!['sans-serif','serif','monospace'].includes(e.fontFamily)||!['left','center','right'].includes(e.align)))throw new Error('文字样式无效');}}}
}
async function importProject(file){
  if(!file)return;if(ioBusy)return notify('请等待文件操作完成');
  ioBusy=true;
  try {if(file.size>64*1024*1024)throw new Error('项目超过 64 MB，请拆分场景导入');const input=JSON.parse(await file.text());validateImport(input);
    if(!await ask('导入项目',`将追加 ${input.pages.length} 个场景及素材。现有场景会保留，导入后可以撤销。`))return;
    const assets=[],map=new Map();for(const original of input.assets){const asset=await uploadData(original.dataUrl,original.name);assets.push(asset);map.set(original.id,asset.id);}
    const usedSlots=new Set(doc.pages.map(p=>p.artSlot).filter(Boolean));
    const pages=input.pages.map(p=>{p.id=id();if(p.artSlot){if(usedSlots.has(p.artSlot)||!/^[a-z0-9-]{1,80}$/.test(p.artSlot))p.artSlot='';else usedSlots.add(p.artSlot);}for(const l of Object.values(p.layouts))for(const e of l.elements){e.id=id();e.name=String(e.name||'图层');e.locked=!!e.locked;e.hidden=!!e.hidden;if(e.type==='image')e.assetId=map.get(e.assetId);}return p;});
    change(()=>{doc.assets.push(...assets);doc.pages.push(...pages);pageId=pages[0].id;selected=null;});notify('项目已追加导入。现有场景完整保留。');
  }catch(error){notify('导入失败：'+error.message);}finally{ioBusy=false;$('project-input').value='';}
}
async function poll(){
  if(!doc||saving||gesture||ioBusy||$('prompt-dialog').open||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  try {const latest=await api('/api/state');if(saving||gesture||ioBusy||$('prompt-dialog').open||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(latest.revision<=revision)return;if(dirty){conflict=true;$('conflict').hidden=false;status('另一窗口有更新');return;}doc=latest.document;revision=latest.revision;selected=null;history=[];historyIndex=-1;record();render();status('已同步另一窗口');}catch{if(!dirty)status('本地服务未连接');}
}
async function init(){
  try {const [result,slots]=await Promise.all([api('/api/state'),api('/site-slots.json')]);siteSlots=slots;doc=result.document;revision=result.revision;pageId=doc.pages[0].id;record();render();status('已保存到本机');}
  catch(error){status('打开失败');notify('请启动本地服务后刷新：'+error.message);return;}
  $('project-name').onchange=()=>change(()=>doc.name=$('project-name').value.trim()||'我的排版项目');
  $('undo').onclick=()=>undo(-1);$('redo').onclick=()=>undo(1);
  $('desktop').onclick=()=>{mode='desktop';selected=null;autoFit=true;render();};$('mobile').onclick=()=>{mode='mobile';selected=null;autoFit=true;render();};
  $('add-text').onclick=addText;$('add-shape').onclick=addShape;$('empty-shape').onclick=addShape;
  $('duplicate-element').onclick=duplicateElement;$('delete-element').onclick=deleteElement;
  $('layer-up').onclick=()=>reorder(1);$('layer-down').onclick=()=>reorder(-1);
  $('fit').onclick=()=>{autoFit=true;renderCanvas();};$('zoom-in').onclick=()=>{autoFit=false;scale=Math.min(2,scale*1.2);renderCanvas();};$('zoom-out').onclick=()=>{autoFit=false;scale=Math.max(.025,scale/1.2);renderCanvas();};
  $('canvas').addEventListener('pointerdown',event=>{if(event.target===$('canvas')){selected=null;renderSelection();renderLayers();renderProperties();}});
  $('viewport').addEventListener('pointerdown',event=>{if(event.target===$('viewport')||event.target===$('stage-wrap')){selected=null;renderSelection();renderLayers();renderProperties();}});
  $('add-page').onclick=async()=>{const name=await ask('新建场景','桌面和手机会各有一张独立的空白画布。','场景 '+String(doc.pages.length+1).padStart(2,'0'));if(name)change(()=>{const p={id:id(),name,layouts:{desktop:{width:1200,height:800,background:'#ffffff',elements:[]},mobile:{width:390,height:844,background:'#ffffff',elements:[]}}};doc.pages.push(p);pageId=p.id;selected=null;});};
  $('rename-page').onclick=async()=>{const name=await ask('场景名称','',page().name);if(name)change(()=>page().name=name);};
  $('duplicate-page').onclick=()=>change(()=>{const p=clone(page());p.id=id();p.name+=' 副本';p.artSlot='';for(const l of Object.values(p.layouts))for(const e of l.elements)e.id=id();doc.pages.push(p);pageId=p.id;selected=null;});
  $('delete-page').onclick=async()=>{if(doc.pages.length===1)return;if(await ask('删除场景',`删除「${page().name}」的桌面和手机布局，素材原图会保留。可以撤销。`))change(()=>{doc.pages=doc.pages.filter(p=>p.id!==pageId);pageId=doc.pages[0].id;selected=null;});};
  $('upload-assets').onclick=()=>$('asset-input').click();$('asset-input').onchange=()=>uploadFiles([...$('asset-input').files]);
  $('export-project').onclick=exportProject;$('export-conflict').onclick=exportProject;
  $('site-bindings').onclick=()=>{renderBindings();$('bindings-dialog').showModal();};
  $('close-bindings').onclick=()=>$('bindings-dialog').close();$('add-site-scenes').onclick=addSiteScenes;
  $('export-website').onclick=exportWebsite;
  $('import-project').onclick=()=>$('project-input').click();$('project-input').onchange=()=>importProject($('project-input').files[0]);
  $('load-latest').onclick=async()=>{if(!await ask('读取最新版本','本窗口未保存的修改会被替换。需要保留时，请先点击“导出我的修改”。'))return;try{const result=await api('/api/state');doc=result.document;revision=result.revision;dirty=false;conflict=false;selected=null;history=[];historyIndex=-1;record();$('conflict').hidden=true;render();status('已读取最新版本');}catch(error){notify(error.message);}};
  $('preview').onclick=async()=>{const preview=window.open('about:blank','layout-preview');if(!preview)return notify('请允许本地编辑器打开预览窗口。');if(dirty){await save();if(dirty){preview.close();return notify('请先完成保存或处理版本冲突，再预览。');}}preview.location.href='/preview.html?page='+encodeURIComponent(pageId)+'&mode='+mode;};
  for(const target of [$('viewport'),document.querySelector('.assets-section')]) {
    target.addEventListener('dragover',event=>{event.preventDefault();target.classList.add('dragover');});
    target.addEventListener('dragleave',()=>target.classList.remove('dragover'));
    target.addEventListener('drop',event=>{event.preventDefault();target.classList.remove('dragover');const assetId=event.dataTransfer.getData('application/x-layout-asset');if(assetId){const a=doc.assets.find(a=>a.id===assetId);if(a)addImage(a);}else uploadFiles([...event.dataTransfer.files]);});
  }
  window.addEventListener('dragover',event=>event.preventDefault());window.addEventListener('drop',event=>event.preventDefault());
  window.addEventListener('keydown',event=>{
    if(['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)||event.target.isContentEditable||$('prompt-dialog').open||$('bindings-dialog').open)return;
    const cmd=event.metaKey||event.ctrlKey;
    if(cmd&&event.key.toLowerCase()==='z'){event.preventDefault();undo(event.shiftKey?1:-1);return;}
    if(cmd&&event.key.toLowerCase()==='s'){event.preventDefault();save();return;}
    if(cmd&&event.key.toLowerCase()==='d'){event.preventDefault();duplicateElement();return;}
    if(event.key==='Escape'){if(gesture)endGesture(true);selected=null;render();return;}
    if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();deleteElement();return;}
    if(element()&&!element().locked&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();change(()=>{const delta=event.shiftKey?10:1;element().x+=event.key==='ArrowLeft'?-delta:event.key==='ArrowRight'?delta:0;element().y+=event.key==='ArrowUp'?-delta:event.key==='ArrowDown'?delta:0;});}
  });
  new ResizeObserver(()=>renderCanvas()).observe($('viewport'));
  window.addEventListener('beforeunload',event=>{if(dirty||ioBusy||gesture){event.preventDefault();event.returnValue='';}});
  setInterval(poll,2000);
}
init();
