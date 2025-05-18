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
        className="py-12 px-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 mt-12"
      >
        <div className="container mx-auto">
          <div className="flex items-center mb-6">
            <Sparkles className="h-6 w-6 text-yellow-400 mr-2" />
            <h2 className="text-2xl font-bold">Exclusivités VIP</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Accédez à du contenu exclusif</h3>
              <p className="text-gray-300 mb-6">
                Débloquez des films et séries en avant-première, des contenus exclusifs et bien plus encore en devenant membre VIP.
              </p>
              <Link href="/vip">
                <Button className="gap-2">
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
              />
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}