'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { getMoviesByHomepageCategory, Movie } from '@/lib/supabaseFilms';

// Sous-composant : Badge Genre
function GenreBadge({ genre }: { genre: string }) {
  return (
    <span className="px-3 py-1 bg-gray-700/60 text-xs md:text-sm rounded-full font-medium tracking-wider uppercase shadow-sm">
      {genre}
    </span>
  );
}

// Sous-composant : Rating Star
function RatingStar({ rating }: { rating: number }) {
  return (
    <span className="flex items-center text-yellow-400 font-semibold text-sm md:text-base">
      <svg className="w-4 h-4 mr-1 fill-yellow-400 stroke-yellow-400" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {rating}
    </span>
  );
}

// Composant HeroSection
function HeroSection() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden flex items-center justify-center">
        <div className="text-2xl text-gray-300 animate-pulse">Chargement du contenu en avant...</div>
      </section>
    );
  }
  if (!currentMovie) {
    return (
      <section className="relative h-[60vh] md:h-[75vh] overflow-hidden flex items-center justify-center">
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

  // Overlay dynamique selon la luminosité de l'image (simple version - foncé constant)
  const overlayGradient = 'linear-gradient(to bottom, rgba(15, 15, 15, 0.75) 20%, rgba(10,10,10,0.94) 90%)';

  // Calculer le texte alternatif dynamique
  const altText = currentMovie.title
    ? `Affiche du film ${currentMovie.title}`
    : 'Affiche du film mis en avant';

  return (
    <section
      className="relative h-[70vh] md:h-[80vh] overflow-hidden flex items-center"
      tabIndex={-1}
      aria-label={currentMovie.title}
    >
      {/* Background image optimisée, Next/Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={backdropUrl}
          alt={altText}
          fill
          priority
          className="object-cover object-center transition-transform duration-1000 will-change-transform"
          style={{
            filter: isImageLoaded ? 'brightness(0.97) saturate(1.07)' : 'blur(16px) brightness(0.8)',
            transform: isImageLoaded ? 'scale(1)' : 'scale(1.04)',
            transition: 'filter 0.8s, transform 1.2s'
          }}
          onLoad={() => setIsImageLoaded(true)}
          sizes="100vw"
        />
        {/* Overlay dynamique */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: overlayGradient,
            transition: 'background 0.7s'
          }}
          aria-hidden="true"
        />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 h-full container mx-auto px-4 flex flex-col justify-end py-16">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: [0.4, 0.1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <h1
              className="text-white text-4xl md:text-6xl font-extrabold mb-3 drop-shadow-lg"
              style={{ fontFamily: 'var(--font-poppins, inherit)' }}
            >
              {currentMovie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-gray-200 mt-2 mb-4">
              {currentMovie.year && <span>{currentMovie.year}</span>}
              {(duration || (currentMovie as any).duration) && (
                <>
                  <span className="h-1 w-1 rounded-full bg-gray-500"></span>
                  <span>
                    {Math.floor((duration || (currentMovie as any).duration)/60)}h {(duration || (currentMovie as any).duration)%60}min
                  </span>
                </>
              )}
              <span className="h-1 w-1 rounded-full bg-gray-500"></span>
              {(currentMovie as any).rating && <RatingStar rating={(currentMovie as any).rating} />}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((genre, index) => (
                <GenreBadge genre={genre} key={index} />
              ))}
            </div>

            <p className="text-lg text-gray-100 mb-7 max-w-2xl line-clamp-3 md:line-clamp-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              {currentMovie.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href={`/films/${currentMovie.id}`}>
                <Button
                  size="lg"
                  className="gap-2 text-lg font-semibold bg-primary/95 hover:bg-primary shadow-lg shadow-black/40 transition-all duration-300"
                >
                  <Play className="h-5 w-5" />
                  Regarder
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {featuredMovies.length > 1 && (
          <div className="flex justify-center mt-10">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                className={`h-2 mx-1 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-white/90 shadow-lg shadow-black/10' : 'w-4 bg-gray-600/60'
                }`}
                onClick={() => handleManualNavigation(index)}
                aria-label={`Voir le film ${index + 1}`}
                tabIndex={0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Boutons de navigation */}
      {featuredMovies.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={goToPrevious}
            aria-label="Film précédent"
            tabIndex={0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={goToNext}
            aria-label="Film suivant"
            tabIndex={0}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  );
}

export default HeroSection;