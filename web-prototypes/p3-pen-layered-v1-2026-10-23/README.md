# P3 钢笔彩窗 · 固定图层 v1

2026-10-23｜独立待审版本。未覆盖钢笔原图、v4、v9、彩窗 v3、Figma 或线上站点。没有生成或重绘封面，没有写飞书。

## 打开

- 双击 `彩窗图录-v1-离线.html`：图片、字体、脚本均内嵌，离线可用。
- `dist/index.html`：分层源码入口，可直接打开或用静态服务器预览。
- `dist/index.html?proof`：原 Web＋Mobile 双幅构图的分层对照。
- `dist/index.html?proof&layer=base`：只显示原底图。
- `dist/index.html?proof&layer=glass`：原底图＋夜玻璃蒙版。
- `dist/mobile-review.html`：390×844 手机取景。

离线单文件与 ZIP 保存在本地交付目录；GitHub 保存分层源码与原始素材。克隆后可运行 `tools/package_offline.py` 重建离线 HTML。重新下载封面前，需要按本轮相同的只读字段范围导出 `data/chapters.ndjson`；运行下载脚本时显式设置本机 `LARK_CLI` 可执行文件位置。数据快照与封面不是浏览器实时请求飞书。

## 固定边界

1. `dist/assets/locked-pen-base.png` 是上一轮完成稿的逐字节复制，SHA256 `93e3307d41dcebcbeb7a7fa28e341fabbb8b16feaff4b536cd3240b1f42731a1`。所有添加项均是上层独立 DOM/SVG 图层，原 PNG 无编辑。
2. 每个窗洞蒙版从该 PNG 的闭合墨线提取，包含内沿 1px 安全间距；画心再按 13×13 最小值滤波向内腐蚀 6px，留下连续墨黑玻璃槽。花格线与窗洞形状固定。
3. 原色图片使用等比 cover 裁切（SVG `xMidYMid slice`／HTML `object-fit:cover`），没有滤镜、调色、渐变罩色、拼贴或拉伸。
4. 题签图层单独存在，并再次被原题签内部轮廓蒙版限制，不能覆盖石框；焦点题签使用燕尾卷轴。
5. 一次仅切换焦点窗洞。桌面其余四格、手机两侧局部窗格、花格与星窗均固定。全 24 章在焦点窗洞逐格翻阅，首尾停靠，不自动播放。手势、箭头和方向键均可操作，减少动态效果设置受支持。

## 数据来源

本轮用 `lark-cli --profile aesthetic-feishu`、`--as user`，只读解析用户原始链接并读取同 Base 的「章节」表 `tblaYsGqDwNudnXs`。用户链接指向「词条」，本轮按“章节封面”的明确要求选用章节表。

查询结果：revision **118**，24 条，`has_more=false`。24 张附件均用专用下载命令取得并核对原附件字节数；每张 SHA256、尺寸、原文件名与出处见 `dist/assets/topics.json`。前端不包含访问凭据，只读取静态快照；它不是实时数据库连接。

## 动效来源与实现

[Embla Carousel 8.6.0](https://github.com/davidjerleke/embla-carousel/tree/v8.6.0)，MIT，本地包含许可证。参考其官方 `Options.ts`，采用 `slidesToScroll:1`、`dragFree:false`、`skipSnaps:false`；额外限制一次手势最多前进／后退一个专题。依赖已随源码保存，不要求在线 CDN。

## 核验

- 原底图复制前后 SHA256 一致；24 张附件原始大小核对通过。
- 桌面按钮：01→02；拖动：02→03；逐页至 24 后下一页禁用；键盘：24→23。
- 手机 390×844 的布局、按钮 01→02 与独立题签保护已检查。尚未以真机触摸测试；目前是浏览器内手机尺寸预览。
- 初次桌面切换截图对照，焦点开口与题签之外的舞台变化像素 **0**。见 `checks/visual-diff.json`。
- 未发布站点；待用户审图。源码及素材的 GitHub 同步状态以收尾记录为准。
