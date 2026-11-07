export const clamp = x => Math.max(0, Math.min(1, x));
export const ease = x => { x = clamp(x); return x*x*x*(x*(x*6-15)+10); };
const phase = (q,a,b) => ease((q-a)/(b-a));
export function paperMotion(q,height,holdNight=false) {
  q=clamp(q);
  const arrival=phase(q,.03,.79);
  const covers=holdNight?0:phase(q,.82,1);
  return {q,y:(height+12)*(1-arrival),covers,ui:phase(q,.89,1),ready:!holdNight&&q>=.98};
}
