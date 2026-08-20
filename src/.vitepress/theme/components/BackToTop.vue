<script setup>
/**
 * BackToTop —— 返回顶部悬浮按钮
 *  - 滚动超过一屏后出现，带极光渐变与雪花标
 *  - 点击平滑滚动到顶部（尊重 prefers-reduced-motion）
 *  - 键盘可聚焦、Enter/Space 触发；无障碍 aria-label
 *  - 仅桌面/平板显示，移动端由底部 Tab 栏承担导航（见 BottomTabBar）
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

const shown = ref(false)
let raf = 0

function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    shown.value = window.scrollY > window.innerHeight * 0.8
  })
}

function toTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <Transition name="btt-fade">
    <button
      v-if="shown"
      class="btt"
      type="button"
      aria-label="返回顶部"
      title="返回顶部"
      @click="toTop"
    >
      <span class="btt-snow" aria-hidden="true">❄</span>
      <span class="btt-arrow" aria-hidden="true">↑</span>
    </button>
  </Transition>
</template>

<style scoped>
.btt {
  position: fixed;
  right: 24px;
  bottom: 28px;
  z-index: 9;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.92), rgba(179, 136, 255, 0.92));
  box-shadow: 0 10px 28px rgba(26, 51, 92, 0.28);
  cursor: pointer;
  color: #fff;
  backdrop-filter: blur(8px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btt:hover { transform: translateY(-3px); box-shadow: 0 16px 36px rgba(79, 159, 224, 0.4); }
.btt:active { transform: translateY(0); }
.btt:focus-visible {
  outline: 3px solid var(--fz-aurora-green, #4ae3b5);
  outline-offset: 3px;
}
.btt-arrow { font-size: 1.3rem; font-weight: 700; line-height: 1; }
.btt-snow {
  position: absolute;
  top: 3px;
  right: 4px;
  font-size: 0.7rem;
  opacity: 0.7;
}
.btt-fade-enter-active,
.btt-fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.btt-fade-enter-from,
.btt-fade-leave-to { opacity: 0; transform: translateY(10px); }

/* 移动端隐藏：由底部 Tab 栏承载导航 */
@media (max-width: 768px) {
  .btt { display: none; }
}
</style>
