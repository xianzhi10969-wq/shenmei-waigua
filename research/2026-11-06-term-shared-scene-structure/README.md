# 灯下图页：同一画幅的黑线结构检验

2026-11-06。用户已否决展开B与短前奏C，随后同意继续检验“完整拼贴是灯下正在看的图页”。本轮只交结构草图，不做正式美术、配色或网页生产实现。

## 看图

[index.html](index.html)为双端对照；[手机首屏](mobile.svg)、[手机完整](mobile-full.svg)、[桌面首屏](desktop.svg)、[桌面完整](desktop-full.svg)均为可编辑SVG。灯是按已有02轮廓概括的结构占位，不是重新设计的吊灯；图像用原坐标、旋转、层级的形状占位。编号虚线框为原交互区，不是新增美术。

本地预览：本目录运行`python3 -m http.server 8778 --bind 127.0.0.1`，访问http://127.0.0.1:8778/ 。本地comparison.png/mobile.png为已查看的渲染截图，仓库交付SVG与HTML，不声称PNG已经上传。

## 具体摆法与取舍

手机390×844：原拼贴390×1260，x0/y0，整体100%，没有前奏高度。标题88px、核心句20px、副题15px均保持原值。吊灯按220px宽，在x270/y-110侧切进入；保留右上留白内的一组灯臂/垂饰，原主图从y157开始。完整拼贴直接位于阅读主线，继续向下是正文。

桌面1440×900：原拼贴1320×1080整体等比显示82%，x24/y32，宽1082.4；内部坐标、相对尺寸、旋转与层级不变。标题108.24px、核心句18.86px。吊灯宽440，x1080/y-70，右侧有更大环境空间。页外缘与灯相邻，无跨屏顶部横条；矩形外缘仅标注图页区域，不锁定正式画框。

初步曾考虑缩小手机版以留侧边，随后通过具体留白和吊灯透明区域检验，找到无需缩小拼贴的侧切位置，未采用缩小手机版。mobile-fit-search.json保留几何探索，只针对本例，不证明某个参数审美最优。

手机的限制：露出的灯比桌面少得多。如果用户需要看到更完整的吊灯，本布局未满足该目标，不能把它说成完整场景已经成立。白色灯在未来底色中的辨识度、与首页画法是否协调，尚未验证。

## 来源与检查

拼贴源13c7d07b73274fc7d307ecd1fb94595dc132b0ee；标题、图像与编号位置从定稿HTML/CSS提取，真实文字范围由本机Chrome加载原字体测量，记录于protected-rectangles.json。几何与层级见geometry.json。

遮挡检查使用原chandelier-02.png的透明通道（alpha>64），按候选位置投影，与真实标题、副题、edition、10个图像旋转后边界框、核心句、编号交互范围比较。两端未发现被检验的原灯不透明像素进入上述范围。见checks.json。它是保守的区域检查，**不是最终抗锯齿边缘、细节可读性或美感验收**；画面中的简化灯线不等同于原灯像素。没有测试其它词条/手机尺寸，也没有制作实际转场。

SVG渲染到本机Chrome，人工查看了手机及双端对照；修正了标题缺少原字距、图像占位未依原z层级排列的问题。没有生成彩色试排，没有改原拼贴源码、原素材、Figma、飞书或生产站。

## Skill证据

本轮重新读取[项目Editorial Layout Skill](https://github.com/xianzhi10969-wq/shenmei-waigua/blob/master/.agents/skills/shenmei-editorial-layout/SKILL.md)及上游[page-composition](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)、[editorial-layout](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md)，并回读CREATIVE_MEMORY。

- E01/E06：同一画幅中的主次与直接阅读路径；拼贴从首屏呈现，取消两次开场/隐藏视图，SVG首屏与全长各一张。
- E05：保护原标题、作品及编号范围；用源PNG透明区域与真实内容范围核验，非只按空白矩形猜测。
- E04：记录实际缩放与字号代价。手机版保持100%，桌面82%；不套用通用字号比例。
- E07：交SVG结构与几何数据，无新增Figma节点、不冒称可编辑Figma交付。草图不是正式插画。

本轮待用户审结构：是否接受手机的侧切程度，以及桌面为环境让出空间后的图版比例。未因几何无碰撞而默认推进正式美术。
