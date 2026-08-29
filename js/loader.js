/* loader.js — RP 重构内容加载器（v2：雪花 + 灵性工具栏 + 默认卷封面 + 字母索引 + 标签云 + 随机跳转）
   位置：01_成品/redesign-prototype/js/loader.js
   原则：纯原生 JS，0 依赖。emoji 在 chip/卡片使用（最终交付已批准 emoji）。
*/

const NAV_URL  = '/data/nav_tree.json';
const PAGE_BASE = '/pages/';

let navData = null;
let currentVolume = null;
let currentPageId = null;
let currentEntryKey = null;

const $ = (id) => document.getElementById(id);

window.addEventListener('DOMContentLoaded', initApp);

/* ===================================================================
   初始化
   =================================================================== */
async function initApp() {
  spawnSnow(36);                  // 立即注入雪花，避免空白
  try {
    const res = await fetch(NAV_URL);
    if (!res.ok) throw new Error('导航 HTTP ' + res.status);
    navData = await res.json();
  } catch (e) {
    $('content-area').innerHTML = `<div class="fz-error"><h2>无法加载导航数据</h2><p>请通过：<code>python -m http.server 8080</code> 访问本页</p><p style="opacity:.7">${e.message}</p></div>`;
    return;
  }
  renderTabs();
  renderToolbar();                // 灵性工具栏
  initLightbox();                // 图片点击放大
  wireChrome();
  initReadProgress();            // 阅读进度条 + 返回顶部
  // 默认：打开当前卷的卷封面
  const hash = location.hash.replace(/^#/, '');
  if (hash) onHashChange();
  else loadVolume(Object.keys(navData)[0], { mode: 'cover' });
  window.addEventListener('hashchange', onHashChange);
}

/* ===================================================================
   顶部 12 卷 Tab
   =================================================================== */
function renderTabs() {
  const tabs = $('vol-tabs'); if (!tabs) return;
  let html = '';
  for (const [k, v] of Object.entries(navData)) {
    html += `<button class="fz-voltab__item" data-vol="${k}"><span aria-hidden="true">${v.emoji}</span> ${v.label}</button>`;
  }
  tabs.innerHTML = html;
  tabs.querySelectorAll('.fz-voltab__item').forEach(b => b.addEventListener('click', () => loadVolume(b.dataset.vol, { mode: 'cover' })));
}
function highlightTab(vk) {
  $('vol-tabs').querySelectorAll('.fz-voltab__item').forEach(b => b.classList.toggle('is-active', b.dataset.vol === vk));
}

/* ===================================================================
   灵性工具栏（顶部 Tab 下方的 chip 行）
   =================================================================== */
function renderToolbar() {
  const bar = $('fz-toolbar'); if (!bar) return;
  bar.innerHTML = `
    <span class="fz-toolbar__title">工具</span>
    <button class="fz-chip" data-act="random"><span class="fz-chip__emoji">🎲</span>随机跳转</button>
    <button class="fz-chip" data-act="az"><span class="fz-chip__emoji">🔤</span>字母索引</button>
    <button class="fz-chip" data-act="tag"><span class="fz-chip__emoji">🏷️</span>标签云</button>
    <button class="fz-chip" data-act="cover"><span class="fz-chip__emoji">📖</span>回到本卷卷首</button>
  `;
  bar.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => onToolbar(b.dataset.act)));
}

function onToolbar(act) {
  if (act === 'random') return jumpRandom();
  if (act === 'az')     return openAZ();
  if (act === 'tag')    return openTags();
  if (act === 'cover' && currentVolume) return loadVolume(currentVolume, { mode: 'cover' });
}

/* ===================================================================
   卷切换
   =================================================================== */
function loadVolume(volKey, opts = { mode: 'cover' }) {
  if (!navData[volKey]) volKey = Object.keys(navData)[0];
  currentVolume = volKey;
  highlightTab(volKey);
  renderSidebar(volKey);

  const vol = navData[volKey];
  if (opts.mode === 'cover' && vol.cover_page) {
    loadPage(vol.cover_page, { isCover: true, volume: volKey });
    return;
  }
  if (vol.placeholder || !vol.children || !Object.keys(vol.children).length) {
    showPlaceholder(vol); return;
  }
  // 默认进第一个条目的总览
  const firstEntryId = Object.keys(vol.children)[0];
  const firstPageId = vol.children[firstEntryId].pages[0].id;
  loadPage(firstPageId, { entryKey: firstEntryId });
}

