# 手机首页字标接入 · 2026-11-01

用户“可以，先这样吧，你先放进去”确认采用黑色 B 主字标和 companion 配套题字。副题原文：从有感觉到有风格。

## 实现与边界

- 实现提交 `cf5de2e`；分支 `codex/home-logo-lettering-20261101`，基于 `0dc572e`，已保留最新手机开场显影。
- 源目录 `web-prototypes/p1-p3-continuous-2026-10-31/`；发布副本 `deploy/netlify-p1p3-continuous-2026-10-31/`。
- 独立 SVG `assets/p1-brand-companion-v20261101.svg`，独立样式 `brand-lettering.css`。路径与已认可 companion/black-lockup.svg 逐条一致，仅添加 390×844 定位容器。
- 390 宽时组合原点 y=82；主标 x=13.56，尺寸 272.4×272.85；副题 x=66、y=355.7，宽160。随原画等比缩放，随 mstack 滚出；没有把截图擦字拼进生产页面。
- 本轮只接入手机（≤680px）。桌面使用原 v4；未改 Figma、导航、飞书数据。

## 验证

- 浏览器实页 390×844、430×932：主副字完整，无重复文字或与人物重叠。截图 `logo-mobile-review.jpg`，本地预览 `logo-review.html`。
- 已检查下滑进入 P2、P3 彩窗和上滑回到 P1；合并最新显影后重载，原画按序出现，字标正常保留。
- 已核对原 PNG SHA256 `b9a9df57d989d62528987641d1a5d5d6bd4a753e0f33e95a4ab4c45344b6a182`；transition.mjs、continuous.css 相对最新远程保持一致；源/发布 SVG 一致；8字副题逐字核验。
- 未做真机 Safari 测试；未给字标新增单独入场动画。

## Editorial Skill 证据

本轮已读取项目 `.agents/skills/shenmei-editorial-layout/SKILL.md`（通过 git show）及上游 [page-composition](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)、[typography-rules](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/typography-rules.md)。

- E01/E05：沿用已认可的主标→副题→插画顺序与留白；坐标见上文，双宽度实页检查。
- E02/E03/E04：以390宽画幅同比缩放，固定主副关系；保留定制字形的光学间距，不机械套用正文行长或印刷基线模数。
- E06：P1字标随原画滚出，P2/P3节奏与代码保持原状。
- E07例外：本轮为用户认可矢量字标的网页接入；字形是可编辑SVG路径，不是可重排TEXT，未做/声称Figma节点施工。原插画独立且字节不变。

## 发布状态

实现与发布包已就绪，尚未发布。Netlify CLI 返回 NOT_LOGGED_IN；已向用户提供原账号登录授权入口。现在线上基线仍为开场显影部署 `6ae6e9bbfc9fb75b68726055`（最后已记录版本，非本轮字标部署）。授权恢复后发布到同一 site id `dceb69b5-e8d4-40f2-94c9-dc31d8ebd571`，禁止换站。发布前再次 fetch，保留并行修改。
