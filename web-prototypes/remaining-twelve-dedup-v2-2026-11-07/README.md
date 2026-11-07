# 十二张拼贴 · 去重修订候选

2026-11-07。用户查看十二张手机旧稿后指出多张用图重复，要求修改。本目录是双端独立待审版本，基准为 [上一版十二张候选](https://github.com/xianzhi10969-wq/shenmei-waigua/tree/67f96cc7df340be85db57b35767e8853d691ef24/web-prototypes/remaining-twelve-dense-2026-11-07)。旧稿、整站、飞书案例关系和已确认的拼贴保持原位。

- 将同图的不同裁切、同一件作品或同一个场景的其他角度合为一次出场。前稿 136 个片段，修订后为 62 个独立画面，十二张各有 4–6 个。
- 《The Teenage Gaze》的镜前女孩、夜里并坐的朋友、镜中自拍是不同照片；《Gas》的 Shell 和 Chevron 是不同实体站点。分别登记了画面身份，不把同一个地点或同一构图反复放大。
- 从现有案例与项目档案补充可区分的新参考，例如《寒江独钓图》《海边的修士》《帝国的进程：荒芜》。在图版与来源表标为「补充参考」，沿用原始归属。
- 保留白底、标题、原色、两端画幅以及主要阅读方向。用更大的主图和不同尺寸的次图补回裁片减少后的画面占比。源文件保留原图字节，构图与裁切在 SVG 中可编辑。

[手机总览](preview-mobile.jpg) · [桌面总览](preview-desktop.jpg)

## 审阅与重建

从本目录运行 `python3 -m http.server 8890`，打开 `http://127.0.0.1:8890/`。页面按屏宽展示独立版面，点图查看完整原图和出处。 `boards.json` 记录各图的原始路径、作品身份、来源与几何，`python3 build.py` 可重建页面、24 张可编辑 SVG 及 `structure/` 内的黑线结构稿。

## 验证与版式依据

- [Grid Construction](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md) 的画幅与分区落实到 E02。桌面 1200×1100、手机 390×1110，标题区与选图框分开，逐个校验旋转后边界。
- [Page Composition](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md) 的主次图与留白落实到 E01、E05。主要画面以大图开头，次图避让脸和主题，复看清冷的雪中人、青涩镜前女孩、武侠人物等图版的取景。
- E07 的原图与版式分层落实到独立 SVG 图层、原图文件和来源数据。复核了 62 个 Git blob、24 个渲染和 124 处 SVG 图层／原图链接关系，感知指纹初筛无近似配对。实际浏览器与真机交互未复验，视觉待用户审阅。
