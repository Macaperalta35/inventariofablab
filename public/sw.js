const CACHE_NAME = 'fablab-inv-v1';
const ASSETS = [
  '/inventariofablab/',
  '/inventariofablab/index.html',
  '/inventariofablab/style.css',
  '/inventariofablab/main.js',
  '/inventariofablab/manifest.json',
  '/inventariofablab/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
