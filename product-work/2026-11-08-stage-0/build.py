"""Build review tables from an independent, unsigned proposal. Does not write site data."""
import hashlib
import json
from pathlib import Path
from collections import Counter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
CATALOG = ROOT / 'aesthetic-site/src/catalog.json'
FEATURES = ROOT / 'aesthetic-site/src/features.json'
catalog = json.loads(CATALOG.read_text())
features = json.loads(FEATURES.read_text())
terms = catalog['terms']
cases = {x['id']: x for x in catalog['cases']}

# Definition is an indexing boundary, not page copy or a claim about a reader.
lexicon_text = '''视觉|明亮|画面整体亮、光线显露，不等于开心|亮、亮堂
视觉|昏暗|亮部少、暗部占主要位置，不等于悲伤|暗、暗淡
视觉|鲜艳|色彩饱和度较高；与颜色数量分开|饱和、浓艳
视觉|低饱和|色彩饱和度较低；不等于高级|淡色、寡淡色
视觉|透明|能看见物体后方或内部；不等于仅用浅色|透亮
视觉|朦胧|边界或细节不清晰；不等于神秘|模糊、雾蒙蒙
视觉|空旷|对象间隔大、空处明显；不自动等于孤独|空荡、疏朗
视觉|密集|对象或细节集中；不自动等于喧闹|密密麻麻
视觉|规整|重复、排列或对齐清楚；不自动等于安心|整齐
视觉|错位|对象的位置、尺度或组合出现不协调|不搭、错搭
视觉|破旧|磨损、衰败或使用痕迹可辨；不等于粗糙|磨旧、残破
视觉|庞大|相对人物或参照物的尺度很大|巨大
视觉|微小|相对参照物的尺度很小|小巧
视觉|流动感|轮廓、轨迹或连续关系呈现流向；静图不声称真的运动|流淌感
听觉|安静|听觉刺激少；静图只记为联想，空景不证明无声|静
听觉|喧闹|多种或高强度声音交叠；图像只记联想|嘈杂
听觉|低回|声音低缓、回旋或持续；图像只记联想|低缓
听觉|尖锐|声音尖细、有穿透感；图像只记联想|刺耳
触觉|温暖|暖的触觉或温度联想；不同于温柔的关系感|暖
触觉|微凉|轻微的凉意；不等于清冷的疏离感|凉、凉丝丝
触觉|柔软|可压、可弯或软的质地联想|软、软绵绵
触觉|坚硬|难变形、硬的质地联想|硬
触觉|粗糙|表面凹凸、颗粒或毛边的触觉联想|粗粝、毛糙
触觉|光滑|平顺、少摩擦的触觉联想|滑、滑溜
触觉|潮湿|湿润、带水汽的触觉联想|湿、湿润
触觉|干燥|缺少水分或干涩的触觉联想|干、干涩
触觉|轻盈|低重量或轻负担的身体联想；不等于低能量|轻
触觉|沉重|重量或下坠的身体联想；不自动等于压抑|重
嗅觉|草木气|草、叶、木与植物的气味联想；图像不能证明实际气味|草木味
嗅觉|烟火气|炊烟或烹饪的气味联想；不同于烟火味页面的生活体验|炊烟气
嗅觉|陈旧气|旧物、久置环境的气味联想；不等于年代标签|旧物气
味觉|甜|甜味联想；不直接推断甜美性格|甜滋滋
味觉|苦|苦味联想；不等于痛苦|苦涩味
味觉|酸|酸味联想；不等于嫉妒|酸味
情绪|神秘|有线索未明说、仍想知道的感受|神秘感、猜不透
情绪|不安|不确定或预期风险的感受；不作临床判断|惴惴不安
情绪|安心|暂时没有威胁或催迫的感受|踏实、安稳
情绪|温柔|被轻轻对待或对事物保有怜惜的感受|温和
情绪|疏离|与他人或环境隔着距离的关系感|有距离感
情绪|孤单|缺少连结的主观体验；独处不等于孤单|孤独
情绪|脆弱|难以承受或易受损的感受；不作为身份结论|易碎感
情绪|兴奋|活跃、激动的情绪体验；不写神经递质解释|激动
情绪|压抑|受阻、被挤压或难以舒展的感受|憋闷、阴沉
情绪|怀念|面向过去的留恋；不等于物件年代|怀旧
情绪|遗憾|未实现、错过或未完成的感受|可惜
情绪|渴望|想得到、想靠近的主观趋向|想靠近、向往
情绪|犹疑|想前进又不能确定的体验|犹豫
情绪|低能量|暂时缺少行动劲头的体验；不等于疾病或忧郁|没劲、提不起劲
情绪|松弛|不必持续戒备或用力的感受|松、放松
情绪|紧绷|持续警觉、用力或拉紧的感受|紧
情绪|庄严|郑重、敬畏而不轻慢的感受|庄重
情绪|天真|尚未被算计或过度防备覆盖的感受|天真感
情绪|忧郁|持续低回、带失落的体验；不等于临床抑郁|惆怅
情绪|叛逆|不愿服从已有规范的态度体验|不服
情绪|自由|能活动、能选择、不受拘束的体验|自在
情绪|坚定|有所坚持、不轻易松动的体验|笃定
情绪|亲密|关系靠近、有连结的体验|亲近
情绪|冷静|情绪强度较低且能保持分寸的感受|镇定
情绪|荒诞|事物关系难以照常解释、常带滑稽的感受|荒唐感
情绪|决绝|明确切断、离开、不回头的态度体验|不回头
情绪|无力|想做却感到难以改变的体验；与低能量区分|无能为力
情绪|期待|朝向尚未发生之事的等待感|盼望
情绪|眷恋|舍不得离开或放下的关系感|留恋
情绪|释然|原有牵绊松开一点的体验|放下
情绪|克制|有所保留、没有全部外露的体验|收着、含蓄
情绪|顽皮|轻微越界、玩笑和游戏的感受|淘气、好玩
情绪|大胆|愿意显露、冒一点险的态度体验|张扬
情绪|悲壮|明知代价仍坚持的叙事感受|悲壮感
情绪|清醒|不被美化说辞完全带走的主观体验|清醒感
情绪|倔强|受阻后仍不愿完全退让的态度体验|不认输
情绪|日常感|熟悉、反复、普通生活正在继续的感受|日常
情绪|缓慢|主观节奏放缓的感受；不等于静图或低能量|慢
情绪|豪迈|胸怀舒展、愿向远处的情绪体验|豪放
情绪|丰盛|充足、饱满、接近溢出的主观感受|丰沛
情绪|虚幻|像梦或不完全真实的体验|梦幻、梦感
情绪|自信|愿意占据自己的位置、不过度退让的体验|有底气'''

