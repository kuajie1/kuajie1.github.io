# -*- coding: utf-8 -*-
"""验证：各书 trans_*.json 的每章译文条数 是否 == 当前 novel-data 该章 sentences 条数。
若全部匹配 => 可直接用 apply_trans 恢复；否则记录不匹配章节。
"""
import json, os, glob, re

ARCH = "D:/学习资料/frozen/翻译工作存档"
ND = "D:/学习资料/frozen/frozen-encyclopedia-vitepress/src/.vitepress/novel-data"

BOOKS = {
    "junior2":  "trans_junior2_",
    "conceal":  "trans_conceal_",
    "dangerous":"trans_dangerous_",
    "forest":   "trans_forest_",
    "polar":    "trans_polar_",
    "allfound": "trans_allfound_",
}

for book, prefix in BOOKS.items():
    nd = json.load(open(os.path.join(ND, book+".json"), encoding='utf-8'))
    files = sorted(glob.glob(os.path.join(ARCH, prefix+"*.json")))
    # 汇总 trans: chap_index -> count
    trans_counts = {}
    for f in files:
        t = json.load(open(f, encoding='utf-8'))
        for k, v in t.items():
            ci = int(k)
            if ci in trans_counts:
                print(f"  [WARN] {book} 章节{ci} 在多个 trans 文件重复!")
            trans_counts[ci] = len(v) if isinstance(v, list) else -1
    # 比对
    mism = []
    missing = []
    nch = len(nd['chapters'])
    for ci in range(nch):
        cur = len(nd['chapters'][ci]['sentences'])
        tc = trans_counts.get(ci)
        if tc is None:
            missing.append(ci)
        elif tc != cur:
            mism.append((ci, cur, tc))
    print(f"\n### {book}: 章节{nch}, trans覆盖{len(trans_counts)}章, trans文件{len(files)}个")
    if missing:
        print(f"  缺失trans的章节: {missing}")
    if mism:
        print(f"  条数不匹配章节(章,当前句数,trans条数): {mism}")
    if not missing and not mism:
        print(f"  ✓ 全部匹配，可安全恢复")
