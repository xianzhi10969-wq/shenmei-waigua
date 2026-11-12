// DOM simulation checks application wiring, not screenshot or drag validation.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {snapCoordinate,integerImageSize} from './pixel.mjs';
import {assignSlot,missingScenes,bindingReport,replaceLayerImage} from './site-bindings.mjs';
const {parseHTML,HTMLSelectElement}=await import('file:///tmp/park-dom-check/linkedom-worker.mjs');
Object.defineProperty(HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||'';},set(value){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',o.value===String(value));}});
const {document,window}=parseHTML(fs.readFileSync(new URL('./index.html',import.meta.url),'utf8'));
for(const node of document.querySelectorAll('dialog')){node.showModal=()=>node.open=true;node.close=()=>node.open=false;}
Object.defineProperty(document.getElementById('viewport'),'clientWidth',{value:800});
Object.defineProperty(document.getElementById('viewport'),'clientHeight',{value:600});
const slots=JSON.parse(fs.readFileSync(new URL('./site-slots.json',import.meta.url)));
let persisted={revision:0,document:{schema:1,name:'隔离测试',assets:[],pages:[{id:'original',name:'已有草稿',layouts:{desktop:{width:1200,height:800,background:'#ffffff',elements:[]},mobile:{width:390,height:844,background:'#ffffff',elements:[]}}}]}};
const context=vm.createContext({document,window,innerWidth:1440,structuredClone,crypto:{randomUUID},console,
  snapCoordinate,integerImageSize,assignSlot,missingScenes,bindingReport,replaceLayerImage,
  ResizeObserver:class{observe(){}},setInterval:()=>1,setTimeout:()=>1,clearTimeout:()=>{},
  fetch:async(path,options={})=>{
    if(path==='/site-slots.json')return {ok:true,json:async()=>structuredClone(slots)};
    assert.equal(path,'/api/state');
    if(options.method==='PUT'){const data=JSON.parse(options.body);assert.equal(data.revision,persisted.revision);persisted={revision:persisted.revision+1,document:data.document};}
    return {ok:true,json:async()=>structuredClone(persisted)};
  }});
vm.runInContext(fs.readFileSync(new URL('./renderer.js',import.meta.url),'utf8').replace(/export /g,''),context);
vm.runInContext(fs.readFileSync(new URL('./app.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'').replace(/\ninit\(\);\s*$/,''),context);
const run=code=>vm.runInContext(code,context),get=id=>document.getElementById(id);
await run('init()');get('site-bindings').onclick();
assert.match(get('binding-summary').textContent,/0 \/ 8/);get('add-site-scenes').onclick();
assert.equal(run('doc.pages.length'),9);assert.match(get('binding-summary').textContent,/8 \/ 8/);
assert.equal(get('binding-list').querySelectorAll('.binding-card').length,8);
assert.match(get('binding-list').textContent,/手机：还没有可见图层/);
get('close-bindings').onclick();get('duplicate-page').onclick();
assert.equal(run('page().artSlot'),'');assert.equal(run('doc.pages[0].name'),'已有草稿');
await run('save()');
const bound=persisted.document.pages.map(p=>p.artSlot).filter(Boolean);
assert.equal(bound.length,new Set(bound).size);
get('undo').onclick();assert.equal(run('doc.pages.length'),9);
get('redo').onclick();assert.equal(run('doc.pages.length'),10);assert.equal(run('doc.pages.at(-1).artSlot'),'');
const picker=document.querySelector('[aria-label="网页位置"]');
assert.equal(picker.tagName,'SELECT');assert.equal([...picker.querySelectorAll('option')].filter(o=>o.disabled).length,8);
await run('save()');assert.equal(persisted.document.pages.length,10);
console.log('PASS 编辑器 DOM：中文选择、检查面板、补齐空白、已占位置禁用、复制解除绑定、保存成功、撤销重做保留原稿。');
