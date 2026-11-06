# 灯下图版 C：拼贴直接进入阅读主线

2026-11-06，独立试排，待用户审阅。用户否决B“展开/收回”，明确拼贴带来价值感，不应收起来；随后同意试“吊灯局部与拼贴开头同屏 → 完整拼贴 → 正文”。此反馈取代此前优先B的建议，不代表本轮实际美术已验收。

## 打开与交付

本目录运行 `python3 -m http.server 8777 --bind 127.0.0.1`，打开 http://127.0.0.1:8777/ 。

- index.html：可直接下滑的本地试排，无弹窗/展开按钮。
- mobile-structure.svg / desktop-structure.svg：可编辑黑线白底结构稿。吊灯用取景范围占位，拼贴图像用原坐标的形状占位，不冒充新插画。
- previews/390-first.png：手机第一屏。
- previews/checks.json：五种视口的实际检查数据。
- protection.json：完整拼贴HTML、原样式及吊灯原文件的保护记录。

## 本轮只改变外部接法

旧10B独立吊灯封面退出本试排；其大标题、完整《秋千》与核心句不再重复。原10B/Figma节点未删除或覆盖。

改用吊灯02原透明素材的下部局部：手机460px宽、上缘区域120px高、right -130px、bottom -12px；桌面640px宽、区域152px高、right60px、bottom -20px。图像通过CSS容器取景，原PNG字节未变；保留白色珠链/水滴的原尺度，不把整灯缩成小图标。此裁切只涉及吊灯环境素材，不涉及定稿拼贴内的作品。

拼贴紧接其后直接显示。手机120px之后就是原板；定稿标题top16，主图top157，因此其未旋转位置距页面顶277px。390×844下完整主图和服饰主体能在首屏出现，部分细节图也进入视口。桌面152px之后是原板，原主图top225，即页面顶377px。以实际截图判断视觉主次，不能仅凭数字判定审美成立。

完整拼贴之后才接既有10B的一段原介绍；本轮不编造全文。原拼贴核心句仍位于板尾且只出现一次。来源编号、来源列表和字体许可仍保留。没有固定全站导航、没有新增3D转场、没有改首页。

## 原素材保护

来源为13c7d07b73274fc7d307ecd1fb94595dc132b0ee的term-style-board-2026-11-03。

board-shell HTML逐字保留，styles.css字节一致；10件作品、标题/副题、坐标/裁切/配色、核心句不改。inline.css只操作新的threshold和reading及外围来源区间距，没有覆盖board/piece/title规则。先做双端结构SVG，再用现有艺术素材做比例试排；无生图、无新艺术素材、未推进独立配色/字体定稿。

吊灯来源：本地term-chandelier-v2-real-form-2026-11-05/chandelier-02.png；既有02素材，不是这轮新画。原封面、旧B原型、拼贴原目录、Figma、飞书及生产站均未修改。

## Skill落实

2026-11-06重新读取项目Editorial Layout Skill与上游page-composition.md、editorial-layout.md：

- E01主次：拼贴为直接呈现的开场；单一h1，不再由独立封面抢先完成同一词条的介绍。验证index.html与截图。
- E05画心：只新增板外上缘区，保留整板DOM/样式/图像；保护记录逐字节比对。
- E06节奏：环境局部和拼贴首部同屏→板内多图关系→核心句→正文；去掉必须点击的展开步骤。结构SVG标出844/900px首屏下缘。
- E07可编辑：HTML/CSS与SVG可编辑，非整页截图；没有新增Figma Frame，不声称已同步Figma。

来源：[项目skill](https://github.com/xianzhi10969-wq/shenmei-waigua/blob/master/.agents/skills/shenmei-editorial-layout/SKILL.md)、[构图章节](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)、[编辑节奏章节](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md)。不机械套用印刷栅格或配色比例。

## 检查与待审

本机Chrome检查320×740、390×844、430×932、768×1024、1440×900：所有图片加载、单一主标题、10个原图单元、无弹窗、正文位于完整拼贴之后、来源编号打开、无横向溢出；无脚本报错。人工查看390/1440截图。checks中first_screen_pieces按边界框进入屏幕统计，不代表每张图全部可见。

需要用户看实际稿判断：吊灯裁到珠链/垂饰后是否仍保留美感；暗色上缘与白色图版的接缝是否太像页眉。目前分界仍明显，不能声称与首页已无缝统一。仅Coquette一例；没有验证不同词条的标题长度或其它拼贴。没有真机/Safari验证，没有制作主页→词条实际动效，没有部署。

保存为独立分支codex/term-collage-inline-2026-11-06。B保留作历史，但不再作为推荐方案。
