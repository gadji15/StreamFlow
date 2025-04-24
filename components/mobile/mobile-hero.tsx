"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Plus, Info, Star } from "lucide-react"
import { motion } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

// Featured movie data
const featuredMovies = [
  {
    id: 1,
    title: "Interstellar",
    description:
      "Un groupe d'explorateurs utilise un trou de ver récemment découvert pour surpasser les limites du voyage spatial humain.",
    image: "/placeholder.svg?height=1080&width=1920",
    year: 2014,
    duration: "2h 49min",
    rating: 8.6,
    genres: ["Science-Fiction", "Aventure"],
  },
  {
    id: 2,
    title: "Dune",
    description:
      "Paul Atreides doit se rendre sur la planète la plus dangereuse de l'univers pour assurer l'avenir de sa famille et de son peuple.",
    image: "/placeholder.svg?height=1080&width=1920",
    year: 2021,
    duration: "2h 35min",
    rating: 8.0,
    genres: ["Science-Fiction", "Aventure"],
  },
  {
    id: 3,
    title: "Inception",
    description:
      "Un voleur qui s'infiltre dans les rêves des autres pour y voler leurs secrets se voit offrir une chance de retrouver sa vie normale.",
    image: "/placeholder.svg?height=1080&width=1920",
    year: 2010,
    duration: "2h 28min",
    rating: 8.8,
    genres: ["Science-Fiction", "Action"],
  },
]

export default function MobileHero() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="h-full w-full"
      >
        {featuredMovies.map((movie) => (
          <SwiperSlide key={movie.id} className="relative">
            <div className="absolute inset-0">
              <Image
                src={movie.image || "/placeholder.svg"}
                alt={movie.title}
                fill
                priority
                className="object-cover object-center"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                }}
                onLoad={() => setIsLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/70 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col justify-end h-full px-4 pb-12">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-poppins)" }}>
                  {movie.title}
                </h1>

                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-gray-300 text-sm">{movie.year}</span>
                  <span className="text-gray-300 text-sm">•</span>
                  <span className="text-gray-300 text-sm">{movie.duration}</span>
                  <span className="text-gray-300 text-sm">•</span>
                  <span className="text-yellow-500 text-sm flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-yellow-500 stroke-yellow-500" />
                    {movie.rating}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {movie.genres.map((genre, index) => (
                    <span key={index} className="badge badge-primary text-xs">
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="text-gray-300 mb-4 line-clamp-2 text-sm">{movie.description}</p>

                <div className="flex gap-3">
                  <Button asChild className="btn-primary flex-1">
                    <Link href={`/mobile/watch/${movie.id}`} className="flex items-center justify-center">
                      <Play className="h-4 w-4 mr-2" />
                      Regarder
                    </Link>
                  </Button>
                  <Button variant="outline" className="btn-secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="btn-secondary">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
