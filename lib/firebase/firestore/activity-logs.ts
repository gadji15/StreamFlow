import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp, 
  DocumentData,
  startAfter,
  QueryDocumentSnapshot,
  QueryConstraint
} from "firebase/firestore";
import { firestore } from "../config";

// Type pour l'activité
export interface ActivityLog {
  id?: string;
  type: 'auth' | 'movie' | 'series' | 'user' | 'admin' | 'comment' | 'favorite' | 'vip';
  action: string;
  userId?: string;
  userEmail?: string;
  adminId?: string;
  adminEmail?: string;
  entityId?: string;
  entityType?: string;
  details?: any;
  timestamp?: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

// Ajouter une entrée de journal d'activité
export async function addActivityLog(activity: ActivityLog): Promise<string | null> {
  try {
    const activityData = {
      ...activity,
      timestamp: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(firestore, "activity_logs"), activityData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding activity log:", error);
    return null;
  }
}

// Obtenir les activités récentes avec pagination
export async function getRecentActivities(
  pageSize = 10,
  lastVisible?: QueryDocumentSnapshot<DocumentData>
): Promise<{ logs: ActivityLog[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const constraints: QueryConstraint[] = [
      orderBy("timestamp", "desc"),
      limit(pageSize)
    ];
    
    // Si lastVisible est fourni, appliquer la pagination
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    const q = query(collection(firestore, "activity_logs"), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const logs: ActivityLog[] = [];
    let newLastVisible = null;
    
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data()
        } as ActivityLog);
      });
      
      // Conserver le dernier document visible pour la pagination
      newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
    
    return { logs, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error getting recent activities:", error);
    return { logs: [], lastVisible: null };
  }
}

// Obtenir les activités filtrées
export async function getFilteredActivities(
  filters: {
    type?: ActivityLog['type'] | ActivityLog['type'][];
    action?: string | string[];
    userId?: string;
    adminId?: string;
    entityId?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  },
  pageSize = 10,
  lastVisible?: QueryDocumentSnapshot<DocumentData>
): Promise<{ logs: ActivityLog[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const constraints: QueryConstraint[] = [
      orderBy("timestamp", "desc")
    ];
    
    // Appliquer les filtres
    if (filters.type) {
      if (Array.isArray(filters.type)) {
        constraints.push(where("type", "in", filters.type));
      } else {
        constraints.push(where("type", "==", filters.type));
      }
    }
    
    if (filters.action) {
      if (Array.isArray(filters.action)) {
        constraints.push(where("action", "in", filters.action));
      } else {
        constraints.push(where("action", "==", filters.action));
      }
    }
    
    if (filters.userId) {
      constraints.push(where("userId", "==", filters.userId));
    }
    
    if (filters.adminId) {
      constraints.push(where("adminId", "==", filters.adminId));
    }
    
    if (filters.entityId) {
      constraints.push(where("entityId", "==", filters.entityId));
    }
    
    if (filters.entityType) {
      constraints.push(where("entityType", "==", filters.entityType));
    }
    
    if (filters.startDate) {
      constraints.push(where("timestamp", ">=", Timestamp.fromDate(filters.startDate)));
    }
    
    if (filters.endDate) {
      constraints.push(where("timestamp", "<=", Timestamp.fromDate(filters.endDate)));
    }
    
    // Ajouter la limite pour la pagination
    constraints.push(limit(pageSize));
    
    // Si lastVisible est fourni, appliquer la pagination
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    const q = query(collection(firestore, "activity_logs"), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const logs: ActivityLog[] = [];
    let newLastVisible = null;
    
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data()
        } as ActivityLog);
      });
      
      // Conserver le dernier document visible pour la pagination
      newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
    
    return { logs, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error getting filtered activities:", error);
    return { logs: [], lastVisible: null };
  }
}

// Obtenir les activités d'un utilisateur
export async function getUserActivities(
  userId: string,
  pageSize = 10,
  lastVisible?: QueryDocumentSnapshot<DocumentData>
): Promise<{ logs: ActivityLog[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const constraints: QueryConstraint[] = [
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(pageSize)
    ];
    
    // Si lastVisible est fourni, appliquer la pagination
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    const q = query(collection(firestore, "activity_logs"), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const logs: ActivityLog[] = [];
    let newLastVisible = null;
    
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data()
        } as ActivityLog);
      });
      
      // Conserver le dernier document visible pour la pagination
      newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
    
    return { logs, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error getting user activities:", error);
    return { logs: [], lastVisible: null };
  }
}