/* search.js · 全站实时搜索（顶栏搜索框）
 * 数据：data/search-index.json（_build_search_index.py 生成，约 300 页）
 * 交互：输入即搜（标题>小节>正文三级权重），↑↓选择、Enter 跳转、Esc 关闭、点击外部关闭。
 */
(function () {
  let INDEX = null;
  let box = null, input = null, cur = -1, items = [];

  function ensureBox() {
    if (box) return box;
    const label = document.querySelector('.fz-search');
    if (!label) return null;
    box = document.createElement('div');
    box.className = 'srch-box';
    box.id = 'srch-box';
    label.appendChild(box);
    return box;
  }

  function fetchIndex() {
    if (INDEX) return Promise.resolve(INDEX);
    return fetch('data/search-index.json')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => { INDEX = d; return d; });
  }

  function score(entry, q) {
    const t = entry.t.toLowerCase(), ql = q.toLowerCase();
    let s = -1;
    if (t.startsWith(ql)) s = 100;
    else if (t.includes(ql)) s = 80;
    else if ((entry.h || []).some(h => h.toLowerCase().includes(ql))) s = 60;
    else if ((entry.x || '').toLowerCase().includes(ql)) s = 40;
    else if ((entry.vl || '').toLowerCase().includes(ql)) s = 30;
    return s;
  }

  function mark(text, q) {
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }

  function close() {
    if (box) box.classList.remove('is-open');
    cur = -1; items = [];
  }

  function render(q) {
    if (!ensureBox()) return;
    if (!q) { close(); return; }
    fetchIndex().then(d => {
      const hits = d.map(e => [score(e, q), e])
        .filter(x => x[0] > 0)
        .sort((a, b) => b[0] - a[0])
        .slice(0, 9);
      if (!hits.length) {
        box.innerHTML = '<div class="srch-empty">没有找到「' + esc(q) + '」相关内容</div>';
        box.classList.add('is-open');
        items = []; cur = -1;
        return;
      }
      box.innerHTML = hits.map(([s, e], i) =>
        '<a class="srch-item" data-h="#' + e.v + '/' + e.id + '">' +
        '<span class="srch-vol">' + esc(e.vl) + '</span>' +
        '<span class="srch-t">' + mark(e.t, q) + '</span>' +
        (e.h && e.h.length ? '<span class="srch-h">' + e.h.slice(0, 3).map(h => mark(h, q)).join(' · ') + '</span>' : '') +
        '</a>').join('');
      box.classList.add('is-open');
      items = Array.from(box.querySelectorAll('.srch-item'));
      cur = -1;
      items.forEach(a => a.addEventListener('click', () => go(a.dataset.h)));
    }).catch(e => {
      box.innerHTML = '<div class="srch-empty">搜索暂不可用：' + esc(e.message) + '</div>';
      box.classList.add('is-open');
    });
  }

  function go(hash) {
    close();
    if (input) input.value = '';
    input && input.blur();
    if (location.hash === hash) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      location.hash = hash;
    }
  }

  function init() {
    input = document.querySelector('.fz-search input');
    if (!input || input.dataset.srchOn) return;
    input.dataset.srchOn = '1';
    input.placeholder = '搜索角色、歌曲、魔法…';
    ensureBox();
    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      timer = setTimeout(() => render(q), 120);
    });
    input.addEventListener('focus', () => { if (input.value.trim()) render(input.value.trim()); });
    input.addEventListener('keydown', (e) => {
      if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach((a, i) => a.classList.toggle('is-cur', i === cur));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        go(items[cur >= 0 ? cur : 0].dataset.h);
      } else if (e.key === 'Escape') {
        close();
      }
    });
    document.addEventListener('click', (e) => {
      if (box && !box.contains(e.target) && e.target !== input) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