/* ===================================================================
   左侧手风琴导航
   =================================================================== */
function renderSidebar(volKey) {
  const side = $('sidenav'); if (!side) return;
  const vol = navData[volKey];
  let html = `<div class="fz-sidenav__vol">${vol.emoji} ${vol.label} · 共 ${Object.keys(vol.children || {}).length} 个条目</div>`;
  for (const [eid, entry] of Object.entries(vol.children || {})) {
    const pages = entry.pages.map(p =>
      `<li><a class="fz-navpage" data-page="${p.id}" data-entry="${eid}">${p.label}</a></li>`
    ).join('');
    html += `<div class="fz-navgroup" data-entry="${eid}">
      <div class="fz-navgroup__head" data-entry="${eid}">
        <span>${entry.emoji} ${entry.label}</span>
        <svg class="fz-caret"><use href="#i-chevron-right"/></svg>
      </div>
      <ul class="fz-navgroup__pages">${pages}</ul>
    </div>`;
  }
  side.innerHTML = html;

  side.querySelectorAll('.fz-navgroup__head').forEach(head => {
    head.addEventListener('click', () => {
      const grp = head.closest('.fz-navgroup');
      const willOpen = !grp.classList.contains('is-open');
      side.querySelectorAll('.fz-navgroup').forEach(g => g.classList.remove('is-open'));
      if (willOpen) grp.classList.add('is-open');
    });
  });
  side.querySelectorAll('.fz-navpage').forEach(link => {
    link.addEventListener('click', () => loadPage(link.dataset.page, { entryKey: link.dataset.entry }));
  });
}

function setActivePage(pageId) {
  $('sidenav').querySelectorAll('.fz-navpage').forEach(a => a.classList.toggle('is-active', a.dataset.page === pageId));
  const active = $('sidenav').querySelector(`.fz-navpage[data-page="${pageId}"]`);
  if (active) {
    const grp = active.closest('.fz-navgroup');
    if (grp) {
      $('sidenav').querySelectorAll('.fz-navgroup').forEach(g => g.classList.remove('is-open'));
      grp.classList.add('is-open');
      currentEntryKey = active.dataset.entry;
    }
  }
}

/* ===================================================================
   内容加载
   =================================================================== */
async function loadPage(pageId, opts = {}) {
  currentPageId = pageId;
  const url = PAGE_BASE + pageId + '.html';
  const content = $('content-area');
  content.scrollTop = 0;
  content.innerHTML = `<div style="text-align:center;padding:60px 0;color:var(--fz-text-3)">载入中…</div>`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    content.innerHTML = html;
    if (window.NZR && document.getElementById('nzr-article')) NZR.load();
    if (opts.isCover) {
      // 卷封面：清空 TOC、侧栏不高亮具体页
      $('pagetoc').innerHTML = '';
    } else {
      initTOC();
      setActivePage(pageId);
    }
    updateHash();
  } catch (e) {
    content.innerHTML = `<div class="fz-error"><h2>子页面加载失败</h2><p>页面 ID：<code>${pageId}</code></p><p>${e.message}</p></div>`;
    $('pagetoc').innerHTML = '';
  }
}

function updateHash() {
  const h = '#' + currentVolume + '/' + currentPageId;
  if (location.hash !== h) history.replaceState(null, '', h);
}

