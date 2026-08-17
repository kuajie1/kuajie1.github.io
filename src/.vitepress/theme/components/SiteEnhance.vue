<script setup>
/**
 * SiteEnhance —— 全局浏览便捷增强：
 *  1) 阅读进度条（顶部细条，随滚动更新）
 *  2) 图片灯箱（点击正文任意图片放大查看原图，不压缩）
 *  3) 术语悬停提示（自动为正文中的已知术语加下划线，悬停看释义、点击跳转词条页）
 * 通过 Layout 的 layout-top 插槽全局注入，监听路由/滚动自动适配。
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vitepress'
import terms from '../../../terms/terms-data.js'

const route = useRoute()
const router = useRouter()
const progress = ref(0)
const open = ref(false)
const lbSrc = ref('')
const lbAlt = ref('')

// 术语悬停
const termPop = ref({ show: false, name: '', def: '', link: '', cat: '' })

let raf = 0
function updateProgress() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    const doc = document.documentElement
    const max = doc.scrollHeight - doc.clientHeight
    progress.value = max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0
  })
}

function openLightbox(src, alt) {
  lbSrc.value = src
  lbAlt.value = alt || ''
  open.value = true
  document.body.style.overflow = 'hidden'
}
function closeLightbox() {
  open.value = false
  document.body.style.overflow = ''
}

function onDocClick(e) {
  const t = e.target
  if (!(t instanceof HTMLElement)) return
  // 术语点击跳转
  const tip = t.closest && t.closest('.term-tip')
  if (tip) {
    const link = tip.getAttribute('data-link')
    if (link) {
      e.preventDefault()
      router.go(link)
      return
    }
  }
  const img = t.closest && t.closest('.vp-doc img, .VPDoc .content-container img')
  if (img && !img.classList.contains('no-lightbox')) {
    e.preventDefault()
    openLightbox(img.currentSrc || img.src, img.alt)
  }
}

let termHideTimer = 0
function onDocOver(e) {
  const t = e.target
  if (!(t instanceof HTMLElement)) return
  const tip = t.closest && t.closest('.term-tip')
  if (tip) {
    if (termHideTimer) clearTimeout(termHideTimer)
    const r = tip.getBoundingClientRect()
    termPop.value = {
      show: true,
      name: tip.textContent,
      def: tip.getAttribute('data-def') || '',
      link: tip.getAttribute('data-link') || '',
      cat: tip.getAttribute('data-cat') || '',
    }
    // 定位在术语上方居中
    requestAnimationFrame(() => {
      const pop = document.querySelector('.term-pop')
      if (!pop) return
      const pw = pop.offsetWidth
      let left = r.left + r.width / 2 - pw / 2
      left = Math.max(8, Math.min(left, window.innerWidth - pw - 8))
      pop.style.left = left + 'px'
      pop.style.top = Math.max(8, r.top - pop.offsetHeight - 8) + 'px'
    })
  }
}
function onDocOut(e) {
  const t = e.target
  if (!(t instanceof HTMLElement)) return
  if (t.closest && t.closest('.term-tip')) {
    termHideTimer = setTimeout(() => (termPop.value = { ...termPop.value, show: false }), 120)
  }
}
function onKey(e) {
  if (e.key === 'Escape') {
    if (open.value) closeLightbox()
    termPop.value = { ...termPop.value, show: false }
  }
}

/* ---------- 术语自动链接 ---------- */
const excludeTags = new Set(['SCRIPT', 'STYLE', 'A', 'CODE', 'PRE', 'H1', 'H2', 'H3', 'BUTTON'])
function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
const termList = terms
  .map((t) => ({ name: t.name, def: t.def, link: t.link || '', cat: t.cat || '' }))
  .sort((a, b) => b.name.length - a.name.length)
const termRegex = new RegExp('(' + termList.map((t) => escapeReg(t.name)).join('|') + ')', 'g')

function linkifyTerms(root) {
  if (!root || root.__termLinked) return
  root.__termLinked = true
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT
      let p = node.parentElement
      while (p && p !== root) {
        const tag = p.tagName
        if (excludeTags.has(tag)) return NodeFilter.FILTER_REJECT
        if (p.classList && (p.classList.contains('term-tip') || p.classList.contains('no-term')))
          return NodeFilter.FILTER_REJECT
        p = p.parentElement
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  for (const node of nodes) {
    const text = node.nodeValue
    termRegex.lastIndex = 0
    if (!termRegex.test(text)) continue
    termRegex.lastIndex = 0
    const frag = document.createDocumentFragment()
    let last = 0
    let m
    while ((m = termRegex.exec(text))) {
      const idx = m.index
      if (idx > last) frag.appendChild(document.createTextNode(text.slice(last, idx)))
      const name = m[0]
      const term = termList.find((t) => t.name === name)
      const span = document.createElement('span')
      span.className = 'term-tip'
      span.textContent = name
      if (term) {
        span.setAttribute('data-def', term.def)
        span.setAttribute('data-link', term.link)
        span.setAttribute('data-cat', term.cat)
      }
      frag.appendChild(span)
      last = idx + name.length
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
    node.parentNode.replaceChild(frag, node)
  }
}

function enhancePage() {
  const root = document.querySelector('.VPDoc .content-container .content') || document.querySelector('.vp-doc')
  if (root) linkifyTerms(root)
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)
  document.addEventListener('click', onDocClick)
  document.addEventListener('mouseover', onDocOver)
  document.addEventListener('mouseout', onDocOut)
  document.addEventListener('keydown', onKey)
  updateProgress()
  setTimeout(enhancePage, 120)
  setTimeout(enhancePage, 450)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('mouseover', onDocOver)
  document.removeEventListener('mouseout', onDocOut)
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})

watch(
  () => route.path,
  () => {
    progress.value = 0
    termPop.value = { show: false, name: '', def: '', link: '', cat: '' }
    requestAnimationFrame(updateProgress)
    setTimeout(enhancePage, 120)
    setTimeout(enhancePage, 450)
  },
)
</script>

<template>
  <!-- 阅读进度条 -->
  <div class="read-progress" :style="{ width: progress + '%' }" aria-hidden="true"></div>

  <!-- 图片灯箱 -->
  <Teleport to="body">
    <div v-if="open" class="lightbox" @click.self="closeLightbox">
      <button class="lightbox-close" aria-label="关闭" @click="closeLightbox">×</button>
      <img class="lightbox-img" :src="lbSrc" :alt="lbAlt" @click.stop />
      <div v-if="lbAlt" class="lightbox-cap">{{ lbAlt }}</div>
    </div>

    <!-- 术语悬停提示卡 -->
    <div v-if="termPop.show" class="term-pop" role="tooltip">
      <div class="tp-head">
        <span class="tp-name">{{ termPop.name }}</span>
        <span v-if="termPop.cat" class="tp-cat">{{ termPop.cat }}</span>
      </div>
      <p class="tp-def">{{ termPop.def }}</p>
      <RouterLink v-if="termPop.link" :to="termPop.link" class="tp-link" @click.native="termPop.show = false">
        查看词条详情 →
      </RouterLink>
    </div>
  </Teleport>
</template>
