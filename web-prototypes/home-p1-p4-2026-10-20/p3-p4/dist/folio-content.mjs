import {homography,cssMatrix} from './motion-geometry.mjs';

export const specimens={
 snow:{src:'assets/style-clear-snow-original.png',title:'Snow',credit:'吉冈德仁 Tokujin Yoshioka · 2010',source:'https://www.tokujin.com/works/2010-sensing-nature-snow/',note:'沿用原「清冷」词条的作品图。'},
 trees:{src:'assets/style-clear-hokkaido-original.png',title:'Nine Trees, Hokkaido',credit:'Michael Kenna · 2004',source:'https://michaelkenna.com/by_title.php?id=N',note:'沿用原「清冷」词条的摄影图。'},
 organza:{src:'assets/style-coquette-organza.jpg',title:'Faraway, so close.',credit:'Cecilie Bahnsen · Spring Summer 2024',source:'https://ceciliebahnsen.com/pages/ss24',note:'本轮选作 Coquette 的材质观察样本；不替换原词条的定稿案例。'},
 silhouette:{src:'assets/style-coquette-silhouette.jpg',title:'Faraway, so close.',credit:'Cecilie Bahnsen · Spring Summer 2024',source:'https://ceciliebahnsen.com/pages/ss24',note:'本轮选作 Coquette 的轮廓观察样本；风格归类为试排策展判断。'}
};
export function pageGeometry(layout,viewportHeight=844){
 const box=layout.box,map=pts=>pts.map(([x,y])=>[box.x+x*box.scale,box.y+y*box.scale]);
 if(!layout.wide)return {compact:viewportHeight<780,width:650,height:1280,quads:[map([[250,128],[830,128],[830,1270],[250,1270]]),map([[250,128],[830,128],[830,1270],[250,1270]])]};
 return {width:600,height:800,quads:[map([[350,140],[800,140],[800,740],[350,740]]),map([[920,140],[1370,140],[1370,740],[920,740]])]};
}

export function initFolio(){
 const book=document.getElementById('book-body'),root=document.getElementById('folio-content'),pages=[document.getElementById('page-clear'),document.getElementById('page-coquette')],dialog=document.getElementById('specimen-dialog');
 let active=0,wide=false,blank=false,returnFocus=null,readable=false,titleFont=0;
 const titleFonts=[['engraved','香萃刻宋'],['fractured','香萃零度黑'],['original','朱雀仿宋']];
 const buttons=Array.from(root.querySelectorAll('[data-specimen]'));
 const tabs=Array.from(root.querySelectorAll('[data-page]'));
 for(const button of buttons){
  button.onclick=()=>{
   const item=specimens[button.dataset.specimen];if(!item||!readable)return;
   returnFocus=button;document.getElementById('specimen-image').src=item.src;document.getElementById('specimen-image').alt=item.title;
   document.getElementById('specimen-title').textContent=item.title;document.getElementById('specimen-credit').textContent=item.credit;
   document.getElementById('specimen-note').textContent=item.note;document.getElementById('specimen-source').href=item.source;
   dialog.showModal();
  };
 }
 function select(index,focus=false){
  active=Math.max(0,Math.min(1,index));
  pages.forEach((page,i)=>{page.hidden=!wide&&i!==active});
  tabs.forEach(button=>{button.setAttribute('aria-current',Number(button.dataset.page)===active?'page':'false')});
  if(focus&&!wide)pages[active].querySelector('h2').focus({preventScroll:true});
 }
 tabs.forEach(button=>{button.onclick=()=>select(Number(button.dataset.page),true)});
 document.getElementById('close-specimen').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>{returnFocus?.focus({preventScroll:true})});
 document.getElementById('toggle-folio').onclick=()=>{blank=!blank;root.hidden=blank;document.getElementById('toggle-folio').textContent=blank?'显示试排':'对照空白';document.getElementById('toggle-folio').setAttribute('aria-pressed',String(blank))};
 document.getElementById('title-font').onclick=()=>{titleFont=(titleFont+1)%titleFonts.length;const [key,name]=titleFonts[titleFont];root.setAttribute('data-title-font',key);document.getElementById('title-font').textContent=name;document.getElementById('title-font').setAttribute('aria-label','更换中文题签字体，当前'+name)};
 return {
  assets:Object.values(specimens).map(s=>s.src.slice(7)),
  resize(layout,viewportHeight){
   wide=layout.wide;root.classList.toggle('wide',wide);root.style.width=layout.width+'px';root.style.height=layout.height+'px';
   const g=pageGeometry(layout,viewportHeight),source=[[0,0],[g.width,0],[g.width,g.height],[0,g.height]];
   root.classList.toggle('compact',Boolean(g.compact));
   pages.forEach((page,i)=>{page.style.width=g.width+'px';page.style.height=g.height+'px';page.style.transform=cssMatrix(homography(source,g.quads[i]))});
   select(active);
  },
  paint(progress){readable=progress>=.985;root.inert=!readable;book.toggleAttribute('data-readable',readable)}
 };
}
