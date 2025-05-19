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
  // On retire l'état isLoaded car Next/Image gère automatiquement le lazy loading
  return (
    <div className="relative w-full aspect-[16/9] max-h-[60vw] sm:max-h-[320px] overflow-hidden">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {featuredMovies.map((movie) => (
          <SwiperSlide key={movie.id} className="relative w-full h-full">
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={movie.image || "/placeholder.svg"}
                alt={movie.title}
                fill
                priority
                quality={90}
                sizes="100vw"
                className="object-cover object-center transition-opacity duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/70 to-transparent pointer-events-none" />
            </div>

            <div className="relative z-10 flex flex-col justify-end w-full h-full px-3 pb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-poppins)" }}>
                  {movie.title}
                </h1>

                <div className="flex flex-wrap gap-2 mb-1">
                  <span className="text-gray-300 text-xs">{movie.year}</span>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-gray-300 text-xs">{movie.duration}</span>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-yellow-500 text-xs flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-yellow-500 stroke-yellow-500" />
                    {movie.rating}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {movie.genres.map((genre, index) => (
                    <span key={index} className="bg-white/10 rounded px-2 py-0.5 text-xs text-white border border-white/20">
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="text-gray-300 mb-2 line-clamp-2 text-xs">{movie.description}</p>

                <div className="flex gap-2">
                  <Button asChild className="btn-primary flex-1 text-xs px-2 py-1">
                    <Link href={`/mobile/watch/${movie.id}`} className="flex items-center justify-center">
                      <Play className="h-4 w-4 mr-1" />
                      Regarder
                    </Link>
                  </Button>
                  <Button variant="outline" className="btn-secondary px-2 py-1">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="btn-secondary px-2 py-1">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
