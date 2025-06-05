"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Plus, Download, Check, Star } from "lucide-react"
import { motion } from "framer-motion"

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
  ],
  downloads: [
    {
      id: 17,
      title: "Interstellar",
      image: "/placeholder.svg?height=450&width=300",
      year: 2014,
      rating: 8.6,
      type: "movie",
      downloaded: true,
      size: "4.2 GB",
    },
    {
      id: 18,
      title: "Inception",
      image: "/placeholder.svg?height=450&width=300",
      year: 2010,
      rating: 8.8,
      type: "movie",
      downloaded: true,
      size: "3.8 GB",
    },
    {
      id: 19,
      title: "The Dark Knight",
      image: "/placeholder.svg?height=450&width=300",
      year: 2008,
      rating: 9.0,
      type: "movie",
      downloaded: false,
      downloadProgress: 65,
      size: "4.5 GB",
    },
    {
      id: 20,
      title: "Parasite",
      image: "/placeholder.svg?height=450&width=300",
      year: 2019,
      rating: 8.5,
      type: "movie",
      downloaded: false,
      downloadProgress: 30,
      size: "3.2 GB",
    },
  ],
  // Correction: ajoutez la clé "recommended" même si vide ou à remplir plus tard
  recommended: [],
}

interface MobileCarouselProps {
  category: "new" | "trending" | "recommended" | "continue-watching" | "downloads"
}

export default function MobileCarousel({ category }: MobileCarouselProps) {
  const [activeId, setActiveId] = useState<number | null>(null)

  const movies = movieData[category] || []

  const handleTap = (id: number) => {
    setActiveId(activeId === id ? null : id)
  }

  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
      }}
    >
      {movies.map((movie) =>
        movie.type === "movie" ? (
          <FilmCard
            key={movie.id}
            movie={{
              id: String(movie.id),
              title: movie.title,
              poster: movie.image,
              year: movie.year,
              isVIP: false,
            }}
          />
        ) : (
          <SeriesCard
            key={movie.id}
            series={{
              id: String(movie.id),
              title: movie.title,
              poster: movie.image,
              year: movie.year,
              isVIP: false,
            }}
          />
        )
      )}
    </div>
  )
}
