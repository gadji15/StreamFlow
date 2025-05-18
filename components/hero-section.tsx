'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Données dynamiques pour le Hero : récupérées via Supabase
import { getMoviesByHomepageCategory, Movie } from '@/lib/supabaseFilms';

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

  // State pour effet blur-up
  const [imgLoaded, setImgLoaded] = useState(false);

  // Sélection dynamique d'une image 4K nette si disponible
  let backdrop_4k =
    (currentMovie as any).backdrop_4k ||
    (currentMovie as any).backdrop4k ||
    (currentMovie as any).backdrop_hd ||
    (currentMovie as any).backdropUrl ||
    (currentMovie as any).backdrop ||
    (currentMovie as any).poster_hd ||
    (currentMovie as any).poster ||
    '/placeholder-backdrop.jpg';

  // On prépare aussi des versions plus faibles pour le blur-up
  let backdrop_blur =
    (currentMovie as any).backdrop_blur ||
    (currentMovie as any).poster_blur ||
    '/placeholder-blur.jpg';

  return (
    <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] xl:h-[90vh] overflow-hidden">
      {/* Background avec <img> 4K et effet blur-up */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* Blur-up low-res background */}
        <img
          src={backdrop_blur}
          alt=""
          aria-hidden="true"
          className={`w-full h-full object-cover absolute inset-0 blur-xl scale-105 transition-opacity duration-700 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`}
          draggable={false}
        />
        {/* Image 4K, net, progressive, animée */}
        <motion.img
          key={backdrop_4k + currentMovie.id}
          src={backdrop_4k}
          alt={currentMovie.title}
          aria-hidden="true"
          className="w-full h-full object-cover absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: imgLoaded ? 1 : 0 }}
          srcSet={
            [backdrop_4k]
              .concat(
                (currentMovie as any).backdrop_hd ? [(currentMovie as any).backdrop_hd + ' 1280w'] : [],
                (currentMovie as any).poster_hd ? [(currentMovie as any).poster_hd + ' 640w'] : []
              )
              .join(', ')
          }
          sizes="100vw"
          onLoad={() => setImgLoaded(true)}
          onError={e => {
            setImgLoaded(true);
            // Affiche un placeholder si l'image échoue
            (e.target as HTMLImageElement).src = '/placeholder-backdrop.jpg';
          }}
          draggable={false}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.15 }}
          transition={{ duration: 7, ease: "easeInOut" }}
        />
        {/* Overlay dégradé pour contraste texte */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 pointer-events-none" />
      </div>
      
      {/* Contenu principal */}
      <div className="relative h-full container mx-auto px-2 sm:px-4 flex flex-col justify-end pb-8 sm:pb-12 md:pb-16">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.h1
              className="text-[clamp(2.5rem,7vw,5rem)] md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg md:drop-shadow-2xl font-sans mb-3"
              style={{
                fontFamily: `'Inter', 'Montserrat', 'DM Sans', Arial, sans-serif`,
                letterSpacing: '-0.04em'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              {currentMovie.title}
            </motion.h1>
            
            <motion.div
              className="flex flex-wrap items-center gap-3 text-base md:text-lg text-gray-200 mt-2 mb-4 font-medium drop-shadow-md"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.37 }}
            >
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
              {(currentMovie as any).rating && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {(currentMovie as any).rating}
                </span>
              )}
            </motion.div>
            
            <motion.div
              className="flex flex-wrap gap-2 mb-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              {genres.map((genre, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-gray-700/60 text-sm rounded-full shadow-sm backdrop-blur-sm border border-gray-500/20"
                >
                  {genre}
                </span>
              ))}
            </motion.div>
            
            <motion.p
              className="text-base sm:text-lg md:text-2xl text-gray-200 mb-6 font-normal drop-shadow-md px-1 sm:px-0
                line-clamp-3 sm:line-clamp-4 md:line-clamp-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.62 }}
            >
              {currentMovie.description}
            </motion.p>
            
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.75 }}
            >
              <Link href={`/films/${currentMovie.id}`}>
                <Button
                  size="lg"
                  className="gap-2 px-5 py-3 sm:px-7 sm:py-4 text-lg sm:text-xl font-bold rounded-xl transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-[0_0_16px_4px_rgba(255,255,255,0.10)] focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-fuchsia-400"
                  aria-label={`Regarder ${currentMovie.title}`}
                >
                  <Play className="h-5 w-5" />
                  Regarder
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        
        {/* Pagination */}
        {featuredMovies.length > 1 && (
          <div className="flex justify-center mt-8 gap-1.5">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full outline-none border-none transition-all duration-300
                  ${index === currentIndex
                    ? 'w-8 bg-white shadow-md'
                    : 'w-4 bg-gray-500/70 hover:bg-fuchsia-400/70'}
                  focus-visible:ring-2 focus-visible:ring-fuchsia-400`}
                style={{
                  minWidth: index === currentIndex ? 32 : 16,
                  minHeight: 8,
                  outline: "none",
                  boxShadow: index === currentIndex ? "0 0 8px 2px rgba(255,255,255,0.22)" : undefined,
                  border: "none"
                }}
                onClick={() => handleManualNavigation(index)}
                aria-label={`Afficher le contenu mis en avant numéro ${index + 1}`}
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
            className="absolute left-1 sm:left-4 top-1/2 transform -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/60 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 transition-all duration-150 hover:bg-black/80"
            onClick={goToPrevious}
            aria-label="Aller au film précédent"
            tabIndex={0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            className="absolute right-1 sm:right-4 top-1/2 transform -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/60 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 transition-all duration-150 hover:bg-black/80"
            onClick={goToNext}
            aria-label="Aller au film suivant"
            tabIndex={0}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  );
}

// Assurez-vous d'exporter le composant en tant qu'export par défaut
export default HeroSection;