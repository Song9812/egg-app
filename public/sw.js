const CACHE_NAME = 'egg-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/class.html',
  '/manifest.json',
];

// 설치: 정적 파일 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 활성화: 이전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 요청 처리
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API 요청은 캐싱 안 함 (항상 네트워크)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 정적 파일: 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // 정상 응답이면 캐시에 저장
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
