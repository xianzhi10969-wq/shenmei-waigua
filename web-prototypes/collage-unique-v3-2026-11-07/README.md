# 拼贴去重重拼 v3 · 2026-11-07

状态：2026-11-07 用户回复「可以 存库里 标注了这一轮你做了啥」，确认并授权保存本轮五张 v3 拼贴。未替换 Coquette、既有首页、Figma、飞书记录或部署。

用户最新反馈：密度要接近 Pinterest 拼贴，但不能反复使用同一件衣服、同一家店或同一枚戒指。宁可下载新的真实案例图补充。此前 v1 太疏；v2 用重复裁片增加密度被否定。

## 交付

- `index.html`：五板，桌面/手机独立构图，点击完整原作与官方出处，保留 v1 / Grokbot / Coquette 对照。
- `sources.html`：逐张原图、名称、原站出处、新增参考/已有案例区分。
- `new/`：10 个 SVG/HTML/PNG。
- `additions/selected.json`：实际采用的 18 个新增参考；未新增或改写后台案例。
- `new/sources.json`、`new/geometry.json`：全部 42 个对象与布局。
- `object-identities.json`：同作品/物件共用身份，包括已知不同角度与不同文件的别名。
- `dedup-audit.json`：逐板语义去重及原图字节去重结果。
- `checks.json`：10 个视图、84 次原图入口检查，无资源报错、无手机横向溢出。

| 板 | 独立对象 | 新增参考 |
|---|---:|---:|
| Retro Rock | 9 | 5 |
| Softcore | 8 | 3 |
| Midsummer | 8 | 3 |
| Dopamine | 9 | 6 |
| Decadence | 8 | 1 |

新增 Retro Rock：V&A 的 Bowie 舞台鞋、Life on Mars? 演出服、红色电吉他、EMS 合成器，以及 CIA v UFO 海报。店铺、Stevie Nicks 演出服、Keith 戒指人像、Great Frog 戒指分别只出现一次。

新增其余板：DRIFT Shylight、Driade Roly Poly、nendo Jellyfish Vase；Sorolla 海滨漫步、Hockney A Bigger Splash、Tom Brigance 泳装；Cyrk 海报、Heart Cone Chair、Living Tower、Mae West Lips Sofa、Tahiti 设计图、Pantop 灯；Lalique 项链。

## 去重边界

先人工查看原作并赋予物件/作品身份，再进行布局。新文件名、换角度、换裁切不构成新对象。已知同物别名登记到 `object-identities.json`；构建时若重复身份则停止生成。该规则不是自动识别所有未知物件，新增素材仍需要看图确认身份。

Hanabi 的 H38 / H59 为两幅视觉内容不同的摄影；Margiela 三张为三套不同造型，已并排核验。没有同物反复裁片填空，也未生成人工“新原作”。

新增原图作为本轮已确认拼贴的外部参考，来源与权利归属以原站为准。`additions/manifest.json` 保留研究下载记录，实际采用并随库提供的新增原图以 `selected.json` 为准；未采用备选和网页抓取缓存不随库复制。

## 复现

运行 `python3 build.py`、`python3 audit_sources.py`，再通过 `render.cjs` 渲染预览。使用已有 `extract.swift` / macOS Vision 输出透明前景，SVG 保留裁切和位置的可编辑性。`layouts.py` 独立存放双端布局。

本机预览：http://127.0.0.1:8898/?board=retro-rock 。这是本地服务，不是线上发布。

## 本轮存库与使用

本目录完整保存至 GitHub master，独立目录归档；确认范围是这五张拼贴，不扩大为整站接入或生产发布。上一轮“仅本地／待审”的交接状态被本次确认覆盖，历史记录仍保留。

运行 `python3 -m http.server 8898 --bind 127.0.0.1` 后打开 http://127.0.0.1:8898/ 。浏览无需安装其他依赖或登录飞书。编辑重建需要 Python + Pillow；可选截图检查需要 Node.js + Playwright，并可通过 `PLAYWRIGHT_MODULE`、`CHROME_PATH`、`PREVIEW_URL` 指定环境。透明 PNG 已包含，浏览与重排不要求重跑 macOS Vision。

[本轮具体改动与确认](ROUND-CHANGELOG.md)。`MANIFEST.json` 是归档逐文件校验；`history/v2-rejected/` 保存重复裁片被否定的上一轮双端预览，仅供回溯。旧 Grokbot、疏排 v1、Coquette 仍在对照入口。
