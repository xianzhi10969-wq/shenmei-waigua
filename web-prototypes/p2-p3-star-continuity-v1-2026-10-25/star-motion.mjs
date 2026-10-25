import {ease,clamp} from './paper-motion.mjs';
export function starMotion(q,start,end,paperY){
 const flight=ease((q-.06)/.70),seat=ease((q-.69)/.10);
 const x=start.x+(end.x-start.x)*flight,y=start.y+(end.y-start.y)*flight;
 const size=start.size*(1-.94*seat);
 return {x,y,size,visible:q<.79,cut:clamp((paperY-(y-size/2))/size)*100};
}
