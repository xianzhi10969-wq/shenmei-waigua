# 版式资源 → 本轮动作 → 检查

读取日期2026-11-07。项目规范：[shenmei-editorial-layout](https://github.com/xianzhi10969-wq/shenmei-waigua/blob/master/.agents/skills/shenmei-editorial-layout/SKILL.md)。

上游已阅读条目：
- [typography-rules.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/typography-rules.md)
- [editorial-layout.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md)

本轮只将方法用于可编辑SVG结构与中性HTML验证，不宣称完成Figma设计或最终美术。上游无明确LICENSE，不复制其全文。

| 规则 | 动作 | 实际证据 |
|---|---|---|
| E01 信息层级 | 词条名/英文/位置在画前，真实图注在画后，入口最末 | gallery.js item()/art()；独立header/figure/figcaption/a；手机结构图可编辑文字 |
| E02 对齐 | 手机页边24px，320宽收至20px；文字轴比图左边缩进42px（320宽34px） | gallery.css .page/.section-label/.work-credit；96视图无横溢出 |
| E03 垂直节奏 | 同一件内部紧密，作品之间72px；desktop100px | .gallery/.section-label/.entry-link；手机实图查看并检查 |
| E04 少量字号角色 | 临时系统衬线；章名52、词名25、位置14、图注12、入口13 | 不作字体阶段验收；层级可编辑，非生成图片 |
| E05 保留画心 | 原图比例决定框高，内衬3px；无图不撑空画框 | 全46封面尺寸核验；手机横/竖/缺图实际展示 |
| E06 编辑顺序 | 同一观看轴，按原文从树荫到太阳；不同图比例产生自然节奏 | 原有position逐字展示；全101条保留，幽玄既有顺序特例保留 |
| E07 可编辑 | SVG独立rect/path/text，网页原图和文字独立；素材文件只读引用 | 三份SVG与HTML/CSS/JS源码；不是Figma节点交付 |

保护：独立目录、候选分支，所有原图沿用aesthetic-site/public只读文件；未修改任何基线源文件。可运行 != 审美已通过。
