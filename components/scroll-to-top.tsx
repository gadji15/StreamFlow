"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Détecter quand afficher le bouton
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  // Fonction pour remonter en haut
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <>
      {isVisible && (
        <Button
          className="fixed bottom-6 right-6 z-40 rounded-full bg-primary/90 hover:bg-primary h-10 w-10 p-0"
          onClick={scrollToTop}
          aria-label="Retour en haut"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </>
  )
}

export default ScrollToTop;