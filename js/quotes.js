/* quotes.js · 主题卷封面「经典回响」双语引语轮播
 * 注入式片段 pages/themes/cover.html 内含 <div id="qsl-root"></div>；
 * 本文件由 index.html 全局加载，采用自启动模式（仿 novel-reader.js）：
 * MutationObserver 监听 #content-area，root 出现即渲染轮播。
 * 数据：data/quotes.json（10 条双语引语）。
 */
(function () {
  var AUTO_MS = 5000;
  var quotes = null;
  var idx = 0;
  var timer = null;
  var root = null;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function fetchQuotes() {
    return fetch('data/quotes.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function slideHTML(q, i) {
    return '<blockquote class="qsl-slide' + (i === idx ? ' is-on' : '') + '" data-i="' + i + '">' +
      '<div class="qsl-zh">' + esc(q.zh) + '</div>' +
      '<div class="qsl-en">' + esc(q.en) + '</div>' +
      '<div class="qsl-who">' + esc(q.who) + '</div>' +
      '</blockquote>';
  }

  function render(qs) {
    if (!root) return;
    quotes = qs;
    idx = 0;
    var html = '<div class="qsl-card">' +
      '<button type="button" class="qsl-arrow qsl-prev" aria-label="上一条引语">&#8249;</button>' +
      '<div class="qsl-stage">' + qs.map(slideHTML).join('') + '</div>' +
      '<button type="button" class="qsl-arrow qsl-next" aria-label="下一条引语">&#8250;</button>' +
      '<div class="qsl-dots">' + qs.map(function (_, i) {
        return '<button type="button" class="qsl-dot' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '" aria-label="第' + (i + 1) + '条"></button>';
      }).join('') + '</div>' +
      '</div>';
    root.innerHTML = html;
    bind();
    start();
  }

  function go(i) {
    if (!quotes || !root) return;
    var n = quotes.length;
    idx = ((i % n) + n) % n;
    root.querySelectorAll('.qsl-slide').forEach(function (el) {
      el.classList.toggle('is-on', Number(el.dataset.i) === idx);
    });
    root.querySelectorAll('.qsl-dot').forEach(function (el) {
      el.classList.toggle('is-on', Number(el.dataset.i) === idx);
    });
    start(); // 手动操作后重新计时
  }

  function start() {
    stop();
    if (!quotes || quotes.length < 2) return;
    timer = setInterval(function () { go(idx + 1); }, AUTO_MS);
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function bind() {
    if (!root) return;
    var card = root.querySelector('.qsl-card');
    if (!card) return;
    // 悬停暂停自动轮播
    card.addEventListener('mouseenter', stop);
    card.addEventListener('mouseleave', start);
    // 左右箭头 + 圆点
    card.querySelector('.qsl-prev').addEventListener('click', function () { go(idx - 1); });
    card.querySelector('.qsl-next').addEventListener('click', function () { go(idx + 1); });
    root.querySelectorAll('.qsl-dot').forEach(function (d) {
      d.addEventListener('click', function () { go(Number(d.dataset.i)); });
    });
  }

  function load() {
    fetchQuotes().then(render).catch(function (e) {
      if (root) root.innerHTML = '<div class="qsl-loading">引语加载失败：' + esc(e.message) +
        '<br><small>请通过 python -m http.server 访问本站，并按 Ctrl+F5 强制刷新。</small></div>';
    });
  }

  // 自检式启动：片段注入后 #qsl-root 才会出现，MutationObserver 捕获该时机
  function watch() {
    var r = document.getElementById('qsl-root');
    if (r && r !== root) {
      stop();
      root = r;
      if (!root.dataset.qslOn) {
        root.dataset.qslOn = '1';
        load();
      }
    }
  }

  function initObserver() {
    var area = document.getElementById('content-area');
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
