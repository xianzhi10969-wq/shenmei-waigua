# 原画星星入口修正 · 2026-11-02

用户否决上一轮常驻左上角的“星星＋导航”：光晕在深色页突兀、遮挡建筑、字体不一致，翻页时有干扰。用户同意改成原画星星作为入口。此修正覆盖 `STAR-NAVIGATION.md` 中的悬浮按钮方案，旧提交和截图仅供回溯；本轮集成待用户视觉验收。

## 实现

继续在独立分支 `codex/star-navigation-integration-20261102` 修改；起点 `9f91587`。源码与 deploy 副本同步，未上线/推送/Figma 操作。

- 删除按钮自身的图像、“导航”字样和白色模糊背景。`star-navigation-anchor.mjs` 创建无绘制内容的原生 button，只添加点击区域与键盘焦点边框。
- 手机 P1 依原图 780×1688 的星心 `(145,1227)` 定位；P2 读取已有 `mstar` / `traveller` 的实际矩形；P3 沿用转场使用的玫瑰窗坐标（手机1199,279；桌面512,239），通过 SVG 屏幕矩阵定位。桌面 P1/P2 读取原 iframe 星星位置并换算缩放。
- 点击区域 44–96 CSS px，位于原星形中央；星星离屏、开场未完成或转场飞行时，入口不出现在可操作树中。不会在星星不在视野时另补悬浮入口。
- 滚动中禁止点击，停稳180ms后恢复；星星起手超过8px视为拖动，取消打开。鼠标模拟手机纵拖保留滚动，touch 使用原生 pan-y/pinch-zoom；pointerup/cancel/blur 后结束按压状态，避免鼠标经过旧区域导致跳页。
- P3 图录弹簧未停稳时不接受星星点击；初始未设置 target 时取当前 position，避免首次进入无入口。
- 导航 modal 仅锁 documentElement 的 overflow，保留 body 原有滚动容器关系，避免 sticky 画面在开关时错位；菜单滚动包含在自身，方向键不传给图录。关闭恢复原 scrollY 和星星焦点。
- “收起”和待开放说明明确继承 CabinetSong，权重400；栏目/标题统一现有字体，取消入口单独系统宋体。当前 song.ttf 与 V15 指向的字体文件 SHA256 相同。
- 目录 B 构图、五张插画、原开场/星星明灭/转场与 P3 W=80 均不改。

## 实测

Codex 内置浏览器，非手机真机。CSS尺寸：492×647、390×843、1309×818；设置尺寸与CSS尺寸受应用缩放影响。没有声称真机Safari手势已验收。

1. 492宽 P1 原星星（约92,481）轻点打开；星星起手纵拖约201px继续滚动，菜单不打开；松手后移动鼠标/继续滚动不再跳回原位置。
2. P2 原星星轻点打开，菜单滚动后背景 scrollY 保持1705.05；关闭恢复1705（浏览器亚像素取整）。无白色光晕或悬浮字样。
3. P2→P3 进度0.38521时透明入口 hidden，不遮挡/抢点击；完成后 P3 星心约246,157，44px点击区对应真实窗顶星。
4. P3首次进入、原星星打开/关闭通过；导航内 Right/End/滚轮后专题仍03，scrollY仍2762.727；关闭焦点回 `star-nav-trigger`。
5. 关闭后在封面上横拖，专题03→04；下一专题按钮04→05。原图录滑动/翻页正常。
6. 桌面 P1 原星心约725,384可打开；“美学专题”真实进入P3；P3窗顶也能打开；反向滚动至P2，入口回到水面星心约347,579。
7. 修正为只锁根容器后，桌面P2菜单开前/开中/关后：scrollY均736.818，cinema顶坐标均0.5256、baseline-pin顶坐标均0。菜单内滚轮不带动背景。
8. 390宽首屏原星心约72.5,613.5，67.5px点击区可打开；标题与“收起”计算字体均 CabinetSong，目录宽390，无横向溢出。
9. 代码模块语法解析、git diff --check、源码/部署文件一致性通过。原插画SHA256、app.js/motion.js/transition.mjs/styles.css/continuous.css/mobile-star-blink.js/brand-lettering.css与本轮起点相同。

截图：`navigation-checks/scene-p1.png`、`scene-p2.png`、`scene-p3.png`、`scene-menu.png`。旧 integrated.png/desktop.png 为前一轮失败接入的历史证据，不代表当前版本。

## Skill 与保护证据

本轮重读 `.agents/skills/shenmei-editorial-layout/SKILL.md`，经 GitHub 连接器读取上游 [grid-construction](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md) 与 [typography-rules](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/typography-rules.md)。用户已授权本文修正，不新开展版式/色彩方案。

- E02：采用“先测实际页面与图像坐标再对齐”，用原图坐标/实际屏幕矩阵取代固定角落位置；可编辑 DOM `#star-nav-trigger`。44px最低点击尺寸属于交互要求，不宣称符合印刷栅格。
- E04：沿用已讨论的文字角色和字号，修正同属辅助文字却使用另一字体的问题；`.star-nav-close` 与 `.star-nav-entry` 明确同族/400。字体文件逐字节哈希匹配V15。
- E07：透明button与目录文字仍为DOM；无新绘画或图片改色，五张插画哈希不变。无Figma节点，未声称完成Figma交付。
- E01/E03/E05/E06未重新设计；不宣称新做整套编辑版式。视觉仍需用户评价，程序检查不能代表审美认可。

## 远端与后续边界

本轮 CLI fetch 超时，已用GitHub连接器核对远端master `9c341f857e53e9d1c30038e303eebfe9b3f2fa00` 及最新总控/状态：另一路已采用P1构图A并发布；该变化与P6讨论不在本轮修改范围。当前导航仍是从8400175分出的独立本地集成，未覆盖最新线上，也未声称已合入最新master。后续合并应保留最新字标构图，原图坐标映射不依赖字标位置。

其余四个功能入口仍准备中；没有本轮之外的页面或数据接入。
