import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  updatePassword,
  User,
  UserCredential
} from "firebase/auth";
import { auth } from "./config";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Convertir Firebase User en AuthUser
export const formatUser = (user: User): AuthUser => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
};

// S'inscrire avec email et mot de passe
export const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  displayName: string
): Promise<AuthUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    await sendEmailVerification(userCredential.user);
    return formatUser(userCredential.user);
  } catch (error: any) {
    throw new Error(`Erreur d'inscription: ${error.message}`);
  }
};

// Se connecter avec email et mot de passe
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return formatUser(userCredential.user);
  } catch (error: any) {
    throw new Error(`Erreur de connexion: ${error.message}`);
  }
};

// Déconnexion
export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

// Réinitialiser le mot de passe
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(`Erreur de réinitialisation de mot de passe: ${error.message}`);
  }
};

// Mettre à jour le mot de passe
export const changePassword = async (user: User, newPassword: string): Promise<void> => {
  try {
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(`Erreur de changement de mot de passe: ${error.message}`);
  }
};

// Mettre à jour le profil
export const updateUserProfile = async (
  user: User,
  data: { displayName?: string; photoURL?: string }
): Promise<void> => {
  try {
    await updateProfile(user, data);
  } catch (error: any) {
    throw new Error(`Erreur de mise à jour du profil: ${error.message}`);
  }
};

// Vérifier si l'utilisateur est administrateur
export const verifyAdminRole = async (uid: string): Promise<boolean> => {
  try {
    // Implémentez votre logique de vérification des rôles d'administrateur ici
    // Généralement, vous consulteriez une collection spéciale d'administrateurs dans Firestore
    
    // Exemple simplifié:
    const adminCheck = await fetch(`/api/admin/verify?uid=${uid}`);
    const { isAdmin } = await adminCheck.json();
    
    return isAdmin;
  } catch (error) {
    console.error("Erreur lors de la vérification du rôle d'administrateur:", error);
    return false;
  }
};

// Récupérer l'utilisateur actuel formaté
export const getCurrentUser = (): AuthUser | null => {
  const user = auth.currentUser;
  return user ? formatUser(user) : null;
};