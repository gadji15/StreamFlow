"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Plus,
  Film,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Star,
  Calendar,
  Clock,
  Crown,
  X,
  AlertTriangle,
  Check,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tab, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { getAdminById } from "@/lib/firebase/firestore/admins";
import { 
  getAllMovies, 
  getMovieById, 
  createMovie, 
  updateMovie, 
  deleteMovie 
} from "@/lib/firebase/firestore/movies";

// Interface for Movie data
interface Movie {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop?: string;
  releaseDate: Date;
  duration: string;
  genres: string[];
  rating: number;
  views: number;
  status: "published" | "draft";
  trailer?: string;
  director?: string;
  cast?: string[];
  vipOnly?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Admin Movies Management Page
export default function AdminMoviesPage() {
  // State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "published" | "drafts">("all");
  const [sortBy, setSortBy] = useState<"title" | "releaseDate" | "rating" | "views">("releaseDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage] = useState(10);
  const router = useRouter();
  
  // Form state for edit/create
  const [movieForm, setMovieForm] = useState<Partial<Movie>>({
    title: "",
    description: "",
    poster: "",
    backdrop: "",
    releaseDate: new Date(),
    duration: "",
    genres: [],
    rating: 0,
    status: "draft",
    trailer: "",
    director: "",
    cast: [],
    vipOnly: false,
  });
  
  // Files for upload
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Fetch movies data
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const adminData = localStorage.getItem("adminUser");
      if (!adminData) {
        router.push("/admin/auth/login");
        return;
      }
      
      setIsAdmin(true);
      const admin = JSON.parse(adminData);
      setAdminUser(admin);
      
      // Check permissions
      if (!admin.permissions?.canManageMovies) {
        setError("Vous n'avez pas les permissions nécessaires pour gérer les films");
        return;
      }
      
      // Fetch movies from Firestore
      const moviesData = await getAllMovies();
      setMovies(moviesData);
      
    } catch (err: any) {
      console.error("Error fetching movies:", err);
      setError(err.message || "Une erreur est survenue lors du chargement des films");
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);
  
  // Filter and sort movies
  const filteredMovies = movies
    .filter((movie) => {
      // Filter by tab
      if (activeTab === "published" && movie.status !== "published") return false;
      if (activeTab === "drafts" && movie.status !== "draft") return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          movie.title.toLowerCase().includes(query) ||
          movie.description.toLowerCase().includes(query) ||
          movie.genres.some((genre) => genre.toLowerCase().includes(query))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === "releaseDate") {
        const dateA = new Date(a.releaseDate).getTime();
        const dateB = new Date(b.releaseDate).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "rating") {
        return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
      } else {
        return sortOrder === "asc" ? a.views - b.views : b.views - a.views;
      }
    });
  
