# P4 手机首屏重排 v1

2026-11-01。状态：已制作、待用户审阅。只调整首屏结构，不视为新的配色或字体已采用。

## 产物

- [可编辑整页 896:62](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=896-62)
- [同尺寸首屏对比 896:197](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=896-197)
- comparison.png：左侧纸纹基线，右侧本次副本，各390×844。
- full-page.png：390×2317新稿。
- 受保护基线875:62仍为390×2389，画廊仍从y360开始，未修改。

## 本轮读取与资源应用

已核对远程master PROJECT_CONTROL.md（blob c59476723bf8e4c4650e75f213ee090737ca2e08）和CURRENT_STATE.md，读取本地AGENTS/README/CREATIVE_MEMORY，按最新用户指定纸纹版为基线。与P1线上工作隔离。

- [项目Editorial Layout skill](https://github.com/xianzhi10969-wq/shenmei-waigua/blob/master/.agents/skills/shenmei-editorial-layout/SKILL.md)，blob30d6f2b65ddade3e8c187b0585a2b120261f1634。
- [page-composition.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)：层级、主动留白、图文主次。
- [editorial-layout.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md)：开篇与阅读节奏。
- [Impeccable layout.md](https://github.com/pbakaus/impeccable/blob/main/skill/reference/layout.md)：先按意义分组，用紧凑和宽松间距形成节奏；此前研究已读取，非安装运行外部代码。

|规则|具体动作|实现与核验|
|---|---|---|
|E01 层级|中文题名主导标题区，英文和章号收成右侧辅助组，彩色作品仍为首屏主要内容|标题896:75为56px/64px；英文896:76为20px/28px；章号896:72为12px/20px；辅助组896:196|
|E02 轴线|保留24px左右边距，内容宽390−24×2=342；标题行左右两组，而非另起章号一行|标题行896:74；隐藏辅助层896:192；实际文字和画作沿同一左边距|
|E03 节奏|导航后12、标题到简介8、简介到目录4、目录到檐线12、檐线到画廊12px|主框仍为自动布局；目录y196/h44；檐线y252/h24；画廊y288|
|E05 呼吸|图像不缩小，减少上方逐行堆叠；正文仍原文两行|首幅画342×244保持；从y360提前至y288，共72px|
|E06 阅读顺序|导航→专题身份→五项索引→作品；索引顺序与画廊一致|索引调整为朦胧、清冷、Softcore、梦境、空灵；隐藏冗余5个子分类标签，保留原节点|
|E07 可编辑|副本中调整真实TEXT与自动布局；锁定图像及DISPLAY框|全部文本可编辑；无生图、无平面截图替代界面|

## 保护与验证

所有49个图像填充节点的fills（含imageHash/scaleMode/混合设置）与基线一致。48个图像节点尺寸一致；纸纹底层随页面缩短72px，仍为原平铺与65%透明度。五个DISPLAY画位尺寸及内部图像保持，画廊内部节奏保持；内容随首屏压缩整体上移72px。侧柱和渐隐随檐线整体上移68px，未缩放，未采用上一轮建筑透明度实验。

已检查Figma导出的852×912对比图：标题/英文/章号无重叠，介绍完整两行，五项目录完整可见，首幅画完整且未被文字侵入。静态检查不等于手机交互测试；未新增跳转或部署。新版仍待用户审美判断。

本轮使用上述排版资源。和田配色及朱雀仿宋是后续独立阶段候选，本轮未套用，避免将结构改动与换色换字混在同一轮。


截图保存在本机 research/2026-11-01-p4-mobile-header-v1/；本次GitHub同步为本说明，图片未上传。Figma链接可查看原始可编辑产物。
