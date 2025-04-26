import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  increment,
  Timestamp,
  FieldValue
} from "firebase/firestore";
import { firestore } from "../config";

// Type pour les statistiques
export interface Statistics {
  id?: string;
  totalUsers: number;
  activeUsers: number;
  vipUsers: number;
  totalMovies: number;
  publishedMovies: number;
  totalSeries: number;
  publishedSeries: number;
  totalViews: number;
  totalComments: number;
  topGenres: { [genre: string]: number };
  lastUpdated: Timestamp;
}

// Obtenir les statistiques actuelles
export async function getStatistics(): Promise<Statistics | null> {
  try {
    const statsDoc = await getDoc(doc(firestore, "statistics", "main"));
    
    if (statsDoc.exists()) {
      return statsDoc.data() as Statistics;
    } else {
      // Créer un document de statistiques par défaut si inexistant
      const defaultStats: Statistics = {
        totalUsers: 0,
        activeUsers: 0,
        vipUsers: 0,
        totalMovies: 0,
        publishedMovies: 0,
        totalSeries: 0,
        publishedSeries: 0,
        totalViews: 0,
        totalComments: 0,
        topGenres: {},
        lastUpdated: Timestamp.now()
      };
      
      await setDoc(doc(firestore, "statistics", "main"), defaultStats);
      return defaultStats;
    }
  } catch (error) {
    console.error("Error getting statistics:", error);
    return null;
  }
}

// Mettre à jour les statistiques (incrémentations ou valeurs spécifiques)
export async function updateStatistics(updates: {
  [key: string]: number | FieldValue;
}): Promise<boolean> {
  try {
    const statsRef = doc(firestore, "statistics", "main");
    
    // Vérifier si le document existe déjà
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      // Ajouter timestamp de mise à jour
      await updateDoc(statsRef, {
        ...updates,
        lastUpdated: Timestamp.now()
      });
    } else {
      // Créer un document de statistiques par défaut avec les mises à jour
      const defaultStats: any = {
        totalUsers: 0,
        activeUsers: 0,
        vipUsers: 0,
        totalMovies: 0,
        publishedMovies: 0,
        totalSeries: 0,
        publishedSeries: 0,
        totalViews: 0,
        totalComments: 0,
        topGenres: {},
        lastUpdated: Timestamp.now()
      };
      
      // Appliquer les mises à jour
      Object.keys(updates).forEach(key => {
        if (updates[key] instanceof FieldValue) {
          // Si c'est un increment, utiliser la valeur de base
          defaultStats[key] = 0;
        } else {
          defaultStats[key] = updates[key];
        }
      });
      
      await setDoc(statsRef, defaultStats);
    }
    
    return true;
  } catch (error) {
    console.error("Error updating statistics:", error);
    return false;
  }
}

// Incrémenter un genre dans les statistiques topGenres
export async function incrementGenreStat(genre: string): Promise<boolean> {
  try {
    const statsRef = doc(firestore, "statistics", "main");
    
    await runTransaction(firestore, async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      
      if (!statsDoc.exists()) {
        // Créer un document de statistiques par défaut
        const defaultStats: Statistics = {
          totalUsers: 0,
          activeUsers: 0,
          vipUsers: 0,
          totalMovies: 0,
          publishedMovies: 0,
          totalSeries: 0,
          publishedSeries: 0,
          totalViews: 0,
          totalComments: 0,
          topGenres: { [genre]: 1 },
          lastUpdated: Timestamp.now()
        };
        
        transaction.set(statsRef, defaultStats);
        return;
      }
      
      // Mettre à jour le compteur de genre
      const stats = statsDoc.data() as Statistics;
      const topGenres = stats.topGenres || {};
      
      if (topGenres[genre]) {
        topGenres[genre] += 1;
      } else {
        topGenres[genre] = 1;
      }
      
      transaction.update(statsRef, { 
        topGenres,
        lastUpdated: Timestamp.now()
      });
    });
    
    return true;
  } catch (error) {
    console.error("Error incrementing genre stat:", error);
    return false;
  }
}

// Recalculer entièrement les statistiques (opération coûteuse, à utiliser avec parcimonie)
export async function recalculateStatistics(): Promise<boolean> {
  // Cette fonction devrait être exécutée périodiquement, par exemple via Cloud Functions
  // Elle est coûteuse en termes de lecture/écriture Firestore
  // Implémentation omise pour simplifier
  return true;
}