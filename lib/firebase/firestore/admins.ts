import { firestore, storage } from "../config";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Interface pour les administrateurs
interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'content_manager' | 'moderator';
  avatar?: string;
  isActive: boolean;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}

/**
 * Vérifier si un utilisateur est administrateur
 */
export async function verifyAdmin(uid: string) {
  try {
    const adminRef = doc(firestore, "admins", uid);
    const adminDoc = await getDoc(adminRef);
    
    if (adminDoc.exists()) {
      const adminData = adminDoc.data() as Omit<Admin, 'id'>;
      
      if (!adminData.isActive) {
        return { isAdmin: false, message: "Compte administrateur désactivé" };
      }
      
      return { 
        isAdmin: true, 
        adminData: {
          id: adminDoc.id,
          ...adminData
        } 
      };
    }
    
    return { isAdmin: false, message: "Utilisateur non trouvé dans les administrateurs" };
  } catch (error) {
    console.error("Error verifying admin:", error);
    return { isAdmin: false, message: "Erreur lors de la vérification de l'administrateur" };
  }
}

/**
 * Obtenir un administrateur par son ID
 */
export async function getAdmin(adminId: string) {
  try {
    const adminRef = doc(firestore, "admins", adminId);
    const adminDoc = await getDoc(adminRef);
    
    if (adminDoc.exists()) {
      return {
        id: adminDoc.id,
        ...adminDoc.data()
      } as Admin;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting admin:", error);
    return null;
  }
}

/**
 * Récupérer la liste des administrateurs
 */
export async function getAdmins() {
  try {
    const adminsRef = collection(firestore, "admins");
    const adminsSnapshot = await getDocs(adminsRef);
    
    return adminsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Admin));
  } catch (error) {
    console.error("Error getting admins:", error);
    return [];
  }
}