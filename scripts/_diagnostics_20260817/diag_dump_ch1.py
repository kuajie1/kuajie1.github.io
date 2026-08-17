# -*- coding: utf-8 -*-
import json, re
CORPUS = "D:/学习资料/frozen/冰雪奇缘百科/资料库/小说/冰雪奇缘小说/novel-corpus/junior.json"
d = json.load(open(CORPUS, encoding='utf-8'))
ch = d['chapters'][1]  # chapter 1 (index 1)
print("章标题:", ch['title'])
en_html = ch['en']
zh = ch.get('zh')
# 复用 build_sentences 的切分
from build_sentences import split_en, split_zh, norm, strip_tags
en_s = split_en(en_html)
print("split_en 英句数:", len(en_s))
if zh:
    zh_s = split_zh(zh)
    print("split_zh 中句数:", len(zh_s))
    # 打印末尾若干
    print("\n=== EN 末尾 5 句 ===")
    for i,s in enumerate(en_s[-5:]):
        print(f"[E{len(en_s)-5+i}] {s[:120]}")
    print("\n=== ZH 末尾 8 句 ===")
    for i,s in enumerate(zh_s[-8:]):
        print(f"[Z{len(zh_s)-8+i}] {s[:120]}")
# 打印 corpus sentences 末尾
sents = ch.get('sentences', [])
print(f"\n=== CORPUS sentences 总数 {len(sents)} ===")
for i in range(max(0,len(sents)-12), len(sents)):
    s = sents[i]
    e = (s.get('en') or '').strip()
    z = (s.get('zh') or '').strip()
    print(f"[{i}] EN={'空' if not e else e[:60]} | ZH={z[:50]}")
