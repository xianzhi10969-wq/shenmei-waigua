# P4 手机小标题题签 v1

2026-11-01。用户已认可首屏重排896:62（“可以，更好了”），本轮基于该版独立复制，只优化五个分类题签。新版待用户审阅。

## 交付
- [完整可编辑页面898:62](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=898-62)
- [五组同尺寸对比898:197](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=898-197)
- comparison.png、full-page.png保存在本机research/2026-11-01-p4-mobile-captions-v1/；GitHub仅同步本说明。

## 参考落实
本轮重新核对远程master总控与当前状态，读取项目Editorial Layout skill及上游两个章节；沿用上一轮已核验的Figma技能与库发现结果（无适用的订阅组件库，原页文本无绑定样式）。并行P1工作不在本轮范围。

- [项目Editorial Layout skill](https://github.com/xianzhi10969-wq/shenmei-waigua/blob/master/.agents/skills/shenmei-editorial-layout/SKILL.md)
- [Typography Rules](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/typography-rules.md)：明确标题与提示文字的角色，使用同一字体家族的层级。
- [Page Composition](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)：题签与作品保持同一宽度及轴线。
- [Impeccable Typeset](https://github.com/pbakaus/impeccable/blob/main/skill/reference/typeset.md)：同时用字号、空间和位置区分角色，检查英文长标题。
- 朱雀仿宋资源已读取，但Figma当前可用字体未检索到朱雀；本轮保持Noto Serif SC，不冒称已换朱雀，也不以轮廓替代可编辑文字。

|规则|动作|结果|
|---|---|---|
|E01/E04 层级|标题28px/36px，提示12px/20px；沿用Noto Serif SC Regular|大标题56px，小标题28px，正文14px，提示12px；中文题签字距2px，英文0px|
|E02/E05 对齐|沿用各自画框宽度；题签左右各内缩8px|宽度342/220/236/318/306；与画框保持关联，无侵入画心|
|E03 节奏|原上下堆叠改为横向，按文字基线对齐；外层仍56px高|各分类总高度、画廊间隔和后续画位不变|
|E07 可编辑|独立副本中修改TEXT和自动布局|五组题签可编辑，已认可首屏及原稿保留|

题签节点：898:116、898:134、898:152、898:169、898:186。
标题节点：898:117、898:135、898:153、898:170、898:187。
提示节点：898:118、898:136、898:154、898:171、898:188。
辅助边距层沿用副本中的GUIDE，不新增可见装饰。

## 保护与验证
49个图像填充节点逐项核验fills（含imageHash）、尺寸及相对页面位置全部相同。完整页面仍390×2317，首屏和画框、照片、纸纹、建筑均未改变。

已查看Figma导出的852×864对比图：五组标题与提示均完整；Softcore剩余横向间隔42px，无碰撞；最窄220px题签亦完整。没有新增装饰边框或色彩。静态设计检查不等于交互可用性测试，本轮未部署、未改飞书。

本次结果是题签候选。上一轮首屏已获认可，不等于本轮五个小标题也已验收。
