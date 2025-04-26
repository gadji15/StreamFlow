'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Écouter les événements 'controllerchange' qui indiquent un changement de service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Le service worker a été mis à jour et a pris le contrôle
        console.log('[PWA] Service worker mis à jour et contrôlant la page');
        
        // Optionnel : recharger automatiquement pour utiliser la nouvelle version
        // window.location.reload();
      });

      // Configuration pour détecter les nouveaux service workers
      const checkForUpdates = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          
          if (!registration) return;
          
          // Vérifier s'il y a un service worker en attente
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowUpdatePrompt(true);
            return;
          }
          
          // Écouter les nouveaux service workers qui s'installent
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (!newWorker) return;
            
            // Écouter les changements d'état du nouveau service worker
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdatePrompt(true);
              }
            });
          });
        } catch (error) {
          console.error('[PWA] Erreur lors de la vérification des mises à jour:', error);
        }
      };
      
      // Vérifier les mises à jour au démarrage et toutes les 60 minutes
      checkForUpdates();
      const interval = setInterval(checkForUpdates, 60 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, []);
  
  // Fonction pour appliquer la mise à jour
  const updateServiceWorker = () => {
    if (!waitingWorker) return;
    
    // Envoyer un message pour déclencher skipWaiting()
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    
    // Masquer le prompt
    setShowUpdatePrompt(false);
    
    // Recharger la page après un court délai pour charger la nouvelle version
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };
  
  if (!showUpdatePrompt) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-indigo-600 text-white">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <p className="mb-4 sm:mb-0">
          Une nouvelle version de l'application est disponible.
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowUpdatePrompt(false)}
            variant="ghost"
            className="text-white hover:bg-indigo-700"
          >
            Plus tard
          </Button>
          <Button 
            onClick={updateServiceWorker}
            className="bg-white text-indigo-600 hover:bg-gray-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Mettre à jour
          </Button>
        </div>
      </div>
    </div>
  );
}