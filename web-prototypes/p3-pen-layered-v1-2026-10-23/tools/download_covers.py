"""Read-only attachment download. Never writes to Feishu. Always names the profile."""
import concurrent.futures, hashlib, json, os, pathlib, subprocess
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
CLI = os.environ['LARK_CLI']
BASE = 'IGctbcuwPaE6hMsmAoicJddpn3U'
TABLE = 'tblaYsGqDwNudnXs'
rows = sorted([json.loads(s) for s in (ROOT/'data/chapters.ndjson').read_text().splitlines()], key=lambda r:r['序号'])
def download(row):
    attachment = row['封面图'][0]
    ext = pathlib.Path(attachment['name']).suffix.lower()
    local = f"assets/covers/{int(row['序号']):02d}{ext}"
    target = ROOT/'dist'/local
    if not target.exists():
        result = subprocess.run([CLI, '--profile', 'aesthetic-feishu', 'base', '+record-download-attachment', '--as', 'user', '--base-token', BASE, '--table-id', TABLE, '--record-id', row['record_id'], '--file-token', attachment['file_token'], '--output', f'dist/{local}'], cwd=ROOT, capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError(f"{row['章节名']}: {result.stderr[:400]}")
    raw = target.read_bytes()
    if len(raw) != attachment['size']:
        raise RuntimeError(f"Attachment size mismatch: {row['章节名']}")
    with Image.open(target) as im:
        dimensions = list(im.size)
    return {'id':row['record_id'], 'order':row['序号'], 'name':row['章节名'], 'english':row['英文名'], 'definition':row['一句定义'], 'credit':row['封面图注'], 'cover':local, 'originalFilename':attachment['name'], 'bytes':len(raw), 'sha256':hashlib.sha256(raw).hexdigest(), 'dimensions':dimensions}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    topics = list(pool.map(download, rows))
manifest = json.loads((ROOT/'data/chapters.manifest.json').read_text())
payload = {'source':{'base':BASE, 'table':TABLE, 'tableName':'章节', 'profile':'aesthetic-feishu', 'revision':manifest['rev'], 'complete':not manifest['has_more'], 'count':len(topics), 'readOnly':True}, 'topics':topics}
(ROOT/'dist/assets/topics.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2))
(ROOT/'dist/assets/topics.js').write_text('window.FEISHU_TOPICS = '+json.dumps(payload, ensure_ascii=False)+';\n')
print(json.dumps({'count':len(topics), 'revision':manifest['rev'], 'originalBytesVerified':True}, ensure_ascii=False))
