# 手机 P1 星星明灭采用与发布 · 2026-11-01

用户明确“可以，先用这个版本吧，记得把代码也保存一下”，采用出现→完全消失→再出现的版本。

## 代码

- 真相源：web-prototypes/p1-p3-continuous-2026-10-31/mobile-star-blink.js；发布副本：deploy/netlify-p1p3-continuous-2026-10-31/mobile-star-blink.js。
- index.html 新增独立 defer 脚本引用。原图及其他119个发布文件与本轮远程基线一致，保留已上线黑色主标与配套题字、开场显影、P2矢量文字、P2→P3及P3翻页参数。
- 每3200ms循环：出现保持→淡出至0→完全隐藏416ms→淡入至1→保持。沿用用户认可的星形与原位。
- 等原图及开场显影完成后挂载；星星可见时滚动继续；离屏/页面隐藏暂停、返回恢复。减少动态效果时显示原图并移除明灭层。桌面分支不挂载。
- 研究入口现在直接控制采用版实现，不再叠加第二套星层；原候选代码保存在Git历史（1d664b4），可追溯。

## 验证与范围

Chrome本地390×844、430×932，16项检查通过：显影结束只挂一层、透明度0/1、下滑80/200px继续、离屏暂停、回到视野恢复、字标实际宽度与原图保留。脚本与原图、字标文件均作字节校验。未做真机Safari测试。

可重复检查：research/2026-11-01-p1-star-twinkle/adoption-checks.html。无Figma或飞书写入。

## 发布

- 生产：https://subtle-peony-38e354.netlify.app/
- Netlify deploy：6ae6fe8e38800a8db7b233ef，2026-11-01 16:55（Asia/Shanghai）。
- ZIP：releases/2026-11-01/p1-star-blink-adopted.zip（本机工作区），SHA256 8dd00005bf814d261ba2fed6cfab820d2371d83bf1b0bfddaffbc13d96725852。
- 上一正确部署：6ae6ed898a81debcf7a1713d（含手机字标）。
- 本轮首次文件选择器上传误选了旧包（6ae6fd6dfeec187699edac02），线上文件校验发现后立即纠正。该中间部署不是回滚目标。
- 最终线上根HTML、mobile-star-blink.js、brand-lettering.css、主副字标SVG均HTTP200且与发布包逐字节一致；校验摘要见MOBILE_STAR_BLINK_CHECKS_2026-11-01.json。
