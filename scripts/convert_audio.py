#!/usr/bin/env python3
# 把 src/public/audio 下的 FLAC 转成 192kbps MP3（EdgeOne 单文件 25MB 限制）
import subprocess, os, glob

FFMPEG = r"C:\Users\11343\.workbuddy\binaries\python\envs\default\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
AUDIO_DIR = r"D:\学习资料\frozen\frozen-encyclopedia-vitepress\src\public\audio"

def human(size):
    return f"{size/1024/1024:.1f} MB"

def main():
    flacs = sorted(glob.glob(os.path.join(AUDIO_DIR, "*.flac")))
    print(f"找到 {len(flacs)} 个 FLAC 文件")
    for src in flacs:
        base = os.path.splitext(os.path.basename(src))[0]
        dst = os.path.join(AUDIO_DIR, base + ".mp3")
        cmd = [FFMPEG, "-y", "-i", src, "-codec:a", "libmp3lame", "-b:a", "192k", dst]
        print(f"\n转码: {os.path.basename(src)} -> {base}.mp3")
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        sz = os.path.getsize(dst)
        flag = "OK" if sz < 25*1024*1024 else "!!! 超过25MB"
        print(f"  输出大小: {human(sz)}  [{flag}]")
    print("\n完成。MP3 列表:")
    for mp3 in sorted(glob.glob(os.path.join(AUDIO_DIR, "*.mp3"))):
        print(f"  {human(os.path.getsize(mp3)):>10}  {os.path.basename(mp3)}")

if __name__ == "__main__":
    main()
