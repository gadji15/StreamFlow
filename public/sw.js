// Ce fichier est normalement généré automatiquement par next-pwa
// Mais vous pouvez personnaliser certains comportements ici
self.addEventListener('install', (event) => {
  console.log('StreamFlow PWA Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('StreamFlow PWA Service Worker activated');
  event.waitUntil(clients.claim());
});

// Exemple: stratégie de mise en cache personnalisée pour certaines routes
// Note: ceci s'ajoutera aux comportements par défaut de Workbox/next-pwa
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ne pas intercepter les requêtes API ou Firebase
  if (url.pathname.startsWith('/api/') || 
      url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('cloudinary.com')) {
    return;
  }

  // Pour les pages importantes, ceci garantit le fonctionnement hors ligne
  if (url.pathname === '/' || 
      url.pathname.startsWith('/films') ||
      url.pathname.startsWith('/series')) {
    
    // Stratégie: d'abord réseau, puis cache en fallback
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('Falling back to cache for:', url.pathname);
          return caches.match(event.request);
        })
    );
  }
});