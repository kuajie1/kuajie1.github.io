#!/usr/bin/env python3
# 把每首歌的「原声试听」播放器从页面底部移到顶部（标题/元信息之下、歌词之上）。
# 仅移动，不改动歌词正文。song-*.md 专用；lyric-*/map-*/其他文件不动。
import os, re, sys

BASE = os.path.join(os.path.dirname(__file__), '..', 'src', 'vol9-songs')
BASE = os.path.abspath(BASE)

# 歌曲文件 -> 对应音频（public/audio 下的 flac）。None 表示无官方音轨。
AUDIO = {
    'song-frozen-heart': None,
    'song-vuelie': None,
    'song-snowman': 'do-you-want-to-build-a-snowman.flac',
    'song-first-time': 'for-the-first-time-in-forever.flac',
    'song-open-door': 'love-is-an-open-door.flac',
    'song-let-it-go': 'let-it-go.flac',
    'song-reindeer': 'reindeer-are-better-than-people.flac',
    'song-in-summer': 'in-summer.flac',
    'song-fixer-upper': None,
    'song-all-is-found': 'all-is-found.flac',
    'song-never-change': 'some-things-never-change.flac',
    'song-into-the-unknown': 'into-the-unknown.flac',
    'song-when-older': 'when-i-am-older.flac',
    'song-lost-in-the-woods': 'lost-in-the-woods.flac',
    'song-show-yourself': 'show-yourself.flac',
    'song-next-right-thing': 'the-next-right-thing.flac',
}

DRY = '--dry' in sys.argv

def move(path, aud):
    txt = open(path, encoding='utf-8').read()
    original = txt
    # 1) 移除已有的「原声试听」区块（含空白行与 AudioPlayer 行；允许空 src）
    txt = re.sub(r'\n##\s*🎧\s*原声试听\s*\n\s*<AudioPlayer[^>]*/>\s*', '\n', txt)
    # 2) 兜底：散落的 <AudioPlayer .../> 行
    txt = re.sub(r'\n<AudioPlayer[^>]*/>\s*', '\n', txt)
    # 3) 移除无音频时的「音频待添加」提示行（避免与顶部新区块重复）
    txt = re.sub(r'\n音频待添加：将文件命名为[^\n]*', '', txt)

    if aud:
        top = '\n## 🎧 原声试听\n\n<AudioPlayer src="/audio/%s" />\n' % aud
    else:
        top = '\n## 🎧 原声试听\n\n> 🎵 本曲暂无官方无损音轨，以下提供完整歌词与深度解析。\n'

    lines = txt.split('\n')
    h1 = None
    for i, l in enumerate(lines):
        if l.startswith('# ') and not l.startswith('## '):
            h1 = i
            break
    insert_at = len(lines)
    if h1 is not None:
        meta = h1 + 1
        while meta < len(lines) and lines[meta].strip() == '':
            meta += 1
        insert_at = meta + 1  # 元信息行之后插入
    top_lines = top.strip('\n').split('\n')
    lines = lines[:insert_at] + [''] + top_lines + [''] + lines[insert_at:]
    out = '\n'.join(lines)
    if DRY:
        print('\n===== %s =====' % os.path.basename(path))
        print('\n'.join(lines[:14]))
    else:
        if out != original:
            open(path, 'w', encoding='utf-8').write(out)
        print(('CHANGED ' if out != original else 'same    ') + os.path.basename(path))

if __name__ == '__main__':
    for name in AUDIO:
        p = os.path.join(BASE, name + '.md')
        if not os.path.exists(p):
            print('MISSING ' + name)
            continue
        move(p, AUDIO[name])
