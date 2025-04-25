"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Star, CheckCircle, Crown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"

const vipFeatures = [
  {
    icon: <Crown className="h-5 w-5 text-amber-400" />,
    title: "Contenu exclusif VIP",
    description: "Accès à des films et séries en avant-première et des contenus exclusifs"
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    title: "Sans publicité",
    description: "Profitez d'une expérience de visionnage sans interruption publicitaire"
  },
  {
    icon: <Star className="h-5 w-5 text-amber-400" />,
    title: "Qualité premium",
    description: "Streaming en 4K UHD avec son surround quand disponible"
  }
];

const vipContent = [
  {
    id: "top-secret-movie",
    title: "The Secret Agent",
    year: 2023,
    rating: 4.9,
    genres: ["Action", "Espionnage", "Thriller"],
    poster: "/placeholder-movie.jpg",
    type: "film"
  },
  {
    id: "exclusive-series",
    title: "Chroniques du Futur",
    year: 2023,
    rating: 4.8,
    genres: ["Science-Fiction", "Drame"],
    poster: "/placeholder-movie.jpg",
    type: "série"
  },
  {
    id: "premium-content",
    title: "Empire des Ombres",
    year: 2023,
    rating: 4.7,
    genres: ["Fantaisie", "Aventure"],
    poster: "/placeholder-movie.jpg",
    type: "série"
  },
  {
    id: "vip-movie",
    title: "Révolution Quantique",
    year: 2023,
    rating: 4.9,
    genres: ["Science-Fiction", "Action"],
    poster: "/placeholder-movie.jpg",
    type: "film"
  }
];

export default function ExclusifPage() {
  const [isVipUser, setIsVipUser] = useState(true);
  
  return (
    <div className="min-h-screen">
      {/* Section principale avec dégradé */}
      <div className="bg-gradient-to-b from-amber-900 to-black pt-24 pb-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-amber-400/20 text-amber-400 border-amber-400/20 px-3 py-1">
            Exclusivité
          </Badge>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Zone <span className="bg-gradient-to-r from-amber-400 to-yellow-600 text-transparent bg-clip-text">VIP</span>
          </h1>
          
          {isVipUser ? (
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Bienvenue dans l'espace exclusif réservé à nos membres VIP. Profitez d'un contenu premium, des dernières sorties et des exclusivités StreamFlow.
            </p>
          ) : (
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Devenez membre VIP pour accéder à un monde de divertissement premium, comprenant des exclusivités, des avant-premières et bien plus encore.
            </p>
          )}
          
          {!isVipUser && (
            <Button className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-500 hover:to-yellow-700 font-medium">
              Obtenir l'accès VIP
            </Button>
          )}
        </div>
      </div>
      
      {/* Section avantages */}
      <div className="bg-black py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-white text-center mb-12">
            Avantages <span className="bg-gradient-to-r from-amber-400 to-yellow-600 text-transparent bg-clip-text">VIP</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vipFeatures.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 border border-amber-900/20 rounded-lg p-6"
              >
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="ml-3 text-lg font-medium text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {isVipUser ? (
        /* Contenu VIP si l'utilisateur est membre */
        <div className="bg-background py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-white">Exclusivités VIP</h2>
              <Link href="/exclusif/tous" className="text-amber-400 flex items-center text-sm hover:text-amber-300">
                Voir tout <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {vipContent.map((content) => (
                <Link 
                  href={content.type === "film" ? `/films/${content.id}` : `/series/${content.id}`} 
                  key={content.id}
                >
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
                      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-600">
                        <span className="text-xs">Poster</span>
                      </div>
                      
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/80 flex items-end p-3">
                        <div className="w-full">
                          <span className="text-xs bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full font-bold">
                            VIP
                          </span>
                          <h3 className="font-medium text-white text-sm mt-1 truncate">{content.title}</h3>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                            <span>{content.year}</span>
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span>{content.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Message d'accès restreint si non VIP */
        <div className="bg-background py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="border border-amber-900/20 rounded-lg p-10 bg-gray-900/30 max-w-2xl mx-auto">
              <Crown className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-4">
                Contenu exclusif réservé aux membres VIP
              </h2>
              <p className="text-gray-400 mb-6">
                Devenez membre VIP pour accéder à notre bibliothèque exclusive de films et séries en avant-première et de contenus exclusifs.
              </p>
              <Button className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-500 hover:to-yellow-700">
                Découvrir les offres VIP
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}