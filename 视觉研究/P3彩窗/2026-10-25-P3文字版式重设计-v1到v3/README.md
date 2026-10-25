# P3 窗外文字版式重设计｜v1 → v3（2026-10-24/25）

状态：**待夕里审，非基线**。Figma 文件 `pIL4mlWLHxph3pqXlIVq1s`，页 `593:16`「P3 文字版式重设计 · 2026-10-24 · 待审」。旧稿 577:13/577:195、588:*、306:2 及页内 v1（593:17/593:202）、v2（601:20/601:322）均未改、未删。窗、封面、蒙版、窗内题签不动。

## 画板
| 版本 | Web | Mobile | 内容 |
|---|---|---|---|
| v1 | 593:17 | 593:202 | 窗外文字首次重排（去序号后） |
| v2 | 601:20 | 601:322 | 阶段① 版式结构 |
| v3 | 603:24 | 603:326 | 阶段② 配色 + 阶段③ 字体（版式结构不变） |

## A. 范围与读取证据（EVIDENCE_TEMPLATE）
- 日期 2026-10-25；Skill `.agents/skills/shenmei-editorial-layout/SKILL.md` 与 `EVIDENCE_TEMPLATE.md`，已 git pull 核对。
- 上游实际读取（raw，2026-10-25）：editorial-layout.md、typography-rules.md、page-composition.md；grid-construction.md 已下载但未细读，栅格沿用 539:8 的 12 栏。
- 项目内：`视觉研究/版式系统/` 的 v4 执行证据、Editorial Color 研究、P2 复盘。
- 阶段推进依据：阶段①夕里认可后继续（"可以 你改一下剩下的"）。阶段②③本轮同做，用户视觉未验收，仍待审。

## B. v1 为什么「丑」（诊断，对照 Skill 条目）
1. E04：Web 24/14/12 里 14 与 12 只差 1.17 倍；手机 11 与 10 几乎同档，层级分不出。
2. E01：窗下副题、定义句、出处、提示、授权五段文字，副题是无标题可挂的 kicker，和出处一起抢第二层。
3. E02：页脚左右两端的小字甩在 1344px 两头，页眉右上空，整页只有左上有字。
4. E03：行高 18/36/20/18、块距 24/16 等无统一模数，是凭眼睛放的。
5. typography-rules「Alignment/Centered」：三种字号全居中堆叠，松散。
6. E05：窗底线到定义句的空白不比下面各块之间大，信息区没有「上大下小」。
7. 手机：定义句与出处只隔 6px，出处又贴刻度条。

## C. v1 → v2 → v3 改动
**v2（阶段① 结构）**：字号两档（Web 24/12，手机 14/11）；模数 Web 12、手机 4/8；一条居中轴（Web x720，手机 x195）；副题移到页眉右；窗下只留定义句+出处；页脚两段文字隐藏（未删）；窗底线到定义句 36（3 个单位）、定义句到出处 12、出处到刻度条 36。
**v3（阶段②③）**见下。

### 阶段② 配色
实测（对 before 截图取样）：页面纸 #F8F6EF；窗内四角纸底 #F9F7F1、#F9F8F2（手机）；P1 306:11 纸 #F9F6EF；P1 墨 #161513；P2 539:8 底 #12161C。#F6F3ED 比窗内纸底暗约 3 个色阶，会露出一块接缝，不采用。
- 画板底色 #F8F6EF → **#F9F6EF**（与 P1 一致，与窗内纸底相差 ≤2）。Web 603:24、Mobile 603:326。
- 窗外文字与线全部 #1E1E1E，无透明度、无灰、无阴影渐变颗粒、无彩色。
- 线宽：未调。Figma 1x 下低于 1px 的线会抗锯齿成灰，违反两色规则；刻度尺是夕里认可的，不动。
- 文字色 #1E1E1E 与 P1 墨 #161513 不同，按夕里指定保留，待拍板时可统一。

