import { auth, firestore } from "./config";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
  UserCredential
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { logActivity } from "./firestore/activity-logs";

export type UserRole = "user" | "vip" | "admin" | "super_admin";

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  vipUntil?: Timestamp;
}

/**
 * S'inscrire avec email et mot de passe
 */
export async function register(email: string, password: string, displayName: string) {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil avec le nom d'affichage
    await updateProfile(user, { displayName });
    
    // Stocker les informations utilisateur dans Firestore
    const userData: Omit<UserData, 'uid'> = {
      email: user.email!,
      displayName: displayName,
      photoURL: user.photoURL || null,
      role: "user",
      isActive: true,
      createdAt: Timestamp.now(),
    };
    
    await setDoc(doc(firestore, "users", user.uid), userData);
    
    return { user, userData: { uid: user.uid, ...userData } };
  } catch (error: any) {
    let message = "Une erreur s'est produite lors de l'inscription.";
    
    if (error.code === "auth/email-already-in-use") {
      message = "Cette adresse email est déjà utilisée.";
    } else if (error.code === "auth/invalid-email") {
      message = "L'adresse email n'est pas valide.";
    } else if (error.code === "auth/weak-password") {
      message = "Le mot de passe est trop faible.";
    }
    
    return { error: message };
  }
}

/**
 * Se connecter avec email et mot de passe
 */
export async function signIn(email: string, password: string) {
  try {
    // Connexion avec Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    let userData: UserData | null = null;
    
    if (userDoc.exists()) {
      userData = { uid: user.uid, ...userDoc.data() } as UserData;
      
      // Vérifier si l'utilisateur est actif
      if (!userData.isActive) {
        await firebaseSignOut(auth);
        return { error: "Ce compte a été désactivé." };
      }
      
      // Mettre à jour la dernière connexion
      await updateDoc(doc(firestore, "users", user.uid), {
        lastLogin: serverTimestamp()
      });
    } else {
      // Créer un document utilisateur s'il n'existe pas (rare)
      userData = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        role: "user",
        isActive: true,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };
      await setDoc(doc(firestore, "users", user.uid), userData);
    }
    
    return { user, userData };
  } catch (error: any) {
    let message = "Échec de connexion.";
    
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      message = "Email ou mot de passe incorrect.";
    } else if (error.code === "auth/too-many-requests") {
      message = "Trop de tentatives. Veuillez réessayer plus tard.";
    } else if (error.code === "auth/user-disabled") {
      message = "Ce compte a été désactivé.";
    }
    
    return { error: message };
  }
}

/**
 * Se connecter avec Google
 */
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Vérifier si l'utilisateur existe déjà
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    let userData: UserData | null = null;
    
    if (userDoc.exists()) {
      userData = { uid: user.uid, ...userDoc.data() } as UserData;
      
      // Vérifier si l'utilisateur est actif
      if (!userData.isActive) {
        await firebaseSignOut(auth);
        return { error: "Ce compte a été désactivé." };
      }
      
      // Mettre à jour la dernière connexion
      await updateDoc(doc(firestore, "users", user.uid), {
        lastLogin: serverTimestamp(),
        // Mettre à jour les informations qui pourraient avoir changé
        displayName: user.displayName,
        photoURL: user.photoURL
      });
    } else {
      // Créer un nouveau profil utilisateur
      userData = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        role: "user",
        isActive: true,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };
      await setDoc(doc(firestore, "users", user.uid), userData);
    }
    
    return { user, userData };
  } catch (error: any) {
    let message = "Échec de connexion avec Google.";
    
    if (error.code === "auth/popup-closed-by-user") {
      message = "Connexion annulée.";
    }
    
    return { error: message };
  }
}

/**
 * Se déconnecter
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
 * Réinitialiser le mot de passe
 */
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    let message = "Échec de l'envoi de l'email de réinitialisation.";
    
    if (error.code === "auth/user-not-found") {
      message = "Aucun compte avec cette adresse email.";
    } else if (error.code === "auth/invalid-email") {
      message = "L'adresse email n'est pas valide.";
    }
    
    return { error: message };
  }
}

/**
 * Mettre à jour le profile utilisateur
 */
export async function updateUserProfile(user: User, data: { displayName?: string, photoURL?: string }) {
  try {
    // Mettre à jour le profil dans Firebase Auth
    await updateProfile(user, data);
    
    // Mettre à jour les données dans Firestore
    await updateDoc(doc(firestore, "users", user.uid), {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Vérifier si l'utilisateur a un rôle spécifique
 */
export async function hasRole(user: User, requiredRole: UserRole): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data() as Omit<UserData, 'uid'>;
    
    // Vérifier si l'utilisateur est actif
    if (!userData.isActive) return false;
    
    // Vérifier le rôle
    const role = userData.role;
    
    // Super admins peuvent tout faire
    if (role === "super_admin") return true;
    
    // Admins peuvent faire tout sauf ce qui est réservé aux super admins
    if (role === "admin" && requiredRole !== "super_admin") return true;
    
    // VIP peuvent accéder au contenu VIP
    if (role === "vip" && requiredRole === "vip") {
      // Vérifier si l'abonnement VIP est toujours valide
      if (userData.vipUntil && userData.vipUntil.toDate() > new Date()) {
        return true;
      }
      
      // L'abonnement VIP a expiré
      await updateDoc(doc(firestore, "users", user.uid), {
        role: "user",
      });
      
      logActivity({
        action: "vip_expired",
        entityType: "user",
        entityId: user.uid,
        details: {
          previousExpiry: userData.vipUntil
        }
      });
      
      return false;
    }
    
    // Autrement, le rôle doit correspondre exactement
    return role === requiredRole;
  } catch (error) {
    console.error("Erreur lors de la vérification du rôle:", error);
    return false;
  }
}

/**
 * Hook pour observer l'état d'authentification de l'utilisateur
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Vérifier si l'utilisateur est un administrateur
 */
export async function isAdmin(user: User) {
  return hasRole(user, "admin") || hasRole(user, "super_admin");
}

/**
 * Vérifier si l'utilisateur est un VIP
 */
export async function isVIP(user: User) {
  return hasRole(user, "vip");
}

/**
 * Obtenir les données complètes de l'utilisateur
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(firestore, "users", userId));
    
    if (!userDoc.exists()) return null;
    
    return { uid: userId, ...userDoc.data() } as UserData;
  } catch (error) {
    console.error("Erreur lors de la récupération des données utilisateur:", error);
    return null;
  }
}