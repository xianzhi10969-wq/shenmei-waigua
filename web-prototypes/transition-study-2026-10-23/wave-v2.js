// wave-v2：铜版雕刻式水波过渡。每一刀是"填充的刀痕轮廓"（两端尖、中段鼓），不是等宽 stroke。
// 自上而下：发丝细、稀疏、短刀 → 变密、变粗、变长 → 刀痕彼此并合成实黑 → 黑中留少量纸色反刀（P2 水面语言）→ 与 P2 首行同色无缝。
function rng(seed){let s=seed>>>0||1;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296;}
function noise1(r){const N=64,v=[...Array(N+1)].map(r);return x=>{x=((x%N)+N)%N;const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return v[i]*(1-u)+v[i+1]*u;};}
function waveV2(svg,W,H,o={}){
  const INK=o.ink||'#1E1E1E',PAPER=o.paper||'#F6F3ED',r=rng(o.seed||7);
  const n1=noise1(r),n2=noise1(r),n3=noise1(r);
  const solidAt=H*0.80;            // 此后为实黑
  let out=[];
  const swell=(x,y)=>{const t=Math.min(1,y/H);const A=lerp(16,5,t)*Math.max(0.45,Math.min(1,W/1100));return A*(Math.sin(x/180+y/37)*.55+(n1(x/95+y/60)-.5)*1.3+Math.sin(x/61-y/23)*.18);};
  const cut=(cx,cy,len,wmax,ph,amp,lam,col)=>{ // 一刀：中心线 + 鼓胀宽度 → 闭合多边形
    const k=Math.max(6,Math.round(len/5)),top=[],bot=[];
    const lean=(r()-.5)*0.6; // 刀入/刀出的轻微不对称
    for(let i=0;i<=k;i++){const s=i/k,x=cx-len/2+s*len;
      const y=cy+swell(x,cy)+amp*((n1(x/lam*.7+ph*9)-.5)*.8+(n2(x/23+ph*5)-.5)*.3);
      const sw=Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,s+lean*s*(1-s)))),0.8)*wmax*(0.75+0.5*n3(x/40+ph*3));
      top.push([x,y-sw/2]);bot.push([x,y+sw/2]);}
    const pts=top.concat(bot.reverse()).map(p=>p[0].toFixed(1)+' '+p[1].toFixed(2));
    out.push(`<path d="M${pts.join('L')}Z" fill="${col}"/>`);
  };
  // 第一段：纸上墨刀
  let y=H*0.03;
  while(y<solidAt+H*0.04){const t=y/solidAt, e=Math.pow(t,1.7);
    const gap=lerp(11,1.15,Math.pow(t,0.8))*(0.8+r()*0.45);
    const wmax=lerp(0.22,gap*1.25,Math.pow(t,1.9));        // 末端刀宽 > 行距 → 并合
    const cover=lerp(0.12,1.25,e);                           // 一行被刀覆盖的比例
    const lam=lerp(70,140,r())*(1-0.3*t), amp=lerp(2.6,0.9,t)*(0.7+r()*0.6);
    let x=-r()*120;
    while(x<W+60){const len=lerp(30,190,r())*(0.5+cover*0.7);
      if(r()<Math.min(1,cover)) cut(x+len/2,y+(r()-.5)*gap*0.25,len,wmax,r()*6.28,amp,lam,INK);
      x+=len*(cover>1?0.82:1)+lerp(70,6,e)*(0.3+r());}            // 末段刀与刀重叠
    if(r()<0.06*(1-t)) {const L=lerp(220,520,r());cut(r()*W,y+gap*0.5,L,wmax*0.6,r()*6,amp*1.6,lam*1.4,INK);} // 偶尔一条长弧刀穿插
    y+=gap;}
  {let d='M0 '+(H+1);for(let x=0;x<=W+10;x+=6){d+=' L'+x+' '+(solidAt+H*0.02+swell(x,solidAt)+(n3(x/30)-.5)*H*0.05+(n2(x/9)-.5)*H*0.02).toFixed(1);}d+=' L'+(W+10)+' '+(H+1)+'Z';out.unshift(`<path d="${d}" fill="${INK}"/>`);}
  // 第二段：黑上纸色反刀，越往下越稀，最后 6% 纯黑以接 P2 首行
  y=solidAt-H*0.01;
  while(y<H*0.94){const t=(y-solidAt)/(H*0.14);const p=Math.max(0,1-t);
    let x=-r()*200;
    while(x<W){const len=lerp(20,110,r());
      if(r()<0.4*p*p) cut(x+len/2,y,len*0.6,lerp(0.25,1.2,r())*p+0.2,r()*6.28,0.8,90,PAPER);
      x+=len+lerp(20,160,r());}
    y+=lerp(1.6,5,Math.min(1,Math.max(0,t)));}
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=out.join('');
}
function lerp(a,b,t){return a+(b-a)*t;}
