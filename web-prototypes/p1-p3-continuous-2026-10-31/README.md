# P1→P2→P3 单页连续 · 2026-10-31 · 待审（已部署 demo）

一次向下滚动从 P1 连到 P3 末尾，不分段、不回入口。线上：<https://subtle-peony-38e354.netlify.app/>

## 组合与依据
- **P1→P2**：受保护基线 `p1-p2-reveal-star-v4-2026-10-21` 原样（iframe 内嵌，代码与画面不改），外层滚动同步驱动 v4 自身滚动；接法沿用 `p2-p3-water-iris-v2-2026-10-23/transition.mjs` 的 `?chain=1` 规则（v4 先走完自己的区间再交接星星）。依据 `transition-study-2026-10-23/README.md` 结论「P1→P2 保持 v4 原样，不加过渡」。
- **手机 P1→P2**：v4 只有 1440 宽桌面稿，手机用已有 390@2x 原图 `p3-stained-glass-v3-2026-10-23/assets/m_p1.png`(780×1688) + `m_p2_nostar.png`(780×2120) 纵向相接（与 v4 一样硬接），P2 水面星用 starB_cream 静置在 (70,859)，与 P3 段旅行星起点同位。
- **P2→P3 + P3**：`p2-p3-unified-v3-2026-10-25` 全部代码（纸页升起 paper-motion、星星接续 star-motion、24 刻度 ticks、左右翻页 motion/app、桌面画幅修复 desktop-fit）。该目录本已留 `#baseline` 但 JS 未接，本版在 transition.mjs 的 layout/render 里接上，并新增 continuous.css。源目录均未修改。
## 画面资产（均为仓库内最大已采用版本）
- P1 web：v4 bg/shrine/woman 1440×836、text 1440×900；P2 web：p2_nostar 1440×811（仓库无更高清的 v4 采用稿；`设计素材/P1-主视觉-2026-10-19/p1-desktop-no-text-1672x941.png` 非 v4 采用版，未替换）。
- P1/P2 手机：780×1688 / 780×2120（@2x）。P3：locked-pen-base 1448×1086 + 原色封面与蒙版（同 unified-v3）。
## 验证
playwright 本地与线上：Web 1440×900、手机 390×844 从 0 滚到末尾 progress=1.0，点「›」到 04；无 4xx、无 console error。截图与手机录屏在 /workspace/out/netlify-p1p3-continuous/（box）。
## 已知问题
- 手机 P1→P2 没有 v4 那样的星落动画（手机 P1 原图星是画死的）。
- 纸页升起不够丝滑（交接 GPT 文档仍有效）；真机未测；Web 宽于 1440 时 v4 两侧露纸色。
