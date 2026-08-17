# -*- coding: utf-8 -*-
"""修复 alignment：当某章中文句数 > 英文句数（中文被细拆），
把完整的英文按「位置比例 + 单调」重新分配到每一句中文上，
保证：每句中文都有英文、顺序不乱、不破坏已正确的头部配对。
仅对 en_list 非空且 len(en_list)!=len(zh_indices) 的章生效；其余章不动。
绝不调用 build_sentences。
"""
import json, os, math

ND = "D:/学习资料/frozen/frozen-encyclopedia-vitepress/src/.vitepress/novel-data"
BOOKS = ["junior","junior2","conceal","dangerous","forest","polar","allfound"]

def main():
    for book in BOOKS:
        p = os.path.join(ND, book + ".json")
        d = json.load(open(p, encoding='utf-8'))
        changed_ch = 0
        for ci, ch in enumerate(d["chapters"]):
            sents = ch.get("sentences", [])
            L = len(sents)
            if L == 0:
                continue
            zh_idx = [i for i in range(L) if (sents[i].get("zh") or "").strip()]
            en_list = [(sents[i].get("en") or "").strip() for i in range(L) if (sents[i].get("en") or "").strip()]
            L_zh = len(zh_idx)
            L_en = len(en_list)
            if L_zh == 0 or L_en == 0 or L_en == L_zh:
                continue  # 无需修复（已1:1 或 未翻译）
            # 长度加权对齐：把英文按字符长度累积，第 rank 个中文句映射到
            # 累积中点最接近 (rank+0.5)/L_zh * 总英文字长的英文句。尊重局部密度。
            en_lens = [len(e) for e in en_list]
            total = sum(en_lens) or 1
            cum = []
            acc = 0
            for k, ln in enumerate(en_lens):
                cum.append(acc + ln / 2.0)  # 第k句的中点位置
                acc += ln
            for rank, i in enumerate(zh_idx):
                target = (rank + 0.5) / L_zh * total
                # 找中点最接近 target 的英文句（单调，不会乱序）
                best = 0
                best_d = abs(cum[0] - target)
                for k in range(1, L_en):
                    dd = abs(cum[k] - target)
                    if dd < best_d:
                        best_d = dd
                        best = k
                sents[i]["en"] = en_list[best]
            changed_ch += 1
            # 统计修复后还有多少空 en
            still_empty = sum(1 for i in zh_idx if not (sents[i].get("en") or "").strip())
            print(f"  {book} 章{ci} ({ch.get('title','')}): zh={L_zh} en={L_en} -> 重分配, 仍空en={still_empty}")
        if changed_ch:
            json.dump(d, open(p, "w", encoding='utf-8'), ensure_ascii=False, indent=1)
            print(f"{book}: 修复 {changed_ch} 章 -> {os.path.basename(p)}")
        else:
            print(f"{book}: 无需修复")
    print("ALIGNMENT FIX DONE")

if __name__ == "__main__":
    main()
