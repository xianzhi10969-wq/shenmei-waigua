from pathlib import Path
import shutil,json
study=Path(__file__).resolve().parent;root=study.parents[1];pub=study/'public';pub.mkdir(exist_ok=True);base=root/'aesthetic-site/public'
shutil.copy2(study/'assets/frame-horizontal-v1.png',pub/'frame-horizontal-v1.png')
for p in base.iterdir():
 if p.name in ['index.html','app.js']:continue
 dest=pub/p.name
 if not dest.exists():dest.symlink_to(p,target_is_directory=p.is_dir())
frames=json.loads((base/'assets/frames.json').read_text());frames[0]['html']='<img class="study-frame" src="/frame-horizontal-v1.png" alt="暖白排线画框试样">';(pub/'frames-candidate.json').write_text(json.dumps(frames,ensure_ascii=False))
app=(base/'app.js').read_text().replace("api('/assets/frames.json')","api(new URLSearchParams(location.search).get('frame')==='old'?'/assets/frames.json':'/frames-candidate.json')")
app+='''\n// Independent art trial. Use the current page's geometry and real content.
document.querySelectorAll('[data-frame-choice]').forEach(button=>button.addEventListener('click',async()=>{
 const y=scrollY,mode=button.dataset.frameChoice;
 frames=await api(mode==='old'?'/assets/frames.json':'/frames-candidate.json');
 await route();requestAnimationFrame(()=>scrollTo(0,y));
 document.querySelectorAll('[data-frame-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.documentElement.dataset.frameStudy=mode;
}));
''';(pub/'app.js').write_text(app)
html=(base/'index.html').read_text();html=html.replace('</head>','''<style>.study-frame{position:absolute;inset:0;width:100%;height:100%;max-width:none;z-index:1;pointer-events:none}.study-tools{position:fixed;z-index:100;bottom:12px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:16px;padding:8px 16px;background:#f8f6ef;border:1px solid #80766c;font:13px/24px system-ui;white-space:nowrap}.study-tools button{font:inherit;padding:3px 6px;min-height:32px}.study-tools button[aria-pressed=true]{text-decoration:underline;text-underline-offset:5px}</style></head>''')
html=html.replace('</body>','''<aside class="study-tools" aria-label="画框试样对照"><span>第一只横框</span><button type="button" data-frame-choice="old" aria-pressed="false">原框</button><button type="button" data-frame-choice="new" aria-pressed="true">吊灯画风</button></aside></body>''');(pub/'index.html').write_text(html)

if __name__ == '__main__':
 from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
 from functools import partial
 print('Frame art preview is ready at http://127.0.0.1:8851/#/chapter/reczz28HJJL2A7E0',flush=True)
 ThreadingHTTPServer(('127.0.0.1',8851),partial(SimpleHTTPRequestHandler,directory=str(pub))).serve_forever()
