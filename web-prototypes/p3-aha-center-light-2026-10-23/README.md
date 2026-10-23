# P3 Aha 实验 · 中窗点亮（2026-10-23）· 待夕里审 · 非基线

夕里：「你先实验一下」「因为我脑补不出来…」

本目录是**最小 Aha 实验**：P3 进场先暗，只亮中窗透出飞书封面色，题名晚半拍出现，再解锁一格一格滑动。约 3 秒，可跳过。

**没有改** `p3-stained-glass-v3`、`p1-p2-reveal-star-v4`、`p3-p4-restored-v9`。素材从 v3 **复制**而来。

## 打开

```bash
cd web-prototypes/p3-aha-center-light-2026-10-23
python3 -m http.server 8767
```

浏览器打开：<http://127.0.0.1:8767/index.html>

- 桌面 ≥900px：五联；手机：中整 + 左右半
- 任意点击 / 空格 / Enter / Esc / ←→（未解锁前）→ 跳到终态
- `?freeze=dark`：停在暗厅（截图用）
- `prefers-reduced-motion: reduce`：直接终态（中窗亮 + 题名 + 可滑）

## 时间轴（约 3 秒）

| 时刻 | 状态 | 看见什么 |
|---|---|---|
| 0–0.35s | `dark` | 夜色底；石框淡影；五格全黑 |
| 0.35–1.9s | `center` | **只有中窗**封面色透出（像光穿过玻璃）；侧格仍夜色 |
| 1.9–3.0s | `title` | 中格卷轴题名淡入（半拍后） |
| ≥3.0s | `unlocked` | ‹ › / 拖拽 / 触控板横向 → 每次 ±1 专题；侧格保持极暗剪影 |

默认焦点：**爱欲**（序号 2）。24 个一级专题环绕，逻辑复用 v3 条带。

## 和 v3 的差别（只做 Aha，不做接缝）

- 无 P1/P2、无夜色水面过渡（接缝交给 GPT）
- 进场不是「五格全亮立刻能滑」，而是「暗厅 → 中窗点亮」
- 解锁后侧格仍压暗，焦点始终在中窗

## 产物

| 路径 | 说明 |
|---|---|
| `index.html` | 可运行原型 |
| `assets/renders/chassis-{web,mobile}.png` | 自 v3 复制的空卷轴底盘 |
| `assets/panes/*.jpg` | 自 v3 复制的 24 封面裁片 |
| `checks/desktop-01-dark.png` … `04-unlocked.png` | 桌面四关键帧 |
| `checks/mobile-01-dark.png` … `04-unlocked.png` | 手机四关键帧 |
| `checks/aha-sequence-desktop.mp4` | 约 6s：3s 开场 + 滑两格 |
| `tools/capture.py` | Playwright 截图 / 录屏脚本 |

## 验收问夕里

1. 这一下「暗 → 中窗透光」有没有 Aha？还是只是慢一点开场？
2. 题名晚半拍，节奏对不对？
3. 解锁后侧格保持夜色，还是要像 v3 一样两侧也亮封面？

## 已知缺口

- 窗框线质 / 拱顶完整度仍是 v3 水平（GPT 另做）
- 底盘 PNG 在暗厅里仍偏「线稿底」，不是真正的石材体积
- 未接 P4

