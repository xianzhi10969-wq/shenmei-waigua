# 星星导航 · 首次代码接入 · 2026-11-02

> 此文保留首次接入历史。悬浮按钮已被用户否决，当前实现见 [原画星星入口修正](STAR-NAVIGATION-SCENE.md)。

用户决定结束视觉探索、进入代码。沿用 V15 B 对齐目录；此次是独立分支的实际网页接入，尚未合并/推送/部署。不是全站五项功能完成。

- 基线：origin/master `8400175`；分支 `codex/star-navigation-integration-20261102`。
- 源码：本目录；自包含预览：`deploy/netlify-p1p3-continuous-2026-10-31/`。稀疏检出应预览 deploy，源码页面依赖相邻历史资源目录。
- 本地预览：<http://127.0.0.1:8874/star-navigation-2026-11-02/deploy/netlify-p1p3-continuous-2026-10-31/>
- 未改 Figma、飞书或 Netlify；研究 demo-v15 原稿保留。

## 文件与真实接入范围

- `star-navigation-data.mjs`：五个栏目与原图映射。
- `star-navigation.mjs`：独立原生 dialog，开合/插画渐隐、按需加载、键盘与焦点、滚动恢复。
- `star-navigation.css`：B 版响应式排版，原纸色/墨色与 Flexoki red-600 标题强调。
- `star-navigation-host.mjs`：宿主路由配置。只有美学专题启用，调用现有 `goToTopics()` 进入 P3 真实 24 专题图录。
- 另四项为明确“准备中”，可以预览插画，不能跳到无关内容；后续真实页面接好后仅补对应 route。历史全站备份存在，不等于已经整合到本主线。
- `transition.mjs` 仅追加导出适配器；P1/P2 开场代码、素材、P3 弹簧 W=80 及图录逻辑保持。
- 插画请求延后到打开并访问对应预览，首屏不预取五张图；缓存每张图片 decode 结果，快速切换用序列标记防止旧图覆盖。
- 原生链接保留组合键新标签页行为；动画完成后才进入专题。未实现全站前端路由框架。

## 验证记录

2026-11-02，Codex 内置浏览器，本地静态站：

- 首次打开前五张插画均无 src；访问五个入口后五张全部成功解码。
- 开关/重开、Esc、Tab 从末项回到关闭按钮、Home/End/方向键预览通过。
- 未开放项 Enter 后出现明确提示，保留导航，不跳转。
- P1 打开导航→美学专题，现有图录实际出现；下一专题由 03 田园变成 04 幽玄。
- 图录 04 上打开导航并使用方向键/End 后，背景图录 aria-valuenow 仍为 4。
- Esc 关闭后焦点返回触发器、P1 scrollY 返回 0。真实手机触摸/VoiceOver 未测。
- CSS 实测尺寸 492×647、354×767、320×560、1309×818。内置浏览器缩放使设置尺寸与 CSS 像素不同；以下均记录真实 CSS 尺寸。
- 320×560：五项完整显示，最右文字边界约 244px，末行底部 410px，无横向溢出。
- 354×767：最长条目右边界约 245px，无溢出；1309×818：标题 50.66px，无横向溢出。
- 浏览器无 error/warn；四个 mjs 经 Node VM 模块语法解析通过；git diff --check 通过。
- 源码/部署副本的组件、数据、样式、宿主与 transition 内容一致。
- 五张 PNG 两份拷贝 SHA256 均与研究原图相同，见 `assets/star-navigation/manifest.json`。
- `motion.js/app.js/styles.css/continuous.css/mobile-star-blink.js/brand-lettering.css` 两侧均与基线逐字节一致。
- 截图见 `navigation-checks/desktop.png`、`navigation-checks/integrated.png`。截图是验证材料，不替代源码；视觉沿用用户暂停迭代时的版本，集成效果仍可继续验收。

## Editorial Skill 应用证据

读取本仓库 `.agents/skills/shenmei-editorial-layout/SKILL.md`，对应上游：
- <https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md>
- <https://github.com/medoismail/grid-systems-editorial-skill/blob/main/typography-rules.md>

本轮不新设视觉方案；用户授权按当前 B 版进入代码。无 Figma 操作/节点，以下为真实 DOM 与 CSS 实现证据。

|规则|实施与证据|
|---|---|
|E01 层级|五个 `.star-nav-title` 同字号/同权重，数字独立列；红色只标当前预览。`h2` 与“准备中”为辅助信息。未按重要度放大某栏目。|
|E02 对齐|桌面左边距 clamp(32px,9.68vw,140px)，数字宽20px、栏间22px；手机左30px、数字16px、栏间12px。最长中文5字在320px内实测通过。未机械套印刷12列。|
|E03 节奏|标题统一1.4行高；桌面行间距 clamp(16px,2.45vh,24px)，手机 clamp(16px,2.76dvh,24px)，触控区域至少44px；短屏改12px行距并允许容器滚动。是视口适应节奏，未声称固定印刷基线模数。|
|E04 字号|桌面标题34–52px、提示标题14px、编号12px；手机标题26–31px、提示标题12px、编号10px；短屏标题28px。沿用现有 CabinetSong/朱雀仿宋，与站内统一。|
|E07 可编辑与保护|栏目名称、编号、说明均为独立 DOM 文字；图片独立绝对定位层，multiply及手机局部mask保留原版逻辑，无图像重绘/着色。原 PNG 哈希核验通过。|

## 后续

先接后续板块的真实页面与数据，再开启对应 route；不要把“准备中”误称功能已上线。独立分支可合并到后续整站工作，不要用本目录覆盖其他人的 P5/P6 研究或新版主线。
