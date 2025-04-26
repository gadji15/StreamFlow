import { firestore } from "../config";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { auth } from "../config";

export type ActivityAction = 
  | "login" 
  | "logout" 
  | "register" 
  | "password_reset" 
  | "profile_update"
  | "content_view" 
  | "content_create" 
  | "content_update" 
  | "content_delete"
  | "comment_create" 
  | "comment_update" 
  | "comment_delete"
  | "favorite_add" 
  | "favorite_remove"
  | "vip_subscribe" 
  | "vip_renew" 
  | "vip_cancel" 
  | "vip_expired"
  | "admin_action";

export type EntityType = 
  | "user" 
  | "movie" 
  | "series" 
  | "episode" 
  | "comment" 
  | "favorite"
  | "system";

export interface ActivityLog {
  id?: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  timestamp?: Timestamp;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Ajouter une activité au journal
 */
export async function logActivity(activity: Omit<ActivityLog, 'timestamp' | 'id'>) {
  try {
    // Obtenir l'utilisateur actuel s'il est connecté
    const currentUser = auth.currentUser;
    let userInfo = {};
    
    if (currentUser) {
      userInfo = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
      };
    }
    
    // Ajouter l'activité dans Firestore
    const activityData = {
      ...activity,
      ...userInfo,
      timestamp: serverTimestamp(),
    };
    
    // Ajouter des informations supplémentaires si disponibles dans le navigateur
    if (typeof window !== 'undefined') {
      activityData.ipAddress = 'client-side'; // Remplacé côté serveur
      activityData.userAgent = navigator.userAgent;
    }
    
    const docRef = await addDoc(collection(firestore, "activity_logs"), activityData);
    return { id: docRef.id, ...activityData };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'activité:", error);
    return null;
  }
}

/**
 * Récupérer les activités récentes
 */
export async function getRecentActivities(limit: number = 20) {
  try {
    const q = query(
      collection(firestore, "activity_logs"),
      orderBy("timestamp", "desc"),
      limit(limit)
    );
    
    const snapshot = await getDocs(q);
    const activities: ActivityLog[] = [];
    
    snapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      } as ActivityLog);
    });
    
    return activities;
  } catch (error) {
    console.error("Erreur lors de la récupération des activités récentes:", error);
    return [];
  }
}

/**
 * Récupérer les activités d'un utilisateur
 */
export async function getUserActivities(userId: string, limit: number = 20) {
  try {
    const q = query(
      collection(firestore, "activity_logs"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limit)
    );
    
    const snapshot = await getDocs(q);
    const activities: ActivityLog[] = [];
    
    snapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      } as ActivityLog);
    });
    
    return activities;
  } catch (error) {
    console.error("Erreur lors de la récupération des activités utilisateur:", error);
    return [];
  }
}

/**
 * Récupérer les activités filtrées
 */
export async function getFilteredActivities(
  filters: {
    action?: ActivityAction;
    entityType?: EntityType;
    entityId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  },
  limitCount: number = 50
) {
  try {
    let q = query(
      collection(firestore, "activity_logs"),
      orderBy("timestamp", "desc")
    );
    
    // Appliquer les filtres
    if (filters.action) {
      q = query(q, where("action", "==", filters.action));
    }
    
    if (filters.entityType) {
      q = query(q, where("entityType", "==", filters.entityType));
    }
    
    if (filters.entityId) {
      q = query(q, where("entityId", "==", filters.entityId));
    }
    
    if (filters.userId) {
      q = query(q, where("userId", "==", filters.userId));
    }
    
    // Appliquer la limite
    q = query(q, limit(limitCount));
    
    const snapshot = await getDocs(q);
    const activities: ActivityLog[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Filtrer par date côté client si nécessaire
      if (filters.startDate && data.timestamp && 
          data.timestamp.toDate() < filters.startDate) {
        return;
      }
      
      if (filters.endDate && data.timestamp && 
          data.timestamp.toDate() > filters.endDate) {
        return;
      }
      
      activities.push({
        id: doc.id,
        ...data
      } as ActivityLog);
    });
    
    return activities;
  } catch (error) {
    console.error("Erreur lors de la récupération des activités filtrées:", error);
    return [];
  }
}