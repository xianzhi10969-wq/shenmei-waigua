from pathlib import Path
import json,html,hashlib
R=Path(__file__).parent
sources=json.loads((R/'new/sources.json').read_text());geo=json.loads((R/'new/geometry.json').read_text());selected={};audit={};blocks=[]
# Reviewed semantic identities: alternate angles/crops of the same item must share one ID.
identities={'granny_vam.jpg':'granny-store','keith_skull.jpg':'keith-skull-ring-portrait','eye_ring.jpg':'great-frog-eye-ring','stevie_rhiannon.jpg':'stevie-rhiannon-costume','passage_01.jpg':'dohosuh-passage-installation','pompom_arthur.jpg':'rozin-pompom-mirror','sparrow_official_5.jpg':'lucy-sparrow-felt-potato','nendo_04.jpg':'nendo-watercolour-chair','H38.jpg':'kawauchi-hanabi-photo-H38','H59.jpg':'kawauchi-hanabi-photo-H59','ip_10.jpg':'mailaender-illustrated-people-neck-photo','v88_1-15.png':'locus-solus-chaise','sp_og.jpg':'selgascano-serpentine-2015','mm_vogue_01.jpg':'margiela-2024-male-corset-trousers','mm_442885.jpg':'margiela-2024-olive-pleated-look','mm_442895.jpg':'margiela-2024-black-lattice-look','lalique_official.jpg':'lalique-dragonfly-woman','climax_rgb.jpg':'beardsley-climax','peacock.jpg':'beardsley-peacock-skirt','redon_balloon.jpg':'redon-eye-balloon','forest_1_emmanuelle_moureaux_Forest_of_Numbers.jpg':'moureaux-forest-of-numbers','judy_10358_Multi-Color_Atmosphere_F.jpg':'chicago-multicolor-atmosphere','卡尔顿书架_索特萨斯_摄影Sailko_CCBYSA4.0.jpg':'sottsass-carlton'}
for slug,items in sources.items():
 cards=[];ids=[];hashes=[]
 for n,u in enumerate(items):
  new=u['origin']=='external-reference';f=u['source_file'] if new else f'source/web-prototypes/term-collage-trial-{slug}-2026-11-05/'+u['source_file'];p=R/f
  identity=u['object_id'] if new else identities.get(p.name,u['object_id']);ids.append(identity);hashes.append(hashlib.sha256(p.read_bytes()).hexdigest())
  u['object_id']=identity;u['local_original']=f
  for dev in ['desktop','mobile']:geo[slug][dev][n]['object_id']=identity
  if new:selected[u['object_id']]=u
  cards.append(f'<article><a href="{html.escape(f)}" target="_blank"><img loading="lazy" src="{html.escape(f)}"></a><p>{n+1:02} · {html.escape(u["alt"])}</p><small>{"新增外部参考" if new else "原有案例素材"}</small><p><a href="{html.escape(u["url"])}" target="_blank" rel="noopener">作品出处 ↗</a></p></article>')
 assert len(set(ids))==len(ids),(slug,'repeated object')
 assert len(set(hashes))==len(hashes),(slug,'repeated original bytes')
 audit[slug]={'units_per_device':len(items),'semantic_objects':ids,'duplicate_objects':[],'duplicate_originals':[],'review':'逐张查看原图；同款不同角度合并。Hanabi 两张独立摄影、Margiela 三套不同造型分别保留。'}
 blocks.append(f'<section id="{slug}"><h2>{slug} · {len(items)} 个独立对象</h2><div class="grid">'+''.join(cards)+'</div></section>')
(R/'new/sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2));(R/'new/geometry.json').write_text(json.dumps(geo,ensure_ascii=False,indent=2));(R/'additions/selected.json').write_text(json.dumps(selected,ensure_ascii=False,indent=2));(R/'dedup-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
(R/'sources.html').write_text('<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>v3 素材与出处</title><style>body{max-width:1200px;margin:32px auto;padding:0 20px;background:#f6f5f2;font:14px system-ui;color:#222}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}article{background:white;padding:12px}img{width:100%;height:230px;object-fit:contain}a{color:inherit}section{padding:20px 0}small{color:#777}</style><a href="index.html">← 返回拼贴</a><h1>每件只出现一次</h1><p>五张拼贴，共 42 个对象，其中 18 个为本轮新增参考。点击缩略图看完整原图，点击出处看原网站。新增参考未写入飞书案例库；网页公开展示不等于取得商业使用许可。</p>'+''.join(blocks)+'</html>')
print({'objects':sum(len(s) for s in sources.values()),'new_selected':len(selected),'duplicates':0})
