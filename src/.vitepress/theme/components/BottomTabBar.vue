<script setup>
/**
 * BottomTabBar —— 移动端底部 Tab 栏（仅 ≤768px 显示）
 *  - 十卷 + 首页/术语 快速切换，提升手机端导航效率
 *  - 当前页高亮（useRoute 匹配）
 *  - 键盘可聚焦、aria-current 标记
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vitepress'

const route = useRoute()
const router = useRouter()

const tabs = [
  { icon: '❄', text: '首页', link: '/' },
  { icon: '👤', text: '角色', link: '/vol1-characters/' },
  { icon: '🌍', text: '世界', link: '/vol2-world/' },
  { icon: '✨', text: '魔法', link: '/vol3-magic/' },
  { icon: '📖', text: '小说', link: '/vol10-novels/' },
  { icon: '🎵', text: '歌曲', link: '/vol9-songs/' },
  { icon: '🔍', text: '术语', link: '/terms/' },
]

const active = computed(() => {
  const p = route.path
  // 首页
  if (p === '/') return '/'
  // 取一级路径匹配
  const top = '/' + p.split('/').filter(Boolean)[0] + '/'
  const hit = tabs.find((t) => t.link !== '/' && p.startsWith(t.top))
  return hit ? hit.top : ''
})

function go(link) {
  if (route.path !== link) router.go(link)
  window.scrollTo({ top: 0, behavior: 'auto' })
}
</script>

<template>
  <nav class="bttab" aria-label="底部快捷导航">
    <button
      v-for="t in tabs"
      :key="t.link"
      class="bttab-item"
      type="button"
      :aria-current="active === t.top ? 'page' : undefined"
      :class="{ 'is-active': active === t.top }"
      @click="go(t.link)"
    >
      <span class="bttab-icon" aria-hidden="true">{{ t.icon }}</span>
      <span class="bttab-text">{{ t.text }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bttab {
  display: none;
}
/* 仅移动端显示 */
@media (max-width: 768px) {
  .bttab {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 12;
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    height: 56px;
    padding-bottom: env(safe-area-inset-bottom, 0);
    background: rgba(244, 249, 255, 0.96);
    border-top: 1px solid rgba(79, 159, 224, 0.18);
    box-shadow: 0 -6px 20px rgba(26, 51, 92, 0.12);
    backdrop-filter: blur(12px);
  }
  .dark .bttab { background: rgba(15, 27, 49, 0.96); border-top-color: rgba(120, 170, 220, 0.18); }
  .bttab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--vp-c-text-3);
    font-size: 0.66rem;
    font-family: inherit;
    padding: 4px 0;
    transition: color 0.2s ease;
  }
  .bttab-item:focus-visible { outline: 3px solid var(--fz-aurora-purple, #b388ff); outline-offset: -3px; }
  .bttab-icon { font-size: 1.15rem; line-height: 1; }
  .bttab-item.is-active { color: var(--fz-aurora-blue, #4f9fe0); }
  .bttab-item.is-active .bttab-icon { filter: drop-shadow(0 0 6px rgba(100, 181, 246, 0.6)); }
}
</style>
