import sys,json
from pathlib import Path
R=Path(__file__).resolve().parents[1];sys.path.insert(0,str(R/'.tools'))
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
fonts={ 'cn':TTFont(R/'dist/assets/song.ttf'), 'en':TTFont('/System/Library/Fonts/Supplemental/Georgia.ttf') }

def outline(s,sz,x,y,kind='cn',spacing=0):
 f=fonts[kind];gs=f.getGlyphSet();c=f.getBestCmap();sc=sz/f['head'].unitsPerEm
 advance=sum(gs[c[ord(ch)]].width*sc+spacing for ch in s)-spacing
 start=x-advance/2;parts=[]
 for ch in s:
  g=gs[c[ord(ch)]];p=SVGPathPen(gs);g.draw(p);parts.append(f'<path d="{p.getCommands()}" transform="translate({start},{y}) scale({sc},{-sc})"/>');start+=g.width*sc+spacing
 return ''.join(parts)
T=json.loads((R/'figma/topics.json').read_text());m=json.loads((R/'figma/masks.json').read_text());E=json.loads((R/'figma/extensions.json').read_text())
geo={'web':[[120,425,233,842,176,891],[255,423,385,842,320,891],[417,415,604,842,510,891],[637,423,764,842,700,891],[786,425,897,842,840,891]],'mobile':[[1033,447,1088,848,1058,901],[1116,405,1280,848,1198,901],[1309,447,1363,848,1334,901]]}
for kind,slots in geo.items():
 for i,s in enumerate(slots):
  t=T[i if kind=='web' else i+1];x,y=s[4:];focus=i==(2 if kind=='web' else 1)
  paths=outline(t['name'],23 if focus else 21,x,y+2 if focus else y+1,spacing=3 if focus else 2)
  paths+=outline(t['english'],8,x,y+16,kind='en',spacing=.6)
  tsvg=f'<svg width="1448" height="1086" viewBox="0 0 1448 1086" xmlns="http://www.w3.org/2000/svg"><g fill="#24221f">{paths}</g></svg>'
  s.extend([tsvg,t['name'],t['english']])
(R/'figma/spec.json').write_text(json.dumps({'masks':m,'extension':E,'topics':T[:5],'geo':geo},ensure_ascii=False))
print('spec', (R/'figma/spec.json').stat().st_size)
