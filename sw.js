self.__BUILD_ID = '202609011946';
// sw.js · 冰雪奇缘百科 PWA
const CORE = ['./', './index.html', './styles.css', './layout.css', './enhance.css',
  './manifest.json', './icon-192.png', './icon-512.png', './offline.html',
  './js/loader.js', './js/novel-reader.js', './js/timeline.js', './js/quotes.js',
  './js/relations.js', './js/search.js', './js/mobile-shell.js', './data/nav_tree.json', './data/search-index.json'];
const CACHE = 'fz-ency-' + self.__BUILD_ID;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(
    ks.filter(k => k !== CACHE).map(k => caches.delete(k))).then(() => self.clients.claim())));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // 图片/音频/数据：缓存优先（运行时逐个收录）
  if (/\.(png|jpe?g|webp|mp3|json)$/i.test(url.pathname)) {
    e.respondWith(
      caches.open(CACHE).then(c => c.match(e.request).then(hit => hit ||
        fetch(e.request).then(res => {
          if (res.ok) c.put(e.request, res.clone());
          return res;
        }).catch(() => hit))));
    return;
  }
  // 页面/脚本：网络优先，失败回缓存，导航请求再兜底到离线页
  e.respondWith(fetch(e.request).then(res => {
    const cp = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, cp));
    return res;
  }).catch(() =>
    e.request.mode === 'navigate'
      ? caches.match('./offline.html').then(hit => hit || caches.match('./index.html'))
      : caches.match(e.request)
  ));
});
