"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

// Mock search results
const mockSearchResults = [
  { id: 1, title: "Inception", type: "movie", year: 2010, image: "/placeholder.svg?height=80&width=60" },
  { id: 2, title: "Interstellar", type: "movie", year: 2014, image: "/placeholder.svg?height=80&width=60" },
  { id: 3, title: "The Dark Knight", type: "movie", year: 2008, image: "/placeholder.svg?height=80&width=60" },
  { id: 4, title: "Breaking Bad", type: "series", year: 2008, image: "/placeholder.svg?height=80&width=60" },
  { id: 5, title: "Stranger Things", type: "series", year: 2016, image: "/placeholder.svg?height=80&width=60" },
]

// For a real app, you'd fetch from an API based on user input
const getSearchResults = (query: string) => {
  if (!query) return []
  return mockSearchResults.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase())
  )
}

export default function SearchBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<typeof mockSearchResults>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
  // Update search results when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setResults(getSearchResults(searchQuery))
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery])
  
  // Focus input when opening search
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])
  
  const openSearch = () => {
    setIsSearchOpen(true)
  }
  
  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setResults([])
  }
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search on Ctrl+K or Command+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      
      // Close search on Escape
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSearchOpen])
  
  return (
    <div ref={searchRef} className="relative">
      {/* Search button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={openSearch} 
        className="text-white/70 hover:text-white"
        aria-label="Rechercher"
      >
        <Search className="h-5 w-5" />
      </Button>
      
      {/* Full-screen search modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-full max-w-2xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {/* Search input */}
              <div className="flex items-center px-4 py-3 border-b border-gray-800">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <Input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des films, séries, acteurs..."
                  className="flex-grow border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-gray-400"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeSearch}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Search results */}
              <div className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    {results.map((result) => (
                      <Link 
                        key={result.id} 
                        href={`/${result.type === 'movie' ? 'films' : 'series'}/${result.id}`}
                        onClick={closeSearch}
                      >
                        <div className="flex items-center p-2 rounded-lg hover:bg-gray-800 transition-colors">
                          <div className="relative h-16 w-12 flex-shrink-0">
                            <Image
                              src={result.image}
                              alt={result.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-white font-medium">{result.title}</h4>
                            <div className="flex text-sm text-gray-400">
                              <span className="capitalize">{result.type}</span>
                              <span className="mx-2">•</span>
                              <span>{result.year}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-6 text-center text-gray-400">
                    Aucun résultat pour &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-400">
                    <p>Appuyez sur <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Ctrl + K</kbd> pour rechercher à tout moment</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}