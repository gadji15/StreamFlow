"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Données simulées pour les films en vedette
const featuredMovies = [
  {
    id: 1,
    title: "Inception",
    description: "Un voleur qui s'infiltre dans les rêves des autres est chargé d'implanter une idée dans l'esprit d'un PDG.",
    backgroundImage: "/placeholder-movie-bg.jpg",
    genres: ["Sci-Fi", "Action", "Thriller"],
    rating: 4.8,
    year: 2010,
    duration: "2h 28min",
  },
  {
    id: 2,
    title: "The Dark Knight",
    description: "Batman affronte un nouveau criminel, le Joker, qui cherche à plonger Gotham City dans le chaos.",
    backgroundImage: "/placeholder-movie-bg.jpg",
    genres: ["Action", "Crime", "Drama"],
    rating: 4.9,
    year: 2008,
    duration: "2h 32min",
  },
  {
    id: 3,
    title: "Interstellar",
    description: "Un groupe d'explorateurs utilise un trou de ver pour voyager au-delà de notre dimension et sauver l'humanité.",
    backgroundImage: "/placeholder-movie-bg.jpg",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    rating: 4.7,
    year: 2014,
    duration: "2h 49min",
  }
]

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentMovie = featuredMovies[currentIndex]
  
  // Auto-rotation des films en vedette
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length)
    }, 8000)
    
    return () => clearInterval(interval)
  }, [])
  
  const nextMovie = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length)
  }
  
  const prevMovie = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + featuredMovies.length) % featuredMovies.length)
  }
  
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden bg-gray-900">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-800">
        <div className="text-6xl sm:text-7xl lg:text-8xl font-bold">BACKGROUND</div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent">
        <div className="container h-full flex flex-col justify-center px-4 md:px-6">
          <div className="max-w-full sm:max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMovie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-3 md:space-y-4"
              >
                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center flex-wrap gap-2">
                    <Badge variant="outline" className="border-primary text-primary text-xs">
                      En vedette
                    </Badge>
                    <div className="flex items-center text-yellow-400 text-xs">
                      {currentMovie.rating} ★
                    </div>
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {currentMovie.title}
                  </h1>
                  
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-gray-400 text-xs">
                    <span>{currentMovie.year}</span>
                    <span className="hidden xs:inline">•</span>
                    <span>{currentMovie.duration}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 py-1 md:py-2">
                    {currentMovie.genres.map(genre => (
                      <Badge key={genre} variant="secondary" className="text-[10px] md:text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <p className="text-sm md:text-base text-gray-300 line-clamp-2 sm:line-clamp-3 md:line-clamp-none max-w-md lg:max-w-xl">
                  {currentMovie.description}
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2 md:pt-4">
                  <Button className="bg-primary hover:bg-primary/90 h-9 px-3 md:h-10 md:px-4">
                    <Play className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" /> Regarder
                  </Button>
                  <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 h-9 px-3 md:h-10 md:px-4">
                    <Info className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" /> Plus d'infos
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Indicateurs de slide et navigation */}
            <div className="flex items-center space-x-4 mt-6 md:mt-8">
              <div className="flex space-x-2">
                {featuredMovies.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentIndex ? "bg-primary" : "bg-gray-700"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Voir le film ${index + 1}`}
                  />
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={prevMovie} 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800 h-7 w-7 md:h-8 md:w-8"
                  aria-label="Film précédent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={nextMovie} 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800 h-7 w-7 md:h-8 md:w-8"
                  aria-label="Film suivant"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}