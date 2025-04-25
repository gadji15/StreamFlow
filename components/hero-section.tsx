"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Plus, Star } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";

interface Movie {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  posterImage: string;
  year: number;
  duration: string;
  rating: number;
  genres: string[];
}

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  // Featured movies data
  const featuredMovies: Movie[] = [
    {
      id: "1",
      title: "Captain America: Brave New World",
      description: "Après les événements de Falcon et le Soldat de l'Hiver, Sam Wilson prend officiellement le manteau de Captain America et doit faire face à de nouveaux défis dans un monde en constante évolution.",
      backgroundImage: "/images/captain-america-bg.jpg",
      posterImage: "/images/captain-america-poster.jpg",
      year: 2024,
      duration: "2h 24min",
      rating: 4.5,
      genres: ["Action", "Aventure", "Science-Fiction"]
    },
    {
      id: "2",
      title: "The Monkey",
      description: "Un singe mécanique vintage devient le catalyseur d'une série d'événements de plus en plus violents et inexplicables dans la vie de deux frères.",
      backgroundImage: "/images/the-monkey-bg.jpg",
      posterImage: "/images/the-monkey-poster.jpg",
      year: 2024,
      duration: "1h 45min",
      rating: 4.2,
      genres: ["Horreur", "Thriller", "Mystère"]
    },
    {
      id: "3",
      title: "Mufasa: Le Roi Lion",
      description: "Cette préquelle révèle l'histoire de Mufasa, depuis son enfance difficile jusqu'à son ascension en tant que légendaire Roi de la Terre des Lions.",
      backgroundImage: "/images/mufasa-bg.jpg",
      posterImage: "/images/mufasa-poster.jpg",
      year: 2024,
      duration: "1h 58min",
      rating: 4.7,
      genres: ["Animation", "Aventure", "Drame"]
    }
  ];
  
  // Auto-rotate featured movies
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length);
      }, 8000);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, featuredMovies.length]);
  
  // Pause autoplay on hover
  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);
  
  const currentMovie = featuredMovies[currentIndex];
  
  return (
    <section 
      className="relative h-[90vh] min-h-[600px] w-full overflow-hidden"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* Background Image with Parallax Effect */}
      <AnimatedBackground>
        <Image
          src={currentMovie.backgroundImage}
          alt={currentMovie.title}
          fill
          priority
          className="object-cover object-center"
          quality={90}
        />
      </AnimatedBackground>
      
      {/* Gradient Overlay */}
      <div className="hero-overlay"></div>
      
      {/* Content Container */}
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl"
          >
            {/* Movie Info */}
            <div className="flex flex-col space-y-5">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{currentMovie.title}</h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <span>{currentMovie.year}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                <span>{currentMovie.duration}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span>{currentMovie.rating}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {currentMovie.genres.map((genre) => (
                  <span key={genre} className="genre-pill">
                    {genre}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-300 max-w-2xl line-clamp-3 md:line-clamp-4">
                {currentMovie.description}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-2">
                <Link href={`/watch/${currentMovie.id}`} className="btn-play">
                  <Play className="w-5 h-5" />
                  Regarder
                </Link>
                <Link href={`/movies/${currentMovie.id}`} className="btn-secondary">
                  <Info className="w-5 h-5" />
                  Plus d'infos
                </Link>
                <button className="btn-secondary">
                  <Plus className="w-5 h-5" />
                  Ma liste
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-12 h-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-primary w-16" : "bg-gray-600"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}