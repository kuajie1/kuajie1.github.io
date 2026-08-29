/* relations.js · 角色关系互动图谱（vol3-characters）
 * 片段：<div id="rel-root"></div>；MutationObserver 自启动。
 * 数据：data/relations.json；交互：hover/点击节点 → 高亮相邻边、其余淡化 + 右侧信息面板。
 */
(function () {
  const COLORS = {
    family: '#8a7bd9', love: '#e0709a', friend: '#5a8fd9',
    foe: '#c0574f', spirit: '#4fb3a5', magic: '#9a6bd0'
  };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function render(root, d) {
    const byId = {};
    d.nodes.forEach(n => byId[n.id] = n);
    const adj = {};
    d.edges.forEach(e => {
      (adj[e.a] = adj[e.a] || []).push(e);
      (adj[e.b] = adj[e.b] || []).push(e);
    });

    let svg = '<svg class="rel-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">';
    d.edges.forEach((e, i) => {
      const a = byId[e.a], b = byId[e.b];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      svg += '<line class="rel-edge" data-i="' + i + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y +
        '" stroke="' + COLORS[e.k] + '" stroke-width="2" vector-effect="non-scaling-stroke" />' +
        '<text class="rel-elabel" x="' + mx + '" y="' + my + '" fill="' + COLORS[e.k] + '">' + esc(e.t) + '</text>';
    });
    svg += '</svg>';

    let nodes = '';
    d.nodes.forEach(n => {
      nodes += '<button class="rel-node' + (n.cls === 'accent' ? ' rel-node--accent' : '') +
        '" style="left:' + n.x + '%;top:' + n.y + '%" data-id="' + n.id + '">' +
        '<b>' + esc(n.name) + '</b><small>' + esc(n.sub) + '</small></button>';
    });

    root.innerHTML =
      '<div class="rel-wrap">' + svg + nodes + '</div>' +
      '<div class="rel-legend">' + d.legend.map(l =>
        '<span class="rel-lg"><i style="background:' + COLORS[l[0]] + '"></i>' + esc(l[1]) + '</span>').join('') +
      '</div>' +
      '<div class="rel-info" id="rel-info"><div class="rel-info__hint">👆 点击任意角色，查看 TA 的关系网与简介</div></div>';

    const info = root.querySelector('#rel-info');
    const edgeEls = root.querySelectorAll('.rel-edge');
    const labEls = root.querySelectorAll('.rel-elabel');
    const nodeEls = root.querySelectorAll('.rel-node');

    function focus(id) {
      const keep = new Set();
      d.edges.forEach((e, i) => {
        const on = e.a === id || e.b === id;
        edgeEls[i].classList.toggle('is-hi', on);
        edgeEls[i].classList.toggle('is-dim', !on);
        labEls[i].classList.toggle('is-hi', on);
        labEls[i].classList.toggle('is-dim', !on);
        if (on) { keep.add(e.a); keep.add(e.b); }
      });
      nodeEls.forEach(nd => {
        const on = !id || keep.has(nd.dataset.id);
        nd.classList.toggle('is-dim', id ? !on : false);
      });
      if (id) {
        const n = byId[id];
        const rels = (adj[id] || []).map(e => {
          const other = e.a === id ? byId[e.b] : byId[e.a];
          return '<div class="rel-r"><i style="background:' + COLORS[e.k] + '"></i><b>' + esc(other.name) + '</b><span>' + esc(e.t) + '</span></div>';
        }).join('');
        info.innerHTML = '<div class="rel-info__head"><b>' + esc(n.name) + '</b><span>' + esc(n.sub) + '</span></div>' +
          '<p class="rel-info__blurb">' + esc(n.blurb) + '</p><div class="rel-rels">' + rels + '</div>';
      }
    }

    function reset() {
      focus(null);
      info.innerHTML = '<div class="rel-info__hint">👆 点击任意角色，查看 TA 的关系网与简介</div>';
    }

    nodeEls.forEach(nd => {
      nd.addEventListener('mouseenter', () => focus(nd.dataset.id));
      nd.addEventListener('click', (e) => { e.stopPropagation(); focus(nd.dataset.id); });
    });
    root.querySelector('.rel-wrap').addEventListener('click', () => reset());
    focus(null);
  }

  function tryLoad() {
    const root = document.getElementById('rel-root');
    if (!root || root.dataset.relOn) return;
    root.dataset.relOn = '1';
    fetch('data/relations.json')
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
