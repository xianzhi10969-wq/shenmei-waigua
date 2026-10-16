# 审美外挂前端

## 当前状态与新会话入口（2026-10-16）

> 这一节仅说明 GitHub 本分支能确认的状态。**本地 Mac 工作目录、尚未提交的修改及线上部署状态仍须在实际环境核验。**

- **已保存**：2026-10-15 的 V2 前端备份（分支 `codex/backup-accepted-term-v2-2026-10-15`），保留已验收词条 V2 和现有首页。
- **待验收设计，尚未实现/部署**：当前分支 `design/term-v3-handoff-2026-10-16` 的 [V3 词条页设计交接](docs/TERM_V3_DESIGN_HANDOFF.md)。V3 目标是案例在词条内连续阅读、移动端优先、多图按实际数量显示；不得误认成已上线。
- **飞书**：Base 是内容真源，网站读取同步后的静态数据；更新飞书数据不会自动更新网站。
- **历史文档**：GitHub 默认 `master` 的旧交接仍可参考，但其中「前端是飞书页面」等描述已过时。
- **下一步技术前置核验**：在可访问 Mac 的 Codex 环境确认实际工作目录、Git 分支、未提交改动，以及与本 GitHub 备份的关系。未核实时，**不要覆盖、迁移、删除任何副本**。

**开新 Codex 对话时**，进入已有 `aesthetic-site` 工作目录即可，不要每次建新工程。Codex 应先读取当前目录的 `AGENTS.md`、本 README 与本次任务相关文档，自行恢复可核实的上下文；不要求用户转述旧聊天。

这是独立于飞书「页面」编辑器的前端源码。页面、样式、搜索、导航和案例展示都在 `dist/`，可直接让 AI 修改代码。飞书多维表格是内容真相源；`data/source/` 与 `dist/data.json` 是最近一次构建的快照。

## 内容同步

本机先确保 `aesthetic-feishu` Profile 已授权。运行：

```sh
python3 scripts/sync_from_lark.py
```

脚本从 Base `IGctbcuwPaE6hMsmAoicJddpn3U` 拉取章节、词条、案例、感觉入口、章节段落、好奇心问题和意象实验室题目；下载新增的附件、压缩为 WebP，并生成 `dist/data.json`。不改飞书表，也不改飞书页面。发布新版本后，内容变更才会出现在网站上。

词条页只组合「钩子」「核心」及独立案例、做法等字段。「正文」是旧的长文汇编，包含已重复或过期的案例段落，不进入公开快照。这样从 Base 重新同步时也不会把它们带回页面。

需要指定 CLI 路径时设置 `LARK_CLI=/absolute/path/to/lark-cli`。脚本始终显式使用 `--profile aesthetic-feishu --as user`，不依赖活动 Profile。

## 改前端

- 页面逻辑：`dist/app.js`
- 视觉样式：`dist/style.css`
- 页面入口与元信息：`dist/index.html`
- 数据映射与图片压缩：`scripts/build_data.py`

修改后运行 `python3 -m http.server 8000 -d dist` 本地查看。多轮迭代只更新本地预览；用户明确确认版本可以上线后，再从飞书同步、跑契约检查，并用同一份 `dist/` 同步发布 Sites 主站和 Netlify 镜像。不需要飞书 AI 参与。

## 路由

`#/` 首页、`#/chapters` 章节目录、`#/chapter/<record_id>` 章页、`#/term/<record_id>` 词条页、`#/case/<record_id>` 案例页、`#/curiosity` 好奇心漫游、`#/imagery` 意象实验室。哈希路由在静态托管下也支持直接分享链接。

## 当前数据策略

站点构建时读取飞书，运行时读取静态快照。它不会把飞书访问凭据放进浏览器或公开仓库。若将来需要表格修改后自动上线，可在托管平台增加定时构建或 webhook，同样运行同步脚本并部署。
