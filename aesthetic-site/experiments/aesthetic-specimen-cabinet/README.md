# 六格美学玻璃标本柜 · 柜体研究 001

**未验收的独立原型，未修改正式首页，未部署。**

## 直接观看

- 电脑预览：http://127.0.0.1:8766/
- 同一 Wi-Fi 的手机：http://192.168.1.8:8766/ （本机当前局域网地址，换网络后可能变化；Mac 需要保持唤醒）。
- 无服务器也可直接用浏览器打开本目录 `index.html`，全部资源均为本地相对路径。
- 本机双击 `preview.command` 可启动/打开预览。其他电脑在此目录运行 `python3 -m http.server 8766` 即可。

## 实际实施位置与保护边界

本机真实前端：`/Users/yuriko/Documents/Codex/2026-10-16/pages-05-07/work/aesthetic-site`。
原型：上述目录中的 `experiments/aesthetic-specimen-cabinet/`。

实施前核实了三个前端候选目录、分支、未提交状态以及运行中的 8765 预览。运行中预览的 `app.js`、`pages-05-07.js`、`data.json` 与本工程逐字节一致。当前聊天目录是无提交、无 remote 的空仓库，未用它复制另一套前端。

本机前端保持 `codex/pages-05-07-2026-10-16`，只新增隔离实验目录，没有切换、暂存或提交别人的修改。实验开始前保存了全工程文件校验值，完成后对照核验。`baseline.json` 只供本地保护检查，不上传。

GitHub 交接分支使用 `codex/aesthetic-specimen-cabinet-2026-10-17`，以决策所在 master 的 `c9ab80c7c2ef9e31671f4ab3443b26d498710aff` 为基点，只加入本实验目录；不复制完整前端，也不更新 master。远程路径为 `aesthetic-site/experiments/aesthetic-specimen-cabinet/`。没有创建 PR、合并或部署。

## 实现

- 一个连续 SVG 柜体，六个垂直格室，每格八层玻璃搁板，共 48 层。
- 原创浅透视柜体，顶面/侧面厚度、背部导轨、玻璃层板、薄金属横框/立框、铰链和把手。
- 克制的玻璃反射及墙面投影，空柜只含六个标注「占位」的预留矩形。
- 全尺寸原生按钮覆盖格室；点击、触摸或键盘 Enter/Space 开启独立观察 dialog。
- 观察层可切换上一格/下一格，按 Esc、返回按钮或桌面点击遮罩关闭，恢复原来的焦点和横向浏览位置。
- 手机保留横向连续柜体，加六段位置图、左右控制与「看全柜／靠近看」切换，不拆成卡片列表。
- 原生 dialog 语义，焦点循环，可见 focus，禁用边界按钮，reduced-motion 关闭动画。
- HTML / CSS / 原生 JS，无 npm 安装、无 WebGL、无运行时网络请求、无持久化写入、无飞书依赖。

## 视觉依据与素材边界

以 2026-10-17 当前有效产品决策和六格任务书为准，已读取 master 指定三份文件，以及实际前端 AGENTS.md、README.md、DESIGN.md。最新冷白玻璃/金属方向优先于旧纸质杂志视觉合同；使用实验自己的 `tokens.css`，不修改正式 `dist/theme.css` 或根 DESIGN.md。

唯一形体参考是 [布里斯托大学论文 PDF 第 52 页 Fig.7](https://www.bristol.ac.uk/media-library/sites/arthistory/migrated/documents/2013johnson.pdf#page=52)。已下载并实际渲染查看该页；只观察连续展柜、六格比例与密集层板，没有把原作照片、医疗物件或其他第三方图像加入原型。

SVG 只构造柜体，不承担正式艺术标本制作；所有材料渐变集中在 `cabinetSVG` 的 defs 内，网页语义色在 `tokens.css`。字体使用本机宋体及系统字体，不依赖网络字体。

## 文件

- `index.html`：独立入口和观察层。
- `cabinet.js`：柜体渲染、插槽数据、交互及焦点管理。
- `cabinet.css` / `tokens.css`：响应式、材料以外的样式与独立 token。
- `check.cjs` / `test-results.json`：浏览器自测脚本与结果。
- `desktop.png`、`mobile.png`：1440×900 和 390×844 实际浏览器截图。
- `desktop-detail.png`、`mobile-detail.png`、`mobile-overview.png`：观察层及手机全柜截图。
- 原始 PNG 留在本机；GitHub 分支附同名 `.webp` 压缩截图，保持原始尺寸。

## 未来替换标本

`cabinet.js` 开头的 `compartments` 是独立插槽数据。每格 `slots` 指定 `shelf`、`x`、`width`、`height`、`src` 和 `alt`。现在 `src: null` 显示明确占位。

未来将已验收的透明 PNG/WebP/SVG 放在本实验的 `assets/`，填入相对 `src` 和说明，保持 `preserveAspectRatio="xMidYMax meet"`；无需重做柜体。接入正式内容前须再设计可访问的作品说明和对应数据库契约，本次没有接入或假造正式词条/作品。

## 验证与已知限制

本机已安装 Chrome，通过 Playwright 自动化检查；完整结果见 `test-results.json`。六格开关、Escape、焦点恢复、Tab 循环、手机触摸模拟、横向位置恢复、最右第六格、全柜模式、reduced-motion、320/390/768/1024/1440 宽度无页面横向溢出均通过；无 JS 运行错误。已实际查看桌面、手机、观察层与全柜截图。修复过键盘焦点越界、移动端滚动吸附导致末格提示错误及桌面首屏比例问题。

Chrome 手机模拟不等同于真实 iPhone/Safari 测试；尚未在实体手机及 Safari/Firefox 验证。此版是静态浅透视的 2.5D，非可旋转三维模型；开格采取独立观察层，未把物理柜门开启或抽屉抽出机制定稿。正式美学标本、正式首页整合与最终视觉验收仍未完成，按本轮范围暂不执行。
