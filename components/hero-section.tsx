"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Plus, Info } from "lucide-react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

// Featured movie data
const featuredMovies = [
  {
    id: 1,
    title: "Interstellar",
    description:
      "Un groupe d'explorateurs utilise un trou de ver récemment découvert pour surpasser les limites du voyage spatial humain et conquérir les vastes distances d'un voyage interstellaire.",
    image: "/placeholder.svg?height=1080&width=1920",
    year: 2014,
    duration: "2h 49min",
    rating: 8.6,
    genres: ["Science-Fiction", "Aventure", "Drame"],
  },
  {
    id: 2,
    title: "Dune",
    description:
      "Paul Atreides, un jeune homme brillant et doué, né pour connaître un destin plus grand que lui-même, doit se rendre sur la planète la plus dangereuse de l'univers pour assurer l'avenir de sa famille et de son peuple.",
    image: "/placeholder.svg?height=1080&width=1920",
    year: 2021,
    duration: "2h 35min",
    rating: 8.0,
    genres: ["Science-Fiction", "Aventure", "Drame"],
  },
  {
    id: 3,
    title: "Inception",
    description:
      "Un voleur qui s'infiltre dans les rêves des autres pour y voler leurs secrets se voit offrir une chance de retrouver sa vie normale en réalisant l'implantation d'une idée dans l'esprit d'une personne.",
    image: "/placeholder.svg?height=1080&width=1920",
    year: 2010,
    duration: "2h 28min",
    rating: 8.8,
    genres: ["Science-Fiction", "Action", "Aventure"],
  },
]

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const currentMovie = featuredMovies[currentIndex]

  useEffect(() => {
    setIsLoaded(true)

    // Auto-rotate featured movies
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={currentMovie.image || "/placeholder.svg"}
          alt={currentMovie.title}
          fill
          priority
          className="object-cover object-center"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
          onLoad={() => setIsLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto h-full px-4 flex items-center">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={currentMovie.id}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {currentMovie.title}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            <span className="text-gray-300 text-sm">{currentMovie.year}</span>
            <span className="text-gray-300 text-sm">•</span>
            <span className="text-gray-300 text-sm">{currentMovie.duration}</span>
            <span className="text-gray-300 text-sm">•</span>
            <span className="text-yellow-500 text-sm flex items-center">
              <Star className="h-4 w-4 mr-1 fill-yellow-500 stroke-yellow-500" />
              {currentMovie.rating}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {currentMovie.genres.map((genre, index) => (
              <span key={index} className="badge badge-primary">
                {genre}
              </span>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-gray-300 mb-6 line-clamp-3 md:line-clamp-none"
          >
            {currentMovie.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Button asChild className="btn-primary">
              <Link href={`/watch/${currentMovie.id}`} className="flex items-center">
                <Play className="h-4 w-4 mr-2" />
                Regarder
              </Link>
            </Button>
            <Button variant="outline" className="btn-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Ma liste
            </Button>
            <Button variant="ghost" className="text-white hover:text-white/80">
              <Info className="h-4 w-4 mr-2" />
              Plus d'infos
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Voir le film ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
