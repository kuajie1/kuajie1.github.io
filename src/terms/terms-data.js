// 术语词条数据：供 src/terms/index.md 的 <TermCard> 组件使用。
// 字段：id(英文slug) / name(中文名) / cat(分类) / def(20-60字释义) / link(卷首页路径)
// cat 取值：角色 / 地点 / 魔法 / 歌曲 / 事件 / 物品
// link 一律指向已有卷首页，不编造不存在的子路径。
export default [
  // —— 角色（/vol1-characters/）——
  { id: 'elsa', name: '艾莎', cat: '角色', def: '阿伦黛尔女王，天生拥有冰雪魔法，后成为连接人与自然的「第五灵」。', link: '/vol1-characters/' },
  { id: 'anna', name: '安娜', cat: '角色', def: '阿伦黛尔公主，勇敢热忱，以真爱之举化解姐姐的冰封之心。', link: '/vol1-characters/' },
  { id: 'kristoff', name: '克斯托夫', cat: '角色', def: '山中采冰人，与驯鹿斯文为伴，后成为安娜的伴侣。', link: '/vol1-characters/' },
  { id: 'sven', name: '斯文', cat: '角色', def: '克斯托夫的驯鹿伙伴，通人性、贪吃胡萝卜。', link: '/vol1-characters/' },
  { id: 'olaf', name: '奥拉夫', cat: '角色', def: '艾莎用魔法造出的会说话雪人，怕热却向往夏天。', link: '/vol1-characters/' },
  { id: 'agnarr', name: '安格瑞（国王）', cat: '角色', def: '阿伦黛尔国王，艾莎与安娜之父，寻医途中海难身亡。', link: '/vol1-characters/' },
  { id: 'iduna', name: '伊杜娜（王后）', cat: '角色', def: '艾莎与安娜之母，北境之民，幼年救下安格瑞。', link: '/vol1-characters/' },
  { id: 'pabbie', name: '皮比（大地精）', cat: '角色', def: '北境之民长老法师，曾修改安娜记忆、警示魔法之险。', link: '/vol1-characters/' },
  { id: 'hans', name: '汉斯王子', cat: '角色', def: '南方群岛十三王子，伪装求爱图谋阿伦黛尔王位。', link: '/vol1-characters/' },
  { id: 'weseltongduke', name: '威斯尔顿公爵', cat: '角色', def: '阿伦黛尔邻国公爵，加冕礼上试探并觊觎王国。', link: '/vol1-characters/' },

  // —— 地点（/vol2-world/）——
  { id: 'arendelle', name: '阿伦黛尔', cat: '地点', def: '峡湾畔的王国，故事主要舞台与姐妹的家乡。', link: '/vol2-world/' },
  { id: 'northmountain', name: '北山', cat: '地点', def: '艾莎逃离后筑起冰雪宫殿的雪山。', link: '/vol2-world/' },
  { id: 'enchantedforest', name: '魔法森林', cat: '地点', def: '被浓雾封锁、四大元素守护的神秘森林。', link: '/vol2-world/' },
  { id: 'ahtohallan', name: '阿托哈兰', cat: '地点', def: '深藏暗海的冰川，能记忆一切过往的「河流」。', link: '/vol2-world/' },
  { id: 'icepalace', name: '北方之塔（冰宫）', cat: '地点', def: '艾莎以冰雪在山顶筑起的孤绝宫殿。', link: '/vol2-world/' },
  { id: 'stonevalley', name: '活石谷', cat: '地点', def: '地灵巨岩出没的峡谷，魔法森林屏障之地。', link: '/vol2-world/' },
  { id: 'weselton', name: '韦塞尔顿', cat: '地点', def: '阿伦黛尔邻国，威斯尔顿公爵的领地。', link: '/vol2-world/' },
  { id: 'southernisles', name: '南方群岛', cat: '地点', def: '汉斯王子的故国，由十三位王子共治。', link: '/vol2-world/' },

  // —— 魔法（/vol3-magic/）——
  { id: 'icemagic', name: '冰雪魔法', cat: '魔法', def: '艾莎与生俱来的元素魔法，可造雪、冰与寒风。', link: '/vol3-magic/' },
  { id: 'bruni', name: '火之魔灵（布尼）', cat: '魔法', def: '魔法森林的小小火蜥蜴之灵，象征火元素。', link: '/vol3-magic/' },
  { id: 'gale', name: '风之魔灵（盖尔）', cat: '魔法', def: '无形却调皮的风之灵，以旋风示人。', link: '/vol3-magic/' },
  { id: 'nokk', name: '水之魔灵（水马诺克）', cat: '魔法', def: '暗海形态多变的水之灵，考验闯入者勇气。', link: '/vol3-magic/' },
  { id: 'trolls', name: '地精', cat: '魔法', def: '形似岩石的北境生灵，通魔法、能改记忆。', link: '/vol3-magic/' },
  { id: 'foureelements', name: '四大元素', cat: '魔法', def: '风、火、水、地四种自然之灵，由北境之民守护。', link: '/vol3-magic/' },
  { id: 'memory', name: '记忆与记忆幻象', cat: '魔法', def: '魔法可改记忆，并在阿托哈兰显现过往幻象。', link: '/vol3-magic/' },

  // —— 歌曲（/vol9-songs/）——
  { id: 'letitgo', name: 'Let It Go', cat: '歌曲', def: '标志曲目，艾莎加冕夜释放自我、接纳魔法。', link: '/vol9-songs/' },
  { id: 'forthefirsttime', name: 'For the First Time in Forever', cat: '歌曲', def: '加冕日安娜与艾莎各自心境的对唱。', link: '/vol9-songs/' },
  { id: 'intotheunknown', name: 'Into the Unknown', cat: '歌曲', def: '第二部主题曲，艾莎回应神秘呼唤。', link: '/vol9-songs/' },
  { id: 'showyourself', name: 'Show Yourself', cat: '歌曲', def: '艾莎在阿托哈兰与真相相认的高潮曲目。', link: '/vol9-songs/' },
  { id: 'allisfound', name: 'All Is Found', cat: '歌曲', def: '外婆吟唱的摇篮曲，暗藏北境传说与警示。', link: '/vol9-songs/' },

  // —— 事件（/vol4-plot/）——
  { id: 'coronation', name: '加冕礼', cat: '事件', def: '艾莎继承王位的典礼，也是一切转折的起点。', link: '/vol4-plot/' },
  { id: 'frozencurse', name: '冰雪诅咒', cat: '事件', def: '安娜被冰封，最终以真爱之举化解的诅咒。', link: '/vol4-plot/' },
  { id: 'greatrescue', name: '大搜救', cat: '事件', def: '安娜冒险北上营救姐姐、寻解冰封之法的行动。', link: '/vol4-plot/' },
  { id: 'barrier', name: '魔法森林的屏障', cat: '事件', def: '鲁纳尔德之战后封锁森林的浓雾结界。', link: '/vol4-plot/' },
  { id: 'darksea', name: '暗海', cat: '事件', def: '通往阿托哈兰的凶险海域，由水马诺克守护。', link: '/vol4-plot/' },
  { id: 'offering', name: '元素之灵的献礼', cat: '事件', def: '姐妹化解宿怨、四大元素重归和平的仪式。', link: '/vol4-plot/' },

  // —— 物品（/vol2-world/）——
  { id: 'iceskates', name: '冰鞋', cat: '物品', def: '克斯托夫采冰时穿的带铁刃冰上滑行鞋具。', link: '/vol2-world/' },
  { id: 'scepter', name: '权杖', cat: '物品', def: '象征王权的手杖，加冕礼上由主教授予君主。', link: '/vol2-world/' },
  { id: 'snowflakenecklace', name: '雪花项链（伊杜娜的护身符）', cat: '物品', def: '伊杜娜留下的雪花护身符，承载母亲之爱。', link: '/vol2-world/' },
]
