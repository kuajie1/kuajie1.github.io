# -*- coding: utf-8 -*-
"""给 vol9-songs 的 13 个主歌曲页注入 <AudioPlayer> 试听块。
映射：歌曲页 slug -> public/audio 下的文件名（不含 .flac）。
若页面已含 AudioPlayer 则跳过，可重复运行。"""
import os

SONGS_DIR = "D:/学习资料/frozen/frozen-encyclopedia-vitepress/src/vol9-songs"

MAP = {
    'song-snowman': 'do-you-want-to-build-a-snowman',
    'song-first-time': 'for-the-first-time-in-forever',
    'song-in-summer': 'in-summer',
    'song-let-it-go': 'let-it-go',
    'song-open-door': 'love-is-an-open-door',
    'song-reindeer': 'reindeer-are-better-than-people',
    'song-all-is-found': 'all-is-found',
    'song-into-the-unknown': 'into-the-unknown',
    'song-lost-in-the-woods': 'lost-in-the-woods',
    'song-show-yourself': 'show-yourself',
    'song-never-change': 'some-things-never-change',
    'song-next-right-thing': 'the-next-right-thing',
    'song-when-older': 'when-i-am-older',
}

BLOCK = "\n## 🎧 原声试听\n\n<AudioPlayer src=\"/audio/{fname}.flac\" />\n"

done = 0
for slug, fname in MAP.items():
    path = os.path.join(SONGS_DIR, slug + '.md')
    if not os.path.exists(path):
        print("SKIP (missing):", slug); continue
    text = open(path, encoding='utf-8').read()
    if 'AudioPlayer' in text:
        print("SKIP (exists):", slug); continue
    text = text.rstrip() + "\n" + BLOCK.format(fname=fname)
    open(path, 'w', encoding='utf-8').write(text)
    done += 1
    print("INJECTED:", slug, "->", fname)
print(f"DONE, 新增 {done} 个试听块")
