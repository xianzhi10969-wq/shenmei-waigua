> **已被取代（2026-10-23）**：夕里审阅后认为 v1 只是占位。新版本见 `../p3-stained-glass-v2-2026-10-23/`（用夕里 Figma 459:2 的线稿原图 + 飞书真实数据）。本目录保留未删，仅供对照。

# P3 彩窗 v1（2026-10-23）· 待夕里审，不是基线

这是 P3 一级专题入口的一个**提案原型**。它没有替换任何东西：P1→P2 仍以 v4 为准，P3/P4 的受保护基线仍是 `../p3-p4-restored-v9-2026-10-21/`。本目录只新增文件，没有修改 v4、v9、Figma 或任何原始素材。

结构完全以夕里提供的线稿底层为准（`视觉研究/P3彩窗/2026-10-22-线稿底层-web-mobile.png`，原图在 `/workspace/out/P3_彩窗_线稿底层_web_mobile_夕里提供.png`）：网页版是一座尖拱、五个窗格（中间更宽）、顶部玫瑰窗放星、两组成对小拱里各一个四叶圆窗、玫瑰窗两侧各一个小四叶，每个窗格下面是封面和题签；手机版是中间一整格加两侧各半格，玫瑰窗放星。

## 先看哪里

打开页面一直往下滚：v4 的星 B 先像原来一样落到 P2 水面，然后夜色从水面线退开，水面线就是彩窗的窗台线，窗花从窗台往上一根根画出来，星沿着中轴升进玫瑰窗中心，最后中间的窗格先亮，再向两侧依次亮起，题签随后显出。往回滚，每一步都会原路倒放。

## 怎么运行

```bash
cd web-prototypes/p3-stained-glass-v1-2026-10-23
python3 -m http.server 8765
# 浏览器打开 http://localhost:8765/index.html
```

- 宽度 ≥ 900px 时是桌面链路：完全按 v4 的方式显示 P1、P2（素材是 `assets/v4/` 下的副本，载入显影时间和星 B 坠落公式与 v4 相同），接着是 P3。
- 宽度 < 900px 时是手机链路：P1、P2 用 Figma 306:2 手机列导出的静态图（`assets/m_p1.png`、`assets/m_p2_nostar.png`），P2 画上的那颗水面星已在副本里抹掉，由页面里会动的星接管。手机上 P1→P2 没有坠星动效，因为 v4 只有桌面版。
- 网址参数：`?cover=orig` 把封面换回 v9 的原色图（只用于对照，违反双色规则）；`?slots=1` 显示装饰位占位框；`?p3only=1` 跳过 P1/P2。
- 预览视频：`preview_desktop.mp4`（1440×900）和 `preview_mobile.mp4`（390×844）。它们是逐帧滚动录出来的，代表理想效果，真机流畅度还要实测。

## 图层

每一层都是独立文件，页面在构建时把它们内联进 `index.html`（这样才能逐线描出来）。重新生成：`python3 tools/make_assets.py && python3 tools/build_layers.py && python3 tools/build_page.py`。

| 层 | 文件 | 内容和状态 |
|---|---|---|
| 01 结构窗花 | `layers/{web,mobile}/01-tracery.svg` | 照夕里线稿用圆规作图法重画的矢量骨架：两心尖拱、三叶尖拱窗头、四叶圆窗、玫瑰窗、竖棂、窗台。只是结构，不是美术。 |
| 02 装饰位 | `layers/{web,mobile}/02-ornament-slots.svg` | **只有占位框，没有画装饰。** A 拱肩、B 玫瑰窗外环、C 拱心、D 窗台饰带。这些要按穆夏式的方法逐件画、逐件审，不能用 SVG 或算法排线冒充。 |
| 03 专题封面 | `layers/{web,mobile}/03-covers.svg` + `assets/covers/` | v9 的真实封面（留白、忧郁、爱欲、田园、幽玄）。原图复制在 `assets/covers/orig/`，没有改动。页面默认显示的是派生出来的双色横线网版本（见“已知问题”）。 |
| 04 题签 | `layers/{web,mobile}/04-cartouche.svg` + 页面里的文字 | 四角内凹的题签框，字体沿用 v9 的 `cabinet-song.ttf`。文字是临时试排。 |
| 05 星 | `layers/{web,mobile}/05-star.svg`、`layers/star-B-ink.svg`、`layers/star-B-cream.svg` | 就是 v4 的星 B（`star-svg/B_ink.svg` 的同一几何），只把颜色统一成两种颜色。玫瑰窗里的星和从 P2 落下来的星是同一颗。 |
| 06 P2 水面衔接 | `assets/junction-water-desk.png`、`assets/junction-water-mob.png` | 从 v4 的 `p2_nostar.png`（和手机 P2 副本）左侧裁下的水纹，镜像补宽，再映射成两种颜色。没有新画水。 |

## 双色与线重

