---
name: shenmei-editorial-layout
description: 审美外挂专属编辑设计执行 Skill。触发：版式、杂志、Mook、P1-P4、Figma 结构排版、字体层级、图文主次、小红书刊物排版、Grid Systems、Editorial。
version: 0.1.0
updated: 2026-10-24
status: process-rule-proposed
---

# 审美外挂｜Editorial Layout Skill

> 用于真正的编辑设计施工，而非“看起来像杂志”的视觉套壳。
> 本文件是本项目原创执行规范；参考源为 [Grid Systems & Editorial Design](https://github.com/medoismail/grid-systems-editorial-skill)（上游暂无明确 LICENSE，不在本仓库复制其全文）。使用时必须按任务阅读上游具体条目，不得把“查到/读过/调用了 Figma 工具”等同于“已执行版式 Skill”。

## 0. 触发与准入（每次设计前必做）

1. 首先核对 `PROJECT_CONTROL.md` → `CURRENT_STATE.md` → `AGENTS.md` → 真实画板/源码/保护基线；以用户当轮明确范围优先。
2. 此后**必须打开本 Skill**，按任务至少阅读上游对应的两个具体章节：
   - [grid-construction.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md)：页面尺寸、边距、列/模块栅格、对齐；
   - [typography-rules.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/typography-rules.md)：字号梯度、行高、段距、阅读性；
   - [page-composition.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)：信息层级、视觉重心、留白；
   - [editorial-layout.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md)：编辑节奏、主次、跨页；
   - [SKILL.md / 源入口](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/SKILL.md)。
3. 写清“**采用源条目 → 本轮具体设计动作 → 怎么验收**”。至少 2 条能在最终 Figma 节点或计算中核验；只贴链接或声称“已参考”算未使用。
4. 上游读不到应报告未核验，**不得编造已经执行的规则**。版式研究可以独立于 Figma 编辑工具；二者各自提供什么能力须明确区分。
5. 先查同一画板是否已有较新实验；只新建独立版本，禁止覆盖确认基线或他人并行稿。

## 1. 本产品的版式工作顺序

**编辑内容提炼 → 信息层级 → 无装饰几何草排（点线面/文字占位）→ 选择并计算栅格 → 把文本/图像放入栅格 → 视觉阅读顺序核验 → 输出可编辑实稿 → 用户验收。**

- **图像是内容还是背景？** 分类：刊物固定语言（边距、字号等级、黑白）vs. 专题本身作品（24个主题的图、独特色彩）。固定语言不能压过真正内容。
- 每个版式只设一个一级视觉重点；其他内容保持可读且有明确顺序。大的不一定先于有情绪张力的：要以读者实际观看轨迹检查。
- 文字必须使用原文；遇到原字形为矢量时，复制件中锁定原节点并隐藏，在独立层建立可编辑 TEXT，逐字复核，不擅改措辞/段落。
- **图层纪律**：图像和背景原层不动；复制 Frame → 锁定原艺术层 → 仅在上方添加版式层；保留旧稿；若用户只允许增层，不要“为了结构好看”重新生图。
- 文本模块用 Frame/Auto Layout 组织，同模块编号、原文可分别编辑；辅助栅格也可编辑但默认隐藏。截图**不能**替代 Figma 节点交付。

## 2. 可追溯的规则应用（每次选择而非机械套用）

| 规则 ID | 对应上游 | 施工动作 | 必须交的客观证据 |
| --- | --- | --- | --- |
| E01 信息层级 | page-composition | 指明先看什么/其次看什么；按内容重要性设置主次 | 文字块的字号、相对尺寸、位置、阅读路径与节点ID |
| E02 栅格先行 | grid-construction | 先测量页面、原艺术占位、确定边距/栏数/栏距/文本列宽，再放内容 | 栅格公式/坐标和 Figma 独立 guide layer ID，偏离点说明 |
| E03 垂直节奏 | typography-rules | 明确基线单位、行高、块间距，统一模数；手机独立验证 | 行高、块距、模数是否一致；例外说明 |
| E04 字号级差 | typography-rules | 少量字号角色（如主/次/编号），定义有理由的比例，禁随意逐块字号 | 字号角色表、实际 TEXT 属性、比例计算 |
| E05 视觉呼吸 | page-composition | 保留画心重点、留白与视线通道，别让字遮住艺术信息 | 与原稿并排比较和重叠/侵入说明 |
| E06 编辑节奏 | editorial-layout | 页与页或四段信息之间有强弱/快慢/重复与变化 | 节奏说明；同一规则怎样在多模块复用 |
| E07 真实可编辑 | 项目工程纪律 | 新 Frame、独立文字层、原图锁定，只有可编辑文字为新稿 | 新 Frame URL、文本节点ID、插画层保持不变的核验 |

**重要边界**：印刷书的 45–75 个拉丁字符行长、页边比例以及“边距必须 2:3:4:6”不可以生搬硬套到中文短文案或可响应网页。先解释适用条件，再决定沿用/改造/不采用。12 栏、1.5 比例、8/12px 模数都只是候选；有数字 ≠ 正确排版，必须验证实际字体换行、阅读顺序和图像遮挡。

## 3. 三阶段审批门

### 阶段① 版式结构（Layout）
只调整信息层级、模块大小/位置/间距、阅读顺序。沿用当前黑白与一种临时字体。仅复制 Frame、锁定原图、加可编辑文字图层。不生图、不最终定色/定字体。**用户没有明确确认，不得推进阶段②。**

### 阶段② 色彩（Color）
阶段①明确验收后才进行。保留已认可几何结构；只研究前景/背景黑白转换与专题色占比，不碰原图，除非单独授权。**用户未明确确认，不得推进阶段③。**

### 阶段③ 字体（Typography）
阶段②明确验收后才进行。比较字体家族、字重、字距、混排/字偶调整及响应式断行，必须保留最终可编辑文本。

## 4. 强制证据链（绝不能只说“用了”）

每次完成都按 [EVIDENCE_TEMPLATE.md](EVIDENCE_TEMPLATE.md) 填入 GitHub 或同次交付：
1. **读取证据**：Skill 本地路径、上游具体文件链接、读取/核验日期。
2. **规则证据**：规则 ID、采用/例外说明、公式或尺寸与内容匹配的原因。
3. **实现证据**：Figma 新 Frame 精确链接、Guide/Overlay/TEXT 节点 ID、可编辑类型。
4. **保护证据**：原图与副本 imageHash / 位置尺寸 / 混合模式一致；原件 ID 不变，副本原艺术层 locked；旧版保留。
5. **视觉验证**：文字是否溢出、遮挡、阅读路径是否合理；截图仅作为辅助，不取代节点；不足之处如实列出。
6. **状态**：仅用户明确同意才记“已认可”，否则待审；严禁“代码运行成功＝审美已通过”。

**无证据即未完成。某个工具调用成功并不证明已按设计 Skill 执行。**

## 5. P2 例子（仅为如何举证，不是已验收定稿）

原 P2 Frame [306:35](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=306-35)，Figma 排版实验 [结构实验01 / 536:8](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=536-8) 与 [结构实验02 / 539:8](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=539-8) **均待用户视觉验收**。02 有 12 列/12px 辅助栅格与字号数学关系，但这些只证明部分结构规则执行，**不自动证明版式质量合格**；01 不能冒称已遵守上游规则。
