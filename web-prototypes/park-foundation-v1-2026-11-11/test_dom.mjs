// DOM simulation, not browser rendering. Requires LinkeDOM's standalone worker module.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Blob} from 'node:buffer';
import * as core from './core.mjs';
const {parseHTML}=await import('file:///tmp/park-dom-check/linkedom-worker.mjs');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('./app.mjs',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'').replace(/\ninit\(\);\s*$/,'');
const {window,document}=parseHTML(html);
const data=name=>JSON.parse(fs.readFileSync(new URL('./data/'+name+'.json',import.meta.url),'utf8'));
const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
window.HTMLElement.prototype.scrollIntoView=function(){};
window.HTMLElement.prototype.getBoundingClientRect=function(){return {top:0,bottom:100,left:0,right:300,height:100,width:300};};
window.HTMLElement.prototype.focus=function(){};
window.HTMLElement.prototype.showModal=function(){this.open=true;};
window.HTMLElement.prototype.close=function(){this.open=false;this.onclose?.();};
const timers=new Map();let timerId=0;const observers=[];
class Observer{constructor(callback){this.callback=callback;this.nodes=[];observers.push(this);}observe(n){this.nodes.push(n);}unobserve(){}disconnect(){this.nodes=[];}}
const location={hash:'#/entrance',href:'http://127.0.0.1:8871/'};
const context=vm.createContext({...core,applyArt:()=>{},startArtBridge:()=>{},document,window,location,console,structuredClone,URL,URLSearchParams,Blob,crypto:{randomUUID},
  localStorage:storage(),sessionStorage:storage(),matchMedia:()=>({matches:true}),innerHeight:844,scrollY:0,
  setTimeout:(callback,ms)=>{const id=++timerId;timers.set(id,{callback,ms});return id;},clearTimeout:id=>timers.delete(id),
  requestAnimationFrame:callback=>{callback();return 1;},IntersectionObserver:Observer,
  navigator:{clipboard:{writeText:async value=>{context.copied=value;}}},
  fixtures:{catalog:data('catalog'),features:data('features'),experience:data('experience'),provenance:data('provenance')}
});
window.scrollTo=({top})=>{context.scrollY=top;};
vm.runInContext(source,context);
vm.runInContext('({catalog,features,experience,provenance}=fixtures);readSaved();',context);
const run=code=>vm.runInContext(code,context);
const go=hash=>{location.hash=hash;run('renderRoute()');};
let checks=0;function check(name,fn){fn();checks++;console.log('PASS DOM '+name);}
check('首页入口直接前往 P3，没有售票口',()=>{go('#/entrance');assert.ok(document.querySelector('a[href="#/avenue"]'));assert.ok(!document.querySelector('a[href*="ticket-booth"]'));});
check('P3 首次发放后不重播，三个入口与票根本可达',()=>{go('#/avenue');assert.equal(run('notebook.welcomeSeen'),true);for(const path of ['browse','feelings','arcade','notebook'])assert.ok(document.querySelector('a[href="#/'+path+'"]'));go('#/avenue');assert.equal(document.getElementById('welcome'),null);});
check('101 灯牌、24 专题、输入搜索与开放筛选',()=>{go('#/browse');assert.equal(document.querySelectorAll('.lamp').length,101);assert.equal(document.querySelectorAll('.chapter-token').length,24);const search=document.getElementById('term-search');search.value='Dreamcore';search.oninput({target:search});assert.equal(document.querySelectorAll('.lamp').length,1);search.value='';search.oninput({target:search});const open=document.getElementById('only-open');open.checked=true;open.onchange({target:open});assert.equal(document.querySelectorAll('.lamp').length,55);});
check('点击扭蛋后产生真实已开放词条入口',()=>{document.getElementById('draw-gacha').click();assert.equal(document.getElementById('draw-gacha').disabled,true);for(const [id,t]of [...timers])if(t.ms===0){timers.delete(id);t.callback();}assert.ok(document.querySelector('#gacha-result a[href^="#/ride/"]'));assert.equal(document.getElementById('draw-gacha').disabled,false);});
check('24 个专题全部渲染真实内容和下属灯牌',()=>{for(const c of context.fixtures.catalog.chapters){go(core.routeFor('chapter',c.id));assert.ok(document.querySelector('h1').textContent.includes(c.name));assert.equal(document.querySelectorAll('.lamp').length,c.termIds.length);}});
check('感觉入口为空，不拿旧形容词顶替',()=>{go('#/feelings');assert.ok(document.getElementById('app').textContent.includes('第一批感觉线路正在整理'));assert.equal(document.querySelectorAll('.feeling-sign').length,0);});
check('街机两入口与真实问题导读、关联词条可达',()=>{go('#/arcade');assert.equal(document.querySelectorAll('.arcade-machine').length,2);go('#/curiosity');assert.ok(document.querySelector('.question-card details'));assert.ok(document.querySelectorAll('.lamp').length);const first=run('questionId');document.getElementById('next-question').click();assert.notEqual(run('questionId'),first);});
check('实验室空白屏幕、真实抽题、联想保存与复制',()=>{go('#/lab');assert.equal(document.getElementById('lab-response').value,'');assert.equal(document.getElementById('save-idea').disabled,true);document.getElementById('draw-idea').click();assert.ok(run('lab.prompt'));const response=document.getElementById('lab-response');response.value='我留下的测试联想';response.oninput({target:response});document.getElementById('save-idea').click();assert.equal(Object.keys(run('notebook.ideas')).length,1);document.getElementById('copy-idea').click();assert.ok(context.copied.includes('我留下的测试联想'));});
check('实验室离开返回草稿保留，等号右侧始终可编辑',()=>{go('#/arcade');go('#/lab');assert.equal(document.getElementById('lab-response').value,'我留下的测试联想');assert.equal(document.querySelectorAll('.answer-screen').length,1);});
check('所有开放词条共用模板，关闭词条不伪装开放',()=>{for(const t of context.fixtures.catalog.terms){go(core.routeFor('ride',t.id));if(core.isOpen(t)){assert.ok(document.querySelector('.ride-progress'));assert.ok(document.getElementById('ride-exit'));}else assert.ok(document.getElementById('app').textContent.includes('即将开放'));}});
check('出站收票去重，认领未被伪造',()=>{const t=context.fixtures.catalog.terms.find(core.isOpen);go(core.routeFor('ride',t.id));const observer=observers.findLast(o=>o.nodes.some(n=>n.id==='ride-ticket'));observer.callback([{isIntersecting:true,target:document.getElementById('ride-ticket')}]);observer.callback([{isIntersecting:true,target:document.getElementById('ride-ticket')}]);assert.equal(Object.keys(run('notebook.visits')).length,1);assert.equal(run('Object.values(notebook.visits)[0].claimed'),false);});
check('票根回访、命题和全部资源均可渲染',()=>{go('#/notebook');assert.equal(document.querySelectorAll('.ticket').length,1);assert.equal(document.querySelectorAll('.resource-list a').length,60);document.querySelector('[data-tab="ideas"]').click();assert.ok(document.querySelector('.ticket.idea').textContent.includes('我留下的测试联想'));});
check('缺失页面有返回入口，外链不接受脚本',()=>{go('#/unknown');assert.ok(document.querySelector('a[href="#/avenue"]'));assert.equal(run("safeURL('javascript:alert(1)')"),'');assert.equal(run("safeURL('')"),'');});
console.log(`${checks} 组 DOM 操作检查通过。无真实浏览器排版、触控、下载或剪贴板权限验收。`);
