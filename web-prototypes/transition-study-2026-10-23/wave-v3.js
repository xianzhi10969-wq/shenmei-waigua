// wave-v3：黑只由刀线变密/变粗/变长并合而成，无任何剪影边界。
// 每行沿 x 依次排刀（准泊松：刀长与刀距由单调覆盖曲线决定，只加 ±25% 抖动），行间用黄金比错位，避免成团。
function rng(seed){let s=seed>>>0||1;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296;}
function noise1(r){const N=64,v=[...Array(N+1)].map(r);return x=>{x=((x%N)+N)%N;const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return v[i]*(1-u)+v[i+1]*u;};}
function lerp(a,b,t){return a+(b-a)*t;}
function sstep(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}
function waveV3(svg,W,H,o={}){
  const INK=o.ink||'#1E1E1E',PAPER=o.paper||'#F6F3ED',r=rng(o.seed||7),n1=noise1(r),n2=noise1(r),n3=noise1(r);
  const k=Math.max(0.55,Math.min(1,W/1100)); // 窄屏整体放细
  const swell=(x,y)=>{const t=Math.min(1,y/H),A=lerp(14,4,t)*k;return A*(Math.sin(x/(180*k+60)+y/37)*.55+(n1(x/(95*k+30)+y/60)-.5)*1.3+Math.sin(x/61-y/23)*.18);};
  const out=[];
  const cut=(x0,cy,len,wmax,ph,col,amp)=>{ // 刀：起刀尖细快速鼓起，收刀拉出发丝挑尖并微挑
    const m=Math.max(8,Math.round(len/4)),T=[],B=[],flick=(r()<.5?-1:1)*lerp(.4,1.6,r());
    for(let i=0;i<=m;i++){const s=i/m,x=x0+s*len;
      let y=cy+swell(x,cy)+amp*((n2(x/40+ph)-.5)*.6)+flick*Math.pow(Math.max(0,(s-.8)/.2),2);
      const a=Math.pow(Math.min(1,s/.18),1.6), b=Math.pow(Math.min(1,(1-s)/.32),2.4);
      const w=wmax*a*b*(0.9+0.2*n3(x/50+ph))+0.04;
      T.push(x.toFixed(1)+' '+(y-w/2).toFixed(2));B.unshift(x.toFixed(1)+' '+(y+w/2).toFixed(2));}
    out.push(`<path d="M${T.join('L')}L${B.join('L')}Z" fill="${col}"/>`);};
  const end=H*0.84; let y=H*0.02,row=0,lastY=0;
  while(y<end){const t=y/end;
    const gap=lerp(12,1.3,Math.pow(t,0.75));
    const wmax=lerp(0.2,gap*2.2,Math.pow(t,2.2));          // 末段刀宽≈2倍行距 → 必然并合
    const cov=lerp(0.06,1.6,Math.pow(t,1.6));               // 单调覆盖曲线（>1 表示刀与刀重叠）
    const L=lerp(26,170,Math.pow(t,.9))*k;                  // 刀长随深度增长
    let x=-((row*0.618)%1)*L*1.5;                           // 黄金比错位
    while(x<W+20){const len=L*lerp(.75,1.25,r());cut(x,y,len,wmax*lerp(.9,1.1,r()),r()*60,INK,lerp(2,.6,t));
      x+=len*(cov>1?1/cov:1)+(cov<1?len*(1/cov-1)*lerp(.75,1.25,r()):0);}
    lastY=y;y+=gap*lerp(.9,1.1,r());row++;}
  // 实黑只从已完全并合的最后若干行之下开始（被刀覆盖，看不到边）
  const solid=lastY-H*0.03;
  out.unshift(`<rect x="-5" y="${solid.toFixed(1)}" width="${W+10}" height="${(H-solid+2).toFixed(1)}" fill="${INK}"/>`);
  // 少量纸色反刀（P2 水面语言），越往下越稀，最后 5% 纯黑
  let yy=lastY+H*0.012;
  while(yy<H*0.95){const p=1-sstep(lastY,H*0.95,yy);let x=-r()*150;
    while(x<W){const len=lerp(30,120,r())*k;if(r()<.22*p)cut(x,yy,len,lerp(.6,1.4,r())*k,r()*60,PAPER,.5);x+=len+lerp(40,220,r())*k;}
    yy+=lerp(3,8,r());}
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=out.join('');
}
