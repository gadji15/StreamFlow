import { auth, firestore } from "./config";
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User 
} from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";

/**
 * Connexion utilisateur avec email et mot de passe
 */
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return { user };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Déconnexion utilisateur
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Vérifier si l'utilisateur est un administrateur
 */
export async function isAdmin(user: User) {
  try {
    const adminRef = doc(firestore, "admins", user.uid);
    const adminDoc = await getDoc(adminRef);
    
    return adminDoc.exists();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Mettre à jour la dernière connexion de l'administrateur
 */
export async function updateAdminLastLogin(adminId: string) {
  try {
    const adminRef = doc(firestore, "admins", adminId);
    await updateDoc(adminRef, {
      lastLogin: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating admin last login:", error);
    return false;
  }
}

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}