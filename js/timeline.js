/* timeline.js · 交互时间线组件（vol8-timeline）
 * 页面片段中放 <div id="tzl-root" data-src="in-universe"></div>，
 * 本脚本用 MutationObserver 自启动（与 novel-reader 同款，不依赖注入时序）。
 * 数据：data/timeline/{src}.json
 */
(function () {
  const cache = {};

  function fetchTimeline(src) {
    if (cache[src]) return Promise.resolve(cache[src]);
    return fetch('data/timeline/' + src + '.json')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function render(root, d) {
    root.innerHTML =
      '<div class="tzl-bar">' +
        '<div class="tzl-filters">' +
          d.eras.map(e => '<button class="tzl-chip' + (e[0] === 'all' ? ' is-on' : '') + '" data-era="' + e[0] + '">' + e[1] + '</button>').join('') +
        '</div>' +
        '<button class="tzl-toggle" data-x="1">展开全部</button>' +
      '</div>' +
      '<p class="tzl-anchor">' + esc(d.anchor) + '</p>' +
      '<div class="tzl-line">' +
        d.events.map((ev, i) => {
          const side = i % 2 ? ' tzl-item--r' : '';
          return '<div class="tzl-item' + side + '" data-era="' + ev.era + '">' +
            '<span class="tzl-dot"></span>' +
            '<div class="tzl-card" tabindex="0">' +
              '<div class="tzl-head"><span class="tzl-year">' + esc(ev.year) + '</span>' +
                (ev.wiki ? '<span class="tzl-wiki">' + esc(ev.wiki) + '</span>' : '') + '</div>' +
              '<h3 class="tzl-title">' + esc(ev.title) + '</h3>' +
              '<p class="tzl-sum">' + esc(ev.summary) + '</p>' +
              (ev.detail && ev.detail.length
                ? '<div class="tzl-detail">' + ev.detail.map(p => '<p>' + esc(p) + '</p>').join('') +
                  (ev.note ? '<p class="tzl-note">⚠ ' + esc(ev.note) + '</p>' : '') +
                  (ev.src ? '<p class="tzl-src">📚 ' + esc(ev.src) + '</p>' : '') + '</div>'
                : (ev.note ? '<div class="tzl-detail"><p class="tzl-note">⚠ ' + esc(ev.note) + '</p></div>' : '')) +
              ((ev.detail && ev.detail.length) || ev.note ? '<span class="tzl-more">展开详情 ▾</span>' : '') +
            '</div></div>';
        }).join('') +
      '</div>';

    // 筛选
    root.querySelectorAll('.tzl-chip').forEach(ch => ch.addEventListener('click', () => {
      root.querySelectorAll('.tzl-chip').forEach(c => c.classList.remove('is-on'));
      ch.classList.add('is-on');
      const era = ch.dataset.era;
      root.querySelectorAll('.tzl-item').forEach(it => {
        it.classList.toggle('is-hidden', era !== 'all' && it.dataset.era !== era);
      });
    }));
    // 展开/收起（点击卡片或徽标）
    root.querySelectorAll('.tzl-card').forEach(card => {
      const t = () => card.closest('.tzl-item').classList.toggle('is-open');
      card.addEventListener('click', t);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } });
    });
    const tg = root.querySelector('.tzl-toggle');
    tg.addEventListener('click', () => {
      const open = tg.dataset.x === '1';
      tg.dataset.x = open ? '0' : '1';
      tg.textContent = open ? '收起全部' : '展开全部';
      root.querySelectorAll('.tzl-item').forEach(it => it.classList.toggle('is-open', open));
    });
  }

  function tryLoad() {
    const root = document.getElementById('tzl-root');
    if (!root || root.dataset.tzlOn) return;
    const src = root.dataset.src;
    if (!src) return;
    root.dataset.tzlOn = '1';
    fetchTimeline(src).then(d => render(root, d))
      .catch(e => { root.innerHTML = '<div class="nzr-loading">时间线读取失败：' + e.message + '</div>'; });
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
  window.TZL = { tryLoad };
})();
