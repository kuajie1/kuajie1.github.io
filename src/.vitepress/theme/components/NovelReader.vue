<template>
  <div class="novel-reader">
    <!-- 关闭态：封面式章节目录 -->
    <div v-if="!open" class="novel-toc-wrap">
      <h3 class="novel-toc-title">
        📚 {{ book.title }}
        <span class="novel-toc-meta">共 {{ book.chapters.length }} 章 · {{ translatedCount }} 章已译</span>
      </h3>
      <div class="novel-toc">
        <button
          v-for="(ch, i) in book.chapters"
          :key="ch.id"
          @click="openChapter(i)"
        >
          <span class="ch-no">{{ i + 1 }}</span>
          <span class="ch-name">{{ ch.title }}</span>
          <span class="ch-flag" :class="{ done: ch.zh }">{{ ch.zh ? '译' : '待译' }}</span>
        </button>
      </div>
    </div>

    <!-- 打开态：全屏阅读器 -->
    <div
      v-else
      class="reader-overlay"
      :class="['theme-' + theme, { dark: theme === 'dark' }]"
    >
      <!-- 顶部栏 -->
      <header class="reader-header">
        <div class="reader-info">
          <button class="r-ctrl" @click="toggleDrawer" title="目录">☰ 目录</button>
          <span class="r-book">{{ book.title }}</span>
          <span class="r-ch">{{ current.title }}</span>
          <span class="r-progress">{{ index + 1 }} / {{ book.chapters.length }}</span>
        </div>
        <div class="reader-controls">
          <button class="r-ctrl" @click="cycleFont" title="字号">Aa</button>
          <button class="r-ctrl" @click="cycleTheme" :title="'主题：' + themeNames[theme]">🎨</button>
          <button class="r-ctrl" @click="cycleMode" :title="'显示：' + modeLabels[mode]">{{ modeLabel }}</button>
          <button class="r-ctrl" @click="toggleReadingMode" :title="'阅读方式：' + (readingMode === 'scroll' ? '滚动' : '翻页')">{{ readingMode === 'scroll' ? '📜 滚动' : '📖 翻页' }}</button>
          <button class="r-ctrl" @click="toggleSearch" title="搜索">🔍</button>
          <button class="r-close" @click="close">✕ 返回</button>
        </div>
      </header>

      <!-- 章节内阅读进度条 -->
      <div class="reader-progress" :style="{ width: progressPct + '%' }"></div>

      <!-- 目录抽屉 -->
      <transition name="drawer">
        <aside v-if="drawerOpen" class="reader-drawer">
          <div class="drawer-head">
            <span>📑 目录</span>
            <button class="r-ctrl" @click="toggleDrawer">✕</button>
          </div>
          <div class="drawer-list">
            <button
              v-for="(ch, i) in book.chapters"
              :key="ch.id"
              class="drawer-item"
              :class="{ active: i === index }"
              @click="openChapter(i)"
            >
              <span class="di-no">{{ i + 1 }}</span>
              <span class="di-name">{{ ch.title }}</span>
              <span class="di-flag" :class="{ done: ch.zh }">{{ ch.zh ? '译' : '待' }}</span>
              <button
                class="di-bm"
                :class="{ on: isBookmarked(i) }"
                @click.stop="toggleBookmark(i)"
                :title="isBookmarked(i) ? '取消书签' : '加书签'"
              >★</button>
            </button>
          </div>

          <!-- 本章小节目录 -->
          <div v-if="subsections.length" class="subsec-block">
            <div class="sb-head">📑 本章小节 · {{ current.title }}</div>
            <button
              v-for="(s, si) in subsections"
              :key="si"
              class="subsec-item"
              :class="'lv' + s.level"
              @click="jumpToSub(s.id)"
            >
              <span class="ss-dot">●</span>{{ s.text }}
            </button>
          </div>
        </aside>
      </transition>
      <transition name="fade">
        <div v-if="drawerOpen" class="drawer-mask" @click="toggleDrawer"></div>
      </transition>

      <!-- 搜索面板 -->
      <transition name="fade">
        <div v-if="searchOpen" class="search-panel" @click.stop>
          <div class="search-bar">
            <input
              ref="searchInput"
              v-model="searchQuery"
              @input="runSearch"
              class="search-input"
              placeholder="搜索本书内容（中 / 英文）…"
            />
            <button class="r-close" @click="toggleSearch">关闭</button>
          </div>
          <div class="search-results">
            <div v-if="searchQuery && searchResults.length === 0" class="search-empty">未找到匹配内容</div>
            <button
              v-for="(r, ri) in searchResults"
              :key="ri"
              class="search-result"
              @click="jumpToSearch(r)"
            >
              <span class="sr-ch">第 {{ r.index + 1 }} 章 · {{ r.title }}</span>
              <span class="sr-snippet" v-html="highlight(r.snippet, searchQuery)"></span>
            </button>
          </div>
        </div>
      </transition>

      <!-- 正文滚动/翻页容器 -->
      <div
        class="reader-body"
        :class="{ flip: readingMode === 'flip' }"
        ref="bodyEl"
        @scroll="onScroll"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <transition :name="pageTransition" mode="out-in">
          <div class="reader-content" :key="index" :style="contentStyle" @click="onContentClick">
            <h2 class="r-title">{{ current.title }}</h2>

            <!-- 逐句对照 -->
            <section v-if="mode === 'sentence'" class="r-panel sentence-view">
              <h4>📝 逐句对照
                <span class="sv-hint">点击句子可高亮标记 · 已标记 {{ markCount }} 句<button class="sv-clear" v-if="markCount" @click.stop="clearChapterMarks">清除</button></span>
              </h4>
              <div
                v-for="(s, si) in (current.sentences || [])"
                :key="si"
                class="s-row"
                :class="{ marked: isMarked(si) }"
                @click.stop="toggleMark(si)"
              >
                <p class="s-en">{{ s.en }}</p>
                <p class="s-zh" :class="{ pending: !s.zh }">{{ s.zh || '⚠️ 翻译待补充' }}</p>
              </div>
            </section>

            <!-- 英文原文 -->
            <section v-else-if="mode === 'en'" class="r-panel single">
              <h4>📖 英文原文</h4>
              <div class="r-html" v-html="current.en"></div>
            </section>

            <!-- 中文翻译 -->
            <section v-else class="r-panel single">
              <h4>🌏 中文翻译</h4>
              <div class="r-html" v-html="(current.zh || pendingHtml)"></div>
            </section>
          </div>
        </transition>
      </div>

      <!-- 翻页模式下的页码控制（仅翻页模式、置于底部栏上方，小巧不挡目录） -->
      <div v-if="readingMode === 'flip' && totalPages > 1" class="flip-bar">
        <button class="flip-btn" @click="goPage(-1)" :disabled="pageIndex <= 0">‹ 上一页</button>
        <span class="flip-ind">{{ pageIndex + 1 }} / {{ totalPages }}</span>
        <button class="flip-btn" @click="goPage(1)" :disabled="pageIndex >= totalPages - 1">下一页 ›</button>
      </div>

      <!-- 底部栏：仅 上一章 / 下一章 -->
      <div class="bottom-bar">
        <button class="bb-btn" @click="go(-1)" :disabled="index === 0">← 上一章</button>
        <span class="bb-mid">{{ index + 1 }} / {{ book.chapters.length }} · {{ current.title }}</span>
        <button class="bb-btn" @click="go(1)" :disabled="index === book.chapters.length - 1">下一章 →</button>
      </div>
    </div>
  </div>
