import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const {parseHTML}=await import('file:///tmp/park-dom-check/linkedom-worker.mjs');
const {document,window}=parseHTML('<html><body><div class="asset-slot" data-art-slot="p3-browse">原占位</div></body></html>');
const target=document.querySelector('.asset-slot');Object.defineProperty(target,'clientWidth',{value:390});
const text={id:'text-1',type:'text',text:'可编辑文字',name:'标题',x:20,y:40,width:120,height:60,rotation:0,opacity:1,color:'#000000',fontSize:20,fontFamily:'sans-serif',align:'left'};
const saved={revision:1,document:{assets:[],pages:[{id:'p',artSlot:'p3-browse',layouts:{desktop:{width:1200,height:800,background:'#ffffff',elements:[{...text,x:200}]},mobile:{width:390,height:844,background:'#ffffff',elements:[text]}}}]}};
const context=vm.createContext({document,window,innerWidth:390,fetch:async()=>({ok:true,json:async()=>structuredClone(saved)}),setTimeout,clearTimeout,setInterval,clearInterval});
const renderer=fs.readFileSync(new URL('../../tools/layout-editor-v1/renderer.js',import.meta.url),'utf8').replace(/export /g,'');
const bridge=fs.readFileSync(new URL('./art-bridge.mjs',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'').replace(/export /g,'');
vm.runInContext(renderer,context);vm.runInContext(bridge,context);
await vm.runInContext('refreshArt()',context);
assert.equal(target.querySelector('.art-element').style.left,'20px');assert.equal(target.querySelector('.art-element').textContent,'可编辑文字');assert.equal(target.style.height,'844px');
context.innerWidth=1440;vm.runInContext('applyArt()',context);assert.equal(target.querySelector('.art-element').style.left,'200px');
saved.revision=2;saved.document.pages[0].layouts.desktop.elements[0].x=250;await vm.runInContext('refreshArt()',context);assert.equal(target.querySelector('.art-element').style.left,'250px');
saved.revision=3;saved.document.pages[0].layouts.desktop.elements=[];await vm.runInContext('refreshArt()',context);assert.equal(target.textContent,'原占位');assert.equal(target.querySelector('.shared-art'),null);
console.log('PASS 共用布局桥：手机／桌面分别读取、坐标原样渲染、保存后同步、清空后恢复占位。');

const portable=parseHTML('<html><head><meta name="park-art-layout" content="./data/art-layout.json" data-live="false"></head><body><div class="asset-slot" data-art-slot="p3-browse">原占位</div></body></html>');
let fetchPath='',polls=0;
saved.document.pages[0].layouts.desktop.elements=[{...text,x:250}];
const portableContext=vm.createContext({document:portable.document,window:portable.window,innerWidth:1440,
  fetch:async path=>{fetchPath=path;return {ok:true,json:async()=>structuredClone(saved)};},
  setTimeout,clearTimeout,setInterval:()=>{polls++;},clearInterval});
vm.runInContext(renderer,portableContext);vm.runInContext(bridge,portableContext);
const stop=vm.runInContext('startArtBridge()',portableContext);
await new Promise(resolve=>setTimeout(resolve,0));
assert.equal(fetchPath,'./data/art-layout.json');assert.equal(polls,0);
assert.equal(portable.document.querySelector('.art-element').style.left,'250px');
portableContext.innerWidth=390;vm.runInContext('applyArt()',portableContext);
assert.equal(portable.document.querySelector('.art-element').style.left,'20px');
stop();
console.log('PASS 可携带布局：读取相对路径快照、停止编辑器轮询、双端布局继续生效。');
