# -*- coding: utf-8 -*-
"""量化每本书每章 sentences 的 en/zh 数量关系与空槽分布。"""
import json, os
CORPUS_DIR = "D:/学习资料/frozen/冰雪奇缘百科/资料库/小说/冰雪奇缘小说/novel-corpus"
BOOKS = ["junior","junior2","conceal","dangerous","forest","polar","allfound"]

def stats(ch):
    sents = ch.get('sentences', [])
    L = len(sents)
    empty_en = sum(1 for s in sents if not (s.get('en') or '').strip())
    empty_zh = sum(1 for s in sents if not (s.get('zh') or '').strip())
    # 连续空 en 是否只在尾部
    tail_empty = 0
    for s in reversed(sents):
        if not (s.get('en') or '').strip(): tail_empty += 1
        else: break
    head_empty = 0
    for s in sents:
        if not (s.get('en') or '').strip(): head_empty += 1
        else: break
    return L, empty_en, empty_zh, head_empty, tail_empty

total_ch = 0
broken_ch = 0   # 有空en且空en>0 且非均匀散布
summary = {}
for bid in BOOKS:
    d = json.load(open(os.path.join(CORPUS_DIR, bid+".json"), encoding='utf-8'))
    ch_broken = 0
    detail = []
    for i, ch in enumerate(d['chapters']):
        L, ee, ez, he, te = stats(ch)
        flag = ""
        if ee > 0:
            ch_broken += 1
            flag = f" 空en={ee}(head{he},tail{te})"
        if ez > 0:
            flag += f" 空zh={ez}"
        if flag:
            detail.append(f"    章{i:2d} {ch['title'][:16]:16s} L={L} {flag}")
    summary[bid] = (len(d['chapters']), ch_broken, detail)
    total_ch += len(d['chapters'])
    broken_ch += ch_broken

print(f"总计章节={total_ch}, 含空en章节={broken_ch}\n")
for bid,(n,nb,detail) in summary.items():
    print(f"### {bid}: {n}章, 其中 {nb} 章有空en")
    for line in detail:
        print(line)
