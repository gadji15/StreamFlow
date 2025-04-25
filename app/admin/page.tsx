"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Pie,
  PieChart,
  Cell,
  Legend
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Users,
  Film,
  Tv,
  Eye,
  TrendingUp,
  ChevronRight,
  BarChart2,
  Calendar,
  UserPlus,
  Crown
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActivityLogItem } from "@/components/admin/activity-log-item";
import Image from "next/image";
import firebaseServices from "@/lib/firebase";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "year">("week");
  
  // Fetch dashboard statistics
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const admin = localStorage.getItem("adminUser");
      if (!admin) {
        router.push("/admin/auth/login");
        return;
      }
      
      setIsAdmin(true);
      
      // Get dashboard statistics
      const statsData = await firebaseServices.statistics.getDashboardStatistics();
      setStats(statsData);
      
      // Get recent activity logs
      const logsData = await firebaseServices.activityLogs.getRecentActivity(5);
      setActivityLogs(logsData);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  // Mock data for content consumption chart
  const contentConsumptionData = [
    { day: "Lun", views: 1200 },
    { day: "Mar", views: 1800 },
    { day: "Mer", views: 1600 },
    { day: "Jeu", views: 1400 },
    { day: "Ven", views: 2100 },
    { day: "Sam", views: 2400 },
    { day: "Dim", views: 2200 },
  ];
  
  // Mock data for genre distribution chart
  const genreDistributionData = [
    { name: "Action", value: 35 },
    { name: "Drame", value: 25 },
    { name: "Comédie", value: 20 },
    { name: "Science-Fiction", value: 15 },
    { name: "Horreur", value: 5 },
  ];
  
  const GENRE_COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c"];
  
  const getActivityIcon = (action: string, entityType: string) => {
    if (action === "CREATE") {
      return <div className="bg-green-500/10 text-green-500 p-1.5 rounded-full" />;
    } else if (action === "UPDATE") {
      return <div className="bg-blue-500/10 text-blue-500 p-1.5 rounded-full" />;
    } else {
      return <div className="bg-red-500/10 text-red-500 p-1.5 rounded-full" />;
    }
  };
  
  if (!isAdmin) {
    return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-950">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <AdminHeader title="Tableau de bord" />
        
        <main className="p-6 pt-24">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Users Card */}
            <Card className="bg-gray-900 border-gray-800 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Utilisateurs actifs
                </CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats?.users?.active.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-400">
                  {stats ? (
                    <>
                      {stats.users.vip} utilisateurs VIP
                      <span className="text-green-400 ml-1">
                        (+{stats.users.newLast30Days} nouveaux ce mois)
                      </span>
                    </>
                  ) : (
                    "Chargement..."
                  )}
                </p>
              </CardContent>
            </Card>
            
            {/* Content Card */}
            <Card className="bg-gray-900 border-gray-800 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Contenu total
                </CardTitle>
                <Film className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats ? (
                    stats.content.totalMovies + stats.content.totalSeries
                  ) : (
                    0
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {stats ? (
                    <>
                      {stats.content.publishedMovies} films,{" "}
                      {stats.content.publishedSeries} séries publiés
                    </>
                  ) : (
                    "Chargement..."
                  )}
                </p>
              </CardContent>
            </Card>
            
            {/* Views Card */}
            <Card className="bg-gray-900 border-gray-800 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Vues totales
                </CardTitle>
                <Eye className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">123.4K</div>
                <p className="text-xs text-gray-400">
                  <span className="text-green-400">+12%</span> depuis le mois dernier
                </p>
              </CardContent>
            </Card>
            
            {/* Subscription Card */}
            <Card className="bg-gray-900 border-gray-800 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Abonnés VIP
                </CardTitle>
                <Crown className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats?.users?.vip.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-400">
                  <span className="text-green-400">+5%</span> de taux de conversion
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
            {/* Content Consumption Chart */}
            <Card className="bg-gray-900 border-gray-800 shadow-md lg:col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Vues quotidiennes</CardTitle>
                  <div className="flex space-x-2">
                    {["day", "week", "month", "year"].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period as any)}
                        className={`px-2 py-1 text-xs rounded ${
                          selectedPeriod === period
                            ? "bg-primary text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        {period === "day"
                          ? "Jour"
                          : period === "week"
                          ? "Semaine"
                          : period === "month"
                          ? "Mois"
                          : "Année"}
                      </button>
                    ))}
                  </div>
                </div>
                <CardDescription className="text-gray-400">
                  Activité de visionnage sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contentConsumptionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="day" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderColor: "#374151",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="views"
                        fill="url(#colorGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7B3FE4" stopOpacity={1} />
                          <stop offset="100%" stopColor="#7B3FE4" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Genre Distribution Chart */}
            <Card className="bg-gray-900 border-gray-800 shadow-md lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-white">Contenu par genre</CardTitle>
                <CardDescription className="text-gray-400">
                  Distribution des films et séries par genre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genreDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {genreDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GENRE_COLORS[index % GENRE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderColor: "#374151",
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            {/* Popular Content */}
            <Card className="bg-gray-900 border-gray-800 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Contenu populaire</CardTitle>
                  <Link href="/admin/movies" className="text-sm text-primary hover:underline flex items-center">
                    Voir tout
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                <CardDescription className="text-gray-400">
                  Les films et séries les plus regardés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.popular?.movies?.slice(0, 5).map((movie: any, index: number) => (
                    <div key={movie.id} className="flex items-center space-x-3">
                      <div className="font-bold text-gray-400 w-6 text-center">{index + 1}</div>
                      <div className="relative w-10 h-14 rounded overflow-hidden">
                        <Image
                          src={movie.poster || "/placeholder.jpg"}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{movie.title}</h4>
                        <p className="text-xs text-gray-400">{movie.views.toLocaleString()} vues</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-green-400">+12%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card className="bg-gray-900 border-gray-800 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Activité récente</CardTitle>
                  <Link href="/admin/activity-logs" className="text-sm text-primary hover:underline flex items-center">
                    Historique complet
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                <CardDescription className="text-gray-400">
                  Dernières actions des administrateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <ActivityLogItem key={log.id} log={log} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Insights Row */}
          <div className="grid gap-6 md:grid-cols-3 mt-6">
            <Card className="bg-gray-900 border-gray-800 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-white">
                    <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                    Performances
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-400">Taux de complétion</dt>
                    <dd className="text-sm text-white">78%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-400">Temps moyen de visionnage</dt>
                    <dd className="text-sm text-white">42 min</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-400">Taux de rebond</dt>
                    <dd className="text-sm text-white">24%</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-white">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    À venir
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-2 rounded bg-gray-800/50 border border-gray-700">
                    <div className="text-xs text-gray-400">03 Mars</div>
                    <div className="text-sm font-medium">Mise en ligne de "The Last of Us - S2"</div>
                  </div>
                  <div className="p-2 rounded bg-gray-800/50 border border-gray-700">
                    <div className="text-xs text-gray-400">10 Mars</div>
                    <div className="text-sm font-medium">Mise à jour majeure de la plateforme</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-white">
                    <UserPlus className="h-4 w-4 mr-2 text-primary" />
                    Nouveaux utilisateurs
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats?.users?.newLast30Days || 0}
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Nouveaux inscrits au cours des 30 derniers jours
                </p>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Objectif: 1000</span>
                  <span className="text-xs text-gray-400">65%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}