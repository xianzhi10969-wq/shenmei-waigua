# P4 全量数据运行版 · 2026-11-01

本目录是独立可运行实现：保留 P1–P3 的原始插画和动效，增加 P3 → P4 → 词条 → 案例/原图的真实导航；前端通过 Python API 读取飞书的完整内容快照。没有部署或修改 Figma。视觉仍待用户验收，不把浏览器通过视为美术定稿。

## 本机预览

- 全程入口：<http://127.0.0.1:8791/entrance/>
- P4 幽玄：<http://127.0.0.1:8791/#/chapter/reczz28HJJL2A7HL>
- 24 章索引/101 词条搜索：<http://127.0.0.1:8791/#/chapters>

## 启动

依赖 Python 3.9+、Node 及已登录的 `lark-cli`。无前端构建步骤、无数据库服务。

```sh
# 在本目录中执行。LARK_CLI 为本机已安装 CLI 的实际路径；Node 须在 PATH 中。
export LARK_CLI=/absolute/path/to/lark-cli
python3 scripts/package_entrance.py
python3 scripts/sync_data.py
python3 server.py --port 8791
```

每次调用飞书均在脚本中显式传 `--profile aesthetic-feishu --as user`。仅使用表读取、附件下载操作。不要把飞书登录信息交给浏览器。没有可用登录时可用已存在的快照：`python3 server.py --port 8791 --offline`。

P1–P3 打包脚本读取本目录相邻的三个仓库原型目录，保留素材和动效，独立增加入口链接。若是 sparse checkout，先把以下目录纳入：

- `web-prototypes/p1-p3-continuous-2026-10-31`
- `web-prototypes/p1-p2-reveal-star-v4-2026-10-21`
- `web-prototypes/p3-stained-glass-v3-2026-10-23`

`public/assets/` 已包含 Figma 原素材、画框组件和本地字体，运行不依赖临时 Figma 图片链接或 Google Fonts 网络请求。必要时可用 `scripts/fetch_fonts.py` 重新获取字体。

## 数据与服务

飞书导出：24 章节、101 词条、195 案例、34 章节段落；根据“是否保留”纳入 144 案例，其中 139 条有词条归属，已全部接到页面。55 词条已上线，46 更新中。下载 407 个不同图片附件，原图字节不变。专题可有多个章节关系；幽玄的显示顺序单独遵循 Figma，其余遵循章节词条清单。新增词条自动进入对应章，无需重新画框。

- `/api/catalog`：全部章节和词条目录
- `/api/chapters/:id`、`/api/terms/:id`、`/api/cases/:id`：详情
- `/api/p3-topics.js`：原 P3 使用的安全章节列表，不含附件 token
- `/api/health`：是否就绪、同步是否失败、最近成功检查时间

默认 300 秒检查飞书版本；有变更才重新读取。导出完整性、章节关系、图片下载、同步前后版本一致性全部通过才原子替换快照。失败保留上次完整数据；日志/health 明确标记失败。HTTP 通过 ETag 支持缓存验证。`private/` 不在静态文件目录中；API 仅返回显式字段，绝不返回附件 token 或登录凭据。

缺图不会杜撰替代封面；更新中词条有明确状态和返回导航。过滤掉旧“正文”字段，避免重复混入历史案例/做法。无归属案例不擅自挂到某个词条。

## 已知内容问题

- 已上线但缺封面：梦核、甜亚系、复古摇滚、意难平、青涩、松弛感、波普、颓废美学、odd 风格。
- 5 条保留案例缺所属词条：海边的修士、月下独酌、厌倦、烦恼、暴风雪：汉尼拔和他的军队翻越阿尔卑斯山。保留在案例 API，未出现在任何词条的关联列表。
- 飞书原文中仍有“待取色”等编辑状态；本轮没有代改内容。

## 检查与边界

见 `checks/browser-report.json`、`checks/edge-cases.json`、`checks/api-tests.txt` 和 `DESIGN-EVIDENCE.md`。

- Chrome 桌面模拟 320 / 390 / 430 / 768 / 1440 宽，共 120 个章节视口组合。
- 遍历 101 词条；144 案例 API；407 本地原图完整性及浏览器解码。
- P3 选中章进入 P4、双归属词条的来源章保持、案例返回、原图 Escape/焦点恢复、搜索、切章、404、网络失败重试。
- 0 / 1 / 8 / 13 分类的测试数据，以及换照片后容器几何不变。
- 接口失败保留旧快照、禁止访问私有文件、ETag 304、归属/顺序验证。

当前是本机运行版。Python 标准库服务用于集成预览，不冒充已部署的生产后端；生产发布仍需确定宿主、HTTPS/访问策略、后台同步任务及持久存储。现有 Netlify 静态发布不能直接运行这个 Python 服务。没有测试真实 iPhone/Safari，也没有声称重现尚未确认的 P3→P4 专用转场。P4 首屏以及真实长文的阅读节奏仍待用户评价。

## 复验

启动 8791 服务后：

```sh
python3 -m unittest discover -s tests -p 'test_*.py' -v
node tests/browser.cjs
node tests/edge-cases.cjs
```

浏览器脚本默认使用本机 Codex 附带的 Playwright 和 Chrome 路径；可通过 `PLAYWRIGHT_MODULE`、`CHROME_PATH` 环境变量覆盖。测试 fixture 只在浏览器中拦截请求，不写回飞书。

数据快照、媒体附件与生成的 P1–P3 打包目录不提交 Git，可从只读同步和打包脚本重建。运行时本机目录中已完整存在。
