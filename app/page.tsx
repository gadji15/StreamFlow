 'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Sparkles, Film, Tv, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ResponsiveHero from '@/components/responsive-hero';
import ContentSection from '@/components/content-section';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useResponsiveCount } from '@/hooks/useResponsiveCount';

export default function HomePage() {
  const { isVIP } = useSupabaseAuth();
  const count = useResponsiveCount();

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
    <main className="flex flex-col gap-0 w-full pt-6 md:pt-8">
      {/* Section Hero responsive */}
      <section className="w-full px-0 mt-0 pt-0">
        <ResponsiveHero />
      </section>

      {/* Présentation du site supprimée */}

      {/* Films populaires */}
      <section className="w-full px-3 sm:px-0 mt-1">
        <ContentSection 
          title="Films populaires"
          type="popular_movies"
          count={count}
        />
      </section>

      {/* Séries populaires */}
      <section className="w-full px-3 sm:px-0">
        <ContentSection 
          title="Séries populaires"
          type="popular_series"
          count={count}
        />
      </section>

      {/* Suspense */}
      <section className="w-full px-3 sm:px-0">
        <ContentSection 
          title="Suspense"
          type="movies_by_genre"
          genreId="thriller"
          count={count}
        />
      </section>

      {/* Science Fiction */}
      <section className="w-full px-3 sm:px-0">
        <ContentSection 
          title="Science Fiction"
          type="movies_by_genre"
          genreId="sci-fi"
          count={count}
        />
      </section>

      {/* Action */}
      <section className="w-full px-3 sm:px-0">
        <ContentSection 
          title="Action"
          type="movies_by_genre"
          genreId="action"
          count={count}
        />
      </section>

      {/* Animation */}
      <section className="w-full px-3 sm:px-0">
        <ContentSection 
          title="Animation"
          type="movies_by_genre"
          genreId="animation"
          count={count}
        />
      </section>

      {/* Comédie */}
      <section className="w-full px-3 sm:px-0">
        <ContentSection 
          title="Comédie"
          type="movies_by_genre"
          genreId="comedy"
          count={count}
        />
      </section>

      {/* Documentaire */}
      <section className="w-full px-3 sm:px-0">
        <ContentSection 
          title="Documentaire"
          type="movies_by_genre"
          genreId="documentary"
          count={count}
        />
      </section>

      {/* Séries - Science Fiction */}
      <section className="w-full px-3 sm:px-0">
        <ContentSection 
          title="Séries Science Fiction"
          type="series_by_genre"
          genreId="sci-fi"
          count={count}
        />
      </section>

      {/* Séries - Thriller */}
      <section className="w-full px-3 sm:px-0">
        <ContentSection 
          title="Séries Thriller"
          type="series_by_genre"
          genreId="thriller"
          count={count}
        />
      </section>
    </main>
  );
}