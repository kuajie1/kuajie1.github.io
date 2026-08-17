#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把重译结果注入 novel-data/<book>.json。
retrans 文件格式(JSON): { "book": "junior", "data": { "<chapter_index>": ["zh句0","zh句1",...], ... } }
要求每个章节的 zh 数组长度 == 该章 sentences 长度(严格 1:1)。
注入后重建 ch["zh"] = "\n".join(zh)。
"""
import json, sys, os

def main():
    retrans_path = sys.argv[1]
    rt = json.load(open(retrans_path, encoding="utf-8"))
    book = rt["book"]
    data = rt["data"]
    path = f"src/.vitepress/novel-data/{book}.json"
    d = json.load(open(path, encoding="utf-8"))
    chaps = d["chapters"]
    fixed = 0
    for idx_str, zh_list in data.items():
        ci = int(idx_str)
        ch = chaps[ci]
        sents = ch["sentences"]
        if len(zh_list) != len(sents):
            print(f"  ⚠ 第{ci}章 长度不符: zh={len(zh_list)} sent={len(sents)} -> 跳过")
            continue
        for j, s in enumerate(sents):
            s["zh"] = zh_list[j]
        ch["zh"] = "\n".join(zh_list)
        fixed += 1
        print(f"  ✓ 第{ci}章 《{ch.get('title')}》 注入 {len(zh_list)} 句")
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"已写回 {path}，注入 {fixed} 章")

if __name__ == "__main__":
    main()
