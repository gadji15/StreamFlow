'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function PWADebug() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
  const [cachedUrls, setCachedUrls] = useState<string[]>([]);
  const [swVersion, setSwVersion] = useState<string>('');
  
  useEffect(() => {
    // Vérifier si l'app est installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    
    // Vérifier si le service worker est actif
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        setIsServiceWorkerActive(!!registration?.active);
        
        // Demander la version au service worker
        if (registration?.active) {
          registration.active.postMessage({ type: 'GET_VERSION' });
        }
      });
      
      // Écouter les messages du service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'VERSION') {
          setSwVersion(event.data.version);
        }
        if (event.data && event.data.type === 'CACHED_URLS') {
          setCachedUrls(event.data.urls);
        }
      });
    }
  }, []);
  
  // Fonction pour demander les URLs mises en cache
  const requestCachedUrls = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHED_URLS' });
    }
  };
  
  // Fonction pour effacer tout le cache
  const clearAllCaches = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      setCachedUrls([]);
      alert('Tous les caches ont été effacés. Rechargez la page pour reconstruire le cache.');
    }
  };
  
  return (
    <div className="p-4 m-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Statut PWA</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Application installée :</span>
          <span className={isInstalled ? 'text-green-500' : 'text-yellow-500'}>
            {isInstalled ? 'Oui' : 'Non'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Service Worker actif :</span>
          <span className={isServiceWorkerActive ? 'text-green-500' : 'text-red-500'}>
            {isServiceWorkerActive ? 'Oui' : 'Non'}
          </span>
        </div>
        
        {swVersion && (
          <div className="flex justify-between">
            <span>Version du Service Worker :</span>
            <span>{swVersion}</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={requestCachedUrls}>
            Afficher les ressources en cache
          </Button>
          <Button variant="destructive" size="sm" onClick={clearAllCaches}>
            Effacer le cache
          </Button>
        </div>
        
        {cachedUrls.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Ressources en cache ({cachedUrls.length})</h3>
            <div className="bg-gray-900 p-2 rounded-md max-h-60 overflow-y-auto text-xs">
              <ul className="space-y-1">
                {cachedUrls.map((url, index) => (
                  <li key={index} className="truncate">
                    {url}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}