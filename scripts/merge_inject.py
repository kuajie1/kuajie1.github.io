#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
安全合并注入：对重译结果，仅在不空 EN 的位置用重译 ZH 覆盖（修复错位），
在 EN 为空的位置保留原 ZH（避免清空已译好的中文）。
retrans 格式: {"book":..., "data": {"<idx>":["zh",...], ...}}
"""
import json, sys

def main():
    retrans_path = sys.argv[1]
    rt = json.load(open(retrans_path, encoding="utf-8"))
    book = rt["book"]; data = rt["data"]
    path = f"src/.vitepress/novel-data/{book}.json"
    d = json.load(open(path, encoding="utf-8"))
    chaps = d["chapters"]
    for idx_str, ret_zh in data.items():
        ci = int(idx_str)
        ch = chaps[ci]; sents = ch["sentences"]
        assert len(ret_zh) == len(sents), f"第{ci}章长度不符 {len(ret_zh)}!={len(sents)}"
        kept = 0; overwritten = 0
        new_zh = []
        for j, s in enumerate(sents):
            en = (s.get("en") or "").strip()
            if en:                      # 有英文：用重译（修复错位）
                new_zh.append(ret_zh[j]); overwritten += 1
            else:                      # 无英文：保留原中文（防清空）
                new_zh.append((s.get("zh") or "").strip()); kept += 1
        for j, s in enumerate(sents):
            s["zh"] = new_zh[j]
        ch["zh"] = "\n".join(new_zh)
        print(f"  ✓ 第{ci}章 《{ch.get('title')}》 覆盖{overwritten}(有EN) 保留{kept}(无EN空英文)")
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"已写回 {path}")

if __name__ == "__main__":
    main()
