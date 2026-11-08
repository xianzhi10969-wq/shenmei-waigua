# 自然与独处｜四张拼贴续作

2026-11-08。用户要求继续制作其他词条，延续优先选有案例的范围。本批为治愈、Cottagecore、拓印、沉浸式独处，四张均待用户审图。

| 词条 | 片段／采用图 | 关联案例 |
| --- | --- | --- |
| 治愈 | 8 | 《睡莲》组画 |
| Cottagecore | 10 | 《彼得兔的故事》、星露谷物语 |
| 拓印 | 8 | 《英国藻类图集：蓝晒印相》 |
| 沉浸式独处 | 9 | Unpacking、《在自己房间里的旅行》 |

合计35片段、35张采用图片、6个案例。35张文件SHA256各不相同。同一本书的不同插图、同一组画的不同画面、同一游戏的不同空间与物件继续归属其真实案例，案例数按记录ID计算。

## 这一轮做了什么

治愈用水面长画幅铺底，绿影睡莲成为中央焦点，再接回作品所在的椭圆展厅。Cottagecore穿插水彩菜园、钻栅栏的小兔、真实洒水壶轮廓和游戏农地。拓印使用同一蓝晒图集的不同标本页，将植物轮廓跨过书页接缝。沉浸式独处让书页、卧室、厨房与搬家的物件叠接，保留游戏像素边缘。

桌面1200×1100、手机390×1110分别排布。沿用已确认的白纸、朱雀仿宋／Cormorant字体与原图颜色。Cottagecore中英文名相同，标题仅显示一次，使用既有英文展示字体。先输出可编辑黑线结构，再按同一坐标生成真实图层。几何、取景和轮廓均在layouts.py中独立保存。

原图、来源、案例ID和文件校验在sources.json。4张沿用现有后台附件，31张从既有案例原站补充。沿用2026-11-07已核验的词条rev239／案例rev420只读快照，本轮没有重新实时读取飞书。

## 补图来源

- 橘园美术馆《睡莲》页面提供组画与展厅照片，逐张标签和来源URL保留。
- Project Gutenberg的《彼得兔的故事》提供原版插图。旧扫描分辨率约400–500px，大尺寸观看时细节会偏软。
- 星露谷物语官网提供两幅场景。图像权利归ConcernedApe及原权利人。
- 大都会艺术博物馆Open Access提供蓝晒图集各页，藏品号均属于2005.100.557。采用馆方web-large的完整画面，原始更高分辨率地址另存fullResolutionURL。此部分为Public Domain。
- Unpacking官网提供房间和透明物件图，图像权利归Witch Beam及原权利人。游戏房间与物件保留像素呈现。

两幅彼得兔前景由macOS Vision提取，蓝晒叶片的显示层按原像素的颜色对比提取透明度，完整源图分别保存。普通页面重建使用已包含的显示层，无需再次抠图。

## 文件与本地入口

- index.html和四个独立HTML可点开完整图片与出处，目录使用实际JPG预览。
- 双端SVG、黑线结构和data逐片段映射均可编辑。
- build.py从boards.json、sources.json、layouts.py和已保存素材重建。
- assets/originals保存全部采用图片，assets/cutouts保存实际前景，字体与许可独立归档。
- case-snapshot.json保留6个现有案例的真实内容。
- previews含双端实看图，checks.json保留浏览器验证结果。

独立预览 http://127.0.0.1:8836/nature-and-solitude-collages-2026-11-08/ 。本地整站目录 http://127.0.0.1:8840/collages/ ，现共29张。

运行python3 build.py重建需要Python与Pillow。浏览使用普通静态服务器即可，运行素材全部在目录内。

## 版式依据与检查

2026-11-08重新读取项目Editorial Layout Skill、上游grid-construction.md与page-composition.md，具体采用以下两项。

1. E02层级栅格。沿用画幅和标题轴，桌面主图区域x18–1182、手机x8–382。Cottagecore为纯英文题名，使用单个展示标题；其余三个标题与英文副题保持53/29、36/23的既有尺度。先定主区域和标题安全带，再按图片内容建立不等分模块。
2. E01主图优先、E05视线通道。先安排组画水面／菜园角色／植物轮廓／完整房间，再放不同尺度的场景和物件。手机独立调整物件大小与取景，使文字和主要轮廓保持可读。满铺拼贴沿用已确认方向，取代上游对一般报告的40–60%图像占比建议。

读取入口如下。

- https://github.com/xianzhi10969-wq/shenmei-waigua/blob/master/.agents/skills/shenmei-editorial-layout/SKILL.md
- https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md
- https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md

全站28张SVG拼贴×双端56视图、580个原图入口通过，原Coquette另保留。101词条／144案例／407附件与完整案例解析检查通过。新四张已看手机与桌面实图，首屏核心短文及真实案例关联逐项核对，状态为待审图。浏览器使用本机Chrome仿真。
