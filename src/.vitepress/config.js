import { defineConfig } from 'vitepress'

// 站点配置。内容卷（vol1~vol10、terms）按规划路径放置。
// 侧边栏按"卷 → 主题子分组 → 页面"三级组织，子分组可展开/折叠。
export default defineConfig({
  title: '❄ 冰雪奇缘百科全书',
  description: '《冰雪奇缘》完整设定库 | 角色 · 世界观 · 魔法 · 剧情 · 歌曲 · 小说',
  lang: 'zh-CN',
  appearance: true, // 亮色/暗色切换
  lastUpdated: true,
  // 迁移进行中：大量跨页锚点/未建页面会暂时死链，先放行，全部迁完再收紧
  ignoreDeadLinks: true,

  // 字体（离线自动回退到系统衬线，不影响构建）
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    // 国内可访问优化：Google Fonts 在中国大陆被墙/极慢，改为非阻塞加载。
    // 加载失败时自动回退到系统衬线（Songti SC / serif），不影响首屏渲染。
    ['link', {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;900&family=Playfair+Display:wght@700;900&display=swap',
      media: 'print',
      onload: "this.media='all'",
    }],
  ],

  themeConfig: {
    logo: '/images/favicon.png',

    nav: [
      { text: '首页', link: '/' },
      { text: '角色', link: '/vol1-characters/' },
      { text: '世界观', link: '/vol2-world/' },
      { text: '魔法', link: '/vol3-magic/' },
      { text: '剧情', link: '/vol4-plot/' },
      { text: '主题', link: '/vol5-themes/' },
      { text: '时间线', link: '/vol6-timeline/' },
      { text: '制作', link: '/vol7-production/' },
      { text: '文化', link: '/vol8-culture/' },
      { text: '歌曲', link: '/vol9-songs/' },
      { text: '小说', link: '/vol10-novels/' },
      { text: '术语', link: '/terms/' },
    ],

    sidebar: {
      '/vol1-characters/': [
        {
          text: '第一卷 · 角色档案',
          items: [
            { text: '卷首页', link: '/vol1-characters/' },
            {
              text: '🌟 核心主角',
              items: [
                { text: '艾莎 Elsa', link: '/vol1-characters/elsa' },
                { text: '安娜 Anna', link: '/vol1-characters/anna' },
                { text: '克里斯托夫 Kristoff', link: '/vol1-characters/kristoff' },
                { text: '斯文 Sven', link: '/vol1-characters/sven' },
                { text: '雪宝 Olaf', link: '/vol1-characters/olaf' },
              ],
            },
            {
              text: '👑 王室 · 家族 · 反派',
              items: [
                { text: '伊杜娜与阿格纳', link: '/vol1-characters/iduna-agnarr' },
                { text: '鲁内尔德国王', link: '/vol1-characters/runeard' },
                { text: '汉斯 Hans', link: '/vol1-characters/hans' },
                { text: '威斯顿公爵', link: '/vol1-characters/weselton-duke' },
                { text: '马蒂亚斯将军', link: '/vol1-characters/mattias' },
              ],
            },
            {
              text: '🌿 自然之灵与族群',
              items: [
                { text: '北境民族', link: '/vol1-characters/northuldra' },
                { text: '大帕比与山精', link: '/vol1-characters/grand-pabbie' },
                { text: '水马诺克 Nokk', link: '/vol1-characters/nokk' },
                { text: '火灵布鲁尼 Bruni', link: '/vol1-characters/bruni' },
                { text: '风灵盖尔 Gale', link: '/vol1-characters/gale' },
                { text: '地巨灵', link: '/vol1-characters/earth-giants' },
                { text: '第五灵', link: '/vol1-characters/fifth-spirit' },
              ],
            },
          ],
        },
      ],
      '/vol2-world/': [
        { text: '第二卷 · 世界观与地理', items: [{ text: '卷首页', link: '/vol2-world/' }] },
      ],
      '/vol3-magic/': [
        {
          text: '第三卷 · 魔法体系',
          items: [
            { text: '卷首页', link: '/vol3-magic/' },
            { text: '★ 魔法体系总论（导读）', link: '/vol3-magic/magic-overview' },
            {
              text: '❄️ 艾莎的魔法',
              items: [
                { text: '魔法的本质与来源', link: '/vol3-magic/elsa-ice-nature' },
                { text: '魔法的演变：从失控到掌控', link: '/vol3-magic/elsa-ice-evolution' },
                { text: '极限与代价', link: '/vol3-magic/elsa-ice-limits' },
              ],
            },
            {
              text: '🔥 元素之灵',
              items: [
                { text: '四大元素之灵', link: '/vol3-magic/spirit-quartet' },
                { text: '第五灵：连接一切的桥', link: '/vol3-magic/fifth-spirit' },
                { text: '元素之灵层级与第五灵桥梁', link: '/vol3-magic/spirit-mermaid' },
                { text: '恐惧是敌人', link: '/vol3-magic/fear-enemy' },
              ],
            },
            {
              text: '🔑 信条与主题魔法',
              items: [
                { text: '爱是钥匙', link: '/vol3-magic/love-key' },
                { text: '信条 "Conceal, Don’t Feel" 的演变', link: '/vol3-magic/conceal-dont-feel' },
                { text: '水有记忆', link: '/vol3-magic/water-memory' },
                { text: '阿塔霍兰的记忆规则', link: '/vol3-magic/ahtohallan' },
                { text: '深入过甚的代价', link: '/vol3-magic/too-deep' },
              ],
            },
            {
              text: '🪨 巨魔的魔法',
              items: [
                { text: '巨魔的魔法能力', link: '/vol3-magic/troll-magic' },
                { text: '治愈、记忆修改与预言的规则', link: '/vol3-magic/troll-rules' },
              ],
            },
            {
              text: '⚖️ 体系对比',
              items: [
                { text: '三大魔法体系的对比', link: '/vol3-magic/magic-systems-compare' },
                { text: '互动、互补与冲突', link: '/vol3-magic/magic-conflict' },
              ],
            },
          ],
        },
      ],
      '/vol4-plot/': [
        {
          text: '第四卷 · 剧情脉络与逻辑复盘',
          items: [
            { text: '卷首页', link: '/vol4-plot/' },
            {
              text: '🎬 正传事件序',
              items: [
                { text: '《冰雪奇缘》(2013) 正传事件序', link: '/vol4-plot/vol4-ch1-timeline' },
                { text: '《冰雪奇缘2》(2019) 正传事件序', link: '/vol4-plot/vol4-ch2-timeline' },
              ],
            },
            {
              text: '📚 前传与外传补遗',
              items: [
                { text: '伊杜娜与阿格纳的一生', link: '/vol4-plot/vol4-ch3-dangerous' },
                { text: '《森林阴影》补遗', link: '/vol4-plot/vol4-ch3-forest' },
                { text: '短片、小说与跨媒介定位', link: '/vol4-plot/vol4-ch4-derivatives' },
              ],
            },
            {
              text: '🔍 设定考据十一问',
              items: [
                { text: '① 水坝年代：34 年 vs 近 50 年', link: '/vol4-plot/vol4-ch5-dam' },
                { text: '② "巨魔诅咒让姐妹分离"', link: '/vol4-plot/vol4-ch5-curse' },
                { text: '③ 伊杜娜是否拥有魔法', link: '/vol4-plot/vol4-ch5-iduna' },
                { text: '④ 安娜身世：城堡 vs 寄养', link: '/vol4-plot/vol4-ch5-anna' },
                { text: '⑤ Olaf 诞生时间', link: '/vol4-plot/vol4-ch5-olaf' },
                { text: '⑥ Nattmara 来源', link: '/vol4-plot/vol4-ch5-nattmara' },
                { text: '⑦ Runeard 建坝动机与死因', link: '/vol4-plot/vol4-ch5-runeard' },
                { text: '⑧ "Conceal, don’t feel" 出处三说', link: '/vol4-plot/vol4-ch5-conceal' },
                { text: '⑨ Mattias 被困时长', link: '/vol4-plot/vol4-ch5-mattias' },
                { text: '⑩ Rita 身世', link: '/vol4-plot/vol4-ch5-rita' },
                { text: '⑪ 《All Is Found》时间错位', link: '/vol4-plot/vol4-ch5-timeslip' },
              ],
            },
          ],
        },
      ],
      '/vol5-themes/': [
        {
          text: '第五卷 · 主题与隐喻',
          items: [
            { text: '卷首页', link: '/vol5-themes/' },
            {
              text: '🤝 姐妹羁绊',
              items: [
                { text: '超越分离与误解的姐妹羁绊', link: '/vol5-themes/vol5-ch1-bond' },
                { text: '"彼此是黑暗中的光"', link: '/vol5-themes/vol5-ch1-light' },
              ],
            },
            {
              text: '🦋 自我与接纳',
              items: [
                { text: '从"隐藏自我"到"let it go"', link: '/vol5-themes/vol5-ch2-conceal' },
                { text: '"你不必完美"', link: '/vol5-themes/vol5-ch2-imperfect' },
              ],
            },
            {
              text: '🌲 自然与生态',
              items: [
                { text: '自然之灵即自然本身', link: '/vol5-themes/vol5-ch3-nature' },
                { text: '水坝：人类贪婪对自然的掠夺', link: '/vol5-themes/vol5-ch3-dam' },
                { text: '理解而非猎杀', link: '/vol5-themes/vol5-ch3-understand' },
              ],
            },
            {
              text: '💧 记忆与真相',
              items: [
                { text: '水有记忆，阿塔霍兰是记忆本身', link: '/vol5-themes/vol5-ch4-water' },
                { text: '被窃取/篡改的记忆 = 被抹去的历史', link: '/vol5-themes/vol5-ch4-draugr' },
                { text: '密室与真相的回归', link: '/vol5-themes/vol5-ch4-secret' },
              ],
            },
            {
              text: '💗 爱 vs 恐惧',
              items: [
                { text: '"爱比恐惧更强"', link: '/vol5-themes/vol5-ch5-love' },
                { text: '恐惧是爱的影子', link: '/vol5-themes/vol5-ch5-nattmara' },
                { text: '魔法的两极开关：恐惧 vs 爱', link: '/vol5-themes/vol5-ch5-dual' },
              ],
            },
            {
              text: '❄️ 冰雪的双重象征',
              items: [
                { text: '冰雪 = 隔离', link: '/vol5-themes/vol5-ch6-isolate' },
                { text: '冰雪 = 连接', link: '/vol5-themes/vol5-ch6-connect' },
                { text: '双重象征的统一', link: '/vol5-themes/vol5-ch6-dual' },
              ],
            },
          ],
        },
      ],
      '/vol6-timeline/': [
        { text: '第六卷 · 时间线', items: [{ text: '卷首页', link: '/vol6-timeline/' }] },
      ],
      '/vol7-production/': [
        {
          text: '第七卷 · 制作幕后',
          items: [
            { text: '卷首页', link: '/vol7-production/' },
            {
              text: '📖 官方设定集',
              items: [
                { text: '《The Art of Disney Frozen》', link: '/vol7-production/vol7-ch2-artbook1' },
                { text: '《The Art of Frozen II》', link: '/vol7-production/vol7-ch2-artbook2' },
                { text: '《Frozen 2: The Official Movie Special》', link: '/vol7-production/vol7-ch2-special' },
              ],
            },
            {
              text: '🎞️ 衍生短片',
              items: [
                { text: 'Frozen Fever（2015）', link: '/vol7-production/vol7-ch3-fever' },
                { text: 'Olaf’s Frozen Adventure（2017）', link: '/vol7-production/vol7-ch3-olafadv' },
                { text: 'Myth: A Frozen Tale（2019/2020）', link: '/vol7-production/vol7-ch3-myth' },
                { text: 'Once Upon a Snowman（2020）', link: '/vol7-production/vol7-ch3-snowman' },
                { text: 'At Home with Olaf（2020）', link: '/vol7-production/vol7-ch3-athome' },
                { text: 'Olaf Presents（2021）', link: '/vol7-production/vol7-ch3-presents' },
              ],
            },
            {
              text: '📊 数据与团队',
              items: [
                { text: '票房与获奖', link: '/vol7-production/vol7-ch4-boxoffice' },
                { text: '主创团队与配音阵容', link: '/vol7-production/vol7-ch5-team' },
              ],
            },
          ],
        },
      ],
      '/vol8-culture/': [
        {
          text: '第八卷 · 文化影响',
          items: [
            { text: '卷首页', link: '/vol8-culture/' },
            { text: '文化影响与现象', link: '/vol8-culture/vol8-ch1-impact' },
          ],
        },
      ],
      '/vol9-songs/': [
        {
          text: '第九卷 · 歌曲卷',
          items: [
            { text: '卷首页', link: '/vol9-songs/' },
            {
              text: '🎵 《冰雪奇缘1》歌曲',
              items: [
                { text: 'Frozen Heart', link: '/vol9-songs/song-frozen-heart' },
                { text: 'Vuelie', link: '/vol9-songs/song-vuelie' },
                { text: 'Do You Want to Build a Snowman?', link: '/vol9-songs/song-snowman' },
                { text: 'For the First Time in Forever', link: '/vol9-songs/song-first-time' },
                { text: 'Love Is an Open Door', link: '/vol9-songs/song-open-door' },
                { text: 'Let It Go', link: '/vol9-songs/song-let-it-go' },
                { text: 'Reindeer(s) Are Better Than People', link: '/vol9-songs/song-reindeer' },
                { text: 'In Summer', link: '/vol9-songs/song-in-summer' },
                { text: 'Fixer Upper', link: '/vol9-songs/song-fixer-upper' },
              ],
            },
            {
              text: '🎵 《冰雪奇缘2》歌曲',
              items: [
                { text: 'All Is Found', link: '/vol9-songs/song-all-is-found' },
                { text: 'Some Things Never Change', link: '/vol9-songs/song-never-change' },
                { text: 'Into the Unknown', link: '/vol9-songs/song-into-the-unknown' },
                { text: 'When I Am Older', link: '/vol9-songs/song-when-older' },
                { text: 'Lost in the Woods', link: '/vol9-songs/song-lost-in-the-woods' },
                { text: 'Show Yourself', link: '/vol9-songs/song-show-yourself' },
                { text: 'The Next Right Thing', link: '/vol9-songs/song-next-right-thing' },
              ],
            },
            {
              text: '🗺️ 歌词考据与角色地图',
              items: [
                { text: '歌词短句考据', link: '/vol9-songs/all-is-found-lyric' },
                { text: '与阿塔霍兰的互文', link: '/vol9-songs/all-is-found-ahtohallan' },
                { text: '艾莎：从释放到寻真', link: '/vol9-songs/map-elsa' },
                { text: '安娜：连接、纽带与行动', link: '/vol9-songs/map-anna' },
                { text: '雪宝：天真与温暖的投射', link: '/vol9-songs/map-olaf' },
              ],
            },
          ],
        },
      ],
      '/vol10-novels/': [
        {
          text: '第十卷 · 小说衍生宇宙',
          items: [
            { text: '卷首页', link: '/vol10-novels/' },
            {
              text: '📕 《冰雪奇缘1》衍生',
              items: [
                {
                  text: 'Frozen Junior Novel',
                  items: [
                    { text: '介绍与梗概', link: '/vol10-novels/junior-intro' },
                    { text: '全文阅读（附录）', link: '/vol10-novels/junior' },
                  ],
                },
                {
                  text: 'Dangerous Secrets',
                  items: [
                    { text: '介绍与梗概', link: '/vol10-novels/dangerous-intro' },
                    { text: '全文阅读（附录）', link: '/vol10-novels/dangerous' },
                  ],
                },
                {
                  text: 'Conceal, Don’t Feel',
                  items: [
                    { text: '介绍与梗概', link: '/vol10-novels/conceal-intro' },
                    { text: '全文阅读（附录）', link: '/vol10-novels/conceal' },
                  ],
                },
              ],
            },
            {
              text: '📗 《冰雪奇缘2》衍生',
              items: [
                {
                  text: 'Frozen 2 Deluxe Junior',
                  items: [
                    { text: '介绍与梗概', link: '/vol10-novels/junior2-intro' },
                    { text: '全文阅读（附录）', link: '/vol10-novels/junior2' },
                  ],
                },
                {
                  text: 'Forest of Shadows',
                  items: [
                    { text: '介绍与梗概', link: '/vol10-novels/forest-intro' },
                    { text: '全文阅读（附录）', link: '/vol10-novels/forest' },
                  ],
                },
                {
                  text: 'Polar Nights',
                  items: [
                    { text: '介绍与梗概', link: '/vol10-novels/polar-intro' },
                    { text: '全文阅读（附录）', link: '/vol10-novels/polar' },
                  ],
                },
                {
                  text: 'All Is Found',
                  items: [
                    { text: '介绍与梗概', link: '/vol10-novels/allfound-intro' },
                    { text: '全文阅读（附录）', link: '/vol10-novels/allfound' },
                  ],
                },
              ],
            },
          ],
        },
      ],
      '/terms/': [
        { text: '术语索引', items: [{ text: '所有术语', link: '/terms/' }] },
      ],
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: '搜索',
          placeholder: '搜索角色、地点、设定...',
        },
      },
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/' },
    ],

    footer: {
      message: '❄ 冰雪奇缘百科全书 · 非官方粉丝项目',
      copyright: 'Disney © 2026',
    },
  },
})
