> **2026-11-10｜视觉重构覆盖声明（最高优先级）**：本仓库此前所有前端视觉表现、美学风格、页面构图、插画、颜色、字体、拼贴、装饰、动效与视觉基线均已失效，不得作为新版本的设计约束；包括此前已确认/已采用/已上线的画面。历史文件与素材保留，不删除。产品功能、内容分类、真实内容、数据结构、来源与非视觉逻辑不因此失效。**新任务必须先读 [视觉重构废止索引](VISUAL-REBUILD-RESET-2026-11-10.md)。**

> **2026-11-09最新**：用户取消强制二分，允许新增概念。旧44 mood／57 style及后续命名、关联暂停沿用。当前为[101条概念复核](product-work/2026-11-09-classification/README.md)，28 style／28 mood／32 other／13 pending，仍在阶段0待审。

# 审美外挂｜项目总入口（更新至 2026-10-24）

## 2026-11-08最新｜阶段0候选待签，逐阶段闸门生效

用户最新纠正覆盖下方同日旧方案：[当前产品决定](PRODUCT.md) → [阶段0四份表](product-work/2026-11-08-stage-0/README.md) → [阶段0—6任务与闸门](执行任务/2026-11-08-产品改版任务表.md)。101条分流（44 mood／57 style）、101白话名、76规范感觉词、179条标签归属候选已交；白话名 **0/101签审**，不得开始阶段1。

低能量mood与颓废美学style才是下一阶段的两个样板；旧随机三样稿、单模板、“跳转规划已完成”均停止沿用。好奇心总栏目等问题达到30条再讨论，四类资源映射取消并改为用途单页；mood路由、风格树、P4配方入口及付费边界已采纳为后续方向，按阶段推进。当前只交决定候选，不改已确认画面、运行数据、飞书或部署。

**每阶段结束必须汇报并等用户明确确认，不得连跨阶段。** 下方旧日期记录保留为历史，冲突处以本条与PRODUCT.md为准。[旧执行包处置](product-work/2026-11-08/STATUS.md)。

## 2026-11-08早段历史｜产品方向与旧接续入口

用户认可转向“理解自己为什么被某些东西吸引”，并要求归档、清理旧记录、拆任务后执行。先读 [PRODUCT.md](PRODUCT.md) → [认可原话与提案边界](产品决策/2026-11-08-Claude讨论-认可内容与提案边界.md) → [任务表](执行任务/2026-11-08-产品改版任务表.md)。

当前整站代码为 `aesthetic-site/`；内容以 `src/catalog.json` 和 `src/term-content-contract.json` 为准。主分支运行范围21张拼贴，11/08的37张是独立候选分支范围，非master已全量接入。P4/P5占位；好奇心总栏目与末页展开星星导航仍待做。11/01已停止沿用Le Pater旧布局，导航动作认可不等于字体和全部美术定稿。

旧资料按日期保留：关于“master没有完整站”“只认Le Pater布局”“首屏读取钩子”“旧正文全量拼接”的说法不再指导当前施工。详见[过时标注清单](归档/2026-11-08-过时内容标注清单.md)。本轮只改变产品文档、历史标注和独立编辑工作；未批准删屏、测试型付费墙或替换现有美术。


> **2026-11-07｜五张去重拼贴 v3 已确认并存库**：[Softcore／盛夏／多巴胺／颓废美学／复古摇滚完整归档](web-prototypes/collage-unique-v3-2026-11-07/README.md)，18 张新参考补为 42 个独立对象，双端源码、原图、预览与出处均已包含。[这一轮做了什么](web-prototypes/collage-unique-v3-2026-11-07/ROUND-CHANGELOG.md)。同物换角度／换裁切也去重；尚未接入整站，既有页面保留。

> **2026-11-07｜统一整站完整代码与本地部署**。当前网站源码、数据快照、全部图片/字体在[aesthetic-site/](aesthetic-site/README.md)。24章、101词条、144条保留案例和已有功能页统一接通，运行 `python3 aesthetic-site/serve.py` 后访问 http://127.0.0.1:8840/ 。案例完整阅读与双向滚动已检查，其他词条拼贴及P5分类专属映射继续补齐。

> **2026-11-07｜词条页当前确认版完整源码**：[吊灯开场→完整风格图谱→逐案例介绍解析](web-prototypes/term-scroll-return-2026-11-07/README.md)已纳入master。包含全部运行代码、26个素材文件、数据快照、字体许可与检查；可直接打开index.html。上下滚动返回吊灯已确认，原图谱十图依次显现保留。本次为Coquette完整页面存库，全词条批量接入与生产发布另行接续。

