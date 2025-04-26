"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "data-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Effet pour initialiser le thème depuis localStorage et s'abonner aux changements
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Récupérer le thème enregistré si présent
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    setMounted(true);
  }, [storageKey]);

  // Applique le thème au document
  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    
    // Appliquer explicitement des styles pour éviter les écrans noirs
    if (theme === "light") {
      root.style.backgroundColor = "#ffffff";
      root.style.color = "#000000";
    } else {
      // Thème sombre explicite
      root.style.backgroundColor = "#111111";
      root.style.color = "#ffffff";
    }

    // Supprimer les classes existantes
    root.classList.remove("light", "dark");
    
    // Appliquer la classe selon le thème (ou le thème système)
    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      
      root.classList.add(systemTheme);
      root.style.colorScheme = systemTheme;
    } else {
      root.classList.add(theme);
      root.style.colorScheme = theme;
    }
  }, [theme, enableSystem, mounted]);

  // S'abonner aux changements de préférence système si enableSystem est true
  useEffect(() => {
    if (!enableSystem || !mounted) return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    // Mettre à jour la classe lorsque la préférence système change
    const onMediaChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        
        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
      }
    };
    
    mediaQuery.addEventListener("change", onMediaChange);
    return () => mediaQuery.removeEventListener("change", onMediaChange);
  }, [enableSystem, theme, mounted]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  // Rendu avec hydration sécurisée
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};