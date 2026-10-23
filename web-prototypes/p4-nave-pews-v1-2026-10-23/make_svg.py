from pathlib import Path
from html import escape
ROOT=Path(__file__).resolve().parent
INK='#1E1E1E'; PAPER='#F6F3ED'

def pew(xc,outer,inner,y,depth,side,index,mobile=False):
    # One physical half-pew object, never one card laid onto a grid.
    # End nearest the center aisle is a vertical carved end-board.
    ix = inner if side=='L' else 2*xc-inner
    ox = outer if side=='L' else 2*xc-outer
    toward = 1 if side=='L' else -1
    points = lambda pts: ' '.join(f'{a:.1f},{b:.1f}' for a,b in pts)
    a=[(ox,y-14),(ix,y-5),(ix,y+10),(ox,y+5)]
    b=[(ox,y+5),(ix,y+10),(ix+toward*8,y+depth*.65),(ox+toward*12,y+depth)]
    c=[(ox+toward*12,y+depth),(ix+toward*8,y+depth*.65),(ix+toward*8,y+depth*.65+10),(ox+toward*12,y+depth+12)]
    endx=ix
    # label on long backboard, not a floating thumbnail
    lx=(ox*0.56+ix*0.44)
    ly=y+2
    fs = 12 if not mobile else 8.5
    circle_r = 7.5 if not mobile else 6
    return f'''<g class="pew" role="button" tabindex="0" data-seat="{index}" aria-label="席位 {index+1:02d}" aria-pressed="false">
     <polygon class="pew-back" points="{points(a)}"/>
     <polygon class="pew-seat" points="{points(b)}"/>
     <polygon class="pew-front" points="{points(c)}"/>
     <path class="pew-end" d="M{endx:.1f} {y-6} q{-toward*3} -9 {-toward*8} -7 q{-toward*5} 4 {-toward*1} 11 L{endx+toward*8:.1f} {y+depth*.65+10:.1f} L{endx+toward*8:.1f} {y+depth*.65:.1f} Z"/>
     <path class="pew-leg" d="M{ox+toward*21:.1f} {y+depth+9:.1f} v{max(12,depth*.6):.1f} l{-toward*12:.1f} 3 M{ix+toward*7:.1f} {y+depth*.65+10:.1f} l{toward*3:.1f} {max(15,depth*.62):.1f}"/>
     <circle class="end-finial" cx="{endx-toward*6:.1f}" cy="{y-10:.1f}" r="{circle_r}"/>
     <text x="{lx:.1f}" y="{ly:.1f}" font-size="{fs}" text-anchor="middle" dominant-baseline="middle" class="seat-number">{index+1:02d}</text>
     <path d="M{ox+toward*7:.1f} {y+6} L{ix-toward*7:.1f} {y+10}" class="pew-score"/>
   </g>'''

