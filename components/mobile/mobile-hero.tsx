"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, Plus, Info, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { getMoviesByHomepageCategory, Movie } from "@/lib/supabaseFilms";

export default function MobileHero() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getMoviesByHomepageCategory("featured", 5)
      .then((data) => {
        if (isMounted) {
          setFeaturedMovies(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFeaturedMovies([]);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="w-full flex items-center justify-center aspect-[16/9] bg-gray-900/60">
        <div className="text-lg text-gray-300 animate-pulse">
          Chargement du contenu en avant...
        </div>
      </section>
    );
  }

  if (!featuredMovies.length) {
    return (
      <section className="w-full flex items-center justify-center aspect-[16/9] bg-gray-900/60">
        <div className="text-lg text-gray-400">
          Aucun contenu mis en avant pour le moment.
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full aspect-[16/9] overflow-hidden max-w-full">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {featuredMovies.map((movie) => {
          // On récupère la meilleure image possible (backdrop ou poster)
          const rawBackdrop =
            (movie as any).backdropUrl ||
            (movie as any).backdrop ||
            (movie as any).posterUrl ||
            "";
          let backdropUrl = "";
          if (typeof rawBackdrop === "string" && rawBackdrop.startsWith("https://image.tmdb.org/t/p/")) {
            backdropUrl = rawBackdrop.replace(/\/w\d+\//, "/w1280/").replace(/\/w\d+\//, "/original/");
          } else if (rawBackdrop) {
            backdropUrl = rawBackdrop;
          } else {
            backdropUrl = "/placeholder-backdrop.jpg";
          }
          const genres =
            Array.isArray(movie.genre)
              ? movie.genre
              : typeof movie.genre === "string"
              ? movie.genre.split(",").map((g) => g.trim()).filter(Boolean)
              : [];
          const duration = (movie as any).duration || null;

          return (
            <SwiperSlide key={movie.id} className="relative w-full h-full">
              {/* Image de fond et overlays */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={backdropUrl}
                  alt={movie.title}
                  fill
                  priority
                  quality={90}
                  sizes="100vw"
                  className="object-cover object-center brightness-105 transition-opacity duration-1000"
                />
                {/* Overlay pro */}
                <div
                  className="absolute inset-0 z-30 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, #111827 0%, transparent 12%, transparent 88%, #111827 100%)"
                  }}
                />
                <div
                  className="absolute inset-0 z-40"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.28) 60%, rgba(10,10,10,0.03) 100%)"
                  }}
                />
              </div>

              {/* Contenu pro */}
              <div className="relative z-50 flex flex-col justify-end w-full h-full px-2 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-full w-full bg-black/20 rounded-xl p-3 mt-4"
                >
                  <h1 className="text-lg font-bold mb-1 text-white drop-shadow-xl leading-snug">
                    {movie.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white mb-1 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.82)]">
                    {movie.year && <span>{movie.year}</span>}
                    {duration && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-white/50"></span>
                        <span>
                          {Math.floor(duration / 60)}h {duration % 60}min
                        </span>
                      </>
                    )}
                    {(movie as any).rating && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-white/50"></span>
                        <span className="flex items-center font-bold">
                          <Star className="w-3 h-3 text-yellow-400 mr-1 drop-shadow" fill="currentColor" />
                          {(movie as any).rating}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.92)]">
                    {genres.slice(0, 2).map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-0.5 text-xs rounded-full border border-white/25 text-white/95"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-white mb-3 line-clamp-2 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.73)]">
                    {movie.description}
                  </p>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      className="gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-md text-[11px] transition-transform hover:scale-105"
                      asChild
                    >
                      <Link href={`/films/${movie.id}`} className="flex items-center">
                        <Play className="h-4 w-4" />
                        Regarder
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
      </Swiper>
    </div>
  );
}
