const page=await figma.getNodeByIdAsync('144:2');await figma.setCurrentPageAsync(page);
const sources=await Promise.all(['526:3','526:4','526:5','526:6','526:7','526:8','526:9'].map(id=>figma.getNodeByIdAsync(id)));
const fills=sources.map(n=>n.fills);const created=[];
await Promise.all([{family:'Noto Serif SC',style:'Regular'},{family:'Noto Serif',style:'Regular'}].map(f=>figma.loadFontAsync(f)));
function frame(parent,name,w=1448,h=1086){const n=figma.createFrame();parent.appendChild(n);n.name=name;n.resize(w,h);n.fills=[];n.clipsContent=false;created.push(n.id);return n;}
function rect(parent,name,box,fill){const n=figma.createRectangle();parent.appendChild(n);n.name=name;n.x=box[0];n.y=box[1];n.resize(box[2],box[3]);n.fills=fill;created.push(n.id);return n;}
const solid=hex=>[{type:'SOLID',color:{r:parseInt(hex.slice(0,2),16)/255,g:parseInt(hex.slice(2,4),16)/255,b:parseInt(hex.slice(4,6),16)/255}}];
function masked(parent,key,name){const f=frame(parent,name);const svg='<svg width="1448" height="1086" viewBox="0 0 1448 1086" xmlns="http://www.w3.org/2000/svg"><path fill="black" d="'+SPEC.masks[key]+'"/></svg>';const m=figma.createNodeFromSvg(svg);f.appendChild(m);m.name='固定蒙版 · '+key;m.isMask=true;m.maskType='ALPHA';m.locked=true;created.push(m.id);return f;}
function text(parent,s,x,y,w,size=12,english=false){const n=figma.createText();parent.appendChild(n);n.name=s;n.fontName={family:english?'Noto Serif':'Noto Serif SC',style:'Regular'};n.fontSize=size;n.characters=s;n.fills=solid('24221f');n.resize(w,size*1.5);n.textAlignHorizontal='CENTER';n.x=x;n.y=y;created.push(n.id);return n;}
const out=[];
for(const kind of ['web','mobile']){
 const root=await figma.getNodeByIdAsync(kind==='web'?'525:3':'525:4');const mobile=kind==='mobile';const W=root.width,H=root.height;
 const viewport=frame(root,'彩窗取景 · 原图比例 / 分层蒙版',mobile?400:945,mobile?947:995);viewport.clipsContent=true;
 const full=frame(viewport,'原始画布1448×1086');full.x=mobile?-999:-35;full.y=mobile?-45:0;
 const base=rect(full,'LOCKED · 钢笔底图原件（未重绘）',[0,0,1448,1086],fills[0]);base.locked=true;
 const upper=frame(full,'ADDED · 少量上部小格延伸');const glass=frame(full,'夜玻璃 · 连续铅线槽');const art=frame(full,'飞书原色封面 · 固定窗洞');const titles=frame(full,'题签 · 独立层');
 for(const [i,slot] of SPEC.geo[kind].entries()){
  const key=kind+'-'+i,topic=i+(mobile?1:0),[x0,y0,x1,y1,tx,ty]=slot;
  let g=masked(glass,key+'-opening',key+' · 夜玻璃');rect(g,'墨黑夜玻璃',[0,0,1448,1086],solid('131218'));
  g=masked(art,key+'-art',key+' · '+SPEC.topics[topic].name);rect(g,'原色封面 · 等比裁切',[x0,y0,x1-x0,y1-y0],fills[topic+2]);
  const e=SPEC.extension.find(x=>x.pane===key),ex=Math.min(x0,e.box[0]),er=Math.max(x1,e.box[2]);
  g=masked(upper,'extension-'+key+'-opening',key+' · 延伸夜玻璃');rect(g,'夜玻璃',[0,0,1448,1086],solid('131218'));
  g=masked(upper,'extension-'+key+'-art',key+' · 同一封面上部局部');rect(g,'原色封面 · 独立上部裁切',[ex,e.box[1],er-ex,y1-e.box[1]],fills[topic+2]);
  g=masked(titles,key+'-title',key+' · 题签区域');rect(g,'原纸补片',[tx-43,ty-22,86,44],fills[1]);
  const focus=i===(mobile?1:2);
  if(focus){const w=mobile?146:166,left=tx-w/2,right=tx+w/2,top=ty-20,bottom=ty+24,f=12;const svg=`<svg width="1448" height="1086" viewBox="0 0 1448 1086" xmlns="http://www.w3.org/2000/svg"><path d="M${left+f} ${top+5}L${left-7} ${top+5}L${left} ${top+21}L${left-7} ${bottom-3}L${left+f} ${bottom-3}M${right-f} ${top+5}L${right+7} ${top+5}L${right} ${top+21}L${right+7} ${bottom-3}L${right-f} ${bottom-3}" fill="#f7f3e9" stroke="#2a2722" stroke-width="1.1"/><path d="M${left+f} ${top}Q${tx} ${top-3} ${right-f} ${top}L${right-f} ${bottom}Q${tx} ${bottom-3} ${left+f} ${bottom}Z" fill="#faf6ec" stroke="#2a2722" stroke-width="1.2"/><path d="M${left+f} ${top}v${bottom-top}l-7 -4M${right-f} ${top}v${bottom-top}l7 -4" fill="none" stroke="#514b40" stroke-width=".7"/></svg>`;const ribbon=figma.createNodeFromSvg(svg);g.appendChild(ribbon);ribbon.name='燕尾卷轴 · 源SVG';created.push(ribbon.id);}
  const lettering=figma.createNodeFromSvg(slot[6]);g.appendChild(lettering);lettering.name=slot[7]+' / '+slot[8]+' · 原字体轮廓';created.push(lettering.id);
  const backup=text(g,slot[7]+' '+slot[8],tx-60,ty-15,120,20);backup.name='可编辑原文（原字体未安装，显示用上方轮廓）';backup.visible=false;
 }
 const s=mobile?Math.min(W-24,(H-183)*.42222)/400:Math.min(W-48,(H-196)*.94975)/945;
 viewport.rescale(s);viewport.x=(W-viewport.width)/2;viewport.y=mobile?42:49;
 text(root,'审美外挂 · 美学专题',mobile?21:230,mobile?16:23,mobile?155:250,mobile?10:12);
 text(root,'03 / 24',W-(mobile?110:380),mobile?16:23,mobile?85:150,12,true);
 const cy=viewport.y+viewport.height+4;const pager=frame(root,'逐格翻阅',mobile?250:330,40);pager.x=(W-pager.width)/2;pager.y=cy;
 text(pager,'左右轻滑 · 一次一格',50,12,pager.width-100,mobile?10:11);
 const arrowSvg='<svg width="42" height="20" viewBox="0 0 42 20" xmlns="http://www.w3.org/2000/svg"><path d="M39 10H3m9-7L3 10l9 7" fill="none" stroke="#24221f" stroke-width="1.2"/></svg>';
 const comp=figma.createComponent();pager.appendChild(comp);comp.name='逐格箭头 · 复用组件';comp.resize(42,40);comp.fills=[];const icon=figma.createNodeFromSvg(arrowSvg);comp.appendChild(icon);icon.y=10;const next=comp.createInstance();pager.appendChild(next);next.x=pager.width-42;next.rotation=180;next.x=pager.width;next.y=40;created.push(comp.id,icon.id,next.id);
 text(root,SPEC.topics[2].definition,(W-(mobile?330:620))/2,cy+48,mobile?330:620,mobile?12:13);
 text(root,'封面出处',(W-120)/2,cy+82,120,mobile?9:10);
 out.push({kind,id:root.id,stageId:viewport.id,stageScale:s});
}
return {frames:out,createdNodeIds:created};
