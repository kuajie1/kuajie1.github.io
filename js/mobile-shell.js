/* mobile-shell.js · 移动端体验层（≤760px）
 * 1. 左侧悬浮球：点击打开「本卷目录」抽屉（含全站搜索 + 工具收纳），点抽屉外自动收回
 * 2. 顶部工具栏在移动端隐藏，工具 chips 收进抽屉（克隆后补回真实动作，点完收回）
 * 3. 头部 ☰ 接上（loader 在移动端不重复绑定，避免反向开关）
 * 4. 层级：抽屉(120) > 遮罩(110) > 顶栏(100) > 悬浮球(46)；抽屉打开时悬浮球滑出隐藏，
 *    不再遮挡目录内容；点击导航项后自动收回；切卷重渲染后自动重建抽屉附加件。
 */
(function () {
  let built = false;

  function isMobile() { return window.matchMedia('(max-width: 760px)').matches; }

  function build() {
    if (!isMobile()) return;
    const side = document.getElementById('sidenav');
    if (!side) return;
    if (!built) {
      built = true;

      // 悬浮球（左侧）
      const fab = document.createElement('button');
      fab.className = 'tz-fab';
      fab.setAttribute('aria-label', '打开本卷目录');
      fab.innerHTML = '<span class="tz-fab__icon">☰</span><span class="tz-fab__label">目录</span>';
      fab.addEventListener('click', toggle);
      document.body.appendChild(fab);

      // 背景遮罩（点外面自动收回）
      const bd = document.createElement('div');
      bd.className = 'tz-backdrop';
      bd.addEventListener('click', close);
      document.body.appendChild(bd);

      // 头部 ☰ 接上（loader 在移动端不绑定）
      const mb = document.querySelector('.fz-nav__menu-btn');
      if (mb) mb.addEventListener('click', toggle);

      // 导航项点击后自动收回（事件委托，侧栏重渲染后依然有效）
      side.addEventListener('click', (e) => {
        if (e.target.closest('.fz-navpage')) close();
      });

      window.__mobClose = close;

      // 侧栏被 loader 重渲染（切卷/换页）后，重新注入抽屉附加件
      new MutationObserver(() => { if (isMobile()) injectExtras(side); })
        .observe(side, { childList: true });

      // 换页自动收回
      window.addEventListener('hashchange', close);
    }
    injectExtras(side);
  }

  /* 注入抽屉附加件：头部（标题+关闭）、全站搜索、工具收纳（幂等，可反复调用） */
  function injectExtras(side) {
    // 1) 抽屉头
    if (!side.querySelector('.mob-drawer-head')) {
      const head = document.createElement('div');
      head.className = 'mob-drawer-head';
      head.innerHTML = '<span class="mob-drawer-head__title">☰ 本卷目录</span>' +
        '<button class="mob-drawer-head__close" type="button" aria-label="关闭目录">✕</button>';
      head.querySelector('.mob-drawer-head__close').addEventListener('click', close);
      side.insertBefore(head, side.firstChild);
    }

    // 2) 全站搜索（新建一个 .fz-search 容器并由 search.js 接线；放抽屉头下方）
    if (!side.querySelector('.mob-search')) {
      const mobSearch = document.createElement('div');
      mobSearch.className = 'mob-search';
      mobSearch.innerHTML =
        '<label class="fz-search"><svg class="fz-icon"><use href="#i-search"/></svg>' +
        '<input type="search" placeholder="搜索角色、歌曲、魔法…" aria-label="站内搜索" /></label>';
      const head = side.querySelector('.mob-drawer-head');
      side.insertBefore(mobSearch, head ? head.nextSibling : side.firstChild);
      const label = mobSearch.querySelector('.fz-search');
      if (window.__wireSiteSearch) window.__wireSiteSearch(label);
    }

    // 3) 工具 chips 收进抽屉（克隆并补回真实动作，点完收回）
    const toolbar = document.getElementById('fz-toolbar');
    if (toolbar && !side.querySelector('.mob-tools')) {
      const tools = document.createElement('div');
      tools.className = 'mob-tools';
      tools.innerHTML = '<div class="mob-tools__title">🧰 灵性工具</div>';
      toolbar.querySelectorAll('button, a').forEach(el => {
        const c = el.cloneNode(true);
        c.addEventListener('click', () => {
          close();
          const act = c.getAttribute('data-act');
          if (act && window.onToolbar) window.onToolbar(act);
        });
        tools.appendChild(c);
      });
      side.appendChild(tools);
    }
  }

  function toggle() {
    const side = document.getElementById('sidenav');
    if (!side) return;
    const open = !side.classList.contains('is-open');
    side.classList.toggle('is-open', open);
    const bd = document.querySelector('.tz-backdrop');
    if (bd) bd.classList.toggle('is-on', open);
    document.body.classList.toggle('mob-locked', open);
  }

  function close() {
    const side = document.getElementById('sidenav');
    if (side) side.classList.remove('is-open');
    const bd = document.querySelector('.tz-backdrop');
    if (bd) bd.classList.remove('is-on');
    document.body.classList.remove('mob-locked');
  }

  /* 屏幕跨过移动端断点（如手机横屏）时，拆除移动端件、恢复桌面态 */
  function teardown() {
    document.querySelectorAll('.tz-fab, .tz-backdrop, .mob-drawer-head, .mob-tools, .mob-search')
      .forEach(n => n.remove());
    document.body.classList.remove('mob-locked');
    const side = document.getElementById('sidenav');
    if (side) side.classList.remove('is-open');
    removeMobTOC();
    built = false;
  }

  /* ---- 页内目录（长页）：右下悬浮按钮 + 小节弹层 ---- */
  let tocBuilt = false;

  function updateMobTOC(data) {
    if (!isMobile()) { removeMobTOC(); return; }
    if (!data || !data.length) { removeMobTOC(); return; }
    ensureMobTOC(data);
  }

  function ensureMobTOC(data) {
    if (!tocBuilt) {
      tocBuilt = true;
      const fab = document.createElement('button');
      fab.className = 'fz-tocfab';
      fab.setAttribute('aria-label', '本页目录');
      fab.innerHTML = '☰';
      fab.addEventListener('click', togglePop);
      document.body.appendChild(fab);
      const pop = document.createElement('div');
      pop.className = 'fz-tocpop';
      pop.innerHTML = '<div class="fz-tocpop__head">本页目录<button class="fz-tocpop__close" type="button" aria-label="关闭">✕</button></div><ul></ul>';
      pop.querySelector('.fz-tocpop__close').addEventListener('click', closePop);
      pop.addEventListener('click', (e) => {
        if (e.target.closest('a[data-toc]')) { jumpTo(e.target.closest('a[data-toc]').dataset.toc); closePop(); }
      });
      document.body.appendChild(pop);
    }
    const fab = document.querySelector('.fz-tocfab');
    const pop = document.querySelector('.fz-tocpop');
    if (fab) fab.classList.add('is-on');
    if (!pop) return;
    const ul = pop.querySelector('ul');
    ul.innerHTML = data.map(d => `<li class="${d.tag === 'h3' ? 'toc-h3' : ''}"><a data-toc="${d.id}">${d.text}</a></li>`).join('');
  }

  function removeMobTOC() {
    if (!tocBuilt) return;
    document.querySelectorAll('.fz-tocfab, .fz-tocpop').forEach(n => n.remove());
    tocBuilt = false;
  }

  function jumpTo(id) {
    const t = document.getElementById(id);
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function togglePop() {
    const pop = document.querySelector('.fz-tocpop');
    const fab = document.querySelector('.fz-tocfab');
    if (!pop) return;
    const open = !pop.classList.contains('is-on');
    pop.classList.toggle('is-on', open);
    if (fab) fab.classList.toggle('is-pop', open);
  }

  function closePop() {
    const pop = document.querySelector('.fz-tocpop');
    const fab = document.querySelector('.fz-tocfab');
    if (pop) pop.classList.remove('is-on');
    if (fab) fab.classList.remove('is-pop');
  }

  window.__mobTOC = { update: updateMobTOC };
  // 首屏若已发布 TOC 数据，立即消费（切页后由 loader.initTOC 再次推送）
  if (window.__pageTOC && window.__pageTOC.length) updateMobTOC(window.__pageTOC);

  function watchBreakpoint() {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 760px)');
    const on = (e) => { if (e.matches) build(); else teardown(); };
    if (mq.addEventListener) mq.addEventListener('change', on);
    else if (mq.addListener) mq.addListener(on);
  }

  function init() {
    const area = document.getElementById('content-area');
    if (!area) { setTimeout(init, 300); return; }
    new MutationObserver(() => { if (isMobile()) build(); }).observe(area, { childList: true });
    build();
    watchBreakpoint();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
