# P3 彩窗 v3（2026-10-23）· 24 一级专题条带 · 每次卡一格 · 待夕里审 · 非基线

夕里：「彩窗感觉可以做全量了。」又确认：窗须左右滑动，展示**全部**一级专题（非仅五格）；每次卡**一格**；半可见侧格题名不得溢出卷轴。

**没有改 v4 / v9 / 飞书。** v2 标注为被取代（保留未删）。

## 打开
```
cd web-prototypes/p3-stained-glass-v3-2026-10-23
python3 -m http.server 8765
```
- 桌面 ≥900px：五联视口（中心 = 焦点）；‹ › / ←→ / 拖拽过阈值 / 横向滚轮 → **每次 ±1 专题**（环绕）
- 手机：三格（中整 + 左右半），同样每次卡一格，滑过全部 24 题

## 一级专题（飞书章节表 · 24 · 按序号）
1. 忧郁 Melancholy · 2. 爱欲 Eros · 3. 田园 Arcadia · 4. 幽玄 Yūgen · 5. 酒神 Dionysian  
6. 留白 Liubai · 7. 平淡 Pingdan · 8. 物哀 Mono no aware · 9. 日常 Infra-ordinary · 10. 侘寂 Wabi-sabi  
11. 气韵 Qiyun · 12. 侠 Xia · 13. 轻逸 Lightness · 14. 崇高 Sublime · 15. 从容 Sprezzatura  
16. 酷 Cool · 17. 怪诞 Grotesque · 18. 阴翳 In Praise of Shadows · 19. 悲剧 Tragic · 20. 废墟 Ruin  
21. 未来想象 Future Imaginaries · 22. 乡愁 Nostalgia · 23. 诡异 Uncanny · 24. 可爱 Cute

封面自飞书只读缓存于 `assets/feishu/covers/`，裁进 `assets/panes/{slug}.jpg`。

## 系统
- **白石窗框 + 空卷轴轮廓**：`tools/build_chassis.py` → `assets/renders/chassis-{web,mobile}.png`（侧格卷轴无字）
- **HTML 题名只写中心格** `#ctitle`：半可见左右格不渲染中/英，避免溢出黑底白框
- **夜玻璃 + 铅线槽**：画心蒙版向内腐蚀
- **封面原色**：双色规则的唯一例外（飞书原色封面）
- **玫瑰窗 / 星**：固定，不随条带移动

## 滑动行为
| 输入 | 行为 |
|---|---|
| ‹ › 按钮 | `snap(±1)` |
| ← → 键 | 同上 |
| 指针拖拽 \|dx\| > 36px | 松手后卡 ±1 |
| 横向滚轮 | 带锁，每次 ±1 |
| 环绕 | `((i % 24) + 24) % 24` |

## 产物 / 截图
| 路径 | 说明 |
|---|---|
| `index.html` | 24 题条带视口原型 |
| `assets/renders/chassis-*.png` | 空卷轴底盘 |
| `assets/panes/*.jpg` | 24 封面裁片 |
| `checks/titleband-BEFORE-overflow.png` | 修复前：忧郁/田园溢出卷轴 |
| `checks/titleband-AFTER-no-overflow.png` / `titleband-AFTER-web.png` | 修复后：侧格空卷轴，中心可读 |
| `checks/desktop-strip-{start,mid,end}.png` | 桌面 idx 0 / 11 / 23 |
| `checks/mobile-strip-{0,11,23}.png` | 手机三态 |

## 已知缺口
- 横幅封面（留白、田园等）在窄尖格里竖裁会丢信息；改构图需夕里定
- `prefers-reduced-motion`：滚动段直接终态；条带仍可键盘/按钮切换

