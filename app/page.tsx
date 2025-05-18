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
        className="py-8 sm:py-12 px-3 sm:px-6 bg-gradient-to-r from-indigo-900/60 to-purple-900/50 mt-8 sm:mt-12"
      >
        <div className="max-w-6xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 mr-2" />
            <h2 className="text-lg sm:text-2xl font-bold">Exclusivités VIP</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
            <div>
              <h3 className="text-base sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4">
                Accédez à du contenu exclusif
              </h3>
              <p className="text-gray-200 sm:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                Débloquez des films et séries en avant-première, des contenus exclusifs et bien plus encore en devenant membre VIP.
              </p>
              <Link href="/vip">
                <Button className="gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md">
                  <Sparkles className="h-4 w-4" />
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