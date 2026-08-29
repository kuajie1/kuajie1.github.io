/* mobile-shell.js · 移动端体验层（≤760px）
 * 1. 左侧悬浮球：点击打开「本卷目录」抽屉（含工具收纳），点击抽屉外自动收回
 * 2. 顶部工具栏在移动端隐藏，工具 chips 收进抽屉
 * 3. 顺手接线头部 ☰ 按钮（原来没有绑定）
 */
(function () {
  let built = false;

  function isMobile() { return window.matchMedia('(max-width: 760px)').matches; }

  function build() {
    if (built || !isMobile()) return;
    const side = document.getElementById('sidenav');
    if (!side) return;
    built = true;

    // 工具 chips 收进抽屉顶部
    const toolbar = document.getElementById('fz-toolbar');
    if (toolbar && !side.querySelector('.mob-tools')) {
      const tools = document.createElement('div');
      tools.className = 'mob-tools';
      tools.innerHTML = '<div class="mob-tools__title">🧰 灵性工具</div>';
      toolbar.querySelectorAll('button, a').forEach(el => {
        const c = el.cloneNode(true);
        c.addEventListener('click', () => close());
        tools.appendChild(c);
      });
      side.insertBefore(tools, side.firstChild);
    }

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

    // 头部 ☰ 也接上
    const mb = document.querySelector('.fz-nav__menu-btn');
    if (mb) mb.addEventListener('click', toggle);

    function toggle() {
      const open = !side.classList.contains('is-open');
      side.classList.toggle('is-open', open);
      bd.classList.toggle('is-on', open);
      document.body.classList.toggle('mob-locked', open);
    }
    function close() {
      side.classList.remove('is-open');
      bd.classList.remove('is-on');
      document.body.classList.remove('mob-locked');
    }
    window.__mobClose = close;

    // 换页自动收回
    window.addEventListener('hashchange', close);
  }

  function init() {
    const area = document.getElementById('content-area');
    if (!area) { setTimeout(init, 300); return; }
    new MutationObserver(() => { if (isMobile()) build(); }).observe(area, { childList: true });
    build();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
