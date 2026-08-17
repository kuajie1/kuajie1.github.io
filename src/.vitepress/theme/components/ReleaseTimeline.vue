<template>
  <div class="release-tl">
    <div class="rtl-head">
      <span class="rtl-title">现实编年史 · 制作与上映</span>
      <span class="rtl-hint">← 横向滑动 / 点击年份节点切换 →</span>
    </div>
    <div class="rtl-track" ref="track">
      <div class="rtl-rail"></div>
      <button
        v-for="(it, i) in items"
        :key="i"
        class="rtl-dot"
        :class="{ active: i === active, future: it.future }"
        @click="go(i)"
      >
        <span class="rtl-dot-year">{{ it.year }}</span>
      </button>
    </div>
    <transition name="rtl-fade" mode="out-in">
      <div class="rtl-card" :key="active">
        <div class="rtl-card-top">
          <span class="rtl-era" :class="{ future: items[active].future }">{{ items[active].year }}</span>
          <b class="rtl-card-title">{{ items[active].title }}</b>
        </div>
        <p class="rtl-card-desc">{{ items[active].description }}</p>
        <span v-if="items[active].source" class="rtl-source">来源：{{ items[active].source }}</span>
      </div>
    </transition>
    <div class="rtl-nav">
      <button class="rtl-arrow" :disabled="active === 0" @click="go(active - 1)">‹ 上一节点</button>
      <span class="rtl-count">{{ active + 1 }} / {{ items.length }}</span>
      <button class="rtl-arrow" :disabled="active === items.length - 1" @click="go(active + 1)">下一节点 ›</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReleaseTimeline',
  data() {
    return {
      active: 0,
      items: [
        { year: '1844', title: '文学源头', description: '安徒生发表童话《冰雪女王》（The Snow Queen），成为日后一切改编的蓝本。', source: 'Hans Christian Andersen 原著' },
        { year: '1938–2008', title: '迪士尼多次夭折的改编', description: '迪士尼自 1940 年代起数度尝试改编《冰雪女王》，均因「冰雪女王」作为反派难以共情而搁置；2008 年 Chris Buck 提出《Anna and the Snow Queen》提案也未能推进。', source: 'The Art of Disney Frozen' },
        { year: '2011', title: '关键转折', description: '创作团队决定把「冰雪女王」与「格尔达」改写为姐妹 Anna 与 Elsa，故事获得情感内核；项目更名 Frozen，并从传统手绘转向 CG 动画。', source: 'Disney / 制作访谈' },
        { year: '2013-11-27', title: '《Frozen》北美上映', description: '迪士尼第 53 部动画长片，全球票房约 12.8 亿美元，成为 2013 年度冠军并长期保持「影史最卖座动画」。', source: 'Box Office Mojo / Wikipedia' },
        { year: '2014', title: '奥斯卡双奖', description: '第 86 届奥斯卡最佳动画长片＋最佳原创歌曲《Let It Go》；词曲作者 Robert Lopez 由此达成 EGOT。', source: 'The Academy / 第86届奥斯卡' },
        { year: '2015-03-13', title: '《Frozen Fever》', description: '8 分钟剧场短片随《灰姑娘》上映，新歌 Making Today a Perfect Day。', source: 'Disney 官方' },
        { year: '2017-11-22', title: '《Olaf’s Frozen Adventure》', description: '21 分钟节日特辑随《Coco》上映。', source: 'Disney 官方' },
        { year: '2019-11-22', title: '《Frozen II》北美上映', description: '迪士尼第 58 部动画长片，全球票房约 14.5 亿美元；《Into the Unknown》获奥斯卡最佳原创歌曲提名。', source: 'Box Office Mojo / 第92届奥斯卡' },
        { year: '2020', title: '短片与纪录片', description: 'Disney+ 推出《Once Upon a Snowman》《At Home with Olaf》《Olaf Presents》；6 集制作纪录《Into the Unknown: Making Frozen II》上线。', source: 'Disney+' },
        { year: '2023', title: 'Frozen 3 / 4 官宣', description: '迪士尼 CEO Bob Iger 在 2023 财年 Q1 财报会确认 Frozen 3 开发中；11 月于 ABC《Good Morning America》透露 Frozen 4 也可能同步开发中。', source: 'Hollywood Reporter / Variety' },
        { year: '2024-08', title: 'Frozen 3 定档', description: '迪士尼调整档期，Frozen 3 北美上映日定为 2027 年 11 月 24 日（原瞄准 2026-11-25，后推迟一年）。', source: 'The Hollywood Reporter, 2024-08-14' },
        { year: '2027-11-24', title: 'Frozen 3（预计）', description: 'Jennifer Lee 回归执导，Trent Correy 任联合导演（Chris Buck 据报不再回归）；Kristen Bell / Idina Menzel / Josh Gad / Jonathan Groff 确认回归配音。Frozen 4 仅确认开发中，无上映日期。', source: 'Disney / D23 / ScreenRant', future: true },
      ],
    }
  },
  methods: {
    go(i) {
      if (i < 0 || i >= this.items.length) return
      this.active = i
      this.$nextTick(() => {
        const track = this.$refs.track
        if (!track) return
        const dot = track.querySelectorAll('.rtl-dot')[i]
        if (dot) dot.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      })
    },
  },
}
</script>

