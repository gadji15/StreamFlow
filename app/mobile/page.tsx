"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Film, 
  Home, 
  Search, 
  Heart, 
  Download, 
  User, 
  Chrome, 
  Apple, 
  Menu, 
  Play,
  Share2
} from "lucide-react";

export default function MobilePage() {
  const [isIOS, setIsIOS] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [browserName, setBrowserName] = useState("votre navigateur");

  useEffect(() => {
    // Détecte l'environnement
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edge|edg/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|chromium|edg/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    const isEdge = /edge|edg/.test(userAgent);
    
    setIsIOS(isIOS);
    setIsChrome(isChrome);
    setIsSafari(isSafari);
    
    // Identifie le navigateur pour les instructions
    if (isChrome) setBrowserName("Chrome");
    else if (isSafari) setBrowserName("Safari");
    else if (isFirefox) setBrowserName("Firefox");
    else if (isEdge) setBrowserName("Edge");
    
    // Vérifie si l'app est déjà installée en mode standalone
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text mb-6">
            StreamFlow Mobile
          </h1>
          
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-96 bg-gray-800 rounded-3xl border-4 border-gray-700 overflow-hidden shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-gray-900 flex flex-col">
                  <div className="h-10 bg-gray-800 flex items-center justify-center">
                    <div className="w-24 h-4 rounded-full bg-gray-900"></div>
                  </div>
                  <div className="flex-1 p-2 flex flex-col items-center justify-center space-y-4">
                    <div className="w-full h-32 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse flex items-center justify-center">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-3">
                        <Play className="text-white h-8 w-8"/>
                      </div>
                    </div>
                    <div className="w-full h-4 rounded-full bg-gray-800"></div>
                    <div className="w-3/4 h-4 rounded-full bg-gray-800"></div>
                    <div className="w-full h-28 rounded-lg grid grid-cols-2 gap-2">
                      <div className="bg-gray-800 rounded-md"></div>
                      <div className="bg-gray-800 rounded-md"></div>
                      <div className="bg-gray-800 rounded-md"></div>
                      <div className="bg-gray-800 rounded-md"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-gray-800 flex items-center justify-around px-4">
                    <Home className="h-6 w-6 text-purple-500" />
                    <Search className="h-6 w-6 text-gray-500" />
                    <Film className="h-6 w-6 text-gray-500" />
                    <Heart className="h-6 w-6 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-medium text-white mb-4">
            {isStandalone 
              ? "Vous utilisez déjà l'application StreamFlow!" 
              : "Installez StreamFlow sur votre appareil"}
          </h2>
          
          <p className="text-gray-400 mb-8">
            {isStandalone
              ? "Profitez de la meilleure expérience de streaming directement depuis votre écran d'accueil."
              : "Accédez rapidement à vos films et séries préférés, recevez des notifications de nouveaux contenus, et profitez d'une expérience optimisée."}
          </p>
          
          {!isStandalone && (
            <div className="mb-8">
              {isIOS && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Apple className="h-6 w-6 text-gray-400 mr-2" />
                    <h3 className="font-medium text-white">iPhone ou iPad</h3>
                  </div>
                  <ol className="text-left text-gray-400 space-y-3 mb-4">
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                      <span>Ouvrez StreamFlow dans <strong>Safari</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                      <div className="flex items-center">
                        <span>Appuyez sur</span>
                        <Share2 className="mx-1 h-4 w-4 text-blue-400" />
                        <span>(Partager)</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                      <span>Faites défiler et sélectionnez <strong>"Sur l'écran d'accueil"</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">4</span>
                      <span>Appuyez sur <strong>"Ajouter"</strong> en haut à droite</span>
                    </li>
                  </ol>
                  <div className="flex justify-center">
                    <div className="bg-gray-900 rounded-lg p-2 w-4/5">
                      <div className="text-center text-xs text-gray-400 mb-1">Safari iOS - Menu Partager</div>
                      <div className="bg-gray-800 rounded h-20 flex items-center justify-center">
                        <Share2 className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isChrome && !isIOS && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Chrome className="h-6 w-6 text-gray-400 mr-2" />
                    <h3 className="font-medium text-white">Android avec Chrome</h3>
                  </div>
                  <ol className="text-left text-gray-400 space-y-3 mb-4">
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                      <span>Appuyez sur <strong>Menu</strong> (trois points en haut à droite)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                      <span>Sélectionnez <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                      <span>Confirmez en appuyant sur <strong>"Installer"</strong></span>
                    </li>
                  </ol>
                  <div className="flex justify-center">
                    <div className="bg-gray-900 rounded-lg p-2 w-4/5">
                      <div className="text-center text-xs text-gray-400 mb-1">Chrome Android - Menu</div>
                      <div className="bg-gray-800 rounded h-20 flex items-center justify-center">
                        <Menu className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!isIOS && !isChrome && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Menu className="h-6 w-6 text-gray-400 mr-2" />
                    <h3 className="font-medium text-white">Installation sur {browserName}</h3>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Dans {browserName}, recherchez l'option "Installer" ou "Ajouter à l'écran d'accueil" dans le menu principal. Généralement, cette option se trouve dans les trois points verticaux (⋮) ou horizontaux (⋯).
                  </p>
                  <div className="bg-gray-900 rounded-md p-3">
                    <p className="text-sm text-gray-400">
                      <strong>Astuce</strong>: Si vous ne voyez pas cette option, essayez d'ouvrir StreamFlow dans Chrome sur Android ou Safari sur iOS pour une installation plus facile.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isStandalone ? (
            <Link href="/">
              <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Play className="mr-2 h-4 w-4" />
                Accéder à StreamFlow
              </Button>
            </Link>
          ) : (
            <div className="space-y-4">
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Continuer sur le site
                </Button>
              </Link>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  L'application s'installe directement depuis votre navigateur, 
                  sans passer par l'App Store ou Google Play.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-white mb-3 flex items-center">
              <Download className="h-5 w-5 mr-2 text-purple-500" />
              Avantages de l'application StreamFlow
            </h3>
            <ul className="text-gray-400 space-y-2">
              <li className="flex items-start">
                <div className="bg-purple-500/20 p-1 rounded-full mr-2 mt-0.5">
                  <Home className="h-3 w-3 text-purple-400" />
                </div>
                <span>Accès rapide depuis votre écran d'accueil</span>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-500/20 p-1 rounded-full mr-2 mt-0.5">
                  <Film className="h-3 w-3 text-purple-400" />
                </div>
                <span>Expérience optimisée pour votre appareil</span>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-500/20 p-1 rounded-full mr-2 mt-0.5">
                  <Search className="h-3 w-3 text-purple-400" />
                </div>
                <span>Navigation plus fluide et temps de chargement réduit</span>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-500/20 p-1 rounded-full mr-2 mt-0.5">
                  <Heart className="h-3 w-3 text-purple-400" />
                </div>
                <span>Mises à jour automatiques avec les nouveaux contenus</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}