vocabulary = []
for line in lexicon_text.splitlines():
    sub, name, boundary, aliases = line.split('|')
    category = '情绪' if sub == '情绪' else '五感'
    prefix = 'E' if category == '情绪' else 'S'
    number = sum(x['category'] == category for x in vocabulary) + 1
    vocabulary.append(dict(id=f'{prefix}{number:02}', name=name, category=category,
                           subcategory=sub, boundary=boundary, aliases=aliases.split('、'),
                           status='待用户审定', usableForImageObservation=sub == '视觉'))
by_name = {x['name']: x for x in vocabulary}

# All 40 original entries receive an explicit disposition. Splits are manual, never auto-summed.
legacy_special = {
 '深沉':('拆分候选',['克制','沉重'],'关系表达与重量联想分开，逐图重标'),
 '强势':('保留为描述元数据',[],'控制/支配含义不能偷换为大胆或自信'),
 '危险':('拆分候选',['不安','大胆'],'受威胁与主动冒险不同，逐条审定'),
 '干净':('保留为描述元数据',[],'清洁、简洁、整齐并非同义，后续按实际内容重标'),
 '高级':('退出感觉计分',[],'价值评价，不是可共享的感觉维度'),
 '热闹':('拆分候选',['喧闹','兴奋'],'声音与情绪分开，不能从人多直接断定兴奋'),
 '有年代感':('保留为描述元数据',[],'年代是作品元数据，怀念是体验，不直接等同'),
 '震撼':('拆分候选',['庄严','不安','兴奋'],'须按作品重标，不能一词自动触发三个分数'),
 '浮夸':('保留为描述元数据',[],'可能是程度或贬义评价，不能自动当作大胆'),
 '不装':('保留为描述元数据',[],'读者价值判断，不直接等同某种风格'),
 '野':('拆分候选',['自由','叛逆'],'自然感与不服从不同，逐条审定'),
 '稳':('拆分候选',['安心','坚定'],'被安顿与主动坚持不同'),
 '疯':('退出感觉计分',[],'含义混杂且易把精神状态作标签，按具体作品重标'),
 '傲':('保留为描述元数据',[],'自信、疏离、轻蔑不能合并'),
 '想逃':('保留为关系描述',[],'退避对象须有明确选择，不能由未选图片推定'),
 '有故事感':('保留为描述元数据',[],'叙事印象，不是单一感觉'),
 '东方':('保留为文化元数据',[],'文化范围不是情绪或五感'),
 '西式古典':('保留为文化元数据',[],'地域/历史范围不是情绪或五感'),
 '未来感':('保留为题材元数据',[],'时代想象不是情绪或五感'),
}
alias_lookup = {alias: v['name'] for v in vocabulary for alias in v['aliases']}
legacy = []
for f in features['feelings']:
    name = f['name']
    if name in legacy_special:
        action, target, note = legacy_special[name]
    else:
        target = [name if name in by_name else alias_lookup[name]]
        action = '保留规范词' if name == target[0] else '归并别名'
        note = '原记录保留；只在审核后的新索引使用规范ID'
    legacy.append(dict(sourceId=f['id'], sourceName=name, action=action,
                       targetIds=[by_name[n]['id'] for n in target], targetNames=target, note=note))

