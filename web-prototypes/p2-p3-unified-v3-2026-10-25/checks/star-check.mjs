import assert from 'node:assert/strict';
import {starMotion} from '../star-motion.mjs';
import {paperMotion} from '../paper-motion.mjs';
for(const {start,end,h} of [{start:{x:70,y:643,size:90},end:{x:195,y:205},h:844},{start:{x:382,y:637,size:156},end:{x:726,y:404},h:900}]){
 const values=Array.from({length:1001},(_,i)=>starMotion(i/1000,start,end,paperMotion(i/1000,h).y));
 assert.equal(values[0].x,start.x);assert.equal(values[0].y,start.y);
 assert.equal(values[790].x,end.x);assert.equal(values[790].y,end.y);
 for(let i=1000;i>=0;i--){assert.deepEqual(starMotion(i/1000,start,end,paperMotion(i/1000,h).y),values[i]);assert(values[i].cut>=0&&values[i].cut<=100);}
 for(let i=1;i<=760;i++){assert(values[i].x>=values[i-1].x);assert(values[i].y<=values[i-1].y);}
}
console.log('PASS: 2002 samples, start/end anchoring, reversible positions, bounded hard color split');
