'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Download, RefreshCw, HardDrive, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PWADebug from '@/components/pwa-debug';

// Interface pour l'événement d'installation
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWASettingsPage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    // Vérifier si l'application est installée
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };
    
    checkIfInstalled();
    
    // Intercepter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Vérifier le statut de connexion
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    
    // Estimer l'utilisation du stockage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.usage !== undefined && estimate.quota !== undefined) {
          setStorageEstimate({
            usage: estimate.usage,
            quota: estimate.quota
          });
        }
      });
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);
  
  // Formater les octets en KB, MB ou GB
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Fonction pour installer l'application
  const handleInstall = async () => {
    if (!installPrompt) return;
    
    await installPrompt.prompt();
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('Utilisateur a accepté l\'installation');
      setIsInstalled(true);
    } else {
      console.log('Utilisateur a refusé l\'installation');
    }
    
    setInstallPrompt(null);
  };
  
  // Fonction pour recharger l'application
  const handleReload = () => {
    window.location.reload();
  };
  
  // Fonction pour effacer les données de l'application
  const handleClearData = async () => {
    if ('caches' in window) {
      if (confirm('Voulez-vous vraiment effacer toutes les données mises en cache ? Cette action ne peut pas être annulée.')) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          alert('Données effacées avec succès. Rechargez la page pour reconstruire le cache.');
        } catch (error) {
          console.error('Erreur lors de l\'effacement des caches:', error);
          alert('Une erreur est survenue lors de l\'effacement des données.');
        }
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Paramètres de l'application</h1>
      <p className="text-gray-400 mb-8">
        Gérez les paramètres de votre application Progressive Web App (PWA).
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Smartphone className="mr-2 h-5 w-5" /> Statut de l'application
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>Application installée</span>
              <span className={isInstalled ? 'text-green-500' : 'text-yellow-500'}>
                {isInstalled ? 'Oui' : 'Non'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>État de la connexion</span>
              <span className={isOnline ? 'text-green-500' : 'text-red-500'}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            
            {storageEstimate && (
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span>Stockage utilisé</span>
                <span>
                  {formatBytes(storageEstimate.usage)} / {formatBytes(storageEstimate.quota)}
                </span>
              </div>
            )}
            
            <div className="pt-4 space-y-3">
              {!isInstalled && installPrompt && (
                <Button 
                  className="w-full"
                  onClick={handleInstall}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Installer l'application
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleReload}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recharger l'application
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleClearData}
              >
                <HardDrive className="mr-2 h-4 w-4" />
                Effacer les données en cache
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <WifiOff className="mr-2 h-5 w-5" /> Fonctionnalités hors ligne
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-400">
              Lorsque vous êtes hors ligne, vous pouvez toujours accéder aux fonctionnalités suivantes :
            </p>
            
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>Navigation dans l'application</li>
              <li>Visualisation de vos films et séries favorites</li>
              <li>Accès à votre historique de visionnage récent</li>
              <li>Consultation de votre profil utilisateur</li>
            </ul>
            
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                Note : Le streaming de contenu nécessite une connexion internet.
                Les modifications que vous effectuez en mode hors ligne seront synchronisées
                lorsque votre connexion internet sera rétablie.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Composant de débogage - à supprimer en production */}
      <div className="mt-12">
        <PWADebug />
      </div>
    </div>
  );
}