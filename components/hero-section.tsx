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

// Composant HeroSection robuste et dynamique
function HeroSection() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageMeta, setImageMeta] = useState<{width: number, height: number} | null>(null);

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
    return () => { isMounted = false };
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
      <section className="relative aspect-[21/9] md:aspect-[21/8] overflow-hidden flex items-center justify-center">
        <div className="text-2xl text-gray-300 animate-pulse">Chargement du contenu en avant...</div>
      </section>
    );
  }
  if (!currentMovie) {
    return (
      <section className="relative aspect-[21/9] md:aspect-[21/8] overflow-hidden flex items-center justify-center">
        <div className="text-2xl text-gray-400">Aucun contenu mis en avant pour le moment.</div>
      </section>
    );
  }

  // Extraction des genres (array ou string)
  const genres = Array.isArray(currentMovie.genre)
    ? currentMovie.genre
    : typeof currentMovie.genre === 'string'
      ? currentMovie.genre.split(',').map(g => g.trim()).filter(Boolean)
      : [];

  // Gestion de la durée (minutes) si disponible
  const duration = (currentMovie as any).duration || null;

  // Utilisation d'une image backdrop si disponible, sinon poster, sinon placeholder
  const backdropUrl =
    (currentMovie as any).backdropUrl ||
    (currentMovie as any).backdrop ||
    (currentMovie as any).poster ||
    '/placeholder-backdrop.jpg';

  // Ratio compact et dynamique
  const ratio = 16 / 5; // Garder ratio cinéma, la hauteur prime ici
  const overlayGradient = 'linear-gradient(90deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.28) 60%, rgba(10,10,10,0.03) 100%)';

  return (
    <section
      className="relative w-full h-[52vh] md:h-[60vh] min-h-[270px] max-h-[540px] overflow-hidden flex items-center"
      style={{ aspectRatio: `${ratio}` }}
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
            {/* Overlay subtile pour la lisibilité */}
            <div
              className="absolute inset-0 z-10 backdrop-blur-[2px]"
              style={{
                background: overlayGradient,
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Contenu compact et dynamique */}
      <div className="relative z-20 flex flex-col justify-center md:justify-end h-full w-full px-3 md:px-10">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.4 }}
            className="bg-black/60 backdrop-blur-md rounded-xl max-w-md w-full md:w-[340px] px-4 py-4 md:py-7 shadow-xl mt-6 md:mt-0"
          >
            <h1 className="text-2xl md:text-4xl font-bold mb-1 text-white drop-shadow-lg leading-snug">
              {currentMovie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-200 mb-1">
              {currentMovie.year && <span className="bg-black/30 px-2 py-0.5 rounded">{currentMovie.year}</span>}
              {(duration || (currentMovie as any).duration) && (
                <>
                  <span className="h-1 w-1 rounded-full bg-gray-500"></span>
                  <span className="bg-black/30 px-2 py-0.5 rounded">
                    {Math.floor((duration || (currentMovie as any).duration)/60)}h {(duration || (currentMovie as any).duration)%60}min
                  </span>
                </>
              )}
              <span className="h-1 w-1 rounded-full bg-gray-500"></span>
              {(currentMovie as any).rating && (
                <span className="flex items-center bg-yellow-500/90 text-black font-bold px-2 py-0.5 rounded">
                  <svg className="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {(currentMovie as any).rating}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {genres.slice(0, 2).map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-0.5 bg-white/10 text-xs rounded-full border border-white/15 text-white"
                >
                  {genre}
                </span>
              ))}
            </div>
            <p className="text-xs md:text-sm text-gray-200 mb-4 line-clamp-2">{currentMovie.description}</p>
            <div className="flex gap-2">
              <Link href={`/films/${currentMovie.id}`}>
                <Button
                  size="sm"
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md text-xs md:text-base transition-transform hover:scale-105"
                >
                  <Play className="h-4 w-4" />
                  Regarder
                </Button>
              </Link>
              <Link href={`/films/${currentMovie.id}#details`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 px-5 py-2 rounded-lg shadow-md text-xs md:text-base transition-transform hover:scale-105"
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
          <div className="absolute bottom-5 left-5 flex space-x-2 z-30">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'w-7 bg-white/90' : 'w-3 bg-white/40'
                }`}
                onClick={() => handleManualNavigation(index)}
                aria-label={`Voir le film ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      {/* Boutons navigation, sobres et petits */}
      {featuredMovies.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/45 text-white z-40 shadow-md transition hover:scale-110"
            onClick={goToPrevious}
            aria-label="Film précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/45 text-white z-40 shadow-md transition hover:scale-110"
            onClick={goToNext}
            aria-label="Film suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
}

export default HeroSection;