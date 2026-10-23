"""Pack original bytes and layers into one offline HTML; no image re-encoding."""
import base64, hashlib, json, mimetypes, pathlib, re, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
dist=ROOT/'dist'
def uri(path):
    mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
assets={str(p.relative_to(dist)):uri(p) for p in (dist/'assets').rglob('*') if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg'}}
css=(dist/'styles.css').read_text().replace("url('assets/song.ttf')", "url('"+uri(dist/'assets/song.ttf')+"')")
html=(dist/'index.html').read_text().replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>')
inline='\n<script>window.EMBEDDED_ASSETS='+json.dumps(assets)+';</script>\n'
for filename in ['assets/topics.js','assets/embla-carousel-8.6.0.umd.js','app.js']:
    contents=(dist/filename).read_text().replace('</script','<\\/script')
    html=html.replace(f'<script defer src="{filename}"></script>','')
    inline+='<script>'+contents+'</script>\n'
html=html.replace('</body>',inline+'</body>')
output=ROOT/'彩窗图录-v1-离线.html'
output.write_text(html)
with zipfile.ZipFile(ROOT/'彩窗图录-v1-分层源码.zip','w',zipfile.ZIP_DEFLATED) as z:
    for folder in ['dist','tools','data']:
        for p in (ROOT/folder).rglob('*'):
            if p.is_file():z.write(p,p.relative_to(ROOT))
    for name in ['README.md']:
        if (ROOT/name).exists():z.write(ROOT/name,name)
print(json.dumps({'offlineHTML':output.name,'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'imagesEmbedded':len(assets)},ensure_ascii=False))
