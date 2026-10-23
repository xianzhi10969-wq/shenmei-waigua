// 镜头只由滚动位置计算，没有方向状态、计时器、随机量或不可逆累积。
export const clamp=t=>Math.max(0,Math.min(1,t));
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
export const mix=(a,b,t)=>a+(b-a)*t;
const interval=(q,a,b)=>smooth((q-a)/(b-a));
export function solveMotion(q,{height,stripHeight,origin,rose,sill,width}){
 q=clamp(q);
 const reveal=interval(q,.025,.66),arrive=interval(q,.04,.60);
 const trail=interval(q,.38,1),flatten=interval(q,.42,1);
 const trailStart=mix(height+2,-stripHeight-2,interval(.38,.025,.66))+stripHeight*.705;
 return {
  q,veilY:mix(height+2,-stripHeight-2,reveal),p2Shift:height*.38*interval(q,.025,.42),
  starX:mix(origin.x,rose.x,interval(q,0,.27)),starY:mix(origin.y,rose.y,arrive),starSize:mix(origin.size,rose.size,arrive),
  rippleY:mix(trailStart,sill.y,trail),rippleWidth:mix(width,sill.width,interval(q,.60,1)),rippleHeight:mix(stripHeight*.12,1.5,flatten),
  rippleVisible:q>=.38,ready:q>=.84
 };
}
