"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Données simulées pour les résultats de recherche
const mockSearchResults = [
  { id: 1, title: "Inception", type: "film", year: 2010, image: "/placeholder-movie.jpg" },
  { id: 2, title: "The Dark Knight", type: "film", year: 2008, image: "/placeholder-movie.jpg" },
  { id: 3, title: "Stranger Things", type: "série", year: 2016, image: "/placeholder-series.jpg" },
  { id: 4, title: "Breaking Bad", type: "série", year: 2008, image: "/placeholder-series.jpg" },
  { id: 5, title: "Interstellar", type: "film", year: 2014, image: "/placeholder-movie.jpg" },
]

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState(mockSearchResults)

  // Filtrer les résultats en fonction du terme de recherche
  const filteredResults = searchTerm.length > 0
    ? results.filter(result => 
        result.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  // Ouvrir le dialogue de recherche
  const openSearch = () => {
    setIsOpen(true)
    // Ajouter un raccourci clavier pour fermer le dialogue (Escape)
    document.addEventListener("keydown", handleKeyDown)
  }

  // Fermer le dialogue de recherche
  const closeSearch = () => {
    setIsOpen(false)
    setSearchTerm("")
    // Supprimer le gestionnaire d'événements
    document.removeEventListener("keydown", handleKeyDown)
  }

  // Gérer les raccourcis clavier
  const handleKeyDown = (e: KeyboardEvent) => {
    // Fermer le dialogue si Escape est pressé
    if (e.key === "Escape") {
      closeSearch()
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-white/70 hover:text-white relative"
        onClick={openSearch}
      >
        <Search className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 bg-gray-900 border-gray-800">
          <div className="relative">
            <div className="flex items-center border-b border-gray-800">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un film, une série..."
                className="w-full py-3 pl-12 pr-10 bg-transparent text-white focus:outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
                onClick={closeSearch}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2">
              {searchTerm.length > 0 && filteredResults.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  Aucun résultat trouvé pour "{searchTerm}"
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredResults.map(result => (
                    <div
                      key={result.id}
                      className="flex items-center p-2 rounded-md hover:bg-gray-800 cursor-pointer"
                      onClick={closeSearch}
                    >
                      <div className="w-10 h-14 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">
                          <span className="text-xs">Image</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-white font-medium">{result.title}</p>
                        <p className="text-xs text-gray-400">
                          {result.type} • {result.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm.length > 0 && (
                <div className="mt-2 p-2 border-t border-gray-800">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-purple-400 hover:text-purple-300 hover:bg-gray-800"
                    onClick={closeSearch}
                  >
                    Voir tous les résultats pour "{searchTerm}"
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}