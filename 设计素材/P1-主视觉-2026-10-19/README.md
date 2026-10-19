# P1 主视觉无字与有字版本 · 2026-10-19

本目录只保存已制作的图像文件，不改变页面代码、CSS、Figma 及设计决议。

## 文件

- `p1-desktop-no-text-1672x941.png`：桌面原始无文字画稿，1672 × 941。与 2026-10-18 独立素材包的 `locked-art-no-type.png` 完全相同。
- `p1-mobile-no-text-390x844-at2x.png`：手机无字画稿，780 × 1688（390 × 844 CSS 像素，设备像素比 2）。直接取 **2026-10-18 已展示的手机版构图**，仅隐藏网页文字图层；人物、圣匣、位置、尺寸与原有字版相同。
- `p1-mobile-with-text-390x844-at2x.png`：手机有字画稿，780 × 1688；与此前交付的 `mobile-390.png` 逐像素一致。

## 溯源与保护

手机版 **不是** 桌面原稿的单纯竖向裁切。原手机版来自 `shenmei-mobile-independent-hero.zip` 中的 `preview-standalone.html`，其中独立摆放已认可人物、圣匣、背景和 V7 字形图层。

制作无字版时只隐藏以下元素：`.mobile-topline`、`.mobile-title-wrap`、`.mobile-subtitle-art`、`.mobile-art .faint-label`、`.mobile-caption` 和屏幕阅读器标题。未改变图像图层及其 CSS 定位。

验证：使用同一原 HTML 在 390 × 844、DPR=2 下重新截图，与此前 `mobile-390.png` 比较，RGB 像素差平均值为 0。然后仅关闭文字图层输出无字版。

图像存在仅代表资产已归档，**不自动宣告设计验收，也不自动替换线上首页**。

## SHA-256

- 桌面无字：`21c7e9999a5a6ebebee74c3cf3c520c6be86af1603c70f52b60ee2fd47b88661`
- 手机无字：`b9a9df57d989d62528987641d1a5d5d6bd4a753e0f33e95a4ab4c45344b6a182`
- 手机有字：`6058c208248da97ccd3ef7f672116e9ac1417d007e3e1265dc5bde73e9d89912`
