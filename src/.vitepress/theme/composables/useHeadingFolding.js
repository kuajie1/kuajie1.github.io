// 增强：百科小标题视觉 + 折叠
// - h2 自动可折叠（点击标题行）—— 让长页面更易浏览
// - h2/h3 视觉加强（靠 CSS）
// - 不改 markdown 源
import { onMounted, onBeforeUnmount, nextTick } from 'vue'

export function useHeadingFolding() {
  let observer = null
  let delegated = null

  function attach() {
    const root = document.querySelector('.VPDoc .content-container .content')
    if (!root) return
    delegated = (e) => {
      // 只在 h2 文本区点击触发
      const h2 = e.target.closest('h2')
      if (!h2) return
      // 忽略 anchor 链接
      if (e.target.closest('a.header-anchor')) return
      e.preventDefault()
      toggle(h2)
    }
    root.addEventListener('click', delegated)

    // 默认不折叠：保持原貌
  }

  function toggle(h2) {
    const folded = h2.classList.toggle('is-folded')
    // 找到所有后续兄弟元素直到下一个 h1/h2
    let el = h2.nextElementSibling
    while (el && !/^H[12]$/.test(el.tagName)) {
      el.classList.toggle('is-folded', folded)
      el = el.nextElementSibling
    }
  }

  // 路由变化后重新绑定
  function onRoute() {
    nextTick(() => attach())
  }

  onMounted(() => {
    attach()
    // 监听 VitePress 路由
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', onRoute)
      const orig = history.pushState
      history.pushState = function (...args) {
        orig.apply(this, args)
        onRoute()
      }
    }
  })

  onBeforeUnmount(() => {
    const root = document.querySelector('.VPDoc .content-container .content')
    if (root && delegated) root.removeEventListener('click', delegated)
  })
}
