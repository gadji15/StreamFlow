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

  // Permet d'accéder à l'élément image et de lire ses dimensions
  const imageRef = useRef<HTMLImageElement>(null);

  // Valeur de scale (zoom out) - modifiable selon le besoin
  const HERO_SCALE = 0.9;

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
      <div className="w-full flex justify-center items-center" style={{ minHeight: 200 }}>
        <div
          className="flex justify-center items-center"
          style={{
            width: '100%',
            transform: `scale(${0.8})`,
            transformOrigin: 'center',
            transition: 'transform 0.4s'
          }}
        >
          <section className="relative aspect-[21/9] md:aspect-[21/8] overflow-hidden flex items-center justify-center w-full">
            <div className="text-2xl text-gray-300 animate-pulse">Chargement du contenu en avant...</div>
          </section>
        </div>
      </div>
    );
  }
  if (!currentMovie) {
    return (
      <div className="w-full flex justify-center items-center" style={{ minHeight: 200 }}>
        <div
          className="flex justify-center items-center"
          style={{
            width: '100%',
            transform: `scale(${0.8})`,
            transformOrigin: 'center',
            transition: 'transform 0.4s'
          }}
        >
          <section className="relative aspect-[21/9] md:aspect-[21/8] overflow-hidden flex items-center justify-center w-full">
            <div className="text-2xl text-gray-400">Aucun contenu mis en avant pour le moment.</div>
          </section>
        </div>
      </div>
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
  // Utiliser uniquement des images horizontales de qualité pour le HERO (jamais le poster vertical)
  const rawBackdrop =
    (currentMovie as any).backdropUrl ||
    (currentMovie as any).backdrop ||
    '';

  // Si c'est un backdrop TMDB, essayer de le remplacer par le format original/w1280 pour plus de netteté
  let backdropUrl = '';
  if (rawBackdrop.startsWith('https://image.tmdb.org/t/p/')) {
    // Remplacer /w780/ ou /w300/ par /w1280/ ou /original/
    backdropUrl = rawBackdrop.replace(/\/w\d+\//, '/w1280/').replace(/\/w\d+\//, '/original/');
  } else if (rawBackdrop) {
    backdropUrl = rawBackdrop;
  } else {
    backdropUrl = '/placeholder-backdrop.jpg';
  }

  // Définir un ratio dynamique basé sur la métadonnée de l'image backdrop
  const defaultRatio = 21 / 9;
  const ratio = imageMeta?.width && imageMeta?.height
    ? imageMeta.width / imageMeta.height
    : defaultRatio;
  const overlayGradient = 'linear-gradient(90deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.28) 60%, rgba(10,10,10,0.03) 100%)';

  return (
    <div className="w-full flex justify-center items-center" style={{ minHeight: 200 }}>
      <div
        className="flex justify-center items-center w-full"
        style={{
          transform: `scale(${HERO_SCALE})`,
          transformOrigin: 'center',
          transition: 'transform 0.4s'
        }}
      >
        <section
          className="relative w-full overflow-hidden flex items-center transition-all duration-500"
          style={{
            aspectRatio: ratio,
            minHeight: imageMeta?.height
              ? Math.max(270, (window.innerWidth / ratio) * 0.6)
              : 270,
            maxHeight: 540
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
            {/* Overlay vignette cinéma sur les bords */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 
                  'linear-gradient(90deg, rgba(10,10,10,0.80) 0%, rgba(10,10,10,0.00) 18%, rgba(10,10,10,0.00) 82%, rgba(10,10,10,0.80) 100%)'
              }}
            />
            {/* Overlay subtile pour la lisibilité */}
            <div
              className="absolute inset-0 z-20"
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
                className="max-w-md w-full md:w-[340px] px-4 py-4 md:py-7 mt-6 md:mt-0"
              >
                <h1 className="text-2xl md:text-4xl font-bold mb-1 text-white drop-shadow-xl leading-snug">
                  {currentMovie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-white mb-1 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.82)]">
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
                  {genres.slice(0, 2).map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-0.5 text-xs rounded-full border border-white/25 text-white/95"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                <p className="text-xs md:text-sm text-white mb-4 line-clamp-2 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.73)]">{currentMovie.description}</p>
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
      </div>
    </div>
  );
}

export default HeroSection;