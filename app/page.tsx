'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/hero-section';
import ContentSection from '@/components/content-section';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function HomePage() {
  const { isVIP } = useSupabaseAuth();

  // Animation d'apparition pour la section VIP
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <main className="flex flex-col w-full min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-gray-900">
      {/* Section Hero : mettre l’accent sur l’expérience immersive */}
      <section className="w-full">
        <HeroSection />
      </section>

      <section className="w-full flex flex-col gap-6 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto mt-4">
        {/* Blocs de contenus dynamiques et responsives */}
        <ContentSection
          title="Films populaires"
          type="popular_movies"
          className="rounded-xl shadow bg-gradient-to-b from-indigo-900/60 to-purple-900/30"
        />
        <ContentSection
          title="Séries populaires"
          type="popular_series"
          className="rounded-xl shadow bg-gradient-to-b from-indigo-900/60 to-purple-900/30"
        />
        <ContentSection
          title="Suspense"
          type="movies_by_genre"
          genreId="thriller"
          className="rounded-xl shadow bg-gradient-to-b from-indigo-900/60 to-purple-900/30"
        />
        <ContentSection
          title="Science Fiction"
          type="movies_by_genre"
          genreId="sci-fi"
          className="rounded-xl shadow bg-gradient-to-b from-indigo-900/60 to-purple-900/30"
        />
        <ContentSection
          title="Action"
          type="movies_by_genre"
          genreId="action"
          className="rounded-xl shadow bg-gradient-to-b from-indigo-900/60 to-purple-900/30"
        />
        <ContentSection
          title="Animation"
          type="movies_by_genre"
          genreId="animation"
          className="rounded-xl shadow bg-gradient-to-b from-indigo-900/60 to-purple-900/30"
        />
        <ContentSection
          title="Comédie"
          type="movies_by_genre"
          genreId="comedy"
          className="rounded-xl shadow bg-gradient-to-b from-indigo-900/60 to-purple-900/30"
        />
        <ContentSection
          title="Documentaire"
          type="movies_by_genre"
          genreId="documentary"
          className="rounded-xl shadow bg-gradient-to-b from-indigo-900/60 to-purple-900/30"
        />
        <ContentSection
          title="Séries Science Fiction"
          type="series_by_genre"
          genreId="sci-fi"
          className="rounded-xl shadow bg-gradient-to-b from-indigo-900/60 to-purple-900/30"
        />
        <ContentSection
          title="Séries Thriller"
          type="series_by_genre"
          genreId="thriller"
          className="rounded-xl shadow bg-gradient-to-b from-indigo-900/60 to-purple-900/30"
        />

        {/* Section VIP avec design mobile-first, effets dynamiques et accessibilité */}
        <motion.section
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full bg-gradient-to-r from-amber-200/5 via-yellow-800/10 to-purple-900/40 rounded-2xl shadow-lg px-3 sm:px-6 md:px-10 py-8 sm:py-12 mt-4 md:mt-8"
        >
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
              <Sparkles className="h-7 w-7 text-yellow-400 animate-pulse drop-shadow" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow">
                Exclusivités VIP
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col justify-between">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-white">
                  Accédez à du contenu exclusif et premium !
                </h3>
                <p className="text-gray-100 text-sm sm:text-base mb-4 leading-relaxed">
                  Débloquez des films et séries en avant-première, des bonus, des contenus inédits et bien plus encore en devenant membre VIP.
                </p>
                <Link href="/vip" className="block">
                  <Button
                    className="w-full sm:w-auto gap-2 px-5 py-3 rounded-xl text-base font-bold transition-all duration-200 ease-in shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-yellow-300"
                  >
                    <Sparkles className="h-5 w-5 animate-bounce" />
                    Découvrir l'offre VIP
                    <ArrowRight className="h-5 w-5 ml-1" />
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
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </motion.section>
      </section>
    </main>
  );
} 
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