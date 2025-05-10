"use client";

import { createContext, useContext, useEffect } from "react";

// Only allow the dark theme everywhere
type Theme = "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// Fixed dark theme state, setTheme does nothing
const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => {},
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Always force dark mode on mount
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
    root.style.backgroundColor = "#111111";
    root.style.color = "#ffffff";
    root.style.colorScheme = "dark";
  }, []);

  // Provide only the fixed dark theme, setTheme is a no-op
  const value = {
    theme: "dark" as const,
    setTheme: () => {},
  };

  return (
    <ThemeProviderContext.Provider value={value}>
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