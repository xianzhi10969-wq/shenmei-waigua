from pathlib import Path
import urllib.request,re,concurrent.futures
R=Path(__file__).resolve().parents[1]/'public/assets';R.mkdir(exist_ok=True)
css=[]
for family in ['Noto+Serif+SC:wght@400','Cormorant+Garamond:ital,wght@0,400;1,400']:
 req=urllib.request.Request('https://fonts.googleapis.com/css2?family='+family+'&display=swap',headers={'User-Agent':'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'})
 css.append(urllib.request.urlopen(req).read().decode())
text='\n'.join(css);urls=set(re.findall(r'url\((https[^)]+)\)',text))
def fetch(url):
 name='font-'+url.split('/')[-1];p=R/name
 if not p.exists():p.write_bytes(urllib.request.urlopen(url).read())
 return url,'/assets/'+name
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for a,b in pool.map(fetch,urls):text=text.replace(a,b)
(R/'fonts.css').write_text(text);print('Local font files:',len(urls))
