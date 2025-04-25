import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential,
  User
} from "firebase/auth";
import { auth } from "./config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "./config";
import { addActivityLog } from "./firestore/activity-logs";

// Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "content_manager";
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

// Authentification

export const signIn = async (email: string, password: string): Promise<AdminUser | null> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Vérifier si l'utilisateur est un administrateur
    const adminDoc = await getDoc(doc(firestore, "admins", user.uid));
    
    if (adminDoc.exists()) {
      const adminData = adminDoc.data() as Omit<AdminUser, "id">;
      
      // Mettre à jour la dernière connexion
      await setDoc(
        doc(firestore, "admins", user.uid),
        { lastLogin: new Date().toISOString() },
        { merge: true }
      );
      
      // Journaliser la connexion
      await addActivityLog({
        action: "login",
        entityType: "admin",
        entityId: user.uid,
        details: `Connexion de l'administrateur ${adminData.email}`,
        performedBy: user.uid,
        timestamp: new Date().toISOString()
      });
      
      // Retourner les données de l'administrateur
      return {
        id: user.uid,
        ...adminData,
      };
    } else {
      // Si l'utilisateur n'est pas un administrateur, le déconnecter
      await firebaseSignOut(auth);
      return null;
    }
  } catch (error) {
    console.error("Erreur de connexion:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  const user = auth.currentUser;
  if (user) {
    // Journaliser la déconnexion
    await addActivityLog({
      action: "logout",
      entityType: "admin",
      entityId: user.uid,
      details: `Déconnexion de l'administrateur`,
      performedBy: user.uid,
      timestamp: new Date().toISOString()
    });
  }
  
  return firebaseSignOut(auth);
};

export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    const adminDoc = await getDoc(doc(firestore, "admins", user.uid));
    
    if (adminDoc.exists()) {
      const adminData = adminDoc.data() as Omit<AdminUser, "id">;
      return {
        id: user.uid,
        ...adminData,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'administrateur:", error);
    return null;
  }
};

export const createAdmin = async (
  email: string,
  password: string,
  name: string,
  role: AdminUser["role"] = "content_manager"
): Promise<AdminUser> => {
  try {
    // Créer un compte utilisateur Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Données de l'administrateur
    const adminData: Omit<AdminUser, "id"> = {
      email,
      name,
      role,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    // Stocker les données de l'administrateur dans Firestore
    await setDoc(doc(firestore, "admins", user.uid), adminData);
    
    // Journaliser la création d'un nouvel administrateur
    const currentUser = auth.currentUser;
    if (currentUser) {
      await addActivityLog({
        action: "create",
        entityType: "admin",
        entityId: user.uid,
        details: `Création d'un nouvel administrateur: ${name} (${email})`,
        performedBy: currentUser.uid,
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      id: user.uid,
      ...adminData
    };
  } catch (error) {
    console.error("Erreur lors de la création de l'administrateur:", error);
    throw error;
  }
};

// Observer l'état d'authentification
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};