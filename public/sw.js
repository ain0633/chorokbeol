const CACHE_NAME = 'chorokbyeol-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '식물이 당신을 기다리고 있어요!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      plantId: data.plantId
    },
    actions: [
      {
        action: 'water',
        title: '💧 물주기',
      },
      {
        action: 'view',
        title: '👀 확인하기',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || '초록별 알림',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'water') {
    event.waitUntil(
      self.clients.matchAll()
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'WATER_PLANT',
              plantId: event.notification.data?.plantId
            });
          });
        })
    );
  } else {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/')
    );
  }
});