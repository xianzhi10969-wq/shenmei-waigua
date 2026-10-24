# 本轮 Figma 同步｜Editorial 规则证据

## A. 范围与来源

- 2026-10-24，Codex。任务为用户要求“Figma 和 GitHub 都更新成这一轮最新”，复用已有设计，仅匹配运行尺寸；不启动新的配色或字体设计。
- 实际读取远程 [.agents/skills/shenmei-editorial-layout/SKILL.md](../../.agents/skills/shenmei-editorial-layout/SKILL.md) 与证据模板；使用 figma-use、figma-generate-design 的更新既有画板流程。
- 实际读取上游 [grid-construction.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md) 的 Construction Process / Hierarchical Grid、[page-composition.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md) 的 Image-Text Relationships / Axis and Alignment。
- 阶段：既有结构同步。不推进②色彩或③字体。本轮原始画板 Web533:6、Mobile525:4；源码8af4a66；保护 P1/P2 v4、P4 v9 及所有旧稿。
- 用户只认可封面适度延伸；宽幅/转场及新手机静态尺寸仍不视为审美验收。

## B. 规则映射

| 规则 | 动作与适用性 | 节点、尺寸与核验 |
| --- | --- | --- |
| E01 信息层级 | 沿用图像主导、题签其次、翻阅与说明最后；不新增视觉重点 | Web577:13、Mobile577:195；截图可见文字在画心以外 |
| E02 栅格先行 | 先固定运行画布，再复制原比例取景；采用上游网页层级网格，未套用印刷页边比例或12栏 | Web1440×1660，舞台x48/y64/w1344/h1415.111；比例945/995。Mobile390×844，w=(844−183)×0.42222=279.08742，h=w×947/400=660.73947；x=(390−w)/2=55.45629，y42。隐藏Guide578:16、578:19 |
| E03 垂直节奏 | 仅复现既有 CSS，不另造统一印刷模数；手机说明行高20.4=12×1.7 | pager y707.739；说明y754.739/h42；出处y800.739。网页既有1.7行高超出上游印刷建议，作为沿用例外明确保留 |
| E04 字号级差 | 未做新字体阶段；保留现有UI角色，不声称新级差系统完成 | Web12/11/13/10；Mobile10/12/10/12/9（页眉/计数/提示/定义/出处）；详见JSON。现有Noto代字体与源字体不匹配，仍未完成 |
| E05 视觉呼吸 | 按图文关系将说明放在舞台底边外，不覆盖原画心、花格或题签 | Web舞台底1479.111、说明y1541.111；Mobile舞台底702.739、说明y754.739。双端检查图无侵入；没有生搬40–60%报告图像占比 |
| E06 编辑节奏 | 本轮非跨页编辑设计，不新增节奏规则 | 保留主流程P1/P2/P4内容，P3上下静态顺移由Auto Layout处理；可运行转场另见HTML |
| E07 真实可编辑 | 克隆原生分层画板，保留蒙版/封面/题签；旧图不删；未用完整页面截图替代交付 | Web577:13（186子节点，25蒙版）、Mobile577:195（117子节点，15蒙版）；原图577:16/577:198均locked。旧494:4/5在577:12 |

## C. 图层与文本核验

- [Web新Frame](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=577-13) · [Mobile新Frame](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=577-195)。
- Web可编辑TEXT10个：577:119、132、152、166、184（题签隐藏原文），577:185、186、188、193、194（可见UI）。Mobile8个：577:263、283、297（题签隐藏原文），577:298、299、301、306、307（可见UI）。
- 文本逐字复用；手机定义只调整换行容器及源CSS行高。没有重写专题名或定义。
- Web图像fills/imageHash、坐标、尺寸与533:6直接克隆一致。手机沿用525:4同一组fills/imageHash与混合模式，舞台所有几何按同一比例279.08742/349.17593≈0.79928缩放，原稿不动，非独立改框形。详细坐标与比例见[JSON](checks/figma-sync.json)。
- 双端原钢笔图hash一致：3dbfd0fa346334ff8731a55f7aa1cf52a17610ca。原图locked；原色封面filters均0、opacity1，蒙版数量保持。
- [Web检查图](checks/figma-web.jpg)、[Mobile检查图](checks/figma-mobile.jpg)：观察到画心完整、题签未遮挡，手机说明分2行、出处在844画布内，无文字溢出。
- 不足：题签可见字形为矢量而非原字体TEXT，小字为代字体；不宣称全部字体可编辑或字体匹配完成。Figma不运行WebGL，动态测试依据独立HTML。

## D. 验收

- [x] 尺寸和位置来自真实运行CSS。
- [x] 图像、蒙版、文字备份可单独编辑。
- [x] 原图、旧画板、v4/v9及并行P2稿保留。
- [x] 已观察实际Figma渲染，截图仅作辅助。
- [ ] 用户验收本轮全部双端尺寸与动效。
- 状态：封面延伸已采用；宽幅、转场待审；字体匹配未完成；手机真机未核验。
