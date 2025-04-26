'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function ConnectivityIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  
  useEffect(() => {
    // Vérifier l'état initial
    setIsOnline(navigator.onLine);
    
    // Événements pour surveiller les changements de connectivité
    const handleOnline = () => {
      setIsOnline(true);
      // Afficher un message temporaire
      setShowOfflineMessage(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };
    
    // Écouter les événements
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Si l'utilisateur est en ligne, pas besoin d'afficher quoi que ce soit
  if (isOnline && !showOfflineMessage) {
    return null;
  }
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 transform ${showOfflineMessage && !isOnline ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className={`p-4 flex items-center justify-center ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}>
        {!isOnline ? (
          <>
            <WifiOff className="h-5 w-5 mr-2" />
            <span>Vous êtes actuellement hors ligne. Certaines fonctionnalités pourraient être limitées.</span>
          </>
        ) : (
          <span>La connexion internet a été rétablie.</span>
        )}
      </div>
    </div>
  );
}