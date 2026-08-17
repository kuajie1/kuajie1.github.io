# -*- coding: utf-8 -*-
"""
重构小说语料：
1) 章节命名：纯泛称 "Chapter N" / "Prologue" / "Epilogue" 中文化；
   junior 用人工取的童话风内容向名字。
2) 每章加 sentences:[{en, zh}]（按句切分，逐句对齐）。
   - 已有 zh 的章：en/zh 各切句后按下标配对（数量不一致时多余 en 标 zh=None）。
   - 无 zh 的章：sentences 仅含 en，zh=None（阅读器显示「待补充」）。
3) 写回 corpus（源），并同步覆盖 novel-data（构建读取处）。
"""
import json, re, os, shutil

CORPUS = "D:/学习资料/frozen/冰雪奇缘百科/资料库/小说/冰雪奇缘小说/novel-corpus"
NOVELD = "D:/学习资料/frozen/frozen-encyclopedia-vitepress/src/.vitepress/novel-data"

WORD_NUM = {
    "One":1,"Two":2,"Three":3,"Four":4,"Five":5,"Six":6,"Seven":7,
    "Eight":8,"Nine":9,"Ten":10,"Eleven":11,"Twelve":12,
}

# junior 内容向章节名（按 id 映射；key 用 chapter 序号由下方统一处理）
JUNIOR_NAMES = {
    0:  "序章 · 雪山采冰人",
    1:  "第一章 · 极光下的女孩",
    2:  "第二章 · 尘封的古书",
    3:  "第三章 · 紧闭的宫门",
    4:  "第四章 · 加冕之晨",
    5:  "第五章 · 海港的遐想",
    6:  "第六章 · 加冕典礼",
    7:  "第七章 · 翩然相遇",
    8:  "第八章 · 秘密泄露",
    9:  "第九章 · 风雪寻姐",
    10: "第十章 · 杂货店风波",
    11: "第十一章 · 雪原疾驰",
    12: "第十二章 · 山巅远眺",
    13: "第十三章 · 冰棱迷宫",
    14: "第十四章 · 冰雪宫殿",
    15: "第十五章 · 雪怪逐客",
    16: "第十六章 · 冰封的阿伦黛尔",
    17: "第十七章 · 极光引路",
    18: "第十八章 · 急速下山",
    19: "第十九章 · 错付的信任",
    20: "第二十章 · 逆风回山",
    21: "第二十一章 · 暴雪将至",
    22: "第二十二章 · 最后的抉择",
    23: "第二十三章 · 暖春归来",
}

def strip_tags(h):
    return re.sub(r'<[^>]+>', ' ', h or '')

def norm(s):
    return re.sub(r'\s+', ' ', s or '').strip()

def split_en(text):
    t = norm(strip_tags(text))
    # 句末 . ! ? 后接空白+大写/引号 处切分；保留缩写容错（简单处理）
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z"\'\u2019(])', t)
    return [p.strip() for p in parts if p.strip()]

def split_zh(text):
    t = norm(strip_tags(text))
    parts = re.split(r'(?<=[。！？；])', t)
    return [p.strip() for p in parts if p.strip()]

def rename_title(book_id, idx, title):
    if book_id == 'junior' and idx in JUNIOR_NAMES:
        return JUNIOR_NAMES[idx]
    t = (title or '').strip()
    if t == 'Prologue':
        return '序章'
    if t == 'Epilogue':
        return '尾声'
    m = re.match(r'^Chapter (\d+)$', t)
    if m:
        return f"第{m.group(1)}章"
    m = re.match(r'^Chapter (One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve)$', t)
    if m:
        return f"第{WORD_NUM[m.group(1)]}章"
    return t  # 已有描述性副标题，保留

def align_sentences(en_s, zh_s):
    """把英文句序列(en_s)与中文句序列(zh_s)对齐成 [{en,zh}]。
    - 等长: 1:1 配对
    - 中文更多(中文被细拆): 长度加权把英文句分配/重复到每句中文上(顺序不乱)
    - 英文更多: 每句英文配中文, 多余英文无中文(zh=None)
    绝不产生「有中文却空英文」的尾巴。
    """
    L_en = len(en_s)
    L_zh = len(zh_s)
    if L_en == 0:
        return [{'en': '', 'zh': z} for z in zh_s]
    if L_zh == 0:
        return [{'en': e, 'zh': None} for e in en_s]
    if L_en == L_zh:
        return [{'en': en_s[i], 'zh': zh_s[i]} for i in range(L_en)]
    # 长度加权映射中点
    en_lens = [len(e) for e in en_s]
    total = sum(en_lens) or 1
    cum = []
    acc = 0
    for ln in en_lens:
        cum.append(acc + ln / 2.0)
        acc += ln
    out = []
    for rank in range(L_zh):
        target = (rank + 0.5) / L_zh * total
        best, best_d = 0, abs(cum[0] - target)
        for k in range(1, L_en):
            dd = abs(cum[k] - target)
            if dd < best_d:
                best_d, best = dd, k
        out.append({'en': en_s[best], 'zh': zh_s[rank]})
    return out

def build_sentences(ch):
    en_s = split_en(ch.get('en', ''))
    zh = ch.get('zh')
    if zh:
        zh_s = split_zh(zh)
        ch['sentences'] = align_sentences(en_s, zh_s)
    else:
        ch['sentences'] = [{'en': s, 'zh': None} for s in en_s]
    return ch

def process(book_id, fname):
    src = os.path.join(CORPUS, fname)
    if not os.path.exists(src):
        print("MISSING", fname); return
    d = json.load(open(src, encoding='utf-8'))
    dst = os.path.join(NOVELD, fname)
    # 既有 novel-data（若含中文译文，则作为权威 zh 来源，绝不清空）
    existing = None
    if os.path.exists(dst):
        try:
            existing = json.load(open(dst, encoding='utf-8'))
        except Exception:
            existing = None
    for idx, ch in enumerate(d.get('chapters', [])):
        ch['title'] = rename_title(book_id, idx, ch.get('title'))
        en_s = split_en(ch.get('en', ''))
        # 优先采用既有 novel-data 的中文（已译且已对齐）
        ex_ch = None
        if existing and idx < len(existing.get('chapters', [])):
            ex_ch = existing['chapters'][idx]
        ex_sent = ex_ch.get('sentences', []) if ex_ch else []
        ex_zh = [(s.get('zh') or '').strip() for s in ex_sent]
        if any(ex_zh):
            ch['sentences'] = align_sentences(en_s, ex_zh)
            ch['zh'] = ex_ch.get('zh') or '\n\n'.join(ex_zh)
        elif ch.get('zh'):
            zh_s = split_zh(ch['zh'])
            ch['sentences'] = align_sentences(en_s, zh_s)
        else:
            ch['sentences'] = [{'en': s, 'zh': None} for s in en_s]
    # 写回 corpus
    with open(src, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    # 同步到 novel-data（保留既有译文）
    shutil.copyfile(src, dst)
    print(f"{book_id}: {len(d['chapters'])} 章已处理 -> {os.path.basename(dst)}")

MAP = [
    ('junior','junior.json'),
    ('junior2','junior2.json'),
    ('conceal','conceal.json'),
    ('dangerous','dangerous.json'),
    ('forest','forest.json'),
    ('polar','polar.json'),
    ('allfound','allfound.json'),
]

# 关键：仅在直接运行时执行，import 时绝不自动跑（避免清空译文）。
if __name__ == "__main__":
    for bid, fn in MAP:
        process(bid, fn)
    print("DONE")
