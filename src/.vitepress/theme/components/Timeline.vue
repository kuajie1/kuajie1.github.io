<template>
  <div class="timeline-wrapper">
    <div class="timeline-track">
      <button
        v-for="(it, i) in items"
        :key="i"
        class="timeline-dot"
        :class="{ active: i === active }"
        @click="active = i"
      >
        {{ it.year }}
      </button>
    </div>
    <div class="timeline-card">
      <span class="tl-era">{{ items[active]?.year }}</span>
      <b>{{ items[active]?.title }}</b>
      <p>{{ items[active]?.description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Timeline',
  props: {
    items: { type: Array, required: true },
  },
  data() {
    return { active: 0 }
  },
}
</script>

<style scoped>
.timeline-wrapper { margin: 20px 0; }
.timeline-track {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0 14px;
}
.timeline-dot {
  flex: 0 0 auto;
  min-width: 64px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(26, 42, 74, 0.2);
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  color: var(--deep-ice);
  transition: all 0.2s;
}
.timeline-dot.active {
  background: linear-gradient(135deg, var(--aurora-blue), var(--aurora-purple));
  color: #fff;
  border-color: transparent;
}
.timeline-card {
  border: 1px solid rgba(26, 42, 74, 0.12);
  border-radius: 12px;
  padding: 18px 22px;
  background: rgba(255, 255, 255, 0.7);
}
.timeline-card .tl-era {
  display: inline-block;
  font-size: 12px;
  color: #fff;
  background: var(--aurora-green);
  border-radius: 8px;
  padding: 2px 10px;
  margin-bottom: 8px;
}
.timeline-card p { margin: 8px 0 0; color: #555; }
</style>
