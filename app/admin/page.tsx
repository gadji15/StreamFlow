"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, Film, Tv, Settings, Plus, Search, Edit, Trash2, Eye, LogOut } from "lucide-react"

// Mock data for admin dashboard
const stats = [
  { title: "Utilisateurs actifs", value: "12,345", change: "+12%", icon: <Users className="h-6 w-6" /> },
  { title: "Vues totales", value: "1.2M", change: "+8%", icon: <Eye className="h-6 w-6" /> },
  { title: "Films", value: "2,845", change: "+5%", icon: <Film className="h-6 w-6" /> },
  { title: "Séries", value: "482", change: "+15%", icon: <Tv className="h-6 w-6" /> },
]

const recentMovies = [
  { id: 1, title: "Dune", image: "/placeholder.svg?height=150&width=100", views: 45892, date: "2023-04-15" },
  {
    id: 2,
    title: "The Matrix Resurrections",
    image: "/placeholder.svg?height=150&width=100",
    views: 32541,
    date: "2023-04-10",
  },
  { id: 3, title: "No Time to Die", image: "/placeholder.svg?height=150&width=100", views: 28976, date: "2023-04-05" },
  { id: 4, title: "Shang-Chi", image: "/placeholder.svg?height=150&width=100", views: 25431, date: "2023-03-28" },
  {
    id: 5,
    title: "The French Dispatch",
    image: "/placeholder.svg?height=150&width=100",
    views: 18754,
    date: "2023-03-20",
  },
]

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "active", joined: "2023-01-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "active", joined: "2023-02-20" },
  { id: 3, name: "Robert Johnson", email: "robert@example.com", status: "inactive", joined: "2023-03-10" },
  { id: 4, name: "Emily Davis", email: "emily@example.com", status: "active", joined: "2023-03-25" },
  { id: 5, name: "Michael Wilson", email: "michael@example.com", status: "active", joined: "2023-04-05" },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 min-h-screen fixed left-0 top-0 shadow-lg">
          <div className="p-4 border-b border-gray-800">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-poppins">
                StreamFlow
              </span>
              <span className="text-white text-sm font-medium">Admin</span>
            </Link>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors duration-200 ${
                    activeTab === "dashboard"
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Tableau de bord</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("movies")}
                  className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors duration-200 ${
                    activeTab === "movies"
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Film className="h-5 w-5" />
                  <span>Films</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("series")}
                  className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors duration-200 ${
                    activeTab === "series"
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Tv className="h-5 w-5" />
                  <span>Séries</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors duration-200 ${
                    activeTab === "users"
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Utilisateurs</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors duration-200 ${
                    activeTab === "settings"
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Paramètres</span>
                </button>
              </li>
            </ul>

            <div className="pt-8 mt-8 border-t border-gray-800">
              <button className="flex items-center space-x-3 w-full p-3 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200">
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-6 shadow-md border border-gray-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                        <p className="text-white text-2xl font-bold mt-1">{stat.value}</p>
                        <p
                          className={`text-sm mt-2 ${stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                        >
                          {stat.change} depuis le mois dernier
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Content */}
              <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800">
                <div className="p-6 border-b border-gray-800">
                  <h2 className="text-xl font-semibold text-white">Contenu récemment ajouté</h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm">
                          <th className="pb-4 font-medium">Titre</th>
                          <th className="pb-4 font-medium">Vues</th>
                          <th className="pb-4 font-medium">Date d'ajout</th>
                          <th className="pb-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentMovies.map((movie) => (
                          <tr key={movie.id} className="border-t border-gray-800">
                            <td className="py-4">
                              <div className="flex items-center space-x-3">
                                <div className="relative h-12 w-8 flex-shrink-0">
                                  <Image
                                    src={movie.image || "/placeholder.svg"}
                                    alt={movie.title}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                                <span className="text-white font-medium">{movie.title}</span>
                              </div>
                            </td>
                            <td className="py-4 text-gray-300">{movie.views.toLocaleString()}</td>
                            <td className="py-4 text-gray-300">{movie.date}</td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Movies/Series Tab */}
          {(activeTab === "movies" || activeTab === "series") && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">{activeTab === "movies" ? "Films" : "Séries"}</h1>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter {activeTab === "movies" ? "un film" : "une série"}
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder={`Rechercher des ${activeTab === "movies" ? "films" : "séries"}...`}
                    className="pl-10 form-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
                  Filtres
                </Button>
              </div>

              {/* Content Table */}
              <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800">
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm">
                          <th className="pb-4 font-medium">Titre</th>
                          <th className="pb-4 font-medium">Vues</th>
                          <th className="pb-4 font-medium">Date d'ajout</th>
                          <th className="pb-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentMovies.map((movie) => (
                          <tr key={movie.id} className="border-t border-gray-800">
                            <td className="py-4">
                              <div className="flex items-center space-x-3">
                                <div className="relative h-12 w-8 flex-shrink-0">
                                  <Image
                                    src={movie.image || "/placeholder.svg"}
                                    alt={movie.title}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                                <span className="text-white font-medium">{movie.title}</span>
                              </div>
                            </td>
                            <td className="py-4 text-gray-300">{movie.views.toLocaleString()}</td>
                            <td className="py-4 text-gray-300">{movie.date}</td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un utilisateur
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher des utilisateurs..."
                  className="pl-10 form-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Users Table */}
              <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800">
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm">
                          <th className="pb-4 font-medium">Nom</th>
                          <th className="pb-4 font-medium">Email</th>
                          <th className="pb-4 font-medium">Statut</th>
                          <th className="pb-4 font-medium">Date d'inscription</th>
                          <th className="pb-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-t border-gray-800">
                            <td className="py-4">
                              <span className="text-white font-medium">{user.name}</span>
                            </td>
                            <td className="py-4 text-gray-300">{user.email}</td>
                            <td className="py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.status === "active"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {user.status === "active" ? "Actif" : "Inactif"}
                              </span>
                            </td>
                            <td className="py-4 text-gray-300">{user.joined}</td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <h1 className="text-2xl font-bold text-white">Paramètres</h1>

              <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800">
                <div className="p-6">
                  <Tabs defaultValue="general">
                    <TabsList className="mb-6 bg-gray-800">
                      <TabsTrigger value="general">Général</TabsTrigger>
                      <TabsTrigger value="appearance">Apparence</TabsTrigger>
                      <TabsTrigger value="security">Sécurité</TabsTrigger>
                      <TabsTrigger value="api">API</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Informations du site</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="site-name" className="form-label">
                              Nom du site
                            </Label>
                            <Input id="site-name" defaultValue="StreamFlow" className="form-input mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="site-description" className="form-label">
                              Description
                            </Label>
                            <Input
                              id="site-description"
                              defaultValue="Plateforme de streaming de films et séries"
                              className="form-input mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="contact-email" className="form-label">
                              Email de contact
                            </Label>
                            <Input
                              id="contact-email"
                              type="email"
                              defaultValue="contact@streamflow.com"
                              className="form-input mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Paramètres de contenu</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Activer les commentaires</p>
                              <p className="text-sm text-gray-400">
                                Permettre aux utilisateurs de commenter les films et séries
                              </p>
                            </div>
                            <div className="flex items-center h-6">
                              <input
                                id="comments"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                                defaultChecked
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Activer les évaluations</p>
                              <p className="text-sm text-gray-400">
                                Permettre aux utilisateurs de noter les films et séries
                              </p>
                            </div>
                            <div className="flex items-center h-6">
                              <input
                                id="ratings"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button className="btn-primary">Enregistrer les modifications</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Thème</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="border border-purple-500 rounded-lg p-4 bg-gray-800">
                            <p className="text-white font-medium mb-2">Sombre (par défaut)</p>
                            <div className="h-20 bg-gray-900 rounded-md"></div>
                          </div>
                          <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                            <p className="text-white font-medium mb-2">Clair</p>
                            <div className="h-20 bg-gray-200 rounded-md"></div>
                          </div>
                          <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                            <p className="text-white font-medium mb-2">Système</p>
                            <div className="h-20 bg-gradient-to-r from-gray-900 to-gray-200 rounded-md"></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Couleurs</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="primary-color" className="form-label">
                              Couleur primaire
                            </Label>
                            <div className="flex mt-1">
                              <Input
                                id="primary-color"
                                type="color"
                                defaultValue="#8B5CF6"
                                className="w-12 h-10 p-1 rounded-l-md bg-gray-800 border-gray-700"
                              />
                              <Input type="text" defaultValue="#8B5CF6" className="form-input rounded-l-none" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="secondary-color" className="form-label">
                              Couleur secondaire
                            </Label>
                            <div className="flex mt-1">
                              <Input
                                id="secondary-color"
                                type="color"
                                defaultValue="#3B82F6"
                                className="w-12 h-10 p-1 rounded-l-md bg-gray-800 border-gray-700"
                              />
                              <Input type="text" defaultValue="#3B82F6" className="form-input rounded-l-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button className="btn-primary">Enregistrer les modifications</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Authentification</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Authentification à deux facteurs</p>
                              <p className="text-sm text-gray-400">Renforcer la sécurité des comptes administrateurs</p>
                            </div>
                            <div className="flex items-center h-6">
                              <input
                                id="2fa"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Connexion avec Google</p>
                              <p className="text-sm text-gray-400">Permettre la connexion via Google</p>
                            </div>
                            <div className="flex items-center h-6">
                              <input
                                id="google-login"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                                defaultChecked
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Connexion avec Facebook</p>
                              <p className="text-sm text-gray-400">Permettre la connexion via Facebook</p>
                            </div>
                            <div className="flex items-center h-6">
                              <input
                                id="facebook-login"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Sécurité du site</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Protection CSRF</p>
                              <p className="text-sm text-gray-400">
                                Protection contre les attaques Cross-Site Request Forgery
                              </p>
                            </div>
                            <div className="flex items-center h-6">
                              <input
                                id="csrf"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                                defaultChecked
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Protection XSS</p>
                              <p className="text-sm text-gray-400">
                                Protection contre les attaques Cross-Site Scripting
                              </p>
                            </div>
                            <div className="flex items-center h-6">
                              <input
                                id="xss"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button className="btn-primary">Enregistrer les modifications</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="api" className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Clés API</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="api-key" className="form-label">
                              Clé API
                            </Label>
                            <div className="flex mt-1">
                              <Input
                                id="api-key"
                                type="text"
                                value="sk_live_51JGh7rKFbMmHwgDj2vVkNxYs9DfkURu"
                                className="form-input rounded-r-none"
                                readOnly
                              />
                              <Button className="rounded-l-none bg-gray-800 hover:bg-gray-700">Copier</Button>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="webhook-url" className="form-label">
                              URL Webhook
                            </Label>
                            <Input
                              id="webhook-url"
                              type="url"
                              placeholder="https://votre-site.com/api/webhook"
                              className="form-input mt-1"
                            />
                          </div>
                          <div className="pt-2">
                            <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
                              Régénérer la clé API
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button className="btn-primary">Enregistrer les modifications</Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