rows = []
for line in (HERE / 'candidates.txt').read_text().splitlines():
    if not line or line.startswith('#'):
        continue
    ordinal, page_type, plain, tag_text, note = line.split('|')
    term = terms[int(ordinal)-1]
    tags = []
    for item in tag_text.split():
        name, weight = item.split(':')
        tags.append(dict(tagId=by_name[name]['id'], name=name, degree=int(weight)))
    source_cases = [dict(id=cases[c]['id'], title=cases[c]['name'], medium=cases[c]['medium'],
                         official=cases[c]['official']) for c in term['caseIds'] if c in cases]
    rows.append(dict(row=ordinal, termId=term['id'], originalName=term['name'],
                     englishOriginal=term['english'], originalChapters=term['chapterNames'],
                     pageType=page_type, plainName=plain, tags=tags, reviewNote=note,
                     typeReason='感受可跨多个视觉集合出现，作为横向入口' if page_type=='mood' else '具名视觉/文化/题材集合；内部边界见审阅备注',
                     nameApproval='待签', typeApproval='待审', tagApproval='待审',
                     evidence=dict(termSnapshot=f'aesthetic-site/src/catalog.json#{term["id"]}',
                                   hasCore=bool(term.get('core')), cases=source_cases,
                                   verification='仅仓库记录，未逐条外部核验；不构成心理结论的证据')))

edges = [dict(termId=r['termId'], row=r['row'], style=r['originalName'], **t,
              status='编辑关联候选，待逐作品核验') for r in rows if r['pageType']=='style' for t in r['tags']]
metadata = dict(status='阶段0交付候选；闸门0未通过', sourceCommit='f6025a528b865450356685dc43c9ee83c250f3a1',
                sourceHashes={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [CATALOG, FEATURES]},
                vocabularyVersion='stage0-draft-1', total=101, counts=dict(Counter(r['pageType'] for r in rows)),
                signedNames=0, currentStage=0, nextStageAllowed=False,
                interpretation='degree是编辑关联强弱，不是用户心理分数、流派定义或统计测量')
