'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Smartphone, Share, PlusSquare, ArrowRight, Download, 
  ChevronDown, ArrowDown, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Interface pour l'événement d'installation
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function MobilePage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  
  useEffect(() => {
    // Vérifier si l'application est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }
    
    // Détecter le système d'exploitation
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));
    
    // Détecter le navigateur
    setIsChrome(/chrome|chromium|crios/.test(userAgent));
    setIsSafari(/safari/.test(userAgent) && !/chrome|chromium|crios/.test(userAgent));
    
    // Intercepter l'événement beforeinstallprompt (Chrome/Edge/Samsung Internet/etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstall = async () => {
    if (!installPrompt) return;
    
    await installPrompt.prompt();
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('Installation acceptée');
      setInstallPrompt(null);
    } else {
      console.log('Installation refusée');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Application StreamFlow</h1>
      <p className="text-gray-400 mb-8">
        Installez StreamFlow sur votre appareil pour une expérience optimale.
      </p>
      
      {isInstalled ? (
        <div className="bg-indigo-900/50 border border-indigo-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">Application installée !</h2>
          <p className="text-gray-300 mb-4">
            Vous utilisez déjà l'application StreamFlow en mode installé. Profitez de l'expérience !
          </p>
          <Button asChild>
            <Link href="/">
              Retourner à l'accueil
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Smartphone className="mr-2 h-5 w-5" /> Installer StreamFlow
          </h2>
          
          {/* Instructions spécifiques à la plateforme */}
          {isIOS && isSafari && (
            <div className="space-y-4">
              <p className="mb-4">
                Pour installer StreamFlow sur votre appareil iOS, suivez ces étapes :
              </p>
              
              <ol className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">1</div>
                  <div>
                    <p className="font-medium">Appuyez sur le bouton de partage</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Touchez l'icône <Share className="inline-block h-4 w-4 mx-1" /> en bas de l'écran (iOS) ou en haut à droite (iPadOS).
                    </p>
                    <div className="mt-3 bg-gray-700 rounded-lg p-4 text-center">
                      <Share className="h-8 w-8 mx-auto mb-2" />
                    </div>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">2</div>
                  <div>
                    <p className="font-medium">Sélectionnez "Sur l'écran d'accueil"</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Faites défiler et appuyez sur l'option "Sur l'écran d'accueil".
                    </p>
                    <div className="mt-3 bg-gray-700 rounded-lg p-4 text-center">
                      <PlusSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>Sur l'écran d'accueil</p>
                    </div>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">3</div>
                  <div>
                    <p className="font-medium">Appuyez sur "Ajouter"</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Vous pouvez personnaliser le nom de l'application, puis appuyez sur "Ajouter" en haut à droite.
                    </p>
                    <div className="mt-3 bg-gray-700 rounded-lg p-4 text-center">
                      <ArrowRight className="h-8 w-8 mx-auto mb-2" />
                      <p>Ajouter</p>
                    </div>
                  </div>
                </li>
              </ol>
            </div>
          )}
          
          {isAndroid && isChrome && (
            <>
              {installPrompt ? (
                <div className="space-y-4">
                  <p className="mb-6">
                    Votre navigateur permet d'installer StreamFlow directement. Appuyez sur le bouton ci-dessous :
                  </p>
                  
                  <Button className="w-full sm:w-auto" onClick={handleInstall}>
                    <Download className="mr-2 h-4 w-4" />
                    Installer StreamFlow
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="mb-4">
                    Pour installer StreamFlow sur votre appareil Android, suivez ces étapes :
                  </p>
                  
                  <ol className="space-y-6">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">1</div>
                      <div>
                        <p className="font-medium">Appuyez sur le menu (⋮)</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Touchez l'icône de menu à trois points en haut à droite.
                        </p>
                        <div className="mt-3 bg-gray-700 rounded-lg p-4 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex flex-col gap-1">
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="flex-shrink-0 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">2</div>
                      <div>
                        <p className="font-medium">Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil"</p>
                        <p className="text-gray-400 text-sm mt-1">
                          L'option peut varier selon votre version de Chrome.
                        </p>
                        <div className="mt-3 bg-gray-700 rounded-lg p-4 text-center">
                          <PlusSquare className="h-8 w-8 mx-auto mb-2" />
                          <p>Installer l'application</p>
                        </div>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="flex-shrink-0 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">3</div>
                      <div>
                        <p className="font-medium">Appuyez sur "Installer"</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Dans la boîte de dialogue qui apparaît, appuyez sur "Installer" pour confirmer.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              )}
            </>
          )}
          
          {!isIOS && !isAndroid && (
            <div className="space-y-4">
              <p className="mb-4">
                Pour installer StreamFlow sur votre ordinateur :
              </p>
              
              <ol className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">1</div>
                  <div>
                    <p className="font-medium">Cliquez sur l'icône d'installation</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Recherchez l'icône d'installation dans la barre d'adresse de votre navigateur.
                    </p>
                    <div className="mt-3 bg-gray-700 rounded-lg p-4 text-center">
                      <Download className="h-8 w-8 mx-auto mb-2" />
                    </div>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">2</div>
                  <div>
                    <p className="font-medium">Cliquez sur "Installer"</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Dans la boîte de dialogue qui apparaît, cliquez sur "Installer" pour confirmer.
                    </p>
                  </div>
                </li>
              </ol>
              
              {installPrompt && (
                <div className="mt-6">
                  <Button onClick={handleInstall}>
                    <Download className="mr-2 h-4 w-4" />
                    Installer StreamFlow
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Info className="mr-2 h-5 w-5" /> Avantages de l'application
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Navigation offline</h3>
            <p className="text-sm text-gray-300">
              Accédez à votre contenu même sans connexion internet. Consultez vos favoris et votre historique à tout moment.
            </p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Expérience immersive</h3>
            <p className="text-sm text-gray-300">
              Profitez d'une expérience en plein écran sans les distractions du navigateur comme la barre d'adresse.
            </p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Icône sur l'écran d'accueil</h3>
            <p className="text-sm text-gray-300">
              Accédez rapidement à StreamFlow depuis l'écran d'accueil de votre appareil comme n'importe quelle autre application.
            </p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Performances améliorées</h3>
            <p className="text-sm text-gray-300">
              L'application s'exécute plus rapidement et consomme moins de ressources qu'un onglet de navigateur standard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}