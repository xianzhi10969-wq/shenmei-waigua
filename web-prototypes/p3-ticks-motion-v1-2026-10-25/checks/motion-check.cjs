const assert=require('node:assert/strict');
const {advance}=require('../motion.js');
for(const hz of [30,60,120])for(const target of [-1,3,24]){
 let x=2,v=0,prev=x;const sign=Math.sign(target-x);
 for(let i=0;i<hz*2;i++){({x,v}=advance(x,v,target,1/hz));assert((x-prev)*sign>=-1e-12);assert((target-x)*sign>=-1e-12);prev=x;}
 assert(Math.abs(x-target)<1e-10);
}
const a=advance(2,0,3,.1),b=advance(a.x,a.v,3,.2),c=advance(2,0,3,.3);assert(Math.abs(b.x-c.x)<1e-12);
const reverse=advance(a.x,a.v,2,0);assert.equal(reverse.x,a.x);assert(Math.abs(reverse.v-a.v)<1e-12);
console.log('PASS: 30/60/120Hz monotonic convergence, frame partition invariance, continuous retarget state');
