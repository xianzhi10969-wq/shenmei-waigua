#!/usr/bin/env python3
"""Read the Feishu Base with the named local Profile, then build the static Site."""
import asyncio
import glob
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data' / 'source'
CACHE = ROOT / 'data' / '.cache'
SOURCE.mkdir(parents=True, exist_ok=True)
CACHE.mkdir(parents=True, exist_ok=True)
CONTRACT = json.loads((ROOT / 'data' / 'contract.json').read_text())
BASE = CONTRACT['base_token']
TABLES = {name: (item['id'], item['attachment']) for name, item in CONTRACT['tables'].items()}


def find_cli():
    if os.environ.get('LARK_CLI'):
        return os.environ['LARK_CLI']
    cli = shutil.which('lark-cli')
    if cli:
        return cli
    matches = glob.glob(str(Path.home() / '.codex/.chatgpt-projects/*/.tools/lark-cli/node_modules/.bin/lark-cli'))
    if matches:
        return matches[0]
    raise SystemExit('找不到 lark-cli；请设置 LARK_CLI 为它的绝对路径。')


CLI = find_cli()
ENV = os.environ.copy()
node_bin = Path.home() / '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin'
if node_bin.exists():
    ENV['PATH'] = str(node_bin) + os.pathsep + ENV.get('PATH', '')
ENV['LARKSUITE_CLI_NO_UPDATE_NOTIFIER'] = '1'
ENV['LARKSUITE_CLI_NO_SKILLS_NOTIFIER'] = '1'


def cli_args(*args):
    return [CLI, '--profile', CONTRACT['profile'], *args]


def read_records():
    for name, (table_id, _) in TABLES.items():
        output = SOURCE / f'{name}.ndjson'
        args = cli_args('base', '+record-list', '--base-token', BASE,
                        '--table-id', table_id, '--as', 'user', '--format', 'ndjson',
                        '--output', str(output.relative_to(ROOT)), '--overwrite')
        subprocess.run(args, cwd=ROOT, env=ENV, check=True, stdout=subprocess.DEVNULL)
        print(f'读取 {name}', flush=True)


def load(name):
    return [json.loads(line) for line in (SOURCE / f'{name}.ndjson').open()]


async def download_new():
    old_map_path = CACHE / 'media-map.json'
    media = json.loads(old_map_path.read_text()) if old_map_path.exists() else {}
    jobs = []
    for name, (table_id, field) in TABLES.items():
        if not field:
            continue
        for row in load(name):
            if name == 'terms' and '已上线' not in (row.get('状态') or []):
                continue
            if name == 'cases' and not row.get('是否保留'):
                continue
            missing = [item['file_token'] for item in row.get(field) or []
                       if not (ROOT / 'dist' / 'media' / f"{item['file_token']}.webp").exists()]
            if missing:
                jobs.append((table_id, row['record_id'], missing))
    sem = asyncio.Semaphore(5)
    errors = []

    async def one(table_id, record_id, tokens):
        output = CACHE / 'assets' / record_id
        output.mkdir(parents=True, exist_ok=True)
        args = cli_args('base', '+record-download-attachment', '--base-token', BASE,
                        '--table-id', table_id, '--record-id', record_id, '--as', 'user',
                        '--output', str(output.relative_to(ROOT)), '--overwrite')
        for token in tokens:
            args += ['--file-token', token]
        async with sem:
            proc = await asyncio.create_subprocess_exec(*args, cwd=ROOT, env=ENV,
                                                         stdout=asyncio.subprocess.PIPE,
                                                         stderr=asyncio.subprocess.PIPE)
            stdout, stderr = await proc.communicate()
            if proc.returncode:
                errors.append((record_id, stderr.decode()[:300]))
                return
            for item in json.loads(stdout)['data']['downloaded']:
                path = Path(item['saved_path'])
                media[item['file_token']] = {'path': str(path.relative_to(CACHE)),
                                             'name': item['name'], 'record_id': record_id}

    await asyncio.gather(*(one(*job) for job in jobs))
    old_map_path.write_text(json.dumps(media, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(f'{len(errors)} 个附件下载失败：{errors[:3]}')
    print(f'已核对图片：新增下载 {len(jobs)} 条记录', flush=True)


def main():
    read_records()
    subprocess.run([sys.executable, str(ROOT / 'scripts' / 'check_contract.py')], check=True)
    asyncio.run(download_new())
    subprocess.run([sys.executable, str(ROOT / 'scripts' / 'build_data.py')], check=True)


if __name__ == '__main__':
    main()
