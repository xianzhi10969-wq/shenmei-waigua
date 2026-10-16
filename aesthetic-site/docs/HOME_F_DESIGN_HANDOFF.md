# 审美外挂｜首页 F 设计交付（2026-10-16）

> **状态：Figma 设计候选稿；未修改现有首页代码、词条 V2/V3、线上站点或飞书数据库。** 本分支由验收版 `codex/backup-accepted-term-v2-2026-10-15` 派生，保存设计决策和策展数据；不会合并进 master。

## 最重要的链接

- [完整桌面首页 F｜6 屏](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=107-2)
- [完整手机首页 F｜390px](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=109-2)
- [P1 原创功能试阅窗，清冷 / 多巴胺 / 废土](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=102-2)
- [P3 Cosmos 式桌面风格悬停](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=92-3)
- [P3 手机点选体验](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=97-2)
- [「分辨感觉」不先预设风格的二选一导览](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=104-2)
- [「意象实验室」的 3 个视觉状态](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=100-2)
- [艺术资源分类图鉴](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=105-2)
- [原 D 版（保留，不能覆盖）](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=47-2)

## 首页 F 结构

P1 品牌「审美外挂」像素矢量字标 + 「从有感觉到有风格」+ **独立原创的艺术化功能试阅窗**。目前三个离散状态，点击切换，不需要后台实时给 100 多个风格生成各自页面皮肤。创意原型 ≠ 最终艺术主视觉验收。

P2 **保留已认可的 D 版风格索引**，用真实作品与文学化的艺术图鉴排版展示选择丰富性，不把单一作品重复拿来做 P1 主题插画。

P3 **Cosmos 风格列表→预览**。桌面 ON_HOVER 和 ON_CLICK；手机上方预览+下方轻触切换。当前原型只有「清冷」「爱欲」「田园」三态，不等于整站所有风格已绑定数据。

P4 好奇心漫游 / 意象实验室，并从 P3 单独引出「分辨感觉」入口。意象实验室用“时钟＋发芽”做原型，静态 Figma 点击态不等于真正拖放；已另做 **独立 HTML 网页拖拽样机**，支持鼠标、触屏 Pointer Events 和点击回退。后续正式实现可重写为响应式 Web 组件，千万不要让每个组合都依赖 AI 实时生成昂贵视觉。

P5 **艺术资源**，按「灵感发现」「艺术档案」「交互网页」「开放素材」策展。每条资源有名称、外链、分类、使用时机和推荐说明。已整理十条数据到 `aesthetic-site/data/staging/art_resources_v1.json`。**这是待导入飞书的 staging 文件，绝不能称作已经写进飞书 Bitable。**

P6 搜索、继续翻阅与页脚。首页引导探索，已经设计好的词条 V3 继续负责详细阅读，不增加孤立的案例详情页。

## 跟 Google Arts & Culture 的明确差异

Google Arts & Culture 强在巨量馆藏、历史文化主题和沉浸式艺术实验；「审美外挂」不比馆藏数量，而应提供：

1. **用中文当代审美语义寻找美**：清冷、烟火味、破碎感、宿命感、朦胧等。用户即使没有艺术史名词，也能进入。
2. **可见的相邻风格辨认**：例如先选择“有距离的安静”与“边界溶解的轻盈”，再去比较清冷、朦胧等，而非机器给用户定人格。
3. **一套风格的跨媒介解释**：不只是馆藏信息，还连接时尚、摄影、文学、设计与作品的审美机制。
4. **可继续创作的出口**：Pinterest 媒介检索词、可信的可选配色、艺术资源、轻量意象组合。

这些是 **产品假设/设计方向**，尚不是已交付的成熟线上功能。

## Feishu 数据上线要求

内容真相源依然是用户的 **飞书 CLI / Bitable**。目前本对话没有直接可调用的飞书 CLI 或多维表写入工具，所以只完成了 GitHub 数据暂存和 Figma 视觉，不宣称已写回飞书。未来打开可操作 CLI 的本地工作环境后，应先只读核查资源表是否存在、字段数据类型和实际 table ID，然后按 `resource_id` 幂等 upsert，避免重复创建。数据表建议采用 `resource_id,name,category,url,description,use_case,tags,featured,display_order,review_status,license_note,cover_image_url`；分类是单选、tags 是多选或按已有 schema 处理。先备份飞书数据，再同步网站数据；不要直接修改 `dist/data.json` 作为唯一数据源。

原有作品图片与资源站点的图片**不是默认可随意商用的素材**。版权许可必须逐项检查。用户提供的 Readymag Caddy 链接未通过自动抓取验证，需要人工查看，不要凭空描述具体动画。

## QA 与工程边界

- 在设计确认前 **禁止动已验收 V2/V3、旧首页 D、master 或线上部署**。
- 移动版优先，390px 是当前设计基线，还需补测 320px 与平板和响应式。
- 桌面 hover 必须有 click/focus 兜底，手机使用 tap；注意可访问性和非 hover 设备。
- 拖拽有点击替代，避免精密自由拖动成为功能前提；首版只需两个可拖动意象→状态变化，不支持无上限自由画布。
- 性能：首屏插图使用 SVG/静态素材，图片资源懒加载，非必要动效应尊重 prefers-reduced-motion。
- 资源库前端从飞书导出数据渲染，验证外链，空封面不强制占位。
- 进入词条时落到已验收 V3 的阅读体验，导航路径和回退应可用。

## 当前明确未完成

资源数据**未写入飞书**；全部页面**未接入真实前端**；Figma P1 美术仍是候选设计；P3 只有 3 个绑定示例；“分辨感觉”的完整版推荐机制未实现；Figma 模拟拖拽只连通点击状态；HTML drag 小样是独立体验，不代表已经嵌入网站。上线前均需逐一实现和验收。
