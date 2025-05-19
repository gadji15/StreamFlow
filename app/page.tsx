 'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Sparkles, Film, Tv, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/hero-section';
import ContentSection from '@/components/content-section';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useResponsiveCount } from '@/hooks/useResponsiveCount';
import dynamic from "next/dynamic";
const MobileHero = dynamic(() => import('@/components/mobile/mobile-hero'), { ssr: false });
export default function HomePage() {
  const { isVIP } = useSupabaseAuth();
  const count = useResponsiveCount();

  // Hook pour détecter le mobile côté client (largeur < 640px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        {isMobile ? <MobileHero /> : <HeroSection />}
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
                limit={count}
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