"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Plus, Info, Star } from "lucide-react"
import { motion } from "framer-motion"

// Mock data for movies and series
const allContent = [
  // Movies
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
    id: 3,
    title: "No Time to Die",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 7.3,
    type: "movie",
    genres: ["Action", "Aventure"],
  },
  {
    id: 4,
    title: "Shang-Chi",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 7.4,
    type: "movie",
    genres: ["Action", "Fantastique"],
  },
  {
    id: 5,
    title: "The French Dispatch",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 7.2,
    type: "movie",
    genres: ["Comédie", "Drame"],
  },
  {
    id: 6,
    title: "Last Night in Soho",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 7.1,
    type: "movie",
    genres: ["Drame", "Horreur"],
  },
  {
    id: 7,
    title: "Spencer",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 6.9,
    type: "movie",
    genres: ["Drame", "Biographie"],
  },
  {
    id: 8,
    title: "The Power of the Dog",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 6.9,
    type: "movie",
    genres: ["Drame", "Western"],
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
  {
    id: 19,
    title: "The Dark Knight",
    image: "/placeholder.svg?height=450&width=300",
    year: 2008,
    rating: 9.0,
    type: "movie",
    genres: ["Action", "Crime"],
  },
  {
    id: 20,
    title: "Parasite",
    image: "/placeholder.svg?height=450&width=300",
    year: 2019,
    rating: 8.5,
    type: "movie",
    genres: ["Drame", "Thriller"],
  },
  {
    id: 21,
    title: "1917",
    image: "/placeholder.svg?height=450&width=300",
    year: 2019,
    rating: 8.3,
    type: "movie",
    genres: ["Guerre", "Drame"],
  },
  {
    id: 22,
    title: "Joker",
    image: "/placeholder.svg?height=450&width=300",
    year: 2019,
    rating: 8.4,
    type: "movie",
    genres: ["Crime", "Drame"],
  },
  {
    id: 23,
    title: "The Irishman",
    image: "/placeholder.svg?height=450&width=300",
    year: 2019,
    rating: 7.8,
    type: "movie",
    genres: ["Crime", "Drame"],
  },
  {
    id: 24,
    title: "Once Upon a Time in Hollywood",
    image: "/placeholder.svg?height=450&width=300",
    year: 2019,
    rating: 7.6,
    type: "movie",
    genres: ["Comédie", "Drame"],
  },

  // Series
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
    id: 11,
    title: "Arcane",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 9.0,
    type: "series",
    genres: ["Animation", "Action"],
  },
  {
    id: 12,
    title: "Hawkeye",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 7.5,
    type: "series",
    genres: ["Action", "Aventure"],
  },
  {
    id: 13,
    title: "Foundation",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 7.4,
    type: "series",
    genres: ["Science-Fiction", "Drame"],
  },
  {
    id: 14,
    title: "Succession",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 8.8,
    type: "series",
    genres: ["Drame"],
  },
  {
    id: 15,
    title: "Yellowjackets",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 7.9,
    type: "series",
    genres: ["Drame", "Horreur"],
  },
  {
    id: 16,
    title: "Dexter: New Blood",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    rating: 8.3,
    type: "series",
    genres: ["Crime", "Drame"],
  },
  {
    id: 25,
    title: "Breaking Bad",
    image: "/placeholder.svg?height=450&width=300",
    year: 2008,
    rating: 9.5,
    type: "series",
    genres: ["Crime", "Drame"],
  },
  {
    id: 26,
    title: "Stranger Things",
    image: "/placeholder.svg?height=450&width=300",
    year: 2016,
    rating: 8.7,
    type: "series",
    genres: ["Drame", "Fantastique"],
  },
  {
    id: 27,
    title: "The Queen's Gambit",
    image: "/placeholder.svg?height=450&width=300",
    year: 2020,
    rating: 8.6,
    type: "series",
    genres: ["Drame"],
  },
  {
    id: 28,
    title: "Dark",
    image: "/placeholder.svg?height=450&width=300",
    year: 2017,
    rating: 8.8,
    type: "series",
    genres: ["Science-Fiction", "Drame"],
  },
  {
    id: 29,
    title: "The Mandalorian",
    image: "/placeholder.svg?height=450&width=300",
    year: 2019,
    rating: 8.8,
    type: "series",
    genres: ["Science-Fiction", "Action"],
  },
  {
    id: 30,
    title: "Chernobyl",
    image: "/placeholder.svg?height=450&width=300",
    year: 2019,
    rating: 9.4,
    type: "series",
    genres: ["Drame", "Histoire"],
  },
  {
    id: 31,
    title: "The Crown",
    image: "/placeholder.svg?height=450&width=300",
    year: 2016,
    rating: 8.7,
    type: "series",
    genres: ["Drame", "Histoire"],
  },
  {
    id: 32,
    title: "Mindhunter",
    image: "/placeholder.svg?height=450&width=300",
    year: 2017,
    rating: 8.6,
    type: "series",
    genres: ["Crime", "Drame"],
  },
]

interface MovieGridProps {
  type: "movie" | "series" | "all"
}

export default function MovieGrid({ type }: MovieGridProps) {
  const [visibleCount, setVisibleCount] = useState(12)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  // Filter content based on type
  const filteredContent = type === "all" ? allContent : allContent.filter((item) => item.type === type)

  const visibleContent = filteredContent.slice(0, visibleCount)

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 8, filteredContent.length))
  }

  // Animation variants for grid items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visibleContent.map((item) => (
          <motion.div
            key={item.id}
            className="relative movie-card"
            variants={itemVariants}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
              <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
              <div className="movie-card-overlay" />

              <div className="movie-card-content">
                <h3 className="text-white font-medium text-lg mb-1 line-clamp-1">{item.title}</h3>
                <div className="flex items-center text-sm text-gray-300 mb-2">
                  <span>{item.year}</span>
                  <span className="mx-1">•</span>
                  <span className="flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-yellow-500 stroke-yellow-500" />
                    {item.rating}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.genres.map((genre, index) => (
                    <span key={index} className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-300">
                      {genre}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="default" className="btn-primary px-2 py-1 h-8" asChild>
                    <Link href={`/watch/${item.id}`}>
                      <Play className="h-3 w-3 mr-1" />
                      <span>Regarder</span>
                    </Link>
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" asChild>
                    <Link href={`/${item.type === "movie" ? "films" : "series"}/${item.id}`}>
                      <Info className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {visibleCount < filteredContent.length && (
        <div className="flex justify-center mt-10">
          <Button onClick={loadMore} className="btn-primary">
            Charger plus
          </Button>
        </div>
      )}
    </div>
  )
}
