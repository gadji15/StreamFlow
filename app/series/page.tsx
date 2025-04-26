"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Info, Filter } from "lucide-react"
import Link from "next/link"

// Données simulées pour des séries
const mockSeries = [
  {
    id: "stranger-things",
    title: "Stranger Things",
    year: 2016,
    rating: 4.8,
    genres: ["Science-Fiction", "Horreur", "Drame"],
    poster: "/placeholder-movie.jpg",
    vipOnly: false,
    seasons: 4
  },
  {
    id: "breaking-bad",
    title: "Breaking Bad",
    year: 2008,
    rating: 4.9,
    genres: ["Drame", "Crime", "Thriller"],
    poster: "/placeholder-movie.jpg",
    vipOnly: false,
    seasons: 5
  },
  {
    id: "game-of-thrones",
    title: "Game of Thrones",
    year: 2011,
    rating: 4.7,
    genres: ["Drame", "Aventure", "Fantaisie"],
    poster: "/placeholder-movie.jpg",
    vipOnly: true,
    seasons: 8
  },
  {
    id: "the-witcher",
    title: "The Witcher",
    year: 2019,
    rating: 4.5,
    genres: ["Fantaisie", "Action", "Aventure"],
    poster: "/placeholder-movie.jpg",
    vipOnly: false,
    seasons: 2
  },
  {
    id: "the-mandalorian",
    title: "The Mandalorian",
    year: 2019,
    rating: 4.7,
    genres: ["Science-Fiction", "Action", "Aventure"],
    poster: "/placeholder-movie.jpg",
    vipOnly: false,
    seasons: 3
  },
  {
    id: "the-office",
    title: "The Office",
    year: 2005,
    rating: 4.8,
    genres: ["Comédie"],
    poster: "/placeholder-movie.jpg",
    vipOnly: false,
    seasons: 9
  },
  {
    id: "friends",
    title: "Friends",
    year: 1994,
    rating: 4.7,
    genres: ["Comédie", "Romance"],
    poster: "/placeholder-movie.jpg",
    vipOnly: false,
    seasons: 10
  },
  {
    id: "the-crown",
    title: "The Crown",
    year: 2016,
    rating: 4.7,
    genres: ["Drame", "Histoire", "Biographie"],
    poster: "/placeholder-movie.jpg",
    vipOnly: true,
    seasons: 5
  }
];

// Types de filtres disponibles
const genres = ["Action", "Aventure", "Animation", "Comédie", "Crime", "Documentaire", "Drame", "Famille", "Fantaisie", "Histoire", "Horreur", "Musique", "Mystère", "Romance", "Science-Fiction", "Thriller"];
const years = ["2020s", "2010s", "2000s", "1990s", "1980s"];
const ratings = ["5 étoiles", "4+ étoiles", "3+ étoiles"];

export default function SeriesPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  
  return (
    <div className="min-h-screen">
      {/* En-tête avec bannière */}
      <div className="bg-gray-900 pt-24 pb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Séries</h1>
          <p className="text-gray-300 max-w-3xl">
            Plongez dans des histoires captivantes qui se déploient sur plusieurs épisodes. Des drames intenses aux comédies légères, trouvez votre prochaine série préférée.
          </p>
        </div>
      </div>
      
      {/* Section de filtres */}
      <div className="bg-black border-y border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
              {activeFilters.map(filter => (
                <Badge 
                  key={filter} 
                  className="bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 px-3 py-1"
                  onClick={() => toggleFilter(filter)}
                >
                  {filter} ×
                </Badge>
              ))}
              {activeFilters.length === 0 && (
                <span className="text-gray-400 text-sm">Aucun filtre sélectionné</span>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" /> Filtres
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 border-t border-gray-800 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map(genre => (
                    <Badge 
                      key={genre} 
                      variant={activeFilters.includes(genre) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Années</h3>
                <div className="flex flex-wrap gap-2">
                  {years.map(year => (
                    <Badge 
                      key={year} 
                      variant={activeFilters.includes(year) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter(year)}
                    >
                      {year}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Notes</h3>
                <div className="flex flex-wrap gap-2">
                  {ratings.map(rating => (
                    <Badge 
                      key={rating} 
                      variant={activeFilters.includes(rating) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter(rating)}
                    >
                      {rating}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Grille de séries */}
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {mockSeries.map((series) => (
              <Link href={`/series/${series.id}`} key={series.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="group"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-600">
                      <span className="text-xs">Poster</span>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-3 w-full">
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" className="h-8 w-8 p-0 rounded-full">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full">
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {series.vipOnly && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full font-bold">
                          VIP
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-white text-sm truncate">{series.title}</h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{series.seasons} {series.seasons > 1 ? 'saisons' : 'saison'}</span>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{series.rating}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}