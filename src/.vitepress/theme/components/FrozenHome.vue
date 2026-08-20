<script setup>
/**
 * FrozenHome —— 自定义极光探索地图首页（替代 VitePress 默认 home）
 *  - 极光 Hero：衬线大标题渐变 + 柔光 + 探索按钮
 *  - 十卷探索地图：可交互卡片网格，hover/聚焦高亮，点击进入对应卷
 *  - 尊重 prefers-reduced-motion；移动端单列；键盘可聚焦
 */
import { useRouter } from 'vitepress'

const router = useRouter()

const volumes = [
  { no: '01', icon: '👤', title: '角色档案', desc: '艾莎、安娜、雪宝等完整人物设定', link: '/vol1-characters/' },
  { no: '02', icon: '🌍', title: '世界观', desc: '阿伦黛尔、魔法森林、阿塔霍兰全地图', link: '/vol2-world/' },
  { no: '03', icon: '✨', title: '魔法体系', desc: '冰雪魔法、四大元素与第五灵详解', link: '/vol3-magic/' },
  { no: '04', icon: '📜', title: '剧情脉络', desc: '正传事件序与设定考据十一问', link: '/vol4-plot/' },
  { no: '05', icon: '💠', title: '主题隐喻', desc: '姐妹羁绊、自我接纳与爱vs恐惧', link: '/vol5-themes/' },
  { no: '06', icon: '🕰️', title: '时间线', desc: '从传说到续作的关键时间节点', link: '/vol6-timeline/' },
  { no: '07', icon: '🎬', title: '制作幕后', desc: '官方设定集、短片与票房团队', link: '/vol7-production/' },
  { no: '08', icon: '🌐', title: '文化影响', desc: '全球现象级 IP 的影响力考据', link: '/vol8-culture/' },
  { no: '09', icon: '🎵', title: '歌曲大全', desc: '电影原声 + 中英歌词对照', link: '/vol9-songs/' },
  { no: '10', icon: '📚', title: '小说宇宙', desc: '7 本官方小说原文与中文翻译', link: '/vol10-novels/' },
]

function go(link) {
  router.go(link)
}
</script>

<template>
  <div class="fh">
    <!-- 极光 Hero -->
    <header class="fh-hero">
      <div class="fh-hero-glow" aria-hidden="true"></div>
      <div class="fh-hero-inner">
        <p class="fh-kicker">❄ FROZEN ENCYCLOPEDIA</p>
        <h1 class="fh-title">冰雪奇缘百科全书</h1>
        <p class="fh-sub">完整设定库 · 角色 · 世界观 · 魔法 · 剧情 · 歌曲 · 小说</p>
        <div class="fh-actions">
          <button class="fh-btn fh-btn-primary" type="button" @click="go('/vol1-characters/')">
            探索角色 →
          </button>
          <button class="fh-btn fh-btn-ghost" type="button" @click="go('/vol10-novels/')">
            阅读小说
          </button>
        </div>
      </div>
    </header>

    <!-- 十卷探索地图 -->
    <section class="fh-map" aria-label="十卷探索地图">
      <h2 class="fh-map-title">十卷探索地图</h2>
      <div class="fh-grid">
        <button
          v-for="v in volumes"
          :key="v.no"
          class="fh-card"
          type="button"
          :aria-label="`第${v.no}卷 ${v.title}`"
          @click="go(v.link)"
        >
          <span class="fh-card-snow" aria-hidden="true">❄</span>
          <span class="fh-card-no" aria-hidden="true">{{ v.no }}</span>
          <span class="fh-card-icon" aria-hidden="true">{{ v.icon }}</span>
          <span class="fh-card-title">{{ v.title }}</span>
          <span class="fh-card-desc">{{ v.desc }}</span>
          <span class="fh-card-go" aria-hidden="true">进入 →</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.fh { max-width: 1100px; margin: 0 auto; padding: 0 24px 40px; }

/* Hero */
.fh-hero {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  margin: 24px 0 36px;
  padding: 64px 40px 72px;
  background:
    radial-gradient(60% 80% at 20% 10%, rgba(74, 227, 181, 0.22), transparent 70%),
    radial-gradient(60% 80% at 85% 20%, rgba(179, 136, 255, 0.22), transparent 70%),
    linear-gradient(160deg, rgba(100, 181, 246, 0.16), rgba(255, 128, 171, 0.10));
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 18px 50px rgba(26, 51, 92, 0.14);
  backdrop-filter: blur(10px);
}
.dark .fh-hero { background:
    radial-gradient(60% 80% at 20% 10%, rgba(74, 227, 181, 0.18), transparent 70%),
    radial-gradient(60% 80% at 85% 20%, rgba(179, 136, 255, 0.18), transparent 70%),
    linear-gradient(160deg, rgba(100, 181, 246, 0.18), rgba(255, 128, 171, 0.10));
  border-color: rgba(255, 255, 255, 0.1); }
