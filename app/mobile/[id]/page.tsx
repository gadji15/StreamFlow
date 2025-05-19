"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { VideoPlayer } from "@/components/video-player";
import { CommentsSection } from "@/components/comments-section";
import { ContentSection } from "@/components/content-section";
import { VipBadge } from "@/components/vip-badge";
import { 
  Play, 
  Plus, 
  Share2, 
  Star, 
  Clock, 
  Calendar, 
  Film, 
  Heart,
  HeartOff,
  ThumbsUp,
  Info,
  Users
} from "lucide-react";

// Mock data for a movie
const movieData = {
  id: "1",
  title: "Captain America: Brave New World",
  tagline: "Un nouveau monde. Un nouveau héros.",
  description: "Après les événements de Falcon et le Soldat de l'Hiver, Sam Wilson prend officiellement le manteau de Captain America et doit faire face à de nouveaux défis dans un monde en constante évolution. Lorsqu'une menace internationale émerge, Sam s'allie avec des nouveaux et anciens amis pour affronter un adversaire dont les actions pourraient changer le monde à jamais.",
  posterImage: "/images/captain-america-poster.jpg",
  backdropImage: "/images/captain-america-bg.jpg",
  trailerUrl: "/videos/trailer.mp4",
  fullMovieUrl: "/videos/movie.mp4",
  releaseDate: "2024-07-26",
  duration: "2h 24min",
  rating: 4.5,
  criticsRating: 85,
  audienceRating: 92,
  genres: ["Action", "Aventure", "Science-Fiction"],
  directors: ["Julius Onah"],
  writers: ["Malcolm Spellman", "Dalan Musson"],
  cast: [
    { name: "Anthony Mackie", character: "Sam Wilson / Captain America", photo: "/cast/anthony-mackie.jpg" },
    { name: "Harrison Ford", character: "Thaddeus Ross", photo: "/cast/harrison-ford.jpg" },
    { name: "Liv Tyler", character: "Betty Ross", photo: "/cast/liv-tyler.jpg" },
    { name: "Tim Blake Nelson", character: "Samuel Sterns / The Leader", photo: "/cast/tim-nelson.jpg" },
    { name: "Danny Ramirez", character: "Joaquin Torres", photo: "/cast/danny-ramirez.jpg" },
    { name: "Carl Lumbly", character: "Isaiah Bradley", photo: "/cast/carl-lumbly.jpg" }
  ],
  vipOnly: false,
  isNew: true,
  isTop: true
};

// Mock data for similar movies
const similarMovies = [
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
    title: "Kraven the Hunter",
    posterImage: "/images/kraven-poster.jpg",
    type: "movie",
    rating: 4.0,
    year: 2024
  },
  {
    id: "4",
    title: "Black Panther: Wakanda Forever",
    posterImage: "/images/wakanda-forever-poster.jpg",
    type: "movie",
    rating: 4.4,
    year: 2022
  },
  {
    id: "5",
    title: "The Marvels",
    posterImage: "/images/marvels-poster.jpg",
    type: "movie",
    rating: 3.8,
    year: 2023
  },
  {
    id: "6",
    title: "Avengers: Endgame",
    posterImage: "/images/endgame-poster.jpg",
    type: "movie",
    rating: 4.9,
    year: 2019
  },
  {
    id: "7",
    title: "The Falcon and the Winter Soldier",
    posterImage: "/images/falcon-winter-poster.jpg",
    type: "series",
    rating: 4.3,
    year: 2021
  }
];

