#!/usr/bin/env python3
# 把一个"卷首大页" index.md 按 H2 拆成独立子页，并把 index 改为总览+目录表。
# 用法：python split_volume.py <vol_dir> <vol_path_prefix>
#   vol_dir: 如 vol2-world
# 映射在 MAPPINGS 中按 vol_dir 指定。
import os, re, sys

BASE = r"D:\学习资料\frozen\frozen-encyclopedia-vitepress\src"

# 每个卷：list of (匹配子串, slug, 显示标题, 是否新建文件)
# 未出现在映射中的 H2（如"小结"）保留在 index 末尾。
MAPPINGS = {
    "vol2-world": [
        ("阿伦黛尔王国", "arendelle", "阿伦黛尔王国 Arendelle", True),
        ("魔法森林", "enchanted-forest", "魔法森林 Enchanted Forest", True),
        ("阿塔霍兰", "ahtohallan", "阿塔霍兰 Ahtohallan", True),
        ("暗海", "dark-sea", "暗海 Dark Sea", True),
        ("北境民族", "northuldra", "北境民族 Northuldra", True),
        ("其他相关地点", "other-locations", "其他相关地点", True),
    ],
    "vol6-timeline": [
        ("一、阿伦黛尔王室谱系", "lineage", "阿伦黛尔王室谱系", True),
        ("二、影内大事件时间线", "in-universe-timeline", "影内大事件时间线", True),
        ("三、现实世界发行时间线", "release-timeline", "现实世界发行时间线", True),
        ("四、年代考据与争议", "dating-controversies", "年代考据与争议", True),
    ],
    "vol8-culture": [
        ("一、全球文化现象", "cultural-phenomenon", "全球文化现象", True),
        ("二、《Let It Go》现象", "let-it-go-phenomenon", "《Let It Go》现象", True),
        ("三、北欧与原住民表征争议", "representation-debates", "北欧与原住民表征争议", True),
        ("四、性向与身份解读争议", "lgbt-identity-debates", "性向与身份解读争议", True),
        ("五、其他争议与批评", "other-criticism", "其他争议与批评", True),
        # 已存在的子页，仅加入目录，不新建
        ("", "vol8-ch1-impact", "文化影响与现象（数据汇总）", False),
    ],
}


def split_headings(body):
    """把 H2 以下各级标题整体降一级（### -> ##，等等）。"""
    out = []
    for l in body:
        m = re.match(r"^(#+)\s", l)
        if m:
            h = m.group(1)
            if len(h) >= 2:
                l = "#" * (len(h) - 1) + l[len(h):]
        out.append(l)
    return out


def main():
    vol = sys.argv[1]
    voldir = os.path.join(BASE, vol)
    idx_path = os.path.join(voldir, "index.md")
    text = open(idx_path, encoding="utf-8").read()
    lines = text.split("\n")

    # 解析 frontmatter
    assert lines[0].strip() == "---", "index 缺少 frontmatter"
    fm_end = lines[1:].index("---") + 1
    frontmatter = lines[:fm_end + 1]
    rest = lines[fm_end + 1:]

    h1_idx = next(i for i, l in enumerate(rest) if l.startswith("# "))
    h1 = rest[h1_idx]
    first_h2 = next(i for i, l in enumerate(rest) if l.startswith("## "))
    intro = rest[h1_idx + 1:first_h2]

    # 切分 H2 段落
    sections = []
    i = first_h2
    while i < len(rest):
        if rest[i].startswith("## "):
            title = rest[i][3:].strip()
            body = []
            j = i + 1
            while j < len(rest) and not rest[j].startswith("## "):
                body.append(rest[j])
                j += 1
            sections.append([title, body])
            i = j
        else:
            i += 1

    mapping = MAPPINGS[vol]
    toc_rows = []
    remaining = []  # 未映射的 H2 段落（保留在 index 末尾）

    for title, body in sections:
        hit = None
        for (sub, slug, disp, create) in mapping:
            if sub and sub in title:
                hit = (sub, slug, disp, create)
                break
        if hit is None:
            # 保留原样（如小结）
            remaining.append((title, body))
            continue
        sub, slug, disp, create = hit
        if create:
            new_body = split_headings(body)
            content = "---\ntitle: " + disp + "\n---\n\n# " + disp + "\n\n" + "\n".join(new_body).strip() + "\n"
            with open(os.path.join(voldir, slug + ".md"), "w", encoding="utf-8") as f:
                f.write(content)
            print(f"  新建子页: {slug}.md  <-  {title}")
        toc_rows.append((disp, slug))

    # 生成新 index
    out = []
    out += frontmatter
    out.append("")
    out.append(h1)
    out.append("")
    out += intro  # 保留 intro（含空行）
    # 去掉 intro 末尾多余空行
    while out and out[-1].strip() == "":
        out.pop()
    out.append("")
    out.append("## 本卷目录")
    out.append("")
    out.append("| 条目 | 页面 |")
    out.append("|------|------|")
    for disp, slug in toc_rows:
        out.append(f"| {disp} | [前往](/{vol}/{slug}) |")
    out.append("")
    # 追加保留段落（小结等）
    for title, body in remaining:
        out.append("## " + title)
        out.append("")
        out += body
    out.append("")

    with open(idx_path, "w", encoding="utf-8") as f:
        f.write("\n".join(out).strip() + "\n")
    print(f"重写 index.md（共 {len(toc_rows)} 个子页目录）")


if __name__ == "__main__":
    main()
