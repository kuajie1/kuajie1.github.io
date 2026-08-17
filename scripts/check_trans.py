import json, os
for f in ['junior.json','junior2.json']:
    p=f'src/.vitepress/novel-data/{f}'
    if os.path.exists(p):
        d=json.load(open(p,encoding='utf-8'))
        chs=d.get('chapters',[])
        total=0; trans=0
        bad=[]
        for i,c in enumerate(chs):
            for s in c.get('sentences',[]):
                total+=1
                if s.get('zh'):
                    trans+=1
            n_zh=sum(1 for s in c.get('sentences',[]) if s.get('zh'))
            if n_zh < len(c.get('sentences',[])):
                bad.append((i, c.get('title','?')[:40], n_zh, len(c.get('sentences',[]))))
        lines = []
        lines.append(f'{f}: {trans}/{total} 译完, 章节 {len(chs)}')
        for b in bad:
            lines.append('  ch%d: %s  zh=%d/%d' % b)
        for i in [-1,-2]:
            c=chs[i]
            lines.append('  last2 ch%d: %s, 第1句 zh=%r en=%r' % (i, c.get('title','')[:30], c['sentences'][0].get('zh','')[:30] if c.get('sentences') else '', c['sentences'][0].get('en','')[:40] if c.get('sentences') else ''))
        out_text = '\n'.join(lines)
        open('check_trans.out','w',encoding='utf-8').write(out_text)
        import sys
        sys.stderr.write(out_text + '\n')