### 阶段③ 字体
核对：P1 = EB Garamond（拉丁，Regular）+ Noto Serif SC Regular；P2 的 539:8 实验稿是 **Noto Sans SC**（#E9E2D5），P3 原稿 Noto Serif SC。因此 P3 沿用 P1 的衬线体系，并不需要和 P2 实验稿同款。
| 节点 | 改动 |
|---|---|
| 定义句 Web 603:322 / 手机 603:536 | Noto Serif SC **Light**，字距 +2%；行尾「，」「。」字距 -50% 做悬挂，使居中视觉对称 |
| 出处 Web 603:323 / 手机 603:537 | 《》（）间 -50% 挤压；行尾「》」「）」悬挂；「1889」改 EB Garamond Regular（Web 13、手机 12，+3%） |
| 页眉右 Web 603:321 / 手机 603:531 | 「Cottagecore」改 EB Garamond Regular（Web 13、手机 12，+3%），与 P1 拉丁一致；中文 Noto Serif SC 不变 |
| 其余 | 页眉左、线、刻度条、位置、两档字号、行高、断行均不变 |
- 拉丁字号 +1 是 EB Garamond 对 Noto 的视觉补偿（P1 也是 13 配 11）。
- Figma 插件 API 不能开 OpenType 特性，标点挤压用范围字距近似。
- 手机定义句断行不变：「田园给疲惫的人一处可想象的栖身之地，」「也让人暂时放慢脚步。」，不孤字。

## D. 规则 → 操作 → 节点
| 规则 | 操作 | 节点 |
|---|---|---|
| E01 | 先定义句，后出处，页眉两端并列，窗下两段文字 | 603:322、603:323、603:315、603:321 |
| E02 | 居中轴 x720/x195，版心 48/1392 与 21/369 | 同上 + 刻度条 Web 603:284、手机 603:499（刻度尺 603:209、603:442） |
| E03 | Web 12、手机 4/8 模数，行高 36/24/18、24/16 | 见 v2 |
| E04 | 两档字号，比 2.0（Web）、1.27（手机） | TEXT 属性 |
| E05 | 窗底线下 36 起，上大下小 | 603:320 |
| E07 | 全部独立 TEXT，旧层隐藏未删 | 文字层组 603:314、603:529 |
| 阶段②③ | 见 C | 画板底 603:24/603:326；范围字体见上 |
保护：577:13/577:195/588:*/306:2 及 593:17/593:202、601:20/601:322 的字体、填色、位置读回与改前一致。

## E. 待核验
- 全部为 Figma 缩放预览与文字 2–3x 导出，没有 1440 原尺寸整屏渲染，没在真机看。
- Web 出处 12px 在 1x 偏小；定义句 Light 在低密度屏上的细线粗细未在真机核对。
- 手机刻度条下缘离底约 16px，可能压 iPhone 底部横条。
- 手机侘寂、日常、怪诞三条定义句没有逗号，只有顿号，需在顿号处断行，v3 只做了田园。
- 出处比封面窗格宽，违背上游 Caption「不宽于所属图」，因居中暂留。
- 页眉副题放页眉右，P1/P2 页眉未核对。

## F. 教训
1. 序号：P1、P2 都没有序号，P3 不应自带；要先跨页核对再加元素。
2. 「丑」的主因不是字体，而是层级太多、位置分散、间距无模数。先收层级再谈字体与颜色，顺序和 Skill 三阶段一致。
3. 不要把旧结论当事实：P2 实验稿是无衬线，不是衬线；颜色要实测，不凭「看起来像」。
4. 两色规则下，层级只能靠字号、位置、字重，线不能做灰；Figma 1x 下 0.5px 线会变灰。
5. 一次只推进一个阶段，每步新画板、旧稿不动。

---

# v4｜按仓库字体与配色资料校正（2026-10-25）

状态：待夕里审，非基线。Figma 页 593:16：v4 Web **608:546**、Mobile **608:848**，克隆自 v3（603:24/603:326）。v1–v3 未改。起因：夕里说 v3 看不出差别，要求对着仓库资料查。

