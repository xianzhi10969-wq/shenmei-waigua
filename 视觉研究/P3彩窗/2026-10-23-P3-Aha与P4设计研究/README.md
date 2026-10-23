# P3 Aha moment × P4 图录设计研究｜2026-10-23

> **状态：研究提案，待夕里审。** 不覆盖 v4 / v9 / 彩窗 v3 代码；**不与 GPT 的 P2→P3 接缝／窗框线质任务重复**（见 `产品决策/2026-10-23-交接GPT-P2改动与禁忌.md`）。
>
> 范围只做两件事：**(A) 让人已经站在彩窗里时，仍有 aha**；**(B) 彩窗定了之后，P4（C 方案）怎么设计**。

---

## 0. 仓库里已经定了什么（只读事实）

| 项 | 事实 | 出处 |
|---|---|---|
| P3 方向 | 莫里斯彩窗五联；彩色飞书封面 + 白石框 + 夜玻璃 + 卷轴；24 一级专题条带，每次卡一格 | `web-prototypes/p3-stained-glass-v3-2026-10-23/`；`CURRENT_STATE.md` |
| P3 审美 | 夕里认可「好看」；缺完整拱顶／玫瑰／星与干净线质 → **交给 GPT**，本文件不写接缝方案 | 对话 10/23；交接 GPT |
| P3→P4 基线 | v9「柜门放下 → 书桌 → 书册」受保护；不可覆盖 | `web-prototypes/p3-p4-restored-v9-2026-10-21/MOTION-NOTES.md` |
| P4 产品 | **C 方案**：默认展示 P3 当前专题的细分风格；可在 P4 切换整个专题图录；可深链到 V3 词条 | `CURRENT_STATE.md`「产品信息架构」 |
| P4 现状缺口 | 书册美术 `book-desktop-approved-v1.png` 已有；文字临时；**真实 24 专题／词条数据未接**；彩窗版尚无「窗→书」转场 | `FOLIO-CONTENT-STUDY.md`；整站推进方案 S6–S7 |
| 失败账本相关 | 「像 PPT／没 Aha」= 先摆零件没定世界（F1）；P3 喧宾夺主被回退（F11）；入口页不抢戏 | `产品决策/2026-10-23-视觉总监-整站推进方案.md` |

**本文件刻意不写：** P2 水面→窗台刻线、拱顶补全、窗框线宽净化——那些是 GPT 窗口的活。

---

## 1. 诊断：现在的 v3 窗为什么「好看」但还不够 aha

对照仓库里对 Aha 的定义（P1 显影成功＝**世界命题先成立，再有零件**；失败＝像信息板），v3 现状是：

| 已成立 | 仍缺的「顿悟」 |
|---|---|
| 五联取景框 + 彩色封面，专题世界一眼能认 | **进入仪式**：人从滚动世界「到达」窗前时，窗本身几乎不「醒来」——封面已经亮着，没有「透光」那一下 |
| 24 题一格一格滑，中心题签可读 | **选择仪式**：中心格与侧格差异主要是裁切与题名，缺少「这扇玻璃正在被注视」的反馈 |
| 玫瑰窗／星在结构里存在（线稿／02 REVIEW） | 当前 v3 合成里拱顶被裁／星弱 → GPT 修；但即使补上，**星与中心格之间仍无叙事挂钩**（点选专题时星不回应） |
| 卷轴题签 | 只有中／英名，没有飞书「钩子」一句；信息缺口打不开好奇心 |

一句话：**v3 已经是一扇漂亮的橱窗，还不是一次「抬眼看见光」的体验。** Chartres 官网自己写的访客反应是：走进去、抬头、接受在船舱里走动时的 *wow*——关键是**光穿过玻璃之后，灰暗外壳才变成故事**（见下 §2.1）。我们现在把彩色封面一开始就摆满，等于跳过了「外壳→透光」这一拍。

对 v9 P4 的诊断（与彩窗并存时）：

| v9 已有 | C 方案还缺 |
|---|---|
| 柜→桌→书的机械叙事清楚 | 彩窗版没有对等的「打开」；若硬接柜体叙事会和彩窗世界观打架 |
| 空白双页书册插画已批准 | 页内仍是临时标本；飞书词条／案例未只读灌入 |
| 桌面双页／手机翻页控制器在 | **专题切换器**（在书内换整章）未设计；深链到 V3 未做 |
| 六专题演示 | 24 章 × 章内词条的信息架构未接线 |

