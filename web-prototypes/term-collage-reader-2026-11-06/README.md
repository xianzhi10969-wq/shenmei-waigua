# 灯下阅读 → 展开完整拼贴 · 交互样稿 B

2026-11-06。用户在A/B结构对照后要求“继续吧，你做一下”；按上一轮优先建议B制作独立试用稿，不代表美术、产品交互或全站接续最终验收。

## 打开

在本目录运行 `python3 -m http.server 8776 --bind 127.0.0.1`，打开 http://127.0.0.1:8776/ 。[三个状态对照](review.html)、[可编辑黑线结构](structure.svg)、[截图](previews/sequence.png)。本地预览，不是公开部署。

封面后点“看风格拼贴”，图版单独展开；可滚动、访问编号来源；点“收回图版”或按Escape，回到原阅读位置及入口焦点。也可以不展开、直接往下读原文。原生dialog隔离背景交互；固定body防止底页滚动；减少动态效果偏好关闭180ms淡入。没有3D翻页效果。浏览器后退键未接入图版状态，不作为本轮已实现行为。

## 本轮变量与保护

- 唯一新增设计：封面之后的轻量图版入口、独立图版视图与返回路径。
- 封面沿用Figma10B `1003:56` 的390×1146截图；CSS展示原开场y0–938（含原页眉与封面），原介绍另作HTML文字。截图本体未改。截图里的页眉不是可用的全站导航。
- 桌面阅读态仍居中显示390宽原稿，**没有制作新的桌面横幅封面**。桌面展开使用定稿拼贴宽版；手机使用定稿手机版。
- 词条原文逐字来自既有10B，与飞书快照来源沿用上轮记录；本轮没有编造正文、没有重新拉取或写飞书。仅接现有一段介绍，未完成全文。
- 拼贴来源：提交`13c7d07b73274fc7d307ecd1fb94595dc132b0ee`的`web-prototypes/term-style-board-2026-11-03`。原board-shell HTML逐字嵌入、styles.css字节一致，10件图像、标题、配色、坐标、核心句均保留。详见protection.json。
- 内嵌页只移除图版外围的研究工具栏与制作说明，保留原编号来源列表、字体许可；外部链接新页打开，避免离开图版。没有修改原目录中的任何文件。
- Figma、P1/P2、原词条、其他拼贴试稿和生产站未改；没有生图。

## Skill → 动作 → 证据

本轮重新读取[项目Editorial Layout Skill](../../.agents/skills/shenmei-editorial-layout/SKILL.md)，以及上游[page-composition](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)、[editorial-layout](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md)。本地网页准备/预览沿用Sites skill的local-only流程。结构SVG与可操作HTML是本轮交付；不冒充新增Figma可编辑画板。

| 规则 | 本轮具体动作 | 核验 |
| --- | --- | --- |
| E01 主次 | 入口为16px操作文字，不再设置第三张封面或第二个主标题 | reader.css #open-board；打开态只显示完整图版 |
| E05 保护画心 | 新操作放在原封面y938之后，24px边距、342px内容宽 | opening aspect-ratio 390/938；原图hash；390截图 |
| E06 阅读节奏 | 开场→可选图版→原文；关闭恢复位置与焦点，正文不依赖先开图版 | reader.js；previews/checks.json |
| E07 交付边界 | 新操作/正文为HTML，图版仍为原可编辑HTML；封面只用截图作交互承载 | 未新增Figma节点；不声称全页真实分层完成 |

这不是重新定色或换字体的一轮。新增控件沿用已有黑白纸墨关系与临时系统字体；没有把上游印刷规则或阅读模式当成普适审美定律。入口是否足够自然、是否保住美感仍待用户看实际稿。

## 检查

本地Chrome无界面浏览器实际检查320、390、430、1440四种视口：10张图像加载、无横向溢出、编号打开来源、在图版内按Escape关闭、按钮收回、阅读滚动位置及焦点恢复，全部通过，无页面脚本错误。390/1440截图已人工查看。测试代码check.py；需要Python Playwright及本机Chrome。

内置浏览器控制连接超时；Codex侧栏打开请求返回queued，不声称已看到用户侧栏。上述检查由本机Chrome独立执行；没有真机触摸/Safari验证，也没有验证“入口一定会被发现”。不把测试通过当作视觉验收。

## 保存范围

独立研究分支 `codex/term-collage-reader-2026-11-06`，新增本目录。原基线与master未覆盖。封面、图版资产、样稿代码与状态图一起保存；本地还有四个视口的检查截图。以后换词条时应替换各自作品/图版，不假设每个专题都用Coquette。
