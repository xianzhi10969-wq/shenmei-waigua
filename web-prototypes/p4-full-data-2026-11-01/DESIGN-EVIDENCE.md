# 版式与素材证据

日期：2026-11-01。交付为可操作网页，不是 Figma 新稿。

## 读取与作用范围

本轮使用 `.agents/skills/shenmei-editorial-layout/SKILL.md`；读取上游：

- https://github.com/medoismail/grid-systems-editorial-skill/blob/main/typography-rules.md
- https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md

上游原文不作为本仓库新增内容复制分发。

Figma 对照：文件 `pIL4mlWLHxph3pqXlIVq1s`，手机 `898:62`，桌面 `830:22`，词条手机 `82:2`。最新小标题稿为待审状态；不宣称本实现已获用户审美确认。

## 规则 → 实现 → 验收

| 规则 | 应用 | 证据 |
| --- | --- | --- |
| E01 信息层级 / page-composition | 章节标题先于分类目录，画作与题签一一对应；V4 深色展开页与纸色阅读区分层 | `public/app.js` 的 chapterView/termView；手机与桌面实跑截图 |
| E02 栅格 | 手机 390 − 24×2 = 342 内容宽；五框原生 342/220/236/318/306 宽，用容器比例缩放；超五分类重复组；照片始终 contain | `.gallery-card/.frame-stage/.mount`；五种屏宽 120 组合检查；换图前后容器几何对比 |
| E03 垂直节奏 / typography-rules | 沿用 Figma 导航 44、标题 64、目录至少 44、画框间 56、题签最少 56；真数据长标题自动增高 | `public/style.css`；目录 8 项、英文长名称、0/1/8/13 分类测试 |
| E04 字号角色 | 手机主标题 56/64，题签 28/36，说明 14/24，动作 12/20；窄屏有独立适配 | CSS 明确字号；不为每个专题挑一套字体 |
| E05 视觉呼吸 / page-composition | 不拉伸照片、不按某五张照片的比例重新构图；留原画框内纸边，图片可独立替换 | 原图片字节、407 图解码；frame-stage 几何替换测试 |
| E07 可编辑与保护 | 网页文字、照片、画框层和入口都独立；Figma 零写入，现有线上零发布 | 本分支独立目录、`checks/entrance-provenance.json`、`checks/art-provenance.json` |

印刷行长/页边比例未机械套用到手机中文网页。为避免长英文挤压，标题/题签允许换行，故并非把 Figma 固定高度当永久上限。词条页内容长度来自真实数据，标题和 hero 随内容延展；这部分属于响应式实现候选，需要用户视觉验收。

字体：Noto Serif SC + Cormorant Garamond，已本地化；P1–P3 保留原来的 CabinetSong 文件。没有声称 Figma 使用了未安装的朱雀。原图片不加滤镜、不裁掉作品内容。

截图只作为浏览器实现的审阅证据，不替代 Figma 可编辑设计交付；本轮未要求也未修改 Figma。