</template>

<script>
import { novelData } from '../../novel-data/index.js'

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
function stripHtml(html) {
  const d = document.createElement('div')
  d.innerHTML = html || ''
  return d.textContent || ''
}

export default {
  name: 'NovelReader',
  props: {
    bookId: { type: String, required: true },
  },
  data() {
    return {
      open: false,
      index: 0,
      fontSize: 18,
      theme: 'paper', // paper | parchment | dark | minimal
      mode: 'sentence', // sentence | en | zh
      lineHeight: 1.9,
      letterSpacing: 0,
      maxWidth: 920, // 加宽正文
      fontSizes: [14, 16, 18, 20, 22, 24],
      themes: ['paper', 'parchment', 'dark', 'minimal'],
      themeNames: { paper: '纸张护眼', parchment: '羊皮纸', dark: '暗夜', minimal: '极简' },
      modes: ['sentence', 'en', 'zh'],
      modeLabels: { sentence: '📝 逐句', en: '📖 原文', zh: '🌏 译文' },
      readingMode: 'scroll', // scroll | flip
      pageIndex: 0,
      totalPages: 1,
      drawerOpen: false,
      subsections: [],
      searchOpen: false,
      searchQuery: '',
      searchResults: [],
      bookmarks: [],
      marks: {},
      progressPct: 0,
      pageTransition: 'slide-left',
      touchStartX: 0,
      touchStartY: 0,
      savedIndex: 0,
      savedScrollTop: 0,
    }
  },
  computed: {
    book() {
      return novelData[this.bookId] || { title: this.bookId, chapters: [] }
    },
    current() {
      return this.book.chapters[this.index] || { title: '', en: '', zh: null }
    },
    modeLabel() {
      return this.modeLabels[this.mode]
    },
    pendingHtml() {
      return '<p style="color:#999;font-style:italic;">翻译待补充</p>'
    },
    translatedCount() {
      return this.book.chapters.filter((c) => c.zh).length
    },
    contentStyle() {
      return {
        maxWidth: this.maxWidth + 'px',
        lineHeight: this.lineHeight,
        letterSpacing: this.letterSpacing + 'px',
        fontSize: this.fontSize + 'px',
      }
    },
    storageKey() {
      return 'fz-novel-' + this.bookId
    },
  },
  methods: {
    loadState() {
      try {
        const raw = localStorage.getItem(this.storageKey)
        if (!raw) return
        const s = JSON.parse(raw)
        if (s.theme && this.themes.includes(s.theme)) this.theme = s.theme
        if (s.fontSize) this.fontSize = s.fontSize
        if (s.lineHeight) this.lineHeight = s.lineHeight
        if (typeof s.letterSpacing === 'number') this.letterSpacing = s.letterSpacing
        if (s.maxWidth) this.maxWidth = s.maxWidth
        if (Array.isArray(s.bookmarks)) this.bookmarks = s.bookmarks
        if (s.marks && typeof s.marks === 'object') this.marks = s.marks
        if (typeof s.index === 'number') this.savedIndex = s.index
        if (typeof s.scrollTop === 'number') this.savedScrollTop = s.scrollTop
        if (s.readingMode === 'flip' || s.readingMode === 'scroll') this.readingMode = s.readingMode
      } catch (e) { /* ignore */ }
    },
    saveState() {
      try {
        const el = this.$refs.bodyEl
        const st = el ? el.scrollTop : 0
        const data = {
          theme: this.theme,
          fontSize: this.fontSize,
          lineHeight: this.lineHeight,
          letterSpacing: this.letterSpacing,
          maxWidth: this.maxWidth,
          bookmarks: this.bookmarks,
          marks: this.marks,
          index: this.index,
          scrollTop: st,
          readingMode: this.readingMode,
        }
        localStorage.setItem(this.storageKey, JSON.stringify(data))
      } catch (e) { /* ignore */ }
    },
    openChapter(i) {
      this.index = i
      this.open = true
      this.drawerOpen = false
      document.body.style.overflow = 'hidden'
      this.pushHash()
      this.$nextTick(() => {
        const el = this.$refs.bodyEl
        if (!el) return
        if (this.readingMode === 'flip') {
          this.pageIndex = 0
          el.scrollTop = 0
        } else if (this.savedIndex === i && typeof this.savedScrollTop === 'number' && this.savedScrollTop > 0) {
          el.scrollTop = this.savedScrollTop
        } else {
          el.scrollTop = 0
        }
        this.updateProgress(el)
        if (this.readingMode === 'flip') this.computePages()
      })
      this.parseSubsections()
    },
    close() {
      this.saveState()
      this.open = false
      this.drawerOpen = false
      this.searchOpen = false
      document.body.style.overflow = ''
      if (this.$route) history.pushState(null, '', this.$route.path)
      else history.pushState(null, '', location.pathname)
    },
    go(delta) {
      const n = this.index + delta
      if (n < 0 || n >= this.book.chapters.length) return
      this.pageTransition = delta > 0 ? 'slide-left' : 'slide-right'
      this.index = n
      this.pushHash()
      this.$nextTick(() => {
        const el = this.$refs.bodyEl
        if (!el) return
        if (this.readingMode === 'flip') {
          this.pageIndex = 0
          el.scrollTop = 0
          this.computePages()
        } else {
          el.scrollTop = 0
        }
        this.progressPct = 0
      })
      this.parseSubsections()
    },
    cycleFont() {
      const i = this.fontSizes.indexOf(this.fontSize)
      this.fontSize = this.fontSizes[(i + 1) % this.fontSizes.length]
      this.saveState()
    },
    cycleTheme() {
      const i = this.themes.indexOf(this.theme)
      this.theme = this.themes[(i + 1) % this.themes.length]
      this.saveState()
    },
    cycleMode() {
      const i = this.modes.indexOf(this.mode)
      this.mode = this.modes[(i + 1) % this.modes.length]
      this.parseSubsections()
    },
    toggleReadingMode() {
      this.readingMode = this.readingMode === 'scroll' ? 'flip' : 'scroll'
      this.saveState()
      this.$nextTick(() => {
        const el = this.$refs.bodyEl
        if (!el) return
        if (this.readingMode === 'flip') {
          this.pageIndex = 0
          el.scrollTop = 0
          this.computePages()
        } else {
          el.scrollTop = 0
          this.progressPct = 0
        }
      })
    },
    computePages() {
      const el = this.$refs.bodyEl
      if (!el) return
      const h = el.clientHeight || 1
      const total = Math.max(1, Math.ceil(el.scrollHeight / h))
      this.totalPages = total
      this.pageIndex = Math.min(this.pageIndex, total - 1)
      el.scrollTop = this.pageIndex * h
      this.progressPct = total > 1 ? Math.min(100, ((this.pageIndex + 1) / total) * 100) : 0
    },
    goPage(delta) {
      const el = this.$refs.bodyEl
      if (!el) return
      const n = Math.max(0, Math.min(this.totalPages - 1, this.pageIndex + delta))
      if (n === this.pageIndex) return
      this.pageIndex = n
      el.scrollTop = this.pageIndex * (el.clientHeight || 1)
      this.progressPct = this.totalPages > 1 ? Math.min(100, ((this.pageIndex + 1) / this.totalPages) * 100) : 0
    },
    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen
    },
    toggleSearch() {
      this.searchOpen = !this.searchOpen
      this.searchQuery = ''
      this.searchResults = []
      if (this.searchOpen) {
        this.$nextTick(() => {
          if (this.$refs.searchInput) this.$refs.searchInput.focus()
        })
      }
    },
    isBookmarked(i) {
      return this.bookmarks.includes(i)
    },
    toggleBookmark(i) {
      const p = this.bookmarks.indexOf(i)
      if (p === -1) this.bookmarks.push(i)
      else this.bookmarks.splice(p, 1)
      this.saveState()
    },
    // 阅读笔记：点击句子切换高亮标记（按章节 id 存储，持久化）
    markCount() {
      const id = this.current.id
      return (this.marks[id] && this.marks[id].length) || 0
    },
    isMarked(si) {
      const id = this.current.id
      return !!(this.marks[id] && this.marks[id].includes(si))
    },
    toggleMark(si) {
      const id = this.current.id
      if (!this.marks[id]) this.marks[id] = []
      const arr = this.marks[id]
      const p = arr.indexOf(si)
      if (p === -1) arr.push(si)
      else arr.splice(p, 1)
      this.saveState()
    },
    clearChapterMarks() {
      const id = this.current.id
      if (this.marks[id]) delete this.marks[id]
      this.saveState()
    },
    runSearch() {
      const q = this.searchQuery.trim().toLowerCase()
      if (!q) {
        this.searchResults = []
        return
      }
      const res = []
      this.book.chapters.forEach((ch, i) => {
        const parts = []
        if (ch.sentences) {
          ch.sentences.forEach((s) => {
            if (s.en) parts.push(s.en)
            if (s.zh) parts.push(s.zh)
          })
        }
        if (ch.en) parts.push(stripHtml(ch.en))
        if (ch.zh) parts.push(stripHtml(ch.zh))
        const full = parts.join('\n')
        const lower = full.toLowerCase()
        const pos = lower.indexOf(q)
        if (pos !== -1) {
          const start = Math.max(0, pos - 36)
          const end = Math.min(full.length, pos + q.length + 36)
          const snippet = (start > 0 ? '…' : '') + full.slice(start, end) + (end < full.length ? '…' : '')
          res.push({ index: i, title: ch.title, snippet })
        }
      })
      this.searchResults = res
    },
    highlight(text, q) {
      const esc = escapeHtml(text)
      const query = q.trim()
      if (!query) return esc
      const lower = text.toLowerCase()
      const qi = lower.indexOf(query.toLowerCase())
      if (qi < 0) return esc
      const before = escapeHtml(text.slice(0, qi))
      const mid = escapeHtml(text.slice(qi, qi + query.length))
      const after = escapeHtml(text.slice(qi + query.length))
      return before + '<mark>' + mid + '</mark>' + after
    },
    jumpToSearch(r) {
      this.searchOpen = false
      this.openChapter(r.index)
    },
    onScroll() {
      const el = this.$refs.bodyEl
      if (!el) return
      if (this.readingMode === 'flip') {
        // 翻页模式下滚动由我们控制，进度按页码
        return
      }
      this.updateProgress(el)
    },
    // 解析本章正文中的 h2/h3 小节，构建"本章小节"目录
    parseSubsections() {
      this.subsections = []
      this.$nextTick(() => {
        setTimeout(() => {
          const content = this.$refs.bodyEl?.querySelector('.reader-content')
          if (!content) return
          const htmls = content.querySelectorAll('.r-html')
          const src = htmls.length ? htmls[0] : content
          const heads = src.querySelectorAll('h2, h3')
          if (!heads.length) {
            this.subsections = []
            return
          }
          const list = []
          heads.forEach((h, i) => {
            h.id = 'sub-' + i
            h.classList.remove('collapsed-head')
            list.push({ id: 'sub-' + i, text: h.textContent.trim(), level: h.tagName === 'H2' ? 2 : 3 })
          })
          this.subsections = list
        }, 140)
      })
    },
    // 点击正文标题 → 折叠/展开其下内容到下一个同级标题
    onContentClick(e) {
      const h = e.target.closest('h2, h3')
      if (!h || e.target.closest('a')) return
      const isH2 = h.tagName === 'H2'
      e.preventDefault()
      const collapsed = !h.classList.contains('collapsed-head')
      h.classList.toggle('collapsed-head', collapsed)
      let el = h.nextElementSibling
      while (el) {
        if (el.tagName === 'H2') break
        if (!isH2 && el.tagName === 'H3') break
        el.style.display = collapsed ? 'none' : ''
        el = el.nextElementSibling
      }
    },
    // 从"本章小节"目录跳转
    jumpToSub(id) {
      this.drawerOpen = false
      this.$nextTick(() => {
        const el = document.getElementById(id)
        const body = this.$refs.bodyEl
        if (el && body) {
          const top = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 64
          body.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
        }
      })
    },
    updateProgress(el) {
      const max = el.scrollHeight - el.clientHeight
      this.progressPct = max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0
    },
    onTouchStart(e) {
      this.touchStartX = e.touches[0].clientX
      this.touchStartY = e.touches[0].clientY
    },
    onTouchEnd(e) {
      if (!this.touchStartX) return
      const dx = e.changedTouches[0].clientX - this.touchStartX
      const dy = e.changedTouches[0].clientY - this.touchStartY
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (this.readingMode === 'flip') {
          this.goPage(dx < 0 ? 1 : -1)
        } else {
          this.go(dx < 0 ? 1 : -1)
        }
      }
      this.touchStartX = 0
      this.touchStartY = 0
    },
    pushHash() {
      const id = this.book.chapters[this.index]?.id
      if (id) history.replaceState(null, '', '#' + id)
    },
    onKey(e) {
      if (!this.open) return
      if (e.key === 'Escape') {
        if (this.searchOpen) this.toggleSearch()
        else if (this.drawerOpen) this.toggleDrawer()
        else this.close()
      } else if (e.key === 'ArrowLeft') this.go(-1)
      else if (e.key === 'ArrowRight') this.go(1)
    },
    onResize() {
      if (this.readingMode === 'flip' && this.open) this.computePages()
    },
  },
  mounted() {
    this.loadState()
    window.addEventListener('keydown', this.onKey)
    window.addEventListener('resize', this.onResize)
    const h = location.hash.slice(1)
    if (h && this.book.chapters.some((c) => c.id === h)) {
      this.openChapter(this.book.chapters.findIndex((c) => c.id === h))
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
    window.removeEventListener('resize', this.onResize)
    document.body.style.overflow = ''
  },
}
</script>