  // Pagination
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!movieForm.title?.trim()) {
      errors.title = "Le titre est obligatoire";
    }
    
    if (!movieForm.description?.trim()) {
      errors.description = "La description est obligatoire";
    }
    
    if (!movieForm.poster && !posterFile) {
      errors.poster = "Une image d'affiche est obligatoire";
    }
    
    if (!movieForm.duration?.trim()) {
      errors.duration = "La durée est obligatoire";
    }
    
    if (!movieForm.genres || movieForm.genres.length === 0) {
      errors.genres = "Au moins un genre est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle movie creation
  const handleCreateMovie = async () => {
    if (!validateForm()) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUploadProgress(50);
      
      // Create movie in Firestore
      await createMovie(
        {
          ...movieForm as Omit<Movie, "id" | "createdAt" | "updatedAt" | "views">,
          releaseDate: movieForm.releaseDate as Date,
        },
        adminUser.id,
        adminUser.name,
        posterFile || undefined,
        backdropFile || undefined
      );
      
      setUploadProgress(100);
      
      // Refresh movies list
      fetchMovies();
      
      // Reset form
      setMovieForm({
        title: "",
        description: "",
        poster: "",
        backdrop: "",
        releaseDate: new Date(),
        duration: "",
        genres: [],
        rating: 0,
        status: "draft",
        trailer: "",
        director: "",
        cast: [],
        vipOnly: false,
      });
      setPosterFile(null);
      setBackdropFile(null);
      
      // Close dialog
      setIsEditDialogOpen(false);
      
    } catch (err: any) {
      console.error("Error creating movie:", err);
      setFormErrors({
        ...formErrors,
        form: err.message || "Une erreur est survenue lors de la création du film",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Handle movie update
  const handleUpdateMovie = async () => {
    if (!validateForm() || !selectedMovie) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUploadProgress(50);
      
      // Update movie in Firestore
      await updateMovie(
        selectedMovie.id,
        {
          ...movieForm,
          releaseDate: movieForm.releaseDate as Date,
        },
        adminUser.id,
        adminUser.name,
        posterFile || undefined,
        backdropFile || undefined
      );
      
      setUploadProgress(100);
      
      // Refresh movies list
      fetchMovies();
      
      // Reset form
      setMovieForm({
        title: "",
        description: "",
        poster: "",
        backdrop: "",
        releaseDate: new Date(),
        duration: "",
        genres: [],
        rating: 0,
        status: "draft",
        trailer: "",
        director: "",
        cast: [],
        vipOnly: false,
      });
      setPosterFile(null);
      setBackdropFile(null);
      setSelectedMovie(null);
      
      // Close dialog
      setIsEditDialogOpen(false);
      
    } catch (err: any) {
      console.error("Error updating movie:", err);
      setFormErrors({
        ...formErrors,
        form: err.message || "Une erreur est survenue lors de la mise à jour du film",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Handle movie deletion
  const handleDeleteMovie = async () => {
    if (!selectedMovie) return;
    
    try {
      // Delete movie from Firestore
      await deleteMovie(selectedMovie.id, adminUser.id, adminUser.name);
      
      // Refresh movies list
      fetchMovies();
      
      // Reset selected movie
      setSelectedMovie(null);
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      
    } catch (err: any) {
      console.error("Error deleting movie:", err);
      setError(err.message || "Une erreur est survenue lors de la suppression du film");
    }
  };
  
  // Open edit dialog with movie data
  const openEditDialog = (movie: Movie) => {
    setSelectedMovie(movie);
    setMovieForm({
      title: movie.title,
      description: movie.description,
      poster: movie.poster,
      backdrop: movie.backdrop || "",
      releaseDate: new Date(movie.releaseDate),
      duration: movie.duration,
      genres: movie.genres,
      rating: movie.rating,
      status: movie.status,
      trailer: movie.trailer || "",
      director: movie.director || "",
      cast: movie.cast || [],
      vipOnly: movie.vipOnly || false,
    });
    setIsEditDialogOpen(true);
  };
  
  // Open create dialog
  const openCreateDialog = () => {
    setSelectedMovie(null);
    setMovieForm({
      title: "",
      description: "",
      poster: "",
      backdrop: "",
      releaseDate: new Date(),
      duration: "",
      genres: [],
      rating: 0,
      status: "draft",
      trailer: "",
      director: "",
      cast: [],
      vipOnly: false,
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setMovieForm({
      ...movieForm,
      [field]: value,
    });
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: "",
      });
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "poster" | "backdrop") => {
    if (e.target.files && e.target.files[0]) {
      if (fileType === "poster") {
        setPosterFile(e.target.files[0]);
        
        // Preview
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            handleFormChange("poster", event.target.result as string);
          }
        };
        reader.readAsDataURL(e.target.files[0]);
        
      } else {
        setBackdropFile(e.target.files[0]);
        
        // Preview
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            handleFormChange("backdrop", event.target.result as string);
          }
        };
        reader.readAsDataURL(e.target.files[0]);
      }
      
      // Clear error for this field
      if (formErrors[fileType]) {
        setFormErrors({
          ...formErrors,
          [fileType]: "",
        });
      }
    }
  };
  
  // Handle genre selection
  const handleGenreToggle = (genre: string) => {
    const currentGenres = movieForm.genres || [];
    
    if (currentGenres.includes(genre)) {
      handleFormChange(
        "genres",
        currentGenres.filter((g) => g !== genre)
      );
    } else {
      handleFormChange("genres", [...currentGenres, genre]);
    }
  };
  
  // List of available genres
  const availableGenres = [
    "Action",
    "Aventure",
    "Animation",
    "Comédie",
    "Crime",
    "Documentaire",
    "Drame",
    "Famille",
    "Fantastique",
    "Histoire",
    "Horreur",
    "Musique",
    "Mystère",
    "Romance",
    "Science-Fiction",
    "Thriller",
    "Guerre",
    "Western",
  ];
  
  if (!isAdmin) {
    return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-950">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <AdminHeader title="Gestion des films" />
        
        <main className="p-6 pt-24">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium">Erreur</h3>
              <p>{error}</p>
              <Button 
                onClick={() => fetchMovies()}
                className="mt-2 bg-red-700 hover:bg-red-600"
              >
                Réessayer
              </Button>
            </div>
          )}
          
          {/* Tabs and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "all" | "published" | "drafts")}
              className="mb-4 md:mb-0"
            >
              <TabsList className="bg-gray-800">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary">
                  Tous les films
                </TabsTrigger>
                <TabsTrigger value="published" className="data-[state=active]:bg-primary">
                  Publiés
                </TabsTrigger>
                <TabsTrigger value="drafts" className="data-[state=active]:bg-primary">
                  Brouillons
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary-dark">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un film
            </Button>
          </div>
          
          {/* Search and Filters */}
          <Card className="bg-gray-900 border-gray-800 shadow-md mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un film..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 items-center">
                  <span className="text-gray-400 text-sm whitespace-nowrap">Trier par:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-gray-800 border-gray-700">
                        {sortBy === "title" 
                          ? "Titre" 
                          : sortBy === "releaseDate" 
                          ? "Date de sortie" 
                          : sortBy === "rating" 
                          ? "Note" 
                          : "Vues"}
                        <Filter className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700">
                      <DropdownMenuItem onClick={() => setSortBy("title")} className="text-white hover:bg-gray-700">
                        Titre
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("releaseDate")} className="text-white hover:bg-gray-700">
                        Date de sortie
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("rating")} className="text-white hover:bg-gray-700">
                        Note
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("views")} className="text-white hover:bg-gray-700">
                        Vues
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 px-2"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Movies Table */}
          <Card className="bg-gray-900 border-gray-800 shadow-md overflow-hidden">
            <ScrollArea className="h-[calc(100vh-330px)]">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredMovies.length === 0 ? (
                <div className="text-center p-8 text-gray-400">
                  <Film className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                  <h3 className="text-lg font-medium">Aucun film trouvé</h3>
                  <p className="mt-1">
                    {searchQuery
                      ? `Aucun résultat pour "${searchQuery}"`
                      : "Ajoutez votre premier film avec le bouton 'Ajouter un film'"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-800 sticky top-0">
                    <TableRow>
                      <TableHead className="text-gray-300">Film</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Statut</TableHead>
                      <TableHead className="text-gray-300 text-right">Note</TableHead>
                      <TableHead className="text-gray-300 text-right">Vues</TableHead>
                      <TableHead className="text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMovies.map((movie) => (
                      <TableRow key={movie.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                        <TableCell className="py-3">
                          <div className="flex items-center space-x-3">
                            <div className="relative h-12 w-8 flex-shrink-0">
                              <Image
                                src={movie.poster || "/placeholder.jpg"}
                                alt={movie.title}
                                fill
                                className="object-cover rounded-sm"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-white">{movie.title}</div>
                              <div className="text-xs text-gray-400 truncate max-w-[250px]">
                                {movie.genres.join(", ")}
                                {movie.vipOnly && (
                                  <span className="ml-2 inline-flex items-center text-yellow-400">
                                    <Crown className="h-3 w-3 mr-1" />
                                    VIP
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {new Date(movie.releaseDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {movie.status === "published" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-900">
                              <Eye className="mr-1 h-3 w-3" />
                              Publié
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                              <EyeOff className="mr-1 h-3 w-3" />
                              Brouillon
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center text-yellow-400">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400" />
                            {movie.rating.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {movie.views.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gray-800 border-gray-700"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem 
                                onClick={() => openEditDialog(movie)}
                                className="text-white hover:bg-gray-700"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMovie(movie);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-400 hover:bg-gray-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            
            {/* Pagination */}
            {filteredMovies.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                <div className="text-sm text-gray-400">
                  Affichage de {indexOfFirstMovie + 1} à{" "}
                  {Math.min(indexOfLastMovie, filteredMovies.length)} sur{" "}
                  {filteredMovies.length} films
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="h-8 px-2 bg-gray-800 border-gray-700 disabled:opacity-50"
                  >
                    Précédent
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      className={`h-8 w-8 p-0 ${
                        currentPage === page
                          ? "bg-primary"
                          : "bg-gray-800 border-gray-700"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="h-8 px-2 bg-gray-800 border-gray-700 disabled:opacity-50"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeleteDialogOpen && (
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-red-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Supprimer le film
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Êtes-vous sûr de vouloir supprimer ce film ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              
              {selectedMovie && (
                <div className="flex items-center space-x-3 my-4 p-3 bg-gray-800 rounded-md">
                  <div className="relative h-16 w-12 flex-shrink-0">
                    <Image
                      src={selectedMovie.poster || "/placeholder.jpg"}
                      alt={selectedMovie.title}
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedMovie.title}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(selectedMovie.releaseDate).getFullYear()} • {selectedMovie.duration}
                    </p>
                  </div>
                </div>
              )}
              
              <DialogFooter className="flex justify-end gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="bg-gray-800 border-gray-700"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDeleteMovie}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      
      {/* Edit/Create Movie Dialog */}
      <AnimatePresence>
        {isEditDialogOpen && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {selectedMovie ? "Modifier le film" : "Ajouter un film"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedMovie
                    ? "Modifiez les détails du film ci-dessous."
                    : "Remplissez les détails du film ci-dessous."}
                </DialogDescription>
              </DialogHeader>
              
              {/* Form error */}
              {formErrors.form && (
                <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-md mb-4">
                  {formErrors.form}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - Images */}
                <div className="space-y-4">
                  {/* Poster */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Affiche du film {formErrors.poster && <span className="text-red-400">*</span>}
                    </label>
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-800 border border-gray-700">
                      {movieForm.poster ? (
                        <Image
                          src={movieForm.poster}
                          alt="Poster preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                          <Film className="h-12 w-12 mb-2" />
                          <span className="text-sm">Aucune image</span>
                        </div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="bg-primary text-white px-3 py-1 rounded-md text-sm">
                          Choisir une image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "poster")}
                        />
                      </label>
                    </div>
                    {formErrors.poster && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.poster}</p>
                    )}
                  </div>
                  
                  {/* Backdrop */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Image de fond (optionnel)
                    </label>
                    <div className="relative aspect-video rounded-md overflow-hidden bg-gray-800 border border-gray-700">
                      {movieForm.backdrop ? (
                        <Image
                          src={movieForm.backdrop}
                          alt="Backdrop preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                          <Film className="h-8 w-8 mb-1" />
                          <span className="text-xs">Image de fond</span>
                        </div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="bg-primary text-white px-3 py-1 rounded-md text-sm">
                          Choisir une image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "backdrop")}
                        />
                      </label>
                    </div>
                  </div>
                  
                  {/* VIP Only toggle */}
                  <div className="p-4 bg-gray-800 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Crown className="h-5 w-5 text-yellow-400 mr-2" />
                        <span>Contenu VIP exclusif</span>
                      </div>
                      <button
                        type="button"
                        className={`w-10 h-5 rounded-full relative transition-colors ${
                          movieForm.vipOnly ? "bg-yellow-500" : "bg-gray-600"
                        }`}
                        onClick={() => handleFormChange("vipOnly", !movieForm.vipOnly)}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform transition-transform ${
                            movieForm.vipOnly ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Si activé, seuls les abonnés VIP pourront accéder à ce contenu.
                    </p>
                  </div>
                </div>
                
                {/* Middle column - Basic Info */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                      Titre {formErrors.title && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={movieForm.title || ""}
                      onChange={(e) => handleFormChange("title", e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Titre du film"
                    />
                    {formErrors.title && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                      Description {formErrors.description && <span className="text-red-400">*</span>}
                    </label>
                    <textarea
                      id="description"
                      value={movieForm.description || ""}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
                      placeholder="Description du film"
                    />
                    {formErrors.description && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>
                    )}
                  </div>
                  
                  {/* Date and Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-300 mb-1">
                        Date de sortie
                      </label>
                      <input
                        id="releaseDate"
                        type="date"
                        value={movieForm.releaseDate ? new Date(movieForm.releaseDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleFormChange("releaseDate", new Date(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">
                        Durée {formErrors.duration && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        id="duration"
                        type="text"
                        value={movieForm.duration || ""}
                        onChange={(e) => handleFormChange("duration", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="1h 30min"
                      />
                      {formErrors.duration && (
                        <p className="text-red-400 text-xs mt-1">{formErrors.duration}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Rating and Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">
                        Note
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          id="rating"
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={movieForm.rating || 0}
                          onChange={(e) => handleFormChange("rating", parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <span className="flex items-center bg-gray-800 border border-gray-700 rounded px-2 py-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                          {(movieForm.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Statut
                      </label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center text-sm ${
                            movieForm.status === "draft"
                              ? "bg-gray-700 text-white"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          }`}
                          onClick={() => handleFormChange("status", "draft")}
                        >
                          <EyeOff className="h-4 w-4 mr-1" />
                          Brouillon
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center text-sm ${
                            movieForm.status === "published"
                              ? "bg-green-700 text-white"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          }`}
                          onClick={() => handleFormChange("status", "published")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Publié
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right column - Additional Info */}
                <div className="space-y-4">
                  {/* Genres */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Genres {formErrors.genres && <span className="text-red-400">*</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableGenres.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          className={`px-3 py-1 rounded-full text-xs ${
                            movieForm.genres?.includes(genre)
                              ? "bg-primary text-white"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          }`}
                          onClick={() => handleGenreToggle(genre)}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                    {formErrors.genres && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.genres}</p>
                    )}
                  </div>
                  
                  {/* Trailer */}
                  <div>
                    <label htmlFor="trailer" className="block text-sm font-medium text-gray-300 mb-1">
                      Lien de la bande-annonce (optionnel)
                    </label>
                    <input
                      id="trailer"
                      type="text"
                      value={movieForm.trailer || ""}
                      onChange={(e) => handleFormChange("trailer", e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  
                  {/* Director */}
                  <div>
                    <label htmlFor="director" className="block text-sm font-medium text-gray-300 mb-1">
                      Réalisateur (optionnel)
                    </label>
                    <input
                      id="director"
                      type="text"
                      value={movieForm.director || ""}
                      onChange={(e) => handleFormChange("director", e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Nom du réalisateur"
                    />
                  </div>
                  
                  {/* Cast */}
                  <div>
                    <label htmlFor="cast" className="block text-sm font-medium text-gray-300 mb-1">
                      Acteurs principaux (optionnel)
                    </label>
                    <input
                      id="cast"
                      type="text"
                      value={(movieForm.cast || []).join(", ")}
                      onChange={(e) =>
                        handleFormChange(
                          "cast",
                          e.target.value.split(",").map((item) => item.trim()).filter(Boolean)
                        )
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Acteur 1, Acteur 2, ..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Téléchargement...</span>
                    <span className="text-sm text-gray-400">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              <DialogFooter className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="bg-gray-800 border-gray-700"
                  disabled={isUploading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={selectedMovie ? handleUpdateMovie : handleCreateMovie}
                  className="bg-primary hover:bg-primary-dark"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Traitement...
                    </div>
                  ) : selectedMovie ? (
                    "Mettre à jour"
                  ) : (
                    "Créer"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}