## 一、仓库字体与配色资料（grep 全仓后的结论）
| 来源 | 结论 |
|---|---|
| `web-prototypes/p3-ticks-motion-v1-2026-10-25/styles.css`（P3 最新原型） | 纸 `#f8f6ef`，墨 `#24221f`；正文 CabinetSong（朱雀仿宋，OFL）→ 'Songti SC' → 'Noto Serif CJK SC'；数字和英文 Georgia。页眉 12px、字距 .18em（手机 10px）；`.number` Georgia 12px、字距 .12em；定义句 13px、行高 1.7、字距 .05em；`.hint` 11px、字距 .15em；`.credits` 10px。 |
| `web-prototypes/p3-adopted-figma-2026-10-23/README.md` | 朱雀仿宋与 Georgia 没有装在 Figma 云端；界面小字暂以 Noto Serif SC / Noto Serif 代；不能说字体已完全匹配。 |
| `产品决策/2026-10-24-交接GPT-P2P3镂空纸页过渡不丝滑.md` §3 | P3 纸色 `#F8F6EF`，**不要换成 #F6F3ED**（会露出色差）。 |
| `产品决策/2026-10-23-交接GPT-P2改动与禁忌.md` §4、P4 两份交接 | 两色铁律 `#F6F3ED` / `#1E1E1E`；窗内原画彩色为唯一例外。 |
| `产品决策/2026-10-23-视觉总监-整站推进方案.md` S12 | 仓库字体太多（Yozai Light、cabinet-song、folio 系列），建议收敛为「一中文宋体正文 + 一中文标题刻字 + 一拉丁衬线」，中文网页字体用 Noto Serif SC。 |
| `web-prototypes/home-p1-p4-2026-10-20/p1-p2/README.md` | P1/P2 的问题字形是 Yozai Light 衍生字形（SIL OFL），不是系统字体。 |
| Figma P1 306:11 / 306:24（实测） | 拉丁 EB Garamond Regular，全大写、字距 13%–25%；中文 Noto Serif SC Regular 11px、字距 12%；墨 #161513（手机 #292522）；纸 #F9F6EF。 |
| Figma P2 539:8（实测） | Noto Sans SC，54/36/24/16，#E9E2D5 配 #12161C；这是结构实验稿，P2 实际问题是 Yozai Light 字形（306:35 内无 TEXT）。 |
| `.agents/skills/**`、`视觉研究/版式系统/**` | 阶段①②③审批门；版式 12 栏与 54/36/24；没有给出具体字体名或墨色值。 |

## 二、资料要求 vs v3 实际
| 项目 | 资料要求 | v3 实际 | 差距 |
|---|---|---|---|
| 纸色 | P3 `#F8F6EF`（交接 §3、P3 CSS） | 我改成 `#F9F6EF` | **v3 错了**：违背 P3 资料，只依据 P1 与窗角取样 |
| 墨色 | 两色铁律 `#1E1E1E`；P3 CSS 用 `#24221f`；P1 用 `#161513` | `#1E1E1E` | 资料内部三个值；按铁律保留，差异肉眼看不出 |
| 页眉字距 | .18em | 10% | **不符** |
| 定义句字距 | .05em | 2% | **不符** |
| 拉丁字体 | P3：Georgia（Figma 以 Noto Serif 代）；P1：EB Garamond | EB Garamond、字距 3%、字号 +1 | 与 P3 资料不符；字距远低于 P3 的 .12em 和 P1 的 13%+ |
| 数字「1889」 | Georgia → Noto Serif 代 | EB Garamond | 同上 |
| 中文字体 | CabinetSong 朱雀仿宋（Figma 不可用）→ Noto Serif SC 代 | Noto Serif SC | 一致（代用，无法更近） |
| 中文字重 | 朱雀仿宋笔画细，资料无字重数值 | 定义句 Light | 依据弱，推论 |
| 行高 | 定义句 1.7 | Web 36/24=1.5；手机 24/14=1.71 | 手机符合；Web 为 12px 模数保留 |
| 字号 | P3 CSS 页眉 12/10、定义句 13/12、出处 10/9 | 24/12，14/11 | 阶段①已认可的两档结构，不动 |
| 页眉结构 | P1：左拉丁大写、右中文；P3 CSS：左中文、右 Georgia 数字 | 左中文、右副题 | 与 P3 一致，与 P1 不同，未改 |

