# 十二词条 · 密铺拼贴候选

2026-11-07。用户已认可清透、烟火味、新中式的密铺v2，并要求“存库里，标记下这一轮你做了啥，然后把剩下没做的词条做掉”。前三张完整存入master，验收记录见[ACCEPTANCE](../three-pinterest-dense-v2-2026-11-07/ACCEPTANCE.md)，存库提交afc0af192549743d7d3ee87c4ea6405ea87b71a4。

本目录完成原20张试稿中其余十二张的独立密铺重排，**新十二张待用户审图**。不把前三张认可扩展为本批已认可，不改另一bot负责的五词条、Coquette或已否决的阈限空间。

本机预览：<http://127.0.0.1:8836/remaining-twelve-dense-2026-11-07/> 。从本目录直接打开index.html亦可看拼贴、原图弹窗；与已认可三张的相对入口需要保留同级目录。

## 本轮结果

| 词条 | 片段 | 真实作品 | 桌面 | 手机 |
|---|---:|---:|---|---|
| 禅意 | 14 | 5 | [图版](previews/zen-desktop.jpg) | [图版](previews/zen-mobile.jpg) |
| 热烈 | 11 | 3 | [图版](previews/fervor-desktop.jpg) | [图版](previews/fervor-mobile.jpg) |
| 末世 | 12 | 4 | [图版](previews/endtimes-desktop.jpg) | [图版](previews/endtimes-mobile.jpg) |
| 暧昧 | 12 | 4 | [图版](previews/ambiguity-desktop.jpg) | [图版](previews/ambiguity-mobile.jpg) |
| 水墨 | 11 | 3 | [图版](previews/inkwash-desktop.jpg) | [图版](previews/inkwash-mobile.jpg) |
| 武侠 | 12 | 4 | [图版](previews/wuxia-desktop.jpg) | [图版](previews/wuxia-mobile.jpg) |
| 废土 | 13 | 3 | [图版](previews/wasteland-desktop.jpg) | [图版](previews/wasteland-mobile.jpg) |
| 日杂 | 11 | 4 | [图版](previews/zakka-desktop.jpg) | [图版](previews/zakka-mobile.jpg) |
| 清冷 | 8 | 2 | [图版](previews/cool-desktop.jpg) | [图版](previews/cool-mobile.jpg) |
| 青涩 | 11 | 2 | [图版](previews/first-crush-desktop.jpg) | [图版](previews/first-crush-mobile.jpg) |
| 破碎感 | 10 | 5 | [图版](previews/fragility-desktop.jpg) | [图版](previews/fragility-mobile.jpg) |
| 宿命感 | 11 | 5 | [图版](previews/fated-desktop.jpg) | [图版](previews/fated-mobile.jpg) |

共136片段、44个有图作品、93张采用原图。片段数量与作品数量分开；同一原图可有全景和内容明确的局部。每片都能打开完整未裁切原图、看到对应作品名并进入出处。默认隐藏编号，可手动开启。

## 修改内容与边界

- 沿用上一轮已认可的白纸、字体和来源交互。每张单独编排桌面1200×1100与手机390×1110，保留各自图像的原色与比例。
- 禅意以冰花柱穿过松林、天光、石砂；热烈由绘画中的动作、花房与心跳灯交织；末世并置古老末日图像与现代遗址；暧昧保留信件、错身序列和投影的距离。
- 水墨以长卷、圆形山水和真实灯箱组织画面；武侠以完整时装轮廓贯穿长卷、剑与荒原；废土以猫连接文明残余与继续生活的城市；日杂把封面和生活细节铺成阅读桌面。
- 清冷通过空间、人物尺度和树枝细部形成连续冷白图像；青涩使用生活摄影与书本；破碎感保留Woodman主体并用真实书封、展览和局部穿插；宿命感以人生航程、水中新娘、抄本和乐谱连接。
- 图少的词条没有编造或外借无关素材。清冷8片段已铺满主要画幅，未为了统一数量强塞重复图；保留原图中的白色，不加滤镜/伪纹理。书封局部受原始分辨率限制。

## 数据与版本保护

只读飞书aesthetic-feishu/user获取45个指定案例和12词条（案例rev412、词条rev232；has_more=false）。117附件全部本地检查：114份通过file token哈希定位已存的整站原图并核对实时大小，3份重新只读下载。最终93张原图逐字节保留。花样年华案例没有附件，本批暧昧采用其余4个有图作品，没有补造电影截图。

只做SVG裁片/手工轮廓和版式，没有图像生成、调色、飞书写入、Figma编辑、整站集成或正式发布。原Grok稿及已认可前三张均保留。本地同时运行的其他bot稿未改动。

## 文件与检查

- `layouts.py`与`data/*-layout.json`：每个片段的双端位置、旋转、局部裁切、真实案例ID与原图链接。
- `*-desktop.svg`、`*-mobile.svg`：可编辑实图；`*-structure.svg`：对应黑线结构；`masks.json`：手工轮廓。
- `assets/`、`licenses/`：采用原图、字体、字体许可；`audit/`：只读快照、哈希与核验。
- `build.py`：从打包的assets/data/audit重建；原下载目录originals只用于本机研究，发布包不需要。渲染/检查脚本中的浏览器依赖路径可按环境调整。
- 已实看24张双端图。手机复查后修正猫脸、人物眼神、Woodman主体的遮挡，补禅意和废土白洞，青涩保留朋友面孔；60页面/尺寸与272原图入口/来源映射检查通过。仅浏览器响应式验证，非真实手机硬件测试。

轮廓为手工候选精度，未作像素级精修。美感由用户逐板审图，不由数量或自动检查判定。
