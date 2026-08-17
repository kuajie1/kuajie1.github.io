import json, os, re

ND = 'D:/学习资料/frozen/frozen-encyclopedia-vitepress/src/.vitepress/novel-data'
OUT = 'scripts/seeds'
os.makedirs(OUT, exist_ok=True)

BOOKS = {
    'junior':   'Frozen Junior Novel（电影1 青少小说）',
    'junior2':  'Frozen 2 Deluxe Junior（电影2 青少小说）',
    'conceal':  'Conceal, Don’t Feel（Twisted Tale 平行宇宙）',
    'dangerous':'Dangerous Secrets（伊杜娜与阿格纳尔前传）',
    'forest':   'Forest of Shadows（电影2 中篇前传）',
    'polar':    'Polar Nights（原创图像小说）',
    'allfound': 'All Is Found（短篇小说集）',
}

def first_sentences(zh_list, n=2):
    out = []
    for s in zh_list:
        s = (s or '').strip()
        if not s:
            continue
        out.append(s)
        if len(out) >= n:
            break
    return out

for bid, label in BOOKS.items():
    d = json.load(open(os.path.join(ND, bid + '.json'), encoding='utf-8'))
    lines = []
    lines.append(f'# {label}  (book-id={bid})')
    lines.append(f'# 总章数: {len(d["chapters"])}')
    lines.append('')
    for i, ch in enumerate(d['chapters']):
        title = ch.get('title') or f'第{i}章'
        sents = ch.get('sentences', [])
        zh = [(s.get('zh') or '').strip() for s in sents]
        starts = first_sentences(zh, 2)
        lines.append(f'## 章{i} · {title}')
        for st in starts:
            lines.append(f'  - {st[:120]}')
    lines.append('')
    fn = os.path.join(OUT, f'{bid}_seed.txt')
    open(fn, 'w', encoding='utf-8').write('\n'.join(lines))
    print(f'{bid}: 种子已写 {fn} ({len(d["chapters"])}章)')
