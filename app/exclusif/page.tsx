"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Shield, Sparkles, Film, Tv, Play } from "lucide-react";

// Simuler l'état VIP de l'utilisateur (à remplacer par la logique d'authentification réelle)
const isUserVIP = false;

// Données simulées pour le contenu exclusif
const exclusiveContent = [
  { 
    id: 1, 
    title: "Le Dernier Royaume", 
    type: "film", 
    rating: 4.8, 
    releaseDate: "Exclusivité 2023",
    imageUrl: "/placeholder-premium.jpg",
    description: "Une aventure épique dans un royaume mystérieux où les forces du bien et du mal s'affrontent."
  },
  { 
    id: 2, 
    title: "Mystères de l'Univers", 
    type: "série", 
    rating: 4.9, 
    releaseDate: "Nouvelle saison en exclusivité",
    imageUrl: "/placeholder-premium.jpg",
    description: "Découvrez les secrets les plus profonds de notre univers dans cette série documentaire exclusive."
  },
  { 
    id: 3, 
    title: "Chrome", 
    type: "film", 
    rating: 4.7, 
    releaseDate: "Avant-première",
    imageUrl: "/placeholder-premium.jpg",
    description: "Dans un futur où la technologie a remplacé l'humanité, un rebelle lutte pour retrouver ce qui a été perdu."
  },
  { 
    id: 4, 
    title: "Dynasties", 
    type: "série", 
    rating: 4.6, 
    releaseDate: "Saison 3 - VIP uniquement",
    imageUrl: "/placeholder-premium.jpg",
    description: "La saga familiale continue dans cette nouvelle saison pleine de rebondissements et de trahisons."
  },
  { 
    id: 5, 
    title: "Les Étoiles Éternelles", 
    type: "film", 
    rating: 4.8, 
    releaseDate: "Exclusivité 2023",
    imageUrl: "/placeholder-premium.jpg",
    description: "Un voyage interstellaire épique à la recherche d'une nouvelle planète habitable pour l'humanité."
  },
  { 
    id: 6, 
    title: "Confessions", 
    type: "série", 
    rating: 4.7, 
    releaseDate: "Tous les épisodes en exclusivité",
    imageUrl: "/placeholder-premium.jpg",
    description: "Une série dramatique intense où chaque épisode dévoile les secrets les plus sombres des protagonistes."
  }
];

// Avantages VIP
const vipBenefits = [
  {
    icon: <Crown className="h-10 w-10 text-yellow-400" />,
    title: "Contenu en Exclusivité",
    description: "Accédez à des films et séries en avant-première et à du contenu exclusif réservé aux membres VIP."
  },
  {
    icon: <Star className="h-10 w-10 text-yellow-400" />,
    title: "Qualité Premium",
    description: "Profitez de la meilleure qualité vidéo (4K, HDR) et audio (Dolby Atmos) disponible."
  },
  {
    icon: <Shield className="h-10 w-10 text-yellow-400" />,
    title: "Sans Publicité",
    description: "Une expérience de visionnage ininterrompue, sans aucune publicité."
  },
  {
    icon: <Sparkles className="h-10 w-10 text-yellow-400" />,
    title: "Support Prioritaire",
    description: "Un accès prioritaire à notre service clientèle pour répondre à toutes vos questions."
  }
];

export default function ExclusifPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {isUserVIP ? (
        <VIPContent />
      ) : (
        <NonVIPContent />
      )}
    </div>
  );
}

function VIPContent() {
  const [filter, setFilter] = useState("all");
  
  const filteredContent = filter === "all" 
    ? exclusiveContent 
    : exclusiveContent.filter(item => item.type === filter);
  
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 text-transparent bg-clip-text">
          Contenu Exclusif VIP
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Bienvenue dans votre espace VIP ! Profitez de tout notre contenu premium, en avant-première et en exclusivité.
        </p>
      </div>
      
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={() => setFilter("all")} 
          variant={filter === "all" ? "default" : "outline"}
        >
          Tout
        </Button>
        <Button 
          onClick={() => setFilter("film")} 
          variant={filter === "film" ? "default" : "outline"}
        >
          <Film className="mr-2 h-4 w-4" />
          Films
        </Button>
        <Button 
          onClick={() => setFilter("série")} 
          variant={filter === "série" ? "default" : "outline"}
        >
          <Tv className="mr-2 h-4 w-4" />
          Séries
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredContent.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-xl border border-gray-700"
          >
            <div className="h-48 bg-gray-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                {item.type === "film" ? (
                  <Film className="h-12 w-12 text-gray-500" />
                ) : (
                  <Tv className="h-12 w-12 text-gray-500" />
                )}
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-amber-600 text-white">
                  VIP
                </Badge>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm">{item.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-400">{item.releaseDate}</p>
              <p className="text-gray-300">{item.description}</p>
              <Button className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Regarder
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function NonVIPContent() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 text-transparent bg-clip-text">
          Contenu Exclusif VIP
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Accédez à du contenu premium, des avant-premières et bien plus encore en devenant membre VIP.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Crown className="h-6 w-6 text-yellow-400 mr-2" />
              Devenez VIP aujourd'hui
            </h2>
            <p className="text-gray-300 mb-6">
              Rejoignez notre programme VIP et profitez d'une expérience de streaming premium avec un accès exclusif à notre catalogue VIP.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <span className="text-green-500 mr-2">✓</span> Contenu exclusif
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-500 mr-2">✓</span> Avant-premières
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-500 mr-2">✓</span> Qualité 4K et HDR
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-500 mr-2">✓</span> Sans publicité
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-500 mr-2">✓</span> Support prioritaire
              </div>
            </div>
            <div className="mt-8">
              <Link href="/abonnement">
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700">
                  S'abonner VIP
                </Button>
              </Link>
              <p className="text-xs text-gray-400 mt-2 text-center">
                À partir de 9,99€/mois. Annulation possible à tout moment.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-center text-gray-200">
                Aperçu du contenu exclusif
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {exclusiveContent.slice(0, 4).map((item, index) => (
                  <div key={index} className="bg-gray-800 rounded p-3">
                    <div className="h-24 bg-gray-700 rounded flex items-center justify-center mb-2">
                      {item.type === "film" ? (
                        <Film className="h-8 w-8 text-gray-600" />
                      ) : (
                        <Tv className="h-8 w-8 text-gray-600" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-300 truncate">{item.title}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-400">{item.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative">
                <div className="absolute inset-0 backdrop-blur-sm bg-gray-900/70 flex items-center justify-center">
                  <Badge variant="secondary" className="bg-amber-600 text-white text-lg px-3 py-1">
                    VIP UNIQUEMENT
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-8">
        <h2 className="text-2xl font-bold text-center mb-8">Avantages VIP</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vipBenefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center"
            >
              <div className="flex justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}