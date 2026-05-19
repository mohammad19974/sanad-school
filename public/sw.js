// Service Worker لتطبيق نبض — يدعم offline + caching ذكي
// الاستراتيجية:
//   • navigation requests: network-first → fallback لـ index.html من الـ cache
//   • assets ثابتة (JS/CSS/images/sounds): stale-while-revalidate
//   • Firebase/Google APIs: pass-through (Firestore عنده offline خاصّ به)
//   • POST/PUT: لا تُكاش (دائماً online)

const VERSION = 'nabd-v1-rename';
const CACHE_NAME = `nabd-cache-${VERSION}`;

// الأصول الأساسيّة التي تُحمَّل عند install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon-32.png',
  '/favicon-64.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/sounds/waves.wav',
  '/sounds/rain.wav',
  '/sounds/wind.wav',
  '/sounds/fire.wav',
  '/sounds/birds.wav',
];

// ───── install: pre-cache الأصول الأساسيّة ─────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[SW] فشل pre-cache بعض الملفات:', err);
        // لا نوقف التثبيت لو فشل ملف واحد
      }))
  );
  self.skipWaiting();
});

// ───── activate: امسح caches القديمة ─────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k.startsWith('sanad-cache-'))
            .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ───── fetch: استراتيجية حسب نوع الطلب ─────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1) تخطّى الطلبات غير GET
  if (request.method !== 'GET') return;

  // 2) تخطّى Firebase + Google APIs — Firestore يدير offline داخلياً
  if (
    url.hostname.includes('googleapis.com')   ||
    url.hostname.includes('firebaseio.com')   ||
    url.hostname.includes('firebasestorage')  ||
    url.hostname.includes('cloudfunctions')   ||
    url.hostname.includes('firebase.com')     ||
    url.hostname.includes('identitytoolkit')  ||
    url.hostname.includes('securetoken')      ||
    url.pathname.includes('/__/firebase')     ||
    url.hostname.includes('tile.openstreetmap') // tiles خارجية - لا تُكاش
  ) {
    return;
  }

  // 3) Navigation requests (الصفحات): network-first مع fallback لـ index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // كاش index.html باستمرار
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put('/index.html', clone));
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // 4) Static assets: stale-while-revalidate
  // يُرجع cached فوراً + يحدّث الكاش في الخلفية
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(() => cached); // لو فشل الشبكة، أرجع الكاش (إن وُجد)
      return cached || fetchPromise;
    })
  );
});

// ───── النقر على إشعار ─────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = data.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) {
            if ('navigate' in client) {
              return client.navigate(targetUrl).then(() => client.focus());
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

console.info('[Sanad SW]', VERSION, 'مُسجَّل وجاهز');
