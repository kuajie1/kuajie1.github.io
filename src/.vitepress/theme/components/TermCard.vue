<template>
  <div class="term-card-grid">
    <div v-for="t in filtered" :key="t.id" class="term-card">
      <div class="term-head">
        <h4>{{ t.name }}</h4>
        <span class="term-cat">{{ t.cat }}</span>
      </div>
      <p>{{ t.def }}</p>
      <RouterLink v-if="t.link" :to="t.link" class="term-link">查看详情 →</RouterLink>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TermCard',
  props: {
    terms: { type: Array, required: true },
    filter: { type: String, default: '' },
  },
  computed: {
    filtered() {
      const q = (this.filter || '').trim().toLowerCase()
      if (!q) return this.terms
      return this.terms.filter(
        (t) =>
          (t.name || '').toLowerCase().includes(q) ||
          (t.def || '').toLowerCase().includes(q) ||
          (t.cat || '').toLowerCase().includes(q),
      )
    },
  },
}
</script>
