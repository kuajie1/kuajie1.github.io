/* setting-book.js · 设定集拟真翻书阅读器（第三十九轮）
 * 容器：<div id="fz-book"></div>（pages/setting/book-reader.html）
 * 数据：data/setting-book.json（25 章 / 272 页原书扫描，图注来自逐页笔记）
 * 交互：‹ › 按钮 / 键盘 ←→ / 触屏滑动；章节 chips 跳章；进度 n/272；localStorage 记忆位置。
 */
(function () {
  let DATA = null, list = [], idx = 0;

  function load() {
    const host = document.getElementById('fz-book');
    if (!host || host.dataset.sbOn) return;
    host.dataset.sbOn = '1';
    host.innerHTML = '<div class="sb-loading">📖 正在翻开设定集…</div>';
    fetch('data/setting-book.json?v=20261007b')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => { DATA = d; build(host); })
      .catch(e => { host.innerHTML = '<div class="sb-loading">加载失败：' + e.message + '</div>'; });
  }

  function build(host) {
    list = [];
    DATA.chapters.forEach(c => {
      c.pages.forEach((p, i) => list.push({
        img: p.img, title: p.title, desc: p.desc,
        chapTitle: c.title, no: i + 1, of: c.pages.length
      }));
    });
    host.innerHTML =
      '<div class="sb-bar"><div class="sb-chaps"></div><div class="sb-progress"><b id="sb-cur"></b> / ' + list.length + '</div></div>' +
      '<div class="sb-stage"><button class="sb-nav sb-prev" type="button" aria-label="上一页">‹</button>' +
      '<div class="sb-sheet" id="sb-sheet"></div>' +
      '<button class="sb-nav sb-next" type="button" aria-label="下一页">›</button></div>' +
      '<div class="sb-caption" id="sb-caption"></div>' +
      '<div class="sb-hint">键盘 ← → · 点两侧箭头 · 手机左右滑动 翻页 · 点章节名跳章</div>';
    const chaps = host.querySelector('.sb-chaps');
    DATA.chapters.forEach(c => {
      const b = document.createElement('button');
      b.className = 'sb-chap'; b.type = 'button'; b.title = c.title;
      b.textContent = c.title.replace(/^(F1|F2) 图版 · /, '');
      const start = list.findIndex(p => p.chapTitle === c.title);
      b.addEventListener('click', () => go(start));
      chaps.appendChild(b);
    });
    host.querySelector('.sb-prev').addEventListener('click', () => go(idx - 1));
    host.querySelector('.sb-next').addEventListener('click', () => go(idx + 1));
    if (!window.__sbKeyBound) {
      window.__sbKeyBound = true;
      document.addEventListener('keydown', (e) => {
        const h = document.getElementById('fz-book');
        if (!h || !h.isConnected || !h.offsetParent) return;
        if (e.key === 'ArrowLeft') go(idx - 1);
        else if (e.key === 'ArrowRight') go(idx + 1);
      });
    }
    const stage = host.querySelector('.sb-stage');
    let sx = 0;
    stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    let saved = 0;
    try { saved = parseInt(localStorage.getItem('fz-book-pos') || '0', 10) || 0; } catch (err) {}
    go(Math.max(0, Math.min(saved, list.length - 1)));
  }

  function go(n) {
    if (!list.length) return;
    const dir = n >= idx ? 1 : -1;
    idx = Math.max(0, Math.min(list.length - 1, n));
    const p = list[idx];
    const sheet = document.getElementById('sb-sheet');
    if (!sheet) return;
    sheet.innerHTML = '<img src="' + p.img + '" alt="' + p.title.replace(/"/g, '&quot;') + '" />';
    sheet.classList.remove('sb-flip-next', 'sb-flip-prev');
    void sheet.offsetWidth;
    sheet.classList.add(dir > 0 ? 'sb-flip-next' : 'sb-flip-prev');
    const cap = document.getElementById('sb-caption');
    if (cap) cap.innerHTML = '<b>' + p.title.replace(/</g, '&lt;') + '</b>' +
      (p.desc ? '<span>' + p.desc.replace(/</g, '&lt;') + '</span>' : '') +
      '<small>' + p.chapTitle.replace(/</g, '&lt;') + ' · ' + p.no + '/' + p.of + '</small>';
    const cur = document.getElementById('sb-cur');
    if (cur) cur.textContent = idx + 1;
    try { localStorage.setItem('fz-book-pos', String(idx)); } catch (err) {}
    const host = document.getElementById('fz-book');
    if (host) host.querySelectorAll('.sb-chap').forEach((b, i) =>
      b.classList.toggle('is-on', DATA.chapters[i] && p.chapTitle === DATA.chapters[i].title));
  }

  window.SB = { load: load };
})();
