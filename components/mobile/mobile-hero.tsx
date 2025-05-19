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
      <section className="w-full flex items-center justify-center aspect-[16/9] max-h-[60vw] sm:max-h-[320px] bg-gray-900/60">
        <div className="text-lg text-gray-300 animate-pulse">
          Chargement du contenu en avant...
        </div>
      </section>
    );
  }

  if (!featuredMovies.length) {
    return (
      <section className="w-full flex items-center justify-center aspect-[16/9] max-h-[60vw] sm:max-h-[320px] bg-gray-900/60">
        <div className="text-lg text-gray-400">
          Aucun contenu mis en avant pour le moment.
        </div>
      </section>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] max-h-[60vw] sm:max-h-[320px] overflow-hidden">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
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
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={backdropUrl}
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-base sm:text-xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-poppins)" }}>
                    {movie.title}
                  </h1>

                  <div className="flex flex-wrap gap-2 mb-1">
                    {movie.year && <span className="text-gray-300 text-xs">{movie.year}</span>}
                    {duration && (
                      <>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-gray-300 text-xs">
                          {Math.floor(duration / 60)}h {duration % 60}min
                        </span>
                      </>
                    )}
                    {(movie as any).rating && (
                      <>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-yellow-500 text-xs flex items-center">
                          <Star className="h-4 w-4 mr-1 fill-yellow-500 stroke-yellow-500" />
                          {(movie as any).rating}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {genres.slice(0, 2).map((genre, index) => (
                      <span key={index} className="bg-white/10 rounded px-2 py-0.5 text-xs text-white border border-white/20">
                        {genre}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-300 mb-2 line-clamp-2 text-xs">{movie.description}</p>

                  <div className="flex gap-2">
                    <Button asChild className="btn-primary flex-1 text-xs px-2 py-1">
                      <Link href={`/films/${movie.id}`} className="flex items-center justify-center">
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
          );
        })}
      </Swiper>
    </div>
  );
}
      </Swiper>
    </div>
  );
}
