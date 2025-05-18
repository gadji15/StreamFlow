'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

// Données dynamiques pour le Hero : récupérées via Supabase
import { getMoviesByHomepageCategory, Movie } from '@/lib/supabaseFilms';

// Animation framer pour le zoom subtil du poster
const bgVariants = {
  initial: { scale: 1, opacity: 0 },
  animate: { scale: 1.06, opacity: 1, transition: { duration: 2, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, transition: { duration: 1 } }
};

// Composant HeroSection
function HeroSection() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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

  // Utilisation d'une image backdrop 4K, sinon poster, sinon placeholder
  const backdropUrl =
    (currentMovie as any).backdropUrl ||
    (currentMovie as any).backdrop ||
    (currentMovie as any).poster ||
    '/placeholder-backdrop.jpg';

  return (
    <section
      className="relative h-[70vh] md:h-[80vh] overflow-hidden font-sans"
      aria-label={`Mise en avant : ${currentMovie.title}`}
    >
      {/* Background image animée et optimisée */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentMovie.id}
          className="absolute inset-0 w-full h-full pointer-events-none"
          variants={bgVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="absolute inset-0 z-0">
            {/* Utiliser next/image pour la clarté, le responsive et la performance */}
            <Image
              src={backdropUrl}
              alt={currentMovie.title}
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover object-center w-full h-full blur-0 brightness-100 transition-transform duration-1000"
              style={{
                filter: 'brightness(0.92) saturate(1.12)',
              }}
            />
            {/* Overlay pour le contraste */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/90" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Contenu principal */}
      <div className="relative z-10 h-full container mx-auto px-4 flex flex-col justify-end py-16">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold drop-shadow-lg tracking-tight text-white mb-2 font-sans animate-fade-in-up">
              {currentMovie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-base md:text-lg text-gray-200 mt-2 mb-4 font-sans">
              {currentMovie.year && <span>{currentMovie.year}</span>}
              {(duration || (currentMovie as any).duration) && (
                <>
                  <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                  <span>
                    {Math.floor((duration || (currentMovie as any).duration)/60)}h {(duration || (currentMovie as any).duration)%60}min
                  </span>
                </>
              )}
              <span className="h-1 w-1 rounded-full bg-gray-400"></span>
              {(currentMovie as any).rating && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
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
                  className="px-3 py-1 bg-gray-700/60 text-sm rounded-full font-medium shadow-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="text-xl text-gray-100 mb-7 line-clamp-3 md:line-clamp-none font-sans drop-shadow-lg"
            >
              {currentMovie.description}
            </motion.p>

            <div className="flex flex-wrap gap-4">
              <Link href={`/films/${currentMovie.id}`}>
                <motion.div
                  whileHover={{ scale: 1.07, boxShadow: '0 4px 24px 0 rgba(255,255,255,0.12)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                >
                  <Button
                    size="lg"
                    className="gap-2 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-xl transition"
                    aria-label={`Regarder ${currentMovie.title}`}
                  >
                    <Play className="h-5 w-5" />
                    Regarder
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {featuredMovies.length > 1 && (
          <div className="flex justify-center mt-8">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                className={`h-1 mx-1 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-white' : 'w-4 bg-gray-600'
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition hover:scale-110 hover:bg-black/70"
            onClick={goToPrevious}
            aria-label="Film précédent"
            tabIndex={0}
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition hover:scale-110 hover:bg-black/70"
            onClick={goToNext}
            aria-label="Film suivant"
            tabIndex={0}
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      )}
    </section>
  );
}

// Assurez-vous d'exporter le composant en tant qu'export par défaut
export default HeroSection;