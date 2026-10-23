# P3 彩窗 · 整体构图研究（2026-10-23，待夕里审）

对比总图：`P3彩窗-整体构图对比.jpg`。速写在 `sketch-{A,B,C}-{web,mobile}.png`（底图是夕里 Figma 459:2 线稿，只加纯黑、纸白两种值，没有灰色排线）。截图在 `crops/`，参考图在 `refs/`，生成脚本在 `tools/`（`sketch.py`、`compose.py`）。
**v2 原型里程序生成的排线/串珠装饰层（`web-prototypes/p3-stained-glass-v2-2026-10-23/assets/ornament-*.png`）= 待替换。** 夕里的批评是对的：那一层只是“加灰”，在玩填色游戏，没有设计整体。本研究暂不做新原型。

## ① 莫里斯彩窗：仓库里原来写了什么（GPT / 前几轮）
- `CURRENT_STATE.md:25`：「[Figma 02｜REVIEW · P3 莫里斯彩窗五联 Web＋Mobile](…node-id=439-2)：**待审结构实验，不是当前 P3 正式基线**。用哥特彩窗五个竖向画幅、顶部星星、专题主图和底部题签验证新的空间构图……白底黑线 SVG 矢量结构，不使用图像生成替代线稿。」（Figma 页名本身就叫“莫里斯彩窗五联”）
- `产品决策/2026-10-23-视觉总监-整站推进方案.md:97`：「④Morris & Co./Burne-Jones 多联窗“一格一像”的做法正好对应“一格一专题”（Huntington Deborah; Huldah; Judith）。」
- `Claude原始对话/Claude网页_项目起源_用户保存原文.md:9605–9611`：写的是莫里斯与伯恩-琼斯的凯尔姆斯科特版《乔叟作品集》（“口袋里的大教堂”），讲的是书，不是彩窗。
- `参考库/…/2026-10-21-P3-P4-画风与收藏空间/README.md`：只有 Jessie M. King 为莫里斯诗集画的插画，没有莫里斯彩窗本身。
→ 结论：之前只借用了“一格一像”这一句，**没有人研究过莫里斯彩窗究竟为什么好看**。下面补上。

