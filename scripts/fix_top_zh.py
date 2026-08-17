"""
修补 junior/junior2 的顶层 zh 字段。
合并脚本回填时只写了 sentences，这次把每章 sentences 拼成 HTML 填回 c.zh。
不破坏既有 sentences / en。
"""
import json, re, os, html

base = r'D:\学习资料\frozen\frozen-encyclopedia-vitepress\src\.vitepress\novel-data'

for name in ['junior', 'junior2']:
    p = os.path.join(base, f'{name}.json')
    d = json.load(open(p, encoding='utf-8'))
    chs = d.get('chapters', [])
    fixed = 0
    for c in chs:
        top = (c.get('zh') or '').strip()
        if top:
            continue
        sents = c.get('sentences') or []
        zh_parts = [(s.get('zh') or '').strip() for s in sents if (s.get('zh') or '').strip()]
        if not zh_parts:
            continue
        # 拼成 <p>...</p>，转义原内容
        merged = '<p>' + '</p><p>'.join(html.escape(x) for x in zh_parts) + '</p>'
        c['zh'] = merged
        fixed += 1
    out = json.dumps(d, ensure_ascii=False, indent=2)
    open(p, 'w', encoding='utf-8').write(out)
    print(f'{name}.json  补顶层 zh: {fixed} 章')
