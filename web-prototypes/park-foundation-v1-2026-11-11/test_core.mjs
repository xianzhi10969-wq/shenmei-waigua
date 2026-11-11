import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as core from './core.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL('./data/'+name+'.json',import.meta.url),'utf8'));
const catalog=read('catalog'),features=read('features'),experience=read('experience');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};};

test('真实数据完整，旧形容词入口不混入新感觉路线',()=>{
  assert.equal(catalog.chapters.length,24);assert.equal(catalog.terms.length,101);assert.equal(features.imagery.length,70);
  assert.equal(features.feelings,undefined);assert.equal(features.feelingRoutes,undefined);
  assert.deepEqual(core.validateExperience(experience,catalog.terms),[]);
});
test('词条搜索支持中文英文且开放筛选严格生效',()=>{
  assert.ok(core.queryTerms(catalog.terms,'dreamcore').some(t=>t.name==='梦核'));
  assert.ok(core.queryTerms(catalog.terms,'忧郁').every(t=>t.name.includes('忧郁')));
  assert.equal(core.queryTerms(catalog.terms,'',true).length,55);
});
test('扭蛋只抽已开放词条，池子足够时不连续重复',()=>{
  let previous;for(let i=0;i<500;i++){const next=core.randomTerm(catalog.terms,previous);assert.ok(core.isOpen(next));assert.notEqual(next.id,previous);previous=next.id;}
  assert.equal(core.randomTerm([],null),null);
});
test('深层入口、中文与来路嵌套可以完整往返',()=>{
  const from=core.routeFor('chapter','章节 01');const hash=core.routeFor('ride','风格 / a',{from,feeling:'我 不想'});
  assert.deepEqual(core.parseRoute(hash),{name:'ride',id:'风格 / a',query:{from,feeling:'我 不想'}});
  assert.equal(core.parseRoute('#/ride/%ZZ').name,'not-found');
});
test('线路按显式关联生成，换乘只指向已存在感觉',()=>{
  const terms=[{id:'a'},{id:'b'},{id:'c'}];
  const data={schema:1,feelings:[{id:'f1',sentence:'测试句一'},{id:'f2',sentence:'测试句二'}],termFeelingIds:{a:['f1'],b:['f1','f2'],c:['f2']},termStatements:{}};
  assert.deepEqual(core.validateExperience(data,terms),[]);
  const line=core.lineFor('f1',terms,data);assert.deepEqual(line.stations.map(s=>s.term.id),['a','b']);assert.equal(line.stations[1].transfers[0].id,'f2');
  assert.equal(core.firstPerson('b','f1',data),'测试句一');assert.equal(core.firstPerson('c','f1',data),'');
  data.termFeelingIds.a.push('unknown');assert.ok(core.validateExperience(data,terms).length);
});
test('布景使用核心和真实案例，不回退旧钩子、不编造对照',()=>{
  const t={id:'a',core:'核心',hook:'错误源',body:'旧正文',caseIds:['case-a','missing']};
  const sections=core.makeSections(t,[{id:'case-a',name:'作品'}]);assert.equal(sections.length,2);assert.equal(sections[0].text,'核心');assert.equal(sections[1].case.id,'case-a');
  assert.deepEqual(core.makeSections({...t,core:'',caseIds:[]},[]),[]);
});
test('意象操作、主题和搜索只过滤真实题库',()=>{
  for(const op of Object.keys(core.OPERATIONS))assert.ok(core.filterImagery(features.imagery,op).length);
  const result=core.filterImagery(features.imagery,'encounter','时间','时钟');assert.ok(result.length);assert.ok(result.every(i=>i.operation==='相遇'&&i.theme==='时间'));
  assert.equal(core.filterImagery(features.imagery,'encounter','','不存在的长测试词').length,0);
});
test('自填只构造开放命题，不生成答案或偏好评分',()=>{
  assert.equal(core.promptText('encounter','时钟','发芽'),'「时钟」与「发芽」相遇，会发生什么？');
  assert.equal(core.promptText('subtraction','房子','门'),'从「房子」中拿走「门」，会留下什么？');
  assert.equal(core.promptText('replacement','秒针','藤蔓'),'如果「藤蔓」承担「秒针」的角色，会发生什么？');
  assert.equal(core.promptText('encounter','','发芽'),'');
});
test('重复出站仅保留一张票，刷新后恢复',()=>{
  const storage=memory();core.recordVisit(storage,'a','','', '2026-01-01');core.recordVisit(storage,'a','','', '2026-01-02');
  const data=core.readNotebook(storage);assert.equal(Object.keys(data.visits).length,1);assert.equal(data.visits.a.firstVisit,'2026-01-01');assert.equal(data.visits.a.lastVisit,'2026-01-02');assert.equal(data.visits.a.claimed,false);
});
test('没有感觉句不伪造认领，普通回访不覆盖已认领句',()=>{
  const storage=memory();core.recordVisit(storage,'a','',true);assert.equal(core.readNotebook(storage).visits.a.claimed,false);
  core.recordVisit(storage,'a','我选择了这句',true);core.recordVisit(storage,'a','另一句',false);
  assert.equal(core.readNotebook(storage).visits.a.statement,'我选择了这句');
});
test('不同操作先读取最新票根本，不覆盖其他已保存内容',()=>{
  const storage=memory();core.recordVisit(storage,'a');core.saveIdea(storage,{id:'idea-1',prompt:'开放命题',response:'我的回答'});core.recordVisit(storage,'b');
  assert.equal(Object.keys(core.readNotebook(storage).visits).length,2);assert.equal(core.readNotebook(storage).ideas['idea-1'].response,'我的回答');
});
test('导入备份合并、不删除现有记录，非法条目被拒绝',()=>{
  const storage=memory();core.recordVisit(storage,'a');const incoming={schema:1,visits:{b:{termId:'b',statement:'',firstVisit:'2026-01-01',lastVisit:'2026-01-01'},bad:{termId:'bad'}},ideas:{i:{id:'i',prompt:'问题',response:'回答',updatedAt:'2026-01-01'}}};
  const result=core.mergeNotebook(core.readNotebook(storage),incoming,new Set(['a','b']));assert.deepEqual(Object.keys(result.notebook.visits),['a','b']);assert.equal(result.ignored,1);assert.equal(result.notebook.ideas.i.response,'回答');
  assert.throws(()=>core.mergeNotebook(result.notebook,{schema:99},new Set()));
});
test('损坏存档不被静默覆盖，空间不足向上传递失败',()=>{
  const storage=memory();storage.setItem(core.STORAGE_KEY,'broken');assert.throws(()=>core.recordVisit(storage,'a'));assert.equal(storage.getItem(core.STORAGE_KEY),'broken');
  const full={getItem:()=>null,setItem:()=>{throw new Error('quota');}};assert.throws(()=>core.recordVisit(full,'a'),/quota/);
});
test('全部素材和引用落在独立目录且文件存在',()=>{
  let count=0;function walk(value){if(Array.isArray(value))return value.forEach(walk);if(value&&typeof value==='object')return Object.values(value).forEach(walk);if(typeof value==='string'&&/^\.?\/media\//.test(value)){assert.ok(fs.existsSync(new URL(value.startsWith('/')?'.'+value:value,import.meta.url)),value);count++;}}walk(catalog);assert.ok(count>400);
  const ids=new Set(catalog.terms.map(t=>t.id));for(const c of catalog.chapters)for(const id of c.termIds)assert.ok(ids.has(id));
});
console.log(`${passed} 组检查通过。测试用感觉句只存在本测试文件，不进入运行数据。`);
