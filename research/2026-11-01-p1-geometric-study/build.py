"""Editable geometry studies; does not edit or resample the original art."""
from pathlib import Path
from math import sin, cos, pi

HERE = Path(__file__).parent
def pt(x,y): return f'{x:.2f},{y:.2f}'
def ring(cx,cy,r,n=8,offset=0):
    return [(cx+r*cos(offset+i*2*pi/n),cy+r*sin(offset+i*2*pi/n)) for i in range(n)]
def polygon(points,**attrs):
    return '<polygon points="'+' '.join(pt(*p) for p in points)+'" '+ ' '.join(f'{k}="{v}"' for k,v in attrs.items())+'/>'

def cell(cx,cy,r,number):
    outer=ring(cx,cy,r)
    middle=ring(cx,cy,r*.5412,offset=pi/8)
    star=[]
    for i in range(16):
        a=i*pi/8
        rr=r if i%2==0 else r*.5412
        star.append((cx+rr*cos(a),cy+rr*sin(a)))
    # Separate editable paths: silhouette, inner octagon, structural spokes.
    lines=f'<g id="cell-{number}">'+polygon(outer)+polygon(middle)
    for i in range(8):
        p=outer[i]; q=middle[i]; t=middle[(i-1)%8]
        lines+=f'<path d="M{pt(*p)} L{pt(*q)} M{pt(*p)} L{pt(*t)}"/>'
    lines+='</g>'
    fills=''
    for i in [2,3,5,6]:
        fills+=polygon([outer[i],middle[i],middle[(i-1)%8]],fill='url(#hatch)')
    return lines,fills

# Large, cropped eightfold geometry; references the original star and garment borders.
cells=[(220,-48,120),(390,122,120),(390,362,120)]
lineparts=[]; hatchparts=[]
for i,c in enumerate(cells):
    a,b=cell(*c,i); lineparts.append(a); hatchparts.append(b)
lines=''.join(lineparts)
hatches=''.join(hatchparts)
defs='<defs><pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0V4" stroke="#25251f" stroke-width=".55"/></pattern><clipPath id="background-only"><path d="M0 0H390V432L342 422L320 402L300 390L280 388L261 396L250 409H0Z"/></clipPath></defs>'
for name,texture in [('geometry',False),('hatched',True)]:
    content=(f'<g id="local-hatching" opacity=".38" stroke="none">{hatches}</g>' if texture else '')
    content+=f'<g id="geometric-structure" fill="none" stroke="#25251f" stroke-width=".65" stroke-linejoin="round" opacity=".44">{lines}</g>'
    (HERE/f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"><title>{name}: editable structural study, not finished artwork</title>{defs}<g clip-path="url(#background-only)">{content}</g></svg>')

structure=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"><title>几何装饰结构稿 — 文字与插画占位</title>{defs}<rect width="390" height="844" fill="white"/><g fill="none" stroke="black" stroke-width=".7"><g clip-path="url(#background-only)">{lines}</g><path id="logo-zone" d="M30 90H258V340H30Z"/><path id="subtitle-zone" d="M65 354H250V382H65Z"/><path id="figure-zone" d="M252 403Q307 367 340 430L390 518V844H206L224 600L144 565L150 550L250 559Z"/><path id="shrine-zone" d="M0 590L45 543L73 437L100 543L155 590V680H170V731H0Z"/></g><g font-family="serif" font-size="14" text-anchor="middle"><text x="144" y="215">已认可主标</text><text x="155" y="373" font-size="10">已认可副标</text><text x="302" y="696">原人物</text><text x="77" y="649">原神龛</text></g></svg>'''
(HERE/'structure.svg').write_text(structure)
