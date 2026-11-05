# 词条编辑排版10：真实图片可变化 · 2026-11-05

状态：独立候选，待用户审图；非整页/响应式/转场完成。
用户要求“运用排版资源重新装饰和排版”，补充“不是每个专题都是这张插图的”。不能将清冷舞者图套给所有专题；也没有将吊灯确认为所有专题固定装饰。当前两例仅验证作品、标题与引言的关系，装饰可独立替换。

## 交付
- [清冷10A](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=1003-23)：390×1086；扉页720高，竖幅侧注。
- [Coquette10B](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=1003-56)：390×1146；扉页880高，更宽完整图版＋下置引言。
- [总板1003:16](https://www.figma.com/design/pIL4mlWLHxph3pqXlIVq1s?node-id=1003-16)：独立存放，本轮组件主件在右侧/下方。
- 本地 output/term-editorial-variable-art-2026-11-05/：两张最终PNG、首次发现文本问题的PNG、Figma构建脚本记录。
- GitHub保存本说明与构建记录；PNG/图片本轮存于本地及Figma，不声称已上传仓库。

## 资源→动作→证据
实际读取项目 .agents/skills/shenmei-editorial-layout/SKILL.md，以及上游：
- [grid-construction.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/grid-construction.md)，40a8b8cae79c04aead1909119845a3bb1f14b8db
- [typography-rules.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/typography-rules.md)，b1cfab7c555788a5d003cb5945771ebb2d582b3d
- [page-composition.md](https://github.com/medoismail/grid-systems-editorial-skill/blob/main/page-composition.md)，c99634840a494afabe7191080910d083498c4579

E01/E05：白色标题先读，吊灯偏上右，作品扩大；保留灰色曲线贯穿暗部。作品旁只放短引言，不让正文围绕多边。清冷图1003:33在(156,332)，210×345；侧注1003:44宽108，16/26px，按语意分6行。Coquette图1003:66在(80,320)，286×365.544，完整FIT；引言1003:75宽342，18/28px，置于作品下方。两例并非一套坐标强行换图。
E02：390宽−左右24×2=342；6栏×47+5栏距×12=342。隐藏可编辑Guide 1003:49、1003:79；作品为按原比例取景的有意偏离，不强裁整栏。正文和眉题共享24左轴。
E03/E04：保留已用字体与配色，不另开字族/色彩方向。中文主标题104、英文副题32，拉丁主标题82；正文17/28，侧注16/26，眉题11/16。中文阅读与实际字面优先，不套45–75拉丁字符或印刷边距比例。大字轮廓附近允许穿插，不机械执行印刷1em间距。
E07：原生TEXT、独立图像、自动布局正文；两张分别28/26个后代。标题组件1003:34、1003:67的前景/暗色避让底字绑定同一TEXT属性，改变标题不再要求手动改两个副本。可替换装饰组件1003:21；页眉组件1003:20。静态Figma样稿仍需人工选择图片比例、调整长标题与装饰避让，不是已实现自动适配全部101词条。

## 数据与保护
- 清冷文字与舞者来自已有Figma999:16/原词条稿，仅保留现有样例关系；没有重新实时查询飞书核对该封面。
- Coquette来自11月3日飞书只读缓存 terms.ndjson，record_id reczz28HJJL2GJHl；所属章节“可爱”；封面“秋千_弗拉戈纳尔_公有领域.jpg”。缓存manifest与原图SHA256 65fafbb80af0a05c70ea6aca309e48daa1a6618e0b1744234ad6c21f3721d959对应。
- 核心、正文使用原记录原文；清冷只调整换行，不改措辞。未将“可爱”章节与Coquette词条混为一层。
- 吊灯02哈希 cf7382579b11bac1cceea8a9b60f550dd30b0dcd；清冷封面612130b93b5ec44a38cf785807bd3fefe617a5e1；曲线89ebebf6646b8832c46b5e20b4b8bcaca7d35720；Coquette原图上传hash0872fc8f5390c5587cef3d7a025a29a0dbe29532。
- 原图片像素未改；本轮主动改变副本中的位置尺寸/曲线透明度。图层锁定，旧999:16/996:16/993:16/81:3/82:2保留。未改首页、拼贴、飞书、部署；无生图。

## 检查与限制
实际查看390宽两稿截图。首次文本框固定高度导致侧注/正文截断，已用HEIGHT/HUG修正；再次截图核验全部原文展开、无正文相压。清冷“情感”被拆行后按语意修为6行，156高，再截图。
保留原Noto Serif SC、Cormorant Garamond、IBM Plex Mono与页眉Noto Sans SC，未冒用新字体。
两种实图均为竖幅，只覆盖较窄/较宽竖图和中英标题；尚未覆盖横图、所有长标题、真机/其他宽度、所有专题装饰。
回看P1画法参考；这轮排版不能证明与P1/P2画风完全统一。用户此前否定美感保留的反馈仍有效，审美验收待用户判断。
