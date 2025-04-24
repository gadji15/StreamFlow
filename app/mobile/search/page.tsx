"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Film, Tv, Star, Mic } from "lucide-react"
import MobileNavigation from "@/components/mobile/mobile-navigation"
import { motion, AnimatePresence } from "framer-motion"

// Mock data for search results
const allContent = [
  {
    id: 1,
    title: "The Matrix Resurrections",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 5.7,
    type: "movie",
    genres: ["Action", "Science-Fiction"],
  },
  {
    id: 2,
    title: "Dune",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 8.0,
    type: "movie",
    genres: ["Science-Fiction", "Aventure"],
  },
  {
    id: 9,
    title: "Squid Game",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 8.0,
    type: "series",
    genres: ["Drame", "Action"],
  },
  {
    id: 10,
    title: "The Witcher",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 8.2,
    type: "series",
    genres: ["Fantastique", "Action"],
  },
  {
    id: 17,
    title: "Interstellar",
    image: "/placeholder.svg?height=450&width=300",
    year: 2014,
    rating: 8.6,
    type: "movie",
    genres: ["Science-Fiction", "Aventure"],
  },
  {
    id: 18,
    title: "Inception",
    image: "/placeholder.svg?height=450&width=300",
    year: 2010,
    rating: 8.8,
    type: "movie",
    genres: ["Science-Fiction", "Action"],
  },
]

// Popular search terms
const popularSearches = [
  "Action",
  "Science-Fiction",
  "Comédie",
  "Drame",
  "Aventure",
  "Thriller",
  "Animation",
  "Fantastique",
]

export default function MobileSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<typeof allContent>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "movies" | "series">("all")
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const filteredResults = allContent.filter((item) => {
      const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "movies" && item.type === "movie") ||
        (activeFilter === "series" && item.type === "series")
      return matchesQuery && matchesFilter
    })

    // Simulate search delay
    const timer = setTimeout(() => {
      setSearchResults(filteredResults)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, activeFilter])

  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
  }

  const handleVoiceSearch = () => {
    setIsListening(true)

    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false)
      setSearchQuery("science fiction")
    }, 2000)
  }

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term)
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <MobileNavigation />

      <div className="pt-20 px-4">
        {/* Search Input */}
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Rechercher des films, séries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-16 py-6 bg-gray-900 border-gray-800 text-white rounded-full"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceSearch}
                className={`h-8 w-8 ${isListening ? "text-purple-500" : "text-gray-400 hover:text-white"}`}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Voice Search Indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 p-3 bg-gray-900 rounded-lg text-center"
              >
                <p className="text-white">Parlez maintenant...</p>
                <div className="flex justify-center mt-2 space-x-1">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-4 bg-purple-500 rounded-full"
                      animate={{
                        height: ["0.5rem", "1.5rem", "0.5rem"],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            className={
              activeFilter === "all"
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
            }
            onClick={() => setActiveFilter("all")}
          >
            Tous
          </Button>
          <Button
            variant={activeFilter === "movies" ? "default" : "outline"}
            className={
              activeFilter === "movies"
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
            }
            onClick={() => setActiveFilter("movies")}
          >
            <Film className="h-4 w-4 mr-2" />
            Films
          </Button>
          <Button
            variant={activeFilter === "series" ? "default" : "outline"}
            className={
              activeFilter === "series"
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
            }
            onClick={() => setActiveFilter("series")}
          >
            <Tv className="h-4 w-4 mr-2" />
            Séries
          </Button>
        </div>

        {/* Search Results or Popular Searches */}
        {searchQuery ? (
          <>
            {isSearching ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-16 h-24 bg-gray-800 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((item) => (
                  <Link href={`/mobile/watch/${item.id}`} key={item.id}>
                    <div className="flex items-center space-x-3">
                      <div className="relative w-16 h-24 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <span>{item.year}</span>
                          <span className="mx-1">•</span>
                          <span>{item.type === "movie" ? "Film" : "Série"}</span>
                          <span className="mx-1">•</span>
                          <span className="flex items-center">
                            <Star className="h-3 w-3 mr-1 fill-yellow-500 stroke-yellow-500" />
                            {item.rating}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.genres.map((genre, index) => (
                            <span key={index} className="text-xs px-1.5 py-0.5 bg-gray-800 rounded-full text-gray-300">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Aucun résultat pour "{searchQuery}"</p>
                <p className="text-sm text-gray-500 mt-2">Essayez avec d'autres mots-clés</p>
              </div>
            )}
          </>
        ) : (
          <div>
            <h2 className="text-white font-medium mb-4">Recherches populaires</h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white"
                  onClick={() => handlePopularSearch(term)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
