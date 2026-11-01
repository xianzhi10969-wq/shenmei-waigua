// Preserve each handwritten question by showing the exact original image region.
// Only the four image captions are repeated for button accessibility, not new content.
const questions=[
 '为什么空着的地方，反而让人停下来？',
 '就是一张普通的照片，怎么会一直忘不掉？',
 '我知道我喜欢什么，可就是形容不出来。',
 '旧旧的、带着磨损的东西，怎么反而这么有味道？'
];
const desktop=[[100,85,325,100],[398,198,355,100],[145,298,335,100],[508,360,395,93]];
const phone=[[20,223,280,64],[34,323,290,64],[20,423,300,64],[34,523,295,64]];
const pin=document.querySelector('.baseline-pin'),query=matchMedia('(max-width:680px)');
const plane=document.createElement('div');plane.className='question-plane';document.body.append(plane);
let selected=-1,buttons=[],lastState=null;
function build(){
 const mobile=query.matches,boxes=mobile?phone:desktop,baseY=mobile?844:900;
 plane.classList.toggle('mobile',mobile);plane.style.setProperty('--night',mobile?'#13171c':'#14191e');
 plane.replaceChildren();buttons=[];
 const invitation=document.createElement('p');invitation.className='question-invitation';invitation.textContent='哪一句像你的感觉？点一句，带着它往下看。';plane.append(invitation);
 const next=document.createElement('div');next.className='question-next';next.hidden=selected<0;
 const response=document.createElement('p');response.setAttribute('role','status');response.className='sr-only';
 const browse=document.createElement('button');browse.type='button';browse.textContent='去专题里看看 ↓';
 browse.addEventListener('click',()=>{
  window.dispatchEvent(new Event('browse-topics'));
  const heading=document.querySelector('.gallery-intro h1');
  // Wait for the actual scroll to end; do not let focus interrupt the transition.
  const focus=()=>{heading.tabIndex=-1;heading.focus({preventScroll:true});};
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)focus();else setTimeout(focus,700);
 });
 next.append(response,browse);plane.append(next);
 boxes.forEach(([x,y,w,h],i)=>{
  const button=document.createElement('button');button.type='button';button.className='question-button';
  button.setAttribute('aria-label',questions[i]);button.setAttribute('aria-pressed',String(selected===i));
  Object.assign(button.style,{left:x+'px',top:baseY+y+'px',width:w+'px',height:h+'px'});
  const raster=document.createElement('span');raster.className='question-raster';raster.setAttribute('aria-hidden','true');
  Object.assign(raster.style,{backgroundImage:`url('../${mobile?'p3-stained-glass-v3-2026-10-23/assets/m_p2_nostar.png':'p1-p2-reveal-star-v4-2026-10-21/assets/p2_nostar.png'}')`,backgroundSize:mobile?'390px 1060px':'1440px 811px',backgroundPosition:`-${x}px -${y}px`});
  raster.dataset.image=raster.style.backgroundImage;raster.style.backgroundImage='none';
  raster.style.transitionDelay=(i*.08)+'s';
  button.append(raster);button.addEventListener('click',()=>{
   selected=i;plane.classList.add('has-selection');buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
   response.textContent='先记住这份感觉，不急着给它命名。';next.hidden=false;
   // Place the next action near the selected sentence, inside existing empty space.
   next.style.left=(mobile?56:i===1?520:x+38)+'px';next.style.top=(baseY+y+h-(mobile?8:0))+'px';
   const intro=document.querySelector('.reader-note');let carried=intro.querySelector('.carried-question');
   if(!carried){carried=document.createElement('p');carried.className='carried-question';intro.append(carried);}
   carried.replaceChildren();const label=document.createElement('span');label.className='note-label';label.textContent='带着这句感觉：';const text=document.createElement('span');text.className='note-text';text.textContent=questions[i];carried.append(label,text);
  });
  plane.append(button);buttons.push(button);
 });
 plane.classList.toggle('has-selection',selected>=0);
 if(selected>=0)buttons[selected].click();
 if(lastState)position(lastState);
 window.dispatchEvent(new Event('baseline-position-request'));
}
function position(state){
 lastState=state;const mobile=query.matches,scale=mobile?innerWidth/390:state.scale;
 plane.style.transform=`scale(${scale}) translateY(${-state.scroll/scale}px)`;
 plane.inert=scrollY>=state.start-1;plane.style.visibility=plane.inert?'hidden':'';
 buttons.forEach((button,i)=>{
  const top=Number.parseFloat(button.style.top)*scale-state.scroll;
  // Reveal when the sentence enters the reading area; scrolling back retains it.
  if(top<innerHeight*1.15){const raster=button.firstElementChild;raster.style.backgroundImage=raster.dataset.image;}
  if(top<innerHeight*.88)button.classList.add('revealed');
  button.tabIndex=top+button.offsetHeight*scale>0&&top<innerHeight&&!plane.inert?0:-1;
 });
}
function selection(){const t=window.GALLERY_REVIEW?.topic;if(t)document.querySelector('#gallerySelection').textContent=`正在看 · ${t.name} / ${t.english}`;}
window.addEventListener('baseline-position',e=>position(e.detail));
window.addEventListener('gallery-position',()=>requestAnimationFrame(selection));
window.addEventListener('p3-near',()=>requestAnimationFrame(selection));
query.addEventListener('change',build);build();selection();
