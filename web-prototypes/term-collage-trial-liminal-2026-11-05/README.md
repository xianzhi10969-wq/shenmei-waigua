# 阈限空间 · 词条拼贴试稿（成品图像板）

日期：2026-11-05。词条 record_id：`reczz28HJJL2GIv6`。独立试稿，**未部署、未改正式页、未写飞书**。

按用户最新指示：SOP 化制作，直接交付成品图像拼贴；标题 / 中英副题 / 下方句子本轮不做。编号保留为可隐藏层。

## 打开

```bash
cd web-prototypes/term-collage-trial-liminal-2026-11-05
python3 -m http.server 8000 --bind 127.0.0.1
```

打开 http://127.0.0.1:8000/ ；手机预览 http://127.0.0.1:8000/mobile.html 。

## 本板要让人看见什么

空的泳池与走廊里，瓷砖和水把空间推到「差一点对劲」——人可以穿过，却找不到该停的地方。

可见线索：无限重复的白瓷砖网格；螺旋梯 / 窄水道 / 柱列的无出口感；Erlich 玻璃下像在水底的人；Do Ho Suh 半透明织物通道。

材质类型：空间光线主导。刻意与已认可的 Coquette（服饰甜美、椭圆粉绿）拉开；场景保留环境，不做物件去背。

## 文件

| 路径 | 说明 |
| --- | --- |
| `index.html` / `styles.css` / `app.js` | 双端可编辑拼贴（CSS 变量定位） |
| `mobile.html` | 390px iframe 预览 |
| `data/units.json` | 8 个图像单元的桌面/手机坐标、来源、编号 |
| `data/content.json` | 飞书词条/案例快照与内部编辑判断 |
| `data/recipes.json` | 裁切与派生记录 |
| `data/assets.json` | 文件散列 |
| `assets/originals/` | 选用的飞书原图 |
| `assets/images/` | 派生展示图（仅裁切缩放 JPEG） |
| `previews/desktop-board.png` | 桌面拼贴预览 |
| `previews/mobile-board.png` | 手机拼贴预览 |
| `audit/contact-sheet.jpg` | 19 张原图接触表 |
| `制作单.md` | SOP 制作单 |

## 素材盘点

- 飞书关联案例 3：Dream Pools（8 图）、Hubs（8 图）、The Swimming Pool（3 图），共 19 张原附件，全部下载成功。
- 本板选用 8 个单元（4 Dream Pools + 2 Erlich + 2 Suh）。未选其余 11 张：多为同场景重复角度。
- 缺口：无关键缺图。许可未核定，仅本地审阅。

## 边界

- 不重做 / 不修改 Coquette 样板工程。
- 只用飞书真实素材；无网图、无 AI 生图。
- 手机重新编排，不是桌面整张缩小。
- 下一步：等夕里审视觉后，再决定是否加字、扩批量或接入词条页。