<style scoped>
.release-tl { margin: 24px 0 8px; border: 1px solid rgba(26, 42, 74, 0.12); border-radius: 16px; padding: 18px 20px; background: rgba(255, 255, 255, 0.72); }
.rtl-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.rtl-title { font-weight: 700; color: var(--deep-ice, #1a2a4a); font-size: 15px; }
.rtl-hint { font-size: 12px; color: #8a93a6; }
.rtl-track { position: relative; display: flex; gap: 10px; overflow-x: auto; padding: 26px 4px 14px; scrollbar-width: thin; }
.rtl-rail { position: absolute; left: 0; right: 0; top: 38px; height: 3px; background: linear-gradient(90deg, var(--aurora-blue, #4aa8ff), var(--aurora-purple, #9b6dff)); opacity: 0.35; border-radius: 2px; }
.rtl-dot { position: relative; flex: 0 0 auto; min-width: 70px; padding: 9px 14px; border-radius: 999px; border: 1px solid rgba(26, 42, 74, 0.2); background: #fff; cursor: pointer; font-family: inherit; color: var(--deep-ice, #1a2a4a); transition: all 0.2s; }
.rtl-dot-year { font-size: 13px; white-space: nowrap; }
.rtl-dot.active { background: linear-gradient(135deg, var(--aurora-blue, #4aa8ff), var(--aurora-purple, #9b6dff)); color: #fff; border-color: transparent; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(74, 168, 255, 0.35); }
.rtl-dot.future { border-style: dashed; }
.rtl-dot.future.active { background: linear-gradient(135deg, var(--aurora-green, #36c98a), var(--aurora-blue, #4aa8ff)); }
.rtl-card { border-top: 2px solid rgba(74, 168, 255, 0.25); padding-top: 14px; min-height: 120px; }
.rtl-card-top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.rtl-era { display: inline-block; font-size: 12px; color: #fff; background: var(--aurora-green, #36c98a); border-radius: 8px; padding: 3px 11px; }
.rtl-era.future { background: var(--aurora-purple, #9b6dff); }
.rtl-card-title { font-size: 16px; color: var(--deep-ice, #1a2a4a); }
.rtl-card-desc { margin: 10px 0 6px; color: #4a5160; line-height: 1.7; }
.rtl-source { font-size: 12px; color: #8a93a6; }
.rtl-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; }
.rtl-arrow { border: 1px solid rgba(26, 42, 74, 0.2); background: #fff; color: var(--deep-ice, #1a2a4a); border-radius: 8px; padding: 6px 12px; cursor: pointer; font-family: inherit; font-size: 13px; transition: all 0.2s; }
.rtl-arrow:disabled { opacity: 0.4; cursor: not-allowed; }
.rtl-arrow:not(:disabled):hover { background: var(--aurora-blue, #4aa8ff); color: #fff; border-color: transparent; }
.rtl-count { font-size: 13px; color: #8a93a6; }
.rtl-fade-enter-active, .rtl-fade-leave-active { transition: opacity 0.22s ease; }
.rtl-fade-enter-from, .rtl-fade-leave-to { opacity: 0; }
</style>
