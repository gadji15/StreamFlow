"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Share2, Heart, Calendar, Star, ChevronLeft, ChevronDown, Plus } from "lucide-react";

// Types
type Episode = {
  id: number;
  title: string;
  duration: string;
  thumbnail?: string;
  description: string;
};

type Season = {
  id: number;
  number: number;
  episodes: Episode[];
};

type Actor = {
  name: string;
  role: string;
  imageUrl?: string;
};

type Series = {
  id: number;
  title: string;
  startYear: number;
  endYear?: number;
  status: "En cours" | "Terminée" | "En pause";
  rating: number;
  genres: string[];
  creator: string;
  actors: Actor[];
  description: string;
  longDescription: string;
  trailerUrl?: string;
  posterUrl?: string;
  backdropUrl?: string;
  isVIP?: boolean;
  seasons: Season[];
};

// Données simulées
const fakeSeries: Series = {
  id: 1,
  title: "Chroniques du Futur",
  startYear: 2021,
  status: "En cours",
  rating: 4.7,
  genres: ["Science-Fiction", "Drame", "Action"],
  creator: "Marie Créatrice",
  actors: [
    { name: "Acteur Principal", role: "Personnage Principal" },
    { name: "Actrice Secondaire", role: "Personnage Secondaire" },
    { name: "Acteur de Soutien", role: "Personnage Tertiaire" },
    { name: "Actrice Invitée", role: "Rôle Spécial" }
  ],
  description: "Dans un futur où l'humanité est confrontée à ses plus grands défis, un groupe de visionnaires tente de redéfinir notre destin.",
  longDescription: "Au XXIIe siècle, la Terre fait face à des changements climatiques catastrophiques et à des tensions géopolitiques extrêmes. Dans ce contexte troublé, une équipe internationale de scientifiques, de diplomates et d'explorateurs se forme pour trouver des solutions aux problèmes qui menacent l'existence même de l'humanité.\n\nLa série suit leurs efforts pour développer des technologies révolutionnaires, naviguer dans des paysages politiques complexes et, finalement, forger un nouveau chemin pour une civilisation au bord du gouffre. Chaque épisode explore des thèmes contemporains à travers le prisme d'un avenir spéculatif, offrant à la fois un avertissement et un espoir pour notre propre trajectoire.",
  posterUrl: "/placeholder-poster.jpg",
  backdropUrl: "/placeholder-backdrop.jpg",
  trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  isVIP: false,
  seasons: [
    {
      id: 101,
      number: 1,
      episodes: [
        { id: 1001, title: "Nouveaux Horizons", duration: "52min", description: "L'équipe se forme alors que la crise mondiale s'intensifie." },
        { id: 1002, title: "Points de Rupture", duration: "48min", description: "Des découvertes scientifiques révolutionnaires ouvrent de nouvelles possibilités." },
        { id: 1003, title: "Alliances Fragiles", duration: "55min", description: "Des tensions politiques menacent le projet naissant." },
        { id: 1004, title: "Innovations", duration: "51min", description: "Une percée technologique change la donne pour l'équipe." },
        { id: 1005, title: "Confrontations", duration: "54min", description: "L'opposition au projet devient violente." },
        { id: 1006, title: "Premier Pas", duration: "58min", description: "L'équipe présente son plan au monde." }
      ]
    },
    {
      id: 102,
      number: 2,
      episodes: [
        { id: 2001, title: "Nouveaux Défis", duration: "54min", description: "Un an plus tard, l'équipe fait face à de nouveaux obstacles." },
        { id: 2002, title: "Résistances", duration: "52min", description: "Des forces s'opposent au projet mondial." },
        { id: 2003, title: "Révélations", duration: "56min", description: "Des secrets du passé refont surface." },
        { id: 2004, title: "Connexions", duration: "53min", description: "Des alliances inattendues se forment." },
        { id: 2005, title: "Point de Non-Retour", duration: "55min", description: "Une décision cruciale doit être prise." },
        { id: 2006, title: "Nouveau Monde", duration: "62min", description: "La saison se termine par un événement qui change tout." }
      ]
    }
  ]
};

// Séries similaires simulées
const similarSeries = [
  { id: 2, title: "Odyssée Cosmique", posterUrl: "/placeholder-poster.jpg" },
  { id: 3, title: "Dimensions Parallèles", posterUrl: "/placeholder-poster.jpg" },
  { id: 4, title: "Héritages", posterUrl: "/placeholder-poster.jpg" },
  { id: 5, title: "Évolutions", posterUrl: "/placeholder-poster.jpg" }
];

