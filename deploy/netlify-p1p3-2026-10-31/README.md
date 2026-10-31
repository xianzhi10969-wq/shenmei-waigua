# P1–P3 demo · Netlify 部署记录 · 2026-10-31

- 站点：subtle-peony-38e354（site id `dceb69b5-e8d4-40f2-94c9-dc31d8ebd571`）
- 生产地址：<https://subtle-peony-38e354.netlify.app/>
- 本次 deploy id：`6ae542744bd98bc1a9a1b769`（<https://app.netlify.com/projects/subtle-peony-38e354/deploys/6ae542744bd98bc1a9a1b769>）
- 时间：2026-10-31 09:2x（UTC+8）
- 方式：netlify-cli，账号 xianzhi10969@gmail.com：`netlify deploy --prod --no-build --dir /workspace/out/netlify-p1p3`

## 内容（本目录即发布目录原样副本）
- `index.html`：入口页
- `p1-p2-reveal-star-v4-2026-10-21/`：受保护 v4 基线，原样
- `p2-p3/`：来源 `web-prototypes/p2-p3-unified-v3-2026-10-25`，待审
- `p3-stained-glass-v3-2026-10-23/assets/m_p2_nostar.png`

已验证：首页、两段原型、`review.html?device=mobile` 均 200。

## 已知问题
- P1→P3 不能连续翻（分两段）。
- p2-p3 里指向 `../p2-p3-cut-paper-v1-2026-10-24/review.html` 的链接 404。
- 过渡不丝滑，留给 GPT。
- 真机未测。

## 重新部署
```
netlify login
netlify deploy --prod --no-build --dir deploy/netlify-p1p3-2026-10-31 --site dceb69b5-e8d4-40f2-94c9-dc31d8ebd571
```

## 回滚到旧站
- 首选：Netlify 后台 → 站点 subtle-peony-38e354 → Deploys，找到本次（6ae542744bd98bc1a9a1b769）之前那次部署（10-14 Netlify Drop 的 V2），点 “Publish deploy”。
- 备用：旧站线上文件备份在 `deploy/netlify-backup-2026-10-31/`（index.html、app.js、style.css），完整源码在分支 `codex/backup-accepted-term-v2-2026-10-15` 的 `aesthetic-site/`。
