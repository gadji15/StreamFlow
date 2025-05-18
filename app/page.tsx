'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Sparkles, Film, Tv, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/hero-section';
import ContentSection from '@/components/content-section';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function HomePage() {
  const { isVIP } = useSupabaseAuth();

  // Animation pour le titre de section
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Hook d'intersection pour l'animation au scroll
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <main>
      {/* Section Hero avec carousel */}
      <HeroSection />

      {/* Présentation du site supprimée */}

      {/* Films populaires */}
      <ContentSection 
        title="Films populaires"
        type="popular_movies"
      />

      {/* Séries populaires */}
      <ContentSection 
        title="Séries populaires"
        type="popular_series"
      />

      {/* Suspense */}
      <ContentSection 
        title="Suspense"
        type="movies_by_genre"
        genreId="thriller"
      />

      {/* Science Fiction */}
      <ContentSection 
        title="Science Fiction"
        type="movies_by_genre"
        genreId="sci-fi"
      />

      {/* Action */}
      <ContentSection 
        title="Action"
        type="movies_by_genre"
        genreId="action"
      />

      {/* Animation */}
      <ContentSection 
        title="Animation"
        type="movies_by_genre"
        genreId="animation"
      />

      {/* Comédie */}
      <ContentSection 
        title="Comédie"
        type="movies_by_genre"
        genreId="comedy"
      />

      {/* Documentaire */}
      <ContentSection 
        title="Documentaire"
        type="movies_by_genre"
        genreId="documentary"
      />

      {/* Séries - Science Fiction */}
      <ContentSection 
        title="Séries Science Fiction"
        type="series_by_genre"
        genreId="sci-fi"
      />

      {/* Séries - Thriller */}
      <ContentSection 
        title="Séries Thriller"
        type="series_by_genre"
        genreId="thriller"
      />

      {/* Exclusivités VIP */}
      <motion.section
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
        className="py-8 sm:py-10 md:py-12 px-2 sm:px-4 md:px-8 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 mt-8 sm:mt-10 md:mt-12 rounded-lg shadow-lg"
      >
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-end mb-4 sm:mb-6 gap-2 sm:gap-4">
            <Sparkles className="h-6 w-6 text-yellow-400 mr-0 sm:mr-2 animate-pulse" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow">
              Exclusivités VIP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-4 text-white">
                Accédez à du contenu exclusif
              </h3>
              <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                Débloquez des films et séries en avant-première, des contenus exclusifs et bien plus encore en devenant membre VIP.
              </p>
              <Link href="/vip" className="block">
                <Button
                  className="w-full sm:w-auto gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 shadow hover:scale-105 active:scale-95"
                >
                  <Sparkles className="h-4 w-4 animate-bounce" />
                  Découvrir l'offre VIP
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div>
              <ContentSection 
                isRow={false} 
                title=""
                type={Math.random() > 0.5 ? "movies" : "series"}
                filter="vip"
                limit={4}
                showHeader={false}
                hideViewAllButton={true}
              />
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}