data = dict(metadata=metadata, entries=rows, vocabulary=vocabulary, legacyFeelingMap=legacy, styleTagEdges=edges)
(HERE/'proposal.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

def table(headers, values):
    def esc(x): return str(x).replace('|','／').replace('\n',' ')
    return '| '+' | '.join(headers)+' |\n| '+' | '.join('---' for _ in headers)+' |\n'+''.join('| '+' | '.join(esc(v) for v in row)+' |\n' for row in values)
def save(name, text): (HERE/name).write_text(text)

save('01-routing.md', '# 0.1｜101条感觉/风格分流候选\n\n'
     '状态：全部待用户审定。这里只判页面类型，不是新版路由规划已完成。原始101个ID完整保留，不改站点或飞书。\n\n'
     f"本稿：{metadata['counts']['mood']}条 mood，{metadata['counts']['style']}条 style。数量由条目性质决定，不为了30条批次的10/20比例倒推。\n\n"
     '`mood`承接可以跨风格出现的体验；`style`承接具名视觉集合。工艺、题材、文化传统被暂放style的条目有单独备注，不因此变成公认艺术流派。\n\n'
     '忧郁是原章节，不是101词条之一；迁为标签的对应关系另见[0.4](04-tag-style-map.md)。低能量保留原词条ID，改作mood页面，同时使用同一概念的横向标签；它不是style树节点。\n\n'
     +table(['编号','原词条','页面类型候选','判定依据/需审点','状态'],[[r['row'],r['originalName'],r['pageType'],r['reviewNote'],'待审'] for r in rows])
     +'\n完整原ID、章节和案例指针见[proposal.json](proposal.json)。[签名表](02-names.md)。\n')
save('02-names.md','# 0.2｜101个白话姿态名·逐条签审\n\n'
     '状态：0/101已签。以下全部是候选，不进入导航、商品图或页面标题。编号与分流表一致。\n\n'
     '“学术名”列采用现有原词条名：其中不少是流行名、题材或工艺，不虚称全部具有学术地位。英文逐字保留现有值；日杂/Zakka等疑点留待核实。白话名是导航识别用的姿态表达，不是对读者的人格判断。\n\n'
     '审阅可直接回复“001通过；002改成……”。每次确认记录原话及对应编号。批量同意必须明确列范围，沉默不算签名。\n\n'
     +table(['编号','类型','白话姿态名候选','原词条名（学术/风格/感觉名）','现有英文名','签审'],[[r['row'],r['pageType'],r['plainName'],r['originalName'],r['englishOriginal'],r['nameApproval']] for r in rows])
     +'\n“低能量/颓废美学”是用户指定的样板对象；它们的白话名仍须签审，并未随对象选择自动通过。\n')
save('03-vocabulary.md','# 0.3｜受控感觉词表候选\n\n'
     f"共{len(vocabulary)}词：五感{sum(x['category']=='五感' for x in vocabulary)}、情绪/心理感受{sum(x['category']=='情绪' for x in vocabulary)}。版本stage0-draft-1，尚未冻结。\n\n"
     '词条配方、选图打标、mood页、结果页共用同一tagId。页面白话名可以改，ID不可随文案漂移。情绪类包含关系、节奏和态度体验，不是假定所有词都是基本情绪。\n\n'
     '例如“微凉”是温度联想，“清冷”是mood页的复合体验，候选关联为微凉＋疏离＋克制；两者不能简单互当别名。声音/温度/气味/味道从图片获得时必须标“联想”；它们不是图片已经证明的事实。\n\n'
     +table(['ID','大类','分组','规范词','可归并别名','边界'],[[v['id'],v['category'],v['subcategory'],v['name'],'、'.join(v['aliases']),v['boundary']] for v in vocabulary])
     +'\n## 旧40词逐条去向\n\n原记录不删除。拆分候选须逐条重标，禁止把多个候选自动同时计分。文化/时代/价值标签留在元数据中，不混进感觉重叠度。\n\n'
     +table(['原词','处置候选','目标规范词','理由/边界'],[[l['sourceName'],l['action'],'、'.join(l['targetNames']) or '不进入计分',l['note']] for l in legacy])
     +'\n嗅觉、味觉、听觉的覆盖目前偏弱。保留词表维度并不表示407张图已能覆盖；覆盖缺口由阶段4选图检查处理。未被选中的标签也不能直接当作用户厌恶的事实。\n')

chapter = next(c for c in catalog['chapters'] if c['name']=='忧郁')
by_tag = {v['id']:[e for e in edges if e['tagId']==v['id']] for v in vocabulary}
save('04-tag-style-map.md','# 0.4｜标签与风格归属候选\n\n'
     '这是编辑关联表，不是心理测量。3=本条主导候选，2=明显关联候选，1=局部/弱关联候选，未列出=尚未标记，绝不等于排斥。全部待用户审定及逐作品核验。\n\n'
     f"忧郁：原章节ID `{chapter['id']}` → 标签 `{by_name['忧郁']['id']}`。原章节及链接保留到阶段5迁移，不立即删除。\n\n"
     f"低能量：原词条ID `reczz28HJJL2GK3M` → mood页身份＋标签 `{by_name['低能量']['id']}`，同一概念的两种入口，不保留为风格树同级节点。其他mood也采用“横向感觉＋对应页面”的组织方式；最终URL与迁移方案在阶段5重新制定。\n\n"
     '本表挂到风格的目标只有style候选，不把mood互挂当成风格。证据列只是现有作品记录及出处索引；有出处不等于关联已获证明，没有案例的行不得直接进入正文。\n\n'
     '## 按标签看风格\n\n'
     +table(['ID','规范词','风格候选与程度'],[[v['id'],v['name'],'；'.join(f"{e['row']} {e['style']}({e['degree']})" for e in by_tag[v['id']]) or '暂未关联；不是应删词或用户不喜欢' ] for v in vocabulary])
     +'\n## 按风格核对及证据入口\n\n'
     +table(['编号','风格候选','标签与程度','现有作品/出处记录','核验状态'],[[r['row'],r['originalName'],'、'.join(f"{t['name']}({t['degree']})" for t in r['tags']),
          '；'.join(f"[{c['title']}]({c['official']})" if c['official'].startswith('http') else c['title']+'（缺出处链接）' for c in r['evidence']['cases']) or '暂无案例；仅命名/编辑判断候选',
          '待逐作品核验'] for r in rows if r['pageType']=='style'])
     +'\n感觉页的标签组合、原始作品ID、出处原值见[proposal.json](proposal.json)。本轮没有写心理解读正文，也没有把编辑关联强弱当成用户选择计分公式。\n')

save('README.md','# 阶段0｜锁定上游·待签审\n\n'
     '按用户2026-11-08最新分阶段要求执行。本轮只提交决定候选，不写页面正文，不进入阶段1。\n\n'
     +table(['交付','规模','状态'],[
       ['[0.1 感觉/风格分流](01-routing.md)',f"101条：{metadata['counts']['mood']} mood / {metadata['counts']['style']} style",'全部待审'],
       ['[0.2 白话姿态名](02-names.md)','101个，保留原名与英文','0/101签审'],
       ['[0.3 受控感觉词表](03-vocabulary.md)',f'{len(vocabulary)}规范词＋旧40词完整去向','待审，未冻结'],
       ['[0.4 标签×风格](04-tag-style-map.md)',f'{len(edges)}条关联候选','关联程度待审，作品支持待核验']])
     +'\n入口优先看白话名，按编号逐条确认；分流争议与词表也须在阶段0收口。任何助手不得替用户把待签改成通过。\n\n'
     '特别需审：002阈限空间、003诡异人偶、029涂鸦、047拓印、049 Riso、051水墨等涉及空间母题/对象/媒介；052武侠等涉及题材。为了完成二分表暂放style，不宣称它们同属独立流派。047现有蓝晒案例不能证明拓印工艺。011日杂英文Zakka、008 Softcore、087哥特、089科幻视觉、101 odd范围须后续核验。\n\n'
     '数据来源是仓库快照101词条、40感觉入口；未实时读取飞书。本目录是独立候选层，网站仍读原catalog/features。原始ID、英文、章节、案例指针及源文件SHA256见[proposal.json](proposal.json)。\n\n'
     '可重建：`python product-work/2026-11-08-stage-0/build.py`；可核验：`python product-work/2026-11-08-stage-0/validate.py`。机器检查只证明数量、关联和保护边界，不替代用户对名称与观点的判断。\n\n'
     '[当前阶段任务表](../../执行任务/2026-11-08-产品改版任务表.md)｜[旧样稿与路线的作废说明](../2026-11-08/STATUS.md)。\n')
print(json.dumps(dict(metadata=metadata, vocabulary=len(vocabulary), edges=len(edges)),ensure_ascii=False))
