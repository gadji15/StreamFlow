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

  const imageWidth = (currentMovie as any).backdropWidth || (currentMovie as any).posterWidth || 3840;
  const imageHeight = (currentMovie as any).backdropHeight || (currentMovie as any).posterHeight || 1640;
  const ratio = getImageRatio(imageWidth, imageHeight);

  // Overlay cinéma façon Xalaflix : gradient sombre à gauche + blur
  const overlayGradient = 'linear-gradient(90deg, rgba(10,10,10,0.90) 0%, rgba(10,10,10,0.40) 60%, rgba(10,10,10,0.05) 100%)';

  return (
    <section
      className={`relative w-full aspect-[${ratio.toFixed(4)}] md:aspect-[${ratio.toFixed(4)}] overflow-hidden`}
      style={{ minHeight: 340 }}
    >
      {/* Image d'arrière-plan ultra nette */}
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
                filter: 'brightness(1.07) contrast(1.05)'
              }}
              onLoadingComplete={(img) => {
                setImageMeta({
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                });
              }}
            />
            {/* Overlay cinéma */}
            <div
              className="absolute inset-0 z-10 backdrop-blur-sm"
              style={{
                background: overlayGradient,
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Contenu principal façon Xalaflix : bloc à gauche, semi-transparent, focus */}
      <div className="relative h-full z-20 flex items-center w-full px-4 md:px-10">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
            className="bg-black/65 backdrop-blur-lg rounded-2xl max-w-2xl w-full md:w-2/3 p-6 md:p-10 shadow-2xl"
          >
            {/* LABEL VIP ou exclusif */}
            {(currentMovie as any).isVip && (
              <span className="inline-block px-4 py-1 mb-3 text-xs font-bold uppercase tracking-widest bg-red-700 rounded-full text-white shadow-md">
                VIP Exclusif
              </span>
            )}

            <h1 className="text-3xl md:text-6xl font-bold mb-2 text-white drop-shadow-xl leading-tight">
              {currentMovie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs md:text-base text-gray-200 mt-2 mb-4">
              {currentMovie.year && <span className="bg-black/40 px-2 py-1 rounded">{currentMovie.year}</span>}
              {(duration || (currentMovie as any).duration) && (
                <>
                  <span className="h-1 w-1 rounded-full bg-gray-500"></span>
                  <span className="bg-black/40 px-2 py-1 rounded">
                    {Math.floor((duration || (currentMovie as any).duration)/60)}h {(duration || (currentMovie as any).duration)%60}min
                  </span>
                </>
              )}
              <span className="h-1 w-1 rounded-full bg-gray-500"></span>
              {(currentMovie as any).rating && (
                <span className="flex items-center bg-yellow-500/90 text-black font-bold px-2 py-1 rounded">
                  <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {(currentMovie as any).rating}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 text-sm rounded-full border border-white/15 text-white"
                >
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-base md:text-lg text-gray-200 mb-8 line-clamp-4 drop-shadow-md">
              {currentMovie.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href={`/films/${currentMovie.id}`}>
                <Button
                  size="lg"
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl shadow-xl text-base md:text-lg transition-transform hover:scale-105"
                >
                  <Play className="h-5 w-5" />
                  Regarder
                </Button>
              </Link>
              <Link href={`/films/${currentMovie.id}#details`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-3 rounded-xl shadow-md text-base md:text-lg transition-transform hover:scale-105"
                >
                  <Info className="h-5 w-5" />
                  Plus d’infos
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Pagination façon Xalaflix */}
        {featuredMovies.length > 1 && (
          <div className="absolute bottom-8 left-8 flex space-x-2 z-30">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'w-8 bg-white/80' : 'w-4 bg-white/40'
                }`}
                onClick={() => handleManualNavigation(index)}
                aria-label={`Voir le film ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      {/* Boutons de navigation */}
      {featuredMovies.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white z-40 shadow-lg transition hover:scale-110"
            onClick={goToPrevious}
            aria-label="Film précédent"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white z-40 shadow-lg transition hover:scale-110"
            onClick={goToNext}
            aria-label="Film suivant"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  );
}

export default HeroSection;