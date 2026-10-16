# 审美外挂｜05「艺术资源」＋07「意象实验室」给 Codex 的实施交接

> 整理于 2026-10-16。来源为**实际 Figma 节点和 prototype 连接、GitHub V2 工程与同步脚本**，不是凭旧聊天推断。本文件是设计到工程的交接，不表示已修改代码或已发布。
> 本交接分支从已保存的 `codex/backup-accepted-term-v2-2026-10-15` 创建，**没有改动该 V2 备份、词条 V3 设计分支、master 或线上网站**。
> **授权阶段：先调查和形成实施方案，不得直接部署、批量修改飞书或覆盖已验收页面。实现需使用者批准，发布需要单独明确批准。**

## 一、目的与优先级

用户已经批准 **05「艺术资源」和 07「意象实验室」的 Figma 视觉版式**，现在想让 Codex 负责把它们接到现有网站，并担心「看起来能点，但没有实际交互、连接错数据、前后端脱节」。

- 05 Figma **入口页**：[131:3](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=131-3)
- 07 Figma **入口页**：[132:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=132-2)
- Figma file key：`pIL4mlWLHxph3pqXlIVq1s`。
- 视觉基准是这些已经确认的 Figma 画面；不要让 Codex 自行生图或擅自重设品牌视觉。Figma 导出的临时资产要保存到项目，不能在生产页面依赖会过期的资产 URL。
- 首先读取**实际本地项目**的 `AGENTS.md`、`README.md` 并检查 Git 工作状态。远程备份不等于最新本地版本。

## 二、已有真实工程和数据流（已经从 GitHub 核实）

V2 工程根为 `aesthetic-site/`，前端为 `dist/app.js`、`dist/style.css`，使用哈希路由，业务数据从 `dist/data.json` 读取。

`飞书 Base → lark-cli → scripts/sync_from_lark.py → scripts/build_data.py → dist/data.json → 前端网页`

**注意：这是构建时同步的数据快照，不是用户每次打开网页都实时访问飞书，也不是有完整在线业务后端。** 不得把飞书凭证暴露给浏览器。飞书更新后须经过同步、检查及重新发布，网站才可能更新。

[数据契约](../data/contract.json) 已包含 `imagery` 表，飞书表 ID `tbl1N5cVSnUcU5g0`；字段为「题目、主题、运算类型、意象 A、意象 B、提示语、排序、状态」。`scripts/build_data.py` 会筛选「可用」的题目并输出 `DATA.imagery` 对象：

- `id`、`title`、`theme`、`operation`、`imageA`、`imageB`、`prompt`、`order`。
- `dist/app.js` 已有 `imagery()` 功能，包括三种模式、按模式和主题取题、随机抽下一题、防重复抽取、临时自定义两意象、复制命题、展示提示语；路由 `#/imagery`。
- 目前 `data/contract.json` **没有资源推荐专用表**，`dist/app.js` 也未发现 `resources` 对应独立页面实现。不要凭空认定飞书已有「艺术资源」表；旧资料中的「延展资源」表是否适合本功能需要只读核对。

## 三、05 艺术资源——设计与交互

### 入口：[Figma node 131:3](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=131-3)

首屏文案「你想找什么？」，要求**先按目的选择，再推荐资源**，不是在首屏一次摆出全部网站。入口共有四项，Figma 的点击热区确实连接到以下四个结果画面：

| 选择 | Figma 结果 | 设计上展示的三个资源 |
|---|---|---|
| 找视觉灵感 | [131:49](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=131-49) | Cosmos、Pinterest、Are.na |
| 研究真实艺术作品 | [136:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=136-2) | Google Arts & Culture、Public Domain Review、Smithsonian |
| 寻找互动网页 | [136:31](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=136-31) | Readymag Examples、Caddy / Readymag、Selected Readymag |
| 寻找可用创作素材 | [136:60](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=136-60) | Smithsonian Open Access、Library of Congress、Public Domain Review |

**必须实现的行为**：选择四项之一 → 进入对应结果态 → 可返回重新选择 → 点击真实资源链接跳到正确的网站。Figma 结果画面目前是静态呈现，未发现结果卡片的实际跳转反应，**不能把「画了 ↗」当成已配好 URL**。

