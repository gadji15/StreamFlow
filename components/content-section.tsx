"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VipBadge } from "@/components/vip-badge"
import { cn } from "@/lib/utils"

// Données simulées pour les films et séries
const mockMovieData = [
  {
    id: 1,
    title: "Inception",
    poster: "/placeholder-movie.jpg",
    rating: 4.8,
    year: 2010,
    genres: ["Sci-Fi", "Action"],
    vipOnly: false,
  },
  {
    id: 2,
    title: "The Dark Knight",
    poster: "/placeholder-movie.jpg",
    rating: 4.9,
    year: 2008,
    genres: ["Action", "Crime"],
    vipOnly: false,
  },
  {
    id: 3,
    title: "Interstellar",
    poster: "/placeholder-movie.jpg",
    rating: 4.7,
    year: 2014,
    genres: ["Sci-Fi", "Adventure"],
    vipOnly: true,
  },
  {
    id: 4,
    title: "The Godfather",
    poster: "/placeholder-movie.jpg",
    rating: 4.9,
    year: 1972,
    genres: ["Crime", "Drama"],
    vipOnly: false,
  },
  {
    id: 5,
    title: "Pulp Fiction",
    poster: "/placeholder-movie.jpg",
    rating: 4.8,
    year: 1994,
    genres: ["Crime", "Drama"],
    vipOnly: false,
  },
  {
    id: 6,
    title: "The Matrix",
    poster: "/placeholder-movie.jpg",
    rating: 4.7,
    year: 1999,
    genres: ["Sci-Fi", "Action"],
    vipOnly: true,
  },
]

const mockSeriesData = [
  {
    id: 1,
    title: "Stranger Things",
    poster: "/placeholder-series.jpg",
    rating: 4.7,
    year: 2016,
    genres: ["Sci-Fi", "Horror"],
    vipOnly: false,
  },
  {
    id: 2,
    title: "Breaking Bad",
    poster: "/placeholder-series.jpg",
    rating: 4.9,
    year: 2008,
    genres: ["Crime", "Drama"],
    vipOnly: false,
  },
  {
    id: 3,
    title: "Game of Thrones",
    poster: "/placeholder-series.jpg",
    rating: 4.8,
    year: 2011,
    genres: ["Fantasy", "Adventure"],
    vipOnly: true,
  },
  {
    id: 4,
    title: "The Witcher",
    poster: "/placeholder-series.jpg",
    rating: 4.5,
    year: 2019,
    genres: ["Fantasy", "Action"],
    vipOnly: false,
  },
  {
    id: 5,
    title: "The Mandalorian",
    poster: "/placeholder-series.jpg",
    rating: 4.7,
    year: 2019,
    genres: ["Sci-Fi", "Action"],
    vipOnly: true,
  },
]

interface ContentSectionProps {
  title: string;
  icon?: React.ReactNode;
  contentType: "movie" | "series";
  isVipSection?: boolean;
  isAnimated?: boolean;
}

export function ContentSection({ 
  title, 
  icon, 
  contentType = "movie",
  isVipSection = false,
  isAnimated = false,
}: ContentSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  
  const items = contentType === "movie" 
    ? mockMovieData.filter(item => isVipSection ? item.vipOnly : true) 
    : mockSeriesData.filter(item => isVipSection ? item.vipOnly : true)

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  // Vérifier les possibilités de défilement au chargement
  useEffect(() => {
    handleScroll()
    // Ajouter la gestion de redimensionnement
    window.addEventListener("resize", handleScroll)
    return () => window.removeEventListener("resize", handleScroll)
  }, [])

  // Retourne la largeur appropriée selon le type d'écran
  const getItemWidth = () => {
    return "w-[180px] sm:w-[200px] md:w-[220px] lg:w-[250px]"
  }

  // Animation pour les cartes
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section className="w-full py-8 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon && <span className="mr-2 text-primary">{icon}</span>}
            <h2 className="text-2xl font-bold">{title}</h2>
            {isVipSection && <VipBadge />}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={scrollLeft} 
              variant="outline" 
              size="icon" 
              className={cn(
                "rounded-full",
                !canScrollLeft && "opacity-50 cursor-not-allowed"
              )}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              onClick={scrollRight} 
              variant="outline" 
              size="icon" 
              className={cn(
                "rounded-full",
                !canScrollRight && "opacity-50 cursor-not-allowed"
              )}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          className="relative"
          onMouseEnter={() => handleScroll()}
        >
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            onScroll={handleScroll}
          >
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`${getItemWidth()} pr-4 flex-shrink-0`}
              >
                {isAnimated ? (
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="h-full"
                  >
                    <ContentCard item={item} />
                  </motion.div>
                ) : (
                  <ContentCard item={item} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Composant pour les cartes de contenu
function ContentCard({ item }: { item: any }) {
  return (
    <div className="relative group overflow-hidden rounded-lg h-full bg-card">
      <div className="aspect-[2/3] relative overflow-hidden bg-gray-800">
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-600">
          <span className="text-xs">Image</span>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm truncate">{item.title}</h3>
            <Badge variant="outline" className="text-xs">
              {item.rating}★
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {item.genres.map((genre: string) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="h-8 w-8 p-0 rounded-full">
              <Play className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {item.vipOnly && (
        <div className="absolute top-2 right-2">
          <VipBadge />
        </div>
      )}
    </div>
  )
}