def svg(mobile=False):
    if mobile:
        w,h,cx=390,780,195
        roof='''<path d="M10 332 Q78 159 195 42 Q312 159 380 332"/><path d="M26 338 Q85 180 195 63 Q305 180 364 338"/>
          <path d="M195 42 V300 M30 332 L3 756 M360 332 L387 756"/>
          <path d="M12 328 Q78 274 107 171 M378 328 Q312 274 283 171"/>'''
        walls='''<path d="M16 342 L16 780 M374 342 L374 780"/>
         <path d="M35 345 Q62 265 87 304 L84 386 M355 345 Q328 265 303 304 L306 386"/>
         <path d="M2 604 L65 422 M388 604 L325 422"/>'''
        floor='''<path d="M179 310 L111 780 M211 310 L279 780 M195 310 L195 780"/>
          <path d="M147 544 L243 544 M129 651 L261 651 M111 765 L279 765"/>'''
        far='''<path d="M151 286 V199 Q151 175 195 142 Q239 175 239 199 V286 Z"/>
         <path d="M160 286 V201 Q160 183 195 155 Q230 183 230 201 V286 Z"/>
         <path d="M195 156 V285 M160 218 H230"/>
         <circle cx="195" cy="193" r="12"/><path d="M195 181 V205 M183 193 H207"/>'''
        rows=[(374,84,178,19),(454,52,170,22),(550,17,155,27),(667,3,141,33)]
        text= '<text x="195" y="308" text-anchor="middle" class="altar-label" font-size="8">P3 · 当前彩窗</text>'
    else:
        w,h,cx=1200,880,600
        roof='''<path d="M130 312 Q236 80 600 18 Q964 80 1070 312"/><path d="M176 326 Q286 118 600 49 Q914 118 1024 326"/>
           <path d="M600 18 V343 M130 312 L4 880 M1070 312 L1196 880"/>
           <path d="M220 285 Q300 142 392 88 M980 285 Q900 142 808 88"/>
           <path d="M350 161 Q471 81 600 49 Q729 81 850 161"/>'''
        walls='''<path d="M67 339 L12 880 M1133 339 L1188 880"/>
          <path d="M87 394 Q130 267 203 270 L216 473 M1113 394 Q1070 267 997 270 L984 473"/>
          <path d="M138 464 Q218 306 290 333 L313 528 M1062 464 Q982 306 910 333 L887 528"/>
          <path d="M0 778 L310 410 M1200 778 L890 410"/>'''
        floor='''<path d="M568 343 L421 880 M632 343 L779 880 M600 343 V880"/>
         <path d="M540 450 H660 M516 545 H684 M482 675 H718 M445 803 H755"/>'''
        far='''<path d="M530 325 V182 Q530 143 600 99 Q670 143 670 182 V325 Z"/>
         <path d="M542 325 V188 Q542 154 600 116 Q658 154 658 188 V325 Z"/>
         <path d="M600 117 V326 M542 245 H658"/>
         <circle cx="600" cy="181" r="24"/><circle cx="600" cy="181" r="7"/>
         <path d="M600 157 V205 M576 181 H624 M584 165 L616 197 M616 165 L584 197"/>'''
        rows=[(427,403,554,30),(501,328,539,36),(599,224,516,45),(722,54,481,56)]
        text='<text x="600" y="347" text-anchor="middle" class="altar-label" font-size="11">P3 · 当前专题彩窗</text>'
    pews=[]
    for i,(y,outer,inner,depth) in enumerate(rows):
        pews.append(pew(cx,outer,inner,y,depth,'L',i*2,mobile))
        pews.append(pew(cx,outer,inner,y,depth,'R',i*2+1,mobile))
    style=f'''<style>
        .arch,.structure,.aisle{{fill:none;stroke:{INK};stroke-width:{1.4 if mobile else 1.6};vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}}
        .structure{{stroke-width:1.15}} .aisle{{stroke-width:.9}}
        .pew{{cursor:pointer;outline:none}} .pew polygon,.pew .pew-end{{fill:{PAPER};stroke:{INK};stroke-width:{1.4 if mobile else 1.7};stroke-linejoin:round;vector-effect:non-scaling-stroke}}
        .pew .pew-back{{stroke-width:2.2}}.pew .pew-front{{stroke-width:1.2}}
        .pew .pew-seat{{stroke-width:1.1}} .pew .end-finial{{fill:{PAPER};stroke:{INK};stroke-width:1.4}}
        .pew .pew-score,.pew .pew-leg{{fill:none;stroke:{INK};stroke-width:0.85;pointer-events:none}}
        .seat-number{{fill:{INK};font-family:Georgia,serif;pointer-events:none;letter-spacing:.12em}}
        .pew.selected .pew-back{{fill:{INK}}}.pew.selected .seat-number{{fill:{PAPER}}}
        .pew:hover .pew-back,.pew:focus .pew-back{{stroke-width:3.2}}
        .altar-label{{fill:{INK};font-family:serif;letter-spacing:.12em}}
        .viewport-label{{fill:{INK};font-family:serif;letter-spacing:.18em}}
      </style>'''
    s=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="黑线米白结构草图：教堂中殿中央通道与两列长凳席位" data-format="{'mobile' if mobile else 'desktop'}">
      <rect width="{w}" height="{h}" fill="{PAPER}"/>{style}
      <g class="arch">{roof}</g>
      <g class="structure">{walls}</g>
      <g class="arch">{far}</g>
      {text}
      <g class="aisle">{floor}</g>
      <g class="pew-layer">{''.join(pews)}</g>
      <text x="{cx}" y="{h-18}" font-size="{9 if mobile else 12}" text-anchor="middle" class="viewport-label">中 央 通 道 · NAVE</text>
      </svg>'''
    return s

for mode in ['desktop','mobile']:
    (ROOT/f'pews-{mode}.svg').write_text(svg(mobile=mode=='mobile'),encoding='utf-8')
print('SVG written')