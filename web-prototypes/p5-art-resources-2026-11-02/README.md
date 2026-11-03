# P5 艺术资源 · 页面代码

## 2026-11-03 · 四入口持续轻漂浮（动效待审）

用户明确选择“平时就轻轻上下漂浮，四项节奏错开”。已添加6/6.8/7.4/6.4秒四个周期，负延迟错开初始相位，视觉层在+2至-4px范围缓慢往返；文字、箭头与黑底片使用同一动画，整个原生按钮命中区域固定。桌面编号随内容同步。

鼠标悬停、键盘焦点或按下时当前项暂停在所在位置；离开视口或标签页隐藏时整体暂停；`prefers-reduced-motion: reduce`禁用漂浮。组件卸载会清理观察器和监听器。只改变transform，不改排版或插画像素。

已在当前412px宽预览中读取两个不同时刻：四项均持续变化、周期与相位不同、黑底/文字变换完全相同、位移边界与按钮固定区域通过，Enter触发与焦点暂停通过。见`checks/motion-validation-2026-11-03.json`。减少动态效果通过CSS回退实现，本轮未切换操作系统偏好验证；未重新宣称全部六视口回归。预览已刷新，视觉强度待用户评价，未上线。

2026-11-02。用户“行吧就先这样吧，你先把这个上代码”采用当前手机黑白交替稿进行代码落地。

- 手机源稿：[Figma968:224](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=968-224)，390×844。
- 桌面源稿：[Figma902:43](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=902-43)，1440×1000。沿用桌面已认可的编号与长文案，手机保留短文案与黑白交替；没有把手机改动擅自铺到桌面。
- 原生 HTML / CSS / ES module，适配项目当前静态站；无 React、Tailwind 或打包依赖。

## 打开

在本目录执行 `python3 -m http.server 8765 --bind 127.0.0.1`，打开 http://127.0.0.1:8765/ 。ES module 需要 HTTP，不用 file:// 打开。

`index.html` 是独立审阅宿主，画面下方的说明和事件输出属于预览工具，封装在 `preview.css`，不进入组件。当前主干只有P1–P3连续页，P4与导航仍在并行目录；本轮没有把P5直接跳接在P3后或覆盖这些并行工程。尚未发布生产站。

## 主站接入

引入 `p5.css`，为页面准备一个挂载容器，然后：

```js
import { mountArtResources } from './p5.mjs';

const p5 = mountArtResources(document.querySelector('#art-resources'), {
  onSelect: ({ id, label }) => openResourceCategory(id),
  onNavigate: () => starNavigation.open(),
  onContinue: () => goToImageryLab(),
});
// 卸载时 p5.destroy();
```

上例三个宿主函数需要用实际路由实现替换。四个分类稳定ID分别为 `visual-inspiration` / `artworks` / `interactive-websites` / `creative-materials`。也可监听冒泡、可取消的 `p5:select` / `p5:navigate` / `p5:continue` 事件；调用 `preventDefault()` 会阻止对应回调。所有入口均为原生button，支持键盘和可见焦点。

资源列表页、星星菜单和P6没有在此伪造内容或虚假跳转；组件提供独立接入口，预览宿主会显示准确的事件输出。需待实际页面/导航落地后连接，不冒称全站闭环已完成。

## 实现与视觉证据

- 手机文字轴与错落：标题x152，入口文字x152/188/164/192；文字y400/484/580/656；入口设计区域214×68。
- 黑底片131×44，纸白字及箭头；第一/第三项反白。文案、字体和间距来自Figma高保真设计上下文；没有用整页截图作背景。
- 标题Noto Serif SC Light 32/40；入口Regular20/28；本地同名字体300/400字重子集。字体覆盖当前双端全部文案，不适用于任意动态资源正文；新增文案时应更新子集。OFL与字体下载来源随素材保存。
- 手机使用原半门图的独立取景和重绘枝条透明图；桌面使用其批准的完整插画取景。原星B分别使用Figma导出的44×44、48×48 SVG，根尺寸未改。
- 设计世界390×844与1440×1000通过容器单位等比响应；900px以下使用手机独立构图，宽屏使用桌面；中间宽度手机画面最大520px居中，避免把手机构图无限放大。
- 已读取项目Editorial技能、上游page-composition.md的留白/轴线与typography-rules.md的层级/行距：E02保留源图轴线，E03保留疏密间隔，E04保留字级，E07真实DOM文字和独立图片。对应事实可在p5.css及浏览器记录检查；不是新一轮视觉设计。

## 验证

`checks/browser-validation.json`：本机Chrome，320/390/430/768/1000/1440宽六种视口；本地字体和所有静态图片加载、四分类不同事件、导航事件、Enter触发下一页、可取消事件、至少44px点击区域、无横向溢出/文字越界、无脚本错误或失败请求均通过。390/430/1440截图保存于checks目录，已与源稿合看。非真机Safari测试。

测试脚本 `checks/verify.py` 依赖Python Playwright和本机Chrome；只需在本地检查时安装，不是网站运行依赖。

全部静态资产在assets中，运行时不引用临时Figma下载URL；来源和SHA256见assets/manifest.json。图片原字节保留，未压缩、重采样、重画或重新生图。

基于已核对origin/master `c0bf54647a7a786849ccd2b9378455535c6788da`建立独立分支 `codex/p5-art-resources-20261102`；远程fetch两次因连接故障未完成，未声称基线包含未知的新提交。新增目录可独立合并，不修改既有P1–P4、生产包或飞书。