---

## 2. 外部参考（本轮真实打开／检索；只借方法，不借物件轮廓）

### 2.1 彩窗／教堂：透光 = aha

1. **Chartres 大教堂彩窗页**  
   https://www.cathedrale-chartres.org/en/cathedrale/monument/the-stained-glass-windows/  
   原文类比：玻璃从外面看灰暗，**光穿过之后**才显出图像、故事、符号；访客的 thrill 来自「走进去、抬头」。交互动画让窗格**随滚动逐步上线**。  
   → 借：**先暗后透光**；滚动＝走进中殿，不是＝换幻灯片。

2. **York Minster Stained Glass Navigator**  
   https://stainedglass-navigator.yorkglazierstrust.org/  
   整窗 → 分格浏览 → 单 panel 深页（例：Great East Window / panel A2）。高分瓦片按需加载。  
   → 借：**窗是总图，格是入口，panel 是详情**——正好对应 P3（章）→ P4（词条图录）→ V3（词条页）。

3. **Gloucester Cathedral · East Window joystick interactive（Wide Sky）**  
   https://www.wide-sky.co.uk/portfolio/gloucester-cathedral/  
   从整窗无缝缩放到单格；兴趣点自动高亮 + 说明。  
   → 借：**缩放连续**比硬切页面更像「走进玻璃」。

4. **Winchester Cathedral · 访客自制彩窗上墙（DJW）**  
   https://djwillrich.com/winchester-cathedral  
   小屏设计 → 大拱形屏幕显示。  
   → 借：参与感；**我们不做 DIY 彩窗**（易喧宾夺主，违 F11），只记「小动作→大显现」的尺度差。

### 2.2 博物馆图录：主题入口 + 深链（P4 C 方案）

5. **V&A · Reimagining Explore the Collections（2025-06）**  
   https://www.vam.ac.uk/blog/digital/reimagining-the-vas-explore-the-collections-designing-a-more-inspiring-way-in  
   目标：强第一印象、开放探索、更深故事、线上线下桥。落地：编辑英雄区、**主题 scroller**、故事 carousel、物件卡、多路径并行（搜索／主题／故事／单件）。  
   → 借：P4 不要做成纯筛选器；**当前专题是默认英雄语境**，切换专题＝换一整间展厅。

6. **First Monday · 数字馆藏的 explore mode**  
   https://firstmonday.org/ojs/index.php/fm/article/download/6984/6090  
   探索四原则：view / movement / contextualization / participation。  
   → 借：P4 至少要有「看＋移动＋上下文」；参与（收藏）可后做。

7. **Rijksmuseum Collectie Online / Rijksstudio**  
   https://www.rijksmuseum.nl/en/about-collection-online · https://www.museumnext.com/article/inside-the-infinite-rijksmuseum-how-one-museum-is-rethinking-digital-collections/  
   主题／节点页可浏览；物件持久 ID 深链。  
   → 借：每个词条 URL 稳定，可从 P4 直达 V3。

8. **Hammer Collections（Cogapp）**  
   https://www.cogapp.com/work/hammer-online-collection  
   主搜索 + facet；可复制「当前筛选」以便分享。  
   → 借：P4「当前专题」状态应可分享／可深链（`?topic=eros` 一类），不是只活在滚动位置里。

### 2.3 纸面／版画语汇的滚动叙事（对齐我们的铜版世界）

9. **National Geographic × Hello Monday · Bear’s-Eye View**  
   https://www.hellomonday.com/work/nat-geo  
   铜版／铅笔编辑风；少帧手绘循环；单页滚动；**章节用插画开门**。仓库整站方案已引用。  
   → 借：aha 来自「媒介本身在说话」（刻线动起来），不是 UI 弹窗。

10. **Lumen Artspace · Heritage in Motion**  
    https://contra.com/p/M22qvsgv-lumen-artspace-heritage-in-motion-or-award-winning-website  
    安静博物馆动线；作品横流如记忆之河；克制动效，不抢画。  
    → 借：P3 横滑条带可以是「沿廊走过一排窗」，动效只服务注视，不服务炫技。