function onHashChange() {
  const h = location.hash.replace(/^#/, '');
  if (!h) return loadVolume(Object.keys(navData)[0], { mode: 'cover' });
  const slash = h.indexOf('/');
  const vk = h.slice(0, slash);
  const pid = h.slice(slash + 1);
  if (!navData[vk]) return loadVolume(Object.keys(navData)[0], { mode: 'cover' });
  if (vk !== currentVolume) {
    currentVolume = vk;
    highlightTab(vk); renderSidebar(vk);
  }
  loadPage(pid);
}

/* ===================================================================
   页内 TOC
   =================================================================== */
function initTOC() {
  const toc = $('pagetoc'); if (!toc) return;
  const heads = $('content-area').querySelectorAll('h2, h3');
  if (!heads.length) { toc.innerHTML = ''; return; }
  let html = '<div class="fz-pagetoc__title">本页目录</div><ul>';
  heads.forEach((h, i) => {
    const id = h.id || ('sec-' + i); h.id = id;
    html += `<li class="toc-${h.tagName.toLowerCase()}"><a data-toc="${id}">${h.textContent}</a></li>`;
  });
  html += '</ul>';
  toc.innerHTML = html;
  toc.querySelectorAll('a[data-toc]').forEach(a => a.addEventListener('click', () => {
    const t = document.getElementById(a.dataset.toc); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  if (window.__updateReadProgress) window.__updateReadProgress();  // 新页面：重置进度条
}

/* ===================================================================
   随机跳转 · 字母索引 · 标签云
   =================================================================== */
function jumpRandom() {
  // 收集团内 navData 全部分页，随机选一个
  const all = [];
  for (const [vk, vol] of Object.entries(navData)) {
    if (vol.cover_page) all.push({ vol: vk, page: vol.cover_page, label: `${vol.emoji} ${vol.label} 卷首` });
    for (const [eid, entry] of Object.entries(vol.children || {})) {
      for (const p of entry.pages) all.push({ vol: vk, page: p.id, label: p.label });
    }
  }
  // 当前所在卷优先
  const sameVol = all.filter(x => x.vol === currentVolume);
  const pick = sameVol.length > 1 ? sameVol[Math.floor(Math.random() * sameVol.length)] : all[Math.floor(Math.random() * all.length)];
  location.hash = '#' + pick.vol + '/' + pick.page;
}

function openAZ() {
  // 字母索引 = 当前卷内所有条目按拼音首字母
  const vol = navData[currentVolume]; if (!vol) return;
  const items = Object.entries(vol.children || {});
  // 简单按中文拼音：不细分，全中文展示，按条目 label 排序
  items.sort((a, b) => a[1].label.localeCompare(b[1].label, 'zh'));
  const list = items.map(([eid, e]) => `
    <a class="fz-azitem" href="#${currentVolume}/${vol.children[eid].pages[0].id}">
      ${e.emoji} ${e.label}
      <small>${e.pages.length} 子页</small>
    </a>`).join('');
  openPop(`${vol.emoji} ${vol.label}卷 · 字母索引`, `<div class="fz-azgrid">${list || '<p>本卷暂无内容</p>'}</div>`);
}

const TAG_MAP = [
  ['#冰雪女王', 'vol1-elsa'],
  ['#阿伦黛尔', 'vol4-world'],
  ['#魔法森林', 'vol4-world'],
  ['#LetItGo',  'vol11-songs'],
  ['#自我认同', 'vol7-themes'],
  ['#姐妹情',   'vol7-themes'],
  ['#冰雪魔法', 'vol5-magic'],
  ['#设定集',   'vol13-setting'],
  ['#概念艺术', 'vol14-gallery'],
  ['#幕后故事', 'vol9-production'],
  ['#挪威文化', 'vol10-culture'],
  ['#小说',     'vol12-novels'],
];
function openTags() {
  const html = '<div class="fz-tagcloud">' + TAG_MAP.map(([tag, volKey]) => {
    const vol = navData[volKey]; if (!vol) return '';
    const cover = vol.cover_page || (vol.children && Object.keys(vol.children)[0]
      ? vol.children[Object.keys(vol.children)[0]].pages[0].id : '');
    return `<a href="#${volKey}/${cover}" data-tag="${tag}">${tag}</a>`;
  }).join('') + '</div>';
  openPop('🏷️ 标签云 · 一键通往相关卷', html);
}

/* ===================================================================
   通用弹层
   =================================================================== */
function openPop(title, html) {
  closePop();
  const mask = document.createElement('div'); mask.className = 'fz-pop__mask';
  const pop = document.createElement('div'); pop.className = 'fz-pop';
  pop.innerHTML = `<button class="fz-pop__close" aria-label="关闭">✕</button>
    <h2 class="fz-pop__title">${title}</h2>${html}`;
  document.body.appendChild(mask); document.body.appendChild(pop);
  const close = () => { mask.remove(); pop.remove(); };
  pop.querySelector('.fz-pop__close').addEventListener('click', close);
  mask.addEventListener('click', close);
  pop.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close()));
}
function closePop() {
  document.querySelectorAll('.fz-pop, .fz-pop__mask').forEach(n => n.remove());
}

/* ===================================================================
   占位卷展示
   =================================================================== */
function showPlaceholder(vol) {
  $('content-area').innerHTML = `<div class="fz-placeholder">
    <div style="font-size:44px;margin-bottom:10px">${vol.emoji}</div>
    <h2>${vol.label}卷</h2>
    <blockquote style="font-style:italic;color:var(--fz-text-3);max-width:480px;margin:14px auto;padding:0 14px;border-left:3px solid var(--fz-aurora-purple);text-align:left">${vol.quote||''}</blockquote>
    <p>${vol.note || '本卷将在后续阶段生成。'}</p>
  </div>`;
  $('pagetoc').innerHTML = '';
}

/* ===================================================================
   雪花（动态注入，36 朵，默认飘动）
   =================================================================== */
const SNOW_GLYPHS = ['❄', '❅', '❆', '✻', '✼'];
function spawnSnow(n = 32) {
  let host = document.querySelector('.fz-snow-host');
  if (!host) { host = document.createElement('div'); host.className = 'fz-snow-host'; document.body.appendChild(host); }
  host.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const f = document.createElement('span');
    f.className = 'flake';
    f.textContent = SNOW_GLYPHS[i % SNOW_GLYPHS.length];
    const left = Math.random() * 100;
    const dur = 9 + Math.random() * 11;          // 9–20 s
    const delay = -Math.random() * dur;          // 错相
    const size = 10 + Math.random() * 16;        // 10–26 px
    const drift = (Math.random() - .5) * 80;     // -40 ~ 40 px
    f.style.cssText = `left:${left}vw;font-size:${size}px;animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px;`;
    host.appendChild(f);
  }
}

/* ===================================================================
   图片灯箱（点击内容区任意图片放大查看）
   =================================================================== */
function initLightbox() {
  const lb = document.getElementById('fz-lightbox');
  const lbImg = document.getElementById('fz-lightbox-img');
  if (!lb || !lbImg) return;
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.fz-fig img, .fz-overview__media img, .fz-cover__card img, .fz-page-body img');
    if (!img) return;
    if (img.closest('audio, .fz-audio-player')) return;
    e.preventDefault();
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
  });
  const close = () => { lb.classList.remove('is-open'); lbImg.src = ''; lb.setAttribute('aria-hidden', 'true'); };
  lb.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ===================================================================
   主题切换 + 移动菜单
   =================================================================== */
