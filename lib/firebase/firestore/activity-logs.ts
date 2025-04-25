import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where,
  QueryConstraint,
  Timestamp
} from "firebase/firestore";
import { firestore } from "../config";

// Types
export interface ActivityLog {
  id?: string;
  action: "create" | "update" | "delete" | "login" | "logout" | "view";
  entityType: "movie" | "series" | "episode" | "user" | "admin" | "comment";
  entityId: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

// Collection de référence
const COLLECTION = "activity_logs";

// Ajouter une entrée de journal d'activité
export const addActivityLog = async (log: Omit<ActivityLog, "id">): Promise<ActivityLog> => {
  try {
    const docRef = await addDoc(collection(firestore, COLLECTION), {
      ...log,
      timestamp: log.timestamp || new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...log
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout du journal d'activité:", error);
    throw error;
  }
};

// Récupérer les journaux d'activité récents
export const getRecentActivityLogs = async (count: number = 10): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION),
      orderBy("timestamp", "desc"),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActivityLog));
  } catch (error) {
    console.error("Erreur lors de la récupération des journaux d'activité récents:", error);
    throw error;
  }
};

// Récupérer les journaux d'activité avec filtres
export const getActivityLogs = async (
  options: {
    action?: ActivityLog["action"],
    entityType?: ActivityLog["entityType"],
    entityId?: string,
    performedBy?: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number,
    page?: number
  } = {}
): Promise<{logs: ActivityLog[], total: number}> => {
  try {
    const constraints: QueryConstraint[] = [];
    const {
      action,
      entityType,
      entityId,
      performedBy,
      startDate,
      endDate,
      limit: limitCount = 20,
      page = 1
    } = options;
    
    // Ajouter les filtres si présents
    if (action) {
      constraints.push(where("action", "==", action));
    }
    
    if (entityType) {
      constraints.push(where("entityType", "==", entityType));
    }
    
    if (entityId) {
      constraints.push(where("entityId", "==", entityId));
    }
    
    if (performedBy) {
      constraints.push(where("performedBy", "==", performedBy));
    }
    
    if (startDate) {
      constraints.push(where("timestamp", ">=", startDate.toISOString()));
    }
    
    if (endDate) {
      constraints.push(where("timestamp", "<=", endDate.toISOString()));
    }
    
    // Ajouter le tri par date décroissante
    constraints.push(orderBy("timestamp", "desc"));
    
    // Calculer l'offset pour la pagination
    const offset = (page - 1) * limitCount;
    
    // Récupérer le total pour la pagination
    const totalQuery = query(collection(firestore, COLLECTION), ...constraints);
    const totalSnapshot = await getDocs(totalQuery);
    const total = totalSnapshot.size;
    
    // Ajouter la limite pour la pagination
    constraints.push(limit(limitCount));
    
    // Construire la requête finale
    const q = query(collection(firestore, COLLECTION), ...constraints);
    
    // Exécuter la requête
    const querySnapshot = await getDocs(q);
    
    // Transformer les données
    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActivityLog));
    
    return {
      logs: logs.slice(offset, offset + limitCount),
      total
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des journaux d'activité:", error);
    throw error;
  }
};