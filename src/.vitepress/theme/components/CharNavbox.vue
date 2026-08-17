<template>
  <nav class="char-navbox" aria-label="角色导航">
    <div class="cn-title">角色导航</div>
    <ul class="cn-list">
      <li v-for="c in chars" :key="c.to">
        <RouterLink :to="c.to" :class="{ active: c.to === current }">{{ c.text }}</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'CharNavbox',
  props: {
    current: { type: String, default: '' },
  },
  data() {
    return {
      chars: [
        { text: '安娜 Anna', to: '/vol1-characters/anna' },
        { text: '艾莎 Elsa', to: '/vol1-characters/elsa' },
        { text: '克里斯托夫 Kristoff', to: '/vol1-characters/kristoff' },
        { text: '雪宝 Olaf', to: '/vol1-characters/olaf' },
        { text: '汉斯 Hans', to: '/vol1-characters/hans' },
        { text: '伊杜娜与阿格纳尔', to: '/vol1-characters/iduna-agnarr' },
        { text: '全部角色 →', to: '/vol1-characters/' },
      ],
    }
  },
}
</script>

<style scoped>
.char-navbox {
  margin: 28px 0 8px;
  padding: 14px 18px;
  border: 1px solid rgba(79, 159, 224, 0.3);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.10), rgba(179, 136, 255, 0.08));
}
.cn-title {
  font-weight: 800;
  font-size: 14px;
  color: var(--fz-deep-ice);
  margin-bottom: 8px;
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
}
.cn-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.cn-list a {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 13px;
  text-decoration: none;
  color: var(--vp-c-text-2);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--vp-c-border);
  transition: all 0.15s ease;
}
.cn-list a:hover { color: var(--fz-deep-ice); border-color: var(--fz-aurora-blue); background: #fff; }
.cn-list a.active {
  color: #fff;
  background: linear-gradient(135deg, var(--fz-aurora-blue), var(--fz-aurora-purple));
  border-color: transparent;
}
.dark .char-navbox { background: linear-gradient(135deg, rgba(100, 181, 246, 0.16), rgba(179, 136, 255, 0.12)); }
.dark .cn-title { color: #eaf3ff; }
.dark .cn-list a { color: #c2d2e8; background: rgba(20, 32, 56, 0.7); border-color: rgba(159, 179, 208, 0.2); }
.dark .cn-list a:hover { color: #eaf3ff; border-color: var(--fz-aurora-blue); }
.dark .cn-list a.active { color: #fff; }
</style>
