export const SCHEMA = 1;
export const STORAGE_KEY = 'aesthetic-park-v1-notebook';
export const DRAFT_KEY = 'aesthetic-park-v1-lab-draft';
export const OPERATIONS = { encounter: { label: '相遇', symbol: '＋' }, subtraction: { label: '抽离', symbol: '－' }, replacement: { label: '替换', symbol: '→' } };

export function isOpen(term) { return Array.isArray(term.state) ? term.state.includes('已上线') : term.state === '已上线'; }
export function queryTerms(terms, query = '', onlyOpen = false) {
  const needle = query.trim().toLocaleLowerCase();
  return terms.filter(t => (!onlyOpen || isOpen(t)) && (!needle || [t.name,t.english].some(v => String(v||'').toLocaleLowerCase().includes(needle))));
}
export function pick(items, previousId, random = Math.random) {
  const pool = items.length > 1 ? items.filter(i => i.id !== previousId) : items;
  return pool.length ? pool[Math.min(pool.length-1,Math.floor(Math.max(0,random())*pool.length))] : null;
}
export function randomTerm(terms, previousId, random) { return pick(terms.filter(isOpen), previousId, random); }
export function routeFor(name, id = '', query = {}) {
  const search = new URLSearchParams(Object.entries(query).filter(([,v])=>v!==undefined&&v!==null&&v!==''));
  return '#/'+name+(id?'/'+encodeURIComponent(id):'')+(search.size?'?'+search.toString():'');
}
export function parseRoute(hash) {
  const [path, search=''] = hash.replace(/^#\/?/,'').split('?');
  const parts=path.split('/');
  let id='';try{id=decodeURIComponent(parts[1]||'');}catch{return {name:'not-found',id:'',query:{}};}
  return {name:parts[0]||'entrance',id,query:Object.fromEntries(new URLSearchParams(search))};
}
export function validateExperience(data, terms) {
  const errors=[];const knownTerms=new Set(terms.map(t=>t.id));
  if(data.schema!==1||!Array.isArray(data.feelings)||!data.termFeelingIds||typeof data.termFeelingIds!=='object')return ['数据结构应包含 schema:1、feelings 和 termFeelingIds'];
  const ids=new Set();
  for(const f of data.feelings){if(!f||typeof f.id!=='string'||!f.id||ids.has(f.id)||typeof f.sentence!=='string'||!f.sentence.trim())errors.push('感觉句需要唯一 ID 和非空 sentence');else ids.add(f.id);}
  for(const [termId,feelings]of Object.entries(data.termFeelingIds)){
    if(!knownTerms.has(termId))errors.push('未知词条 ID：'+termId);
    if(!Array.isArray(feelings))errors.push('关联必须是感觉 ID 数组：'+termId);
    else for(const id of feelings)if(!ids.has(id))errors.push('未知感觉 ID：'+id);
  }
  for(const [termId,sentence]of Object.entries(data.termStatements||{}))if(!knownTerms.has(termId)||typeof sentence!=='string')errors.push('词条第一人称句无效：'+termId);
  return errors;
}
export function lineFor(feelingId, terms, experience) {
  const feeling=experience.feelings.find(f=>f.id===feelingId);
  if(!feeling)return null;
  return {feeling,stations:terms.filter(t=>(experience.termFeelingIds[t.id]||[]).includes(feelingId)).map(term=>({
    term,transfers:(experience.termFeelingIds[term.id]||[]).filter(id=>id!==feelingId).map(id=>experience.feelings.find(f=>f.id===id)).filter(Boolean)
  }))};
}
export function firstPerson(termId, feelingId, experience) {
  if(feelingId&&(experience.termFeelingIds[termId]||[]).includes(feelingId))return experience.feelings.find(f=>f.id===feelingId)?.sentence||'';
  return experience.termStatements?.[termId]||'';
}
export function makeSections(term, cases) {
  const blocks=[];
  if(term.core?.trim())blocks.push({id:'opening',type:'text',title:'走进这种感觉',text:term.core});
  for(const caseId of term.caseIds||[]){const item=cases.find(c=>c.id===caseId);if(item)blocks.push({id:'case-'+item.id,type:'artwork',title:item.name,case:item});}
  return blocks;
}
export function promptText(operation, a, b) {
  a=String(a||'').trim();b=String(b||'').trim();if(!a||!b)return '';
  if(operation==='subtraction')return `从「${a}」中拿走「${b}」，会留下什么？`;
  if(operation==='replacement')return `如果「${b}」承担「${a}」的角色，会发生什么？`;
  return `「${a}」与「${b}」相遇，会发生什么？`;
}
export function filterImagery(items,operation,theme='',query='') {
  const label=OPERATIONS[operation]?.label,needle=query.trim().toLocaleLowerCase();
  return items.filter(i=>i.operation===label&&(!theme||i.theme===theme)&&(!needle||[i.title,i.imageA,i.imageB,i.prompt].some(v=>String(v||'').toLocaleLowerCase().includes(needle))));
}
export function emptyNotebook(){return {schema:SCHEMA,visits:{},ideas:{},welcomeSeen:false};}
export function readNotebook(storage) {
  const raw=storage.getItem(STORAGE_KEY);if(!raw)return emptyNotebook();
  let data;try{data=JSON.parse(raw);}catch{throw new Error('票根本数据无法读取，已停止覆盖。请先导出原始备份。');}
  if(data.schema!==SCHEMA||!data.visits||!data.ideas||Array.isArray(data.visits)||Array.isArray(data.ideas))throw new Error('票根本格式不符，已保留原数据。');
  return data;
}
export function updateNotebook(storage, fn) {
  const data=readNotebook(storage);fn(data);storage.setItem(STORAGE_KEY,JSON.stringify(data));return data;
}
export function recordVisit(storage, termId, statement='', claimed=false, now=new Date().toISOString()) {
  return updateNotebook(storage,data=>{
    const old=data.visits[termId];
    data.visits[termId]={termId,firstVisit:old?.firstVisit||now,lastVisit:now,
      statement:claimed&&statement?statement:old?.statement||statement||'',claimed:!!(old?.claimed||(claimed&&statement))};
  });
}
export function saveIdea(storage, idea, now=new Date().toISOString()) {
  if(!idea.id||!idea.prompt?.trim())throw new Error('命题还没有准备好');
  return updateNotebook(storage,data=>{data.ideas[idea.id]={...idea,updatedAt:now};});
}
export function mergeNotebook(current,incoming,termIds) {
  if(incoming?.schema!==SCHEMA||!incoming.visits||!incoming.ideas||typeof incoming.visits!=='object'||typeof incoming.ideas!=='object'||Array.isArray(incoming.visits)||Array.isArray(incoming.ideas))throw new Error('不是有效票根本备份');
  const result=structuredClone(current);let ignored=0;
  for(const [id,ticket] of Object.entries(incoming.visits)){
    if(!termIds.has(id)||ticket.termId!==id||typeof ticket.statement!=='string'||typeof ticket.firstVisit!=='string'||typeof ticket.lastVisit!=='string'){ignored++;continue;}
    const old=result.visits[id];result.visits[id]={termId:id,statement:ticket.statement||old?.statement||'',claimed:!!(old?.claimed||(ticket.claimed&&ticket.statement)),firstVisit:old?.firstVisit||ticket.firstVisit,lastVisit:[old?.lastVisit||'',ticket.lastVisit].sort().at(-1)};
  }
  for(const [id,idea] of Object.entries(incoming.ideas)){
    if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id)||['__proto__','constructor','prototype'].includes(id)||idea?.id!==id||typeof idea.prompt!=='string'||idea.prompt.length>10000||typeof idea.response!=='string'||idea.response.length>50000){ignored++;continue;}
    if(!result.ideas[id]||String(idea.updatedAt)>String(result.ideas[id].updatedAt))result.ideas[id]={id,prompt:idea.prompt,response:idea.response,operation:String(idea.operation||''),imageA:String(idea.imageA||''),imageB:String(idea.imageB||''),updatedAt:String(idea.updatedAt||'')};
  }
  return {notebook:result,ignored};
}
