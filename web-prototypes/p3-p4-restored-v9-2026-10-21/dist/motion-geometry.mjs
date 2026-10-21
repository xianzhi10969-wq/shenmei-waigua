export const W=941, H=1672, BAY=W/3, RAIL_H=BAY*1536/895;
export const BOOK_W=853, BOOK_H=1844, PAGE_H=BOOK_H*.86;
export const FLAP_SOURCE=[[118,817],[824,817],[941,1198],[0,1198]];
export const PAGE_SOURCE=[[0,0],[BOOK_W,0],[BOOK_W,PAGE_H],[0,PAGE_H]];
export const FRONT_SOURCE=[[0,PAGE_H],[BOOK_W,PAGE_H],[BOOK_W,BOOK_H],[0,BOOK_H]];
export const OUTER_SOURCE=[[110,918],[830,918],[830,1330],[110,1330]];
export const isWide=(width,height)=>width>=900&&width/height>=1.1;
export function folioLayout(width,height){
 if(!isWide(width,height))return {wide:false,width:BOOK_W,height:BOOK_H,split:PAGE_H,asset:'book-eba616b5d0c5.png',pageSource:PAGE_SOURCE,frontSource:FRONT_SOURCE};
 // A viewport-shaped matte contains the complete landscape illustration at its
 // native aspect ratio. Both pieces share that canvas, including its margins.
 const canvasWidth=1672,canvasHeight=canvasWidth*height/width;
 const scale=Math.min(canvasWidth/1672,canvasHeight/941);
 const offsetY=(canvasHeight-941*scale)/2,split=offsetY+941*scale*.86;
 return {wide:true,width:canvasWidth,height:canvasHeight,split,asset:'book-desktop-approved-v1.png',pageSource:[[0,0],[canvasWidth,0],[canvasWidth,split],[0,split]],frontSource:[[0,split],[canvasWidth,split],[canvasWidth,canvasHeight],[0,canvasHeight]]};
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
 const layout=folioLayout(width,height),wide=layout.wide;
 const initial=wide?Math.min(width*.29/BAY,Math.max(220,height-104)/RAIL_H):Math.min(width*.87/BAY,Math.max(220,height-120)/RAIL_H);
 const overview=wide?Math.min(width*.84/W,height*.88/850):Math.min(width*.975/W,height*.88/1450);
 const camera={width,height,x:W/2,y:mix(RAIL_H/2,wide?810:780,establish),scale:mix(initial,overview,establish),anchor:mix(.46,wide?.45:.47,establish)};
 camera.y=mix(camera.y,1030,approach);camera.scale=mix(camera.scale,width/(wide?1500:460),approach);
 const theta=open*Math.PI/2,depth=1/(1-.25*Math.sin(theta));
 const frontY=854+(-260*Math.cos(theta)+286*Math.sin(theta))*depth;
 const half=353*depth;
 const flap=[[118,854],[824,854],[471+half,frontY],[471-half,frontY]];
 const side=frontY<854?'outer':'inner';
 const edge=Math.abs(frontY-854)<.8;
 let plane;if(!edge)plane=homography(FLAP_SOURCE,flap);
 const toScreen=pts=>pts.map(pt=>cameraPoint(camera,pt));
 const pageRest=[[123,823],[818,823],[883,1146],[58,1146]];
 const pageWorld=plane?pageRest.map(pt=>project(plane,pt)):flap;
 const frontWorld=[flap[3],flap[2],[flap[2][0],flap[2][1]+22],[flap[3][0],flap[3][1]+22]];
 const splitY=wide?height*layout.split/layout.height:height*.86;
 const page=blend(toScreen(pageWorld),[[0,0],[width,0],[width,splitY],[0,splitY]],approach);
 const front=blend(toScreen(frontWorld),[[0,splitY],[width,splitY],[width,height],[0,height]],approach);
 const attachLeft=[mix(flap[0][0],flap[3][0],.73),mix(854,frontY,.73)];
 const attachRight=[mix(flap[1][0],flap[2][0],.73),mix(854,frontY,.73)];
 const rods=[{a:[105,718],b:attachLeft,side:-1},{a:[837,718],b:attachRight,side:1}].map(r=>({...r,joint:rodJoint(r.a,r.b,r.side)}));
 return {p,camera,open,approach,flap,side,edge,page,front,rods,layout,wide,showBook:side==='inner'&&!edge,showRods:open>.10,canBrowse:p<.18};
}
