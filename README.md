# 审美外挂｜项目总入口（更新至 2026-10-23）

> **新对话 / Grok / ChatGPT / Codex / Work 的统一起点**：先读 [PROJECT_CONTROL.md](PROJECT_CONTROL.md) → [CURRENT_STATE.md](CURRENT_STATE.md) → [AGENTS.md](AGENTS.md) → 本次涉及的**当前版本目录**。这三处区分已确认事实、待研究方案和历史归档；**旧文件标题中有“当前/ACTIVE/LATEST”不代表今天有效**。

> **整站总控（强制）**：[PROJECT_CONTROL.md](PROJECT_CONTROL.md) 统一首页 P1–P7／五功能／Figma 05/07／S1–S14 编号与验收状态；[历史资料溯源](产品决策/2026-10-23-历史编号与资料溯源.md) 专门记录命名冲突。**开始任何设计、动效、数据或前端任务前先读 GitHub 最新远程文档，确认分支与 SHA；从对话猜不到的结论必须标「待核验」。**

## 三处放哪（GitHub / Figma / 飞书）

东西不在同一个地方。本地文件夹空了或过期，**先 clone 或 `git pull` 本仓库**（`https://github.com/xianzhi10969-wq/shenmei-waigua`，分支 `master`），不要在桌面「审美外挂 2」之类空目录里找 v4 / 彩窗 / CURRENT_STATE。

| 放哪 | 管什么 | 怎么进 |
| --- | --- | --- |
| **GitHub**（本仓库 master） | 网页原型、交接文档、`CURRENT_STATE.md`、提示词、检查截图。重点目录：`web-prototypes/`（含 P1→P2 v4、P3→P4 v9、彩窗 v3 等）、根目录 `CURRENT_STATE.md` / `AGENTS.md` / `README.md` | clone 后 `git pull`；以远程为准 |
| **Figma** [pIL4mlWLHxph3pqXlIVq1s](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s) | 定稿／提案画板、手机长构图。**画板不以 GitHub 为真相源**；静态板 ≠ 可跑交互 | 入口：[01 CURRENT · 306:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=306-2)；其余链接见下方「当前工程与设计入口」表 |
| **飞书多维表格** [IGctbcuwPaE6hMsmAoicJddpn3U](https://my.feishu.cn/base/IGctbcuwPaE6hMsmAoicJddpn3U) | 专题封面、文案、词条等真实素材；前端只展示、不手写编造 | 用 `lark-cli` **只读**拉取；细则见 `CURRENT_STATE.md` / `AGENTS.md`「数据架构」 |

## 当前工程与设计入口

| 部分 | 唯一推荐接续入口 | 核验边界 |
| --- | --- | --- |
| P1→P2 | [Grok 的显影开场 + 星 B 坠落 v4](web-prototypes/p1-p2-reveal-star-v4-2026-10-21/README.md) · [动效细节](web-prototypes/p1-p2-reveal-star-v4-2026-10-21/MOTION-NOTES.md) | 用户确认完成的独立原型；不等于已合并正式生产网站 |
| P3→P4 | [恢复版 v9 柜体与书册](web-prototypes/p3-p4-restored-v9-2026-10-21/START-HERE-2026-10-21.md) | 用户要求保留的基线；v10 花叶适配稿未采用 |
| Figma | **01 CURRENT 入口**：[306:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=306-2)（与「三处放哪」／CURRENT_STATE 一致）· 旧节点 [144:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=144-2) 仍可打开作对照，**勿当今日入口** · [已认可功能 05/07 · 137:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=137-2) · [词条 V3 · 81:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=81-2) | 静态画板 ≠ 可跑交互；**01 上彩窗 P3 帧（494:4/5）是提案，不等于 v9 代码已切** |
| 星星导航（布局已认可） | [星星导航 · Le Pater 构图交接](产品决策/2026-10-21-星星导航-Le-Pater结构与交互-跨会话交接.md) · [Figma Web＋Mobile 布局 434:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=434-2) | **仅认可布局**：五个等权徽章纵列 1/5、右侧完整预览 4/5、标题带叠压；Figma 画出的徽章／配色／字体／占位插画均不认可，导航展开动效未实现 |
| 参考资料 | [产品参考库](参考库/产品参考库/README.md) · [流量参考库](参考库/流量参考库/README.md) | 艺术/交互对标与获客对标分开管理 |

## 当前主要产品结构（概要，细节以 CURRENT_STATE 为准）

首页 P1 视觉序章 → P2 四个常见美学困惑（不是搜索）→ P3 一级专题入口（v9 柜体保护基线；彩窗 v3 待审；可跳专题详情）→ P4 细分风格图录（C 方案，可跳 V3 词条；教堂座椅为新研究方向）；好奇心问题与意象实验室在后段，P5/P6 先后待定；**P7 目前未定义**。独立“寻找感觉”检索页、专题详情、V3 词条、艺术资源都应该可以从适当入口直接到达。

**当前未解决的画面任务**：P2→P3 的水面连续性、星 B 继续下落至 P3 彩窗的视觉关系，以及上滑可逆；星星导航的 **Le Pater 1/5 徽章列＋4/5 大预览＋标题叠压的布局结构已被用户确认**，详见 [星星导航 · Le Pater 构图交接](产品决策/2026-10-21-星星导航-Le-Pater结构与交互-跨会话交接.md)；但 **Figma 现有其他绘制视觉全部未获认可**，实际揭幕/切换动效、导航入口位置仍未确定。保留 P1→P2 v4 和 P3→P4 v9，禁止覆盖改造。

**状态警示**：P1 标题、P3/P4 临时文字不能当作最终文案；P3 现有可运行画面展示的六组专题不代表 24 个全部完成；V3 设计不等于已在当前正式站点实现。

## 历史资料（可回溯，非今日施工依据）

- [10/20 P1–P4 审稿交接](web-prototypes/home-p1-p4-2026-10-20/README.md)：其中的 P3/P4 v10 **未采用**；旧 P1→P2 已被 v4 取代。
- [10/18 P1 创作复盘](视觉研究/2026-10-18-P1-当日设计复盘与有效资产交接.md) · [仓库过时内容审计](视觉研究/2026-10-18-仓库重复与过时资料审计.md)
- [旧 V7/G17 资源](视觉研究/2026-10-18-P1-V7-干净回滚基线与资源清单.md) · [旧 CURRENT_STATE 长时间线](归档/CURRENT_STATE-2026-10-18-更新前完整时间线.md)
- [旧产品方向](产品决策/) · [历史执行任务](执行任务/) · [历史对标笔记](对标/)

仓库 `master` 是资料和独立网页原型的合集，**不能据此声称最新 `aesthetic-site` 全量代码、Mac 本地工程、正式站点部署及飞书实时数据库均已同步**。历史文档保留以便追溯，不删除、不重写 Git 历史；新的艺术或交互实验先独立保存和验收。
