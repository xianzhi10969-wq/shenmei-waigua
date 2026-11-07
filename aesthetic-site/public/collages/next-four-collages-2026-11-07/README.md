# 四个有案例词条的拼贴续作

2026-11-07。用户要求继续制作其他词条拼贴，先挑有案例的做。本批选择画报风、低能量、拉扯感、暗黑，每张8个片段，共32片段，关联9个有图案例、16张完整原图。四张均待用户审图。

## 构图与来源

- 画报风围绕《吉斯蒙达》和《良友》创刊封面，将刊头、人物、花束、服装纹样与出版信息拆成不同阅读尺度。
- 低能量将PAF AW25床铺秀场、三套不同服装造型和鞋履，与《休息》和《奥勃洛莫夫》初版扉页交错。
- 拉扯感将《黑色不伦瑞克兵》的双人轮廓、门、手、缎带、小狗及墙上画，与《傲慢与偏见》初版书页组合。
- 暗黑将《圣马太蒙召》的全景、手势和桌边人物，与作品所在礼拜堂、光之教堂的光线与座椅组合。

同一作品的全景和细节仍属于同一案例。32片段不对应32件作品。暗黑关联的Audrey案例暂无可用附件，本批使用另外两个已有图案例。

9张已有附件沿用网站真实快照。7张补图来自已有案例记录所指向的原站，其中TECHUNTER的PAF AW25报道4张，法国圣路易教堂3张。每张完整原图保存在assets/originals，来源、下载地址、SHA256和原案例ID登记在sources.json。PAF报道摄影为Alexander Zabelin / TECHUNTER Media，图片权利归原权利人。本轮沿用已核验静态快照，未实时重新读取飞书。

## 文件与预览

- index.html和四个独立HTML提供可点原图的预览。
- 桌面1200×1100、手机390×1110分别排布，各有SVG实图和黑线结构稿。
- layouts.py独立保存位置、旋转、局部取景、手工蒙版，build.py重建。
- data目录逐片段登记原作和案例映射，sources.json保存原图校验。
- assets/cutouts为macOS Vision提取的真实前景，显示前景最大边1600px，以无损WebP保存。剪影继续叠加SVG蒙版，完整原图单独保留。
- previews为本轮双端实看截图。checks.json记录双端入口检查。

本地独立预览 http://127.0.0.1:8836/next-four-collages-2026-11-07/ 。整站词条和目录位于 http://127.0.0.1:8840/collages/ ，目录共25张。

重建使用Python 3和Pillow，运行python3 build.py。普通浏览使用任何静态服务器即可。抠图结果已随素材保存，重建不要求重新调用Vision。

## 版式依据与验收点

已读取项目Editorial Layout Skill，以及上游grid-construction.md和page-composition.md。两条具体落实如下。

1. E02层级栅格。采用Hierarchical Grid与先定画幅／边界的顺序。沿用已确认密铺画幅、左侧标题轴，桌面图像主区域x20–1179、手机x8–382，标题底线分别位于70/49，副题102/79。坐标可在layouts.py和结构SVG逐项修改。印刷页边比例不直接套用到本轮满铺图谱。
2. E01主图优先和E05视线通道。先放最大人物或空间，再安排中等原作与小细节。画报风的人物轮廓跨越矩形封面，拉扯感的双人完整轮廓贯穿书页和门，低能量以床铺全景开场，暗黑以暗屋和十字光的明暗对置建立重心。手机分别重排，不缩成桌面长横图。

本批继承已确认的白纸、原图色彩与字体。先输出无装饰黑线结构，再在同一坐标上生成真实图片层。黑线结构和实图均为本轮候选，待用户审阅。

读取来源如下。

- https://github.com/xianzhi10969-wq/shenmei-waigua/blob/master/.agents/skills/shenmei-editorial-layout/SKILL.md
- https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md
- https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md

双端8视图、64次原图入口、案例阅读／返回及上滑开场已检查。轮廓细节仍可继续精修，本轮以可审阅拼贴候选接入。手机使用Chrome仿真核验。
