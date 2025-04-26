"use client";

import { useState, useEffect } from "react";

// Interface pour gérer l'événement d'installation PWA
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

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
        return;
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
      // Afficher notre propre invite après 3 secondes
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Fonction pour déclencher l'installation
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    setShowPrompt(false);
    
    // Afficher l'invite d'installation
    await installPrompt.prompt();
    
    // Attendre la décision de l'utilisateur
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === "accepted") {
      console.log("L'utilisateur a accepté l'installation PWA");
    } else {
      console.log("L'utilisateur a refusé l'installation PWA");
      // Stocker la date de rejet
      localStorage.setItem("pwaInstallRejected", Date.now().toString());
    }
    
    // Réinitialiser l'invite
    setInstallPrompt(null);
  };

  // Fonction pour fermer l'invite
  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem("pwaInstallRejected", Date.now().toString());
  };

  // Ne rien afficher si l'app est déjà installée ou si l'invite ne doit pas être affichée
  if (isInstalled || !showPrompt) {
    return null;
  }

  // Version simplifiée de l'invite
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-80 bg-gray-800 p-4 rounded-lg shadow-lg z-50 border border-gray-700">
      <h3 className="font-bold mb-2">Installer StreamFlow</h3>
      <p className="text-sm text-gray-300 mb-3">
        Ajoutez notre application à votre écran d'accueil pour y accéder plus facilement.
      </p>
      <div className="flex justify-between">
        <button 
          onClick={handleInstallClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
        >
          Installer
        </button>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-white px-2 text-sm"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}