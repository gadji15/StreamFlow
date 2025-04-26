"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Play
} from "lucide-react";

export default function MobilePage() {
  const [isIOS, setIsIOS] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détecte l'environnement
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsChrome(/chrome/.test(userAgent) && !/edge|edg/.test(userAgent));
    
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
            <div className="relative w-40 h-80 bg-gray-800 rounded-3xl border-4 border-gray-700 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-gray-900 flex flex-col">
                  <div className="h-8 bg-gray-800 flex items-center justify-center">
                    <div className="w-20 h-4 rounded-full bg-gray-900"></div>
                  </div>
                  <div className="flex-1 p-2 flex flex-col items-center justify-center space-y-4">
                    <div className="w-full h-24 rounded-lg bg-gradient-to-r from-purple-500/30 to-blue-500/30 animate-pulse flex items-center justify-center">
                      <Play className="text-white/70 h-10 w-10"/>
                    </div>
                    <div className="w-full h-4 rounded-full bg-gray-800"></div>
                    <div className="w-3/4 h-4 rounded-full bg-gray-800"></div>
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
              : "Installez l'application StreamFlow"}
          </h2>
          
          <p className="text-gray-400 mb-8">
            {isStandalone
              ? "Profitez de la meilleure expérience de streaming directement depuis votre écran d'accueil."
              : "Profitez d'une expérience optimisée, d'un accès hors-ligne, et de notifications pour vos séries préférées."}
          </p>
          
          {!isStandalone && (
            <div className="mb-8">
              {isIOS && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Apple className="h-6 w-6 text-gray-400 mr-2" />
                    <h3 className="font-medium text-white">iPhone ou iPad</h3>
                  </div>
                  <ol className="text-left text-gray-400 space-y-2 mb-4">
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                      <span>Ouvrez StreamFlow dans <strong>Safari</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                      <span>Appuyez sur l'icône <strong>Partager</strong> (carré avec flèche)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                      <span>Choisissez <strong>"Sur l'écran d'accueil"</strong></span>
                    </li>
                  </ol>
                </div>
              )}
              
              {isChrome && !isIOS && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Chrome className="h-6 w-6 text-gray-400 mr-2" />
                    <h3 className="font-medium text-white">Android ou Chrome</h3>
                  </div>
                  <ol className="text-left text-gray-400 space-y-2 mb-4">
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                      <span>Appuyez sur <strong>Menu</strong> (trois points)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                      <span>Sélectionnez <strong>"Installer l'application"</strong></span>
                    </li>
                  </ol>
                </div>
              )}
              
              {!isIOS && !isChrome && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Menu className="h-6 w-6 text-gray-400 mr-2" />
                    <h3 className="font-medium text-white">Autres navigateurs</h3>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Recherchez l'option "Installer" ou "Ajouter à l'écran d'accueil" dans le menu de votre navigateur.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {isStandalone ? (
            <Link href="/">
              <Button size="lg" className="w-full">
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
            <h3 className="font-medium text-white mb-2 flex items-center">
              <Download className="h-5 w-5 mr-2 text-purple-500" />
              Pourquoi installer l'application?
            </h3>
            <ul className="text-gray-400 space-y-2">
              <li>• Accès direct depuis votre écran d'accueil</li>
              <li>• Navigation plus rapide et fluide</li>
              <li>• Expérience optimisée pour mobile</li>
              <li>• Fonctionnement hors connexion partiel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}