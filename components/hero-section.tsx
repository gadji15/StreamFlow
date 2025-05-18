'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

import { getMoviesByHomepageCategory, Movie } from '@/lib/supabaseFilms';

// Helpers pour ratio et fallback
function getImageRatio(width?: number, height?: number) {
  if (width && height) return width / height;
  return 21 / 9; // ratio large par défaut
}

// Composant HeroSection 100% responsive et professionnel
function HeroSection() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);

  // Permet d'accéder à l'élément image et de lire ses dimensions
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getMoviesByHomepageCategory('featured', 5)
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

  // Auto rotation
  useEffect(() => {
    if (!isAutoPlaying || featuredMovies.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredMovies.length]);

  // Pause autoplay when user interacts
  const handleManualNavigation = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  // Navigation précédent/suivant
  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + featuredMovies.length) % featuredMovies.length;
    handleManualNavigation(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % featuredMovies.length;
    handleManualNavigation(newIndex);
  };

  const currentMovie = featuredMovies[currentIndex];

  // Gestion du chargement ou de l'absence de contenu
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[200px]">
        <section className="relative w-full aspect-[16/9] sm:aspect-[16/8] md:aspect-[21/9] overflow-hidden flex items-center justify-center">
          <div className="text-2xl text-gray-300 animate-pulse">Chargement du contenu en avant...</div>
        </section>
      </div>
    );
  }
  if (!currentMovie) {
    return (
      <div className="w-full flex justify-center items-center min-h-[200px]">
        <section className="relative w-full aspect-[16/9] sm:aspect-[16/8] md:aspect-[21/9] overflow-hidden flex items-center justify-center">
          <div className="text-2xl text-gray-400">Aucun contenu mis en avant pour le moment.</div>
        </section>
      </div>
    );
  }

  // Extraction des genres (array ou string)
  const genres = Array.isArray(currentMovie.genre)
    ? currentMovie.genre
    : typeof currentMovie.genre === 'string'
    ? currentMovie.genre.split(',').map((g) => g.trim()).filter(Boolean)
    : [];

  // Gestion de la durée (minutes) si disponible
  const duration = (currentMovie as any).duration || null;

  // Utilisation d'une image backdrop si disponible, sinon poster, sinon placeholder
  const rawBackdrop =
    (currentMovie as any).backdropUrl ||
    (currentMovie as any).backdrop ||
    '';

  // Si c'est un backdrop TMDB, essayer de le remplacer par le format original/w1280 pour plus de netteté
  let backdropUrl = '';
  if (rawBackdrop.startsWith('https://image.tmdb.org/t/p/')) {
    backdropUrl = rawBackdrop.replace(/\/w\d+\//, '/w1280/').replace(/\/w\d+\//, '/original/');
  } else if (rawBackdrop) {
    backdropUrl = rawBackdrop;
  } else {
    backdropUrl = '/placeholder-backdrop.jpg';
  }

  // Définir un ratio dynamique basé sur la métadonnée de l'image backdrop
  // Responsive: mobile -> 16/9, tablette -> 16/8, desktop -> 21/9
  let ratio = 21 / 9;
  if (typeof window !== "undefined") {
    if (window.innerWidth < 640) ratio = 16 / 9;
    else if (window.innerWidth < 1024) ratio = 16 / 8;
    else ratio = 21 / 9;
  } else if (imageMeta?.width && imageMeta?.height) {
    ratio = imageMeta.width / imageMeta.height;
  }
  const overlayGradient = 'linear-gradient(90deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.28) 60%, rgba(10,10,10,0.03) 100%)';

  return (
    <div className="w-full flex justify-center items-center min-h-[200px]">
      <section
        className={`
          relative w-full overflow-hidden flex items-center
          transition-all duration-500
          aspect-[16/9] sm:aspect-[16/8] md:aspect-[21/9]
          max-h-[60vw] md:max-h-[540px]
        `}
        style={{
          minHeight: 200,
        }}
      >
        {/* Image de fond nette et compacte */}
        <AnimatePresence initial={false}>
          <motion.div
            key={currentMovie.id}
            className="absolute inset-0 pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="w-full h-full relative">
              {/* On utilise une balise img cachée pour charger l'image et obtenir ses dimensions réelles */}
              <img
                src={backdropUrl}
                alt="backdrop"
                ref={imageRef}
                style={{ display: 'none' }}
                onLoad={e => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    setImageMeta({
                      width: img.naturalWidth,
                      height: img.naturalHeight
                    });
                  }
                }}
              />
              <Image
                src={backdropUrl}
                alt={currentMovie.title}
                fill
                priority
                quality={100}
                sizes="100vw"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  filter: 'brightness(1.05) contrast(1.04)'
                }}
              />
              <div
                className="absolute inset-0 z-50 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 14%, rgba(0,0,0,0.7) 22%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.0) 60%, rgba(0,0,0,0.7) 78%, rgba(0,0,0,0.95) 86%, rgba(0,0,0,1) 100%)'
                }}
              />
              <div
                className="absolute inset-0 z-40"
                style={{
                  background: overlayGradient,
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Contenu compact et dynamique */}
        <div className="
          relative z-20 flex flex-col
          justify-end
          h-full w-full
          px-3 sm:px-6 md:px-12
          pb-6 md:pb-10
        ">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.4 }}
              className="
                max-w-full sm:max-w-lg md:max-w-xl
                w-full
                bg-black/20 md:bg-transparent
                backdrop-blur-[1px] md:backdrop-blur-0
                rounded-xl md:rounded-none
                p-4 sm:p-6 md:py-7 md:px-8
                mt-4 md:mt-0
              "
            >
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-1 text-white drop-shadow-xl leading-snug">
                {currentMovie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base text-white mb-1 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.82)]">
                {currentMovie.year && <span>{currentMovie.year}</span>}
                {(duration || (currentMovie as any).duration) && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-white/50"></span>
                    <span>
                      {Math.floor((duration || (currentMovie as any).duration)/60)}h {(duration || (currentMovie as any).duration)%60}min
                    </span>
                  </>
                )}
                {(currentMovie as any).rating && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-white/50"></span>
                    <span className="flex items-center font-bold">
                      <svg className="w-3 h-3 text-yellow-400 mr-1 drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {(currentMovie as any).rating}
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-2 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.92)]">
                {/* Sur mobile, n'affiche qu'1 genre, sur desktop 2 */}
                {genres.slice(0, 1).map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-0.5 text-xs rounded-full border border-white/25 text-white/95 block sm:hidden"
                  >
                    {genre}
                  </span>
                ))}
                {genres.slice(0, 2).map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-0.5 text-xs rounded-full border border-white/25 text-white/95 hidden sm:block"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              {/* Sur mobile, description plus courte */}
              <p className="text-xs sm:text-sm md:text-base text-white mb-4 line-clamp-2 sm:line-clamp-3 md:line-clamp-4 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.73)]">
                {currentMovie.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link href={`/films/${currentMovie.id}`}>
                  <Button
                    size="sm"
                    className="gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md text-xs sm:text-sm md:text-base transition-transform hover:scale-105 w-full sm:w-auto"
                  >
                    <Play className="h-4 w-4" />
                    Regarder
                  </Button>
                </Link>
                <Link href={`/films/${currentMovie.id}#details`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 px-5 py-2 rounded-lg shadow-md text-xs sm:text-sm md:text-base transition-transform hover:scale-105 w-full sm:w-auto"
                  >
                    <Info className="h-4 w-4" />
                    Détails
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Pagination compacte */}
          {featuredMovies.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
              {featuredMovies.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-200 ${
                    index === currentIndex ? 'w-8 bg-white/90' : 'w-4 bg-white/40'
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
              className="absolute left-3 sm:left-6 top-1/2 transform -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/40 text-white z-40 shadow-md transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={goToPrevious}
              aria-label="Film précédent"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              className="absolute right-3 sm:right-6 top-1/2 transform -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/40 text-white z-40 shadow-md transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={goToNext}
              aria-label="Film suivant"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}
      </section>
    </div>
  );
}

export default HeroSection;