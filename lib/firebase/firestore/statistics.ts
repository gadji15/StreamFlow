import { firestore } from "../config";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  setDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
  increment
} from "firebase/firestore";

// Type pour les statistiques
export interface Statistics {
  totalUsers: number;
  activeUsers: number;
  vipUsers: number;
  totalMovies: number;
  publishedMovies: number;
  totalSeries: number;
  publishedSeries: number;
  totalViews: number;
  topGenres: { [genre: string]: number };
  lastUpdated: string;
}

// Nom de la collection et du document
const COLLECTION = "statistics";
const STATS_DOC_ID = "global";

// Initialiser ou récupérer les statistiques globales
export const getOrCreateStats = async (): Promise<Statistics> => {
  try {
    const statsRef = doc(firestore, COLLECTION, STATS_DOC_ID);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data() as Statistics;
    } else {
      // Statistiques par défaut
      const defaultStats: Statistics = {
        totalUsers: 0,
        activeUsers: 0,
        vipUsers: 0,
        totalMovies: 0,
        publishedMovies: 0,
        totalSeries: 0,
        publishedSeries: 0,
        totalViews: 0,
        topGenres: {},
        lastUpdated: new Date().toISOString()
      };
      
      await setDoc(statsRef, defaultStats);
      return defaultStats;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw error;
  }
};

// Mettre à jour les statistiques après une action spécifique
export const updateStats = async (updates: Partial<Statistics>): Promise<void> => {
  try {
    const statsRef = doc(firestore, COLLECTION, STATS_DOC_ID);
    
    await updateDoc(statsRef, {
      ...updates,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques:", error);
    throw error;
  }
};

// Incrémenter une statistique spécifique
export const incrementStat = async (field: keyof Statistics, value: number = 1): Promise<void> => {
  try {
    const statsRef = doc(firestore, COLLECTION, STATS_DOC_ID);
    
    const updates: any = {
      [field]: increment(value),
      lastUpdated: new Date().toISOString()
    };
    
    await updateDoc(statsRef, updates);
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation de la statistique ${field}:`, error);
    throw error;
  }
};

// Ajouter un genre aux statistiques
export const incrementGenre = async (genre: string): Promise<void> => {
  try {
    const statsRef = doc(firestore, COLLECTION, STATS_DOC_ID);
    
    await runTransaction(firestore, async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      
      if (!statsDoc.exists()) {
        throw new Error("Document de statistiques non trouvé");
      }
      
      const stats = statsDoc.data() as Statistics;
      const topGenres = stats.topGenres || {};
      
      // Incrémenter le compteur pour ce genre
      topGenres[genre] = (topGenres[genre] || 0) + 1;
      
      transaction.update(statsRef, {
        topGenres,
        lastUpdated: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation du genre ${genre}:`, error);
    throw error;
  }
};

// Calculer et mettre à jour toutes les statistiques (exécuter périodiquement ou après des changements majeurs)
export const recalculateAllStats = async (): Promise<Statistics> => {
  try {
    // Compter les utilisateurs
    const usersQuery = query(collection(firestore, "users"));
    const usersSnapshot = await getDocs(usersQuery);
    const totalUsers = usersSnapshot.size;
    
    // Compter les utilisateurs VIP
    const vipUsersQuery = query(collection(firestore, "users"), where("isVip", "==", true));
    const vipUsersSnapshot = await getDocs(vipUsersQuery);
    const vipUsers = vipUsersSnapshot.size;
    
    // Compter les utilisateurs actifs (dernière connexion dans les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsersQuery = query(
      collection(firestore, "users"),
      where("lastLogin", ">=", thirtyDaysAgo.toISOString())
    );
    const activeUsersSnapshot = await getDocs(activeUsersQuery);
    const activeUsers = activeUsersSnapshot.size;
    
    // Compter les films
    const moviesQuery = query(collection(firestore, "movies"));
    const moviesSnapshot = await getDocs(moviesQuery);
    const totalMovies = moviesSnapshot.size;
    
    // Compter les films publiés
    const publishedMoviesQuery = query(
      collection(firestore, "movies"),
      where("status", "==", "published")
    );
    const publishedMoviesSnapshot = await getDocs(publishedMoviesQuery);
    const publishedMovies = publishedMoviesSnapshot.size;
    
    // Compter les séries
    const seriesQuery = query(collection(firestore, "series"));
    const seriesSnapshot = await getDocs(seriesQuery);
    const totalSeries = seriesSnapshot.size;
    
    // Compter les séries publiées
    const publishedSeriesQuery = query(
      collection(firestore, "series"),
      where("status", "==", "published")
    );
    const publishedSeriesSnapshot = await getDocs(publishedSeriesQuery);
    const publishedSeries = publishedSeriesSnapshot.size;
    
    // Calculer le nombre total de vues
    let totalViews = 0;
    moviesSnapshot.forEach(doc => {
      const data = doc.data();
      totalViews += data.views || 0;
    });
    seriesSnapshot.forEach(doc => {
      const data = doc.data();
      totalViews += data.views || 0;
    });
    
    // Calculer les genres les plus populaires
    const topGenres: { [genre: string]: number } = {};
    moviesSnapshot.forEach(doc => {
      const data = doc.data();
      const genres = data.genres || [];
      genres.forEach((genre: string) => {
        topGenres[genre] = (topGenres[genre] || 0) + 1;
      });
    });
    seriesSnapshot.forEach(doc => {
      const data = doc.data();
      const genres = data.genres || [];
      genres.forEach((genre: string) => {
        topGenres[genre] = (topGenres[genre] || 0) + 1;
      });
    });
    
    // Mettre à jour les statistiques
    const stats: Statistics = {
      totalUsers,
      activeUsers,
      vipUsers,
      totalMovies,
      publishedMovies,
      totalSeries,
      publishedSeries,
      totalViews,
      topGenres,
      lastUpdated: new Date().toISOString()
    };
    
    await setDoc(doc(firestore, COLLECTION, STATS_DOC_ID), stats);
    
    return stats;
  } catch (error) {
    console.error("Erreur lors du recalcul des statistiques:", error);
    throw error;
  }
};