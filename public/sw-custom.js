// Service Worker personnalisé pour StreamFlow PWA

// Nom du cache et ressources à mettre en cache lors de l'installation
const CACHE_NAME = 'streamflow-cache-v1';
const OFFLINE_PAGE = '/offline';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logo.svg',
  '/styles/globals.css',
];

// Installation du Service Worker - met en cache les ressources essentielles
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force l'activation sans attendre la fermeture des onglets existants
        return self.skipWaiting();
      })
  );
});

// Activation - nettoie les anciens caches et prend le contrôle
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation');
  
  // Supprimer les anciens caches
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Suppression de l\'ancien cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      // Garantit que le service worker est utilisé immédiatement sur toutes les pages
      return self.clients.claim();
    })
  );
});

// Interception des requêtes - stratégies différentes selon le type de ressource
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // URLs d'API - stratégie Network First
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // Images - stratégie Stale While Revalidate
  if (
    event.request.destination === 'image' || 
    event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)
  ) {
    event.respondWith(staleWhileRevalidateStrategy(event.request));
    return;
  }
  
  // Pages de navigation - stratégie Network First avec fallback offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_PAGE);
      })
    );
    return;
  }
  
  // Autres ressources - stratégie Cache First
  event.respondWith(cacheFirstStrategy(event.request));
});

// Stratégie Network First - essaie le réseau, puis le cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    // On met en cache une copie de la réponse
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Si le réseau échoue, on essaie le cache
    const cachedResponse = await caches.match(request);
    return cachedResponse || Promise.reject('no-match');
  }
}

// Stratégie Stale While Revalidate - cache puis mise à jour en arrière-plan
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Vérifier le cache
  const cachedResponse = await cache.match(request);
  
  // Mettre à jour le cache en arrière-plan
  const fetchPromise = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  });
  
  // Renvoyer la version en cache ou attendre le réseau
  return cachedResponse || fetchPromise;
}

// Stratégie Cache First - d'abord le cache, puis le réseau
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Si tout échoue et que c'est une image, on peut renvoyer une image de secours
    if (request.destination === 'image') {
      return caches.match('/images/fallback.jpg');
    }
    return Promise.reject('no-match');
  }
}

// Événement pour les mises à jour en arrière-plan
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Événement de synchronisation en arrière-plan (si des actions sont mises en file d'attente)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

// Fonction pour synchroniser les favoris en arrière-plan
async function syncFavorites() {
  const db = await openDatabase();
  const pendingFavorites = await db.getAll('sync-favorites');
  
  for (const favorite of pendingFavorites) {
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favorite)
      });
      await db.delete('sync-favorites', favorite.id);
    } catch (error) {
      console.error('Échec de synchronisation:', error);
    }
  }
}

// Simuler l'ouverture d'une base de données IndexedDB (à implémenter si nécessaire)
function openDatabase() {
  // Version simplifiée, à implémenter avec IndexedDB
  return {
    getAll: () => Promise.resolve([]),
    delete: () => Promise.resolve()
  };
}