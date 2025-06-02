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
    <div className="grid grid-cols-2 gap-3">
      {movies.map((movie) => (
        <motion.div
          key={movie.id}
          className="relative movie-card"
          whileTap={{ scale: 0.95 }}
          onTap={() => handleTap(movie.id)}
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
            <Image src={movie.image || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />

            {/* Overlay for active state */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
                activeId === movie.id ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Progress bar for continue watching */}
            {category === "continue-watching" && "progress" in movie && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
                <div className="h-full bg-red-600" style={{ width: `${movie.progress}%` }} />
              </div>
            )}

            {/* Download indicator */}
            {category === "downloads" && (
              <div className="absolute top-2 right-2 z-10">
                {"downloaded" in movie && movie.downloaded ? (
                  <div className="bg-green-500/90 p-1 rounded-full">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  "downloadProgress" in movie && (
                    <div className="relative h-8 w-8 flex items-center justify-center">
                      <svg className="absolute" width="32" height="32" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="14" fill="none" stroke="#374151" strokeWidth="3" />
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="3"
                          strokeDasharray="87.96"
                          strokeDashoffset={87.96 - (87.96 * (movie.downloadProgress || 0)) / 100}
                          transform="rotate(-90 16 16)"
                        />
                      </svg>
                      <span className="text-xs text-white font-medium">{movie.downloadProgress}%</span>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Content that appears when tapped */}
            {activeId === movie.id && (
              <div className="absolute bottom-0 left-0 w-full p-3 z-10">
                <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">{movie.title}</h3>
                <div className="flex items-center text-xs text-gray-300 mb-2">
                  <span>{movie.year}</span>
                  <span className="mx-1">•</span>
                  <span className="flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-yellow-500 stroke-yellow-500" />
                    {movie.rating}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/mobile/watch/${movie.id}`}
                    className="flex-1 flex items-center justify-center bg-purple-600 text-white py-1.5 rounded-md text-sm font-medium"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Regarder
                  </Link>
                  {category === "downloads" ? (
                    "downloaded" in movie && movie.downloaded ? (
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full"
                        title="Déjà téléchargé"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </button>
                    ) : (
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4 text-white" />
                      </button>
                    )
                  ) : (
                    <button
                      className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full"
                      title="Ajouter à la liste"
                    >
                      <Plus className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
