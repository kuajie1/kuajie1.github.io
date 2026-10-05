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
    // ?v= 与 _build_search_index.py 重建后 bump 的版本保持一致：索引更新后老访客才会真正取到新索引
    return fetch('data/search-index.json?v=20261005f')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => { INDEX = d; return d; });
  }

  // 中英别名表（第三十八轮起）：英文名/中文译名互相命中。
  // 2026-10-01 体检轮补齐：
  // ① 反向（中→英）原先只有 12 条，正向 18 条英→中，导致「修缮情缘」「在夏天」等
  //    只在站内容里零出现的中文译名完全搜不到 —— 现每个正向条目都配反向条目。
  // ② 译名以站内实际用字为准（实测全站命中）：大帕比(pabbie)、布鲁尼(bruni)、
  //    诺克(nokk)、盖尔(gale)、伊杜娜/阿格纳尔(iduna/agnarr)；
  //    歌名冰封之心(frozen heart)、下一步对的事(next right thing) 为站内真实用字。
  // ③《All Is Found》中文译名统一为「寻真」；小说卷沿用「一切皆有源」，两者互指。
  const ALIASES = {
    'elsa': ['艾莎'], 'anna': ['安娜'], 'olaf': ['雪宝'], 'kristoff': ['克里斯托夫'],
    'sven': ['斯文'], 'hans': ['汉斯'], 'arendelle': ['阿伦黛尔'], 'northuldra': ['北地人'],
    'ahtohallan': ['阿塔霍兰'], 'nokk': ['水灵', '诺克'], 'bruni': ['火灵', '布鲁尼'],
    'gale': ['风灵', '盖尔'], 'pabbie': ['大帕比', '地精长老'], 'iduna': ['伊杜娜'],
    'agnarr': ['阿格纳尔'],
    'let it go': ['随它吧'], 'into the unknown': ['前往未知'], 'all is found': ['寻真', '一切皆有源'],
    'some things never change': ['一切如常'], 'do you want to build a snowman': ['你想不想堆个雪人'],
    'love is an open door': ['爱是敞开的门'], 'in summer': ['在夏天'], 'fixer upper': ['修缮情缘'],
    'frozen heart': ['冰封之心'], 'next right thing': ['下一步对的事'], 'when i am older': ['长大以后'],
    'reindeer': ['驯鹿比人好'], 'show yourself': ['展示你自己'],
    'lost in the woods': ['迷失在林间'], 'for the first time in forever': ['初次见面'],
    // —— 反向：中文 → 英文（新增/补齐）
    '艾莎': ['elsa'], '安娜': ['anna'], '雪宝': ['olaf'], '克里斯托夫': ['kristoff'],
    '斯文': ['sven'], '汉斯': ['hans'], '阿伦黛尔': ['arendelle'], '北地人': ['northuldra'],
    '阿塔霍兰': ['ahtohallan'], '水灵': ['nokk'], '诺克': ['nokk'], '火灵': ['bruni'],
    '布鲁尼': ['bruni'], '风灵': ['gale'], '盖尔': ['gale'], '大帕比': ['pabbie'],
    '地精长老': ['pabbie'], '伊杜娜': ['iduna'], '阿格纳尔': ['agnarr'],
    '随它吧': ['let it go'], '前往未知': ['into the unknown'], '寻真': ['all is found'],
    '一切皆有源': ['all is found'], '一切如常': ['some things never change'],
    '你想不想堆个雪人': ['do you want to build a snowman'],
    '爱是敞开的门': ['love is an open door'], '在夏天': ['in summer'], '修缮情缘': ['fixer upper'],
    '冰封之心': ['frozen heart'], '下一步对的事': ['next right thing'], '长大以后': ['when i am older'],
    '驯鹿比人好': ['reindeer'], '展示你自己': ['show yourself'], '迷失在林间': ['lost in the woods'],
    '初次见面': ['for the first time in forever'],
  };
  function expandQuery(q) {
    const terms = [q];
    const hit = ALIASES[q.toLowerCase().trim()];
    if (hit) terms.push(...hit);
    return terms;
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
    'vol3-characters': 1, 'vol6-plot': 1, 'vol5-magic': 1, 'vol7-themes': 1,
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
        const terms = expandQuery(q);
        const hits = d.map(e => [Math.max(...terms.map(t => score(e, t))), e])
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
