"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  Users,
  Film,
  Tv,
  CreditCard,
  TrendingUp,
  Layers,
  MessageSquare,
  PieChart,
  Clock,
  Activity,
  Star
} from "lucide-react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import LoadingScreen from "@/components/admin/loading-screen"
import firebaseServices from "@/lib/firebase"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Mock data for initial load - will be replaced with actual data from Firebase
        setStats({
          users: {
            total: 125,
            active: 87,
            vip: 36,
            newLast30Days: 24
          },
          content: {
            totalMovies: 89,
            publishedMovies: 72,
            totalSeries: 42,
            publishedSeries: 35,
            totalEpisodes: 428
          },
          comments: {
            total: 836,
            approved: 712,
            pending: 98,
            rejected: 26,
            reported: 12
          },
          popular: {
            movies: [
              {
                id: "1",
                title: "Inception",
                poster: "/placeholder-movie.jpg",
                rating: 4.8,
                views: 12540
              },
              {
                id: "2",
                title: "The Dark Knight",
                poster: "/placeholder-movie.jpg",
                rating: 4.9,
                views: 10320
              },
              {
                id: "3",
                title: "Interstellar",
                poster: "/placeholder-movie.jpg",
                rating: 4.7,
                views: 9845
              },
              {
                id: "4",
                title: "The Godfather",
                poster: "/placeholder-movie.jpg",
                rating: 4.9,
                views: 8760
              },
              {
                id: "5",
                title: "Pulp Fiction",
                poster: "/placeholder-movie.jpg",
                rating: 4.8,
                views: 7890
              }
            ],
            series: [
              {
                id: "1",
                title: "Stranger Things",
                poster: "/placeholder-series.jpg",
                rating: 4.7,
                views: 18750
              },
              {
                id: "2",
                title: "Breaking Bad",
                poster: "/placeholder-series.jpg",
                rating: 4.9,
                views: 16480
              }
            ]
          }
        })
        
        setActivityLogs([
          {
            id: "1",
            adminId: "admin1",
            adminName: "Admin User",
            action: "CREATE",
            entityType: "MOVIE",
            entityId: "movie1",
            entityName: "The Matrix Resurrections",
            timestamp: new Date()
          },
          {
            id: "2",
            adminId: "admin1",
            adminName: "Admin User",
            action: "UPDATE",
            entityType: "SERIES",
            entityId: "series1",
            entityName: "The Witcher",
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            id: "3",
            adminId: "admin2",
            adminName: "Moderator",
            action: "DELETE",
            entityType: "COMMENT",
            entityId: "comment1",
            entityName: "Comment by User123",
            timestamp: new Date(Date.now() - 7200000)
          },
          {
            id: "4",
            adminId: "admin1",
            adminName: "Admin User",
            action: "UPDATE",
            entityType: "USER",
            entityId: "user1",
            entityName: "John Doe",
            timestamp: new Date(Date.now() - 10800000)
          },
          {
            id: "5",
            adminId: "admin3",
            adminName: "Content Manager",
            action: "CREATE",
            entityType: "SERIES",
            entityId: "series2",
            entityName: "House of the Dragon",
            timestamp: new Date(Date.now() - 14400000)
          }
        ])
        
        // In a production app, you would fetch actual data from Firebase
        // const statsData = await firebaseServices.statistics.getDashboardStatistics();
        // setStats(statsData);
        // const logsData = await firebaseServices.activityLogs.getRecentActivity(5);
        // setActivityLogs(logsData);
        
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error)
        setError(error.message || "Une erreur est survenue lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getActivityIcon = (action: string, entityType: string) => {
    if (action === "CREATE") {
      switch (entityType) {
        case "MOVIE":
          return <Film className="h-4 w-4 text-green-400" />
        case "SERIES":
          return <Tv className="h-4 w-4 text-green-400" />
        case "USER":
          return <Users className="h-4 w-4 text-green-400" />
        default:
          return <Layers className="h-4 w-4 text-green-400" />
      }
    } else if (action === "UPDATE") {
      switch (entityType) {
        case "MOVIE":
          return <Film className="h-4 w-4 text-blue-400" />
        case "SERIES":
          return <Tv className="h-4 w-4 text-blue-400" />
        case "USER":
          return <Users className="h-4 w-4 text-blue-400" />
        default:
          return <Layers className="h-4 w-4 text-blue-400" />
      }
    } else {
      switch (entityType) {
        case "MOVIE":
          return <Film className="h-4 w-4 text-red-400" />
        case "SERIES":
          return <Tv className="h-4 w-4 text-red-400" />
        case "USER":
          return <Users className="h-4 w-4 text-red-400" />
        default:
          return <Layers className="h-4 w-4 text-red-400" />
      }
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Tableau de bord" />
        <main className="pt-24 p-6">
          {error ? (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium">Erreur de chargement</h3>
              <p>{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-700 hover:bg-red-600"
              >
                Réessayer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Utilisateurs actifs</CardTitle>
                    <Users className="h-5 w-5 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats?.users?.active?.toLocaleString() || 0}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {`${Math.round(((stats?.users?.active || 0) / (stats?.users?.total || 1)) * 100)}% du total des utilisateurs`}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Abonnés VIP</CardTitle>
                    <CreditCard className="h-5 w-5 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats?.users?.vip?.toLocaleString() || 0}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {`${Math.round(((stats?.users?.vip || 0) / (stats?.users?.total || 1)) * 100)}% du total des utilisateurs`}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Films publiés</CardTitle>
                    <Film className="h-5 w-5 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats?.content?.publishedMovies || 0}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      Sur un total de {stats?.content?.totalMovies || 0} films
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Séries publiées</CardTitle>
                    <Tv className="h-5 w-5 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats?.content?.publishedSeries || 0}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      Sur un total de {stats?.content?.totalSeries || 0} séries
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Films populaires</CardTitle>
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                    </div>
                    <CardDescription className="text-gray-400">
                      Les films les plus visionnés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {stats?.popular?.movies?.slice(0, 5).map((movie: any, index: number) => (
                        <div key={movie.id} className="flex items-center space-x-4">
                          <div className="flex-shrink-0 relative w-8 h-12">
                            <div className="w-full h-full bg-gray-800 rounded">
                              {/* Will use real images when available */}
                              <Film className="h-full w-full p-2 text-gray-600" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                            <div className="flex items-center text-xs text-gray-400">
                              <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" />
                              <span>{movie.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-white">{movie.views.toLocaleString()}</span>
                            <p className="text-xs text-gray-400">vues</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Activité récente</CardTitle>
                      <Activity className="h-5 w-5 text-purple-400" />
                    </div>
                    <CardDescription className="text-gray-400">
                      Les dernières actions sur la plateforme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      {activityLogs.map(log => (
                        <div key={log.id} className="flex items-start">
                          <div className="flex-shrink-0 mr-3 mt-1">
                            <div className={`p-1.5 rounded-full ${
                              log.action === "CREATE" 
                                ? "bg-green-500/20" 
                                : log.action === "UPDATE" 
                                  ? "bg-blue-500/20" 
                                  : "bg-red-500/20"
                            }`}>
                              {getActivityIcon(log.action, log.entityType)}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white">
                              <span className="font-medium">{log.adminName}</span>
                              {" "}
                              <span className="text-gray-400">
                                {log.action === "CREATE" 
                                  ? "a créé" 
                                  : log.action === "UPDATE" 
                                    ? "a modifié" 
                                    : "a supprimé"}
                              </span>
                              {" "}
                              <span className="font-medium">{log.entityName}</span>
                            </p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button variant="outline" asChild className="bg-gray-800 border-gray-700 text-gray-300">
                        <Link href="/admin/activity-logs">
                          Voir toutes les activités
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Commentaires récents</CardTitle>
                      <MessageSquare className="h-5 w-5 text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-purple-900 flex items-center justify-center text-white text-sm font-medium">JD</div>
                          <div>
                            <p className="text-sm font-medium text-white">Jean Dupont</p>
                            <div className="flex text-yellow-400">
                              {[1, 2, 3, 4].map(i => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400" />
                              ))}
                              <Star className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 line-clamp-2">"Un film incroyable avec des effets spéciaux à couper le souffle!"</p>
                        <p className="text-xs text-gray-500 mt-1">Sur Dune • Il y a 2 heures</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-medium">MM</div>
                          <div>
                            <p className="text-sm font-medium text-white">Marie Martin</p>
                            <div className="flex text-yellow-400">
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 line-clamp-2">"J'ai adoré cette série, vivement la prochaine saison!"</p>
                        <p className="text-xs text-gray-500 mt-1">Sur Stranger Things • Il y a 5 heures</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Button variant="outline" asChild className="bg-gray-800 border-gray-700 text-gray-300">
                        <Link href="/admin/comments">
                          Tous les commentaires
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900 border-gray-800 md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Répartition du contenu</CardTitle>
                      <PieChart className="h-5 w-5 text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">Graphique de répartition des genres</p>
                        <p className="text-xs text-gray-500 mt-1">Top 5 genres: Action, Drama, Comedy, Sci-Fi, Thriller</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-xl font-bold text-white">{stats?.content?.totalMovies || 0}</div>
                        <p className="text-xs text-gray-400">Films</p>
                      </div>
                      <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-xl font-bold text-white">{stats?.content?.totalSeries || 0}</div>
                        <p className="text-xs text-gray-400">Séries</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}