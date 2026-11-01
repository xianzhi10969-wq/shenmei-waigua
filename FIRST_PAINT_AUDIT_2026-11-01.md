# 2026-11-01 首屏加载优化核验

基于 `2e3649273e973e9c60b51eb682c2ccefd4a4bf12` 的最新 P3 翻页版继续修改。保留 W=58、一势一格、idle 200ms 和最新缓存规则。

## 本轮改动

- HTML 用媒体查询预加载各端 P1 原图；内联 bootstrap 先启动桌面 v4 iframe 或手机 m_p1，不等 P3 模块。
- 移除 transition.mjs 启动处的字体及手机 decode 等待。专题字体只在 p3Assets=1 后使用。
- 普通入口滚动超过 40px 且接近旅程时才触发 P3，避免大窗口/缩放后阈值归零；?at / ?still / ?night 预览保留。
- 只预取当前设备的蒙版。
- 修复 paper.css 强制子层 visible 导致夜色层提前盖住 P1：尚未进入旅程时用整个 cinema 的 opacity=0 隐藏，启动前同样隐藏；画面素材和动画不改。
- 同步源码和 deploy 副本，更新 JS/CSS 查询版本戳。发布副本保持 ./ 资源路径。

## 浏览器验证

在本机 Microsoft Edge 中通过本地测试页运行，34/34 项通过，结果保存在 `web-prototypes/p1-p3-continuous-2026-10-31/tests/first-paint/results.json`。

- 1440×900、1920×1200、888×647、390×844、390×1200：首屏 P3 封面/蒙版/底图/字体请求均为 0；初始 scrollY=0、cinema opacity=0。
- 对应端 P1 独立启动，手机不启动桌面 iframe。
- 滚动后 P3 加载；不拉另一端蒙版；P3 可进入、箭头翻页和返回 P1；?at=1 正常。
- 人为延迟 transition.mjs 5秒，1.5秒检查点：旧版 P1 iframe 尚未启动，新版 P1 背景已加载。
- 旧加载逻辑在 1920×1200 首屏提前加载 57 个专题/蒙版/字体资源；新版为0。对照夹具来自 bab0505；之后两次上游只改 P3 motion / 缓存戳 / headers，合并后用最新 motion 重跑通过。
- 原版/新版实屏对照确认夜色层曾提前遮住 P1 底部；修复后 P1 原画完整显示，非重新裁图。

这些是本地行为回归结果，不是线上弱网 LCP 分数，也不承诺固定秒数。桌面原图字节量仍约5–6MB。

## 保护与复测

全部图片、字体文件、飞书快照、内嵌 v4 HTML 和开场动画保持原字节；没有调用飞书写接口。

运行 `python3 web-prototypes/p1-p3-continuous-2026-10-31/tests/first-paint/serve.py`，浏览器打开 http://127.0.0.1:8765/harness.html 并点击运行检查。测试夹具和结果不在 deploy 目录，不会上线。

## 发布

- Netlify 当前已发布部署：`6ae6aaa0111fd76841995c9d`，2026-11-01 10:57（Asia/Shanghai），使用已有账号的 Netlify Drop。
- 发布包 SHA-256：`6119d10832773c7beacaef7311ceab6dfff27b6cd3599402295181eab959eaa0`。后台确认只上传4个变动文件。
- 实现、浏览器核验和发布记录一同回写 GitHub；发布前合并上游 `34d3983`。所有图片、最新 motion.js 和 _headers 与上游一致。
- 原网址保持不变；上一可回滚部署 `6ae6a55016a267d788a60778`。


线上 HTTP 核对：index.html（去除 Netlify 自动注释）、transition.mjs、styles.css、continuous.css、motion.js 全部与验证过的发布包一致，均请求成功。结果见测试目录 production-check.json。
