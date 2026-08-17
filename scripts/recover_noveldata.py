# -*- coding: utf-8 -*-
"""从 翻译工作存档/trans_*.json 恢复 novel-data 的中文译文。
逻辑同 apply_trans.py，但批量处理一本书的所有 trans 文件（按文件名排序，后写的覆盖先写的）。
绝不运行 build_sentences —— 那会再次清空译文。
"""
import json, os, glob

ND = "D:/学习资料/frozen/frozen-encyclopedia-vitepress/src/.vitepress/novel-data"
ARCH = "D:/学习资料/frozen/翻译工作存档"

BOOKS = {
    "junior2":  "trans_junior2_",
    "conceal":  "trans_conceal_",
    "dangerous":"trans_dangerous_",
    "forest":   "trans_forest_",
    "polar":    "trans_polar_",
    "allfound": "trans_allfound_",
}

for book, prefix in BOOKS.items():
    p = os.path.join(ND, book + ".json")
    d = json.load(open(p, encoding='utf-8'))
    files = sorted(glob.glob(os.path.join(ARCH, prefix + "*.json")))
    applied = 0
    skipped = 0
    for f in files:
        t = json.load(open(f, encoding='utf-8'))
        for idx_s, zhs in t.items():
            ci = int(idx_s)
            if ci < 0 or ci >= len(d["chapters"]):
                print(f"  SKIP {book} 越界 {ci} ({os.path.basename(f)})")
                skipped += 1
                continue
            ch = d["chapters"][ci]
            sents = ch.get("sentences", [])
            if not isinstance(zhs, list) or len(zhs) != len(sents):
                print(f"  SKIP {book} ch{ci} ({ch.get('title','')}): 译文{len(zhs) if isinstance(zhs,list) else '?'} != 句{len(sents)}")
                skipped += 1
                continue
            for j, s in enumerate(sents):
                s["zh"] = zhs[j]
            ch["zh"] = "\n\n".join(zhs)
            applied += 1
    json.dump(d, open(p, "w", encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"{book}: 注入 {applied} 章, 跳过 {skipped}  -> {os.path.basename(p)}")

print("RECOVERY DONE")
