#!/usr/bin/env python3
# 生成独立的"小说英中对照检查"网页：数据内联，可直接双击打开核查。
# 每段/每句并排显示英文(左)与中文(右)，句数不等时红色高亮，便于"一句一句检查是否对得上"。
import json, re, html, os

SRC = 'src/.vitepress/novel-data/junior.json'
OUT = 'novel_verify.html'

def strip_tags(t):
    return re.sub(r'<[^>]+>', '', t)

def split_sentences(t):
    t = strip_tags(t)
    parts = re.split(r'(?<=[.?!;])\s+|(?<=[。！？；])', t)
    return [p.strip() for p in parts if p.strip()]

def paras_of(html):
    ps = re.findall(r'<p>(.*?)</p>', html, re.S)
    if ps:
        return ps
    # 退化：无 <p> 时按双换行或整体
    return [html] if html.strip() else []

d = json.load(open(SRC, encoding='utf-8'))
chapters = d['chapters']

rows = []
for ci, ch in enumerate(chapters):
    title = ch.get('title', f'第{ci+1}章')
    en_paras = paras_of(ch.get('en', ''))
    zh_paras = paras_of(ch.get('zh', ''))
    # 以较多的一方为基准展示段落
    n = max(len(en_paras), len(zh_paras))
    para_html = []
    for pi in range(n):
        ep = en_paras[pi] if pi < len(en_paras) else ''
        zp = zh_paras[pi] if pi < len(zh_paras) else ''
        es = split_sentences(ep)
        zs = split_sentences(zp)
        en_cells = ''.join(f'<div class="s en">{html.escape(s)}</div>' for s in es) or '<div class="s en empty">（无）</div>'
        zh_cells = ''.join(f'<div class="s zh">{html.escape(s)}</div>' for s in zs) or '<div class="s zh empty">（无）</div>'
        mismatch = ' mismatch' if len(es) != len(zs) else ''
        para_html.append(f'<div class="para{mismatch}"><div class="col en-col">{en_cells}</div><div class="col zh-col">{zh_cells}</div></div>')
    rows.append(f'<section class="chapter"><h2>第{ci+1}章 · {html.escape(title)}</h2>{"".join(para_html)}</section>')

doc = '''<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>冰雪奇缘小说 · 英中对照检查</title>
<style>
* { box-sizing: border-box; }
body { font-family: -apple-system,"PingFang SC","Microsoft YaHei",sans-serif; margin:0; background:#0f1424; color:#dfe6f3; }
header { padding:18px 24px; background:linear-gradient(120deg,#1b2a4a,#2a1b4a); position:sticky; top:0; z-index:10; }
header h1 { margin:0; font-size:18px; }
header p { margin:4px 0 0; font-size:12px; color:#9fb0d0; }
.chapter { border-bottom:1px solid #243049; padding:8px 24px 24px; }
.chapter h2 { font-size:15px; color:#9ad; position:sticky; top:64px; background:#0f1424; padding:8px 0; }
.para { display:flex; gap:0; border-top:1px solid #1c2540; margin-top:6px; }
.para.mismatch { background:rgba(255,80,80,.08); outline:1px solid rgba(255,80,80,.3); }
.col { flex:1; padding:6px 10px; }
.en-col { border-right:1px solid #1c2540; }
.s { padding:5px 8px; margin:3px 0; border-radius:6px; line-height:1.6; font-size:13.5px; }
.s.en { background:#15203a; }
.s.zh { background:#1a2a22; }
.s.empty { color:#667; font-style:italic; }
.legend { font-size:12px; color:#ff9; }
</style></head><body>
<header><h1>冰雪奇缘小说 · 英中对照检查工具</h1>
<p>左=英文，右=中文。红色段落=英中句数不等（最可能错位，需重点核查）。双击本文件即可打开。</p></header>
''' + ''.join(rows) + '</body></html>'

os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(doc)
print('生成', OUT, '大小', len(doc), '字节, 章节数', len(chapters))