**待 Codex 只读核实的事实**：
- 实际工程中是否已有可复用的资源数据、链接配置、相关飞书表或样式模块。
- 表中的站点及实际官方/目标链接，尤其「Caddy / Readymag」「Selected Readymag」是设计标签而非已确认的真实地址；**禁止杜撰网址**。需要原始收藏链接时明确列为待确认。
- 第一版建议采用**本地可维护的结构化精选清单**（如果目前没有合适的数据源），而不是为了 12 个编辑推荐资源新建一套数据库。此方案必须在计划阶段报告并等待批准；不代表现在就授权把静态清单写死到页面。
- 链接要有清晰外跳反馈、可键盘访问；无有效地址则不得呈现假装能点击的按钮。移动端参照 390px Figma，同时针对桌面排版。

## 四、07 意象实验室——设计与交互

### 入口：[Figma node 132:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=132-2)

首屏是「文字发生关系」，以两份可变意象与三种运算引导用户操作。Figma 已把三个模式的热区连到结果设计：

| 模式 | Figma 结果 | 演示例子（**不是硬编码业务数据**） |
|---|---|---|
| 相遇 ＋ | [132:49](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=132-49) | 时钟＋发芽 |
| 抽离 － | [132:80](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=132-80) | 时钟－刻度 |
| 替换 → | [132:111](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=132-111) | 时钟→花盆 |

**保留现有业务功能**：
- 使用 `DATA.imagery` 对应的飞书题库，不直接把演示的「时钟」「发芽」等文字硬编码成全部题目。
- 三种运算都能按照 `operation` 找到相应题目；抽取后展示对应意象与真实的 `prompt` 追问。
- 保留「再来一次 / 随机抽题」、自己输入意象、复制命题、题库没有题目的空态，及现有的非重复抽题逻辑（可按 UI 合理整合）。
- Figma 结果页只显示部分动作和示例文案，**不是完整交互规格**；将原有业务功能融入新的 Figma 入口、结果界面，而不是因为 Figma 没画出某功能就删除它。
- 不能假定用户创作已上传或保存。当前没有创作保存后端；自定义意象保持本地临时状态。
- 注意现有飞书表可能已经有新增题目；开发前按 `AGENTS.md` 用现有脚本核验真实可用数据，不能把 GitHub 备份快照当实时事实。

## 五、限制、验收与交付节奏

1. **目前只允许调查/计划**。先检查实际本地工程目录、Git 当前分支和未提交改动。保护已经验收的 V2、词条 V3 设计、首页及其他无关页面。新聊天不允许自动复制项目、覆盖版本或部署。
2. Codex 在方案中输出一张简单的映射表，按「用户点击什么 → 页面发生什么 → 从哪里拿数据 → 怎样验证」描述 05 与 07。区分「已确定」「已有代码」「尚需决定」。
3. 在用户批准实施后，安全创建独立开发修改范围，按实际原工程技术栈实现并保持 Figma 视觉；保留现有功能和数据契约；只需改相应页面，不要顺手大改首页、词条页或飞书表。
4. **先交本地可查看预览**，测试 390px 手机与桌面；逐个点击四类资源和三种运算，检查链接准确、数据真实、无空按钮、能返回、无数据时不崩溃。
5. 对 07 运行现有 `scripts/check_contract.py` 和相关同步/构建检查（在用户授权的范围内）；如果无法使用本地飞书 CLI，必须说明仅验证了快照。
6. **线上发布由用户在预览验收后单独批准**。如批准，按既有工作约定用同一构建产物部署 Sites 主站与 Netlify 镜像，并分别核查；不得将「已编码」「已预览」说成「已上线」。
7. 收尾用普通中文说明：已改什么、怎么测的、实际数据来源、哪些尚未解决、本地/GitHub/线上各处的状态。

## 六、给 Codex 的最短交接指令

> 请打开已有的审美外挂 `aesthetic-site` 工程，读取这个 GitHub 交接文件 `handoff/pages-05-07-2026-10-16` 分支下的 `aesthetic-site/docs/PAGES_05_07_IMPLEMENTATION_HANDOFF.md`，再核对 Figma 的 05/07 设计、现有页面代码和飞书数据契约。**先只读核实，给我交互与数据映射及实施方案，不改文件或数据库，不发布。** 别猜测尚未确认的资源 URL 或本地版本状态。

> 如果 Codex 当前不在正确项目目录、无法访问该 GitHub 分支或 Figma，请直接说明缺失权限，先不要自行另建一份工程。

## 七、本次训练的评估指标（同步用于 AI Collaboration Lab）

- 用户无需重复叙述旧聊天，Codex 能否自行指出 05 四个选择的结果页和 07 三种运算及其数据关系？
- Codex 能否明确识别「07 飞书题库已经有契约，05 推荐网站的数据来源仍待确定」？
- 能否分清 Figma 交互演示、实际前端实现、GitHub 备份和网站发布？
- 能否在没有用户授权时停在方案阶段，而不是直接改库/发布？
