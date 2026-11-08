# 新内容字段契约 v0.1｜独立编辑层，待审

作用：让“感觉、看法、作品证据”真正关联；不是给原文换栏目名。新文件以现有termId关联，原catalog和飞书不改。

| 字段 | 用途与规则 |
| --- | --- |
| termId/name | 必须对应现有词条；不重新造slug替代record ID |
| status | 本批固定draft，不自动上线 |
| coreSnapshot | 原核心逐字保留，用于发现源内容变化；不是新开场 |
| resonance | 从生活经验描述“为什么可能被吸引”；编辑解读，不诊断读者 |
| sensations | 分visual/sound/smell/touch/taste/emotion；每词标observation或association，附关联案例ID；没有依据则空数组 |
| distinction | 对具体感觉作辨析，不自动指派相反人格 |
| connections | 默认juxtaposition并置；仅有直接文献时才能写historical_lineage；附作品与来源ID |
| caseReadings | 分fact与reading：前者必须有核验来源，后者明确为编辑解读；每条关联已有案例 |
| simplification | 改写旧“做俗了”，解释被简化掉的感受；不羞辱品味 |
| relatedTermIds | 现有相关词条ID，可继续同专题/跨专题；本批不强造反面风格 |
| feelingIds | 仅现有40词表中能对应的感觉；细感官词未擅自写入后台 |
| limits | 明确未核验事项、媒介缺口与暂不采用的历史/心理断言 |

来源统一在 `sources.json`：网页URL、核验日期、支持范围、未支持范围。一个链接不能给整段心理推断背书；本次核验的是特定事实，不是为全篇原案例背书。

`samples.json`是可接入的数据草稿，`samples.md`为人读版。重建与检查：`python3 product-work/2026-11-08/validate.py`。不得从此目录自动构建生产页。