export default function MovieDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [isMoviePlaying, setIsMoviePlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "related" | "comments">("overview");
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Simulate checking if movie is in favorites
    const checkFavorite = async () => {
      // This would be replaced by your actual favorites check
      setTimeout(() => {
        setIsFavorite(false);
      }, 500);
    };
    
    checkFavorite();
  }, [id]);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would also update the user's favorites in your database
  };
  
  const shareMovie = () => {
    if (navigator.share) {
      navigator.share({
        title: movieData.title,
        text: movieData.tagline,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Lien copié dans le presse-papier !");
      });
    }
  };
  
  return (
    <main>
      {/* Movie Player (if active) */}
      {isMoviePlaying && (
        <div className="fixed inset-0 z-50 bg-black">
          <VideoPlayer
            src={movieData.fullMovieUrl}
            title={movieData.title}
            onClose={() => setIsMoviePlaying(false)}
            autoPlay={true}
            nextEpisode={null}
          />
        </div>
      )}
      
      {/* Hero Section with Backdrop */}
      <section className="relative">
        {/* Backdrop Image */}
        <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <Image
            src={movieData.backdropImage}
            alt={movieData.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        </div>
        
        {/* Movie Info Container */}
        <div className="container mx-auto px-4">
          <div className="relative z-10 -mt-80 pb-12 flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 w-64 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                <Image
                  src={movieData.posterImage}
                  alt={movieData.title}
                  fill
                  className="object-cover"
                />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {movieData.vipOnly && <VipBadge />}
                  {movieData.isNew && <span className="badge-new">NOUVEAU</span>}
                  {movieData.isTop && <span className="badge-top">TOP</span>}
                </div>
              </div>
              
              {/* Action Buttons for Mobile */}
              <div className="flex gap-2 mt-4 md:hidden">
                <button
                  onClick={() => setIsMoviePlaying(true)}
                  className="btn-primary flex-1"
                >
                  <Play className="w-5 h-5" />
                  Regarder
                </button>
                <button
                  onClick={() => setIsTrailerPlaying(true)}
                  className="btn-secondary"
                >
                  <Film className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFavorite}
                  className="btn-secondary"
                >
                  {isFavorite ? (
                    <HeartOff className="w-5 h-5" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={shareMovie}
                  className="btn-secondary"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Movie Info */}
            <div className="flex-1 mt-6 md:mt-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-5xl font-bold mb-2">{movieData.title}</h1>
                {movieData.tagline && (
                  <p className="text-xl text-gray-300 italic mb-4">{movieData.tagline}</p>
                )}
                
                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300 mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{movieData.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-1" />
                    <span>{movieData.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                    <span>{new Date(movieData.releaseDate).getFullYear()}</span>
                  </div>
                </div>
                
                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {movieData.genres.map((genre) => (
                    <Link 
                      key={genre} 
                      href={`/movies?genre=${genre.toLowerCase()}`}
                      className="genre-pill"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
                
                {/* Ratings */}
                <div className="flex gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mb-1 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-primary" style={{ 
                        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${100 - movieData.criticsRating}%)`
                      }}></div>
                      <span className="text-lg font-bold">{movieData.criticsRating}%</span>
                    </div>
                    <span className="text-xs text-gray-400">Critiques</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mb-1 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-secondary" style={{ 
                        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${100 - movieData.audienceRating}%)`
                      }}></div>
                      <span className="text-lg font-bold">{movieData.audienceRating}%</span>
                    </div>
                    <span className="text-xs text-gray-400">Audience</span>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-gray-300 mb-6 max-w-3xl">
                  {movieData.description}
                </p>
                
                {/* Creators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6 max-w-3xl">
                  <div>
                    <span className="text-sm text-gray-400">Réalisé par</span>
                    <p>{movieData.directors.join(", ")}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Écrit par</span>
                    <p>{movieData.writers.join(", ")}</p>
                  </div>
                </div>
                
                {/* Action Buttons for Desktop */}
                <div className="hidden md:flex gap-3 mt-8">
                  <button
                    onClick={() => setIsMoviePlaying(true)}
                    className="btn-primary"
                  >
                    <Play className="w-5 h-5" />
                    Regarder maintenant
                  </button>
                  <button
                    onClick={() => setIsTrailerPlaying(true)}
                    className="btn-secondary"
                  >
                    <Film className="w-5 h-5" />
                    Bande annonce
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className="btn-secondary"
                  >
                    {isFavorite ? (
                      <>
                        <HeartOff className="w-5 h-5" />
                        Retirer des favoris
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        Ajouter aux favoris
                      </>
                    )}
                  </button>
                  <button
                    onClick={shareMovie}
                    className="btn-secondary"
                  >
                    <Share2 className="w-5 h-5" />
                    Partager
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Tabs Navigation */}
      <section className="border-b border-gray-800 sticky top-16 z-20 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "overview" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab("related")}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "related" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <ThumbsUp className="w-4 h-4 inline mr-2" />
              Similaires
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "comments" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Commentaires
            </button>
          </div>
        </div>
      </section>
      
      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Trailer Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Bande annonce</h2>
              <div className="relative aspect-video rounded-lg overflow-hidden">
                {isTrailerPlaying ? (
                  <VideoPlayer
                    src={movieData.trailerUrl}
                    onClose={() => setIsTrailerPlaying(false)}
                    autoPlay={true}
                  />
                ) : (
                  <>
                    <Image
                      src={movieData.backdropImage}
                      alt={`${movieData.title} trailer`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <button
                        onClick={() => setIsTrailerPlaying(true)}
                        className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
                      >
                        <Play className="w-10 h-10 text-white" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Cast Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Distribution</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movieData.cast.map((person) => (
                  <div key={person.name} className="text-center">
                    <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={person.photo || "/placeholder-avatar.jpg"}
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-sm">{person.name}</h3>
                    <p className="text-xs text-gray-400">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Related Tab */}
        {activeTab === "related" && (
          <div>
            <ContentSection
              title="Films similaires"
              subtitle="Vous aimerez aussi ces films"
              items={similarMovies}
              layout="large"
            />
          </div>
        )}
        
        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div>
            <CommentsSection contentId={id as string} contentType="movie" />
          </div>
        )}
      </div>
    </main>
  );
}