> **2026-11-04｜词条看板代码存库**：[Coquette 拼贴 v3、字体与黑框对照](web-prototypes/term-style-board-2026-11-03/README.md)已保存到 master。整体方向认可，字体可微调，现有词条页接入待定；未替换生产页面。

> **2026-10-31｜Netlify 首发记录（纠正“从未部署”误判）**：早期完整站 `aesthetic-site` **先通过 Netlify Drop 发布**，历史后台显示 **2026-10-14 11:16**；站点 [subtle-peony-38e354.netlify.app](https://subtle-peony-38e354.netlify.app/)，[后台部署记录](https://app.netlify.com/projects/subtle-peony-38e354/deploys)。完整 V2 源码留在历史分支 `codex/backup-accepted-term-v2-2026-10-15` 的 [`aesthetic-site/`（提交 b95caf9）](https://github.com/xianzhi10969-wq/shenmei-waigua/tree/b95caf91555549ddbd9ef58bccf3625fa8f76102/aesthetic-site)，**10/31时尚不在master；11/07起当前整站见根目录 `aesthetic-site/`**。10/20 的 [P3/P4 Sites 动效预览](https://aura-p34-motion-study-20261020.xianzhi10969.chatgpt.site/) 是另一套原型，不能代替早期完整站。Netlify 当前可用性/当前线上版本尚未复核；Netlify Drop 不需要 GitHub 部署分支。详细出处与跨 AI 查找规则见 [整站总控·部署历史纠正](PROJECT_CONTROL.md#2026-10-31部署历史纠正完整站先发布于-netlify必读)。


> **2026-10-25｜当前最新 P3**：用户明确要求采用「星星接续 v1」。以 [当前 P3 入口](CURRENT_P3.md) 为准；此前 P3 候选/待审记录保留作历史。Web 已实现可预览，用户尚未单独审阅桌面效果；不将本次指定版本扩大为双端全部细节验收。刻度版与并行排印版未合并，Figma/生产站未在本轮更新。


> **生图和页面落地怎么接续**：[项目创作短记忆](CREATIVE_MEMORY.md)汇总参考图分工、草稿到完成稿、整体主次、真实分层、可编辑版式与可打开预览的经验；[详细审计](视觉研究/2026-10-24-生图与页面落地-项目记忆审计.md)保留失败出处与未核验边界。新任务按相关工序阅读，不重复让用户解释已明确目标。


> **本轮最新同步**：[P3 封面延伸＋双端 Figma＋手机滑动修复＋水面折射动效](handoffs/2026-10-24-round-sync/README.md)。完整源码已进入 master；封面延伸已采用，宽幅与转场仍待审。

> **2026-10-24 新增版式 Skill 入口**：版式、杂志、栅格或 Figma 排印任务必须打开 [项目专属 Editorial Layout Skill](.agents/skills/shenmei-editorial-layout/SKILL.md) 并阅读指向的上游具体章节，用 [证据模板](.agents/skills/shenmei-editorial-layout/EVIDENCE_TEMPLATE.md) 输出“规则→动作→节点”核验。背景见 [P2 Skill 失败复盘](视觉研究/版式系统/2026-10-24-P2-Skill执行复盘与防漏机制.md)。仅下载/搜索/读过 ≠ 真正使用。


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

> **2026-11-08历史标注**：本节含10月状态/旧结构，已被本文件顶部及 [PRODUCT.md](PRODUCT.md) 的接续说明部分取代。当前工程、导航及内容字段以11月记录和实际源码为准；保留基线保护、只读原则与原始证据，不执行已过时建议。

| 部分 | 唯一推荐接续入口 | 核验边界 |
| --- | --- | --- |
| P1→P2 | [Grok 的显影开场 + 星 B 坠落 v4](web-prototypes/p1-p2-reveal-star-v4-2026-10-21/README.md) · [动效细节](web-prototypes/p1-p2-reveal-star-v4-2026-10-21/MOTION-NOTES.md) | 用户确认完成的独立原型；不等于已合并正式生产网站 |
| P3／P2→P3 当前 | [当前 P3](CURRENT_P3.md) · [星星接续 v1](web-prototypes/p2-p3-star-continuity-v1-2026-10-25/README.md) | 2026-10-25 用户指定当前最新版本；Web 已实现待单独审阅，未生产发布 |
| P3→P4 | [恢复版 v9 柜体与书册](web-prototypes/p3-p4-restored-v9-2026-10-21/START-HERE-2026-10-21.md) | 用户要求保留的基线；v10 花叶适配稿未采用 |
| Figma | **01 CURRENT 入口**：[306:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=306-2)（与「三处放哪」／CURRENT_STATE 一致）· 旧节点 [144:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=144-2) 仍可打开作对照，**勿当今日入口** · [已认可功能 05/07 · 137:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=137-2) · [词条 V3 · 81:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=81-2) | 静态画板 ≠ 可跑交互；**01 已同步最新 P3 Web577:13／Mobile577:195；旧494:4/5保留。封面延伸已采用，宽幅与转场待审；v9代码保护不变** |
| 星星导航（布局已认可） | [星星导航 · Le Pater 构图交接](产品决策/2026-10-21-星星导航-Le-Pater结构与交互-跨会话交接.md) · [Figma Web＋Mobile 布局 434:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=434-2) | **仅认可布局**：五个等权徽章纵列 1/5、右侧完整预览 4/5、标题带叠压；Figma 画出的徽章／配色／字体／占位插画均不认可，导航展开动效未实现 |
| 参考资料 | [产品参考库](参考库/产品参考库/README.md) · [流量参考库](参考库/流量参考库/README.md) | 艺术/交互对标与获客对标分开管理 |

## 当前主要产品结构（概要，细节以 CURRENT_STATE 为准）

> **2026-11-08历史标注**：本节含10月状态/旧结构，已被本文件顶部及 [PRODUCT.md](PRODUCT.md) 的接续说明部分取代。当前工程、导航及内容字段以11月记录和实际源码为准；保留基线保护、只读原则与原始证据，不执行已过时建议。

首页 P1 视觉序章 → P2 四个常见美学困惑（不是搜索）→ P3 一级专题入口（钢笔彩窗＋适度封面延伸已采用；宽幅与转场待审；v9柜体基线继续保护）→ P4 细分风格图录（C 方案，可跳 V3 词条；教堂座椅为新研究方向）；好奇心问题与意象实验室在后段，P5/P6 先后待定；**P7 目前未定义**。独立“寻找感觉”检索页、专题详情、V3 词条、艺术资源都应该可以从适当入口直接到达。

**当前未解决的画面任务**：P2→P3 的水面连续性、星 B 继续下落至 P3 彩窗的视觉关系，以及上滑可逆；星星导航的 **Le Pater 1/5 徽章列＋4/5 大预览＋标题叠压的布局结构已被用户确认**，详见 [星星导航 · Le Pater 构图交接](产品决策/2026-10-21-星星导航-Le-Pater结构与交互-跨会话交接.md)；但 **Figma 现有其他绘制视觉全部未获认可**，实际揭幕/切换动效、导航入口位置仍未确定。保留 P1→P2 v4 和 P3→P4 v9，禁止覆盖改造。

**状态警示**：P1 标题、P3/P4 临时文字不能当作最终文案；v9历史原型仍为六组演示；本轮彩窗已读取24章封面静态快照，但不等于后台实时连接、24章详情或P4均已完成；V3 设计不等于已在当前正式站点实现。

## 历史资料（可回溯，非今日施工依据）

- [10/20 P1–P4 审稿交接](web-prototypes/home-p1-p4-2026-10-20/README.md)：其中的 P3/P4 v10 **未采用**；旧 P1→P2 已被 v4 取代。
- [10/18 P1 创作复盘](视觉研究/2026-10-18-P1-当日设计复盘与有效资产交接.md) · [仓库过时内容审计](视觉研究/2026-10-18-仓库重复与过时资料审计.md)
- [旧 V7/G17 资源](视觉研究/2026-10-18-P1-V7-干净回滚基线与资源清单.md) · [旧 CURRENT_STATE 长时间线](归档/CURRENT_STATE-2026-10-18-更新前完整时间线.md)
- [旧产品方向](产品决策/) · [历史执行任务](执行任务/) · [历史对标笔记](对标/)

仓库 `master` 包含当前 `aesthetic-site/` 整站源码及资料、独立原型。运行范围与内容核验以该目录README及最新CURRENT_STATE记录为准；但历史完整工程与 Netlify 发布记录已明确存在，**不能反向推断「从未做过/部署过网站」**。历史文档保留以便追溯，不删除、不重写 Git 历史；新的艺术或交互实验先独立保存和验收。
