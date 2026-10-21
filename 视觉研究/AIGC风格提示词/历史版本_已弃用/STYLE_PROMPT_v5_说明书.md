> ⚠️ 已弃用（DEPRECATED）：这是规定元素版说明书，已被 ../README.md 与 v7 取代。

# 审美外挂 · 画风说明书（P1 / P2 线稿风格）

## 这份说明是怎么来的
我没有直接写一段“请参考 P1 的风格”就交给你，而是把自己当成“差生”考了 5 轮：每一轮用这份说明去生成门、灯、蜡烛、窗户和一整页 P3 那样的场景，再和 P1、P2 放在一起对比，哪里不像就改哪一条规则。每轮的记录在 round1_log.md 到 round5_log.md，对比图在 sheet_r1.jpg 到 sheet_r5.jpg，最好的几张合在 sheet_BEST.jpg。

第一轮最大的问题是纸太黄、线条像铅笔素描、人物只是一个黑色剪影；第二轮修好了这些，但画面里到处飘着小闪光，物件又太简单像图标；第三轮细节够了，可蜡烛被装饰堆成了“蛋糕”，场景还变成了斜着的角度；第四轮加了“平视、轮廓修长、星星必须长在东西上”这几条以后，四张图第一次全部干净；第五轮又补上了“地上同心圆不能太大”和“全图不能有灰色”。

## 怎么用（很重要）
1. **一次只画一个东西。** 一扇门、一盏灯、一个人物，比一次画一整页稳定得多。整页场景可以画，但每次只放 1–2 个主体。
2. **构图写在最前面。** 把说明第一行方括号里的内容换成你要画的东西和位置，比如“一座哥特衣柜，放在画面右半边，左边 40% 留空白”。其余规则一字不改，整段粘贴。
3. **附参考图时要加一句话：** “参考图只用来参考画法（线条粗细、纸色、阴影多少、斗篷画法），不要照抄它的构图和物件。”不加这句的话，它会把 P1 的神龛和灯原样抄一遍。
4. **附参考图会让阴影变重一点。** 如果出来的图有灰色、排线太密，就直接重新生成，或者补一句“去掉所有灰色，只保留轮廓线”。
5. **英文版通常更稳。** GPT 两个版本都能看懂，但英文版的规则更容易被严格执行。中文版方便你自己看懂和修改。
6. **出图以后交给我统一。** 纸色、线条深浅这些小偏差，我可以用程序统一到 P1 的数值，再拆层放进 Figma。

## 可直接复制的英文版
```
[COMPOSITION FIRST — write your subject and layout here, e.g. "subject on the right third, left 40% empty paper for text"]
STYLE: Gothic Victorian ink line illustration, like a clean modern book plate.
VIEW: eye-level, frontal and symmetrical, or a gentle side perspective; horizon low; no dramatic angles, no top-down, no 3/4 hero shots.
PAPER: flat ivory-white paper, color #F6F3ED, perfectly flat, no texture, no yellowing, no parchment, no vignette.
LINES: crisp, uniform, near-vector ink lines in dark charcoal-black (#1E1E1E), thin (about 1–2 px at 1024 px), confident and continuous; no pencil feel, no sketchy strokes, no wood grain, no brick or stone-block lines, no engraving texture.
DETAIL: architectural-drawing detail in clean outline (mouldings, gothic tracery, slim pillars), but keep silhouettes slender and elegant; small objects get ornaments at only 2–3 points. Not a minimal icon, not over-decorated.
SHADING: almost none. No grey tones anywhere: dark openings/interiors are either solid black or left empty white. Only a few short fine parallel lines in the deepest recesses. Glass, stone, metal and wax stay white with outlines only.
BLACK: solid black on ONE element only (a figure's cloak, or one small opening). If there is a figure: side profile, pale face in fine lines, white inner robe visible, cloak solid black with very fine stipple, hood edge and hem bordered by a wide band of small white geometric lattice and eight-/four-pointed stars.
SIZE & SPACE: main subject fills about 50–65% of the image height and stays at least 8% away from every edge; overall 70–80% of the image is empty paper.
STARS: only elongated four-pointed stars (long vertical axis), and only attached to something — as finials on top of pillars or carved on objects. Keep stars small (no taller than about 1/10 of the object). Nothing floats in the air: no sparkles, no twinkles.
GROUND: polished stone floor of large square tiles in perspective, thin lines, at most 2–3 faint thin concentric ellipses around the main object's base (no wider than twice the object), a few short vertical reflection lines under objects. No water unless asked.
BACKGROUND: if any, even thinner, lighter lines than the subject.
MOOD: quiet, solemn, ceremonial. COLOR: only black ink on ivory (at most one tiny deep-red accent).
DO NOT: color, grey wash, gradients, watercolor, paper texture, grain, cross-hatching, heavy black backgrounds, thick outlines, wood grain, floating sparkles, comic/anime, 3D render, photo, text, frame, signature.
```

## 可直接复制的中文版
```
【构图写在最前面：先写画什么、放在哪，例如“主体放在画面右侧，左边 40% 留空白给文字”】
风格：哥特维多利亚风的墨线插画，像一张干净的现代书籍插页。
视角：平视，正面对称，或者轻微的侧面透视；地平线偏低；不要夸张角度，不要俯视，不要 3/4 侧身的英雄镜头。
纸张：平整的象牙白纸，色值 #F6F3ED，完全平整，没有纹理，不发黄，不要羊皮纸感，四周不要暗角。
线条：利落、均匀、接近矢量的墨线，颜色是深炭黑（#1E1E1E），很细（1024 像素宽的图里大约 1–2 像素），一笔到底；不要铅笔感，不要草稿线，不要木纹，不要砖缝或石块线，不要版画式排线。
细节：像建筑图那样用干净的轮廓线画出线脚、哥特窗花、细柱子，但整体轮廓要修长优雅；小物件只在 2–3 个位置加装饰。既不要简笔图标，也不要堆满装饰。
阴影：几乎没有。全图不要任何灰色调：深色的开口或内部要么涂成纯黑，要么留白。只在最深的凹处画几笔很短的细平行线。玻璃、石头、金属、蜡烛都保持白色，只画轮廓。
黑色：整张图只允许一个元素用实心黑（人物的斗篷，或者一个小开口）。如果有人物：侧脸，脸部用细线画、肤色留白，露出白色内袍，斗篷是实心黑带极细的点状质感，兜帽边缘和下摆有一圈较宽的白色几何格纹和星形花边。
大小与留白：主体占画面高度的 50–65%，离每条边至少 8%；整张图 70–80% 是空白纸面。
星星：只用竖向拉长的四角星，而且必须长在东西上，比如柱顶的尖饰或物件上的雕花。星星要小，不超过物体高度的十分之一。空中不能飘任何东西：不要闪光点，不要亮晶晶。
地面：大方砖铺的抛光石地面，透视线很细；物体底座周围最多 2–3 圈很淡的细同心椭圆（直径不超过物体宽度的两倍）；物体正下方几道短短的竖向倒影线。除非特别要求，不要画水。
背景：如果有，用比主体更细、更淡的线。
氛围：安静、庄严、有仪式感。颜色：只有象牙白纸上的黑墨（最多一个很小的深红点缀）。
不要：彩色、灰色淡彩、渐变、水彩、纸张纹理、颗粒、交叉排线、大面积黑背景、粗轮廓线、木纹、漂浮的闪光、漫画或动漫风、3D 渲染、照片感、文字、边框、签名。
```
