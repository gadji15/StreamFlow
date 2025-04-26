// Simulé pour cet exemple, en production cela serait une véritable connexion à Firebase
export class FirebaseAdmin {
    static instance: FirebaseAdmin
    private movies: any[] = []
    private series: any[] = []
    private users: any[] = []
    private admins: any[] = []
    private activityLogs: any[] = []
  
    constructor() {
      // Initialiser avec des données de mock
      this.movies = [
        {
          id: 1,
          title: "Inception",
          description: "Un voleur expérimenté dans l'art de l'extraction de secrets...",
          releaseDate: "2010-07-16",
          duration: "2h 28min",
          rating: 8.8,
          genres: ["Science-Fiction", "Action", "Aventure"],
          poster: "/placeholder.svg?height=600&width=400",
          backdrop: "/placeholder.svg?height=1080&width=1920",
          trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          videoFile: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
          director: "Christopher Nolan",
          status: "published",
          featured: true,
          views: 1250000,
          cast: [
            { name: "Leonardo DiCaprio", character: "Dom Cobb", photo: "/placeholder.svg?height=200&width=200" },
            { name: "Joseph Gordon-Levitt", character: "Arthur", photo: "/placeholder.svg?height=200&width=200" },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // Ajouter d'autres films...
      ]
  
      this.series = [
        {
          id: 1,
          title: "Stranger Things",
          description: "Quand un jeune garçon disparaît, une petite ville découvre des mystères...",
          releaseDate: "2016-07-15",
          seasons: 4,
          episodesCount: 34,
          rating: 8.7,
          genres: ["Drame", "Fantastique", "Horreur"],
          poster: "/placeholder.svg?height=600&width=400",
          backdrop: "/placeholder.svg?height=1080&width=1920",
          trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          creator: "The Duffer Brothers",
          status: "published",
          featured: true,
          views: 1750000,
          cast: [
            { name: "Millie Bobby Brown", character: "Eleven", photo: "/placeholder.svg?height=200&width=200" },
            { name: "Finn Wolfhard", character: "Mike Wheeler", photo: "/placeholder.svg?height=200&width=200" },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // Ajouter d'autres séries...
      ]
  
      this.users = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          registeredAt: "2023-01-15",
          status: "active",
          subscription: "vip",
          avatar: "/placeholder.svg?height=200&width=200",
          lastLogin: "2023-05-15T10:30:00Z",
        },
        // Ajouter d'autres utilisateurs...
      ]
  
      this.admins = [
        {
          id: 1,
          name: "Admin",
          email: "admin@streamflow.com",
          role: "super_admin",
          createdAt: "2023-01-01T00:00:00Z",
          lastLogin: "2023-05-15T10:30:00Z",
        },
        {
          id: 2,
          name: "Content Manager",
          email: "content@streamflow.com",
          role: "content_manager",
          createdAt: "2023-02-01T00:00:00Z",
          lastLogin: "2023-05-14T15:45:00Z",
        },
        // Ajouter d'autres administrateurs...
      ]
  
      this.activityLogs = [
        {
          id: 1,
          adminId: 1,
          adminName: "Admin",
          action: "CREATE",
          entityType: "MOVIE",
          entityId: 1,
          entityName: "Inception",
          timestamp: "2023-05-01T14:30:00Z",
          details: { ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome" },
        },
        // Ajouter d'autres logs...
      ]
    }
  
    static getInstance() {
      if (!FirebaseAdmin.instance) {
        FirebaseAdmin.instance = new FirebaseAdmin()
      }
      return FirebaseAdmin.instance
    }
  
    // Movies CRUD
    async getMovies() {
      return [...this.movies]
    }
  
    async getMovieById(id: number) {
      return this.movies.find(movie => movie.id === id)
    }
  
    async createMovie(movie: any) {
      const newId = this.movies.length > 0 ? Math.max(...this.movies.map(m => m.id)) + 1 : 1
      const newMovie = { ...movie, id: newId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      this.movies.push(newMovie)
      this.logActivity("CREATE", "MOVIE", newId, movie.title)
      return newMovie
    }
  
    async updateMovie(id: number, movie: any) {
      const index = this.movies.findIndex(m => m.id === id)
      if (index !== -1) {
        this.movies[index] = { ...this.movies[index], ...movie, updatedAt: new Date().toISOString() }
        this.logActivity("UPDATE", "MOVIE", id, movie.title || this.movies[index].title)
        return this.movies[index]
      }
      return null
    }
  
    async deleteMovie(id: number) {
      const index = this.movies.findIndex(m => m.id === id)
      if (index !== -1) {
        const movie = this.movies[index]
        this.movies.splice(index, 1)
        this.logActivity("DELETE", "MOVIE", id, movie.title)
        return true
      }
      return false
    }
  
    // Series CRUD
    async getSeries() {
      return [...this.series]
    }
  
    async getSeriesById(id: number) {
      return this.series.find(series => series.id === id)
    }
  
    async createSeries(series: any) {
      const newId = this.series.length > 0 ? Math.max(...this.series.map(s => s.id)) + 1 : 1
      const newSeries = { ...series, id: newId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      this.series.push(newSeries)
      this.logActivity("CREATE", "SERIES", newId, series.title)
      return newSeries
    }
  
    async updateSeries(id: number, series: any) {
      const index = this.series.findIndex(s => s.id === id)
      if (index !== -1) {
        this.series[index] = { ...this.series[index], ...series, updatedAt: new Date().toISOString() }
        this.logActivity("UPDATE", "SERIES", id, series.title || this.series[index].title)
        return this.series[index]
      }
      return null
    }
  
    async deleteSeries(id: number) {
      const index = this.series.findIndex(s => s.id === id)
      if (index !== -1) {
        const series = this.series[index]
        this.series.splice(index, 1)
        this.logActivity("DELETE", "SERIES", id, series.title)
        return true
      }
      return false
    }
  
    // Users CRUD
    async getUsers() {
      return [...this.users]
    }
  
    async getUserById(id: number) {
      return this.users.find(user => user.id === id)
    }
  
    async updateUser(id: number, user: any) {
      const index = this.users.findIndex(u => u.id === id)
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...user }
        this.logActivity("UPDATE", "USER", id, user.name || this.users[index].name)
        return this.users[index]
      }
      return null
    }
  
    // Admins management
    async getAdmins() {
      return [...this.admins]
    }
  
    async getAdminById(id: number) {
      return this.admins.find(admin => admin.id === id)
    }
  
    async createAdmin(admin: any) {
      const newId = this.admins.length > 0 ? Math.max(...this.admins.map(a => a.id)) + 1 : 1
      const newAdmin = { ...admin, id: newId, createdAt: new Date().toISOString() }
      this.admins.push(newAdmin)
      this.logActivity("CREATE", "ADMIN", newId, admin.name)
      return newAdmin
    }
  
    async updateAdmin(id: number, admin: any) {
      const index = this.admins.findIndex(a => a.id === id)
      if (index !== -1) {
        this.admins[index] = { ...this.admins[index], ...admin }
        this.logActivity("UPDATE", "ADMIN", id, admin.name || this.admins[index].name)
        return this.admins[index]
      }
      return null
    }
  
    async deleteAdmin(id: number) {
      const index = this.admins.findIndex(a => a.id === id)
      if (index !== -1) {
        const admin = this.admins[index]
        this.admins.splice(index, 1)
        this.logActivity("DELETE", "ADMIN", id, admin.name)
        return true
      }
      return false
    }
  
    // Activity logs
    async getActivityLogs() {
      return [...this.activityLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }
  
    async logActivity(action: string, entityType: string, entityId: number, entityName: string) {
      const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}")
      const log = {
        id: this.activityLogs.length + 1,
        adminId: adminUser.id || 1,
        adminName: adminUser.name || "Admin",
        action,
        entityType,
        entityId,
        entityName,
        timestamp: new Date().toISOString(),
        details: { ip: "192.168.1.1", userAgent: navigator.userAgent },
      }
      this.activityLogs.push(log)
      return log
    }
  
    // Analytics
    async getStatistics() {
      return {
        users: {
          total: this.users.length,
          active: this.users.filter(u => u.status === "active").length,
          vip: this.users.filter(u => u.subscription === "vip").length,
        },
        content: {
          totalMovies: this.movies.length,
          totalSeries: this.series.length,
          publishedMovies: this.movies.filter(m => m.status === "published").length,
          publishedSeries: this.series.filter(s => s.status === "published").length,
        },
        views: {
          totalMovieViews: this.movies.reduce((sum, movie) => sum + movie.views, 0),
          totalSeriesViews: this.series.reduce((sum, series) => sum + series.views, 0),
        },
        popular: {
          movies: [...this.movies].sort((a, b) => b.views - a.views).slice(0, 5),
          series: [...this.series].sort((a, b) => b.views - a.views).slice(0, 5),
        },
      }
    }
  }
  
  export default FirebaseAdmin.getInstance()