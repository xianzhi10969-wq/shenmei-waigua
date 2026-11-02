# P5 → P6：参考图与衔接细化 v2

2026-11-02。用户“可以，但你得思考两个页面怎么衔接、去找参考图”，同意沿书写台方向继续研究；不扩大为P6全部结构、美术、配色或动效已定稿。本轮交可视参考板和三位置分镜，没有生图、没有改Figma/正式站/飞书。

## 已实际查看的参考图

- **Charles Robinson / The Child Alone，1895**：[原页](https://www.gutenberg.org/files/40250/40250-h/40250-h.htm#i_252)。重用已查看的原图。继续作为整体取景主参照：一侧建筑片段、另一侧留白及疏线。原画不是最终资产。
- **A.W.N. Pugin、E.W. Pugin、Crace & Sons / Writing table，约1855**：[NGV馆藏](https://www.ngv.vic.gov.au/explore/collection/work/20789/)、[原图](https://content.ngv.vic.gov.au/retrieve.php?size=xl&type=image&vernonID=20789)。本轮已成功取得和查看图片，补足上一轮只读到说明的缺口。实际视觉重点是薄台沿、低俯角、修长支撑，不是大片台面。参考板保留全图与Photo: NGV, Melbourne署名。只借比例，不借木色或材质。
- **Rudolph Ackermann / Gothic Furniture (table and chair)，1827，Plate5,Vol10**：[University of Glasgow图版页](https://www.gla.ac.uk/myglasgow/library/files/special/teach/gothic/table%20and%20chair.html)、[原图](https://www.gla.ac.uk/myglasgow/library/files/special/images/gothic/Hepburn_q3tableandchair.jpg)。已看图。借局部镂空沿桌沿/支撑组织的方式，不加四烛台、椅子、地毯与整圈密纹。不将这张笼统误标为Pugin设计。
- **Beatrix Potter / Sketch of a writing desk and mirror, Gwaynynog**：[V&A记录](https://collections.vam.ac.uk/item/O1386982/sketch-of-a-writing-desk-drawing-beatrix-potter/)、[馆方原图](https://framemark.vam.ac.uk/collections/2025PK5177/full/%21600%2C/0/default.jpg)。馆藏正文工具本轮未成功读取，但图搜给出记录与作者，馆方原图成功获取并实际查看。只作为倾斜书写面的结构辅助；不引用未核实年代或媒材，不采用镜子、柜体、随意素描笔触与黄旧纸。

四图完整摆放在本地 reference-board.html/png，非产品拼贴。Pugin和Ackermann是器物资源，Robinson仍是画面语言主来源，不把彩色家具照片当成新画风。

## 由参考导致的实际修改

v1大梯形桌面过强，像俯视操作台；v2将桌面深度缩到27px（y578–605），薄边11px。纸页放在一个微斜书写板上（外框x29–343、y341–579），中文保持正向。功能可读性由纸页负责，无需加大整张桌面透视。

桌脚和边缘只示意尖拱结构，未画正式纹样；取消上一稿没有充分依据的花瓶。P6标题沿用P5的x152轴，分成“文字，／发生关系。”；三操作仍是独立文字，词和试一次在同一纸页内。属于结构候选，文案和字形不据此锁定。

## 衔接方案

推荐自然滚动、同屏交接。三镜使用同一条连续内容：P5起点0、P6起点844；观察滚动位置0、640、844。中间不追加间隔屏、强制动画或必须点击的门。

1. **P5停留**：完整展示四个资源入口。P5门与文字保留当前构图。
2. **向下滚动**：在390×844示意视口滚至640时，P5门框底部在视口y80，P6台沿出现在y782，两者同屏。P6标题先出现，再看到书写板、台沿；视觉从左上建筑移向下方器物。色底沿用现有P5，消除上轮白底结构稿造成的假性断层。所有内容随原生滚动，停止手势即可停住。
3. **P6停留**：全部操作可见。点击试一次只改变纸页内容，不移动桌子、不拉镜头。向上滚动原路返回P5。

桌面同样采用连续下行：保留P5图左/字右的原构图，P6器物从下一段右下进入，标题在左；利用宽屏让门的局部与桌的局部同时可见。没有必要横移整间房。桌面具体尺寸须在新器物结构确定后重新画，不能把本轮手机三镜视为桌面已验证。

**星星**：一枚独立固定入口；分镜在星星后留85×58的同纸色局部底，避免滚过门线时不可辨，不加整条导航栏。该遮挡策略仍待审，正式应复用星B。点开保留滚动位置、模式、词、结果；关闭返回原处。从导航直达P6时定位操作区，不强制播放转场。开启减少动态效果时，同样用普通滚动，理解不依赖动画。

**功能路径**：点P5类别仍进入资源内容、返回原位置；向下才是P6。P6编辑词时不自动推进页面，软键盘只保证当前输入可见。滚动、输入、结果更新互不争夺手势。现阶段未实现这些行为，不声称已接数据或自填生成。

## 规则与检查

本轮重新读取GitHub最新总控/状态及项目Editorial Layout技能，并重新读取上游page-composition.md和editorial-layout.md。
- E01/E05：标题与P5共用x152轴；P6纸页是唯一操作中心，装饰留在下方与侧边。临时字号29/18/16/12，不做新字体设计。
- E06：把两页当一条连续画面检查；通过滚动位置证明门脚和台沿同屏，而非仅说“有衔接”。节奏从竖向门片转到横向台沿。
- E07：新增SVG保留text/path等可编辑结构，未写Figma，不冒称交付Figma TEXT节点。
- Chrome渲染reference-board.png和transition-v2.png并查看；四张参考未裁切，图文无重叠，三视口独立裁切，星形仅一枚。初稿中间位置440只能看到书写板，改到640后核对台沿确实进入。
- 未做正式动效、交互、真机或桌面连续滚动测试。

本地文件：reference-board.html/png、transition-v2.svg/png、p6-writing-slope-v2.svg、refine.py、render-v2.cjs；参考原图在references/。GitHub同步本说明和P6独立结构SVG；参考原图与含P5图片的比较分镜只存本地。
