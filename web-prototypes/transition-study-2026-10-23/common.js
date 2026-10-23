// 只用 #F6F3ED / #1E1E1E，纯矢量线，无渐变无颗粒无阴影
const INK='#1E1E1E',PAPER='#F6F3ED';
function band(svg,W,H,kind){
  let s='';
  if(kind==='hatch'){ // 刻线密度渐进：线宽随深度从0.3px加粗到完全并合
    const n=Math.round(H/6);
    for(let i=0;i<n;i++){const t=i/(n-1),y=i*6+3,w=0.3+Math.pow(t,1.6)*5.9;
      // 线端微波动，像铜版雕刀
      let d='M0 '+y; for(let x=0;x<=W;x+=40) d+=' L'+x+' '+(y+Math.sin(x*0.013+i)*t*0.8).toFixed(2);
      s+=`<path d="${d}" stroke="${INK}" stroke-width="${w.toFixed(2)}" fill="none"/>`;}
  } else if(kind==='wave'){ // 水波刻线：上缘稀疏的波纹线，向下排越来越密越粗
    const n=26;let y=0;
    for(let i=0;i<n;i++){const t=i/(n-1);const gap=26-22*t;y+=gap;const w=0.4+t*t*4.2,a=6*(1-t)+1;
      let d='';for(let x=0;x<=W;x+=8){const yy=y+Math.sin(x*0.02+i*1.7)*a+Math.sin(x*0.007-i)*a*0.6;d+=(x?' L':'M')+x+' '+yy.toFixed(1);}
      s+=`<path d="${d}" stroke="${INK}" stroke-width="${w.toFixed(2)}" fill="none"/>`;}
    s+=`<rect x="0" y="${y+2}" width="${W}" height="${H}" fill="${INK}"/>`;
  } else if(kind==='stars'){ // 星光溶解：黑夜上缘被纸色小星点"蚀"开，越往上星点越大越密直到纸
    s+=`<rect width="${W}" height="${H}" fill="${INK}"/>`;let r=1;
    // 有序（Bayer 4x4）阈值决定星点
    const B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],c=18;
    for(let y=0;y<H;y+=c)for(let x=0;x<W;x+=c){const t=1-y/H;const th=B[((y/c)%4)*4+((x/c)%4)]/16;
      if(t>th){const R=Math.min(c*0.75,2+t*t*c*0.75);const cx=x+c/2,cy=y+c/2;
        s+= R<6?`<circle cx="${cx}" cy="${cy}" r="${(R*0.5).toFixed(1)}" fill="${PAPER}"/>`
        :`<path d="M${cx} ${cy-R}L${cx+R*.22} ${cy-R*.22}L${cx+R} ${cy}L${cx+R*.22} ${cy+R*.22}L${cx} ${cy+R}L${cx-R*.22} ${cy+R*.22}L${cx-R} ${cy}L${cx-R*.22} ${cy-R*.22}Z" fill="${PAPER}"/>`;}}
  }
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=s;
}
