# P4 座椅 → 风格图册预览｜可理解性与装帧 v4（2026-10-23）

独立试验稿，**未验收、未覆盖正式版本**。从 `p4-v3-full-reading-prototype-2026-10-23` 继承 P4 教堂与座椅完整 SVG、星星 B 和 V3 全文，**只修改预览层容器、背景层次、语义与 CTA**，保持 P3/P4 上游版本原样。

## 打开
直接双击 `index.html`，先点「沿着中央通道继续」，默认选中幽玄专题，点最远端第一张长凳可打开已有 Figma 词条「清冷」的预览，再点击「进入《清冷》完整阅读」。也可打开 `index.html?inside=1&topic=yugen` 跳过过渡引导。点击「返回座椅」关闭预览；V3 内可返回原预览。手机端是独立单页装帧，不是缩小的桌面两页。

## 改动
- 从标准矩形弹层改为静态 SVG 绘制的**两叶尖拱书册外轮廓**。桌面双叶，手机单叶，上尖拱延续中殿，不新增散碎徽章装饰、禁止渐变阴影和第三色。
- 点席位时仍从真实长凳位置缩放起势。背景其余座椅/架构在前景展开时退到极淡，仅选中长凳保留墨色，远端星星为单颗现有 B，非重复星图标。
- 标题、CTA、导航全部改成可理解的内容词义：「词条预览」「返回座椅」「进入《清冷》完整阅读」「前一种/后一种」。不再展示技术状态名和未接入字段标签。
- **修复误导跳转**：只有已核实的 `幽玄/清冷` 第一席能打开本地 V3 样页；其他结构席位不可误跳进清冷，不宣称所有词条已经接上飞书。
- 界面原画槽位使用双层尖拱轮廓+大排标题的临时代替；未声称导入真实旧 V3 原画。必须以后续飞书只读附件或旧 V3 原图替换。

## 已知问题
- 旧 V3 原画资产没有成功落入离线包，这版先校准几何与可理解性；图片为排版占位，不能视为最终视觉完成。
- 手机浏览器细小屏幕与系统字体可能仍需字体/触控实测；真实词条数量、封面、URL 只读接入仍待完成。
- P3 → P4 星 B 精准滚动坐标不是本次范围，未改 P1/P2 已验收 v4。

## 参考原则
- [Primer Progressive Disclosure](https://primer.github.io/design/ui-patterns/progressive-disclosure/) · context preservation, label clarity
- [Material Navigational Transitions](https://m1.material.io/patterns/navigational-transitions.html) · expand from source
- [W3C ARIA Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) · explicit reveal controls