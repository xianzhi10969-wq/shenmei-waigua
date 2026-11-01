#!/usr/bin/env python3
"""只读：从飞书「章节」表同步 P3 的 24 章到 assets/topics.{json,js} 与 covers/。

不写入飞书。Netlify 是静态托管，浏览器不持有飞书凭据；
本脚本在发布前构建时拉取，改飞书后需重跑再部署。

用法（在仓库根或本目录均可）：
  python3 web-prototypes/p1-p3-continuous-2026-10-31/scripts/sync_p3_from_lark.py
  python3 .../sync_p3_from_lark.py --mirror-deploy

依赖：lark-cli 已 login（--as user），默认 /home/box/.local/bin/lark-cli，
可用环境变量 LARK_CLI 覆盖。禁止使用已不存在的 --profile aesthetic-feishu。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]  # repo root
PROTO = Path(__file__).resolve().parents[1]
ASSETS = PROTO / "assets"
COVERS = ASSETS / "covers"
CACHE = PROTO / "scripts" / ".cache"
DEPLOY_ASSETS = ROOT / "deploy" / "netlify-p1p3-continuous-2026-10-31" / "assets"

BASE = "IGctbcuwPaE6hMsmAoicJddpn3U"
TABLE = "tblaYsGqDwNudnXs"
TABLE_NAME = "章节"

CLI = os.environ.get("LARK_CLI") or (
    shutil.which("lark-cli") or "/home/box/.local/bin/lark-cli"
)
ENV = os.environ.copy()
ENV["LARKSUITE_CLI_NO_UPDATE_NOTIFIER"] = "1"
ENV["LARKSUITE_CLI_NO_SKILLS_NOTIFIER"] = "1"


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(code)


def run_cli(args: list[str], *, capture: bool = True) -> subprocess.CompletedProcess:
    cmd = [CLI, "base", *args, "--as", "user"]
    return subprocess.run(
        cmd,
        env=ENV,
        check=False,
        capture_output=capture,
        text=True,
    )


def cli_json(args: list[str]) -> dict:
    r = run_cli([*args, "--format", "json"])
    if r.returncode != 0:
        die(f"lark-cli 失败 ({r.returncode}): {r.stderr or r.stdout}")
    try:
        data = json.loads(r.stdout)
    except json.JSONDecodeError as e:
        die(f"lark-cli 输出不是 JSON: {e}\n{r.stdout[:500]}")
    if not data.get("ok", True):
        die(f"lark-cli 返回错误: {json.dumps(data, ensure_ascii=False)[:800]}")
    return data


def table_revision() -> int:
    data = cli_json(["+table-list", "--base-token", BASE])
    tables = data.get("data", {}).get("tables") or data.get("tables") or []
    for t in tables:
        if t.get("id") == TABLE:
            return int(t["rev"])
    die(f"table-list 未找到 {TABLE}")


def fetch_records(ndjson_path: Path) -> list[dict]:
    ndjson_path.parent.mkdir(parents=True, exist_ok=True)
    if ndjson_path.exists():
        ndjson_path.unlink()
    manifest = ndjson_path.with_suffix(".manifest.json")
    # lark-cli may write sibling .manifest.json with stem of --output
    for p in ndjson_path.parent.glob(ndjson_path.stem + "*"):
        if p.suffix in {".json", ".ndjson"} or ".manifest" in p.name:
            try:
                p.unlink()
            except OSError:
                pass
    r = run_cli(
        [
            "+record-list",
            "--base-token",
            BASE,
            "--table-id",
            TABLE,
            "--format",
            "ndjson",
            "--output",
            str(ndjson_path),
            "--overwrite",
            "--sort-json",
            '[{"field":"序号","desc":false}]',
            "--limit",
            "200",
        ]
    )
    if r.returncode != 0:
        die(f"record-list 失败: {r.stderr or r.stdout}")
    if not ndjson_path.exists():
        # some cli versions write relative to cwd
        alt = Path.cwd() / ndjson_path.name
        if alt.exists():
            shutil.move(str(alt), str(ndjson_path))
        else:
            die(f"未生成 ndjson: {ndjson_path}")
    rows = [json.loads(line) for line in ndjson_path.read_text().splitlines() if line.strip()]
    return rows


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def image_dims(path: Path) -> list[int] | None:
    try:
        from PIL import Image

        with Image.open(path) as im:
            return [int(im.width), int(im.height)]
    except Exception:
        return None


def load_cover_map() -> dict:
    CACHE.mkdir(parents=True, exist_ok=True)
    p = CACHE / "cover-map.json"
    if p.exists():
        return json.loads(p.read_text())
    # seed from existing topics.json if present
    topics_path = ASSETS / "topics.json"
    media: dict = {}
    if topics_path.exists():
        old = json.loads(topics_path.read_text())
        for t in old.get("topics") or []:
            token = t.get("fileToken") or t.get("file_token")
            # old snapshot may not store token; use sha+path as weak key later
            if token:
                media[token] = {
                    "path": t.get("cover"),
                    "sha256": t.get("sha256"),
                    "name": t.get("originalFilename"),
                    "record_id": t.get("id"),
                }
    return media


def save_cover_map(media: dict) -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    (CACHE / "cover-map.json").write_text(
        json.dumps(media, ensure_ascii=False, indent=2) + "\n"
    )


def download_attachment(record_id: str, file_token: str, dest_dir: Path) -> dict:
    dest_dir.mkdir(parents=True, exist_ok=True)
    # clear previous files for this download dir
    for old in dest_dir.iterdir():
        if old.is_file():
            old.unlink()
    data = cli_json(
        [
            "+record-download-attachment",
            "--base-token",
            BASE,
            "--table-id",
            TABLE,
            "--record-id",
            record_id,
            "--file-token",
            file_token,
            "--output",
            str(dest_dir) + "/",
            "--overwrite",
        ]
    )
    downloaded = (data.get("data") or {}).get("downloaded") or []
    if not downloaded:
        die(f"附件下载为空: {record_id} {file_token}")
    item = downloaded[0]
    saved = Path(item["saved_path"])
    if not saved.exists():
        die(f"下载路径不存在: {saved}")
    return item


def ext_of(name: str) -> str:
    suf = Path(name).suffix.lower()
    return suf if suf else ".jpg"


def sync(mirror_deploy: bool) -> dict:
    if not Path(CLI).exists() and not shutil.which(CLI):
        die(f"找不到 lark-cli: {CLI}")
    ASSETS.mkdir(parents=True, exist_ok=True)
    COVERS.mkdir(parents=True, exist_ok=True)

    rev = table_revision()
    print(f"章节表 rev={rev}", flush=True)

    ndjson_path = CACHE / "chapters.ndjson"
    rows = fetch_records(ndjson_path)
    print(f"拉取记录 {len(rows)} 条", flush=True)
    if len(rows) != 24:
        die(f"期望 24 章，实际 {len(rows)}")

    # sort / validate 序号
    for r in rows:
        if r.get("序号") is None:
            die(f"缺序号: {r.get('record_id')} {r.get('章节名')}")
    rows.sort(key=lambda r: int(r["序号"]))
    orders = [int(r["序号"]) for r in rows]
    if orders != list(range(1, 25)):
        die(f"序号不是 1..24: {orders}")

    media = load_cover_map()
    topics = []
    downloaded = 0
    skipped = 0

    with tempfile.TemporaryDirectory(prefix="p3-lark-") as tmp:
        tmp_root = Path(tmp)
        for r in rows:
            order = int(r["序号"])
            record_id = r["record_id"]
            atts = r.get("封面图") or []
            if not atts:
                die(f"第 {order} 章无封面图: {r.get('章节名')}")
            att = atts[0]
            file_token = att["file_token"]
            original_name = att.get("name") or f"{order}.jpg"
            ext = ext_of(original_name)
            rel_cover = f"assets/covers/{order:02d}{ext}"
            abs_cover = PROTO / rel_cover

            reuse = False
            cached = media.get(file_token)
            if abs_cover.exists():
                local_sha = sha256_file(abs_cover)
                if cached and cached.get("sha256") == local_sha and cached.get("path") == rel_cover:
                    reuse = True
                elif not cached:
                    # 同路径文件已在，仍核一次：若飞书 size 一致且本地 sha 已有于旧 topics，可跳过下载
                    old_topics = ASSETS / "topics.json"
                    if old_topics.exists():
                        prev = {
                            t["id"]: t
                            for t in json.loads(old_topics.read_text()).get("topics") or []
                        }
                        p = prev.get(record_id)
                        if (
                            p
                            and p.get("sha256") == local_sha
                            and p.get("cover") == rel_cover
                            and p.get("bytes") == att.get("size")
                        ):
                            reuse = True
                            media[file_token] = {
                                "path": rel_cover,
                                "sha256": local_sha,
                                "name": original_name,
                                "record_id": record_id,
                            }

            if reuse:
                skipped += 1
                sha = media[file_token]["sha256"] if file_token in media else sha256_file(abs_cover)
                if file_token not in media:
                    media[file_token] = {
                        "path": rel_cover,
                        "sha256": sha,
                        "name": original_name,
                        "record_id": record_id,
                    }
            else:
                # 若目标扩展名变了，清掉同序号旧文件
                for stale in COVERS.glob(f"{order:02d}.*"):
                    if stale.name != abs_cover.name:
                        stale.unlink()
                item = download_attachment(record_id, file_token, tmp_root / record_id)
                src = Path(item["saved_path"])
                abs_cover.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(src, abs_cover)
                sha = sha256_file(abs_cover)
                media[file_token] = {
                    "path": rel_cover,
                    "sha256": sha,
                    "name": original_name,
                    "record_id": record_id,
                }
                downloaded += 1

            dims = image_dims(abs_cover)
            topic = {
                "id": record_id,
                "order": order,
                "name": r.get("章节名") or "",
                "english": r.get("英文名") or "",
                "definition": r.get("一句定义") or "",
                "credit": r.get("封面图注") or "",
                "cover": rel_cover,
                "originalFilename": original_name,
                "bytes": abs_cover.stat().st_size,
                "sha256": media[file_token]["sha256"],
                "fileToken": file_token,
            }
            if dims:
                topic["dimensions"] = dims
            topics.append(topic)

    save_cover_map(media)

    payload = {
        "source": {
            "base": BASE,
            "table": TABLE,
            "tableName": TABLE_NAME,
            "auth": "lark-cli --as user",
            "revision": rev,
            "complete": True,
            "count": len(topics),
            "readOnly": True,
            "syncedAt": __import__("datetime").datetime.now(
                __import__("datetime").timezone.utc
            )
            .astimezone()
            .isoformat(timespec="seconds"),
            "syncScript": "web-prototypes/p1-p3-continuous-2026-10-31/scripts/sync_p3_from_lark.py",
        },
        "topics": topics,
    }

    topics_json = ASSETS / "topics.json"
    topics_js = ASSETS / "topics.js"
    topics_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    topics_js.write_text(
        "window.FEISHU_TOPICS = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n"
    )
    print(
        f"已写 {topics_json.relative_to(ROOT)} 与 topics.js；封面下载 {downloaded}，跳过 {skipped}",
        flush=True,
    )

    if mirror_deploy:
        if not DEPLOY_ASSETS.exists():
            die(f"部署目录不存在: {DEPLOY_ASSETS}")
        # 只同步 P3 数据文件与 covers，不动 P1/P2
        for name in ("topics.json", "topics.js"):
            shutil.copy2(ASSETS / name, DEPLOY_ASSETS / name)
        deploy_covers = DEPLOY_ASSETS / "covers"
        deploy_covers.mkdir(parents=True, exist_ok=True)
        # 清掉部署侧多余序号文件，再复制
        keep = {Path(t["cover"]).name for t in topics}
        for stale in deploy_covers.glob("*"):
            if stale.is_file() and stale.name not in keep:
                stale.unlink()
        for t in topics:
            src = PROTO / t["cover"]
            dst = deploy_covers / Path(t["cover"]).name
            shutil.copy2(src, dst)
        print(f"已镜像到 {DEPLOY_ASSETS.relative_to(ROOT)}", flush=True)

    return payload


def main() -> None:
    ap = argparse.ArgumentParser(description="只读同步飞书章节表到 P3 assets")
    ap.add_argument(
        "--mirror-deploy",
        action="store_true",
        help="同步后把 topics.* 与 covers/ 复制到 deploy/netlify-p1p3-continuous-2026-10-31/assets/",
    )
    args = ap.parse_args()
    sync(mirror_deploy=args.mirror_deploy)


if __name__ == "__main__":
    main()
