"use client"

import { useState, useEffect } from "react"
import { 
  Film, 
  Tv, 
  User, 
  Eye, 
  Star, 
  TrendingUp, 
  Clock, 
  Calendar 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  const stats = [
    {
      title: "Films",
      value: "152",
      icon: <Film className="h-5 w-5" />,
      color: "text-blue-500"
    },
    {
      title: "Séries",
      value: "86",
      icon: <Tv className="h-5 w-5" />,
      color: "text-purple-500"
    },
    {
      title: "Utilisateurs",
      value: "2,543",
      icon: <User className="h-5 w-5" />,
      color: "text-green-500"
    },
    {
      title: "Vues totales",
      value: "14,287",
      icon: <Eye className="h-5 w-5" />,
      color: "text-amber-500"
    }
  ]
  
  const popularContent = [
    {
      id: 1,
      title: "Inception",
      type: "film",
      views: 1254,
      rating: 4.8
    },
    {
      id: 2,
      title: "Stranger Things",
      type: "série",
      views: 1187,
      rating: 4.7
    },
    {
      id: 3,
      title: "The Dark Knight",
      type: "film",
      views: 986,
      rating: 4.9
    },
    {
      id: 4,
      title: "Breaking Bad",
      type: "série",
      views: 945,
      rating: 4.9
    }
  ]
  
  const recentActivity = [
    {
      id: 1,
      action: "Film ajouté",
      details: "Top Gun: Maverick",
      time: "Il y a 2 heures",
      admin: "admin@streamflow.com"
    },
    {
      id: 2,
      action: "Série modifiée",
      details: "Stranger Things - Saison 4",
      time: "Il y a 5 heures",
      admin: "admin@streamflow.com"
    },
    {
      id: 3,
      action: "Utilisateur VIP",
      details: "user123@example.com a souscrit à un abonnement VIP",
      time: "Il y a 12 heures",
      admin: "Système"
    }
  ]
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Tableau de bord</h1>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Aujourd'hui
          </Button>
          <Button size="sm" variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Cette semaine
          </Button>
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-gray-800 border border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <h3 className="text-2xl font-semibold text-white mt-1">{stat.value}</h3>
                </div>
                <div className={`h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu populaire */}
        <Card className="bg-gray-800 border border-gray-700 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Contenu populaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularContent.map((content) => (
                <div key={content.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <div className="flex items-center">
                      <span className={`h-8 w-8 rounded-md flex items-center justify-center ${content.type === 'film' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
                        {content.type === 'film' ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
                      </span>
                      <div className="ml-3">
                        <h4 className="font-medium text-white">{content.title}</h4>
                        <p className="text-xs text-gray-400">{content.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{content.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-gray-300">{content.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Activité récente */}
        <Card className="bg-gray-800 border border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-l-2 border-primary pl-3 py-1">
                  <div className="text-sm font-medium text-white">{activity.action}</div>
                  <div className="text-xs text-gray-400">{activity.details}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    <span className="text-xs text-gray-500">{activity.admin}</span>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                Voir toutes les activités
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}