"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarDays, Film, Tv } from "lucide-react";

// Données simulées
const newMovies = [
  { id: 1, title: "Le Dernier Samurai", type: "film", date: "15 mai 2023", imageUrl: "/placeholder-movie.jpg" },
  { id: 2, title: "Étoiles Fugaces", type: "film", date: "12 mai 2023", imageUrl: "/placeholder-movie.jpg" },
  { id: 3, title: "Horizons Perdus", type: "film", date: "8 mai 2023", imageUrl: "/placeholder-movie.jpg" },
  { id: 4, title: "Les Portes du Destin", type: "film", date: "5 mai 2023", imageUrl: "/placeholder-movie.jpg" },
  { id: 5, title: "Souvenirs d'Automne", type: "film", date: "1 mai 2023", imageUrl: "/placeholder-movie.jpg" },
  { id: 6, title: "Légendes Urbaines", type: "film", date: "28 avril 2023", imageUrl: "/placeholder-movie.jpg" }
];

const newSeries = [
  { id: 101, title: "Chroniques du Futur", type: "série", date: "18 mai 2023", imageUrl: "/placeholder-series.jpg" },
  { id: 102, title: "Enquêtes Impossibles", type: "série", date: "14 mai 2023", imageUrl: "/placeholder-series.jpg" },
  { id: 103, title: "Destins Croisés", type: "série", date: "10 mai 2023", imageUrl: "/placeholder-series.jpg" },
  { id: 104, title: "Les Secrets de l'Univers", type: "série", date: "7 mai 2023", imageUrl: "/placeholder-series.jpg" },
  { id: 105, title: "Échos du Passé", type: "série", date: "3 mai 2023", imageUrl: "/placeholder-series.jpg" }
];

const futureReleases = [
  { id: 201, title: "Aube Nouvelle", type: "film", date: "1 juin 2023", imageUrl: "/placeholder-movie.jpg" },
  { id: 202, title: "Guerriers Éternels", type: "film", date: "15 juin 2023", imageUrl: "/placeholder-movie.jpg" },
  { id: 203, title: "Détectives du Paranormal", type: "série", date: "10 juin 2023", imageUrl: "/placeholder-series.jpg" },
  { id: 204, title: "La Route des Étoiles", type: "film", date: "22 juin 2023", imageUrl: "/placeholder-movie.jpg" }
];

const ContentCard = ({ item }: { item: any }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="bg-gray-800 rounded-lg overflow-hidden"
    >
      <div className="aspect-[2/3] relative bg-gray-700">
        <div className="absolute inset-0 flex items-center justify-center">
          {item.type === "film" ? (
            <Film className="w-12 h-12 text-gray-500" />
          ) : (
            <Tv className="w-12 h-12 text-gray-500" />
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-white">{item.title}</h3>
        <div className="mt-2 flex items-center text-gray-400 text-sm">
          <CalendarDays className="w-4 h-4 mr-1" />
          {item.date}
        </div>
      </div>
    </motion.div>
  );
};

export default function NouveautesPage() {
  const [activeTab, setActiveTab] = useState("recently-added");
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text mb-8">
        Nouveautés
      </h1>
      
      <Tabs
        defaultValue="recently-added"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="recently-added">Ajouts récents</TabsTrigger>
          <TabsTrigger value="films">Films</TabsTrigger>
          <TabsTrigger value="series">Séries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recently-added">
          <div className="space-y-8">
            <h2 className="text-xl font-semibold">Derniers ajouts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...newMovies, ...newSeries]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 12)
                .map((item) => (
                  <Link key={item.id} href={`/${item.type === "film" ? "films" : "series"}/${item.id}`}>
                    <ContentCard item={item} />
                  </Link>
                ))
              }
            </div>
            
            <h2 className="text-xl font-semibold pt-4">À venir prochainement</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {futureReleases.map((item) => (
                <div key={item.id} className="relative">
                  <ContentCard item={item} />
                  <div className="absolute top-2 right-2 bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
                    Bientôt
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center pt-4">
              <Button variant="outline">
                Voir plus de nouveautés
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="films">
          <div className="space-y-8">
            <h2 className="text-xl font-semibold">Nouveaux films</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {newMovies.map((movie) => (
                <Link key={movie.id} href={`/films/${movie.id}`}>
                  <ContentCard item={movie} />
                </Link>
              ))}
            </div>
            
            <h2 className="text-xl font-semibold pt-4">Films à venir</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {futureReleases
                .filter((item) => item.type === "film")
                .map((movie) => (
                  <div key={movie.id} className="relative">
                    <ContentCard item={movie} />
                    <div className="absolute top-2 right-2 bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
                      Bientôt
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="series">
          <div className="space-y-8">
            <h2 className="text-xl font-semibold">Nouvelles séries</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {newSeries.map((serie) => (
                <Link key={serie.id} href={`/series/${serie.id}`}>
                  <ContentCard item={serie} />
                </Link>
              ))}
            </div>
            
            <h2 className="text-xl font-semibold pt-4">Séries à venir</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {futureReleases
                .filter((item) => item.type === "série")
                .map((serie) => (
                  <div key={serie.id} className="relative">
                    <ContentCard item={serie} />
                    <div className="absolute top-2 right-2 bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
                      Bientôt
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}