# 本轮同步｜P3 封面延伸、双端画板与 P2→P3 动效

同步日期：2026-10-24。范围仅为本对话的 P3 与 P2→P3 原型；不替换其他对话的 P2 配色/版式候选，不发布生产站。

## 直接入口

- [Figma 主流程 306:2](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=306-2)
- [最新 Web 577:13](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=577-13) · [最新 Mobile 577:195](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=577-195)
- [Figma 本轮交接与运行链接 577:312](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=577-312)
- [完整动效源码](../../web-prototypes/p2-p3-water-iris-v2-2026-10-23/) · [采用的封面延伸源码](../../web-prototypes/p3-cover-extension-layer-v1-2026-10-23/) · [原生分层构建记录](../../web-prototypes/p3-adopted-figma-2026-10-23/)
- [节点、尺寸、字体与 imageHash 检查](checks/figma-sync.json) · [版式规则执行证据](EDITORIAL-EVIDENCE.md)
- [Web 静态检查图](checks/figma-web.jpg) · [Mobile 静态检查图](checks/figma-mobile.jpg)

源码来源为分支 `codex/p3-adopted-water-motion-2026-10-23` 的 [8af4a66](https://github.com/xianzhi10969-wq/shenmei-waigua/commit/8af4a66f7de5ace3faa978ceb336efc65ce8dfdd)；本次将三个独立目录原样纳入 master，不再只有分支链接。

## 采用与待审分开记录

**已采用**：用户原话“我还是觉得有适当的封面延伸比较好 就采取这个版本吧”。保留钢笔底图、象牙白花格、墨黑玻璃槽、原色封面、独立题签，少数上部窗格延续对应封面的局部。封面不重绘；窗框与蒙版不变。

**已实现、待视觉验收**：P2 水面折射进入彩窗；下滑/上滑可逆；Web 在 1440 画布内以 1344 宽等比例展开。没有横向拉伸教堂。Web 画板为 1440×1660；手机为 390×844，彩窗区域约 279.087×660.739，仍是独立手机取景。

**滑动修复已保存**：横向翻阅整列移一格，原第 2 格成为第 1 格；窗框固定。手机尺寸关闭桌面 Lenis，横向触控板按手势单格停靠，窗框/拱顶可横拖，纵向拖动控制转场。手动输入停止自动预览；父子页进度同步。

## 运行

在仓库根目录启动静态 HTTP 服务（不要直接双击模块 HTML）。例如 `python3 -m http.server 8770`，然后打开：

- Web：http://127.0.0.1:8770/web-prototypes/p2-p3-water-iris-v2-2026-10-23/review.html
- Mobile：http://127.0.0.1:8770/web-prototypes/p2-p3-water-iris-v2-2026-10-23/review.html?device=mobile

本地链接要求服务正在该电脑运行。Figma 是原生蒙版/图像/矢量/文字分层的**静态稿**，未将 HTML 的 WebGL 转场伪称为 Figma 可运行原型。

## 检查与限制

2026-10-24 重新运行几何验证：4002 个双端采样，端点与反向对称通过，80 份继承资产逐字节一致。此前真实浏览器鼠标/触控板输入检查见 [手机手势记录](../../web-prototypes/p2-p3-water-iris-v2-2026-10-23/checks/mobile-gesture-fix.json)。

本次 Figma：Web 186 个子节点/25 个蒙版；Mobile 117 个子节点/15 个蒙版（含各 3 个默认隐藏的尺寸辅助节点）。原钢笔图 imageHash 均为 `3dbfd0fa346334ff8731a55f7aa1cf52a17610ca`，原图层 locked。题签显示原字体矢量字形并保留隐藏可编辑原文。界面小字沿用 Noto 代字体，字体匹配**未完成**，不能声称完全等效网页字体。

手机测试是桌面浏览器中的手机尺寸和真实输入，尚非真机触摸与帧率验收。P1→P2 完整像素对照仍未补齐；P4 未正式贯通；不代表整站完成或生产部署。

## 保护记录

- 旧 P3 `494:4/494:5` 保留在 [577:12](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=577-12)；原采用稿 `525:2` 与宽幅候选 `533:6` 均未改。
- P1/P2 v4 与 P4 v9 的主流程内容节点检查一致；主流程仅因 P3 高度变化由 Auto Layout 自动顺移。
- P2 独立版式 `539:8`、配色历史 `552:8/126/244` 及其他对话新候选不修改、不替其验收。
- master 原有目录保持不变；新增三份独立原型目录及交接文件。飞书只读快照没有重新写库或修改数据。
