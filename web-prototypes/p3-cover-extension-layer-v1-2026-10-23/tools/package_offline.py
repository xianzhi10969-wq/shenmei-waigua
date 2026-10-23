import base64,json,mimetypes,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1];dist=ROOT/'dist'
def uri(p):return 'data:'+(mimetypes.guess_type(p.name)[0] or 'application/octet-stream')+';base64,'+base64.b64encode(p.read_bytes()).decode()
assets={str(p.relative_to(dist)):uri(p) for p in (dist/'assets').rglob('*') if p.is_file() and p.suffix.lower() in {'.png','.jpeg','.jpg'}}
html=(dist/'index.html').read_text()
for filename in ['styles.css','cover-extension.css']:
 css=(dist/filename).read_text().replace("url('assets/song.ttf')","url('"+uri(dist/'assets/song.ttf')+"')")
 html=html.replace(f'<link rel="stylesheet" href="{filename}">','<style>'+css+'</style>')
inline='<script>window.EMBEDDED_ASSETS='+json.dumps(assets)+';</script>'
for filename in ['assets/topics.js','assets/embla-carousel-8.6.0.umd.js','app.js','assets/extension-cells.js','cover-extension.js']:
 html=html.replace(f'<script defer src="{filename}"></script>','')
 inline+='<script>'+(dist/filename).read_text().replace('</script','<\\/script')+'</script>'
(ROOT/'彩窗封面延伸-三版对照-v1.html').write_text(html.replace('</body>',inline+'</body>'))
print('Saved standalone comparison HTML')