11. **Roman MTC 档案站（烛光光标揭开纸面）**  
    https://www.nikolozchachia.com/works/roman-mtc  
    欢迎门＝有意的第一击；光揭示纸面。  
    → 借：**第一击／第一束光**作为仪式（我们用透光，不用烛光光标——避免新道具违世界观）。

### 2.4 仓库内已有、可并读的先例笔记

- `产品决策/2026-10-23-视觉总监-整站推进方案.md` S5–S7（彩窗理由、窗→书、P4 校样）
- `视觉研究/P3彩窗/2026-10-23-整体构图研究/`（结构草图 A/B/C）
- `对标/notes/2025-01-04-饽饽君BOBO-分镜的电影感藏在看不见的地方.md`（graphic match，供 P3→P4 轮廓衔接，**不是** P2→P3）

---

## 3. P3｜三个 Aha 方向（互不依赖 GPT 接缝）

原则：每个方向只动**一个变量**；不重画封面；不改 24 题数据；不碰 v4。

### 方向 A ·「透光点亮」（强烈推荐先试）

- **命题**：彩窗的 aha＝光穿过铅线之后，灰玻璃变成故事（Chartres）。
- **做法**：条带停在某一格、或窗段滚入视口中线时，**仅中心格**从「夜玻璃＋低曝光封面」在 400–700ms 内升到正常彩色；侧格保持更暗一档。玫瑰窗可极轻同步亮一档（若 GPT 已补星；否则用现有占位星，不强求）。
- **刻意不做**：整窗同时闪；金色光晕；粒子。
- **验收**：缩到手机仍能感到「中心被点亮」；关动效（`prefers-reduced-motion`）则直接终态。
- **下一实验（唯一）**：在 `p3-stained-glass-v3` **另存**目录做 6 秒灰度／双色 animatic，**唯一变量＝中心格曝光曲线**；桌面＋手机各录一段。不改窗框线稿。

### 方向 B ·「格→故事钩子」

- **命题**：York 的 panel 深页证明——人选的是「这一格的故事」，不是「又一张封面」。
- **做法**：中心格聚焦后，卷轴除中／英名外，淡入飞书字段「钩子」或「一句定义」一行（只读 JSON）；侧格仍空白卷轴。点中心格＝预告将打开 P4（桌面 hover 预览，手机二次确认）。
- **刻意不做**：在窗上堆长文；侧格也写字（已证明会溢出）。
- **验收**：不看封面只看题签＋钩子，也能感到「这是可进入的世界」。
- **下一实验（唯一）**：静态合成一张：爱欲中心格＋钩子一行 vs 无钩子；夕里二选一。不动滑动逻辑。

### 方向 C ·「沿廊走过」的横滑仪式

- **命题**：Lumen 的「作品如河」＋ V&A 主题 scroller——横向不是轮播广告，是**走过一排窗**。
- **做法**：吸附动画带极短的视差（中心格 1.0、侧格 0.96 缩放或 2–3% 下沉）；松手后中心格做一次极轻的「铅线回弹」。星／玫瑰窗**不**随条带平移（v3 已如此，保持）。
- **刻意不做**：3D 翻转；每格进场特效堆叠。
- **验收**：闭眼只听／只感节奏，能数出「一格一格」；不眩。
- **下一实验（唯一）**：在另存目录只改 `snap` 缓动与侧格缩放，出前后对比 gif。

**建议顺序：** A → 若夕里点头再叠 B；C 可与 A 并行但分目录，避免两变量同时改。

---

## 4. P4｜三个设计方向（锚定 C 方案）

前提：v9 书册插画可复用；柜体机械叙事在彩窗世界观下**降级为历史选项**；新开「窗→书」研究目录，不覆盖 v9。

### 方向 1 ·「窗格展开成书」（结构优先）

- **对应产品**：从 P3 当前专题进入 → P4 默认就是该专题的细分图录。
- **做法**：共享元素过渡——中心尖拱轮廓 → 书册左页外轮廓（整站方案 S6）；右页起放词条卡。滚动可逆：合书回到同一窗格。
- **参考**：Gloucester 整窗→单格连续缩放；York 整窗→panel。
- **下一实验（唯一）**：黑线白底 SVG 分镜两张（Web／手机）：标注「中心拱轮廓＝书左页边缘」的 graphic match；**不画书内文字**。夕里只答结构对不对。

