/* search.js · 全站实时搜索（桌面顶栏搜索框 + 移动端抽屉搜索）
 * 数据：data/search-index.json（_build_search_index.py 生成，约 300 页）
 * 交互：输入即搜（标题>小节>正文三级权重），↑↓选择、Enter 跳转、Esc 关闭、点击外部关闭。
 * 多实例支持：桌面顶栏与移动端抽屉各一个 .fz-search 容器，状态相互独立、共享索引；
 * 通过 window.__wireSiteSearch(label) 可为动态新增的搜索框接线（移动端抽屉重渲染后重建）。
 */
(function () {
  let INDEX = null;
  const instances = [];

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

  // 同分时的卷优先级：核心角色卷 > 核心内容 > 扩展内容 > 参考资料 > 首页
  const VOL_PRIORITY = {
    'vol1-elsa': 0, 'vol2-anna': 0,
    'vol3-characters': 1, 'vol6-story': 1, 'vol5-magic': 1, 'vol7-themes': 1,
    'vol4-world': 2, 'vol8-timeline': 2, 'vol9-production': 2, 'vol10-culture': 2,
    'vol11-songs': 2, 'vol12-novels': 2,
    'vol13-setting': 3, 'vol14-gallery': 3,
    'home': 4
  };
  function volPriority(v) { return VOL_PRIORITY[v] != null ? VOL_PRIORITY[v] : 5; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function mark(text, q) {
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }

  /* 为单个 .fz-search 容器接线（幂等）。label 需包含 <input type="search">。 */
  function wire(label) {
    if (!label || label.dataset.srchOn) return;
    label.dataset.srchOn = '1';
    const input = label.querySelector('input');
    if (!input) return;
    const st = { label: label, input: input, cur: -1, items: [] };

    const box = document.createElement('div');
    box.className = 'srch-box';
    label.appendChild(box);
    st.box = box;

    function close() {
      box.classList.remove('is-open');
      st.cur = -1; st.items = [];
    }

    function render(q) {
      if (!q) { close(); return; }
      fetchIndex().then(d => {
        const hits = d.map(e => [score(e, q), e])
          .filter(x => x[0] > 0)
          .sort((a, b) => (b[0] - a[0]) || (volPriority(a[1].v) - volPriority(b[1].v)))
          .slice(0, 9);
        if (!hits.length) {
          box.innerHTML = '<div class="srch-empty">没有找到「' + esc(q) + '」相关内容</div>';
          box.classList.add('is-open');
          st.items = []; st.cur = -1;
          return;
        }
        box.innerHTML = hits.map(([s, e], i) =>
          '<a class="srch-item" data-h="#' + e.v + '/' + e.id + '">' +
          '<span class="srch-vol">' + esc(e.vl) + '</span>' +
          '<span class="srch-t">' + mark(e.t, q) + '</span>' +
          (e.h && e.h.length ? '<span class="srch-h">' + e.h.slice(0, 3).map(h => mark(h, q)).join(' · ') + '</span>' : '') +
          '</a>').join('');
        box.classList.add('is-open');
        st.items = Array.from(box.querySelectorAll('.srch-item'));
        st.cur = -1;
        st.items.forEach(a => a.addEventListener('click', () => go(a.dataset.h)));
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

    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      timer = setTimeout(() => render(q), 120);
    });
    input.addEventListener('focus', () => { if (input.value.trim()) render(input.value.trim()); });
    input.addEventListener('keydown', (e) => {
      if (!st.items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        st.cur = (st.cur + (e.key === 'ArrowDown' ? 1 : -1) + st.items.length) % st.items.length;
        st.items.forEach((a, i) => a.classList.toggle('is-cur', i === st.cur));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        go(st.items[st.cur >= 0 ? st.cur : 0].dataset.h);
      } else if (e.key === 'Escape') {
        close();
      }
    });

    instances.push(st);
    return st;
  }

  // 点击外部关闭所有下拉
  document.addEventListener('click', (e) => {
    instances.forEach(st => {
      const box = st.box;
      if (box && !box.contains(e.target) && e.target !== st.input) {
        box.classList.remove('is-open');
        st.cur = -1; st.items = [];
      }
    });
  });

  function init() {
    document.querySelectorAll('.fz-search').forEach(wire);
  }

  window.__wireSiteSearch = wire;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
