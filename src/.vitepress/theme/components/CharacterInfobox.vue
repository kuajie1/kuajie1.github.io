<template>
  <aside class="char-infobox">
    <div class="ci-photo">
      <img v-if="image" :src="image" :alt="name" loading="lazy" />
      <p v-if="caption" class="ci-cap">{{ caption }}</p>
    </div>
    <div class="ci-head">
      <h3 class="ci-name">{{ name }}</h3>
      <p v-if="enName" class="ci-en">{{ enName }}</p>
    </div>
    <dl class="ci-rows">
      <div v-for="(r, i) in rows" :key="i" class="ci-row">
        <dt>{{ r.label }}</dt>
        <dd>{{ r.value }}</dd>
      </div>
    </dl>
  </aside>
</template>

<script>
export default {
  name: 'CharacterInfobox',
  props: {
    name: { type: String, required: true },
    enName: { type: String, default: '' },
    image: { type: String, default: '' },
    caption: { type: String, default: '' },
    rows: { type: Array, default: () => [] },
  },
}
</script>

<style scoped>
.char-infobox {
  float: right;
  width: 300px;
  max-width: 100%;
  margin: 4px 0 22px 26px;
  border: 1px solid rgba(79, 159, 224, 0.4);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.85);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  box-shadow: 0 10px 28px rgba(26, 51, 92, 0.14);
  font-size: 14px;
  line-height: 1.5;
}
.ci-photo {
  background: linear-gradient(180deg, rgba(100, 181, 246, 0.14), rgba(179, 136, 255, 0.10));
}
.ci-photo img { width: 100%; display: block; }
.ci-cap {
  margin: 0;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  text-align: center;
  background: rgba(234, 243, 255, 0.7);
}
.ci-head {
  padding: 12px 14px 10px;
  text-align: center;
  border-bottom: 1px solid var(--vp-c-divider);
  background: linear-gradient(180deg, rgba(100, 181, 246, 0.12), transparent);
}
.ci-name {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--fz-deep-ice);
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
}
.ci-en { margin: 3px 0 0; font-size: 13px; font-style: italic; color: var(--vp-c-text-3); }
.ci-rows { margin: 0; padding: 4px 0 8px; }
.ci-row { border-bottom: 1px solid var(--vp-c-divider); }
.ci-row:last-child { border-bottom: none; }
.ci-row dt {
  font-weight: 700;
  color: var(--fz-deep-ice);
  padding: 9px 14px 2px;
  font-size: 12.5px;
  letter-spacing: 0.02em;
}
.ci-row dd { margin: 0; padding: 0 14px 9px; color: var(--vp-c-text-2); }
@media (max-width: 768px) {
  .char-infobox { float: none; width: 100%; margin: 0 0 22px; }
}

/* 暗色主题 */
.dark .char-infobox {
  background: rgba(18, 30, 54, 0.85);
  border-color: rgba(100, 181, 246, 0.45);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
}
.dark .ci-photo { background: linear-gradient(180deg, rgba(100, 181, 246, 0.18), rgba(179, 136, 255, 0.12)); }
.dark .ci-cap { background: rgba(18, 30, 54, 0.6); color: #9fb3d0; }
.dark .ci-head { background: linear-gradient(180deg, rgba(100, 181, 246, 0.2), transparent); }
.dark .ci-name { color: #eaf3ff; }
.dark .ci-en { color: #9fb3d0; }
.dark .ci-row { border-color: rgba(159, 179, 208, 0.18); }
.dark .ci-row dt { color: #cfe0ff; }
.dark .ci-row dd { color: #c2d2e8; }
</style>
