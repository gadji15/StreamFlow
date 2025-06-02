"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Plus, Star } from "lucide-react"

// Mock data for different categories
const movieData = {
  new: [
    {
      id: 1,
      title: "The Matrix Resurrections",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 5.7,
      type: "movie",
    },
    { id: 2, title: "Dune", image: "/placeholder.svg?height=450&width=300", year: 2021, rating: 8.0, type: "movie" },
    {
      id: 3,
      title: "No Time to Die",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 7.3,
      type: "movie",
    },
    {
      id: 4,
      title: "Shang-Chi",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 7.4,
      type: "movie",
    },
    {
      id: 5,
      title: "The French Dispatch",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 7.2,
      type: "movie",
    },
    {
      id: 6,
      title: "Last Night in Soho",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 7.1,
      type: "movie",
    },
    { id: 7, title: "Spencer", image: "/placeholder.svg?height=450&width=300", year: 2021, rating: 6.9, type: "movie" },
    {
      id: 8,
      title: "The Power of the Dog",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 6.9,
      type: "movie",
    },
  ],
  trending: [
    {
      id: 9,
      title: "Squid Game",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 8.0,
      type: "series",
    },
    {
      id: 10,
      title: "The Witcher",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 8.2,
      type: "series",
    },
    {
      id: 11,
      title: "Arcane",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 9.0,
      type: "series",
    },
    {
      id: 12,
      title: "Hawkeye",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 7.5,
      type: "series",
    },
    {
      id: 13,
      title: "Foundation",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 7.4,
      type: "series",
    },
    {
      id: 14,
      title: "Succession",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 8.8,
      type: "series",
    },
    {
      id: 15,
      title: "Yellowjackets",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 7.9,
      type: "series",
    },
    {
      id: 16,
      title: "Dexter: New Blood",
      image: "/placeholder.svg?height=450&width=300",
      year: 2021,
      rating: 8.3,
      type: "series",
    },
  ],
  recommended: [
    {
      id: 17,
      title: "Interstellar",
      image: "/placeholder.svg?height=450&width=300",
      year: 2014,
      rating: 8.6,
      type: "movie",
    },
    {
      id: 18,
      title: "Inception",
      image: "/placeholder.svg?height=450&width=300",
      year: 2010,
      rating: 8.8,
      type: "movie",
    },
    {
      id: 19,
      title: "The Dark Knight",
      image: "/placeholder.svg?height=450&width=300",
      year: 2008,
      rating: 9.0,
      type: "movie",
    },
    {
      id: 20,
      title: "Parasite",
      image: "/placeholder.svg?height=450&width=300",
      year: 2019,
      rating: 8.5,
      type: "movie",
    },
    { id: 21, title: "1917", image: "/placeholder.svg?height=450&width=300", year: 2019, rating: 8.3, type: "movie" },
    { id: 22, title: "Joker", image: "/placeholder.svg?height=450&width=300", year: 2019, rating: 8.4, type: "movie" },
    {
      id: 23,
      title: "The Irishman",
      image: "/placeholder.svg?height=450&width=300",
      year: 2019,
      rating: 7.8,
      type: "movie",
    },
    {
      id: 24,
      title: "Once Upon a Time in Hollywood",
      image: "/placeholder.svg?height=450&width=300",
      year: 2019,
      rating: 7.6,
      type: "movie",
    },
  ],
  "continue-watching": [
    {
      id: 25,
      title: "Breaking Bad",
      image: "/placeholder.svg?height=450&width=300",
      year: 2008,
      rating: 9.5,
      type: "series",
      progress: 75,
    },
    {
      id: 26,
      title: "Stranger Things",
      image: "/placeholder.svg?height=450&width=300",
      year: 2016,
      rating: 8.7,
      type: "series",
      progress: 60,
    },
    {
      id: 27,
      title: "The Queen's Gambit",
      image: "/placeholder.svg?height=450&width=300",
      year: 2020,
      rating: 8.6,
      type: "series",
      progress: 40,
    },
    {
      id: 28,
      title: "Dark",
      image: "/placeholder.svg?height=450&width=300",
      year: 2017,
      rating: 8.8,
      type: "series",
      progress: 90,
    },
    {
      id: 29,
      title: "The Mandalorian",
      image: "/placeholder.svg?height=450&width=300",
      year: 2019,
      rating: 8.8,
      type: "series",
      progress: 30,
    },
    {
      id: 30,
      title: "Chernobyl",
      image: "/placeholder.svg?height=450&width=300",
      year: 2019,
      rating: 9.4,
      type: "series",
      progress: 50,
    },
    {
      id: 31,
      title: "The Crown",
      image: "/placeholder.svg?height=450&width=300",
      year: 2016,
      rating: 8.7,
      type: "series",
      progress: 25,
    },
    {
      id: 32,
      title: "Mindhunter",
      image: "/placeholder.svg?height=450&width=300",
      year: 2017,
      rating: 8.6,
      type: "series",
      progress: 80,
    },
  ],
}

interface MovieCarouselProps {
  category: "new" | "trending" | "recommended" | "continue-watching"
}

export default function MovieCarousel({ category }: MovieCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const movies = movieData[category] || []

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { current } = carouselRef
      const scrollAmount = direction === "left" ? -current.offsetWidth * 0.75 : current.offsetWidth * 0.75
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="relative group">
      <div ref={carouselRef} className="carousel">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="relative flex-shrink-0 w-[220px] movie-card"
            onMouseEnter={() => setHoveredId(movie.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
              <Image
                src={movie.image || "/placeholder.svg"}
                alt={movie.title}
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
              <div className="movie-card-overlay" />

              {/* Progress bar for continue watching */}
              {category === "continue-watching" && "progress" in movie && typeof movie.progress === "number" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
                  <div className="h-full bg-red-600" style={{ width: `${movie.progress}%` }} />
                </div>
              )}

              <div className="movie-card-content">
                <h3 className="text-white font-medium text-lg mb-1 line-clamp-1">{movie.title}</h3>
                <div className="flex items-center text-sm text-gray-300 mb-2">
                  <span>{movie.year}</span>
                  <span className="mx-1">•</span>
                  <span className="flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-yellow-500 stroke-yellow-500" />
                    {movie.rating}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="default" className="btn-primary px-2 py-1 h-8" asChild>
                    <Link href={`/watch/${movie.id}`}>
                      <Play className="h-3 w-3 mr-1" />
                      <span>Regarder</span>
                    </Link>
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-5 z-10"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-5 z-10"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  )
}