- 页面上用到的颜色只有 `#F6F3ED` 和 `#1E1E1E`；没有金色、做旧、颗粒、阴影或渐变。线条边缘的抗锯齿和星在交叉淡化那一瞬间会出现中间灰，这是渲染造成的，不是设计用色。
- 线重按 P1 实测：v4 `shrine.png` 黑线横向游程最常见是 2px，其次 3px 和 1px；v4 说明里星 B 是外轮廓 1.5、刻线 0.6（1 倍）。所以窗花用三级：外框 2.4px、主结构 1.5px、内线 1.0px（屏幕像素，不随缩放变粗）。并排对照图：`checks/compare-P1shrine-vs-P3window-1x.png`。

## 动效（全部跟着滚动，可倒放）

P3 是一个 380vh 的段落，里面的舞台固定在屏幕上，进度 q 从 0 到 1：

1. 星从 P2 水面（v4 终点，中心 382,1448）滑到舞台中轴的水面线上，仍然是米色。
2. q 0.08–0.30：夜色从水面线往上退，水面往下沉；星在 q 0.10–0.18 从米色变成墨色（沿用 v4 穿过分界时的交叉淡化做法）。
3. q 0.16–0.62：窗花从窗台开始，自下而上逐根描出（stroke-dashoffset，pathLength=1）。
4. q 0.28–0.66：星沿中轴升进玫瑰窗中心，停在那里。
5. q 0.58–0.84：中间窗格的封面先自下而上亮出来，再向两侧依次亮起；q 0.70–0.90 题签文字随后显出。
6. 交互：桌面上鼠标悬停或键盘聚焦一个窗格，这个窗格加一圈粗线，题签反白成墨底米字，全程不出现第三种颜色。手机上可以左右滑、点两侧半格或按 ‹ ›（44px 触控区）换专题，点中间一格切换高亮。点击还不会进入 P4，因为 P4 没有接进这个原型。
7. `prefers-reduced-motion: reduce`：不固定舞台，所有线条和封面直接完整显示；星按 v4 的规则留在神龛，玫瑰窗里显示一颗静止的星。

## 避开了哪些失败记录

依据 `/workspace/out/failure_rules.md`、`视觉研究/2026-10-21-P1黑白线描主视觉-从失败到候选图的全流程复盘.md`、v9 README 的回退说明和 `web-prototypes/home-p1-p4-2026-10-20/p1-p2/DEPRECATED.md`：

- **F5 / 复盘 §07（用 SVG、CSS、算法排线冒充绘画）**：SVG 只画窗框、尖拱、窗花和星的几何外形；所有装饰位都留成空的占位框，没有画任何花纹或排线。封面的线网处理是算法做的，所以只当作临时的颜色处理，并单独列为待定变量。
- **F11（v10“喧宾夺主”）**：彩窗只是入口。默认没有任何装饰，窗框只用细线，视觉重量留给封面；大面积留白。也是单独目录，没有覆盖 v9。
- **F3 / 复盘 §06（处处一样密）**：密度分三级：窗外几乎不画，窗花中等，封面最密。
- **F2（照搬对标物件）**：没有借用 Emergence 的八角星、珠链或祭坛器物；星是项目自己的星 B。
- **F6、F8（不锁图层、默认回退字体）**：v4 的图层、星 B 几何和 v9 的题签字体都按原样复用，只换了颜色。
- **F12（误信旧文件）**：P1→P2 只以 v4 为依据，没有用 `home-p1-p4-2026-10-20` 的旧落星检查点。
- **F13（把结构稿当成品）**：这个原型整体都是结构加动效校样，README 和页面角落都标着“待夕里审”。
- **F15（手机直接缩小桌面）**：手机版是单独的三格取景，有自己的几何和横滑交互。
- AGENTS.md 的“结构草图优先”：窗花是从夕里已经给出的线稿底层重画的，没有调用任何生图模型。

## 每个设计决定的依据