## 三、为什么 v3 看不出差别
1. 墨色与纸色的差别是 1 个色阶以内，本来就看不出。
2. 改的几乎都是字距 2% 和字重 Light，字号 12–24px 下一两个百分点看不出。
3. 页眉的字距、拉丁字体换成 EB Garamond，在 12px 缩放预览里和 Noto Serif 难分。
4. v3 还把纸色改成了 `#F9F6EF`，反而背离了 P3 资料。

## 四、v4 改动（只改有资料依据的，位置/两档字号/12px 模数/居中轴/页眉副题均不变）
| 节点 | 改动 | 依据 |
|---|---|---|
| 画板底 608:546、608:848 | `#F9F6EF` → **`#F8F6EF`** | 交接 §3；P3 CSS `--paper:#f8f6ef` |
| 页眉左 Web 608:837、手机 608:1052 | 字距 10% → **18%** | P3 CSS `header{letter-spacing:.18em}` |
| 页眉右 Web 608:843、手机 608:1053 | 中文字距 → 18%；「Cottagecore」改 **Noto Serif Regular**（Georgia 代），字号与中文同（12/11），字距 **12%** | P3 CSS `.number` Georgia .12em；adopted-figma README 以 Noto Serif 代 |
| 定义句 Web 608:844、手机 608:1058 | 字距 2% → **5%**（行尾悬挂 -50% 保留）；字重 Light 保留 | P3 CSS `.definition{letter-spacing:.05em}`；Light 依据弱 |
| 出处 Web 608:845、手机 608:1059 | 「1889」改 Noto Serif Regular，与中文同字号（12/11） | 同上；不再补偿 +1（只为 Garamond） |
| 未改 | 墨色 `#1E1E1E`、线宽、位置、断行、刻度条、窗 | 见上表 |

对比图：`v4/v3-v4-对比.png`（整页）与 `v4/v3-v4-关键区域2x对比.png`（页眉、定义句、出处的 2x 放大）。2x 图里可见：页眉字距明显拉开，Cottagecore 换成更粗实的 Noto Serif 且字距加宽，定义句每个字之间更松。整页缩略图里这些差别仍然小。

## 五、待核验与不足
- 朱雀仿宋和 Georgia 无法在 Figma 使用；Noto Serif SC/Noto Serif 只是代用，真正一致要等字体接入。
- P1 的拉丁字用 EB Garamond、P3 资料用 Georgia，两者不一致；v4 跟 P3 资料，没有跟 P1。
- 墨色三值（#1E1E1E、#24221F、#161513）资料不统一，未决。
- 手机字号比 P3 CSS 大（14/11 对 12/9），属阶段①结构，没动。
- 整页缩略图下改动仍小，需要夕里在放大图或 Figma 里看。

## 六、教训
1. v3 把纸色改成 #F9F6EF 是我只凭实测而没读完 P3 交接，违背了「纸 #F8F6EF，不要换」。动配色和字体前，要先 grep P3 自己的 CSS 与交接文档。
2. 看得见的改动要对着资料里的具体数值（.18em、.05em、.12em），而不是凭感觉微调 1–2%。
3. 同一页的资料优先于其他页：P3 用 Georgia，不跟 P1 的 EB Garamond。

## 七、字体候选（夕里看 v4：「都好普通，你要不自己找找别的字体呢」）

