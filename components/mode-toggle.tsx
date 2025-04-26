"use client"

import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode)
    // Dans un cas réel, vous changeriez aussi le thème réel ici
    // en utilisant useTheme() de next-themes ou une approche similaire
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      className="text-white/70 hover:text-white"
    >
      {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  )
}