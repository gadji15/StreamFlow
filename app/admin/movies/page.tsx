"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Film, Search, Plus, MoreVertical, Edit, Trash2, Eye, Star } from "lucide-react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import LoadingScreen from "@/components/admin/loading-screen"
import { getAllMovies, deleteMovie } from "@/lib/firebase/firestore/movies"

export default function MoviesPage() {
  const router = useRouter()
  const [movies, setMovies] = useState<any[]>([])
  const [filteredMovies, setFilteredMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [genreFilter, setGenreFilter] = useState("all")
  const [adminUser, setAdminUser] = useState<any>(null)
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [movieToDelete, setMovieToDelete] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)
  
  useEffect(() => {
    // Get admin user data from localStorage
    const storedAdminUser = localStorage.getItem("adminUser")
    if (storedAdminUser) {
      setAdminUser(JSON.parse(storedAdminUser))
    }
    
    fetchMovies()
  }, [])
  
  // Apply filters whenever search term or filters change
  useEffect(() => {
    applyFilters()
  }, [searchTerm, statusFilter, genreFilter, movies])
  
  const fetchMovies = async () => {
    try {
      setLoading(true)
      
      // Mock data for initial development
      const mockMovies = [
        {
          id: "1",
          title: "Inception",
          description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
          poster: "/placeholder-movie.jpg",
          releaseDate: new Date("2010-07-16"),
          duration: "2h 28min",
          genres: ["Action", "Adventure", "Sci-Fi"],
          rating: 4.8,
          views: 12540,
          status: "published",
          director: "Christopher Nolan",
          vipOnly: false,
          createdAt: new Date("2023-01-15")
        },
        {
          id: "2",
          title: "The Dark Knight",
          description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
          poster: "/placeholder-movie.jpg",
          releaseDate: new Date("2008-07-18"),
          duration: "2h 32min",
          genres: ["Action", "Crime", "Drama"],
          rating: 4.9,
          views: 10320,
          status: "published",
          director: "Christopher Nolan",
          vipOnly: false,
          createdAt: new Date("2023-01-10")
        },
        {
          id: "3",
          title: "Oppenheimer",
          description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
          poster: "/placeholder-movie.jpg",
          releaseDate: new Date("2023-07-21"),
          duration: "3h 0min",
          genres: ["Biography", "Drama", "History"],
          rating: 4.7,
          views: 8320,
          status: "published",
          director: "Christopher Nolan",
          vipOnly: true,
          createdAt: new Date("2023-08-01")
        },
        {
          id: "4",
          title: "Untitled Project",
          description: "A new film currently in production.",
          poster: "/placeholder-movie.jpg",
          releaseDate: new Date("2024-05-15"),
          duration: "Unknown",
          genres: ["Drama"],
          rating: 0,
          views: 0,
          status: "draft",
          director: "Unknown",
          vipOnly: false,
          createdAt: new Date("2023-09-15")
        }
      ]
      
      setMovies(mockMovies)
      setFilteredMovies(mockMovies)
      
      // In a production app, you would fetch actual data from Firebase
      // const moviesData = await getAllMovies()
      // setMovies(moviesData)
      // setFilteredMovies(moviesData)
      
    } catch (error: any) {
      console.error("Error fetching movies:", error)
      setError(error.message || "Une erreur est survenue lors du chargement des films")
    } finally {
      setLoading(false)
    }
  }
  
  const applyFilters = () => {
    let results = [...movies]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(movie => 
        movie.title.toLowerCase().includes(term) || 
        (movie.director && movie.director.toLowerCase().includes(term))
      )
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(movie => movie.status === statusFilter)
    }
    
    // Apply genre filter
    if (genreFilter !== "all") {
      results = results.filter(movie => movie.genres.includes(genreFilter))
    }
    
    setFilteredMovies(results)
  }
  
  const handleDeleteMovie = async () => {
    if (!movieToDelete || !adminUser) return
    
    try {
      setDeleting(true)
      
      // In a production app, you would delete the actual movie from Firebase
      // await deleteMovie(movieToDelete.id, adminUser.id, adminUser.name)
      
      // For now, just remove it from the local state
      const updatedMovies = movies.filter(movie => movie.id !== movieToDelete.id)
      setMovies(updatedMovies)
      
      // Reset state
      setMovieToDelete(null)
      setDeleteDialogOpen(false)
    } catch (error: any) {
      console.error("Error deleting movie:", error)
      setError(error.message || "Une erreur est survenue lors de la suppression du film")
    } finally {
      setDeleting(false)
    }
  }
  
  const confirmDelete = (movie: any) => {
    setMovieToDelete(movie)
    setDeleteDialogOpen(true)
  }
  
  // Extract all unique genres from movies for the filter
  const allGenres = Array.from(new Set(movies.flatMap(movie => movie.genres)))
  
  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Gestion des films" />
        <main className="pt-24 p-6">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium">Erreur</h3>
              <p>{error}</p>
              <Button 
                onClick={() => setError(null)}
                className="mt-2 bg-red-700 hover:bg-red-600"
              >
                Fermer
              </Button>
            </div>
          )}
          
          <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un film..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white w-full sm:w-[300px]"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="published">Publiés</SelectItem>
                    <SelectItem value="draft">Brouillons</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Tous les genres" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-[300px] overflow-y-auto">
                    <SelectItem value="all">Tous les genres</SelectItem>
                    {allGenres.map(genre => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={() => router.push("/admin/movies/add")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un film
            </Button>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-800/50">
                    <TableHead className="text-gray-300">Titre</TableHead>
                    <TableHead className="text-gray-300">Date de sortie</TableHead>
                    <TableHead className="text-gray-300">Genres</TableHead>
                    <TableHead className="text-gray-300">Note</TableHead>
                    <TableHead className="text-gray-300">Vues</TableHead>
                    <TableHead className="text-gray-300">Statut</TableHead>
                    <TableHead className="text-gray-300">VIP</TableHead>
                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovies.length === 0 ? (
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Film className="h-8 w-8 text-gray-600 mb-2" />
                          <p>Aucun film trouvé</p>
                          <p className="text-sm text-gray-500 mt-1">Ajoutez un nouveau film ou modifiez vos filtres</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMovies.map((movie) => (
                      <TableRow key={movie.id} className="border-gray-800 hover:bg-gray-800/50">
                        <TableCell className="flex items-center space-x-3">
                          <div className="flex-shrink-0 relative w-10 h-14 rounded overflow-hidden bg-gray-800">
                            <Film className="h-full w-full p-2 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{movie.title}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[250px]">{movie.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {movie.releaseDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {movie.genres.map((genre: string) => (
                              <span 
                                key={genre} 
                                className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-gray-300">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                            <span>{movie.rating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {movie.views.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${
                            movie.status === "published" 
                              ? "bg-green-900/30 text-green-400 border border-green-800" 
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                          }`}>
                            {movie.status === "published" ? "Publié" : "Brouillon"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {movie.vipOnly ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-400 border border-purple-800">
                              VIP
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                              Non
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
                              <DropdownMenuItem 
                                className="cursor-pointer flex items-center text-gray-300 hover:text-white"
                                onClick={() => router.push(`/movies/${movie.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer flex items-center text-gray-300 hover:text-white"
                                onClick={() => router.push(`/admin/movies/edit/${movie.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer flex items-center text-red-400 hover:text-red-300"
                                onClick={() => confirmDelete(movie)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination could be added here */}
          </div>
        </main>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-gray-400">
              Êtes-vous sûr de vouloir supprimer le film <span className="text-white font-medium">{movieToDelete?.title}</span> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="text-gray-300 hover:text-white"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMovie}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}