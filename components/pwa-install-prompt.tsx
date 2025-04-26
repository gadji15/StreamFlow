"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Détecte si l'application peut être installée
    window.addEventListener("beforeinstallprompt", (e) => {
      // Empêche Chrome 67+ d'afficher automatiquement la bannière d'installation
      e.preventDefault();
      // Sauvegarde l'événement pour pouvoir le déclencher plus tard
      setDeferredPrompt(e);
      // Met à jour l'état pour montrer notre bouton personnalisé
      setShowInstallPrompt(true);
    });

    // Écoute l'événement d'installation réussie
    window.addEventListener("appinstalled", () => {
      // Masque notre bouton d'installation
      setShowInstallPrompt(false);
      // Nettoie la référence à l'événement beforeinstallprompt
      setDeferredPrompt(null);
      console.log("PWA installée avec succès!");
    });

    // Vérifie si l'application est déjà installée ou si l'utilisateur est sur iOS
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setShowInstallPrompt(false);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Affiche la bannière d'installation
    deferredPrompt.prompt();
    
    // Attend que l'utilisateur réponde
    const choiceResult = await deferredPrompt.userChoice;
    
    // Masque le prompt quel que soit le choix
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    
    if (choiceResult.outcome === "accepted") {
      console.log("L'utilisateur a accepté l'installation");
    } else {
      console.log("L'utilisateur a refusé l'installation");
    }
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    // Stocke une valeur dans le localStorage pour ne pas afficher à nouveau le prompt pendant un moment
    localStorage.setItem("pwaInstallPromptDismissed", Date.now().toString());
  };

  // Vérifie si l'utilisateur a déjà fermé la notification récemment (moins de 7 jours)
  useEffect(() => {
    const dismissed = localStorage.getItem("pwaInstallPromptDismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      
      if (now - dismissedTime < sevenDays) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700 z-50 flex items-center justify-between">
      <div>
        <h3 className="text-white font-medium">Installez StreamFlow</h3>
        <p className="text-gray-300 text-sm">
          Installez l'application pour un accès plus rapide
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={dismissPrompt}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button onClick={handleInstallClick} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Installer
        </Button>
      </div>
    </div>
  );
}