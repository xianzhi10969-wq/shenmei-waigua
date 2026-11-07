# 本轮规则与视觉证据

2026-11-07。先读最新远程CURRENT_STATE并核对master e89e288e1c1d331edb89882ebffd97773af0ec15，再查PROJECT_CONTROL、AGENTS、README、CREATIVE_MEMORY及原20词条handoff；开工重读`.agents/skills/shenmei-editorial-layout/SKILL.md`（30d6f2b65ddade3e8c187b0585a2b120261f1634）。随后实际读取上游：

- [grid-construction](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md)，40a8b8cae79c04aead1909119845a3bb1f14b8db。
- [page-composition](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)，c99634840a494afabe7191080910d083498c4579。

E02采用先定画幅/主次区域的方法，桌面1200×1100、手机390×1110各自定义坐标，约8–24px边缘；数据存在layouts.py与12份layout.json，4×12份结构/实图SVG可编辑。纸页的2:3:4:6比例与报告40–60%占图率不适用于本次用户已认可的密铺要求，未机械套用。

E01/E05每张先摆完整主画面，周边安排较小场景与细节；用户明确要求大致铺满，因此压缩孤立留白，同时检查主角眼神/脸/身体。发现并修正：废土机器人小图挡猫脸、武侠细节挡眼神、破碎感书封挡Woodman主体、青涩下方小图挡朋友；禅意/废土用真实石砂与招牌局部补中部空洞。保留雪景和水墨原图自身的空白，不用无关装饰填充。

E07原图像素保持不变，裁片和轮廓是SVG图层；文字可编辑，不烘焙在图里。源图、蒙版、坐标与案例/原图出处映射各自独立。此为SVG/HTML交付，不声称Figma节点施工。93原图与只读下载副本字节一致，未改已有三张确认稿或其他bot的文件。

用户明确授权沿已认可实图方向把余下十二张做完；本轮沿用既有字体/原色，不另开生图、配色、字体设计。先组织几何，再生成实图供逐板审图；不要求用户再次授权已经指示的重拼工作。

24张双端实图已看；60种页面/宽度无溢出/图片加载错误、272次原图打开与来源映射核验。检查不能代替美感判断；本批待审，前三张单独已认可。
