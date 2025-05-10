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
    hidden: { opacity: 1, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delayChildren: 0.3, staggerChildren: 0.2 },
    },
  };

  return (
    <div>
      <HeroSection />

      <ContentSection
        title="Films populaires"
        type="popular_movies"
        count={6}
      />
      <ContentSection
        title="Séries populaires"
        type="popular_series"
        count={6}
      />
      <ContentSection
        title="Action"
        type="movies_by_genre"
        genreId="action"
        count={6}
      />
      <ContentSection
        title="Comédie"
        type="movies_by_genre"
        genreId="comedy"
        count={6}
      />
      <ContentSection
        title="Drame"
        type="movies_by_genre"
        genreId="drama"
        count={6}
      />
      <ContentSection
        title="Animation"
        type="movies_by_genre"
        genreId="animation"
        count={6}
      />
      <ContentSection
        title="Romance"
        type="movies_by_genre"
        genreId="romance"
        count={6}
      />
      <ContentSection
        title="Documentaire"
        type="movies_by_genre"
        genreId="documentary"
        count={6}
      />
      <ContentSection
        title="Suspense"
        type="movies_by_genre"
        genreId="suspense"
        count={6}
      />
      <ContentSection
        title="Science Fiction"
        type="movies_by_genre"
        genreId="science-fiction"
        count={6}
      />
      <ContentSection
        title="Aventure"
        type="movies_by_genre"
        genreId="adventure"
        count={6}
      />
      <ContentSection
        title="Horreur"
        type="movies_by_genre"
        genreId="horror"
        count={6}
      />
      <ContentSection
        title="Fantastique"
        type="movies_by_genre"
        genreId="fantasy"
        count={6}
      />
      <ContentSection
        title="Familial"
        type="movies_by_genre"
        genreId="family"
        count={6}
      />
      <ContentSection
        title="Musique"
        type="movies_by_genre"
        genreId="music"
        count={6}
      />
    </div>
  );
}