# 灯下文字 v3 · 编辑排版结构候选

2026-11-06，用户反馈v2“不够好看”，要求继续使用设计资源重新设计下面的排版。v2保留但不视为认可；本轮只做标题与介绍语的编辑结构，保护吊灯和13c7d07拼贴。

## 具体设计

原v2：同轴题名和单一18/31整段，只有标题与正文两层；更宽边距不足以带来编辑节奏。

新候选：题名→情境引言→细读说明。第一句原文单独取得较大的视觉权重，其余原文接续，文字顺序与措辞不变。此为显示层级划分，不改变飞书原段落或把第一句复制成另一条文案。

390手机：题名x44/y492，84px；引言x44/y616，302宽，21/32；余文x68/y704，278宽，16/28；后留72，整板从y888开始。标题和引言共享左轴，说明右收24，三者右边界不侵入44px页边。原v2图版始于约866，新候选没有为了短前奏压缩开场。1440桌面保留灯右文左，主左轴164、说明左轴220；24/40引言与20/32说明，图版仍从720开始。

Coquette名称保留；飞书没有独立中文译名。数据复用当日只读核验记录rev232，无本轮飞书写入。只做390和1440结构，不声称完整响应式或全词条接通。

## 设计资源 → 应用 → 证据

本轮读取项目 [.agents/skills/shenmei-editorial-layout/SKILL.md](https://github.com/xianzhi10969-wq/shenmei-waigua/blob/master/.agents/skills/shenmei-editorial-layout/SKILL.md)，sha30d6f2b65ddade3e8c187b0585a2b120261f1634。

| 资源条目 | 具体应用 | 证据 |
|---|---|---|
| [Typography Rules](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/typography-rules.md)，Heading Hierarchy / Classical Scale / Alignment / Orphans，sha b1cfab7c555788a5d003cb5945771ebb2d582b3d | E01/E04：正文先定16，引言21（比1.3125），题名84（4×21）；长文字左齐、不两端拉伸。显示题名沿用旧字体角色；并非新字体挑选。初稿17px余文造成尾行“思。”，实际看图后改16并核验末行14字符 | geometry.json；mobile-after.svg 的三个可编辑text；checks.json 的tspan行长 |
| [Grid Construction](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md)，Hierarchical Grid / Baseline / 8-point Grid，sha40a8b8cae79c04aead1909119845a3bb1f14b8db | E02/E03：使用不等宽的层级栅格，主轴44、次轴68，302/278列宽；24px收进与段距，32/28行距，72px结尾留白均基于4px单位。手机44px外边距沿用上轮用户反馈，不照搬印刷内外边比例 | SVG坐标与geometry.json；不是凭空套12栏或45–75拉丁字符行长 |

上游无明确LICENSE，因此不复制资源全文，只记录应用。项目要求先黑线白底结构，阶段①未确认不推进色彩/字体阶段。沿用已有字体来量实际字宽；未比较或定稿新字体。暂无Figma节点：本轮延续用户当前本地网页反馈，交付真实可编辑SVG文字与独立预览，不冒称Figma完成。

## 验证

用本机Chrome加载真实现有字体、测量逐行字宽生成SVG tspan。逐字核验引言+余文等于content.json原介绍；检查文本边界与行尾，已人工查看comparison.png。标题/引言/余文不与灯占位重叠。SVG中的框仅说明既有插画/拼贴位置，不是新增页面边框。

原素材未复制进结构页，因此没有改变图片裁切、滤镜、图像层或拼贴；未生图，未改既有8781页面、Figma、飞书与生产站。完成的是阶段①结构候选，审美待用户审阅。

## 文件

- index.html：新旧结构对照，含桌面折叠预览。
- comparison.svg：下方文字区域对照，可编辑。
- mobile-before.svg / mobile-after.svg / desktop-after.svg：完整结构。
- content.json / geometry.json / checks.json：真实原文、几何、检查。
- PNG截图仅本地，GitHub保存SVG和其字体/许可，不声称PNG已同步。
- 本地预览 http://127.0.0.1:8782/ 。
