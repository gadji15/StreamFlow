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
    <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-gray-900">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-800">
        <div className="text-8xl font-bold">BACKGROUND</div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent">
        <div className="container h-full flex flex-col justify-center px-4 md:px-6">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMovie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-primary text-primary">
                      En vedette
                    </Badge>
                    <div className="flex items-center text-yellow-400 text-sm">
                      {currentMovie.rating} ★
                    </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-bold text-white">
                    {currentMovie.title}
                  </h1>
                  
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <span>{currentMovie.year}</span>
                    <span>•</span>
                    <span>{currentMovie.duration}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 py-2">
                    {currentMovie.genres.map(genre => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <p className="text-base md:text-lg text-gray-300 line-clamp-3 md:line-clamp-none">
                  {currentMovie.description}
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Play className="mr-2 h-4 w-4" /> Regarder
                  </Button>
                  <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                    <Info className="mr-2 h-4 w-4" /> Plus d'infos
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Indicateurs de slide et navigation */}
            <div className="flex items-center space-x-4 mt-8">
              <div className="flex space-x-2">
                {featuredMovies.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentIndex ? "bg-primary" : "bg-gray-700"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={prevMovie} 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={nextMovie} 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800"
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