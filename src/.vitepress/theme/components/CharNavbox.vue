<template>
  <nav class="cp-nav" aria-label="角色导航">
    <span class="cp-nav-label">角色导航</span>
    <ul class="cp-chips">
      <li v-for="c in chars" :key="c.to">
        <RouterLink :to="c.to" class="cp-chip" :class="{ active: c.to === current }">
          {{ c.text }}
        </RouterLink>
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
        { text: '安娜', to: '/vol1-characters/anna' },
        { text: '艾莎', to: '/vol1-characters/elsa' },
        { text: '克里斯托夫', to: '/vol1-characters/kristoff' },
        { text: '雪宝', to: '/vol1-characters/olaf' },
        { text: '汉斯', to: '/vol1-characters/hans' },
        { text: '伊杜娜与阿格纳尔', to: '/vol1-characters/iduna-agnarr' },
        { text: '全部角色 →', to: '/vol1-characters/' },
      ],
    }
  },
}
</script>

<style scoped>
.cp-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin: 34px 0 8px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(26, 51, 92, 0.08);
}
.cp-nav-label {
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--fz-aurora-blue);
}
.cp-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.cp-chip {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.86rem;
  text-decoration: none;
  color: var(--vp-c-text-2);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--vp-c-border);
  transition: all 0.18s ease;
}
.cp-chip:hover {
  color: var(--fz-deep-ice);
  border-color: var(--fz-aurora-blue);
  background: #fff;
  transform: translateY(-1px);
}
.cp-chip.active {
  color: #fff;
  background: linear-gradient(135deg, var(--fz-aurora-blue), var(--fz-aurora-purple));
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(79, 159, 224, 0.3);
}

.dark .cp-nav {
  background: rgba(20, 35, 63, 0.82);
  border-color: rgba(255, 255, 255, 0.08);
}
.dark .cp-nav-label { color: #8fd0ff; }
.dark .cp-chip { color: #c2d2e8; background: rgba(20, 32, 56, 0.7); border-color: rgba(159, 179, 208, 0.2); }
.dark .cp-chip:hover { color: #eaf3ff; border-color: var(--fz-aurora-blue); }
.dark .cp-chip.active { color: #fff; }
</style>
