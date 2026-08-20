#!/usr/bin/env python3
# 1) 把 13 个歌曲页 md 里的 /audio/XXX.flac -> /audio/XXX.mp3
# 2) 删除 src/public/audio 下的旧 .flac 源文件
import os, glob

SONGS_DIR = r"D:\学习资料\frozen\frozen-encyclopedia-vitepress\src\vol9-songs"
AUDIO_DIR = r"D:\学习资料\frozen\frozen-encyclopedia-vitepress\src\public\audio"

def main():
    # 1) 替换引用
    cnt = 0
    for md in glob.glob(os.path.join(SONGS_DIR, "song-*.md")):
        with open(md, "r", encoding="utf-8") as f:
            txt = f.read()
        if ".flac" in txt:
            new = txt.replace(".flac", ".mp3")
            with open(md, "w", encoding="utf-8") as f:
                f.write(new)
            cnt += 1
            print(f"更新引用: {os.path.basename(md)}")
    print(f"共更新 {cnt} 个 md 文件")

    # 2) 删除旧 flac
    flacs = glob.glob(os.path.join(AUDIO_DIR, "*.flac"))
    for fl in flacs:
        os.remove(fl)
        print(f"删除旧源: {os.path.basename(fl)}")
    print(f"已删除 {len(flacs)} 个 flac")

    # 校验：目录仅剩 mp3
    left = glob.glob(os.path.join(AUDIO_DIR, "*"))
    print("audio 目录剩余:")
    for p in sorted(left):
        print("  ", os.path.basename(p), f"({os.path.getsize(p)/1024/1024:.1f}MB)" if os.path.isfile(p) else "")

if __name__ == "__main__":
    main()
