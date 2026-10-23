import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {solveMotion} from '../motion.mjs';

const cases=[
 {width:1440,height:900,stripHeight:306,origin:{x:382,y:637,size:156},rose:{x:720,y:235,size:120},sill:{y:820,width:720}},
 {width:390,height:844,stripHeight:235,origin:{x:70,y:660,size:90},rose:{x:195,y:198,size:76},sill:{y:760,width:330}}
];
for(const c of cases){
 const first=solveMotion(0,c),last=solveMotion(1,c);
 assert.equal(first.starX,c.origin.x);assert.equal(first.starY,c.origin.y);
 assert.equal(last.starX,c.rose.x);assert.equal(last.starY,c.rose.y);
 assert.equal(last.rippleY,c.sill.y);assert.equal(last.rippleHeight,1.5);
 assert.equal(last.ready,true);assert.ok(last.veilY< -c.stripHeight);
 const forward=Array.from({length:1001},(_,i)=>solveMotion(i/1000,c));
 const reverse=Array.from({length:1001},(_,i)=>solveMotion((1000-i)/1000,c)).reverse();
 assert.deepEqual(forward,reverse);
 for(let i=1;i<forward.length;i++){
  assert.ok(forward[i].starY<=forward[i-1].starY+1e-9,'星不应在中轴上先升后降');
  assert.ok(forward[i].veilY<=forward[i-1].veilY+1e-9,'夜色边界不应倒跳');
  for(const k of ['starX','starY','starSize','veilY','rippleY','rippleWidth','rippleHeight'])assert.ok(Number.isFinite(forward[i][k]));
 }
 assert.deepEqual(solveMotion(-1,c),first);assert.deepEqual(solveMotion(2,c),last);
}
const names=['assets/frame-web.svg','assets/frame-mobile.svg','assets/frame-geometry.json','assets/topics.json','assets/water-ink-paper.png'];
const locked=[];
for(const name of names){
 const current=await readFile(new URL('../'+name,import.meta.url));
 const prior=await readFile(new URL('../../p2-p3-junction-v1-2026-10-23/'+name,import.meta.url));
 assert.deepEqual(current,prior,'锁定资产改变 '+name);
 locked.push({path:name,sha256:createHash('sha256').update(current).digest('hex')});
}
const result={motion:'pass',samplesPerViewport:1001,viewports:cases.map(c=>[c.width,c.height]),reverse:'same positions and sizes for every sampled progress',lockedAssets:locked,browser:'see browser-checks.json; no video claimed'};
await writeFile(new URL('../checks/validation.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log('PASS: 两种视口、逐点逆序、端点、单调星轨、五项资产字节锁定');
