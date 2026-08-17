#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fragment -> VitePress Markdown 迁移器（针对冰雪奇缘百科 fragments 的既定结构）。

用法:
  python migrate_volume.py <volN.html> <out_dir> <vol_slug> [--index]

约定:
  - 每个 <article class="entry" id="X"> 输出一个 <out_dir>/<X>.md 页面
  - 图片路径统一改写为 /images/<文件名>（源图已扁平复制到 public/images）
  - 卷内锚点 #id -> /<vol_slug>/<id>
  - 卷首页 <out_dir>/index.md 由 --index 生成（含卷导语 + 角色索引表）

依赖: lxml
"""
import os, re, sys, json
from lxml import html as lh

PLACEHOLDER_IMG = {"olaf-summer.webp"}  # 已知占位图，保留提示

def img_to_md(src, alt=""):
    base = os.path.basename(src.replace("\\", "/"))
    if base in PLACEHOLDER_IMG:
        return f"> ⚠️ 图片待补充（占位：{alt}）"
    return f"![{alt}](/images/{base})"

def inline_md(el, id_map):
    """把元素及其 tail 转成 markdown 行内串（处理 b/i/a/span/br）。"""
    parts = []
    tag = el.tag.lower() if isinstance(el.tag, str) else ""
    if tag in ("b", "strong"):
        parts.append("**" + (el.text or ""))
        for c in el:
            parts.append(inline_md(c, id_map))
        parts.append("**")
    elif tag in ("i", "em"):
        parts.append("*" + (el.text or ""))
        for c in el:
            parts.append(inline_md(c, id_map))
        parts.append("*")
    elif tag == "a":
        href = el.get("href", "")
        txt = (el.text or "")
        for c in el:
            txt += inline_md(c, id_map)
        if href.startswith("#") and href[1:] in id_map:
            parts.append(f"[{txt}](/{id_map[href[1:]]})")
        elif href.startswith("#"):
            parts.append(f"[{txt}](#{href[1:]})")  # 跨卷锚点，先保留
        else:
            parts.append(f"[{txt}]({href})")
    elif tag == "span":
        # source 标注保留为普通文本（可加括号）
        t = el.text or ""
        for c in el:
            t += inline_md(c, id_map)
        cls = el.get("class", "")
        if "source" in cls:
            parts.append(f"（{t}）")
        else:
            parts.append(t)
    elif tag == "br":
        parts.append("  \n")
    else:
        if el.text:
            parts.append(el.text)
        for c in el:
            parts.append(inline_md(c, id_map))
    if el.tail:
        parts.append(el.tail)
    return "".join(parts)

def block_md(el, id_map, depth=0):
    """递归把块级元素转成 markdown。"""
    out = []
    tag = el.tag.lower() if isinstance(el.tag, str) else ""
    cls = el.get("class", "")

    if tag == "div" and "card" in cls:
        # 信息卡：左图 + 右属性表
        left = el.find('.//div[@class="card-left"]')
        right = el.find('.//div[@class="card-right"]')
        if left is not None:
            img = left.find(".//img")
            if img is not None:
                out.append(img_to_md(img.get("src", ""), img.get("alt", "")))
                out.append("")
        if right is not None:
            rows = right.findall('.//div[@class="row"]')
            if rows:
                out.append("| 属性 | 内容 |")
                out.append("|------|------|")
                for r in rows:
                    tag_span = r.find('.//span[@class="tag"]')
                    val_span = r.find('.//span[@class="val"]')
                    k = (tag_span.text or "") if tag_span is not None else ""
                    v = inline_md(val_span, id_map) if val_span is not None else ""
                    out.append(f"| {k} | {v.strip()} |")
                out.append("")
        return "\n".join(out)

    if tag == "section" and "char-section" in cls:
        for c in el:
            if isinstance(c.tag, str):
                t = c.tag.lower()
                if t == "h4":
                    out.append(f"### {inline_md(c, id_map).strip()}")
                    out.append("")
                else:
                    blk = block_md(c, id_map, depth + 1)
                    if blk.strip():
                        out.append(blk)
                        out.append("")
        return "\n".join(out)

    if tag == "figure" and "fig" in cls:
        img = el.find(".//img")
        cap = el.find(".//figcaption")
        if img is not None:
            alt = img.get("alt", "")
            out.append(img_to_md(img.get("src", ""), alt))
            if cap is not None:
                out.append("")
                out.append(f"*{(cap.text or '').strip()}*")
            out.append("")
        return "\n".join(out)

    if tag == "blockquote" and "quote" in cls:
        cite = el.find(".//cite")
        body = inline_md(el, id_map)
        # 去掉 cite 部分避免重复
        if cite is not None and cite.text:
            body = body.replace(inline_md(cite, id_map), "")
        out.append("> " + "  \n> ".join(body.strip().splitlines()))
        if cite is not None:
            ct = (cite.text or "").strip()
            ct = re.sub(r'^[-\u2014\u2013\u2015]\s*', '', ct)  # 去掉多余的引导破折号
            out.append(f"> \n> — *{ct}*")
        out.append("")
        return "\n".join(out)

    if tag == "div" and "cap" in cls:
        txt = inline_md(el, id_map).strip()
        out.append(f"📌 {txt}")
        out.append("")
        return "\n".join(out)

    if tag == "div" and "grid-label" in cls:
        t = (el.text or "").strip()
        if t:
            out.append(f"**{t}**")
            out.append("")
        return "\n".join(out)

    if tag == "p":
        out.append(inline_md(el, id_map).strip())
        out.append("")
        return "\n".join(out)

    if tag in ("ul", "ol"):
        for li in el.findall(".//li"):
            # 只取直接子 li（避免嵌套重复）——简单处理：取所有 li 但去重层级
            pass
        # 直接子 li
        for li in [x for x in el if x.tag.lower() == "li"]:
            item = inline_md(li, id_map).strip()
            out.append(f"- {item}")
        out.append("")
        return "\n".join(out)

    if tag == "h4":
        out.append(f"### {inline_md(el, id_map).strip()}")
        out.append("")
        return "\n".join(out)

    # 兜底：先输出自身文本，再遍历子元素
    if el.text and el.text.strip():
        out.append(el.text.strip())
        out.append("")
    for c in el:
        if isinstance(c.tag, str):
            blk = block_md(c, id_map, depth + 1)
            if blk.strip():
                out.append(blk)
                out.append("")
    return "\n".join(out)

def migrate(frag_path, out_dir, vol_slug, make_index=False):
    os.makedirs(out_dir, exist_ok=True)
    raw = open(frag_path, encoding="utf-8").read()
    doc = lh.fromstring(raw)
    vol = doc.xpath('//section[contains(@class,"volume")]')
    if not vol:
        print("未找到 volume 区块:", frag_path)
        return
    vol = vol[0]

    # 收集所有 entry id，建立锚点映射
    id_map = {}
    for art in vol.xpath('.//article[contains(@class,"entry")]'):
        aid = art.get("id")
        if aid:
            id_map[aid] = f"{vol_slug}/{aid}"

    # 卷导语（lead）
    lead = vol.xpath('.//p[contains(@class,"lead")]')
    lead_text = inline_md(lead[0], id_map).strip() if lead else ""

    entries = []
    for art in vol.xpath('.//article[contains(@class,"entry")]'):
        aid = art.get("id")
        h3 = art.find('.//h3')
        title = (h3.text or aid) if h3 is not None else aid
        # 生成页面内容
        body_parts = []
        for child in art:
            if isinstance(child.tag, str) and child.tag.lower() in ("h3",):
                continue
            blk = block_md(child, id_map)
            if blk.strip():
                body_parts.append(blk)
        content = "\n".join(body_parts).strip()
        # YAML frontmatter 标题必须加引号：标题含冒号会让 YAML 解析失败、整站构建崩溃
        safe_title = title.replace('"', '\\"')
        md = f"---\ntitle: \"{safe_title}\"\n---\n\n# {title}\n\n{content}\n"
        with open(os.path.join(out_dir, aid + ".md"), "w", encoding="utf-8") as f:
            f.write(md)
        entries.append((aid, title))
        print(f"  ✅ {aid}.md  ({title})")

    if make_index:
        lines = [f"# {vol.get('data-title', vol_slug)}", "", lead_text, "",
                 "## 条目索引", ""]
        lines.append("| 角色 | 页面 |")
        lines.append("|------|------|")
        for aid, title in entries:
            lines.append(f"| {title} | [前往](/{vol_slug}/{aid}) |")
        lines.append("")
        idx = "\n".join(lines)
        with open(os.path.join(out_dir, "index.md"), "w", encoding="utf-8") as f:
            f.write(idx)
        print(f"  ✅ index.md  ({len(entries)} 个角色)")

    return entries

if __name__ == "__main__":
    frag = sys.argv[1]
    out = sys.argv[2]
    slug = sys.argv[3]
    idx = "--index" in sys.argv
    print(f"迁移 {frag} -> {out} (slug={slug}, index={idx})")
    migrate(frag, out, slug, idx)
