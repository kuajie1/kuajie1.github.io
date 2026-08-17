<script setup>
/**
 * MermaidDiagram —— 在 VitePress 中渲染 Mermaid 关系图。
 * 用法：<MermaidDiagram code='graph TD
 *     A["节点"] --> B["节点"]' />
 * 说明：用单引号包裹 code，内部标签可用双引号；支持明暗主题自动切换。
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  code: { type: String, required: true },
})

const svg = ref('')
const error = ref('')
let uid = 'mmd-' + Math.random().toString(36).slice(2, 10)
let ready = false
let mermaidMod = null
let observer = null

function currentTheme() {
  const isDark = typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  return isDark ? 'dark' : 'default'
}

async function draw() {
  try {
    // 动态导入 mermaid，使其进入独立 chunk，仅在含关系图的页面按需加载（减小主包体积）
    if (!mermaidMod) mermaidMod = (await import('mermaid')).default
    const mermaid = mermaidMod
    if (!ready) {
      mermaid.initialize({
        startOnLoad: false,
        theme: currentTheme(),
        securityLevel: 'loose',
        fontFamily: 'inherit',
        flowchart: { curve: 'basis', htmlLabels: true, nodeSpacing: 36, rankSpacing: 48 },
        themeVariables: { fontSize: '15px' },
      })
      ready = true
    } else {
      // 主题切换后需要重新初始化
      mermaid.initialize({ theme: currentTheme() })
    }
    const { svg: out } = await mermaid.render(uid, props.code.trim())
    svg.value = out
    error.value = ''
  } catch (e) {
    error.value = '图表渲染失败：' + (e && e.message ? e.message : String(e))
  }
}

function watchTheme() {
  if (typeof document === 'undefined') return
  observer = new MutationObserver(() => draw())
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
}

onMounted(() => {
  draw()
  watchTheme()
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

watch(() => props.code, draw)
</script>

<template>
  <div class="mermaid-diagram">
    <div class="mermaid-svg" v-html="svg"></div>
    <div v-if="error" class="mermaid-error">{{ error }}</div>
  </div>
</template>

<style scoped>
.mermaid-diagram {
  margin: 22px 0;
  padding: 18px 16px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(79, 159, 224, 0.22);
  border-radius: 14px;
  box-shadow: 0 8px 26px rgba(26, 51, 92, 0.08);
  text-align: center;
  overflow-x: auto;
}
.mermaid-svg :deep(svg) {
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
.mermaid-error {
  color: #c0392b;
  font-size: 0.85rem;
  padding: 8px;
}
:global(.dark) .mermaid-diagram {
  background: rgba(20, 35, 63, 0.7);
  border-color: rgba(255, 255, 255, 0.12);
}
</style>