export default function SeriesDetailPage() {
  const params = useParams();
  const seriesId = params.id as string;
  
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSeasons, setExpandedSeasons] = useState<Record<number, boolean>>({});
  
  useEffect(() => {
    // Simuler le chargement des données
    const loadSeries = async () => {
      setIsLoading(true);
      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSeries(fakeSeries);
        
        // Initialiser l'état d'expansion des saisons (première saison ouverte par défaut)
        const initialExpanded: Record<number, boolean> = {};
        fakeSeries.seasons.forEach((season, index) => {
          initialExpanded[season.id] = index === 0;
        });
        setExpandedSeasons(initialExpanded);
      } catch (error) {
        console.error("Erreur lors du chargement de la série:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSeries();
  }, [seriesId]);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const toggleSeason = (seasonId: number) => {
    setExpandedSeasons(prev => ({
      ...prev,
      [seasonId]: !prev[seasonId]
    }));
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!series) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Série non trouvée</h1>
        <p className="text-gray-400 mb-6">
          Désolé, nous n'avons pas pu trouver la série que vous recherchez.
        </p>
        <Link href="/series">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour aux séries
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      {/* Bannière de la série */}
      <div className="relative h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${series.backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-end md:items-end gap-6">
            <div className="w-48 h-64 rounded-lg overflow-hidden shadow-lg bg-gray-800 hidden md:block">
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-gray-500 text-lg">Poster</div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {series.genres.map((genre, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-700">
                    {genre}
                  </Badge>
                ))}
                
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  {series.status}
                </Badge>
                
                {series.isVIP && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
                    VIP
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-2">{series.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{series.rating}/5</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {series.startYear}
                    {series.endYear ? ` - ${series.endYear}` : ""}
                  </span>
                </div>
                <div className="flex items-center">
                  <span>{series.seasons.length} saisons</span>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 max-w-3xl">
                {series.description}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button className="flex items-center">
                  <Play className="mr-2 h-4 w-4" />
                  Regarder
                </Button>
                
                <Button
                  variant={isFavorite ? "secondary" : "outline"}
                  onClick={toggleFavorite}
                  className="flex items-center"
                >
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "Ajouté" : "Ajouter aux favoris"}
                </Button>
                
                <Button variant="outline" className="flex items-center">
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu détaillé */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4">
            <TabsTrigger value="episodes">Épisodes</TabsTrigger>
            <TabsTrigger value="overview">Synopsis</TabsTrigger>
            <TabsTrigger value="related">Similaires</TabsTrigger>
            <TabsTrigger value="comments">Commentaires</TabsTrigger>
          </TabsList>
          
          <TabsContent value="episodes" className="space-y-8">
            <div className="space-y-6">
              {series.seasons.map((season) => (
                <div key={season.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => toggleSeason(season.id)}
                  >
                    <h3 className="text-lg font-medium">Saison {season.number}</h3>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        expandedSeasons[season.id] ? "transform rotate-180" : ""
                      }`}
                    />
                  </div>
                  
                  {expandedSeasons[season.id] && (
                    <div className="p-4 pt-0 border-t border-gray-700">
                      <div className="space-y-3">
                        {season.episodes.map((episode, index) => (
                          <div
                            key={episode.id}
                            className="flex flex-col md:flex-row md:items-center gap-4 p-3 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <div className="md:w-2/3 flex items-center">
                              <div className="mr-4 font-bold text-gray-400">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{episode.title}</h4>
                                <p className="text-sm text-gray-400">
                                  {episode.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">
                                {episode.duration}
                              </span>
                              <Button size="sm" variant="ghost" className="ml-4">
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-4 bg-gray-800 rounded-lg border border-dashed border-gray-700 p-4 text-center">
                <p className="text-gray-400 mb-2">De nouveaux épisodes arrivent bientôt</p>
                <Button variant="outline" className="flex items-center mx-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Être notifié
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Synopsis</h2>
                  <p className="text-gray-300 whitespace-pre-line">
                    {series.longDescription}
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Trailer</h2>
                  <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                    <Play className="h-12 w-12 text-gray-500" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Détails</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-gray-400 text-sm">Créateur</h3>
                      <p>{series.creator}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm">Genres</h3>
                      <p>{series.genres.join(", ")}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm">Première diffusion</h3>
                      <p>{series.startYear}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm">Statut</h3>
                      <p>{series.status}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Casting</h2>
                  <div className="space-y-4">
                    {series.actors.map((actor, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium">{actor.name}</p>
                          <p className="text-sm text-gray-400">{actor.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="related">
            <h2 className="text-xl font-semibold mb-6">Séries similaires</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {similarSeries.map((series) => (
                <Link key={series.id} href={`/series/${series.id}`}>
                  <div className="bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105">
                    <div className="aspect-[2/3] bg-gray-700 flex items-center justify-center">
                      <div className="text-gray-500">Poster</div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium truncate">{series.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="comments">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold mb-6">Commentaires & Avis</h2>
              
              <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h3 className="font-medium mb-4">Ajouter un commentaire</h3>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 mb-4"
                  rows={4}
                  placeholder="Partagez votre avis sur cette série..."
                ></textarea>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="mr-2">Note :</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-5 w-5 text-gray-400 cursor-pointer hover:text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <Button>Publier</Button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">Utilisateur 1</p>
                        <p className="text-xs text-gray-400">Il y a 2 jours</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < 5 ? "text-yellow-400" : "text-gray-400"}`}
                          fill={i < 5 ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300">
                    Une série exceptionnelle ! L'intrigue est passionnante et les personnages sont très bien développés. J'ai particulièrement apprécié la deuxième saison qui apporte beaucoup de profondeur à l'histoire.
                  </p>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">Utilisateur 2</p>
                        <p className="text-xs text-gray-400">Il y a 1 semaine</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < 4 ? "text-yellow-400" : "text-gray-400"}`}
                          fill={i < 4 ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300">
                    Une série qui démarre très fort avec une première saison captivante. La deuxième saison est un peu moins rythmée mais reste intéressante. Les acteurs sont excellents et les effets spéciaux très bien réalisés.
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Button variant="outline">Voir plus de commentaires</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}