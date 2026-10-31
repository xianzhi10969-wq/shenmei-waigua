# Netlify 发布副本 · P1→P3 连续 · 2026-10-31
- 站点 dceb69b5-e8d4-40f2-94c9-dc31d8ebd571，deploy id 6ae5446129bafb53d5d08871，<https://subtle-peony-38e354.netlify.app/>（根即连续 P1）。
- 内容 = `web-prototypes/p1-p3-continuous-2026-10-31/` 置于根（路径 ../ 改 ./）+ v4 原样目录（去掉预览 mp4）+ v3 两张手机原图。说明见该原型 README。
- 重发：`netlify deploy --prod --no-build --dir deploy/netlify-p1p3-continuous-2026-10-31 --site dceb69b5-e8d4-40f2-94c9-dc31d8ebd571`。回滚：后台 Deploys 选上一版 6ae542744bd98bc1a9a1b769 或更早 V2。
## 2026-10-31｜Netlify 当前线上内容说明（必读：只是静态快照，未接飞书实时数据库）

- **线上是什么**：<https://subtle-peony-38e354.netlify.app/>，deploy `6ae5446129bafb53d5d08871`（2026-10-31，netlify-cli，账号 xianzhi10969@gmail.com，site id `dceb69b5-e8d4-40f2-94c9-dc31d8ebd571`）。内容＝[P1→P2→P3 单页连续原型](web-prototypes/p1-p3-continuous-2026-10-31/README.md)，发布副本 `deploy/netlify-p1p3-continuous-2026-10-31/`。
  - P1→P2：v4 `p1-p2-reveal-star-v4-2026-10-21` 原样；手机用 m_p1/m_p2 @2x 原图，无星星落下动画。
  - P2→P3：`p2-p3-unified-v3-2026-10-25`（纸页升起＋星星接续＋24 刻度），P3 为彩窗 v3＋封面延伸。
  - 无 P4 及以后；无专题详情页；不是正式站。
- **数据来源（重要）**：P3 的 24 章名称、英文、定义、出处、封面，来自 `assets/topics.json` / `topics.js`——这是此前用 `lark-cli --profile aesthetic-feishu --as user` 只读拉取的飞书 Base `IGctbcuwPaE6hMsmAoicJddpn3U`「章节」表 `tblaYsGqDwNudnXs` **revision 118 静态快照**。**前端没有任何后端，不实时连接飞书**；飞书里改了内容，线上不会变，需重新只读拉取→重新打包→重新部署。
- **违反/未满足的规定**：按 AGENTS.md「数据架构：飞书多维表格后台 → lark-cli → 前端展示」，正式发布应走「lark-cli 只读同步 → 前端展示」链路（历史分支 `codex/backup-accepted-term-v2-2026-10-15` 的 `aesthetic-site/` 有同步脚本可参考）。本次没有在发布前重新同步，也没有接同步脚本，故只能称为**静态视觉 demo**，不能称为“发布”。
- **快照内发现的数据疑点（未改飞书，只记录）**：第 21 章「未来想象 Future Imaginaries」的定义写的是坎普（“坎普明知自己在表演……”），封面是比亚兹莱《孔雀裙》，疑似错位，待夕里在飞书核对。
- **回滚**：上午分两段版 deploy `6ae542744bd98bc1a9a1b769`；10/14 旧站文件备份 `deploy/netlify-backup-2026-10-31/`。
- **下一步（待夕里定）**：是否把飞书只读同步接进发布流程（构建时拉取 vs. 运行时经后端代理），在她确认前不改架构、不写飞书。

