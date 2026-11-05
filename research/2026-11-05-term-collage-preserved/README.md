# 完整拼贴的外部衔接研究 · 2026-11-05

## 已确认边界
用户明确：作品图随词条变化，吊灯可以共用；拼贴风格已经定好，以提交13c7d07b73274fc7d307ecd1fb94595dc132b0ee的web-prototypes/term-style-board-2026-11-03为准。
上一轮抽取秋千跨界、取消拼贴标题的结构方案已撤回，不再作为施工依据。本轮只研究完整拼贴前后的阅读节奏；没有覆盖Figma、拼贴源文件、飞书或部署。

## 实际核验
已读取指定提交的README、status、index、styles及预览目录。以下本地Git blob SHA与指定提交完全相同：
- index.html：4496ea1baba7185f445279f10e9e66c30ec8b687
- styles.css：bab99153718efad50b817e9dbc1365a89ba27a4e
- previews/mobile.png：1b9680bbb82931302084819d4e86f81d37863fa4，780×2520，按390×1260展示
- previews/desktop.png：3ab464e956ce62ff167e68f03067550909520e2e，2640×2160

扉页研究采用上一轮未定稿Coquette10B的390×1146截图。黑色部分到y938；现有纸色正文为208高。它不是已验收词条基线。对照中的正文是现有词条缓存原文，不是为了过渡编造新段落。

## 两种对照及判断
A：10B黑色开场938高 → 完整拼贴1260高，直接连接。
B：完整10B（含已有208高短正文）1146高 → 完整拼贴1260高。
两者从相同scrollTop738观察接缝：上方可见扉页末尾200px，B中段多出208px阅读段。除是否保留这段文字，画面来源及比例一致。
已实际看comparison.svg.png：A黑→白转换直接、两个图像密集区域相邻；B多一次文字停顿，使图版更容易被理解为同一词条中的独立展开。助手倾向B，未获用户验收。

建议后续路径：吊灯扉页 → 纸色短正文 → 完整白底拼贴 → 纸色作品分析。装饰留在开场，完整拼贴自身的白底承担图版边界，不增加重复吊灯/新花边/模拟纸张阴影，不对图片统一滤镜。
重复的核心句应优先从未定稿10B一侧精简，拼贴内部原核心句保持。本轮对照为了只改变一个变量，尚未执行该精简。
同一作品的完整封面与拼贴中的关系展示可能分别承担聚焦/比较角色；是否需要保留两次仍需具体词条审图，不再用“重复必删”拆改定稿。
手机开场仍偏长。桌面建议让完整图版宽于正文列，形成横向展开；仅结构示意，未做真实桌面接入、响应式或动效。自然滚动先验证，不以3D翻页解释风格差异。

## 产物与检查
本地 output/term-collage-preserved-2026-11-05/：
- structure.svg：手机/桌面黑线白底可编辑结构。长图块压缩示意，未拆拼贴。
- comparison.svg及PNG：使用原截图作视口取景的A/B证据，不是正式新页面或可编辑UI。
- index.html：自包含连续阅读对照，可分别滚动完整画面，切换开头/接缝/整板/收尾。图像本身未改。
- source-proof.json：来源与散列。
已查看两份SVG的渲染截图。内置浏览器打开本地预览及读取状态均超时，未能验证按钮与浏览器滚动，不能宣称浏览器交互检查通过。静态图版完整原图/尺寸及来源已核验。
GitHub仅保存本说明与结构SVG；含图片的比较图及HTML留本地，不声称已同步素材或完成网站。

## 排版资源的具体使用
沿用项目 .agents/skills/shenmei-editorial-layout/SKILL.md，并复查上游：
- [editorial-layout.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/editorial-layout.md)：Content Flow/Pacing/Rhythm → E06，通过原有208px文字段比较“密—静—展开”；不照搬跨页主图跨缝方法去破坏已定稿拼贴。
- [page-composition.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)：E01/E05，扉页、引入与整板各有主次，图版作为整体保留其内部视觉关系。外部节奏与内部构图分开评审。
阶段：结构研究。没有新绘画、配色试验或字体定稿。
