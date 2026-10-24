export const clamp=t=>Math.max(0,Math.min(1,t));
export const smoother=t=>{t=clamp(t);return t*t*t*(t*(6*t-15)+10)};
export const mix=(a,b,t)=>a+(b-a)*t;
const interval=(q,a,b)=>smoother((q-a)/(b-a));
export function solveMotion(q,{height,width,origin,rose}){
 q=clamp(q);const travel=interval(q,.04,.55),opening=interval(q,.12,.88),handoff=interval(q,.38,.56);
 const x=mix(origin.x,rose.x,travel),y=mix(origin.y,rose.y,travel);
 const radius=Math.hypot(Math.max(x,width-x),Math.max(y,height-y))+8;
 return {q,starX:x,starY:y,starSize:mix(origin.size,rose.size,travel),starOpacity:1-handoff,ink:interval(q,.2,.4),
  aperture:mix(0,radius,opening),p2Scale:1+.16*interval(q,0,.74),p3Scale:mix(1.18,1,travel),cameraX:x-rose.x,cameraY:y-rose.y,
  nightOpacity:1-interval(q,.82,.9),ready:q>=.9};
}
