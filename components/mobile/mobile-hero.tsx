"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getMoviesByHomepageCategory, Movie } from "@/lib/supabaseFilms";

// Version mobile du HeroSection, dynamique et 100% responsive, avec même logique que desktop
function MobileHero() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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

  useEffect(() => {
    if (!isAutoPlaying || featuredMovies.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredMovies.length]);

  const handleManualNavigation = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  const goToPrevious = () => {
    const newIndex =
      (currentIndex - 1 + featuredMovies.length) % featuredMovies.length;
    handleManualNavigation(newIndex);
  };
  const goToNext = () => {
    const newIndex = (currentIndex + 1) % featuredMovies.length;
    handleManualNavigation(newIndex);
  };

  // Touch swipe (pour mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.touches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) goToPrevious();
      else goToNext();
      setTouchStartX(null);
    }
  };
  const handleTouchEnd = () => setTouchStartX(null);

  const currentMovie = featuredMovies[currentIndex];

  // Loading/empty state
  if (loading) {
    return (
      <section className="w-full flex items-center justify-center aspect-[9/16] sm:aspect-[16/9] max-h-[60vw] sm:max-h-[430px] bg-gray-900/60">
        <div className="text-xl text-gray-300 animate-pulse">
          Chargement du contenu en avant...
        </div>
      </section>
    );
  }
  if (!currentMovie) {
    return (
      <section className="w-full flex items-center justify-center aspect-[9/16] sm:aspect-[16/9] max-h-[60vw] sm:max-h-[430px] bg-gray-900/60">
        <div className="text-xl text-gray-400">
          Aucun contenu mis en avant pour le moment.
        </div>
      </section>
    );
  }

  // Genres, durée, backdrop HD
  const genres = Array.isArray(currentMovie.genre)
    ? currentMovie.genre
    : typeof currentMovie.genre === "string"
    ? currentMovie.genre.split(",").map((g) => g.trim()).filter(Boolean)
    : [];
  const duration = (currentMovie as any).duration || null;
  const rawBackdrop =
    (currentMovie as any).backdropUrl ||
    (currentMovie as any).backdrop ||
    "";
  let backdropUrl = "";
  if (rawBackdrop.startsWith("https://image.tmdb.org/t/p/")) {
    backdropUrl = rawBackdrop
      .replace(/\/w\d+\//, "/w1280/")
      .replace(/\/w\d+\//, "/original/");
  } else if (rawBackdrop) {
    backdropUrl = rawBackdrop;
  } else {
    backdropUrl = "/placeholder-backdrop.jpg";
  }
  const overlayGradient =
    "linear-gradient(90deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.28) 60%, rgba(10,10,10,0.03) 100%)";

  return (
    <section
      className="
        relative w-full max-w-[100vw] overflow-x-hidden
        aspect-[9/16] sm:aspect-[16/9]
        max-h-[75vw] sm:max-h-[430px]
        flex items-end sm:items-center overflow-hidden
        min-h-[220px] sm:min-h-[320px]
        bg-black
        select-none
        "
      style={{ minHeight: 200 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image de fond et overlays */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentMovie.id}
          className="absolute inset-0 pointer-events-none z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Image
            src={backdropUrl}
            alt={currentMovie.title}
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center brightness-105 contrast-105"
            draggable={false}
            unselectable="on"
          />
          {/* Overlays */}
          <div
            className="absolute inset-0 z-30 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #111827 0%, transparent 18%, transparent 82%, #111827 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-50 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 16%, rgba(0,0,0,0.25) 24%, rgba(0,0,0,0.0) 44%, rgba(0,0,0,0.0) 60%, rgba(0,0,0,0.22) 78%, rgba(0,0,0,0.45) 86%, rgba(0,0,0,0.65) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-40"
            style={{
              background: overlayGradient,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay bas pour fondu homogène */}
      <div
        className="pointer-events-none absolute left-0 right-0 bottom-0 z-[60] h-20 sm:h-28"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #18171c 90%, #18171c 100%)"
        }}
      />
      {/* Contenu */}
      <div
        className="
          relative z-20 flex flex-col
          justify-end
          h-full w-full
          px-3 sm:px-6
          pb-4 sm:pb-8
          items-start
        "
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.4 }}
            className="
              max-w-[95vw] sm:max-w-md
              w-full
              bg-black/55 sm:bg-black/20
              backdrop-blur-[2px] sm:backdrop-blur-0
              rounded-lg sm:rounded-xl
              p-3 sm:p-6
              mt-2 sm:mt-0
              shadow-lg shadow-black/20
              text-left
            "
          >
            <h1 className="text-lg sm:text-2xl font-bold mb-1 text-white drop-shadow-xl leading-snug line-clamp-1 sm:line-clamp-2">
              {currentMovie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white mb-1 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.82)]">
              {currentMovie.year && <span>{currentMovie.year}</span>}
              {(duration || (currentMovie as any).duration) && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/50"></span>
                  <span>
                    {Math.floor(
                      (duration || (currentMovie as any).duration) / 60
                    )}
                    h{" "}
                    {(duration || (currentMovie as any).duration) % 60}min
                  </span>
                </>
              )}
              {(currentMovie as any).rating && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/50"></span>
                  <span className="flex items-center font-bold">
                    <svg
                      className="w-3 h-3 text-yellow-400 mr-1 drop-shadow"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {(currentMovie as any).rating}
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.92)]">
              {genres.slice(0, 1).map((genre, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-0.5 text-[11px] sm:text-xs rounded-full border border-white/25 text-white/95 block sm:hidden"
                >
                  {genre}
                </span>
              ))}
              {genres.slice(0, 2).map((genre, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-0.5 text-[11px] sm:text-xs rounded-full border border-white/25 text-white/95 hidden sm:block"
                >
                  {genre}
                </span>
              ))}
            </div>
            <p className="text-[12px] sm:text-[13px] text-white mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.73)]">
              {currentMovie.description}
            </p>
            <div className="flex gap-1 sm:gap-2">
              <Link href={`/films/${currentMovie.id}`}>
                <Button
                  size="sm"
                  className="
                    gap-1 sm:gap-2
                    bg-red-600 hover:bg-red-700
                    text-white font-semibold
                    px-4 py-1.5 sm:px-5 sm:py-2
                    rounded-md shadow
                    text-[12px] sm:text-base
                    transition-transform hover:scale-105
                  "
                >
                  <Play className="h-4 w-4" />
                  Regarder
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Pagination compacte */}
        {featuredMovies.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-2 z-30">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-200 ${
                  index === currentIndex ? "w-8 bg-white/90" : "w-4 bg-white/40"
                }`}
                onClick={() => handleManualNavigation(index)}
                aria-label={`Voir le film ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      {/* Boutons navigation, sobres et adaptés */}
      {featuredMovies.length > 1 && (
        <>
          <button
            className="
              absolute left-2 sm:left-6
              bottom-16 sm:bottom-auto sm:top-1/2
              sm:transform sm:-translate-y-1/2
              w-8 sm:w-10 h-8 sm:h-10
              flex items-center justify-center
              rounded-full bg-black/40 text-white z-40 shadow-md
              transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white
            "
            onClick={goToPrevious}
            aria-label="Film précédent"
          >
            <ChevronLeft className="h-5 sm:h-6 w-5 sm:w-6" />
          </button>
          <button
            className="
              absolute right-2 sm:right-6
              bottom-16 sm:bottom-auto sm:top-1/2
              sm:transform sm:-translate-y-1/2
              w-8 sm:w-10 h-8 sm:h-10
              flex items-center justify-center
              rounded-full bg-black/40 text-white z-40 shadow-md
              transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white
            "
            onClick={goToNext}
            aria-label="Film suivant"
          >
            <ChevronRight className="h-5 sm:h-6 w-5 sm:w-6" />
          </button>
        </>
      )}
    </section>
  );
}

export default MobileHero;