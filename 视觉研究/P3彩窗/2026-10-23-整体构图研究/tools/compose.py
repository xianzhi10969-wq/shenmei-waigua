from PIL import Image, ImageDraw, ImageFont
def font(s):
    for f in ['/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc','/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc']:
        try: return ImageFont.truetype(f,s)
        except Exception: pass
fT,fS=font(40),font(24); W=2400; INK=(30,30,30); PAP=(246,243,237)
def row(paths,h):
    ims=[Image.open(p).convert('RGB') for p in paths]; ims=[i.resize((max(1,int(i.width*h/i.height)),h)) for i in ims]
    tw=sum(i.width for i in ims)+16*(len(ims)-1); s=min(1,(W-80)/tw)
    ims=[i.resize((int(i.width*s),int(i.height*s))) for i in ims]
    r=Image.new('RGB',(W,int(h*s)),PAP); x=40
    for i in ims: r.paste(i,(x,0)); x+=i.width+16
    return r
B=[]
def title(t,sub=''):
    r=Image.new('RGB',(W,110 if sub else 70),PAP); d=ImageDraw.Draw(r); d.text((40,14),t,font=fT,fill=INK)
    if sub: d.text((40,66),sub,font=fS,fill=INK)
    B.append(r)
title('P3 彩窗 · 整体构图研究（2026-10-23，待夕里审）','只用纯黑 / 纸白排明度；不用灰排线。v2 程序装饰层 = 待替换。')
title('① Morris & Co. / Burne-Jones 参照（除颜色以外）','粗铅线即轮廓 + 细线画衣纹；一格一像；人物越出框；背景是图案地（quarry / 枝叶），脸与手留空')
B.append(row(['refs/burne-jones-daniel-cartoon-1873.jpg','refs/burne-jones-last-judgement-design-1874.jpg'],620))
title('② P1 / P2 为什么好看','P1：约 80% 纸白、12% 黑，黑集中在右侧长袍一块；装饰只沿袍边走。P2：反相 95% 黑，奶油细线画结构。')
B.append(row(['crops/p1p2-overview.png','crops/p1-robe-border.png','crops/p1-shrine.png','crops/p1-floor-circles.png','crops/p2-stair-night.png'],520))
title('③ 版画 / 穆夏 / Clarke 参照','Le Pater：装饰集中在边框、正文留白；光从焦点放射。Viollet-le-Duc：石作只用双线，几乎全白。Clarke：大块黑 + 轴线放射光轮')
B.append(row(['refs/mucha-le-pater-01.jpg','refs/mucha-le-pater-gravure-001.jpg','refs/mucha-le-pater-gravure-004.jpg','refs/violletleduc-rosace-XIIIe.png','../../../参考库/产品参考库/2026-10-21-P3-P4-画风与收藏空间/images/clarke-faust-opening.jpg'],520))
title('④ 三个构图方向（桌面，速写）','A 留白一点黑　　　　　　　　　　B 穆夏光轮　　　　　　　　　　　　C 夜玻璃（推荐，需配人物 / 图案地）')
B.append(row(['sketch-A-web.png','sketch-B-web.png','sketch-C-web.png'],900))
title('⑤ 手机裁切（同 A / B / C）')
B.append(row(['sketch-A-mobile.png','sketch-B-mobile.png','sketch-C-mobile.png'],900))
H=sum(b.height for b in B)+20*len(B); out=Image.new('RGB',(W,H),PAP); y=0
for b in B: out.paste(b,(0,y)); y+=b.height+20
out.save('P3彩窗-整体构图对比.jpg',quality=88); print(out.size); out.resize((W//3,H//3)).save('/tmp/cmp2.jpg')
