"use client"

import { useState, useEffect } from "react"
import AdminHeader from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  CreditCard, 
  Film, 
  Tv, 
  Eye, 
  Star, 
  TrendingUp 
} from "lucide-react"
import firebase from "@/lib/admin/firebase"
import Image from "next/image"

// Composant pour les cartes de statistiques
function StatCard({ title, value, icon, description, className }: { 
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  className?: string
}) {
  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-gray-300 text-md font-medium">{title}</CardTitle>
        <div className="bg-gray-800 rounded-full p-2 text-purple-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await firebase.getStatistics()
        setStats(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])
  
  let content = null;

  if (loading) {
    content = (
      <>
        <AdminHeader title="Statistiques" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-gray-400">Chargement des statistiques...</div>
        </main>
      </>
    );
  } else if (!stats) {
    content = (
      <>
        <AdminHeader title="Statistiques" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-gray-400">Impossible de charger les statistiques</div>
        </main>
      </>
    );
  } else {
    content = (
      <>
        <AdminHeader title="Statistiques et Analyses" />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Utilisateurs */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Utilisateurs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Total utilisateurs" 
                  value={stats.users.total.toLocaleString()} 
                  icon={<Users className="h-5 w-5" />}
                  description="Nombre total d'utilisateurs inscrits"
                />
                <StatCard 
                  title="Utilisateurs actifs" 
                  value={stats.users.active.toLocaleString()} 
                  icon={<UserCheck className="h-5 w-5" />}
                  description={`${Math.round((stats.users.active / stats.users.total) * 100)}% du total des utilisateurs`}
                />
                <StatCard 
                  title="Abonnés VIP" 
                  value={stats.users.vip.toLocaleString()} 
                  icon={<CreditCard className="h-5 w-5" />}
                  description={`${Math.round((stats.users.vip / stats.users.total) * 100)}% du total des utilisateurs`}
                />
              </div>
            </div>
            
            {/* Contenu */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Contenu</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                  title="Films" 
                  value={stats.content.totalMovies} 
                  icon={<Film className="h-5 w-5" />}
                  description={`${stats.content.publishedMovies} films publiés`}
                />
                <StatCard 
                  title="Séries" 
                  value={stats.content.totalSeries} 
                  icon={<Tv className="h-5 w-5" />}
                  description={`${stats.content.publishedSeries} séries publiées`}
                />
                <StatCard 
                  title="Vues totales (films)" 
                  value={stats.views.totalMovieViews.toLocaleString()} 
                  icon={<Eye className="h-5 w-5" />}
                  description={`${Math.round(stats.views.totalMovieViews / stats.content.totalMovies).toLocaleString()} vues par film en moyenne`}
                />
                <StatCard 
                  title="Vues totales (séries)" 
                  value={stats.views.totalSeriesViews.toLocaleString()} 
                  icon={<Eye className="h-5 w-5" />}
                  description={`${Math.round(stats.views.totalSeriesViews / stats.content.totalSeries).toLocaleString()} vues par série en moyenne`}
                />
              </div>
            </div>
            
            {/* Contenu populaire */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Films populaires */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">Films les plus populaires</CardTitle>
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.popular.movies.map((movie: any, index: number) => (
                      <div key={movie.id} className="flex items-center">
                        <div className="text-gray-500 font-bold text-lg w-6">{index + 1}</div>
                        <div className="relative h-12 w-8 mx-3">
                          <Image
                            src={movie.poster || "/placeholder.svg"}
                            alt={movie.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{movie.title}</h3>
                          <div className="flex items-center text-sm text-gray-400">
                            <span>{movie.year}</span>
                            <span className="mx-1">•</span>
                            <span className="flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                              {movie.rating}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{movie.views.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">vues</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Séries populaires */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">Séries les plus populaires</CardTitle>
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.popular.series.map((series: any, index: number) => (
                      <div key={series.id} className="flex items-center">
                        <div className="text-gray-500 font-bold text-lg w-6">{index + 1}</div>
                        <div className="relative h-12 w-8 mx-3">
                          <Image
                            src={series.poster || "/placeholder.svg"}
                            alt={series.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{series.title}</h3>
                          <div className="flex items-center text-sm text-gray-400">
                            <span>{series.year}</span>
                            <span className="mx-1">•</span>
                            <span className="flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                              {series.rating}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{series.views.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">vues</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Section graphiques (placeholder) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Évolution des vues (30 derniers jours)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[16/9] bg-gray-800 rounded-md flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-gray-600" />
                  <span className="ml-2 text-gray-400">Graphique de visualisation</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Répartition des genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[16/9] bg-gray-800 rounded-md flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-gray-600" />
                  <span className="ml-2 text-gray-400">Graphique de visualisation</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return content;
}