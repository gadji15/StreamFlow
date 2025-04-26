"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Interface pour gérer l'événement d'installation PWA
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  // État pour stocker l'événement d'installation
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  // État pour savoir si l'application est déjà installée
  const [isInstalled, setIsInstalled] = useState(false);
  // État pour mémoriser si l'utilisateur a rejeté l'installation
  const [userRejected, setUserRejected] = useState(false);

  useEffect(() => {
    // Vérifier si l'application est déjà installée
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Vérifier si l'utilisateur a déjà rejeté l'installation récemment
    const lastRejected = localStorage.getItem("pwaInstallRejected");
    if (lastRejected) {
      const rejectedDate = new Date(parseInt(lastRejected));
      const daysSinceRejected = (new Date().getTime() - rejectedDate.getTime()) / (1000 * 3600 * 24);
      
      // Ne pas montrer à nouveau pendant 7 jours
      if (daysSinceRejected < 7) {
        setUserRejected(true);
      } else {
        // Réinitialiser après 7 jours
        localStorage.removeItem("pwaInstallRejected");
      }
    }

    // Intercepter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêcher Chrome 67+ d'afficher automatiquement l'invite
      e.preventDefault();
      // Stocker l'événement pour l'utiliser plus tard
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Fonction pour déclencher l'installation
  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Afficher l'invite d'installation
    await installPrompt.prompt();
    
    // Attendre la décision de l'utilisateur
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === "accepted") {
      console.log("L'utilisateur a accepté l'installation PWA");
      setInstallPrompt(null);
    } else {
      console.log("L'utilisateur a refusé l'installation PWA");
      // Stocker la date de rejet
      localStorage.setItem("pwaInstallRejected", Date.now().toString());
      setUserRejected(true);
    }
  };

  // Fonction pour ignorer l'installation
  const handleDismiss = () => {
    localStorage.setItem("pwaInstallRejected", Date.now().toString());
    setUserRejected(true);
  };

  // Ne rien afficher si l'app est déjà installée ou si l'utilisateur a récemment rejeté
  if (isInstalled || userRejected || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-w-md mx-auto">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="font-bold mb-1">Installer StreamFlow</h3>
          <p className="text-sm text-gray-400 mb-3">
            Installez notre application pour accéder rapidement à vos films et séries préférés, même hors ligne !
          </p>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleInstallClick} className="flex items-center">
              <Download className="w-4 h-4 mr-1" />
              Installer
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Plus tard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;