### 方向 2 ·「书内换厅」专题切换（C 方案的切换器）

- **对应产品**：允许从 P4 切换整个专题图录，而不必滚回 P3。
- **做法**：书眉或书口做「章名」刻线题签＋左右章切换（或下拉 24 章）；切换时**整页内容替换**，书壳不动。URL `?topic=<slug>` 同步（Hammer 可分享筛选；Rijks 持久 ID 思路）。
- **参考**：V&A 主题 scroller；Rijks 主题节点页。
- **下一实验（唯一）**：在空白 `book-desktop-approved-v1` 上叠一层低保真线框：题签位置三种（书眉居中／书口竖题／地脚），静帧三选一。不接数据。

### 方向 3 ·「词条卡 → V3 深链」

- **对应产品**：图录项进入 V3 词条详情。
- **做法**：每卡 = 飞书词条封面缩图 + 章内名；点击开原生 dialog 看大图（v9 FOLIO 已有标本 dialog 模式）或路由到 V3。深链带 `topic`+`entry`。
- **参考**：York panel 页；Rijks object ID。
- **下一实验（唯一）**：选一章（建议「爱欲」）只读拉 3–5 个词条封面，在书页静帧里排一版双页网格；检验密度是否「喧宾夺主」。超密就减到每页 2–4 卡。

**建议顺序：** 先方向 1 结构分镜（决定彩窗版能否成立）→ 方向 2 题签位置 → 方向 3 灌数密度。数据一律飞书只读。

---

## 5. 和 GPT 任务的边界（防撞车）

| 我们（本文） | GPT（已交接） |
|---|---|
| P3 窗**内部**的 aha（透光／钩子／横滑仪式） | P2→P3 **接缝**刻线；拱顶／玫瑰／星补全；窗框线质 |
| P3→P4 **窗→书**结构分镜 | 不写 |
| P4 C 方案信息架构与静帧 | 不写 |
| 另存目录、待审 | 另存 `p2-p3-junction-…`、待审 |

若 GPT 补星成功，方向 A 的「玫瑰窗同步微亮」可以接到他们的星层上——但**仍单独开实验目录**，一次一变量。

---

## 6. 给夕里的选择（请只回一句）

研究结论收束成两个「下一 exp」——各只做一个变量：

1. **P3**：另存做「中心格透光点亮」6 秒 animatic（方向 A）。  
2. **P4**：黑线白底「中心窗格→书左页」结构分镜（方向 1）。

你更想先看哪一个？或两个都要但分先后？

---

## 7. 链接清单（便于复核）

- Chartres stained glass：https://www.cathedrale-chartres.org/en/cathedrale/monument/the-stained-glass-windows/
- York Minster Navigator：https://stainedglass-navigator.yorkglazierstrust.org/
- Gloucester East Window interactive：https://www.wide-sky.co.uk/portfolio/gloucester-cathedral/
- Winchester DIY stained glass wall：https://djwillrich.com/winchester-cathedral
- V&A Explore redesign：https://www.vam.ac.uk/blog/digital/reimagining-the-vas-explore-the-collections-designing-a-more-inspiring-way-in
- First Monday explore modes：https://firstmonday.org/ojs/index.php/fm/article/download/6984/6090
- Rijksmuseum collection online about：https://www.rijksmuseum.nl/en/about-collection-online
- MuseumNext · Infinite Rijksmuseum：https://www.museumnext.com/article/inside-the-infinite-rijksmuseum-how-one-museum-is-rethinking-digital-collections/
- Hammer Collections：https://www.cogapp.com/work/hammer-online-collection
- Hello Monday × Nat Geo：https://www.hellomonday.com/work/nat-geo
- Lumen Artspace：https://contra.com/p/M22qvsgv-lumen-artspace-heritage-in-motion-or-award-winning-website
- Roman MTC：https://www.nikolozchachia.com/works/roman-mtc

仓库对照：

- `CURRENT_STATE.md`
- `web-prototypes/p3-stained-glass-v3-2026-10-23/README.md`
- `web-prototypes/p3-p4-restored-v9-2026-10-21/{README,MOTION-NOTES,FOLIO-CONTENT-STUDY}.md`
- `产品决策/2026-10-23-视觉总监-整站推进方案.md`
- `产品决策/2026-10-23-交接GPT-P2改动与禁忌.md`
