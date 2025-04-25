"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { HeroSection } from "@/components/hero-section";
import { ContentSection } from "@/components/content-section";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { TrendingUp, Magic } from "lucide-react";

export default function HomePage() {
  // Mock data for content sections
  const popularMovies = [
    {
      id: "1",
      title: "Captain America: Brave New World",
      posterImage: "/images/captain-america-poster.jpg",
      type: "movie",
      rating: 4.5,
      year: 2024,
      isTop: true
    },
    {
      id: "2",
      title: "Deadpool & Wolverine",
      posterImage: "/images/deadpool-wolverine-poster.jpg",
      type: "movie",
      rating: 4.7,
      year: 2024,
      isTop: true
    },
    {
      id: "3",
      title: "Sous écrous",
      posterImage: "/images/sous-ecrous-poster.jpg",
      type: "movie",
      rating: 4.1,
      year: 2023,
      isNew: true
    },
    {
      id: "4",
      title: "Heretic",
      posterImage: "/images/heretic-poster.jpg",
      type: "movie",
      rating: 4.2,
      year: 2023,
      isNew: true
    },
    {
      id: "5",
      title: "The Insider",
      posterImage: "/images/the-insider-poster.jpg",
      type: "movie",
      rating: 4.0,
      year: 2023
    },
    {
      id: "6",
      title: "Novocaine",
      posterImage: "/images/novocaine-poster.jpg",
      type: "movie",
      rating: 3.9,
      year: 2023
    },
    {
      id: "7",
      title: "The Monkey",
      posterImage: "/images/the-monkey-poster.jpg",
      type: "movie",
      rating: 4.3,
      year: 2024,
      isTop: true
    },
    {
      id: "8",
      title: "L'Amour ouf",
      posterImage: "/images/amour-ouf-poster.jpg",
      type: "movie",
      rating: 3.8,
      year: 2023
    }
  ];
  
  const popularSeries = [
    {
      id: "s1",
      title: "The Rookie",
      posterImage: "/images/the-rookie-poster.jpg",
      type: "series",
      rating: 4.6,
      year: 2023,
      isNew: true
    },
    {
      id: "s2",
      title: "Game of Thrones",
      posterImage: "/images/got-poster.jpg",
      type: "series",
      rating: 4.9,
      year: 2011,
      isTop: true
    },
    {
      id: "s3",
      title: "Snowfall",
      posterImage: "/images/snowfall-poster.jpg",
      type: "series",
      rating: 4.5,
      year: 2017
    },
    {
      id: "s4",
      title: "The Last of Us",
      posterImage: "/images/last-of-us-poster.jpg",
      type: "series",
      rating: 4.8,
      year: 2023,
      isNew: true
    },
    {
      id: "s5",
      title: "Euphoria",
      posterImage: "/images/euphoria-poster.jpg",
      type: "series",
      rating: 4.4,
      year: 2019
    },
    {
      id: "s6",
      title: "Les Simpson",
      posterImage: "/images/simpsons-poster.jpg",
      type: "series",
      rating: 4.7,
      year: 1989
    },
  ];
  
  const suspenseMovies = [
    {
      id: "m1",
      title: "L'Arme fatale 2",
      posterImage: "/images/arme-fatale-2-poster.jpg",
      type: "movie",
      rating: 4.3,
      year: 1989,
      isNew: true
    },
    {
      id: "m2",
      title: "Expendables 2",
      posterImage: "/images/expendables-2-poster.jpg",
      type: "movie",
      rating: 4.1,
      year: 2012,
      isNew: true
    },
    {
      id: "m3",
      title: "Criminal Squad: Pantera",
      posterImage: "/images/criminal-squad-poster.jpg",
      type: "movie",
      rating: 4.0,
      year: 2023
    },
    {
      id: "m4",
      title: "Exam",
      posterImage: "/images/exam-poster.jpg",
      type: "movie",
      rating: 3.9,
      year: 2009,
      isNew: true
    },
    {
      id: "m5",
      title: "Heretic",
      posterImage: "/images/heretic-poster.jpg",
      type: "movie",
      rating: 4.2,
      year: 2023,
      isTop: true
    },
    {
      id: "m6",
      title: "You Should Have Left",
      posterImage: "/images/you-should-poster.jpg",
      type: "movie",
      rating: 3.8,
      year: 2020,
      isNew: true
    },
  ];
  
  const scifiMovies = [
    {
      id: "sf1",
      title: "Sans un Bruit: Jour 1",
      posterImage: "/images/sans-bruit-poster.jpg",
      type: "movie",
      rating: 4.3,
      year: 2024
    },
    {
      id: "sf2",
      title: "Hunger Games: La Révolte",
      posterImage: "/images/hunger-games-poster.jpg",
      type: "movie",
      rating: 4.5,
      year: 2014
    },
    {
      id: "sf3",
      title: "Godzilla II: Roi des Monstres",
      posterImage: "/images/godzilla-poster.jpg",
      type: "movie",
      rating: 4.1,
      year: 2019,
      isNew: true
    },
    {
      id: "sf4",
      title: "Venom: Let There Be Carnage",
      posterImage: "/images/venom-poster.jpg",
      type: "movie",
      rating: 4.0,
      year: 2021
    },
    {
      id: "sf5",
      title: "Iron Man 2",
      posterImage: "/images/ironman-poster.jpg",
      type: "movie",
      rating: 4.3,
      year: 2010
    },
    {
      id: "sf6",
      title: "The Substance",
      posterImage: "/images/substance-poster.jpg",
      type: "movie",
      rating: 4.2,
      year: 2023
    },
  ];
  
  const vipContent = [
    {
      id: "vip1",
      title: "The Batman",
      posterImage: "/images/batman-poster.jpg",
      type: "movie",
      rating: 4.7,
      year: 2022,
      vipOnly: true
    },
    {
      id: "vip2",
      title: "Dune: Deuxième partie",
      posterImage: "/images/dune-poster.jpg",
      type: "movie",
      rating: 4.9,
      year: 2024,
      vipOnly: true,
      isNew: true
    },
    {
      id: "vip3",
      title: "Joker: Folie à Deux",
      posterImage: "/images/joker-poster.jpg",
      type: "movie",
      rating: 4.5,
      year: 2024,
      vipOnly: true,
      isNew: true
    },
    {
      id: "vip4",
      title: "The Penguin",
      posterImage: "/images/penguin-poster.jpg",
      type: "series",
      rating: 4.6,
      year: 2024,
      vipOnly: true,
      isNew: true
    },
    {
      id: "vip5",
      title: "Alien: Romulus",
      posterImage: "/images/alien-poster.jpg",
      type: "movie",
      rating: 4.4,
      year: 2024,
      vipOnly: true
    },
    {
      id: "vip6",
      title: "Challengers",
      posterImage: "/images/challengers-poster.jpg",
      type: "movie",
      rating: 4.3,
      year: 2024,
      vipOnly: true
    },
  ];

  // Animation for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  // Section 1 Animation
  const section1Controls = useAnimation();
  const [section1Ref, section1InView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  // Section 2 Animation
  const section2Controls = useAnimation();
  const [section2Ref, section2InView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  // Section 3 Animation
  const section3Controls = useAnimation();
  const [section3Ref, section3InView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  // Specialty Buttons Animation
  const buttonsControls = useAnimation();
  const [buttonsRef, buttonsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  // VIP Content Animation
  const vipControls = useAnimation();
  const [vipRef, vipInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  // Trigger animations when sections come into view
  useEffect(() => {
    if (section1InView) section1Controls.start("visible");
    if (section2InView) section2Controls.start("visible");
    if (section3InView) section3Controls.start("visible");
    if (buttonsInView) buttonsControls.start("visible");
    if (vipInView) vipControls.start("visible");
  }, [
    section1InView, section1Controls,
    section2InView, section2Controls,
    section3InView, section3Controls,
    buttonsInView, buttonsControls,
    vipInView, vipControls
  ]);

  return (
    <main>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Popular Movies Section */}
      <motion.div
        ref={section1Ref}
        animate={section1Controls}
        initial="hidden"
        variants={sectionVariants}
      >
        <ContentSection
          title="TOP 10 DES FILMS CETTE SEMAINE"
          viewAllUrl="/movies?sort=popular"
          items={popularMovies}
        />
      </motion.div>
      
      {/* Popular Series Section */}
      <motion.div
        ref={section2Ref}
        animate={section2Controls}
        initial="hidden"
        variants={sectionVariants}
      >
        <ContentSection
          title="TOP 10 DES SÉRIES CETTE SEMAINE"
          viewAllUrl="/series?sort=popular"
          items={popularSeries}
        />
      </motion.div>
      
      {/* Special Buttons Section */}
      <motion.div
        ref={buttonsRef}
        animate={buttonsControls}
        initial="hidden"
        variants={sectionVariants}
        className="py-6"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/movies" className="group">
              <div className="flex items-center p-6 bg-surface hover:bg-surface-light border border-gray-800 rounded-xl transition-all duration-300 transform group-hover:scale-[1.02]">
                <div className="mr-6 p-4 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Voir tous les films</h3>
                  <p className="text-sm text-gray-400">Trouvez le contenu qui vous correspond</p>
                </div>
              </div>
            </Link>
            
            <Link href="/random-movie" className="group">
              <div className="flex items-center p-6 bg-surface hover:bg-surface-light border border-gray-800 rounded-xl transition-all duration-300 transform group-hover:scale-[1.02]">
                <div className="mr-6 p-4 rounded-full bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                  <Magic className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Tourner la roue de la chance</h3>
                  <p className="text-sm text-gray-400">Tentez votre chance pour découvrir un contenu qui pourrait vous plaire</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </motion.div>
      
      {/* Suspense Movies */}
      <motion.div
        ref={section3Ref}
        animate={section3Controls}
        initial="hidden"
        variants={sectionVariants}
      >
        <ContentSection
          title="Suspense Total"
          subtitle="Films à suspense qui vous tiendront en haleine"
          viewAllUrl="/movies?genre=suspense"
          items={suspenseMovies}
        />
      </motion.div>
      
      {/* Sci-Fi Movies */}
      <ContentSection
        title="Horizons Infinis"
        subtitle="Voyagez vers d'autres mondes avec ces films de science-fiction"
        viewAllUrl="/movies?genre=sci-fi"
        items={scifiMovies}
      />
      
      {/* VIP Content */}
      <motion.div
        ref={vipRef}
        animate={vipControls}
        initial="hidden"
        variants={sectionVariants}
        className="py-6"
      >
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold">Contenu VIP Exclusif</h2>
              <span className="badge-vip">VIP</span>
            </div>
            <p className="text-sm text-gray-400">Films et séries premium pour nos abonnés VIP</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-900/50 to-amber-900/30 p-6 rounded-2xl mb-6 border border-amber-800/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-lg">
                <h3 className="text-xl font-bold mb-2">Devenez membre VIP</h3>
                <p className="text-gray-300 mb-4">Accédez en priorité aux dernières sorties, aux contenus exclusifs, et bien plus encore avec notre abonnement premium.</p>
                <Link href="/vip" className="btn-primary bg-gradient-to-r from-amber-500 to-yellow-300 hover:from-amber-600 hover:to-yellow-400 text-black inline-flex">
                  En savoir plus
                </Link>
              </div>
              
              <div className="flex-shrink-0 flex gap-2">
                <div className="w-16 h-24 rounded-lg overflow-hidden shadow-lg transform rotate-[-8deg]">
                  <img src="/images/batman-poster.jpg" alt="VIP Movie" className="w-full h-full object-cover" />
                </div>
                <div className="w-16 h-24 rounded-lg overflow-hidden shadow-lg z-10">
                  <img src="/images/dune-poster.jpg" alt="VIP Movie" className="w-full h-full object-cover" />
                </div>
                <div className="w-16 h-24 rounded-lg overflow-hidden shadow-lg transform rotate-[8deg]">
                  <img src="/images/joker-poster.jpg" alt="VIP Movie" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
          
          <ContentSection
            title="Exclusivités VIP"
            viewAllUrl="/vip/content"
            items={vipContent}
            layout="large"
          />
        </div>
      </motion.div>
    </main>
  );
}