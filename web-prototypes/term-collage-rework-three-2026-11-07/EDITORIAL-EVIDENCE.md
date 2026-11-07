# 规则 → 动作 → 证据

2026-11-06 开始读取，11-07 继续执行。已读项目 `.agents/skills/shenmei-editorial-layout/SKILL.md`、CREATIVE_MEMORY 与本地 style-board SOP；接续时再次读远程 CURRENT_STATE，保留最新逐案例正文恢复记录。本轮只重拼三个新候选，承接此次直接重拼授权与原批次直接实图制作范围。

| 具体源章节 | 规则与取舍 | 实施证据 |
|---|---|---|
| [Page Composition](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md) / Multi-Image Placement、Asymmetrical Balance | E01：先定主要图组，再安排补充与细节。清透光场+透明桌、烟火味店铺+早餐、新中式水院+人物各自组织；不把固定模板复制三次 | 三份 layout.json；对应 SVG `piece-01`…；六张预览 |
| [Grid Construction](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md) / Construction Process、Hierarchical Grid | E02：桌面1320宽，主要内容约55–1250；手机390宽，主要内容约20–374。层级栅格按图像形态决定，桌面1120/1140高，手机1220/1290/1170高；不强套12列 | `*-structure.svg`、`*-layout.json` 的双端位置与取景范围 |
| Page Composition / White Space、Image-Text Relationships | E05：去掉大多数照片框背景，使轮廓间留白相通；有意义的光线/展场保留。轮廓互相穿插，避免遮住脸与主要识别部位。编号从图像层分离，放在最后绘制 | `masks.json`、SVG 独立 image/clipPath/text；手机编号修正。原图片散列一致 |
| [Editorial Layout](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md) / Content Flow, Pacing, and Rhythm | E06：沿用一致白纸与文字角色，改变主图位置、大小和下方节奏。以光场、街铺、建筑/人物形成内容区别。没有用统一滤镜凑色 | 三张并排预览 `previews/three-boards.png` |
| 项目工程纪律 | E07：原图外链保留字节，SVG独立对象、坐标与蒙版。浏览器可读来源，文本为text节点。Figma未操作，E07采用可编辑网页/SVG交付，不虚构node ID | HTML、SVG、data、masks、source-integrity.json |

上游核验 blobs：Page Composition `c99634840a494afabe7191080910d083498c4579`；Grid Construction `40a8b8cae79c04aead1909119845a3bb1f14b8db`；Editorial Layout `605f0fb637b935daa3e3c1cf5a84bfd1a28917e6`。

E03/E04 不做独立字体研究；沿用 Coquette 字体资源，手机/桌面标题为53/89，英文23/32，编号14/17，核心句19/23。没有把固定比例当作审美验证。结构 SVG 随制作保留，没有宣称用户已批准这一批的新几何、颜色或字体。

验证：图片和官方来源映射、原图保护、桌面/手机实图已检查。技术验证通过不代表审美已通过。视觉状态：待用户审阅。
