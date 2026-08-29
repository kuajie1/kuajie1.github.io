/* novel-reader.js · 小说双语阅读器（vol12-novels / reader-* 页面）
 * 由 index.html 全局加载；片段页通过 inline onclick 调用 NZR.*。
 * 数据：data/novels/{book}.json（由 build_novel_readers.py 从小说双语库生成，段落级双语）。
 */
(function () {
  const cache = {};
  let cur = { book: null, ci: 0 };

  function $(id) { return document.getElementById(id); }

  function bookId() {
    const a = $('nzr-article');
    return a ? a.dataset.book : null;
  }

  function fetchBook(book) {
    if (cache[book]) return Promise.resolve(cache[book]);
    return fetch('data/novels/' + book + '.json')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => { cache[book] = d; return d; });
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderChapter(d, ci) {
    const ch = d.chapters[ci];
    const art = $('nzr-article');
    let html = '<header class="nzr-chtitle"><span class="nzr-chnum">第 ' + (ci + 1) + ' 章 · 共 ' + d.chapters.length + ' 章</span>' +
      '<h2>' + esc(ch.title || '') + '</h2><span class="nzr-flake">❄</span></header>';
    for (const p of ch.paras) {
      html += '<div class="nzr-pair">' +
        '<p class="nzr-en">' + esc(p.en) + '</p>' +
        '<p class="nzr-zh">' + esc(p.zh) + '</p></div>';
    }
    html += '<div class="nzr-theend">❄ ❄ ❄</div>';
    art.innerHTML = html;
    const sel = $('nzr-ch');
    if (sel && sel.value !== String(ci)) sel.value = String(ci);
    const pos = $('nzr-pos');
    if (pos) pos.textContent = (ci + 1) + ' / ' + d.chapters.length;
    const ca = document.querySelector('.fz-content-area, #content-area');
    if (ca) ca.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function ensureOptions(d) {
    const sel = $('nzr-ch');
    if (!sel || sel.options.length) return;
    d.chapters.forEach((c, i) => {
      const o = document.createElement('option');
      o.value = String(i);
      o.textContent = '第 ' + (i + 1) + ' 章 ' + (c.title || '');
      sel.appendChild(o);
    });
  }

  const NZR = {
    load() {
      const art = $('nzr-article');
      if (!art || art.dataset.nzrOn) return;   // 幂等：同一片注入只启动一次
      const book = art.dataset.book;
      if (!book) return;
      art.dataset.nzrOn = '1';
      cur = { book, ci: 0 };
      fetchBook(book).then(d => {
        ensureOptions(d);
        NZR.applyMode();
        renderChapter(d, 0);
      }).catch(e => {
        art.innerHTML = '<div class="nzr-loading">读取失败：' + e.message +
          '<br><small>请通过 python -m http.server 访问本站，并按 Ctrl+F5 强制刷新。</small></div>';
      });
    },
    pick(v) {
      const d = cache[cur.book];
      if (!d) return;
      cur.ci = parseInt(v, 10) || 0;
      renderChapter(d, cur.ci);
    },
    nav(dx) {
      const d = cache[cur.book];
      if (!d) return;
      const ni = cur.ci + dx;
      if (ni < 0 || ni >= d.chapters.length) return;
      cur.ci = ni;
      renderChapter(d, ni);
    },
    mode(m) {
      const art = $('nzr-article');
      if (!art) return;
      art.classList.remove('nzr-mode-bi', 'nzr-mode-zh', 'nzr-mode-en');
      art.classList.add('nzr-mode-' + m);
      try { localStorage.setItem('nzr-mode', m); } catch (e) {}
      document.querySelectorAll('.nzr-mode').forEach(b =>
        b.classList.toggle('is-on', b.dataset.m === m));
    },
    applyMode() {
      let m = 'bi';
      try { m = localStorage.getItem('nzr-mode') || 'bi'; } catch (e) {}
      NZR.mode(m);
    }
  };
  window.NZR = NZR;

  // 左右方向键翻章
  document.addEventListener('keydown', (ev) => {
    if (!bookId() || !cache[cur.book]) return;
    if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
    if (ev.key === 'ArrowRight') NZR.nav(1);
    if (ev.key === 'ArrowLeft') NZR.nav(-1);
  });

  // 自检式启动：SPA 内容区一出现阅读器页面就自动加载，
  // 不依赖 loader.js 的版本或注入时序（旧标签页也能工作）。
  function watch() {
    const art = document.getElementById('nzr-article');
    if (art && !art.dataset.nzrOn) NZR.load();
  }
  function initObserver() {
    const area = document.getElementById('content-area');
    if (!area) { setTimeout(initObserver, 300); return; }
    new MutationObserver(watch).observe(area, { childList: true, subtree: false });
    watch();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
