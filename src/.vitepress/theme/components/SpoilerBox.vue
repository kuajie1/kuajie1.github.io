<template>
  <section class="spoiler-box" :class="{ open }">
    <button class="spoiler-head" type="button" @click="open = !open" :aria-expanded="open">
      <span class="sp-icon">⚠</span>
      <span class="sp-title">{{ title }}</span>
      <span class="sp-hint">{{ open ? '点击收起 ▲' : '点击展开 ▼' }}</span>
    </button>
    <transition name="sp-fade">
      <div v-show="open" class="sp-body">
        <slot />
      </div>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'SpoilerBox',
  props: {
    title: { type: String, default: '剧透预警：以下内容含关键情节' },
  },
  data() {
    return { open: false }
  },
}
</script>

<style scoped>
.spoiler-box {
  border: 1px dashed var(--sp-bd, rgba(214, 137, 16, 0.6));
  border-radius: 10px;
  margin: 18px 0;
  overflow: hidden;
  background: var(--sp-bg, rgba(255, 244, 224, 0.55));
}
.spoiler-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  color: var(--sp-fg, #8a5a00);
  background: var(--sp-head-bg, linear-gradient(90deg, rgba(255, 224, 178, 0.9), rgba(255, 238, 210, 0.9)));
}
.spoiler-head:hover {
  filter: brightness(1.03);
}
.sp-icon {
  font-size: 18px;
}
.sp-title {
  flex: 1;
}
.sp-hint {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 500;
  white-space: nowrap;
}
.sp-body {
  padding: 4px 18px 14px;
}
.sp-fade-enter-active,
.sp-fade-leave-active {
  transition: opacity 0.22s ease;
}
.sp-fade-enter-from,
.sp-fade-leave-to {
  opacity: 0;
}

/* 暗色主题 */
.dark .spoiler-box {
  --sp-bd: rgba(235, 170, 60, 0.5);
  --sp-bg: rgba(60, 48, 26, 0.4);
  --sp-fg: #f0c674;
  --sp-head-bg: linear-gradient(90deg, rgba(74, 58, 28, 0.92), rgba(54, 44, 24, 0.92));
}
</style>
