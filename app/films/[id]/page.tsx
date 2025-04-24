import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Plus, Star, Clock, Calendar, Film } from "lucide-react"
import LoadingSkeleton from "@/components/loading-skeleton"
import MovieCarousel from "@/components/movie-carousel"

// Mock data for movie details
const getMovieDetails = (id: string) => {
  return {
    id: Number.parseInt(id),
    title: "Dune",
    description:
      "Paul Atreides, un jeune homme brillant et doué, né pour connaître un destin plus grand que lui-même, doit se rendre sur la planète la plus dangereuse de l'univers pour assurer l'avenir de sa famille et de son peuple. Alors que des forces malveillantes éclatent en conflit pour s'emparer de la ressource la plus précieuse de la planète - une marchandise capable de déverrouiller le plus grand potentiel de l'humanité - seuls ceux qui peuvent vaincre leur peur survivront.",
    image: "/placeholder.svg?height=600&width=400",
    backdrop: "/placeholder.svg?height=1080&width=1920",
    year: 2021,
    duration: "2h 35min",
    rating: 8.0,
    genres: ["Science-Fiction", "Aventure", "Drame"],
    director: "Denis Villeneuve",
    cast: [
      { name: "Timothée Chalamet", role: "Paul Atreides" },
      { name: "Rebecca Ferguson", role: "Lady Jessica" },
      { name: "Oscar Isaac", role: "Duke Leto Atreides" },
      { name: "Jason Momoa", role: "Duncan Idaho" },
      { name: "Stellan Skarsgård", role: "Baron Vladimir Harkonnen" },
      { name: "Zendaya", role: "Chani" },
    ],
    trailer: "https://www.youtube.com/embed/8g18jFHCLXk",
  }
}

export default function MovieDetailsPage({ params }: { params: { id: string } }) {
  const movie = getMovieDetails(params.id)

  return (
    <div className="pt-16">
      {/* Backdrop Image */}
      <div className="relative h-[50vh] min-h-[400px]">
        <Image
          src={movie.backdrop || "/placeholder.svg"}
          alt={movie.title}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-950" />
      </div>

      {/* Movie Details */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Movie Poster */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl">
              <Image src={movie.image || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
            </div>
          </div>

          {/* Movie Info */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-poppins">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
              <div className="flex items-center text-yellow-500">
                <Star className="h-5 w-5 mr-1 fill-yellow-500 stroke-yellow-500" />
                <span className="font-medium">{movie.rating}/10</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{movie.year}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="h-4 w-4 mr-1" />
                <span>{movie.duration}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Film className="h-4 w-4 mr-1" />
                <span>{movie.genres.join(", ")}</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-white">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">{movie.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-white">Réalisateur</h2>
              <p className="text-gray-300">{movie.director}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-white">Casting principal</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {movie.cast.map((person, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
                    <div>
                      <p className="text-white font-medium">{person.name}</p>
                      <p className="text-gray-400 text-sm">{person.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button asChild className="btn-primary">
                <Link href={`/watch/${movie.id}`} className="flex items-center">
                  <Play className="h-4 w-4 mr-2" />
                  Regarder
                </Link>
              </Button>
              <Button variant="outline" className="btn-secondary">
                <Plus className="h-4 w-4 mr-2" />
                Ma liste
              </Button>
            </div>
          </div>
        </div>

        {/* Trailer Section */}
        <div className="my-12">
          <h2 className="section-title mb-6">Bande-annonce</h2>
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <iframe
              src={movie.trailer}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </div>

        {/* Similar Movies */}
        <div className="my-12">
          <h2 className="section-title">Films similaires</h2>
          <Suspense fallback={<LoadingSkeleton type="carousel" />}>
            <MovieCarousel category="recommended" />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
