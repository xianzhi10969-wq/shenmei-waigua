// Logic tests only: this intentionally does not claim browser or gesture QA.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {snapCoordinate,integerImageSize} from './pixel.mjs';

const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'').replace(/\ninit\(\);\s*$/,'');
const nodes=new Map();
const context=vm.createContext({
  structuredClone, crypto:{randomUUID}, console, snapCoordinate, integerImageSize,
  setTimeout:()=>1,clearTimeout:()=>{},
  window:{addEventListener:()=>{}},
  document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,{});return nodes.get(id);}},
});
vm.runInContext(source,context);
vm.runInContext(`
  render=()=>{};
  doc={schema:1,name:'测试',assets:[],pages:[{id:'p',name:'场景',layouts:{
    desktop:{width:1200,height:800,background:'#ffffff',elements:[]},
    mobile:{width:390,height:844,background:'#ffffff',elements:[]}
  }}]};pageId='p';record();
`,context);
const evaluate=code=>vm.runInContext(code,context);
evaluate('addShape();');
assert.equal(evaluate('layout().elements.length'),1);
evaluate("mode='mobile';selected=null;addText();");
assert.equal(evaluate('layout().elements[0].type'),'text');
assert.equal(evaluate("page().layouts.desktop.elements[0].type"),'shape');
evaluate('undo(-1)');
assert.equal(evaluate('layout().elements.length'),0);
assert.equal(evaluate('page().layouts.desktop.elements.length'),1);
evaluate('undo(1)');
assert.equal(evaluate('layout().elements.length'),1);
evaluate("mode='desktop';doc.assets.push({id:'art',name:'原图',width:200,height:100,url:'/assets/'+'a'.repeat(32)+'.png'});addImage(doc.assets[0]);");
assert.equal(evaluate('element().width / element().height'),2);
evaluate('deleteElement();');
assert.equal(evaluate('doc.assets.length'),1);
assert.equal(evaluate('layout().elements.length'),1);
evaluate('selected=layout().elements[0].id;layout().elements[0].locked=true;deleteElement();');
assert.equal(evaluate('layout().elements.length'),1);
evaluate('layout().elements[0].locked=false;duplicateElement();');
assert.equal(evaluate('layout().elements.length'),2);
assert.equal(evaluate('new Set(layout().elements.map(e=>e.id)).size'),2);
assert.throws(()=>evaluate('validateImport({schema:1,pages:[{name:"x",layouts:{}}],assets:[]})'));
evaluate('dirty=false;revision=4;');
// A poll begun before a newer local save must not roll back to its older response.
context.fetch=async()=>({ok:true,json:async()=>({revision:3,document:{bad:true}})});
await evaluate('poll()');
assert.equal(evaluate('doc.schema'),1);
assert.equal(evaluate('revision'),4);
console.log('前端逻辑检查通过：两端隔离、撤销/重做、原图保留、锁定删除保护、复制 ID、导入校验、旧轮询响应保护。');
assert.equal(snapCoordinate(17,4),16);
assert.equal(snapCoordinate(-5,4),-4);
assert.deepEqual(integerImageSize({width:32,height:40},75,90),{width:64,height:80,factor:2});
assert.throws(()=>integerImageSize({width:50000,height:40000},100,80));
console.log('像素模式检查通过：网格吸附、整数倍比例、超大原图保护。');
