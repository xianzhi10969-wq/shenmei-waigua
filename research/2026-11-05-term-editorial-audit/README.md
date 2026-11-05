# 词条吊灯与定稿拼贴：编辑设计审查 · 2026-11-05

状态：研究候选；未改美术、Figma、页面源代码、飞书或部署。用户未选择下面的新交互。
本轮只研究重复开场及外部接续，不声称已解决 P1/P2 与词条的画法一致性。

## 读取来源
- [项目 Editorial Layout Skill](../../.agents/skills/shenmei-editorial-layout/SKILL.md)，blob 30d6f2b65ddade3e8c187b0585a2b120261f1634。
- [typography-rules.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/typography-rules.md)，blob b1cfab7c555788a5d003cb5945771ebb2d582b3d。
- [page-composition.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)，blob c99634840a494afabe7191080910d083498c4579。
- [editorial-layout.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md)，blob 605f0fb637b935daa3e3c1cf5a84bfd1a28917e6。
- CURRENT_STATE、PROJECT_CONTROL、CREATIVE_MEMORY 和用户当轮反馈；2026-11-05 核验。
- [Figma 10B](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=1003-56)只读属性及截图；[定稿拼贴13c7d07](https://github.com/xianzhi10969-wq/shenmei-waigua/tree/13c7d07b73274fc7d307ecd1fb94595dc132b0ee/web-prototypes/term-style-board-2026-11-03)源码/双端预览。

## 规则 → 具体检查 → 证据

| 采用条目 | 本轮动作 | 可复查证据 |
| --- | --- | --- |
| E01/E04：视觉层级、标题角色 | 比较两处名称的字号、字族和职责，不把缩小当成默认答案 | 上标题82px，下标题88px，88/82≈1.073；都是显著的斜体衬线名称 |
| E06：重复、变化与编辑节奏 | 检查整段的内容重复，计算两标题在连续页中的位置 | 上标题y280，下标题y1146+16=1162，间距882px；208px介绍没有改变两者都是开场的职责 |
| E05：保留艺术重点与视线 | 把保护两种完整构图作为候选B的理由，列出候选A的代价 | 上方已有11px眉题；去掉大标题会改变重心。定稿拼贴3个源文件hash核验见protection.json |

上游资源没有“同一词条绝不能出现两次标题”的通则，也不能证明哪种方案更美。本轮诊断依据是实际内容、用户指出的重复感和构图角色。候选B是助手提出的交互假设，不是skill规定。

## 真实节点与尺寸

10B：390×1146；header58；黑色封面y58、高880；纸色介绍y938、高208。
- 1003:64：可爱 / COQUETTE；IBM Plex Mono Regular 11/16；x24,y88,w240。
- I1003:70;1003:69：Coquette；Cormorant Garamond Italic 400，82/98；x18,y280,w354,h98。
- I1003:70;1003:68：同字形的深色避让底层，不能当作额外一处内容重复。
- 1003:75：核心句；Noto Serif SC 18/28；x24,y806,w342,h56。
- 1003:78：原文介绍；Noto Serif SC 17/28；x24,y1002,w342,h112。

定稿拼贴手机板390×1260：标题Cormorant Garamond Italic 500、88px，left22/top16；桌面132px。核心句20/31、top1155；10个图像单元、一个h1。已核验仓库previews/mobile.png为780×2520，不使用带工具栏的旧长截图代替它。

不只是名称：《秋千》作品与核心句也重复。此前“加入208px正文便可解决”和未经验证直接“小字化上方标题”的建议均撤回为未成立/未验证，不能沿用为默认施工指令。

## 两个结构候选

见[可编辑黑线结构](options.svg)，仅结构研究，不是页面美术完成稿。

A／连续长页：吊灯变成短前奏，取消独立完整封面的职责；完整拼贴承担唯一开场，之后读正文。优点是连续阅读、无额外操作；代价是上方需要明显收缩和重新构图，可能损失用户喜欢的美感。不能只把82px缩成小字就宣称完成。

B／从词条展开图版：保留灯下词条开场；通过局部“看风格拼贴”入口展开完整拼贴。手机独立全屏，桌面宽幅；收回后保留原阅读位置。原阅读路径直接通向正文，不强制先开拼贴。两处标题分别识别词条与图版，不再是必经的连续两次开场。优点是保留两幅完整构图；代价是一次展开/返回，以及入口可能不被发现。

结合用户珍惜白色吊灯美感、拼贴已定稿的约束，建议优先验证B。但用户尚未选择，不能自动实现或设为产品决策。

## 镜头叙事与美术边界

B可以理解为：主层级选择词条 → 灯下停留阅读 → 主动展开图版观察材料关系 → 收回继续读。连续性由同一词条身份、同一阅读位置和明确来回动作建立，不需要新增3D翻页、厚度、浮雕或阴影。展开动效如何取景尚未绘制/验证。

吊灯是可共用的环境意象，作品图随词条变化。完整拼贴保留自身纸色、图像、标题、编号和核心句，不强行套吊灯花纹。不能因此声称已经解决首页画法一致性；这轮只解决接续结构的研究。

## 下一轮可执行验收点（未授权自动推进）

只改变“拼贴怎样进入”，不同时换插画、字体和配色。先审B的具体双端黑线取景，再在独立原型中验证：
1. 能发现图版入口，也能直接继续阅读。
2. 打开完整拼贴，查看并返回后不丢词条和阅读位置。
3. 不出现连续滚动中的两次完整开场；拼贴内部与定稿逐项一致。
4. 若坚持全部连续滚动，则回到A研究上方构图收缩，重新审美感，不能改定稿拼贴来迁就。

## 交付与验证范围

- options.svg：可编辑黑白流程草图；本地PNG已人工查看。
- protection.json：index.html、styles.css、mobile预览的Git blob hash核验一致。
- 本地evidence.svg / evidence.svg.png：现有截图及测量证据，不是新美术，未上传仓库。
- 本轮没有新增Figma Frame、真实交互实现或测试。此前本地浏览器超时不能视为验证通过。
- 本轮存库前发现并保留并行的阈限空间拼贴提交528e1eb；它未被本轮研究修改，也不冒充已验收的通用版式。
