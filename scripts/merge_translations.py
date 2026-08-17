# -*- coding: utf-8 -*-
"""把各 agent 产出的 *_zh.json 回注到 novel-data，并做译名规范化、严格校验句数。"""
import json, os, glob, shutil, datetime

ND = "D:/学习资料/frozen/frozen-encyclopedia-vitepress/src/.vitepress/novel-data"
TPKG = "D:/学习资料/frozen/frozen-encyclopedia-vitepress/scripts/tpkg"

# 0) 备份当前 novel-data（防回注出错可回退）
ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
bak = f"D:/学习资料/frozen/翻译工作存档/noveldata_before_merge_{ts}"
shutil.copytree(ND, bak)
print("已备份 novel-data ->", bak)

# 1) 汇总各 agent 输出
files = sorted(glob.glob(os.path.join(TPKG, "*_zh.json")))
assert files, "没有找到 *_zh.json 输出文件"
by_book = {}
for fp in files:
    t = json.load(open(fp, encoding="utf-8"))
    by_book.setdefault(t["book"], {})
    for ci, zhs in t["chapters"].items():
        by_book[t["book"]].setdefault(ci, []).extend(zhs)

def normalize_zh(book, text):
    """统一译名到既有规范；保护韦斯特顿(Weselton)不被误改。"""
    if not text:
        return text
    text = text.replace("汉斯王子", "汉斯")
    text = text.replace("韦斯特顿", "韦斯特顿\x00")   # 占位保护
    text = text.replace("斯特", "斯文")
    text = text.replace("韦斯特顿\x00", "韦斯特顿")
    if book == "junior2":
        text = text.replace("雪宝", "奥拉夫")          # junior2 规范为奥拉夫
    # junior 书保持 雪宝（与既有0-7章一致），不改
    return text

# 2) 注入 + 整书规范化
skipped = []
for book, chaps in by_book.items():
    d = json.load(open(os.path.join(ND, book + ".json"), encoding="utf-8"))
    for ci, zhs in chaps.items():
        i = int(ci)
        sents = d["chapters"][i]["sentences"]
        if len(zhs) != len(sents):
            skipped.append(f"{book} 章{i}: 译文{len(zhs)} != 原文{len(sents)}")
            continue
        for j, s in enumerate(sents):
            s["zh"] = normalize_zh(book, zhs[j])
    # 整书再规范化一次（顺带修旧章节里残留的 斯特/汉斯王子，保持全书一致）
    for ch in d["chapters"]:
        for s in ch["sentences"]:
            if s.get("zh"):
                s["zh"] = normalize_zh(book, s["zh"])
    json.dump(d, open(os.path.join(ND, book + ".json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"{book}: 已回注并规范化 {len(chaps)} 章")

if skipped:
    print("\n!!! 句数不符，已跳过：")
    for e in skipped:
        print("  ", e)
    raise SystemExit(1)

# 3) 覆盖校验
print("\n=== 覆盖校验 ===")
for book in by_book:
    d = json.load(open(os.path.join(ND, book + ".json"), encoding="utf-8"))
    nz = sum(1 for ch in d["chapters"] for s in ch["sentences"] if (s.get("zh") or "").strip())
    ns = sum(len(ch["sentences"]) for ch in d["chapters"])
    print(f"{book:8s} 有zh={nz}/{ns} ({100*nz//ns}%)")
print("\nALL_OK")
