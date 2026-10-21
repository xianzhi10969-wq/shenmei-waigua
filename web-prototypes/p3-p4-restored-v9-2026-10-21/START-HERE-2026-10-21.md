# 新对话从这里接续 · P3–P4 · 2026-10-21

本轮任务仅归档和核对，不重画、不修改运行代码、不发布新预览。当前接续基线为用户要求回退后的 Sites 第 9 版。恢复基线不等于全部视觉、内容和交互已最终定稿。

## 先读与取文件

1. 阅读仓库根目录 [CURRENT_STATE.md](../../CURRENT_STATE.md) 和 [AGENTS.md](../../AGENTS.md)。
2. 读取 [本目录说明](README.md) 和 [动效说明](MOTION-NOTES.md)。
3. 可运行入口 [dist/index.html](dist/index.html)。请用静态服务器打开整个 dist，ES modules 不能只靠双击 HTML 运行。
4. 图片、字体与许可均在 [dist/assets](dist/assets/)；完整路径、文件大小和哈希见 [归档清单](ARCHIVE-MANIFEST-2026-10-21.json)。
5. 在线预览 https://aura-p34-motion-study-20261020.xianzhi10969.chatgpt.site 。本轮没有更新该预览，也没有重新核实线上部署状态。

## 关键文件

| 用途 | 路径 |
|---|---|
| P3 原六组中英文专题名及图片映射 | dist/motion.mjs 内 entries |
| P3 手机端柜体 | dist/assets/cabinet-portrait-47e404ae4794.png |
| P3 桌面柜体辅助素材 | dist/assets/cabinet-22aaeaa96e29.png；实际三窗浏览由同画风图层与视口组合，定位以代码为准 |
| 中间展开固定柜体与活动板素材 | dist/assets/secretary-cabinet-open-v1.png、secretary-desk-art-v1.png |
| P4 手机书册 | dist/assets/book-eba616b5d0c5.png |
| P4 桌面双页书册 | dist/assets/book-desktop-approved-v1.png |
| 转场控制与几何 | dist/motion.mjs、dist/motion-geometry.mjs |
| P3 布局 | dist/style.css、dist/index.html |
| P4 临时内容与排版 | dist/folio-content.mjs、dist/folio-content.css、dist/index.html |
| 验证脚本与手机运动基线 | checks/motion.test.mjs、checks/accepted-mobile-baseline.json |

六个专题为忧郁 / Melancholy、爱欲 / Eros、田园 / Arcadia、幽玄 / Yūgen、酒神 / Dionysian、留白 / Liubai。按原图比例展示，不把六条当作全部 24 专题。

## 版本与画风边界

- 本目录是恢复版；原始 Sites 源码提交 e390355c7658153e87a9fa6da922ffd7ffbd7392，追加恢复提交 01948162a40b518e4b41e386332cb437c4175aa4。以上是 Sites 源码 SHA，不是 GitHub 本仓库的 SHA。
- 本仓库恢复存档提交 345fd03c5a99a509a8e215f13274121d7dbfd9aa。
- web-prototypes/home-p1-p4-2026-10-20/p3-p4/ 与 设计素材/P3-P4-花叶线描-2026-10-20/ 保留为未采用历史稿，不能混入当前基线。
- P1 title、P3/P4 文字仍为临时效果；本目录不包含 P1/P2 和 P5 的完整工程。
- 后续优化保留原柜体/书册框架。与 P1/P2 对齐的是钢笔画法、线宽、疏密和秩序，不能照抄 P1 元素；避免伪阴影、3D 厚度和装饰喧宾夺主。
- P2→P3 的衔接与星星如何进入场景仍需另开方案验证，本次归档不代表该衔接已经完成。
- 所有新方案另存目录、分支并单独预览。用户确认方案且明确要求替换前，不得覆盖当前代码、素材或预览。

## 本次实际核对

- 32 个运行文件和资源逐字节计算 Git blob SHA，与 GitHub 已存档文件全部一致；另核对 2 个检查文件，共 34 个文件。
- 扫描运行文件的本地 assets 引用，未发现缺失文件。
- 重跑 node checks/motion.test.mjs 通过 120,012 个几何状态，覆盖手机基线、桌面比例、输入/尺寸变化、内容容纳和图册控制。
- 未做浏览器视觉、真机触控或 Figma 导入验收；代码检查通过不能代替用户审图。
