import { integerImageSize } from './pixel.mjs';

export function assignSlot(doc, pageId, slotId, slots) {
  const page=doc.pages.find(p=>p.id===pageId);
  if(!page)throw new Error('没有找到这个场景');
  if(slotId&&!slots.some(s=>s.id===slotId))throw new Error('这个位置还没有接入网页');
  if(slotId&&doc.pages.some(p=>p.id!==pageId&&p.artSlot===slotId))throw new Error('这个位置已有场景，请先解除原来的连接');
  page.artSlot=slotId;
}

export function missingScenes(doc,slots,newId) {
  const missing=slots.filter(s=>!doc.pages.some(p=>p.artSlot===s.id));
  if(doc.pages.length+missing.length>100)throw new Error('场景总数不能超过 100 个，请先整理现有场景');
  const blank=(width,height)=>({width,height,background:'#ffffff',snapGrid:true,gridSize:1,elements:[]});
  return missing.map(s=>({id:newId(),name:s.name,artSlot:s.id,
    layouts:{desktop:blank(1200,800),mobile:blank(390,600)}}));
}

function layoutStatus(layout,assets) {
  const visible=(layout?.elements||[]).filter(e=>!e.hidden&&e.opacity>0);
  if(!visible.length)return {label:'还没有可见图层',visible:0,images:0,warnings:[]};
  const warnings=[];
  for(const e of visible){
    if(e.type==='image'&&!assets.some(a=>a.id===e.assetId))warnings.push('图片缺少素材：'+(e.name||'未命名'));
    const theta=(e.rotation||0)*Math.PI/180,c=Math.abs(Math.cos(theta)),s=Math.abs(Math.sin(theta));
    const width=e.width*c+e.height*s,height=e.width*s+e.height*c;
    const cx=e.x+e.width/2,cy=e.y+e.height/2;
    if(cx-width/2<-.01||cy-height/2<-.01||cx+width/2>layout.width+.01||cy+height/2>layout.height+.01)
      warnings.push('超出画布，预览会裁切：'+(e.name||'未命名'));
  }
  const images=visible.filter(e=>e.type==='image').length;
  return {label:`${visible.length} 层 · ${images} 张图`,visible:visible.length,images,warnings};
}

export function bindingReport(doc,slots) {
  return slots.map(slot=>{
    const matches=doc.pages.filter(p=>p.artSlot===slot.id),page=matches[0];
    return {...slot,pageId:page?.id,pageName:page?.name,duplicate:matches.length>1,
      desktop:layoutStatus(page?.layouts.desktop,doc.assets),mobile:layoutStatus(page?.layouts.mobile,doc.assets)};
  });
}

export function replaceLayerImage(layer,asset) {
  if(layer?.type!=='image'||layer.locked)throw new Error('请选择未锁定的图片图层');
  if(!asset)throw new Error('没有找到替换图片');
  let dimensions={};
  if(layer.pixelated)dimensions=integerImageSize(asset,layer.width,layer.height);
  layer.assetId=asset.id;
  if(layer.pixelated){layer.width=dimensions.width;layer.height=dimensions.height;layer.rotation=0;layer.keepRatio=true;}
}