- **尖拱和窗头的作图法**：两心尖拱的圆心放在起拱线上，r 大于半跨时比等边拱更钝、比半圆更尖；本稿外拱 r = 1.3×半跨，窗格头 r = 1.5×半跨（手机 1.25），以接近夕里线稿的比例。来源：Viollet-le-Duc 的尖拱分类 https://textbookofarchitecture.com/rule/arch-families ；《Guide to the construction of Gothic details》第 1–2 图版 https://archive.org/details/guidetoconstruct00rose_0 ；Weston 的哥特几何讲义 http://westongeometry.pbworks.com/w/file/fetch/62270876/TIPSTRICKS.pdf 。
- **四叶、三叶和尖角（cusp）**：叶形是圆内相切又互相相交的小圆，相交点就是尖角。来源：Rose Window Maker https://evoluteur.github.io/rose-window-maker/ ；Archistory《Reading the Geometry of Gothic Church Windows》https://archistory.co.uk/post-reading-the-geometry-of-gothic-church-windows.html （其中也说明早期英式窗常把尖窗按二、三、五个成组，以一个窗格宽度为模数推出其他尺寸）。
- **装饰要按穆夏的方法逐件画，而不是现在用代码画**：穆夏 1902 年的《Documents décoratifs》有 72 幅图版，涵盖饰带、彩窗（vitraux）等，图版之前有单独的线稿。来源：V&A https://collections.vam.ac.uk/item/O1725969/documents-decoratifs-book-alphonse-mucha/ ；Gallica 全本 http://gallica.bnf.fr/ark:/12148/bd6t538939550 ；Mucha Foundation 第 33 图版线稿 https://www.muchafoundation.org/en/gallery/browse-works/object/106 ；Sainsbury Centre 的预备草图说明 https://sainsburycentre.ac.uk/art-and-objects/21011-preparatory-sketch-for-documents-decoratifs/ 。
- **彩窗可以用黑白线刻来表现**：1857 年 Decloux 与 Doury 的《Sainte-Chapelle》图录里，彩窗用彩色石印，而平面、剖面和外观用黑白线刻，说明同一座建筑可以只用线来画。来源：Huntington https://www.huntington.org/collections/lib-657073 ；Royal Academy https://www.royalacademy.org.uk/art-artists/book/histoire-archeologique-descriptive-et-graphique-de-la-sainte-chapelle-du 。（这正好也说明，用黑白表现彩窗里的“画面”还没有现成答案，封面处理需要单独研究。）
- **随滚动描线**：用 stroke-dasharray/dashoffset 按滚动进度描线，并用 pathLength=1 省去测量路径长度。来源：CSS-Tricks《Scroll Drawing》https://css-tricks.com/scroll-drawing/ ；CSS-Tricks《A Trick That Makes Drawing SVG Lines Way Easier》https://css-tricks.com/a-trick-that-makes-drawing-svg-lines-way-easier/ ；固定舞台加滚动进度的写法 https://salivity.github.io/svg/article/how-to-sync-svg-animations-with-page-scroll 。
- **水面线等于窗台线、星是同一颗**：按整站方案 S4（`产品决策/2026-10-23-视觉总监-整站推进方案.md`，它引用了 graphic match cut 和共享元素过渡的资料）。
- **手机三格取景、44px 触控区、减少动态效果**：按整站方案 S13/S14 及其引用的 W3C 与 MDN 资料。这几条我这次没有重新打开原文，标为**待核验**。

## 自测截图（`checks/`）

桌面 1440×900：`desktop-a-v4end`（v4 终点，星在 P2 水面）、`desktop-b-p2to-p3-half`（P2 滚出、舞台进入）、`desktop-q000`（水面线和星）、`desktop-q020`（夜退）、`desktop-q045`（窗花描出、星上升）、`desktop-q070`（中窗先亮）、`desktop-q100`（完成）、`desktop-hover-center`（悬停）、`desktop-reduced-motion`。
手机 390×844（2 倍图）：`mobile-a-v4end`、`mobile-b-p2to-p3-half`、`mobile-q000` 到 `mobile-q100`、`mobile-next`（换到下一个专题）。
截图和录像脚本：`tools/shoot.py`、`tools/rec.py`。

## 已知问题（如实列出）

1. **封面还没有真正解决。** 双色线网版是算法把彩色名画转成横线，看起来更像扫描线，不像铜版画，“留白”那张绢本的纹理尤其碎。它只是为了守住两种颜色的临时办法，正好落在 F5 那类风险附近。真正的答案可能是逐张手绘线描题图，或者夕里决定封面这一层允许保留原色，这需要夕里来定。可以用 `?cover=orig` 对照原色。
2. **装饰层是空的**，现在的窗只有骨架，比 P1 神龛那种有手感的线描“硬”和“干”。这是有意不去冒充美术，下一步要逐件绘制。
3. **P2 和 P3 接缝有色差。** v4 的 P2 底色实测是 (20,25,30)，也就是 #14191E，不在双色规则里；P3 严格用 #1E1E1E，所以两屏交界处能看出一条很淡的色阶。要么以后把 P2 也统一成 #1E1E1E（会动到已认可的 v4），要么允许这一处例外，需要夕里决定。
4. 星 B 的颜色从 v4 的 #1a1815/#eee5d0 统一成了 #1E1E1E/#F6F3ED，几何和尺寸完全不变；交接处只差在色值上。
5. 手机 P1/P2 是 Figma 导出的静态图（1 倍放大到 2 倍，近看偏软），没有 v4 的显影和坠星；手机 P2 抹星只是填了底色，原画星下方的倒影短线还在。
6. 窗花是规整的几何，和夕里手绘线稿相比，拱肩那几条交叉大弧线没有画（我觉得它们太密，会喧宾夺主），玫瑰窗的内部叶形也做了简化。是否补上要请夕里看。
7. 窗口在 1440×900 下大约 670px 宽，留白很多，但每个封面也比较小，五个窗格的题签拉丁字很小。
8. 星在 P2 原来的倒影短线上滑走后，那几条短线在 P2 里仍然留着；星从水面滑到中轴这一段在视频里会掠过一大片纯黑。
9. 手机横滑和点击都是直接换图，没有过渡动画；P4 没有接。
10. 只在无头 Chrome 里测过，没有在真机 Safari 上测；`pathLength` 在旧版 Safari 上的支持据 CSS-Tricks 当年记载曾有问题，**待核验**。
