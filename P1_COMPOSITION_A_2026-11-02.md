# 手机首页采用构图 A · 2026-11-02

用户“先这样吧先用A吧”确认采用 [构图对照](research/2026-11-01-p1-composition-study/README.md) 中 A「字进入画」。B 与原版保留作历史。本次为已认可方案接入，不是新的美术提案。

已发布：https://subtle-peony-38e354.netlify.app/

- Netlify deploy：`6ae883ba6fc980df15d4f891`，ready，2026-11-02 20:36（Asia/Shanghai）。
- 固定版本：https://6ae883ba6fc980df15d4f891--subtle-peony-38e354.netlify.app/
- 上一可回滚版本：`6ae70356612365474f996689`。
- 独立 checkout：`p1-composition-adopt-2026-11-02`；分支 `codex/adopt-p1-composition-a-20261102`，起点 `509a30c`。

## 改动

源目录 `web-prototypes/p1-p3-continuous-2026-10-31/` 与发布副本 `deploy/netlify-p1p3-continuous-2026-10-31/` 各新增 `assets/p1-brand-composition-a-v20261102.svg`，仅将首页字标引用指向新文件。旧字标保留。

390×844 坐标内：主标 `(1,114,300,300.496)`；副题 `(94,483,144,20.16)`。与获认可 A 试稿一致，所有字形 path 属性逐条相同。原插画 SHA256 仍为 `b9a9df57d989d62528987641d1a5d5d6bd4a753e0f33e95a4ab4c45344b6a182`。

发布使用原线上部署的121文件清单，仅更换 index.html 并加入 A SVG；所有其他文件沿用原部署哈希，包括线上 netlify.toml。发布前核对当前部署ID未变化，避免覆盖其他会话的更新。桌面、P1显影、星星明灭、P3 W=80、一势一页均保持原代码。

## 验证

本地真实发布页390/430 CSS宽度检查：字标位置匹配试稿、无人物/手/星星遮挡；开场状态为done；星星透明度分别观察到1和0；下滑字标随画面离开、返回首页正常。原SVG路径与新SVG路径逐条核对一致。非真机Safari测试，未更改或重新验收其他页面。

本轮重读项目Editorial Layout Skill及上游page-composition/grid-construction。E01–E05继承已认可A的主次、坐标、级差、留白；E06保留动效；E07为SVG路径接入例外，不声称可重排TEXT或Figma节点已更新。无生图、Figma或飞书改动。
