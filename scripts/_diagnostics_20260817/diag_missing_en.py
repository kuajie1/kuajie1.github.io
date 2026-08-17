# -*- coding: utf-8 -*-
"""诊断 junior 第1章为何 corpus en 不完整：对比 epub 抽取 vs corpus 现状。"""
import json, re, zipfile, os, sys
sys.path.insert(0, "D:/学习资料/frozen/冰雪奇缘百科/资料库/小说/冰雪奇缘小说")
import build_corpus as bc

EP = "D:/学习资料/frozen/冰雪奇缘百科/资料库/小说/冰雪奇缘小说/Frozen Junior Novel (Disney Book Group) (z-library.sk, 1lib.sk, z-lib.sk).epub"
CORPUS = "D:/学习资料/frozen/冰雪奇缘百科/资料库/小说/冰雪奇缘小说/novel-corpus/junior.json"

def strip_len(h):
    return len(re.sub(r'<[^>]+>', '', h or ''))

# 1) 用 build_corpus 的逻辑重新抽取 junior 全部章（仅 en 字段）
z = zipfile.ZipFile(EP)
root, opf_dir = bc.get_opf(z)
mapping = bc.extract_images(z)
entries = bc.chapter_entries(z)
print(f"epub 目录条目数: {len(entries)}")
chapters = []
for title, href in entries:
    full = bc.resolve(z, opf_dir, href)
    if not full:
        continue
    try:
        data = z.read(full)
        doc = bc.lh.fromstring(data)
    except Exception:
        continue
    body = doc.body if doc.body is not None else doc
    html = bc.render_html(body, mapping)
    text_len = len(re.sub(r"<[^>]+>", "", html))
    if bc.is_front_back(title, text_len):
        continue
    chapters.append((title, html, full))

print(f"抽取到正文章数: {len(chapters)}")

# 2) 看 corpus 现状
d = json.load(open(CORPUS, encoding='utf-8'))
print(f"corpus 章数: {len(d['chapters'])}")

print("\n=== 前几章 en 长度对比 (epub抽取 vs corpus) ===")
for i in range(min(4, len(chapters))):
    epub_title, epub_html, full = chapters[i]
    corp_ch = d['chapters'][i] if i < len(d['chapters']) else None
    corp_en = corp_ch['en'] if corp_ch else ''
    print(f"\n[章 {i}] epub标题={epub_title!r}  xhtml={os.path.basename(full)}")
    print(f"  epub抽取 en 字符数(strip): {strip_len(epub_html)}")
    print(f"  corpus    en 字符数(strip): {strip_len(corp_en)}")
    # 看 sentences 数量
    sents = corp_ch.get('sentences', []) if corp_ch else []
    empty_en = sum(1 for s in sents if not (s.get('en') or '').strip())
    print(f"  sentences 总数={len(sents)}  空en数={empty_en}")
    # 关键：epub 末尾是否有内容但 corpus 没有
    if strip_len(epub_html) > strip_len(corp_en) * 1.2:
        print(f"  *** epub 比 corpus 多 {strip_len(epub_html)-strip_len(corp_en)} 字符 —— 抽取缺失！")
        # 打印 epub 末尾片段
        import re as _re
        txt = _re.sub(r'<[^>]+>', ' ', epub_html)
        txt = _re.sub(r'\s+', ' ', txt).strip()
        print(f"  epub 文本末尾 300 字: ...{txt[-300:]}")
        ctxt = _re.sub(r'<[^>]+>', ' ', corp_en)
        ctxt = _re.sub(r'\s+', ' ', ctxt).strip()
        print(f"  corpus 文本末尾 300 字: ...{ctxt[-300:]}")
