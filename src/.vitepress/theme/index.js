import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'

// 注册全局自定义组件
import NovelReader from './components/NovelReader.vue'
import TermCard from './components/TermCard.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import Timeline from './components/Timeline.vue'
import ReleaseTimeline from './components/ReleaseTimeline.vue'
import LineageTree from './components/LineageTree.vue'
import MermaidDiagram from './components/MermaidDiagram.vue'
import SiteEnhance from './components/SiteEnhance.vue'
import SpoilerBox from './components/SpoilerBox.vue'
import SnowOverlay from './components/SnowOverlay.vue'
import CharProfile from './components/CharProfile.vue'
import CharNavbox from './components/CharNavbox.vue'
import BackToTop from './components/BackToTop.vue'
import BottomTabBar from './components/BottomTabBar.vue'
import FrozenHome from './components/FrozenHome.vue'

const DefaultLayout = DefaultTheme.Layout

// 增强：百科小标题折叠（专用折叠按钮，不再整块可点）
//  - 折叠按钮 aria-expanded 同步，支持键盘 Enter/Space
//  - 折叠时跳过 figure / pre / .no-fold 等不应被隐藏的内容
function bindHeadingFolding() {
  if (typeof window === 'undefined') return
  const tryAttach = () => {
    const root = document.querySelector('.VPDoc .content-container .content')
    if (!root) return false
    if (root.__headingFoldingBound) return true
    root.__headingFoldingBound = true

    // 为每个 h2 注入折叠按钮（不依赖原整块点击）
    root.querySelectorAll('h2').forEach((h2) => {
      if (h2.__foldingBtn) return
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'fz-fold-btn'
      btn.setAttribute('aria-label', '折叠/展开本节')
      btn.setAttribute('aria-expanded', 'true')
      h2.__foldingBtn = btn
      h2.classList.add('has-fold-btn')
      h2.appendChild(btn)
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const folded = h2.classList.toggle('is-folded')
        btn.setAttribute('aria-expanded', String(!folded))
        let el = h2.nextElementSibling
        while (el && !/^H[12]$/.test(el.tagName)) {
          // 跳过不应被折叠的内容（图表/代码/显式标记）
          if (el.matches('figure, pre, .no-fold')) {
            el = el.nextElementSibling
            continue
          }
          el.classList.toggle('is-folded', folded)
          el = el.nextElementSibling
        }
      })
    })
    return true
  }
  // 路由切换后重绑：监听 popstate + 拦截 pushState
  const onRoute = () => setTimeout(tryAttach, 50)
  window.addEventListener('popstate', onRoute)
  const origPush = history.pushState
  history.pushState = function (...args) {
    origPush.apply(this, args)
    onRoute()
  }
  const origReplace = history.replaceState
  history.replaceState = function (...args) {
    origReplace.apply(this, args)
    onRoute()
  }
  // 首次
  setTimeout(tryAttach, 100)
  setTimeout(tryAttach, 400)
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('NovelReader', NovelReader)
    app.component('TermCard', TermCard)
    app.component('AudioPlayer', AudioPlayer)
    app.component('Timeline', Timeline)
    app.component('ReleaseTimeline', ReleaseTimeline)
    app.component('LineageTree', LineageTree)
    app.component('MermaidDiagram', MermaidDiagram)
    app.component('SiteEnhance', SiteEnhance)
    app.component('SpoilerBox', SpoilerBox)
    app.component('SnowOverlay', SnowOverlay)
    app.component('CharProfile', CharProfile)
    app.component('CharNavbox', CharNavbox)
    app.component('BackToTop', BackToTop)
    app.component('BottomTabBar', BottomTabBar)
    app.component('FrozenHome', FrozenHome)
  },
  // 全局注入精致飘动雪花层（位于内容之上、导航之下，不挡交互）
  Layout: () => {
    return h(DefaultLayout, null, {
      'layout-top': () => {
        bindHeadingFolding()
        return [h(SiteEnhance), h(BackToTop)]
      },
      'layout-bottom': () => [h(SnowOverlay), h(BottomTabBar)],
    })
  },
}
