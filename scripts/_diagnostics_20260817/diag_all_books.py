# -*- coding: utf-8 -*-
"""对所有 7 本书：对比 corpus en(strip长度) vs epub 重新抽取 en(strip长度)。
若两者接近 => 英文未缺失，问题是分段不匹配；若 corpus 远小于 epub => 英文真缺失。
"""
import json, re, zipfile, os, sys
HERE = "D:/学习资料/frozen/冰雪奇缘百科/资料库/小说/冰雪奇缘小说"
sys.path.insert(0, HERE)
import build_corpus as bc

CORPUS_DIR = os.path.join(HERE, "novel-corpus")

BOOKS = [
    ("junior",   "Frozen Junior Novel (Disney Book Group) (z-library.sk, 1lib.sk, z-lib.sk).epub"),
    ("junior2",  "Frozen 2 Junior Novelization (Random House) (Disney Book Group) (z-library.sk, 1lib.sk, z-lib.sk).epub"),
    ("conceal",  "Frozen-Concel Don't feel(Jen Calonita [Calonita, Jen]) (z-library.sk, 1lib.sk, z-lib.sk).epub"),
    ("dangerous","Frozen 2 Dangerous Secrets The Story of Iduna and Agnarr (Mari Mancusi) (z-library.sk, 1lib.sk, z-lib.sk).epub"),
    ("forest",   "Frozen 2 Forest of Shadows (Kamilla Benko) (z-library.sk, 1lib.sk, z-lib.sk).epub"),
    ("polar",    "Disney Frozen Polar Nights Cast Into Darkness (Jen Calonita, Mari Mancusi) (z-library.sk, 1lib.sk, z-lib.sk).epub"),
    ("allfound", "All Is Found (Mari Mancusi) (z-library.sk, 1lib.sk, z-lib.sk).epub"),
]

def striplen(h):
    return len(re.sub(r'<[^>]+>', '', h or ''))

def epub_chapters(epub):
    z = zipfile.ZipFile(os.path.join(HERE, epub))
    root, opf_dir = bc.get_opf(z)
    mapping = bc.extract_images(z)
    entries = bc.chapter_entries(z)
    out = []
    for title, href in entries:
        full = bc.resolve(z, opf_dir, href)
        if not full:
            continue
        try:
            data = z.read(full); doc = bc.lh.fromstring(data)
        except Exception:
            continue
        body = doc.body if doc.body is not None else doc
        html = bc.render_html(body, mapping)
        if bc.is_front_back(title, len(re.sub(r"<[^>]+>", "", html))):
            continue
        out.append((title, html))
    return out

for bid, epub in BOOKS:
    corp = json.load(open(os.path.join(CORPUS_DIR, bid+".json"), encoding='utf-8'))
    echs = epub_chapters(epub)
    print(f"\n########## {bid} : corpus章={len(corp['chapters'])}  epub章={len(echs)} ##########")
    n = min(len(corp['chapters']), len(echs))
    missing_count = 0
    for i in range(n):
        c_en = striplen(corp['chapters'][i]['en'])
        e_en = striplen(echs[i][1])
        ratio = (c_en/e_en) if e_en else 0
        flag = ""
        if c_en < e_en * 0.85:   # corpus 明显少于 epub => 真缺失
            flag = " *** EN真缺失 ***"
            missing_count += 1
        elif c_en > e_en * 1.15:
            flag = " (corpus>epub?)"
        print(f"  章{i:2d} {corp['chapters'][i]['title'][:18]:18s} corpus={c_en:5d} epub={e_en:5d} ratio={ratio:.2f}{flag}")
    if missing_count == 0:
        print(f"  => 结论: {bid} 所有章英文 HTML 基本完整 (无真缺失)，问题为分段/配对")
    else:
        print(f"  => 结论: {bid} 有 {missing_count} 章英文 HTML 真缺失")