## ② 莫里斯彩窗除了颜色还靠什么（有出处）
1. **一格一像，人物撑满竖格，而且越出边框。** Jesus College 的记录：Pugin 与莫里斯的规则是“每一格的题材自成一体”（[Jesus College · Stained glass](https://www.jesus.cam.ac.uk/chapel-and-choir/about-chapel/artworks-chapel/stained-glass)）。伯恩-琼斯为 Daniel 画的稿（1873，`refs/burne-jones-daniel-cartoon-1873.jpg`）里，人物占满尖头格，翅膀和光环压过外框。
2. **铅线就是素描。** 同一张稿里，外轮廓是粗而连续的深线（将来就是铅条），衣纹则是细线，只画在衣褶转折处，脸和手几乎不画——形成“粗包细”的两级线宽。
3. **图案地（quarry / 枝叶地）与安静的人物形成对比。** V&A 藏的 Elaine 镶板：“背景是交替排列百合与罂粟的菱形小格（quarries），左右两侧是窄的郁金香边”（[V&A O8556](https://collections.vam.ac.uk/item/O8556/elaine-panel-burne-jones-edward/)）。Nun Monkton 东窗用葡萄藤与犬蔷薇交织，在高窄的尖格里围出一串椭圆框，把人物框住（[Routledge Companion to William Morris · The Later Years](https://ebrary.net/267927/education/years)）。图案由莫里斯本人补画：伯恩-琼斯在稿上写“put millions of flowers here”（[V&A Blog · Stained Glass on Paper](https://www.vam.ac.uk/blog/caring-for-our-collections/stained-glass-on-paper-morris-co-and-the-pre-raphaelites)）。
4. **重复人物形成节奏，图稿可以复用。** 稿子编入目录，换地方重新组合（V&A Blog 同上）。Brampton 东窗是天使、牧者、圣徒按格排列（[eb-j.org 目录](https://www.eb-j.org/articles-thesis-detail/Mjg0)；[National Churches Trust · St Martin Brampton](https://www.nationalchurchestrust.org/church/st-martin-brampton)）。
5. **卷轴与题字带。** Brampton 东窗有四个 “Angel with Scroll”（eb-j.org 同上）；Christ Church 的 St Frideswide 窗在树上挂着写有 “Arbor scientiae” 的卷轴（[eb-j.org · St Frideswide](https://www.eb-j.org/browse-artwork-detail/MjI1NDQ=)）。
6. **疏密节制。** 同一篇文献指出，高窄的格子“让莫里斯的枝叶有呼吸”，太满就显得挤；St Frideswide 窗也被批评小格里人物过挤（Routledge；eb-j.org 同上）。
7. **银染与单色绘线。** Over Stowey 一例中，衣袍用银染、绿色靠不同的锅色玻璃区分（Routledge 同上）。换到双色里，就是“同一墨色、线的密度不同”。

## ③ 对照诊断：v2 缺什么，怎么用两色版画补
| 缺的东西 | 双色转译 |
|---|---|
| 窗格里没有“像”，只有贴进去的彩色名画 | 每格一个用线画的题材形象（人物或器物），粗外轮廓加细衣纹，可以越过尖拱头；封面图移到题签或第二层 |
| 没有图案地 | 竖格底部（或整格）用莫里斯式的小格 / 藤蔓地：**只用线，留大量白**，围住人物；格与格之间节奏一致 |
| 线没有“铅线逻辑” | 外框与轮廓统一用粗线，内部一律用细线，与夕里线稿的粗细层级对齐；禁止灰色排线铺面 |
| 没有卷轴 / 题字带 | 题签改成卷轴带（专题名），与 P1 的 PLATE 标签同族 |
| 没有明暗焦点 | 黑只用在一两处：玫瑰窗（星）或玻璃底（方向 C） |

## ④ P1 / P2 为什么好看（量化 + 截图 `crops/`）
- **P1 约 80% 纸白、约 12% 黑；黑几乎全部集中在右侧一块（长袍）。** 分十列统计黑占比：左起 3%→4%→4%→5%→10%→12%→16%→**39%**→23%→7%，焦点偏右，左边留给标题。
- **唯一的密集装饰是沿袍边走的星形花带**（`p1-robe-border.png`）：装饰跟着结构的边走，不铺满。
- 神龛、建筑都是细线空心（`p1-shrine.png`）。玻璃是白的，只靠线的疏密：越往画面边缘竖线越密，中央越疏。
- 地面用同心圆与透视细线托住焦点（`p1-floor-circles.png`）——圆形母题先在这里出现。
- **P2 整体反相**：约 95% 是黑夜，奶油细线画楼梯和水面（`p2-stair-night.png`）；星落在水里。
- 共同规律：**大面积单值（纸或夜）+ 一块有意的反值 + 只沿结构边走的纹样**，加上对称或明确的偏心焦点。

## ⑤ 三个方向（只排明度，不排灰）
- **A 留白一点黑**：整窗保持纸白，只有玫瑰窗心是黑的，奶油色的星在黑里，窗台一条黑带。对应 P1“几乎全白 + 一块黑”的配比，星把 P2 的那一小块夜带进白天。风险：五格只有彩色封面在发声，容易显得空、显得“没设计”。
- **B 穆夏光轮**：玫瑰窗黑底，放出奶油色射线（Le Pater 光从焦点放射，Clarke 轴线光轮）；只在中轴上方拱肩用细墨放射线延续光芒，两侧完全留白。装饰集中在轴线上，秩序清楚。风险：射线细、读起来轻，手机上更弱。
- **C 夜玻璃（推荐作为明度骨架）**：所有玻璃开口纯黑，石作窗棂保持纸白，相当于把 P2 的夜关进窗里，从 P2 进来时是连续的；封面像被点亮的窗格，星在黑窗心里是奶油色。最像 Clarke 与莫里斯的“铅线即素描”（白色窗棂就是粗线）。风险：黑的面积大，必须靠 ③ 的内容（白线人物、白线图案地、卷轴）填出层次，否则只是黑块；外拱券那条宽带在速写里也被填黑了，正式稿应留白。

## 建议
以 **C 的明度骨架 + 莫里斯式内容**为下一步：每格黑玻璃里一个奶油线绘题材形象（粗轮廓、细衣纹）、留白充足的线绘图案地、卷轴题签；玫瑰窗保留 B 的小光轮做唯一焦点。美术需手绘（夕里或插画师在 Figma 画），我只负责结构、明度和动效；请夕里先选方向。

## 参考来源与授权（refs/）
- `burne-jones-daniel-cartoon-1873.jpg` — Edward Burne-Jones, *Daniel* 彩窗稿, 1873, 公有领域, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Edward_Burne-Jones_Daniel_1873.jpg)
- `burne-jones-last-judgement-design-1874.jpg` — Burne-Jones, *The Last Judgement* 设计稿, 1874, Birmingham Museums, 公有领域, [Commons](https://commons.wikimedia.org/wiki/File:The_Last_Judgement_by_E._Burne-Jones_(design,_1874,_Birmingham).jpg)
- `mucha-le-pater-01.jpg`、`mucha-le-pater-03.jpg`、`mucha-le-pater-gravure-001.jpg`、`mucha-le-pater-gravure-004.jpg` — Alphonse Mucha, *Le Pater*, 1899, 公有领域, [Commons 分类](https://commons.wikimedia.org/wiki/Category:Le_Pater_by_Alfons_Mucha)；背景见 [Mucha Foundation](https://muchafoundation.org/en/gallery/themes/theme/le-pater)
- `violletleduc-rosace-XIIIe.png` — Viollet-le-Duc, *Dictionnaire raisonné*, 1856, 公有领域, [Commons](https://commons.wikimedia.org/wiki/File:Rosace.XIIIe.siecle.png)；文字见 [Wikisource · Rose](https://fr.wikisource.org/wiki/Dictionnaire_raisonn%C3%A9_de_l%E2%80%99architecture_fran%C3%A7aise_du_XIe_au_XVIe_si%C3%A8cle/Rose)
- Harry Clarke《浮士德》：沿用仓库已有的 `参考库/产品参考库/2026-10-21-P3-P4-画风与收藏空间/images/clarke-faust-opening.jpg`
- 仅链接、未下载（CC BY-SA 照片）：[Brampton 东窗照片](https://commons.wikimedia.org/wiki/File:Brampton,_St._Martin%27s_Church,_East_window_by_Morris_and_Burne-Jones_(1878-80)_-_geograph.org.uk_-_7602234.jpg)
