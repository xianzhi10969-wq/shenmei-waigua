# 白→黑过渡研究（2026-10-23，提案，未批准）

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
