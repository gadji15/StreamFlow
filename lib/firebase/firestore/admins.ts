import { firestore } from "../config";
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// Interface pour le type Admin
export interface Admin {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

/**
 * Récupère un administrateur par son email
 */
export async function getAdminByEmail(email: string): Promise<Admin | null> {
  try {
    const q = query(
      collection(firestore, "admins"),
      where("email", "==", email)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const adminDoc = querySnapshot.docs[0];
    
    return {
      id: adminDoc.id,
      ...adminDoc.data(),
      createdAt: adminDoc.data().createdAt?.toDate(),
      updatedAt: adminDoc.data().updatedAt?.toDate(),
      lastLogin: adminDoc.data().lastLogin?.toDate()
    } as Admin;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'admin par email:", error);
    return null;
  }
}

/**
 * Récupère un administrateur par son ID
 */
export async function getAdminById(id: string): Promise<Admin | null> {
  try {
    const adminDoc = await getDoc(doc(firestore, "admins", id));
    
    if (!adminDoc.exists()) {
      return null;
    }
    
    return {
      id: adminDoc.id,
      ...adminDoc.data(),
      createdAt: adminDoc.data().createdAt?.toDate(),
      updatedAt: adminDoc.data().updatedAt?.toDate(),
      lastLogin: adminDoc.data().lastLogin?.toDate()
    } as Admin;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'admin ${id}:`, error);
    return null;
  }
}

/**
 * Crée un nouvel administrateur
 */
export async function createAdmin(userId: string, adminData: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
  try {
    const timestamp = serverTimestamp();
    
    await setDoc(doc(firestore, "admins", userId), {
      ...adminData,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error);
    return false;
  }
}

/**
 * Met à jour un administrateur
 */
export async function updateAdmin(id: string, adminData: Partial<Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "admins", id), {
      ...adminData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'admin ${id}:`, error);
    return false;
  }
}

/**
 * Met à jour la date de dernière connexion d'un admin
 */
export async function updateAdminLastLogin(id: string): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "admins", id), {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la dernière connexion de l'admin ${id}:`, error);
    return false;
  }
}