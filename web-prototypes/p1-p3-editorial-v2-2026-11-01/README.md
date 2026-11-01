# P3 Editorial v2 · 题签、画心与旁注

2026-11-01。用户指出v1居中说明堆叠像PPT，尤其手机缺少焦点，并授权“继续改”。本版为**独立网页结构审阅稿，尚未用户验收、未合并或部署**。不是字体/配色定稿。

## 打开

从仓库根提供静态HTTP服务，进入本目录；`?at=1`直达P3，去掉参数查看完整P1→P2→P3。共享原 `p1-p3-continuous-2026-10-31/assets/`、v4及彩窗v3图片，不复制、压缩、重画素材。

上一版保留：[p1-p3-usability-2026-11-01](../p1-p3-usability-2026-11-01/README.md)。本版从该独立稿复制；当轮核对master `7010650853ffd58993d96d5c50501edbe4859d99`，其最新变更属并行徽章研究，未覆盖它或生产源目录。

## 实际改动

- **手机**：前置说明从“标题＋解释＋所选问题”三块居中堆叠，改为页眉、小题签、大彩窗；画注贴近窗脚，箭头紧接其后。完整操作说明、当前专题、定义和出处沿页面向下阅读。所选问题是底部旁注，不再占用画面开头。
- **桌面**：彩窗保留中心轴，题签在外侧上部、画注在对侧接近窗脚的位置；读者带来的问题留在页边。围绕原建筑组织文字，而非把图像压成标题下方的配图。
- 原文字全部保留；“每扇窗是一种美学专题。左右滑动，找到让你停下的那一种。”按画注/操作职责分置。没有新造作品、答案或风格匹配。
- 原纸色、墨色、字体家族、作品原色、窗框和翻页参数保留。原P2呈现不改；usability.mjs只改所选问题在P3的落点与文字分组。
- 增加gallery尺寸观察：展开出处、载入字体或显示长旁注后，P3可滚动高度随内容更新，避免底部内容无法滚到。

## 结构与实现

先建立黑线白底可编辑 [editorial-structure.svg](editorial-structure.svg)，再调整HTML与CSS。新增结构只安排既有元素，无生图或新增装饰美术。

`editorial.css`：主栅格、页边题签/旁注、手机取景、画注和控件的邻近关系。`index.html`：语义分组。`usability.mjs`：把所选句放入reader-note。`transition.mjs`：观察gallery整体高度。其余继承脚本保留。

## 本轮设计方法与证据

当轮重新读项目 `.agents/skills/shenmei-editorial-layout/SKILL.md`，上游 [Page Composition](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md) 的Visual Hierarchy、Image-Text Relationships、Axis and Alignment；[Editorial Layout](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md) 的Dominant Image Rule、Sidebars、Pacing/Rhythm。亦接续此前摇醒16种构图、出版物配色研究与“像PPT”复盘，不将公开课程目录冒称完整付费课。

| 规则 | 具体实施与核验 |
| --- | --- |
| E01 层级 | 彩窗为唯一主视觉。h1是页边题签；gallery-caption紧邻画心；gallery-controls管理动作；gallery-entry承载当前内容；reader-note承载来时问题。 |
| E02 栅格 | 桌面三轨：左右最小160px，中间最大720px，轨距24px，页边48px；两侧等宽以保留窗/星星中心轴。手机左右24px，画心沿用400/947比例，高度由视口减190px确定。不是套用印刷书页或12栏。 |
| E03 节奏 | 画心→画注8px→控件4px→指引16px→内容28px→旁注32px；不同距离对应附属关系/阅读段落，非等距叠块。 |
| E04 字体角色 | 保留现有字体家族及10–22px角色范围，不做字体设计候选；h1手机18px，全部文字仍可编辑。 |
| E05 呼吸 | 所有新文字在原画之外；手机上部不再放三块前言；窗顶/玫瑰窗/题签完整。 |
| E06 节奏 | 手机先观看，再操作和阅读；允许自然纵向展开，避免为了同时显示所有文字而继续缩小画心。P2选择与过渡保留。 |
| E07 保护/可编辑 | 网页交付使用真实HTML文字和独立CSS；原画由共享资产路径承载。没有改Figma，未声称新增Figma节点或已获视觉验收。 |

本轮处于版式结构阶段；配色与字体阶段未推进。上述证据说明方法与操作范围，不替代用户的审美判断。

## 验证

浏览器请求320×740、390×844、1440×900三档，实际CSS尺寸受应用缩放影响，原始测量见 [viewport-checks.json](viewport-checks.json)。

- 实际手机354×767：画心243.83×577.26，顶部96.38；旧v1同视口画心高约463px，新版高约25%。完整窗顶、玫瑰窗、题签及箭头在首屏可见，说明向下自然展开。
- 更小手机291×672：箭头宽242.90且位于视口内，无横向溢出；正常手机及桌面横向溢出均为0。
- 实际桌面1309×818：画心634.60×668.17，题签、画注与画心互不覆盖；下方阅读内容可继续滚动。
- 手机实际跑通P2选句→继续→P3，所选句出现在底部旁注；gallery/cinema高度均1065px，底部可达。
- 箭头一次前进一格；手机横拖继续前进一格；桌面键盘右键翻页及展开原作出处正常。当前专题、编号、定义和出处在停稳后对应一致。
- 最终浏览器检查日志无脚本错误。真实手机硬件触摸、系统减少动态偏好和线上弱网未实测，不扩张为全面验收。
- 与v1逐字节比较12份继承文件一致：motion.js、app.js、ticks.js、paper-motion.mjs、star-motion.mjs、gesture-adapter.mjs、styles.css、paper.css、continuous.css、cover-extension.js、cover-extension.css、usability.css。原图数据文件未写入。

## 后续集成

仍须用户审阅版式。需集成时基于届时最新生产代码提取本版的P3结构、editorial.css、旁注落点和gallery尺寸观察；不要整目录覆盖Grokbot的加载修复或并行修改。独立稿的共享资产相对路径也须按生产目录适配。
