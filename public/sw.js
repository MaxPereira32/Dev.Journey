const CACHE_NAME = 'dev-journey-cache-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt'
]

// Instalação do Service Worker e caching inicial
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Interceptação de requisições com estratégia Cache-First
self.addEventListener('fetch', (e) => {
  // Ignorar chamadas de API do Firebase (tratadas pelo Firestore Cache interno)
  if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('identitytoolkit.googleapis.com')) {
    return
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse
        }
        const responseToCache = networkResponse.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache)
        })
        return networkResponse
      }).catch(() => {
        // Se falhar e for navegação HTML, retornar a home
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
      })
    })
  )
})
