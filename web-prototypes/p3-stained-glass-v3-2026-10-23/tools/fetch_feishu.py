"""只读：从飞书多维表格「审美外挂」读取 P3 五个专题（章节表）并下载封面原图。
用法：python3 tools/fetch_feishu.py   需要 lark-cli 已登录（base:*:read）。不写入飞书任何东西。"""
import json, os, shutil, subprocess, glob
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L=os.environ.get("LARK_CLI","/home/box/.local/bin/lark-cli")
BASE="IGctbcuwPaE6hMsmAoicJddpn3U"; TABLE="tblaYsGqDwNudnXs"   # 审美外挂 / 章节
WANT=["留白","忧郁","爱欲","田园","幽玄"]                         # 与 Figma 439:2 彩窗试排一致的五个专题（顺序同 Figma）
SLUG={"留白":"liubai","忧郁":"melancholy","爱欲":"eros","田园":"arcadia","幽玄":"yugen"}
KEEP=["章节名","英文名","章名展示","序号","状态","一句定义","钩子","封面图注"]
def cli(*a):
    r=subprocess.run([L,"base",*a,"--as","user","--base-token",BASE],capture_output=True,text=True,check=True)
    return r.stdout
d=json.loads(cli("+record-list","--table-id",TABLE,"--limit","100","--json"))["data"]
rows=[dict(zip(d["fields"],row),record_id=rid) for rid,row in zip(d["record_id_list"],d["data"])]
out=[]; os.makedirs(f"{HERE}/assets/feishu/covers",exist_ok=True)
for name in WANT:
    r=next(x for x in rows if x["章节名"]==name)
    att=(r.get("封面图") or [None])[0]
    tmp=f"/tmp/feishu_{r['record_id']}"; shutil.rmtree(tmp,ignore_errors=True); os.makedirs(tmp)
    cli("+record-download-attachment","--table-id",TABLE,"--record-id",r["record_id"],"--file-token",att["file_token"],"--output",tmp+"/")
    src=glob.glob(tmp+"/*")[0]; ext=os.path.splitext(src)[1].lower()
    dst=f"assets/feishu/covers/{SLUG[name]}{ext}"; shutil.copyfile(src,f"{HERE}/{dst}")   # 原字节复制，不改动
    item={k:r.get(k) for k in KEEP}; item.update(slug=SLUG[name],record_id=r["record_id"],cover=dst,cover_file=att["name"],cover_bytes=att.get("size"))
    out.append(item)
meta=dict(source=dict(base_token=BASE,table_id=TABLE,table="章节",read_with="lark-cli base +record-list / +record-download-attachment (read-only)"),
          all_chapters=sorted([(x.get("序号"),x["章节名"],x.get("英文名"),x.get("状态")) for x in rows],key=lambda t:(t[0] is None,t[0])),
          topics=out)
json.dump(meta,open(f"{HERE}/assets/feishu/topics.json","w"),ensure_ascii=False,indent=1)
print([ (t["章节名"],t["cover"]) for t in out])
