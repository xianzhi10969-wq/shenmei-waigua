# 过渡研究（2026-10-23）

> **结论（夕里确认）：P1→P2 保持 v4 原样，不加过渡。** 下方 hatch / wave / stars / wave-v2 / wave-v3 均为 **已弃用 / 仅研究**，保留不删。
> 当前唯一在推进的是 **P2→P3（夜水 → 彩窗纸面）**：`p23-wave-context.html`，见文末。

## 【已弃用/仅研究】P1→P2 白→黑过渡

## 问题定位
v4 `p1-p2-reveal-star-v4-2026-10-21`：P1 纸面 `#f9f6ef` 的 section 在 y=900px 结束，P2 图片 `p2_nostar.png` 第一行起就是实心 `#14191E`，**0px 过渡的硬切**（截图 `shots/before_v4_P1P2_junction.png`）。P3 v1 的黑→白是星星+水面线退场带动，有叙事承接，问题较轻。

## 三个方案（只用 #F6F3ED / #1E1E1E，纯矢量线，无渐变/颗粒/阴影）
- `hatch.html` A 刻线密度带：横向刻线等距，线宽从 0.3px 加粗到并合成黑（铜版画“以线宽表调子”）。
- `wave.html` B 水波刻线边：波纹线越往下越密越粗，最后落进黑水，呼应 P2 水面。
- `stars.html` C 星光溶解：Bayer 4×4 有序抖动，黑夜上缘被纸色星点蚀开。
- 滚动时纸色遮罩以硬边退去，线“被刻出”；`#static` 显示完整状态；尊重 reduced-motion。

## 推荐
A 为底（最像铜版画），上缘线条换成 B 的波纹，形成“纸→刻线→水”。C 作为星星落水瞬间的点缀。

截图/视频见 `shots/`（mp4 为静态长图平移模拟滚动，非真实动效录屏）。v4/v9/P3 v1/v2 未改动。

## B v2（夕里选定方向，精修版）
- `wave-v2.js`：每一刀是填充的刀痕轮廓（两端尖、中段鼓），不是等宽 stroke；共享"水面起伏场"让相邻刀线一起弯；顶部发丝细且稀疏，向下变密变粗变长直至重叠并合；并合边缘不规则；黑中留少量纸色短反刀，最后一段纯黑接 P2 首行。
- 实测 v4 P2 水面刻线：纸色细刀 1–2px 粗、两端尖收、长约 50–150px、近水平微弧、稀疏不连续——v2 的刀形与反刀照此。
- `wave-v2.html`：独立（#F6F3ED/#1E1E1E）。`wave-v2-context.html`：上接 v4 P1 底部实渲染、下接 v4 `p2_nostar.png` 原图。为无缝，该页纸/墨用两张实图实测色 #F3F0E9 / #14191E（不是规范色，见遗留问题）。
- 截图：`shots/wave-v2_context_desktop.png`、`shots/wave-v2_context_mobile.png`、`shots/wave-v2_detail_zoom3x.png`；真实滚动逐帧录屏：`shots/wave-v2_context_{desktop,mobile}_scroll.mp4`。

## 【已弃用/仅研究】B v3
`wave-v3.js`/`wave-v3.html`/`wave-v3-context.html`：去掉剪影黑边，黑只由刀线并合；每行准泊松排刀+单调覆盖曲线防成团；收刀发丝挑尖。其刀线生成器被 P2→P3 复用。

## P2→P3 铜版水波过渡（当前方向，待夕里审）
- `p23-wave-context.html`：滚动驱动。底层是 P3 v1 完成态截图（`p3_v1_end_desktop.png` / `p3_v1_end_mobile.png`，只读引用，未改 v1）；上层是 P2 夜色（#1E1E1E），其下缘不是 v1 的 clip-path 硬边，而是 `wave-v3.js` 上下翻转的刀线带：实黑 → 刀线并合 → 变细变稀变短 → 溶进纸。夜色从窗台以下向上退出画面，星 B 从水面/窗台沿中轴升到玫瑰窗；在黑上为纸色线、进入纸面换墨色，抵达后隐藏，交给 P3 玫瑰窗自带的星。只用 #F6F3ED / #1E1E1E。
- 截图：`shots/p23_{desktop,mobile}_{00,35,60}.png`（滚动 0% / 35% / 60%）；3 倍细节 `shots/p23_detail_zoom3x.png`；真实滚动逐帧录屏 `shots/p23_{desktop,mobile}_scroll.mp4`。
- 日后并入 p3-stained-glass-v2 的方法（本次未动 v2）：在 v2 的 `.sky` 夜色层底部挂一个 `<svg>`，调用 `waveV3(svg,W,FH,{seed})` 并 `transform:scaleY(-1)`；把 v2 里 `sky.style.clipPath=inset(...)` 的硬边收起改为整层 `translateY` 上移（刀线带随之上移）；水面 `.water` 下沉逻辑可保留或同样换成刀线带；星的墨/纸切换按"星心是否已越过刀线带中线"判断。