<style scoped>
.novel-toc-title {
  font-size: 1.3rem;
  margin: 8px 0 4px;
  color: var(--deep-ice);
}
.novel-toc-meta {
  font-size: 0.8rem;
  opacity: 0.6;
  font-weight: 400;
  margin-left: 10px;
}
.novel-toc button {
  display: flex;
  align-items: center;
  gap: 8px;
}
.novel-toc .ch-no {
  flex: 0 0 26px;
  font-weight: 700;
  color: var(--aurora-purple);
}
.novel-toc .ch-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.novel-toc .ch-flag {
  flex: 0 0 auto;
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  background: rgba(192, 57, 43, 0.12);
  color: #c0392b;
}
.novel-toc .ch-flag.done {
  background: rgba(74, 227, 181, 0.16);
  color: #1a8a6a;
}

/* ===== 阅读器主体 ===== */
.reader-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow: hidden;
  background: var(--rbg, #f3ead7);
  color: var(--rfg, #3a2f1d);
  font-family: var(--rfont, Georgia, 'Songti SC', serif);
}
/* 主题 */
.theme-paper {
  --rbg: #f3ead7;
  --rfg: #3a2f1d;
  --rpanel: #fbf5e6;
  --rborder: #d8c9a8;
  --raccent: #9c6b3f;
  --rfont: Georgia, 'Times New Roman', 'Songti SC', 'STSong', serif;
}
.theme-parchment {
  --rbg: #e7d8b8;
  --rfg: #43361f;
  --rpanel: #f1e6cd;
  --rborder: #c9b483;
  --raccent: #835a2c;
  --rfont: Georgia, 'Songti SC', 'STSong', serif;
}
.theme-dark {
  --rbg: #15151f;
  --rfg: #d8d2c8;
  --rpanel: #23232f;
  --rborder: rgba(255, 255, 255, 0.1);
  --raccent: #7fe3c4;
  --rfont: Georgia, 'Songti SC', serif;
}
.theme-minimal {
  --rbg: #fafafa;
  --rfg: #222;
  --rpanel: #fff;
  --rborder: #e5e5e5;
  --raccent: #2c6e9c;
  --rfont: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.reader-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(26, 30, 48, 0.78);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  color: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.12);
}
.reader-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
}
.r-book {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.5px;
}
.r-ch {
  opacity: 0.92;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 40vw;
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.25);
  margin-left: 4px;
}
.r-progress {
  font-size: 12px;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.16);
  padding: 2px 10px;
  border-radius: 12px;
}
.reader-controls { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.r-ctrl, .r-close {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: background 0.15s, transform 0.1s;
}
.r-ctrl:hover { background: rgba(255, 255, 255, 0.18); }
.r-ctrl:active { transform: scale(0.96); }
.r-ctrl:disabled { opacity: 0.3; cursor: not-allowed; }
.r-close { background: rgba(192, 57, 43, 0.92); border: none; font-weight: 600; padding: 5px 14px; }
.r-close:hover { background: #c0392b; }

/* 进度条 */
.reader-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--raccent, #9c6b3f);
  z-index: 31;
  transition: width 0.1s linear;
}

/* 目录抽屉 */
.reader-drawer {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
  max-width: 82vw;
  background: var(--rpanel, #fbf5e6);
  border-right: 1px solid var(--rborder, #d8c9a8);
  z-index: 50;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.25);
}
.drawer-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  font-weight: 700;
  border-bottom: 1px solid var(--rborder, #d8c9a8);
}
.drawer-head .r-ctrl { color: var(--rfg, #3a2f1d); border-color: var(--rborder, #d8c9a8); }
.drawer-list { overflow-y: auto; padding: 8px; flex: 1; }
.drawer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--rfg, #3a2f1d);
  padding: 9px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
}
.drawer-item:hover { background: rgba(156, 107, 63, 0.1); }
.drawer-item.active { background: rgba(156, 107, 63, 0.2); font-weight: 700; }
.di-no { flex: 0 0 24px; opacity: 0.6; }
.di-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.di-flag {
  flex: 0 0 auto;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 9px;
  background: rgba(192, 57, 43, 0.14);
  color: #c0392b;
}
.di-flag.done { background: rgba(74, 227, 181, 0.2); color: #1a8a6a; }
.di-bm {
  flex: 0 0 auto;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #c9bca0;
  padding: 0 2px;
}
.di-bm.on { color: #e0a93b; }
.drawer-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 45;
}

/* 本章小节目录 */
.subsec-block {
  border-top: 1px dashed var(--rborder, #d8c9a8);
  margin-top: 6px;
  padding: 10px 8px 14px;
}
.sb-head {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.7;
  padding: 4px 8px 8px;
  letter-spacing: 0.5px;
}
.subsec-item {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--rfg, #3a2f1d);
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
}
.subsec-item:hover { background: rgba(156, 107, 63, 0.12); }
.subsec-item.lv3 { padding-left: 22px; font-size: 12.5px; opacity: 0.9; }
.ss-dot { font-size: 7px; opacity: 0.5; }

/* 正文标题可折叠 */
.r-html :deep(h2), .r-html :deep(h3) { cursor: pointer; position: relative; padding-left: 22px; }
.r-html :deep(h2)::before, .r-html :deep(h3)::before {
  content: '▾';
  position: absolute;
  left: 4px;
  top: 0.1em;
  font-size: 0.7em;
  opacity: 0.55;
  transition: transform 0.18s ease;
}
.r-html :deep(h2.collapsed-head)::before, .r-html :deep(h3.collapsed-head)::before {
  transform: rotate(-90deg);
}

/* 搜索面板 */
.search-panel {
  position: absolute;
  top: 52px;
  right: 16px;
  z-index: 40;
  width: 380px;
  max-width: 90vw;
  background: var(--rpanel, #fbf5e6);
  color: var(--rfg, #3a2f1d);
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  padding: 12px;
}
.search-bar { display: flex; gap: 8px; margin-bottom: 8px; }
.search-input {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid var(--rborder, #d8c9a8);
  border-radius: 6px;
  background: var(--rbg, #f3ead7);
  color: var(--rfg, #3a2f1d);
  font-family: inherit;
  font-size: 14px;
}
.search-results { max-height: 50vh; overflow-y: auto; }
.search-empty { opacity: 0.6; font-size: 13px; padding: 8px; }
.search-result {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--rborder, #d8c9a8);
  color: var(--rfg, #3a2f1d);
  padding: 8px 4px;
  cursor: pointer;
  font-family: inherit;
}
.search-result:hover { background: rgba(156, 107, 63, 0.1); }
.sr-ch { display: block; font-size: 12px; font-weight: 700; opacity: 0.8; margin-bottom: 2px; }
.sr-snippet { display: block; font-size: 13px; line-height: 1.6; opacity: 0.9; }
.sr-snippet :deep(mark) {
  background: #ffd86b;
  color: #3a2f1d;
  padding: 0 2px;
  border-radius: 2px;
}

/* 正文 */
.reader-body {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding-top: 56px;
  padding-bottom: 132px;
}
.reader-body.flip { overflow: hidden; }
.reader-content {
  margin: 0 auto;
  padding: 32px 24px 24px;
  line-height: 1.9;
}
.r-title { text-align: center; margin: 0 0 24px; color: var(--raccent, #9c6b3f); }
.r-panel {
  background: var(--rpanel, #fbf5e6);
  padding: 22px 26px;
  border-radius: 12px;
  border: 1px solid var(--rborder, #d8c9a8);
  margin-bottom: 20px;
}
.r-panel h4 { margin: 0 0 12px; color: var(--raccent, #9c6b3f); }
.r-html :deep(p) { margin: 0 0 1em; }
.r-html :deep(img) { max-width: 100%; border-radius: 8px; margin: 8px 0; }

/* 逐句对照 */
.sentence-view .s-row {
  padding: 10px 0;
  border-bottom: 1px dashed rgba(156, 107, 63, 0.18);
}
.sentence-view .s-row:last-child { border-bottom: none; }
.sentence-view .s-en {
  margin: 0 0 6px;
  color: var(--rfg, #3a2f1d);
  opacity: 0.92;
}
.sentence-view .s-zh {
  margin: 0;
  color: #1a6b52;
  background: rgba(74, 227, 181, 0.18);
  border-left: 3px solid var(--raccent, #9c6b3f);
  border-radius: 0 8px 8px 0;
  padding: 6px 12px;
  line-height: 1.8;
}
.sentence-view .s-zh.pending {
  color: #b08a3c;
  background: rgba(201, 168, 108, 0.14);
  border-left-color: #c9a86c;
  font-style: italic;
  font-size: 0.92em;
}
/* 点击句子高亮（阅读笔记） */
.sentence-view .s-row { cursor: pointer; transition: background 0.15s; border-radius: 8px; }
.sentence-view .s-row:hover { background: rgba(156, 107, 63, 0.07); }
.sentence-view .s-row.marked {
  background: linear-gradient(90deg, rgba(255, 214, 107, 0.30), rgba(255, 214, 107, 0.08));
  box-shadow: inset 3px 0 0 #e0a93b;
}
.sentence-view .s-row.marked .s-zh { background: transparent; border-left-color: #e0a93b; }
.sv-hint { font-size: 11px; font-weight: 400; opacity: 0.62; margin-left: 10px; letter-spacing: 0; }
.sv-clear {
  background: transparent;
  border: 1px solid var(--rborder, #d8c9a8);
  color: var(--rfg, #3a2f1d);
  border-radius: 8px;
  font-size: 10px;
  padding: 1px 7px;
  margin-left: 5px;
  cursor: pointer;
  font-family: inherit;
}
.sv-clear:hover { background: rgba(192, 57, 43, 0.12); border-color: #c0392b; color: #c0392b; }
.theme-dark .sentence-view .s-zh { color: #7fe3c4; background: rgba(74, 227, 181, 0.16); }
.theme-dark .sentence-view .s-row.marked { background: linear-gradient(90deg, rgba(224, 169, 59, 0.30), rgba(224, 169, 59, 0.08)); box-shadow: inset 3px 0 0 #e0a93b; }
.theme-dark .sentence-view .s-row.marked .s-zh { color: #7fe3c4; }

/* 翻页模式页码控制（小巧，置于底部栏上方） */
.flip-bar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 70px;
  z-index: 39;
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(26, 30, 48, 0.82);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 6px 12px;
  color: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}
.flip-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  padding: 2px 8px;
  font-family: inherit;
}
.flip-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.flip-ind { font-size: 12px; opacity: 0.85; min-width: 52px; text-align: center; }

/* 底部栏：仅 上一章 / 下一章 */
.bottom-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px;
  background: rgba(26, 30, 48, 0.92);
  backdrop-filter: blur(14px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.2);
}
.bb-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  padding: 9px 20px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: background 0.15s, transform 0.1s;
  white-space: nowrap;
}
.bb-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.22); }
.bb-btn:active:not(:disabled) { transform: scale(0.97); }
.bb-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.bb-mid {
  flex: 1;
  text-align: center;
  color: #fff;
  opacity: 0.85;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 过渡 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.drawer-enter-active, .drawer-leave-active { transition: transform 0.28s ease; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(-100%); }
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: transform 0.26s ease, opacity 0.26s ease;
}
.slide-left-enter { transform: translateX(42px); opacity: 0; }
.slide-left-leave-to { transform: translateX(-42px); opacity: 0; }
.slide-right-enter { transform: translateX(-42px); opacity: 0; }
.slide-right-leave-to { transform: translateX(42px); opacity: 0; }

@media (max-width: 768px) {
  .reader-info .r-ch { max-width: 50vw; }
  .reader-content { padding: 24px 16px 24px; }
  .bottom-bar { padding: 0 12px; }
  .bb-btn { padding: 8px 14px; font-size: 13px; }
}
</style>
