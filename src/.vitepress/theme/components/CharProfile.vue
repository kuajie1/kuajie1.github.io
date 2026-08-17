<template>
  <header class="cp-hero">
    <span class="cp-snow" aria-hidden="true">❄</span>
    <div class="cp-hero-glow" aria-hidden="true"></div>
    <div class="cp-hero-text">
      <p v-if="kicker" class="cp-kicker">{{ kicker }}</p>
      <h1 class="cp-name">{{ name }}</h1>
      <p v-if="enName" class="cp-en">{{ enName }}</p>
      <p v-if="role" class="cp-role">
        <span class="cp-role-mark" aria-hidden="true">❄</span>{{ role }}
      </p>
    </div>
  </header>

  <section class="cp-card">
    <figure class="cp-portrait">
      <img v-if="image" :src="image" :alt="name" loading="lazy" />
      <figcaption v-if="caption" class="cp-cap">{{ caption }}</figcaption>
    </figure>
    <dl class="cp-facts">
      <div
        v-for="(f, i) in facts"
        :key="i"
        class="cp-fact"
        :class="{ 'cp-wide': f.wide }"
      >
        <dt>{{ f.label }}</dt>
        <dd>{{ f.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<script>
export default {
  name: 'CharProfile',
  props: {
    name: { type: String, required: true },
    enName: { type: String, default: '' },
    kicker: { type: String, default: '' },
    role: { type: String, default: '' },
    image: { type: String, default: '' },
    caption: { type: String, default: '' },
    facts: { type: Array, default: () => [] },
  },
}
</script>

<style scoped>
/* ---------- 人物主视觉 ---------- */
.cp-hero {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 34px 38px 30px;
  margin: 0 0 22px;
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.18), rgba(179, 136, 255, 0.14));
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 14px 38px rgba(26, 51, 92, 0.12);
  backdrop-filter: blur(10px);
}
.cp-hero-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(38% 60% at 12% 18%, rgba(74, 227, 181, 0.22), transparent 70%),
    radial-gradient(40% 60% at 92% 88%, rgba(255, 128, 171, 0.16), transparent 70%);
  pointer-events: none;
}
.cp-snow {
  position: absolute;
  top: 12px;
  right: 18px;
  font-size: 1.5rem;
  color: #fff;
  opacity: 0.35;
  text-shadow: 0 0 12px rgba(100, 181, 246, 0.6);
}
.cp-hero-text { position: relative; z-index: 1; }
.cp-kicker {
  margin: 0 0 6px;
  font-size: 0.82rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fz-aurora-blue);
  font-weight: 700;
}
.cp-name {
  margin: 0;
  font-family: 'Playfair Display', 'Noto Serif SC', 'Songti SC', Georgia, serif;
  font-size: 2.7rem;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0.5px;
  background: linear-gradient(120deg, var(--fz-aurora-blue), var(--fz-aurora-purple) 55%, var(--fz-aurora-pink));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  filter: drop-shadow(0 4px 16px rgba(100, 181, 246, 0.3));
}
.cp-en {
  margin: 8px 0 0;
  font-size: 1.05rem;
  font-style: italic;
  color: var(--vp-c-text-3);
}
.cp-role {
  margin: 12px 0 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: var(--vp-c-text-2);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(79, 159, 224, 0.28);
  border-radius: 999px;
  padding: 6px 16px;
}
.cp-role-mark { color: var(--fz-aurora-blue); font-size: 0.8em; }

/* ---------- 玻璃资料卡 ---------- */
.cp-card {
  display: flex;
  gap: 26px;
  align-items: flex-start;
  margin: 0 0 30px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(26, 51, 92, 0.10);
  backdrop-filter: blur(10px);
}
.cp-portrait {
  flex: 0 0 232px;
  margin: 0;
  padding: 4px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--fz-aurora-blue), var(--fz-aurora-purple) 50%, var(--fz-aurora-green));
  box-shadow: 0 12px 30px rgba(26, 51, 92, 0.18);
}
.cp-portrait img {
  display: block;
  width: 100%;
  border-radius: 16px;
  background: #fff;
}
.cp-cap {
  margin: 8px 4px 2px;
  font-size: 0.78rem;
  line-height: 1.4;
  text-align: center;
  color: var(--vp-c-text-3);
}
.cp-facts {
  flex: 1;
  min-width: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 26px;
}
.cp-fact {
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 9px 0;
}
.cp-wide { grid-column: 1 / -1; }
.cp-fact dt {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--fz-aurora-blue);
  margin-bottom: 3px;
}
.cp-fact dd {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

@media (max-width: 720px) {
  .cp-hero { padding: 24px 22px; }
  .cp-name { font-size: 2.1rem; }
  .cp-card { flex-direction: column; gap: 16px; }
  .cp-portrait { flex: 0 0 auto; width: 200px; align-self: center; }
  .cp-facts { grid-template-columns: 1fr; }
}

/* ---------- 暗色模式 ---------- */
.dark .cp-hero {
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.22), rgba(179, 136, 255, 0.18));
  border-color: rgba(255, 255, 255, 0.1);
}
.dark .cp-kicker { color: #8fd0ff; }
.dark .cp-en { color: #8497b5; }
.dark .cp-role { background: rgba(20, 35, 63, 0.7); border-color: rgba(120, 190, 255, 0.3); color: #c2d2e8; }
.dark .cp-role-mark { color: #8fd0ff; }
.dark .cp-card {
  background: rgba(20, 35, 63, 0.82);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}
.dark .cp-portrait { box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5); }
.dark .cp-cap { color: #8497b5; }
.dark .cp-fact { border-color: rgba(159, 179, 208, 0.16); }
.dark .cp-fact dt { color: #8fd0ff; }
.dark .cp-fact dd { color: #c2d2e8; }
</style>
