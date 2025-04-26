import { firestore } from "../config";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  serverTimestamp,
  runTransaction,
  FieldValue
} from "firebase/firestore";

const STATS_DOC_ID = "global_stats";

export interface AppStatistics {
  totalUsers: number;
  vipUsers: number;
  totalMovies: number;
  publishedMovies: number;
  totalSeries: number;
  publishedSeries: number;
  totalEpisodes: number;
  totalViews: number;
  totalComments: number;
  topGenres?: Record<string, number>;
  lastUpdated?: any;
}

/**
 * Obtenir ou créer les statistiques globales
 */
export async function getStatistics(): Promise<AppStatistics> {
  try {
    const statsRef = doc(firestore, "statistics", STATS_DOC_ID);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data() as AppStatistics;
    } else {
      // Initialiser les statistiques si elles n'existent pas
      const initialStats: AppStatistics = {
        totalUsers: 0,
        vipUsers: 0,
        totalMovies: 0,
        publishedMovies: 0,
        totalSeries: 0,
        publishedSeries: 0,
        totalEpisodes: 0,
        totalViews: 0,
        totalComments: 0,
        topGenres: {},
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(statsRef, initialStats);
      return initialStats;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw error;
  }
}

/**
 * Mettre à jour les statistiques
 */
export async function updateStatistics(updates: Partial<Record<keyof AppStatistics, number | FieldValue>>) {
  try {
    const statsRef = doc(firestore, "statistics", STATS_DOC_ID);
    
    // S'assurer que le document existe avant la mise à jour
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      await getStatistics(); // Initialiser les statistiques
    }
    
    // Ajouter le timestamp de mise à jour
    const updatesWithTimestamp = {
      ...updates,
      lastUpdated: serverTimestamp()
    };
    
    // Mettre à jour les statistiques
    await updateDoc(statsRef, updatesWithTimestamp);
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques:", error);
    throw error;
  }
}

/**
 * Incrémenter un genre dans topGenres
 */
export async function incrementGenre(genre: string) {
  try {
    const statsRef = doc(firestore, "statistics", STATS_DOC_ID);
    
    await runTransaction(firestore, async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      
      if (!statsDoc.exists()) {
        // Initialiser les statistiques si elles n'existent pas
        await getStatistics();
        return;
      }
      
      const stats = statsDoc.data() as AppStatistics;
      const topGenres = stats.topGenres || {};
      
      // Incrémenter le compteur pour ce genre
      topGenres[genre] = (topGenres[genre] || 0) + 1;
      
      transaction.update(statsRef, { 
        topGenres,
        lastUpdated: serverTimestamp()
      });
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation du genre ${genre}:`, error);
    throw error;
  }
}

/**
 * Recalculer toutes les statistiques (opération lourde)
 */
export async function recalculateAllStatistics() {
  try {
    // Cette fonction effectuerait un calcul complet de toutes les statistiques
    // en parcourant toutes les collections: users, movies, series, comments, etc.
    // C'est une opération lourde qui devrait être exécutée rarement.
    
    // Le code complet serait assez long, voici un exemple simplifié:
    
    // 1. Compter les utilisateurs
    // const usersSnapshot = await getDocs(collection(firestore, "users"));
    // const totalUsers = usersSnapshot.size;
    // const vipUsers = usersSnapshot.docs.filter(doc => doc.data().role === "vip").length;
    
    // 2. Compter les films
    // const moviesSnapshot = await getDocs(collection(firestore, "movies"));
    // const totalMovies = moviesSnapshot.size;
    // const publishedMovies = moviesSnapshot.docs.filter(doc => doc.data().isPublished).length;
    
    // ... Répéter pour les autres collections
    
    // 3. Compter les vues totales
    // ... Calculer à partir des champs "views" dans les films et séries
    
    // 4. Calculer les genres les plus populaires
    // ... Parcourir tous les films et séries pour compter chaque genre
    
    // 5. Mettre à jour le document de statistiques
    // await setDoc(doc(firestore, "statistics", STATS_DOC_ID), {
    //   totalUsers,
    //   vipUsers,
    //   totalMovies,
    //   publishedMovies,
    //   ... autres statistiques
    //   lastUpdated: serverTimestamp()
    // });
    
    console.log("Recalcul des statistiques terminé");
    return true;
  } catch (error) {
    console.error("Erreur lors du recalcul des statistiques:", error);
    throw error;
  }
}