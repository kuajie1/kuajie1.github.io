/* relations.js v2.1 · 高级交互式角色关系图谱（修复版）
 * SVG 只画贝塞尔连线，关系标签用 HTML 绝对定位
 */
(function () {
  const COLORS = {
    family: { line: '#8a7bd9', name: '家人' },
    love:   { line: '#e0709a', name: '爱与救赎' },
    friend: { line: '#5a8fd9', name: '伙伴' },
    foe:    { line: '#c0574f', name: '对抗/背叛' },
    spirit: { line: '#4fb3a5', name: '魔法与灵' },
    magic:  { line: '#9a6bd0', name: '巨魔魔法' }
  };

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function render(root, d) {
    const byId = {};
    d.nodes.forEach(n => byId[n.id] = n);
    const adj = {};
    d.edges.forEach(e => {
      (adj[e.a] = adj[e.a] || []).push(e);
      (adj[e.b] = adj[e.b] || []).push(e);
    });

    // 工具栏
    let toolbar = '<div class="rel-toolbar">' +
      '<div class="rel-search"><svg class="rel-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
      '<input type="text" class="rel-search__input" placeholder="搜索角色…" id="relSearch" />' +
      '<button class="rel-search__clear" id="relSearchClear" type="button" style="display:none">×</button></div>' +
      '<div class="rel-filters" id="relFilters">' +
      d.legend.map(([k]) =>
        '<button class="rel-filter is-active" data-k="' + k + '" style="--c:' + COLORS[k].line + '">' +
        '<i></i>' + esc(COLORS[k].name) + '</button>').join('') +
      '</div></div>';

    // SVG 只画贝塞尔连线
    let svg = '<svg class="rel-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">';
    svg += '<defs>';
    Object.keys(COLORS).forEach(k => {
      svg += '<linearGradient id="rel-grad-' + k + '" x1="0%" y1="0%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="' + COLORS[k].line + '" stop-opacity=".25"/>' +
        '<stop offset="50%" stop-color="' + COLORS[k].line + '" stop-opacity=".85"/>' +
        '<stop offset="100%" stop-color="' + COLORS[k].line + '" stop-opacity=".25"/></linearGradient>';
    });
    svg += '</defs>';
    d.edges.forEach((e, i) => {
      const a = byId[e.a], b = byId[e.b];
      const dx = b.x - a.x, dy = b.y - a.y;
      const cx1 = a.x + dx * 0.3, cy1 = a.y + dy * 0.3 - 2;
      const cx2 = a.x + dx * 0.7, cy2 = a.y + dy * 0.7 - 2;
      svg += '<path class="rel-edge" data-i="' + i + '" data-k="' + e.k + '" ' +
        'd="M' + a.x + ',' + a.y + ' C' + cx1 + ',' + cy1 + ' ' + cx2 + ',' + cy2 + ' ' + b.x + ',' + b.y + '" ' +
        'fill="none" stroke="url(#rel-grad-' + e.k + ')" stroke-width="1.2" ' +
        'vector-effect="non-scaling-stroke" stroke-linecap="round"/>';
    });
    svg += '</svg>';

    // HTML 关系标签（绝对定位，避免 SVG 文字拉伸）
    let labels = '';
    d.edges.forEach((e, i) => {
      const a = byId[e.a], b = byId[e.b];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      labels += '<span class="rel-label" data-i="' + i + '" data-k="' + e.k + '" ' +
        'style="left:' + mx + '%;top:' + my + '%;border-color:' + COLORS[e.k].line + ';color:' + COLORS[e.k].line + '">' +
        esc(e.t) + '</span>';
    });

    // 节点
    let nodes = '';
    d.nodes.forEach(n => {
      const isCore = n.cls === 'accent';
      const isWarn = n.cls === 'warn';
      nodes += '<button class="rel-node' + (isCore ? ' rel-node--core' : '') + (isWarn ? ' rel-node--warn' : '') +
        '" style="left:' + n.x + '%;top:' + n.y + '%" data-id="' + n.id + '" data-name="' + esc(n.name) + '" type="button">' +
        '<span class="rel-node__avatar">' + n.emoji + '</span>' +
        '<span class="rel-node__name">' + esc(n.name) + '</span>' +
        '<span class="rel-node__sub">' + esc(n.sub) + '</span></button>';
    });

    root.innerHTML = toolbar +
      '<div class="rel-stage">' +
      '<div class="rel-wrap">' + svg + labels + nodes + '</div>' +
      '<div class="rel-info" id="rel-info"><div class="rel-info__hint">' +
      '<div class="rel-info__hint-icon">🕸️</div>' +
      '<div class="rel-info__hint-text"><b>交互式关系图谱</b><span>点击或悬停任意角色查看 TA 的关系网；顶部可按关系类型筛选、搜索角色</span></div></div></div>' +
      '</div>';

    // 元素引用
    const info = root.querySelector('#rel-info');
    const edgeEls = root.querySelectorAll('.rel-edge');
    const labelEls = root.querySelectorAll('.rel-label');
    const nodeEls = root.querySelectorAll('.rel-node');
    const filterEls = root.querySelectorAll('.rel-filter');
    const searchInput = root.querySelector('#relSearch');
    const searchClear = root.querySelector('#relSearchClear');

    let activeFilters = new Set(Object.keys(COLORS));
    let selectedId = null;

    function applyFilters() {
      edgeEls.forEach((el, i) => {
        const k = d.edges[i].k;
        const show = activeFilters.has(k);
        el.style.display = show ? '' : 'none';
        labelEls[i].style.display = show ? '' : 'none';
      });
    }

    function focus(id) {
      selectedId = id;
      const keep = new Set();
      d.edges.forEach((e, i) => {
        const on = e.a === id || e.b === id;
        const k = e.k;
        const filterOn = activeFilters.has(k);
        edgeEls[i].classList.toggle('is-hi', on && filterOn);
        edgeEls[i].classList.toggle('is-dim', id ? (!on || !filterOn) : false);
        labelEls[i].classList.toggle('is-hi', on && filterOn);
        labelEls[i].classList.toggle('is-dim', id ? (!on || !filterOn) : false);
        if (on && filterOn) { keep.add(e.a); keep.add(e.b); }
      });
      nodeEls.forEach(nd => {
        const on = !id || keep.has(nd.dataset.id);
        nd.classList.toggle('is-dim', id ? !on : false);
        nd.classList.toggle('is-selected', nd.dataset.id === id);
      });
      if (id) {
        const n = byId[id];
        const rels = (adj[id] || []).filter(e => activeFilters.has(e.k)).map(e => {
          const other = e.a === id ? byId[e.b] : byId[e.a];
          const page = other.page ? '<a class="rel-r__go" href="#' + other.page + '" onclick="event.stopPropagation()">档案 →</a>' : '';
          return '<div class="rel-r" data-k="' + e.k + '"><i style="background:' + COLORS[e.k].line + '"></i>' +
            '<div class="rel-r__body"><b>' + other.emoji + ' ' + esc(other.name) + '</b><span>' + esc(e.t) + '</span></div>' + page + '</div>';
        }).join('');
        const pageLink = n.page ? '<a class="rel-info__page" href="#' + n.page + '">完整档案 →</a>' : '';
        const relCount = (adj[id] || []).filter(e => activeFilters.has(e.k)).length;
        info.innerHTML = '<div class="rel-info__card">' +
          '<div class="rel-info__head"><span class="rel-info__avatar">' + n.emoji + '</span>' +
          '<div><b>' + esc(n.name) + '</b><span>' + esc(n.sub) + '</span></div>' + pageLink + '</div>' +
          '<p class="rel-info__blurb">' + esc(n.blurb) + '</p>' +
          '<div class="rel-info__rels-title">关系网络（' + relCount + '）</div>' +
          '<div class="rel-rels">' + (rels || '<div class="rel-rels__empty">当前筛选下无关系</div>') + '</div></div>';
      }
    }

    function reset() {
      selectedId = null;
      focus(null);
      info.innerHTML = '<div class="rel-info__hint">' +
        '<div class="rel-info__hint-icon">🕸️</div>' +
        '<div class="rel-info__hint-text"><b>交互式关系图谱</b><span>点击或悬停任意角色查看 TA 的关系网；顶部可按关系类型筛选、搜索角色</span></div></div>';
    }

    nodeEls.forEach(nd => {
      nd.addEventListener('mouseenter', () => { if (!selectedId) focus(nd.dataset.id); });
      nd.addEventListener('mouseleave', () => { if (!selectedId) reset(); });
      nd.addEventListener('click', (e) => {
        e.stopPropagation();
        if (selectedId === nd.dataset.id) { reset(); }
        else { focus(nd.dataset.id); }
      });
    });
    root.querySelector('.rel-wrap').addEventListener('click', () => reset());

    filterEls.forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.k;
        if (activeFilters.has(k)) {
          if (activeFilters.size > 1) { activeFilters.delete(k); btn.classList.remove('is-active'); }
        } else {
          activeFilters.add(k); btn.classList.add('is-active');
        }
        applyFilters();
        if (selectedId) focus(selectedId);
      });
    });

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      searchClear.style.display = q ? '' : 'none';
      nodeEls.forEach(nd => {
        const name = nd.dataset.name.toLowerCase();
        const match = !q || name.includes(q);
        nd.style.display = match ? '' : 'none';
        if (match && q) nd.classList.add('is-search-hit');
        else nd.classList.remove('is-search-hit');
      });
    });
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      nodeEls.forEach(nd => { nd.style.display = ''; nd.classList.remove('is-search-hit'); });
      searchInput.focus();
    });

    applyFilters();
    focus(null);
  }

  function tryLoad() {
    const root = document.getElementById('rel-root');
    if (!root || root.dataset.relOn) return;
    root.dataset.relOn = '1';
    fetch('data/relations.json?v=20260831k')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => render(root, d))
      .catch(e => { root.innerHTML = '<div class="nzr-loading">关系图读取失败：' + e.message + '</div>'; });
  }

  function initObserver() {
    const area = document.getElementById('content-area');
    if (!area) { setTimeout(initObserver, 300); return; }
    new MutationObserver(tryLoad).observe(area, { childList: true });
    tryLoad();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
