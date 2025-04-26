"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";

const featuredMovies = [
  {
    id: 1,
    title: "Inception",
    imageUrl: "https://example.com/images/inception.jpg",
    year: 2010,
    duration: "2h 28min",
    rating: 4.8,
    genres: ["Action", "Science","Fiction"],
    description: "Un voleur utilisant une technologie expérimentale pour entrer dans les rêves des gens se voit offrir une chance de retrouver sa vie normale en acceptant une mission impossible."
  },
  {
    id: 2,
    title: "The Pursuit of Happyness",
    imageUrl: "https://example.com/images/happiness.jpg",
    year: 2006,
    duration: "1h 57min",
    rating: 4.9,
    genres: ["Drame", "Inspirant"],
    description: "Un homme sans ressources mais déterminé se bat contre l'adversité pour offrir une vie meilleure à son fils, malgré les nombreux défis auxquels ils font face."
  },
  {
    id: 3,
    title: "Le Fabuleux Destin d'Amélie Poulain",
    imageUrl: "https://example.com/images/amelie.jpg",
    year: 2001,
    duration: "2h 2min",
    rating: 4.5,
    genres: ["Comédie", "Romance"],
    description: "À Montmartre, une serveuse timide et imaginative décide d'améliorer la vie des gens qui l'entourent tout en cherchant secrètement le grand amour."
  },
  {
    id: 4,
    title: "La La Land",
    imageUrl: "https://example.com/images/lalaland.jpg",
    year: 2016,
    duration: "2h 8min",
    rating: 4.6,
    genres: ["Musical", "Romance"],
    description: "Dans un monde de rêves, un pianiste de jazz et une actrice en herbe se lient d'amour tout en poursuivant leurs aspirations artistiques respectives à Los Angeles."
  },
  // Add more featured movies as needed
];

export default function HeroSection() {
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);

  const handlePreviousClick = () => {
    setCurrentMovieIndex((prevIndex) =>
      prevIndex === 0 ? featuredMovies.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentMovieIndex((prevIndex) =>
      prevIndex === featuredMovies.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentMovie = featuredMovies[currentMovieIndex];

  return (
    <section className="relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-gray-900 opacity-60"
        style={{ backgroundImage: `url(${currentMovie.imageUrl})` }}
      ></div>
      <div className="relative max-w-6xl mx-auto px-4 py-16 space-y-8">
        <AnimatePresence exitBeforeEnter>
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, position: "absolute" }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">{currentMovie.title}</h2>

            <div className="flex space-x-4">
              <Button variant="default" size="lg" rounded="full" className="animate-pulse transition duration-300">
                Watch
                <Play className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" rounded="full">
                <Info className="mr-2 h-5 w-5" />
                More Info
              </Button>
            </div>

            <div className="text-gray-400 space-y-2">
              <p>{currentMovie.description}</p>
              <div className="flex flex-wrap space-x-2 space-y-1 text-sm md:text-base">
                <span>⭐ {currentMovie.rating}/5</span>
                <span>⏰ {currentMovie.duration}</span>
                <span>📅 {currentMovie.year}</span>
                <div className="flex flex-wrap space-x-2 space-y-1">
                  {currentMovie.genres.map((genre, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 text-white/70 rounded-md">{genre}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-y-0 left-0 flex items-center">
          <Button onClick={handlePreviousClick} size="icon" rounded="full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button onClick={handleNextClick} size="icon" rounded="full">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {featuredMovies.map((movie, index) => (
            <div
              key={movie.id}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                index === currentMovieIndex ? 'bg-primary animate-pulse' : 'bg-gray-600'
              }`}
              onClick={() => setCurrentMovieIndex(index)}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}