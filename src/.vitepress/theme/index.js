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
import CharacterInfobox from './components/CharacterInfobox.vue'
import CharNavbox from './components/CharNavbox.vue'

const DefaultLayout = DefaultTheme.Layout

// 增强：百科小标题视觉 + 折叠（点 h2 折叠/展开其下内容到下一个 h2）
function bindHeadingFolding() {
  if (typeof window === 'undefined') return
  const tryAttach = () => {
    const root = document.querySelector('.VPDoc .content-container .content')
    if (!root) return false
    if (root.__headingFoldingBound) return true
    root.__headingFoldingBound = true
    root.addEventListener('click', (e) => {
      const h2 = e.target.closest('h2')
      if (!h2 || !root.contains(h2)) return
      if (e.target.closest('a.header-anchor')) return
      e.preventDefault()
      const folded = h2.classList.toggle('is-folded')
      let el = h2.nextElementSibling
      while (el && !/^H[12]$/.test(el.tagName)) {
        el.classList.toggle('is-folded', folded)
        el = el.nextElementSibling
      }
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
    app.component('CharacterInfobox', CharacterInfobox)
    app.component('CharNavbox', CharNavbox)
  },
  // 全局注入精致飘动雪花层（位于内容之上、导航之下，不挡交互）
  Layout: () => {
    return h(DefaultLayout, null, {
      'layout-top': () => {
        bindHeadingFolding()
        return h(SiteEnhance)
      },
      'layout-bottom': () => h(SnowOverlay),
    })
  },
}
