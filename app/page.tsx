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

      {/* Présentation du site */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mb-8"
          >
            <motion.h2 variants={item} className="text-3xl md:text-4xl font-bold mb-6">
              Découvrez StreamFlow, votre nouvelle plateforme de streaming
            </motion.h2>
            <motion.p variants={item} className="text-lg text-gray-300 mb-8">
              Des milliers de films et séries à portée de clic. Profitez d'un catalogue riche et varié, mis à jour régulièrement pour vous offrir le meilleur du divertissement.
            </motion.p>
            <motion.div variants={item} className="flex flex-wrap justify-center gap-4">
              <Link href="/films">
                <Button size="lg" className="gap-2">
                  <Film className="h-5 w-5" />
                  Explorer les films
                </Button>
              </Link>
              <Link href="/series">
                <Button size="lg" variant="outline" className="gap-2">
                  <Tv className="h-5 w-5" />
                  Découvrir les séries
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Films populaires */}
      <ContentSection 
        title="Films populaires"
        type="movies"
        filter="popular"
        animated={true}
      />

      {/* Séries populaires */}
      <ContentSection 
        title="Séries populaires"
        type="series"
        filter="popular"
        animated={true}
      />

      {/* Films de suspense */}
      <ContentSection 
        title="Suspense"
        type="movies"
        filter="genre"
        genreId="thriller"
        animated={true}
      />

      {/* Science Fiction */}
      <ContentSection 
        title="Science Fiction"
        type="movies"
        filter="genre"
        genreId="sci-fi"
        animated={true}
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