Figma 页 593:16 新画板 **611:32**「字体候选样张」（v1–v4 未动）。同一段真实文字，只换字体；字号位置沿用 v4（Web 24/12，手机 14/11）；两色 #F8F6EF / #1E1E1E，无彩色/阴影/渐变/颗粒。图：`字体候选/样张-整张-1x.png`、`字体候选/zoom2x_{base,A,B,C,D}.png`（Web+手机 2x）、`字体候选/zoom2x_全部对比.png`。

### 7.1 重要发现：日系明朝不能用
Zen Old Mincho / Shippori Mincho / Kaisei / Zen Antique / Yuji Syuku 等在 Figma 里能加载，但**缺简体字**。按 topics.json 全部 827 个汉字用 fontTools 查 cmap：Zen Old Mincho、Zen Antique、Yuji Syuku、Kaisei 各缺 212–215 字（含「园」「说」「这」「剧」…，P3 定义句里的「园」也缺），Shippori 缺 164，Noto Serif TC 缺 160。缺字会静默回落成别的字体，所以全部排除。可用（0 缺字）：Noto Serif SC、Chiron Sung HK（昭源宋体）、LXGW WenKai TC、Cactus Classical Serif；ZCOOL XiaoWei 仅缺「侘」1 字。

### 7.2 候选清单（授权均核 google/fonts METADATA.pb = OFL；Figma 用 loadFontAsync 实测）
| 字体 | 授权 | Figma | 简体覆盖(827字) | 结论 |
|---|---|---|---|---|
| Chiron Sung HK 昭源宋体（ExtraLight–Black 变量） | OFL | ✅ | 0 缺 | 入选 A。官方网页字仅繁体，须自托管子集化（变量 TTF ≈ 50MB） |
| ZCOOL XiaoWei 站酷小薇 | OFL | ✅ | 缺「侘」 | 入选 B。单字重；标点是西式逗号偏下，12px 以下不用 |
| LXGW WenKai TC 霞鹜文楷 TC（Light/Regular/Bold） | OFL | ✅（“LXGW WenKai”GB 版 Figma 无） | 0 缺 | 入选 C |
| Cactus Classical Serif 仙人掌明体 | OFL | ✅ | 0 缺 | 入选 D；≈28MB，须子集化；与 Noto Serif SC 差异最小 |
| Noto Serif SC（ExtraLight–Black） | OFL | ✅ | 0 缺 | 基准 |
| Zen Old Mincho/Shippori/Kaisei/Zen Antique/Yuji Syuku/Hina | OFL | ✅ | 缺 164–215 | 排除（见 7.1） |
| Noto Serif TC/HK | OFL | ✅ | TC 缺 160 | 排除 |
| Mingzat、Bpmf Zihi Kai | OFL | ✅ | 缺 827/231 | 排除 |
| Ma Shan Zheng、Zhi Mang Xing、Liu Jian Mao Cao、Long Cang | OFL | ✅ | — | 书法类，与线描窗不合，排除 |
| LXGW Neo ZhiSong 霞鹜新致宋（简体宋，OFL） | OFL | ❌ Figma 不可用 | — | 不推荐（按规则只推实测可用）；落地时可作自托管备选 |
| 拉丁：Cormorant Garamond(含 Medium Italic)、Italiana、Fraunces(Light/Light Italic)、Marcellus / Marcellus SC | OFL | ✅ | — | 入选 |
| 拉丁：Poiret One、Federo、Cinzel、Bodoni Moda、Playfair Display、Gloock、Young Serif、Limelight、Tenor Sans | OFL | ✅ | — | 未入选：Poiret 发丝线 12px 不可读；Federo/Limelight 花饰太强，与「一拉丁衬线」冲突；Cinzel 只有大写；Bodoni/Playfair 反差过大，与线描窗不搭；Gloock/Young Serif 太粗 |
| IM Fell 系 | OFL | ❌ Figma 不可用 | — | 本就不做旧 |

