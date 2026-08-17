#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
扫描 7 本小说全部章节的中英句对齐情况。
启发式标记疑似错位/异常章节，输出报告供人工复核。
不修改任何数据，只读取并报告。
"""
import json, os, re, glob

NOVEL_DIR = "src/.vitepress/novel-data"
CJK = re.compile(r'[\u4e00-\u9fff]')

def load(path):
    return json.load(open(path, encoding="utf-8"))

def scan_chapter(ch):
    sents = ch.get("sentences") or []
    n = len(sents)
    flags = []  # (idx, reason, en_snip, zh_snip)
    ratios = []
    for i, s in enumerate(sents):
        en = (s.get("en") or "").strip()
        zh = (s.get("zh") or "").strip()
        if not zh:
            flags.append((i, "空zh", en[:50], zh[:50])); continue
        if not CJK.search(zh):
            flags.append((i, "zh无中文", en[:50], zh[:50])); continue
        if CJK.search(en):
            flags.append((i, "en含中文(串位)", en[:50], zh[:50])); continue
        if en:
            ratios.append(len(zh)/max(len(en),1))
    # 长度比离群检测（off-by-one 会让某句 zh 明显偏长/偏短）
    if ratios:
        med = sorted(ratios)[len(ratios)//2]
        for i, s in enumerate(sents):
            en = (s.get("en") or "").strip()
            zh = (s.get("zh") or "").strip()
            if not en or not zh or not CJK.search(zh):
                continue
            r = len(zh)/max(len(en),1)
            if r > med*2.3 or r < med*0.4:
                flags.append((i, f"长度比异常(r={r:.2f},中位{med:.2f})", en[:50], zh[:50]))
    return n, flags

def main():
    report = {}
    total_ch = 0
    total_flag = 0
    print(f"{'书':10} {'章':>4} {'句':>5}  异常")
    for path in sorted(glob.glob(f"{NOVEL_DIR}/*.json")):
        book = os.path.basename(path)[:-5]
        d = load(path)
        chaps = d.get("chapters") or []
        book_flags = []
        for ci, ch in enumerate(chaps):
            title = ch.get("title") or f"ch{ci+1}"
            n, flags = scan_chapter(ch)
            total_ch += 1
            if flags:
                total_flag += len(flags)
                book_flags.append((ci+1, title, n, flags))
        report[book] = book_flags
        # 打印该书异常章数
        if book_flags:
            for ci, title, n, flags in book_flags:
                print(f"{book:10} {ci:>4} {n:>5}  ⚠ {len(flags)}处  {title}")
        else:
            print(f"{book:10} 全部 {len(chaps)} 章 无启发式异常")
    print(f"\n=== 汇总：扫描 {total_ch} 章，启发式标记 {total_flag} 处疑似异常 ===")
    # 输出详细报告
    with open("scan_alignment_report.txt","w",encoding="utf-8") as f:
        for book, bflags in report.items():
            if not bflags: continue
            f.write(f"\n#### {book} ####\n")
            for ci, title, n, flags in bflags:
                f.write(f"\n  第{ci}章 《{title}》 句数{n} 异常{len(flags)}:\n")
                for i, reason, en, zh in flags:
                    f.write(f"    [{i}] {reason}\n       EN: {en}\n       ZH: {zh}\n")
    print("详细报告已写 scan_alignment_report.txt")

if __name__ == "__main__":
    main()
