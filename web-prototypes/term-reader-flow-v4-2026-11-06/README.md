# 词条阅读顺序 v4 · 去重、解释与内容分工

2026-11-06。用户指出底部Coquette重复、开场无法知道词义、两段文字的差异不明。用户同意“是什么→感觉→作品→理解与运用”的调整，并要求继续。本轮执行这一明确授权，覆盖旧记录中“不改拼贴标题”及v3按首句拆层级的限制；不是允许重绘整块拼贴。

## 内容

- 开场h1只出现一次Coquette，下面加“带着调情意味的甜美风格”。这是本会话提出并获用户同意的编辑解释，不是飞书现有译名，来源在content.json明确区分。没有改写飞书。
- 原钩子前两句合为一段情境介绍，文字不改；末句“做Coquette若只把……”移到后面的“别只堆装饰”。scene+warning逐字等于原钩子，没有删除内容。
- 拼贴h1改为h2“风格图谱”，去掉原副题与“A STARTER PACK”；保留01—10范围标记。原作品图像、全部位置/裁切/编号、核心句保持不变。原styles.css仍原样，标题变化在connected.css覆盖。
- 图谱后“理解这种风格”接现有正文；“如何运用”接本轮只读核验的做法1/2/3；最后呈现移下来的提醒。不再用同一段不同字号假装两个内容模块。现有“做俗了”字段与提醒近似，本轮未另堆一段重复说明。

来源：lark-base skill / lark-cli，显式aesthetic-feishu、user；IGctbcuwPaE6hMsmAoicJddpn3U / tbl2gR8WBoqCQyGz / reczz28HJJL2GJHl，rev232；2026-11-06读取。仅此一条，非全101条接通。字段正文、钩子、核心、做法1/2/3均存content.json。

## 设计资源与应用

沿用项目shenmei-editorial-layout skill，本轮重新读取medoismail/grid-systems-editorial-skill两章：

1. [editorial-layout.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md)，605f0fb637b935daa3e3c1cf5a84bfd1a28917e6：Section Openers / Standfirst / Pacing / avoid adjacent repeated pull-quotes。E01/E06具体落实为开场解释、图像参照、正文和运用各有独立职责，取消第二张词条封面。
2. [page-composition.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)，c99634840a494afabe7191080910d083498c4579：Visual Hierarchy / Axis。标题是名称，次级说明给出意思，连续情境作为一个块；图谱用28px中文章节标题，避免与84px词条名争夺同一级权重。

用户已明确接受信息顺序。先记录可编辑黑线structure.svg，再用既有素材组合。仍用既有吊灯、字体家族、深底与白底，无生图、无新增美术、无配色发散。EntryCN是现有朱雀仿宋的新字符子集，许可保持。

## 保护与验证

旧8784留存，新本地8785。图页两侧深底沿用待审接缝候选，并不声称该接缝已获认可。对照13c7d07检查10幅作品figure和10个来源a逐字一致、图像资产与原styles.css一致；只有按本轮授权改动的图谱标题/副题区不同。浏览器检查名称唯一h1、图谱h2、情境不含做法提醒、原钩子重组一致、三条做法/正文逐字一致、图片及来源链接正常、无横溢出。

未修改已确认首页、原拼贴目录、Figma、飞书或生产站。当前为本条词页的阅读流程试版，不是全部词条页面完成。

## 后续反馈：白色卡片接缝不采用

用户在本轮制作中明确指出白色矩形图页很土，要求其他办法。本目录保存内容分工实现，但外部白卡容器不采用，不能声称整页已认可。新的助手建议为读完介绍后整屏从暗场转纸白、图谱分层显现；仅分镜候选，未经用户确认，尚无动效实现。参照已验收P1→P2 v4的显影/交叉淡化语言，不修改该基线。新分镜见transition-storyboard.svg。
