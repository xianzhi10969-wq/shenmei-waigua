# 水波素材制作记录 · 提案待审

模式为内置 image_gen，先生成一张独立水波位图，再针对纸纹灰场与水波线条分别编辑。不是 SVG/CSS 铜版装饰，也未用生成图覆盖 P2。

首次提示词核心约束

Use case: stylized-concept. Asset type: a SINGLE horizontal water-engraving transition strip for an existing website. Reference image: v4/assets/p2_nostar.png, ONLY for line rhythm and width, especially the sparse elliptical water ripples below the stair. Do not redraw or include the stair, words or star. Create ONE panoramic 3:1 image: top edge solid ink #1E1E1E, bottom edge solid paper #F6F3ED. Transition made only by elegant long copperplate engraved water ripple curves, gently nested elliptical broken arcs in perspective. From upper to lower region the strokes become fewer, finer, more open, farther apart. No gradients, gray crosshatching, grain, distress, texture, mountain silhouette, jagged coast edge, straight scan lines, repeated dashes, surf, foam, stars, text, frame, scenery, or extra objects. Return only the artwork asset.

第二次编辑的完整提示词

Edit ONLY the surface/color treatment of the water ripple transition strip. Preserve ALL composition, every ripple position, overall dimensions, stroke sizes, and the black-to-paper division exactly. Remove 100% of grain, noise, gray shading, light effects, paper texture, dirty marks and atmospheric gradients. Make it a perfectly flat clean two-spot-color screenprint: solid ink #1E1E1E and perfectly uniform paper #F6F3ED. Every flat field must be uniform exact color, no lighting, no vignetting. Lines must be hard clean continuous ink, no gray fade: endings get thinner geometrically, not by opacity. This must resemble a pristine digital ink engraving with smooth near-vector edges. Absolutely nothing else changes. This is a flat graphic asset, not a photographed print.

结果仍有细微灰场，因此页面不直接显示源图，而是以每像素亮度阈值 124 映射到两种规定色。此映射是本提案的输出方式，不意味着水波线节奏已获批准。

第三次编辑的完整提示词

Edit the attached transition strip. Keep the same composition, top pure ink field and bottom pure empty paper field. Make ONLY the middle water-ripple linework much cleaner: REMOVE every short straight horizontal dash, every tiny speck, broken pixel-like mark, irregular jagged strip, and sawtooth. Replace this dense noisy band with just 12-18 long uninterrupted graceful elliptical water-ripple arcs, elegantly curved at their ends. No straight horizon cutoff. Let the black field open through 4-5 large smooth shallow elliptical peninsulas that taper into the long arcs, so that blank paper flows naturally between black wave strokes. Lower area has only 5 long thin incomplete elliptical arcs, fully smooth and clean. Pure polished digital line engraving. TWO FLAT colors only #1E1E1E and #F6F3ED, NO grain, NO gradients, NO gray, NO texture. Do not add any objects, words, scenery, frame or decorative motifs. Wide flat graphic asset, no photographs or mockups.

最终提交的是浏览器将第三次结果专色映射后导出的 PNG。像素清点为两色，详见 validation.json。
