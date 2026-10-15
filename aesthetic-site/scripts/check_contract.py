#!/usr/bin/env python3
"""Fail the build when Feishu exports and the site's data contract diverge."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
contract = json.loads((ROOT / 'data/contract.json').read_text())
source = ROOT / 'data/source'
errors = []

for name, table in contract['tables'].items():
    manifest_path = source / f'{name}.manifest.json'
    rows_path = source / f'{name}.ndjson'
    if not manifest_path.exists() or not rows_path.exists():
        errors.append(f'{name}: 缺少 CLI 导出文件')
        continue
    manifest = json.loads(manifest_path.read_text())
    if manifest.get('base_token') != contract['base_token'] or manifest.get('table_id') != table['id']:
        errors.append(f'{name}: Base 或数据表 ID 与契约不一致')
    columns = manifest.get('columns', {})
    for field, expected_type in table['fields'].items():
        actual_type = columns.get(field, {}).get('field_type')
        if actual_type != expected_type:
            errors.append(f'{name}.{field}: 需要 {expected_type}，实际 {actual_type or "缺失"}')

imagery_path = source / 'imagery.ndjson'
if imagery_path.exists():
    imagery = [json.loads(line) for line in imagery_path.read_text().splitlines() if line.strip()]
    available = [r for r in imagery if '可用' in (r.get('状态') or [])]
    seen = set()
    modes = {'相遇', '抽离', '替换'}
    for row in available:
        rid = row.get('record_id', '?')
        mode = (row.get('运算类型') or [''])[0]
        key = (mode, row.get('意象 A'), row.get('意象 B'))
        if key in seen:
            errors.append(f'意象实验室：重复命题 {key}')
        seen.add(key)
        if mode not in modes:
            errors.append(f'{rid}: 运算类型无效')
        for field in ('题目', '主题', '意象 A', '意象 B', '提示语'):
            if not str(row.get(field) or '').strip():
                errors.append(f'{rid}: 缺少 {field}')
        if not str(row.get('提示语') or '').rstrip().endswith(('？', '?')):
            errors.append(f'{rid}: 提示语应是开放式追问')
    if len(available) < 36 or {r['运算类型'][0] for r in available} != modes:
        errors.append('意象实验室：题库数量或三种运算不完整')

if errors:
    raise SystemExit('数据契约检查失败：\n- ' + '\n- '.join(errors))
print(f'数据契约通过：{len(contract["tables"])} 张表；意象实验室 {len(available)} 道可用题。')
