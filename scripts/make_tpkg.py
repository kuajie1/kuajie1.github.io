# -*- coding: utf-8 -*-
"""生成翻译工作包：把待译章节的英文逐句抽出，按 agent 分批写成输入文件。"""
import json, os

ND = "D:/学习资料/frozen/frozen-encyclopedia-vitepress/src/.vitepress/novel-data"
OUT = "D:/学习资料/frozen/frozen-encyclopedia-vitepress/scripts/tpkg"
os.makedirs(OUT, exist_ok=True)

# (agent名, book, [章节范围])
PACKAGES = [
    ("jr_a", "junior",  list(range(8, 11))),
    ("jr_b", "junior",  list(range(11, 14))),
    ("jr_c", "junior",  list(range(14, 17))),
    ("jr_d", "junior",  list(range(17, 20))),
    ("jr_e", "junior",  list(range(20, 24))),
    ("j2_a", "junior2", list(range(0, 3))),
    ("j2_b", "junior2", list(range(3, 6))),
    ("j2_c", "junior2", list(range(6, 9))),
    ("j2_d", "junior2", list(range(9, 12))),
    ("j2_e", "junior2", list(range(12, 14))),
]

GLOSSARY = {
    "junior": """角色/地名译名表（必须严格遵循）：
- Elsa = 艾莎
- Anna = 安娜
- Olaf = 雪宝
- Kristoff = 克斯托夫
- Sven = 斯特（驯鹿）
- Hans = 汉斯王子
- Marshmallow = 棉花糖（雪怪）
- Arendelle = 阿伦黛尔
- Duke of Weselton = 韦斯特顿公爵
- King Agnarr = 阿格纳尔国王
- Queen Iduna = 伊杜娜王后
- Grand Pabbie = 帕比长老（地精长老）
- The Snow Queen = 冰雪女王
- troll = 地精""",
    "junior2": """角色/地名译名表（必须严格遵循）：
- Elsa = 艾莎
- Anna = 安娜
- Olaf = 雪宝
- Kristoff = 克斯托夫
- Sven = 斯特（驯鹿）
- Arendelle = 阿伦黛尔
- Northuldra = 北乌兰德拉（部落）
- Ahtohallan = 阿托哈兰（冰川）
- Enchanted Forest = 魔法森林
- Bruni = 布鲁尼（火灵蜥蜴）
- Gale = 盖尔（风灵）
- Nokk = 诺克（水灵马）
- Earth Giants = 地灵巨人
- Yelana = 耶拉娜
- Ryder = 莱德
- Honeymaren = 霍尼玛伦
- Lieutenant Matthias = 马蒂亚斯中尉
- King Runeard = 鲁纳德国王
- Queen Iduna = 伊杜娜王后
- King Agnarr = 阿格纳尔国王
- spirit = 精灵/灵（视语境）
- the fifth spirit = 第五个元素/第五精灵""",
}

for name, book, rng in PACKAGES:
    d = json.load(open(os.path.join(ND, book + ".json"), encoding="utf-8"))
    chapters = {}
    for i in rng:
        sents = d["chapters"][i]["sentences"]
        en = [(s.get("en") or "").strip() for s in sents]
        chapters[str(i)] = en
    pkg = {
        "book": book,
        "title_hint": d["chapters"][rng[0]].get("title", ""),
        "glossary": GLOSSARY[book],
        "chapters": chapters,
    }
    path = os.path.join(OUT, name + ".json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(pkg, f, ensure_ascii=False, indent=1)
    n = sum(len(v) for v in chapters.values())
    print(f"{name:6s} {book:8s} 章{rng[0]}-{rng[-1]} 句数={n} -> {path}")
