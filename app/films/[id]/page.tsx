"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoPlayer } from "@/components/video-player"
import { Play, Heart, Share2, Star, Clock, CalendarDays, Film, Info } from "lucide-react"
import { VipBadge } from "@/components/vip-badge"
import { motion } from "framer-motion"

// Données simulées pour le film
const mockMovieData = {
  id: "inception",
  title: "Inception",
  description: "Dom Cobb est un voleur expérimenté, le meilleur dans l'art dangereux de l'extraction, voler les secrets les plus intimes enfouis au plus profond du subconscient...",
  fullDescription: "Dom Cobb est un voleur expérimenté, le meilleur dans l'art dangereux de l'extraction, voler les secrets les plus intimes enfouis au plus profond du subconscient durant une phase de rêve, lorsque l'esprit est le plus vulnérable. Les capacités de Cobb ont fait de lui un acteur très recherché dans ce monde trouble de l'espionnage industriel, mais elles ont aussi fait de lui un fugitif international qui a perdu tout ce qui lui est cher. Mais maintenant, Cobb se voit offrir une chance de retrouver sa vie d'avant s'il parvient à accomplir l'impossible : l'inception, implanter une idée dans l'esprit d'une personne. S'ils réussissent, Cobb et son équipe pourraient réaliser le crime parfait.",
  trailer: "https://www.youtube.com/watch?v=8hP9D6kZseM",
  videoSrc: "https://example.com/sample-video.mp4", // Remplacez par une vraie URL
  posterImage: "/placeholder-movie.jpg",
  backdropImage: "/placeholder-movie-bg.jpg",
  releaseDate: "2010-07-16",
  runtime: 148, // minutes
  genres: ["Science-Fiction", "Action", "Thriller"],
  rating: 4.8,
  vipOnly: false,
  director: "Christopher Nolan",
  cast: [
    { name: "Leonardo DiCaprio", role: "Dom Cobb", image: "/placeholder-actor.jpg" },
    { name: "Joseph Gordon-Levitt", role: "Arthur", image: "/placeholder-actor.jpg" },
    { name: "Ellen Page", role: "Ariadne", image: "/placeholder-actor.jpg" },
    { name: "Tom Hardy", role: "Eames", image: "/placeholder-actor.jpg" },
    { name: "Ken Watanabe", role: "Saito", image: "/placeholder-actor.jpg" }
  ],
  relatedMovies: [
    { id: "interstellar", title: "Interstellar", poster: "/placeholder-movie.jpg", rating: 4.7 },
    { id: "the-dark-knight", title: "The Dark Knight", poster: "/placeholder-movie.jpg", rating: 4.9 },
    { id: "the-prestige", title: "The Prestige", poster: "/placeholder-movie.jpg", rating: 4.6 }
  ]
}

// Convertir la durée en format heures/minutes
const formatRuntime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}min`
}

export default function MovieDetail() {
  const params = useParams()
  const movieId = params.id as string
  const [movie, setMovie] = useState(mockMovieData)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  
  // Ici, vous feriez normalement un appel API pour charger les données du film
  useEffect(() => {
    // Simuler un chargement de données
    console.log(`Loading movie with ID: ${movieId}`)
    // setMovie(...) // Mise à jour avec les données réelles du film
  }, [movieId])
  
  if (!movie) {
    return <div>Chargement...</div>
  }
  
  return (
    <main className="pt-16 min-h-screen">
      {isPlaying ? (
        <div className="fixed inset-0 z-50 bg-black">
          <VideoPlayer 
            src={movie.videoSrc}
            title={movie.title}
            onEnded={() => setIsPlaying(false)}
          />
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 z-10 bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ) : (
        <>
          {/* Hero section avec image de fond */}
          <div className="relative w-full h-[50vh] md:h-[70vh]">
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-700">
              <div className="text-8xl font-bold">BACKGROUND</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent">
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  {/* Poster */}
                  <div className="hidden md:block">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-gray-800">
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">
                        <span className="text-lg">Poster</span>
                      </div>
                      {movie.vipOnly && (
                        <div className="absolute top-2 right-2">
                          <VipBadge />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Informations du film */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center flex-wrap gap-2">
                      {movie.genres.map(genre => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                      {movie.vipOnly && <VipBadge />}
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-bold text-white">{movie.title}</h1>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <div className="flex items-center">
                        <Star className="text-yellow-400 mr-1 h-4 w-4" />
                        <span>{movie.rating}/5</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{formatRuntime(movie.runtime)}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        <span>{new Date(movie.releaseDate).getFullYear()}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 line-clamp-3 md:line-clamp-4">{movie.description}</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsPlaying(true)}>
                        <Play className="mr-2 h-4 w-4" /> Regarder
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className={isFavorite ? "bg-red-500/20 text-red-500 border-red-500/50" : ""}
                        onClick={() => setIsFavorite(!isFavorite)}
                      >
                        <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-red-500" : ""}`} />
                        {isFavorite ? "Dans ma liste" : "Ajouter à ma liste"}
                      </Button>
                      
                      <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" /> Partager
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contenu principal */}
          <div className="container mx-auto px-4 py-8 space-y-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Présentation</TabsTrigger>
                <TabsTrigger value="related">Contenu similaire</TabsTrigger>
                <TabsTrigger value="comments">Commentaires</TabsTrigger>
              </TabsList>
              
              {/* Onglet Présentation */}
              <TabsContent value="overview" className="space-y-8">
                {/* Synopsis complet */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold">Synopsis</h2>
                  <p className="text-gray-300">{movie.fullDescription}</p>
                </div>
                
                {/* Bande-annonce */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold">Bande-annonce</h2>
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-gray-600 flex flex-col items-center">
                      <Film className="h-12 w-12 mb-2" />
                      <span>Aperçu de la bande-annonce</span>
                    </div>
                  </div>
                </div>
                
                {/* Distribution */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold">Distribution</h2>
                  <p className="text-gray-300 mb-4">Réalisé par <span className="font-medium text-white">{movie.director}</span></p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {movie.cast.map((actor) => (
                      <div key={actor.name} className="space-y-2">
                        <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <span className="text-xs">Photo</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-white">{actor.name}</p>
                          <p className="text-sm text-gray-400">{actor.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Onglet Contenu similaire */}
              <TabsContent value="related">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Films similaires</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {movie.relatedMovies.map((relatedMovie) => (
                      <Link href={`/films/${relatedMovie.id}`} key={relatedMovie.id}>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="space-y-2"
                        >
                          <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <span className="text-xs">Poster</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-white truncate">{relatedMovie.title}</p>
                            <div className="flex items-center text-sm">
                              <Star className="text-yellow-400 h-3 w-3 mr-1" />
                              <span className="text-gray-400">{relatedMovie.rating}/5</span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Onglet Commentaires */}
              <TabsContent value="comments">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Commentaires et avis</h2>
                  <p className="text-gray-400">Cette section affichera les commentaires et avis des utilisateurs.</p>
                  
                  {/* Zone de commentaire temporaire */}
                  <div className="p-6 bg-gray-800/50 rounded-lg text-center">
                    <Info className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-300">Les commentaires seront implémentés prochainement.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </main>
  )
}