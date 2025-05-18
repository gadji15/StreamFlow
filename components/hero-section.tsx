'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Données simulées pour le Hero (à remplacer par des données réelles)
const featuredMovies = [
  {
    id: '1',
    title: 'Inception',
    description: 'Un voleur qui s\'infiltre dans les rêves des autres pour voler leurs secrets.',
    backdropUrl: '/placeholder-backdrop.jpg',
    year: 2010,
    duration: 148,
    rating: 8.8,
    genres: ['Science-Fiction', 'Action', 'Thriller'],
  },
  {
    id: '2',
    title: 'The Dark Knight',
    description: 'Batman s\'allie au procureur Harvey Dent pour démanteler le crime organisé à Gotham.',
    backdropUrl: '/placeholder-backdrop.jpg',
    year: 2008,
    duration: 152,
    rating: 9.0,
    genres: ['Action', 'Crime', 'Drame'],
  },
  {
    id: '3',
    title: 'Interstellar',
    description: 'Un groupe d\'explorateurs utilise un trou de ver pour atteindre des systèmes solaires distants.',
    backdropUrl: '/placeholder-backdrop.jpg',
    year: 2014,
    duration: 169,
    rating: 8.6,
    genres: ['Aventure', 'Drame', 'Science-Fiction'],
  },
];

// Composant HeroSection
function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Auto rotation
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % featuredMovies.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);
  
  // Pause autoplay when user interacts
  const handleManualNavigation = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    
    // Resume autoplay after a delay
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
  
  return (
    <section className="relative h-[55vh] xs:h-[65vh] sm:h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background avec effet parallaxe */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentMovie.id}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.9)), url(${currentMovie.backdropUrl})` 
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>
      
      {/* Contenu principal */}
      <div className="relative h-full w-full max-w-full sm:container sm:mx-auto px-2 xs:px-3 sm:px-4 flex flex-col justify-end py-10 xs:py-12 sm:py-16">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-full sm:max-w-3xl"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-bold mb-1 xs:mb-2">{currentMovie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-xs xs:text-sm md:text-base text-gray-300 mt-1 xs:mt-2 mb-2 xs:mb-4">
              <span>{currentMovie.year}</span>
              <span className="h-1 w-1 rounded-full bg-gray-500"></span>
              <span>{Math.floor(currentMovie.duration / 60)}h {currentMovie.duration % 60}min</span>
              <span className="h-1 w-1 rounded-full bg-gray-500"></span>
              <span className="flex items-center">
                <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {currentMovie.rating}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2 xs:mb-4">
              {currentMovie.genres.map((genre, index) => (
                <span 
                  key={index} 
                  className="px-2 xs:px-3 py-0.5 xs:py-1 bg-gray-700/60 text-xs xs:text-sm rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
            
            <p className="text-base xs:text-lg text-gray-200 mb-4 xs:mb-6 line-clamp-3 md:line-clamp-none">{currentMovie.description}</p>
            
            <div className="flex flex-wrap gap-3 xs:gap-4">
              <Link href={`/films/${currentMovie.id}`}>
                <Button size="sm" className="gap-2 px-3 py-2 text-sm xs:text-base rounded-md">
                  <Play className="h-5 w-5" />
                  Regarder
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Pagination */}
        <div className="flex justify-center mt-5 xs:mt-8">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              className={`h-1 mx-0.5 xs:mx-1 rounded-full transition-all ${
                index === currentIndex ? 'w-6 xs:w-8 bg-white' : 'w-3 xs:w-4 bg-gray-600'
              }`}
              onClick={() => handleManualNavigation(index)}
              aria-label={`Voir le film ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Boutons de navigation */}
      <button
        className="absolute left-2 xs:left-4 top-1/2 transform -translate-y-1/2 w-8 xs:w-10 h-8 xs:h-10 flex items-center justify-center rounded-full bg-black/50 text-white"
        onClick={goToPrevious}
        aria-label="Film précédent"
      >
        <ChevronLeft className="h-5 w-5 xs:h-6 xs:w-6" />
      </button>
      
      <button
        className="absolute right-2 xs:right-4 top-1/2 transform -translate-y-1/2 w-8 xs:w-10 h-8 xs:h-10 flex items-center justify-center rounded-full bg-black/50 text-white"
        onClick={goToNext}
        aria-label="Film suivant"
      >
        <ChevronRight className="h-5 w-5 xs:h-6 xs:w-6" />
      </button>
    </section>
  );
}

// Assurez-vous d'exporter le composant en tant qu'export par défaut
export default HeroSection;