.fh-hero-glow {
  position: absolute; inset: -20%;
  background:
    radial-gradient(40% 50% at 30% 40%, rgba(100, 181, 246, 0.30), transparent 70%),
    radial-gradient(40% 50% at 70% 65%, rgba(179, 136, 255, 0.26), transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  animation: fh-breathe 9s ease-in-out infinite;
}
@keyframes fh-breathe { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
.dark .fh-hero-glow { animation: none; opacity: 0.85; }
.fh-hero-inner { position: relative; z-index: 1; text-align: center; }
.fh-kicker {
  margin: 0 0 10px;
  font-size: 0.8rem;
  letter-spacing: 0.32em;
  color: var(--fz-aurora-blue, #4f9fe0);
  font-weight: 700;
}
.fh-title {
  margin: 0;
  font-family: 'Playfair Display', 'Noto Serif SC', 'Songti SC', Georgia, serif;
  font-size: 3.2rem;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 1px;
  background: linear-gradient(120deg, var(--fz-aurora-blue, #4f9fe0), var(--fz-aurora-purple, #b388ff) 55%, var(--fz-aurora-pink, #ff80ab));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  filter: drop-shadow(0 6px 22px rgba(100, 181, 246, 0.35));
}
.fh-sub { margin: 14px 0 0; color: var(--vp-c-text-2); font-size: 1.1rem; }
.fh-actions { margin-top: 28px; display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.fh-btn {
  border-radius: 999px;
  padding: 12px 28px;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.fh-btn:focus-visible { outline: 3px solid var(--fz-aurora-purple, #b388ff); outline-offset: 3px; }
.fh-btn-primary { background: linear-gradient(120deg, var(--fz-aurora-blue, #4f9fe0), var(--fz-aurora-purple, #b388ff)); color: #fff; box-shadow: 0 8px 24px rgba(79, 159, 224, 0.35); }
.fh-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 14px 34px rgba(79, 159, 224, 0.45); }
.fh-btn-ghost { background: rgba(255, 255, 255, 0.6); border-color: rgba(79, 159, 224, 0.35); color: var(--fz-deep-ice, #16335c); }
.dark .fh-btn-ghost { background: rgba(20, 35, 63, 0.7); color: #e8eefb; border-color: rgba(120, 190, 255, 0.3); }
.fh-btn-ghost:hover { transform: translateY(-3px); }

/* 地图网格 */
.fh-map-title {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--fz-deep-ice, #16335c);
  text-align: center;
  margin: 0 0 8px;
}
.dark .fh-map-title { color: #e8eefb; }
.fh-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
  margin-top: 22px;
}
.fh-card {
  position: relative;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 22px 22px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 30px rgba(26, 51, 92, 0.10);
  backdrop-filter: blur(10px);
  cursor: pointer;
  overflow: hidden;
  font-family: inherit;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.dark .fh-card { background: rgba(20, 35, 63, 0.82); border-color: rgba(255, 255, 255, 0.08); }
.fh-card:focus-visible { outline: 3px solid var(--fz-aurora-purple, #b388ff); outline-offset: 3px; }
.fh-card:hover { transform: translateY(-6px); box-shadow: 0 18px 44px rgba(79, 159, 224, 0.22); border-color: var(--fz-aurora-green, #4ae3b5); }
.fh-card-snow { position: absolute; top: 10px; right: 14px; font-size: 1.2rem; color: var(--fz-aurora-blue, #4f9fe0); opacity: 0.25; }
.fh-card-no { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; color: var(--fz-aurora-purple, #b388ff); }
.fh-card-icon { font-size: 1.9rem; margin: 2px 0; }
.fh-card-title { font-family: 'Noto Serif SC', 'Songti SC', serif; font-size: 1.15rem; font-weight: 700; color: var(--fz-deep-ice, #16335c); }
.dark .fh-card-title { color: #e8eefb; }
.fh-card-desc { font-size: 0.86rem; line-height: 1.5; color: var(--vp-c-text-2); }
.fh-card-go { margin-top: 6px; font-size: 0.82rem; font-weight: 600; color: var(--fz-aurora-blue, #4f9fe0); opacity: 0; transform: translateX(-6px); transition: opacity 0.2s ease, transform 0.2s ease; }
.fh-card:hover .fh-card-go, .fh-card:focus-visible .fh-card-go { opacity: 1; transform: translateX(0); }

/* 移动端 */
@media (max-width: 768px) {
  .fh { padding: 0 14px 80px; }
  .fh-hero { padding: 44px 22px 48px; border-radius: 18px; }
  .fh-title { font-size: 2.1rem; }
  .fh-sub { font-size: 0.95rem; }
  .fh-grid { grid-template-columns: 1fr; }
  /* 毛玻璃移动端降级 */
  .fh-hero, .fh-card { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
  .fh-hero { background: linear-gradient(160deg, rgba(100, 181, 246, 0.22), rgba(255, 128, 171, 0.14)); }
}
@media (prefers-reduced-motion: reduce) {
  .fh-hero-glow { animation: none; }
  .fh-card, .fh-btn { transition: none; }
}
</style>
