// 小说相关词条字典：用于阅读器自动识别文中出现的人物/地点，并提供定位与百科跳转。
// names 同时含中英文别名；匹配时按名称长度降序，优先匹配更长的词，避免子串误伤。
// path 为对应百科页（无独立页者指向聚合页或置空）。

export const TERM_LIST = [
  { key: 'elsa', label: '艾莎 Elsa', path: '/vol1-characters/elsa/', names: ['Elsa', '艾莎', 'Snow Queen', '冰雪女王'] },
  { key: 'anna', label: '安娜 Anna', path: '/vol1-characters/anna/', names: ['Anna', '安娜'] },
  { key: 'olaf', label: '雪宝 Olaf', path: '/vol1-characters/olaf/', names: ['Olaf', '雪宝'] },
  { key: 'kristoff', label: '克里斯托夫 Kristoff', path: '/vol1-characters/kristoff/', names: ['Kristoff', '克里斯托夫'] },
  { key: 'sven', label: '斯文 Sven', path: '/vol1-characters/sven/', names: ['Sven', '斯文'] },
  { key: 'hans', label: '汉斯 Hans', path: '/vol1-characters/hans/', names: ['Hans', '汉斯'] },
  { key: 'iduna', label: '伊杜娜 Iduna', path: '/vol1-characters/iduna-agnarr/', names: ['Iduna', '伊杜娜'] },
  { key: 'agnarr', label: '阿格纳尔 Agnarr', path: '/vol1-characters/iduna-agnarr/', names: ['Agnarr', '阿格纳尔'] },
  { key: 'grandpabbie', label: '大帕比 Grand Pabbie', path: '/vol1-characters/grand-pabbie/', names: ['Grand Pabbie', 'Pabbie', '大帕比', '帕比'] },
  { key: 'bruni', label: '布鲁尼 Bruni', path: '/vol1-characters/bruni/', names: ['Bruni', '布鲁尼'] },
  { key: 'gale', label: '盖尔 Gale', path: '/vol1-characters/gale/', names: ['Gale', '盖尔'] },
  { key: 'nokk', label: '诺克 Nokk', path: '/vol1-characters/nokk/', names: ['Nokk', '诺克', '水马'] },
  { key: 'earthgiants', label: '地巨灵 Earth Giants', path: '/vol1-characters/earth-giants/', names: ['Earth Giants', '地巨灵'] },
  { key: 'fifthspirit', label: '第五灵 Fifth Spirit', path: '/vol1-characters/fifth-spirit/', names: ['Fifth Spirit', '第五灵'] },
  { key: 'mattias', label: '马蒂亚斯 Mattias', path: '/vol1-characters/mattias/', names: ['Mattias', '马蒂亚斯'] },
  { key: 'runeard', label: '鲁内哈德 Runeard', path: '/vol1-characters/runeard/', names: ['Runeard', '鲁内哈德'] },
  { key: 'weselton', label: '威斯顿 Weselton', path: '/vol1-characters/weselton-duke/', names: ['Weselton', '威斯顿', '威斯尔顿'] },
  { key: 'northuldra', label: '北境民族 Northuldra', path: '/vol1-characters/northuldra/', names: ['Northuldra', '北境民族', 'Honeymaren', 'Ryder', 'Yelana', '叶拉娜', '蜂蜜玛琳', '赖德'] },
  { key: 'arendelle', label: '阿伦黛尔 Arendelle', path: '/vol2-world/arendelle/', names: ['Arendelle', '阿伦黛尔'] },
  { key: 'enchantedforest', label: '魔法森林 Enchanted Forest', path: '/vol2-world/enchanted-forest/', names: ['Enchanted Forest', '魔法森林'] },
  { key: 'ahtohallan', label: '阿塔霍兰 Ahtohallan', path: '/vol2-world/ahtohallan/', names: ['Ahtohallan', '阿塔霍兰'] },
  { key: 'darksea', label: '暗海 Dark Sea', path: '/vol2-world/dark-sea/', names: ['Dark Sea', '暗海'] },
  { key: 'northmountain', label: '北山 North Mountain', path: '/vol2-world/other-locations/', names: ['North Mountain', '北山'] },
  { key: 'icepalace', label: '冰宫 Ice Palace', path: '/vol2-world/other-locations/', names: ['Ice Palace', '冰宫'] },
  { key: 'oaken', label: '奥肯 Oaken', path: '/vol2-world/other-locations/', names: ['Oaken', '奥肯'] },
  { key: 'trolls', label: '巨魔 Trolls', path: '/vol1-characters/grand-pabbie/', names: ['trolls', 'Trolls', '巨魔', '山精'] },
  { key: 'marshmallow', label: '棉花糖 Marshmallow', path: '/vol2-world/other-locations/', names: ['Marshmallow', '棉花糖'] },
]
