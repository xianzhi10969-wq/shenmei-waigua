export const W=941, H=1672, BAY=W/3;
export const FLAP_SOURCE=[[118,850],[824,850],[941,1188],[0,1188]];
export const OUTER_SOURCE=[[110,1220],[830,1220],[830,1430],[110,1430]];
export const isWide=(width,height)=>width>=900&&width/height>=1.1;
export function cabinetLayout(width,height){
 const wide=isWide(width,height),head=wide?W*941/1672:W*1536/1024;
 // The portrait composition is independently drawn, never stretched to desktop.
 const slots=wide?[
  {image:[.152,.288,.199,.460],label:[.142,.785,.216,.046]},
  {image:[.416,.288,.190,.460],label:[.402,.785,.223,.046]},
  {image:[.675,.288,.216,.460],label:[.666,.785,.240,.046]}
 ]:[{image:[.352,.236,.484,.491],label:[.314,.775,.557,.036]}];
 return {wide,head,offset:head-W*941/1672,step:wide?BAY:W,slots,asset:wide?'p3-desktop-botanical-v1.png':'p3-mobile-botanical-v1.png'};
}
export function folioLayout(width,height){
 const wide=isWide(width,height),canvasWidth=wide?1672:1024,canvasHeight=canvasWidth*height/width;
 const artWidth=wide?1672:1024,artHeight=wide?941:1536;
 const scale=Math.min(canvasWidth/artWidth,canvasHeight/artHeight);
 const box={x:(canvasWidth-artWidth*scale)/2,y:(canvasHeight-artHeight*scale)/2,width:artWidth*scale,height:artHeight*scale,scale};
 const split=box.y+box.height*.90;
 return {wide,width:canvasWidth,height:canvasHeight,split,box,asset:wide?'p4-desktop-botanical-v2.png':'p4-mobile-botanical-v1.png',pageSource:[[0,0],[canvasWidth,0],[canvasWidth,split],[0,split]],frontSource:[[0,split],[canvasWidth,split],[canvasWidth,canvasHeight],[0,canvasHeight]]};
}
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const span=(p,a,b)=>ease((p-a)/(b-a));
const mix=(a,b,t)=>a+(b-a)*t;
const blend=(a,b,t)=>a.map((v,i)=>v.map((n,j)=>mix(n,b[i][j],t)));
// Transform the same illustrated plane through space; no image dissolve.
export function homography(source,destination){
 const rows=[];
 for(let i=0;i<4;i++){
  const [x,y]=source[i],[u,v]=destination[i];
  rows.push([x,y,1,0,0,0,-u*x,-u*y,u]);
  rows.push([0,0,0,x,y,1,-v*x,-v*y,v]);
 }
 for(let c=0;c<8;c++){
  let pivot=c;
  for(let r=c+1;r<8;r++)if(Math.abs(rows[r][c])>Math.abs(rows[pivot][c]))pivot=r;
  [rows[c],rows[pivot]]=[rows[pivot],rows[c]];
  if(Math.abs(rows[c][c])<1e-11)throw Error('Degenerate plane');
  const d=rows[c][c];for(let k=c;k<=8;k++)rows[c][k]/=d;
  for(let r=0;r<8;r++)if(r!==c){const f=rows[r][c];for(let k=c;k<=8;k++)rows[r][k]-=f*rows[c][k]}
 }
 return [...rows.map(r=>r[8]),1];
}
export function project(m,[x,y]){const z=m[6]*x+m[7]*y+m[8];return [(m[0]*x+m[1]*y+m[2])/z,(m[3]*x+m[4]*y+m[5])/z]}
export const cssMatrix=m=>'matrix3d('+[m[0],m[3],0,m[6],m[1],m[4],0,m[7],0,0,1,0,m[2],m[5],0,m[8]].join(',')+')';
export function cameraPoint(c,[x,y]){return [(x-c.x)*c.scale+c.width/2,(y-c.y)*c.scale+c.height*c.anchor]}
export function rodJoint(a,b,side){
 const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy),r1=220,r2=220;
 const along=(r1*r1-r2*r2+d*d)/(2*d),offset=Math.sqrt(Math.max(0,r1*r1-along*along));
 return [a[0]+along*dx/d+side*offset*dy/d,a[1]+along*dy/d-side*offset*dx/d];
}
export function scenePose(progress,width,height,reduced=false){
 let p=clamp(progress);if(reduced)p=p<.5?0:1;
 const establish=span(p,.015,.29),open=span(p,.25,.67),approach=span(p,.70,1);
 const cabinet=cabinetLayout(width,height),layout=folioLayout(width,height),wide=layout.wide,off=cabinet.offset;
 const initial=Math.min(width*(wide?.96:1)/W,height*.94/cabinet.head);
 const overview=Math.min(width*(wide?.84:.975)/W,height*.88/(1450+(wide?0:off*.65)));
 const camera={width,height,x:W/2,y:mix(cabinet.head/2,810+off,establish),scale:mix(initial,overview,establish),anchor:mix(.47,wide?.45:.47,establish)};
 camera.y=mix(camera.y,1030+off,approach);camera.scale=mix(camera.scale,width/(wide?1500:800),approach);
 const theta=open*Math.PI/2,depth=1/(1-.25*Math.sin(theta)),hingeY=850+off;
 const frontY=hingeY+(-260*Math.cos(theta)+286*Math.sin(theta))*depth,half=353*depth;
 const flap=[[118,hingeY],[824,hingeY],[471+half,frontY],[471-half,frontY]];
 const side=frontY<hingeY?'outer':'inner',edge=Math.abs(frontY-hingeY)<.8;
 let plane;if(!edge)plane=homography(FLAP_SOURCE,flap);
 const toScreen=pts=>pts.map(pt=>cameraPoint(camera,pt));
 const pageRest=[[123,856],[818,856],[880,1150],[60,1150]];
 const pageWorld=plane?pageRest.map(pt=>project(plane,pt)):flap;
 const frontWorld=[flap[3],flap[2],[flap[2][0],flap[2][1]+22],[flap[3][0],flap[3][1]+22]];
 const splitY=height*layout.split/layout.height;
 const page=blend(toScreen(pageWorld),[[0,0],[width,0],[width,splitY],[0,splitY]],approach);
 const front=blend(toScreen(frontWorld),[[0,splitY],[width,splitY],[width,height],[0,height]],approach);
 const attachLeft=[mix(flap[0][0],flap[3][0],.73),mix(hingeY,frontY,.73)];
 const attachRight=[mix(flap[1][0],flap[2][0],.73),mix(hingeY,frontY,.73)];
 const rods=[{a:[105,714+off],b:attachLeft,side:-1},{a:[837,714+off],b:attachRight,side:1}].map(r=>({...r,joint:rodJoint(r.a,r.b,r.side)}));
 return {p,camera,open,approach,flap,side,edge,page,front,rods,layout,cabinet,wide,hingeY,contentAlpha:1-span(p,.08,.24),showBook:side==='inner'&&!edge,showRods:open>.10,canBrowse:p<.18};
}