function wireChrome() {
  const toggle = document.querySelector('.fz-theme-toggle');
  if (toggle) {
    const sync = () => {
      const dark = document.documentElement.classList.contains('dark');
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.innerHTML = `<svg class="fz-icon"><use href="#${dark ? 'i-sun' : 'i-moon'}"/></svg>`;
    }; sync();
    toggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const dark = document.documentElement.classList.contains('dark');
      try { localStorage.setItem('fz-theme', dark ? 'dark' : 'light'); } catch (e) {}
      sync();
    });
  }
  const mb = document.querySelector('.fz-nav__menu-btn');
  const side = $('sidenav');
  if (mb && side) mb.addEventListener('click', () => side.classList.toggle('is-open'));
}

/* ===================================================================
   阅读进度条 + 返回顶部（监听正文区滚动；正文在 #content-area 内滚动）
   =================================================================== */
function initReadProgress() {
  const pane = $('content-area');
  const fill = $('fz-readbar-fill');
  const top  = $('fz-readtop');
  if (!pane) return;
  const update = () => {
    const max = pane.scrollHeight - pane.clientHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (pane.scrollTop / max) * 100)) : 0;
    if (fill) fill.style.width = pct + '%';
    if (top)  top.classList.toggle('is-visible', pane.scrollTop > 280);
  };
  pane.addEventListener('scroll', update, { passive: true });
  window.addEventListener('scroll', update, { passive: true });   // 兜底（窗口滚动时）
  if (top) top.addEventListener('click', () => pane.scrollTo({ top: 0, behavior: 'smooth' }));
  window.__updateReadProgress = update;
  update();
}
