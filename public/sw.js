// Minimal offline-first service worker. Caches the app shell so Kindle keeps
// working (and feels app-like) even without a connection.
//
// Paths are resolved against the worker's own registration scope (rather than
// hardcoded as root-absolute) so the same file works whether the app is hosted
// at a domain root or under a subpath (e.g. GitHub Pages' /Couples-app/).
const CACHE = 'kindle-v1'
const ROOT = self.registration.scope
const SHELL = ['', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'].map(
  (p) => new URL(p, ROOT).href,
)
const INDEX_URL = new URL('index.html', ROOT).href

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

// Tapping a notification focuses an open Kindle tab, or opens one if none exist.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus()
      }
      return self.clients.openWindow(ROOT)
    }),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  // Network-first for navigation, cache fallback for offline.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(INDEX_URL)))
    return
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  )
})