联网参考：Cormorant+Marcellus/Italiana 是 Mucha/新艺术常见搭配；Chiron 网页字仅繁体（chiron-fonts.github.io）；LXGW 系有开源简体宋（github.com/lxgw/LxgwNeoZhiSong）。

### 7.3 四套搭配（样张行：基准 + A–D）
| 套 | 页眉 | 定义句 | 出处 | 拉丁 | 气质 | 与 P1/P2 衔接 | 风险 |
|---|---|---|---|---|---|---|---|
| 基准 v4 | Noto Serif SC Regular，字距 18% | Noto Serif SC Light，5% | Noto Serif SC Regular | Noto Serif（Georgia 代） | 稳但普通 | 已定稿体系 | — |
| A 宋刻纤细 | 昭源 Medium 18%；Cottagecore 用 Cormorant Garamond Medium Italic，+2px，字距 8% | 昭源 Light，6% | 昭源 Regular + Cormorant Medium 数字（+2px） | Cormorant Garamond | 宋体细长高反差，最接近穆夏线影 | 同气质（仍是宋体，最易融入） | 须自托管子集化；Cormorant 数字是老式数字，「1889」略怪；差异中等偏小 |
| B 题签刻字 | 小薇 18%；Cottagecore 用 Italiana，+1px，字距 18% | 小薇，6% | 保留现有宋体正文（Noto Serif SC Regular 代 CabinetSong），12px 小字不用小薇 | Italiana | 棱角锐利、粗细反差强，近新艺术运动题签刻字，个性最强 | 需再统一（对应 S12「标题刻字 + 宋体正文」分工，出处保留宋体作衔接） | 单字重；标点为西式逗号偏下，需自改标点（或标点换宋体）；长句用展示字体，真机可读性待验 |
| C 文楷田园 | 文楷 Regular 14%；Cottagecore 用 Fraunces Light Italic，+1px，字距 8% | 文楷 Light，5% | 文楷 Light + Fraunces Light 数字 | Fraunces | 温润手写感，贴「田园 / Cottagecore」，人文而非装饰 | 同气质（悠哉 Yozai 与霞鹜同属 lxgw/Xiaolai 开源系），与宋体需再统一 | 偏离穆夏线条；TC 版需确认简体字形；13MB 须子集化 |
| D 古宋题刻 | 仙人掌明体 18%；Cottagecore 用 Marcellus SC，字距 22%（碑铭小型大写） | 仙人掌明体，6% | 仙人掌明体 + Marcellus 数字 | Marcellus / Marcellus SC | 古典明体书卷感 + 碑铭拉丁，庄重有轴线秩序 | 同族度较高（同属宋明路线） | 28MB 须子集化；台湾字形取向，需逐字确认简体字形；与基准差异最小 |

自检（2x 图 Read）：5 行页眉、定义句、出处肉眼可辨；全部中文均画出，无豆腐块；A、C、D 与基准在整页缩略图上差异仍小，只有 B 一眼可见。

### 7.4 首推：B「题签刻字」（页眉 + 定义句用站酷小薇，Latin 用 Italiana，出处保留宋体正文）
理由：夕里嫌「普通」，A/C/D 都还是宋体/楷体的正常延伸，差别只能在 2x 里看出来；B 是唯一一眼就不同的方案，又合 S12 的「一标题刻字 + 一宋体正文 + 一拉丁衬线」分工，出处仍用现有宋体，衔接 P1/P2。稳妥后备：A。

### 7.5 待核验
- 授权：已读 google/fonts METADATA.pb（OFL），未读各字体 OFL 全文及 Reserved Font Name；落地前核。
- B 的标点与西式逗号需处理；ZCOOL 缺「侘」及其它稀字，P3 其余 23 个主题的文字要逐字核。
- Figma 渲染与浏览器渲染不同；网页端须子集化自托管（pyftsubset）并真机验证。
- 字体来源页：fonts.google.com 对应族页；Chiron：chiron-fonts.github.io。
