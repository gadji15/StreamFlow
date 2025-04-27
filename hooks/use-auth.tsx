'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile, // Pour mettre à jour le nom d'affichage
  GoogleAuthProvider, // Pour la connexion Google
  signInWithPopup // Pour la connexion Google
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase/config'; // Assurez-vous que ce chemin est correct
import { addActivityLog } from '@/lib/firebase/firestore/activity-logs'; // Assurez-vous que ce chemin est correct

// Types
interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  isVIP: boolean;
  vipExpiry?: Date | null;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: Date;
  lastLoginAt: Date;
  favoriteMovies?: string[];
  favoriteSeries?: string[];
  // Ajoutez d'autres champs si nécessaire (ex: photoURL)
  photoURL?: string | null;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  isLoggedIn: boolean;
  isVIP: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  register: (email: string, password: string, name: string) => Promise<FirebaseUser>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Commencer en chargement

  const isLoggedIn = !!user && !isLoading; // Connecté seulement si user existe ET chargement terminé
  const isVIP = !!userData?.isVIP && (!userData.vipExpiry || new Date(userData.vipExpiry) > new Date());
  const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
  const isSuperAdmin = userData?.role === 'super_admin';

  // Fonction pour récupérer/créer/mettre à jour les données utilisateur dans Firestore
  const manageUserData = useCallback(async (firebaseUser: FirebaseUser) => {
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    let currentData: UserData | null = null;

    if (userDoc.exists()) {
      const data = userDoc.data();
      // Mise à jour du dernier login
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        // Potentiellement mettre à jour displayName et photoURL s'ils ont changé via Google
        displayName: firebaseUser.displayName || data.displayName || 'Utilisateur',
        photoURL: firebaseUser.photoURL || data.photoURL || null,
        email: firebaseUser.email // Assurer que l'email est à jour
      });
      const updatedDoc = await getDoc(userDocRef); // Relire pour avoir les timestamps serveur
      const updatedData = updatedDoc.data();
      currentData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: updatedData?.displayName || 'Utilisateur',
        isVIP: updatedData?.isVIP || false,
        vipExpiry: updatedData?.vipExpiry instanceof Timestamp ? updatedData.vipExpiry.toDate() : null,
        role: updatedData?.role || 'user',
        createdAt: updatedData?.createdAt instanceof Timestamp ? updatedData.createdAt.toDate() : new Date(),
        lastLoginAt: updatedData?.lastLoginAt instanceof Timestamp ? updatedData.lastLoginAt.toDate() : new Date(),
        favoriteMovies: updatedData?.favoriteMovies || [],
        favoriteSeries: updatedData?.favoriteSeries || [],
        photoURL: updatedData?.photoURL || null,
      };
    } else {
      // Créer un nouveau document utilisateur
      const newUserObject = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Utilisateur',
        photoURL: firebaseUser.photoURL || null,
        isVIP: false,
        vipExpiry: null,
        role: 'user', // Rôle par défaut
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        favoriteMovies: [],
        favoriteSeries: []
      };
      await setDoc(userDocRef, newUserObject);
      currentData = {
        ...newUserObject,
        createdAt: new Date(), // Approximation côté client
        lastLoginAt: new Date(), // Approximation côté client
        vipExpiry: null,
      } as UserData; // Type assertion pour les timestamps
    }

    setUserData(currentData);
    return currentData;
  }, []);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    setIsLoading(true); // Mettre en chargement au début
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          await manageUserData(firebaseUser);
        } catch (error) {
          console.error("AuthProvider: Erreur lors de la gestion des données utilisateur:", error);
          setUserData(null); // Réinitialiser les données en cas d'erreur
        }
      } else {
        setUser(null);
        setUserData(null);
        // Optionnel: Nettoyer le localStorage si besoin
        if (typeof window !== 'undefined') {
           localStorage.removeItem('isLoggedIn'); // Ou toute autre clé utilisée
        }
      }
      setIsLoading(false); // Terminer le chargement une fois tout traité
    });

    // Nettoyer l'abonnement lors du démontage
    return () => unsubscribe();
  }, [manageUserData]);

  // Fonction pour rafraîchir manuellement les données utilisateur
  const refreshUserData = useCallback(async () => {
    if (user) {
      try {
        await manageUserData(user);
      } catch (error) {
        console.error("AuthProvider: Erreur lors du rafraîchissement manuel:", error);
      }
    }
  }, [user, manageUserData]);


  // Fonctions d'authentification
  const login = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await manageUserData(userCredential.user); // Gérer les données après connexion

      // Log activity
      await addActivityLog({
        userId: userCredential.user.uid,
        action: 'login',
        entityType: 'user',
        details: `Connexion réussie par email pour ${email}`,
      }).catch(console.error); // Ne pas bloquer si le log échoue

      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true');
      }
      return userCredential.user;
    } catch (error: any) {
      console.error('Erreur de connexion:', error.code, error.message);
      let errorMessage = 'Erreur lors de la connexion.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Le format de l\'email est invalide.';
      }
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Mettre à jour le profil Firebase Auth avec le nom
      await updateProfile(userCredential.user, { displayName: name });
      // Gérer les données utilisateur (créera le doc Firestore)
      await manageUserData(userCredential.user);

      // Log activity
       await addActivityLog({
        userId: userCredential.user.uid,
        action: 'register',
        entityType: 'user',
        details: `Nouveau compte créé pour ${email}`,
      }).catch(console.error);

      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true');
      }
      return userCredential.user;
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error.code, error.message);
      let errorMessage = 'Erreur lors de l\'inscription.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible (minimum 6 caractères).';
      }
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async (): Promise<FirebaseUser> => {
      const provider = new GoogleAuthProvider();
      try {
          const result = await signInWithPopup(auth, provider);
          await manageUserData(result.user); // Gérer les données après connexion

          // Log activity
          await addActivityLog({
            userId: result.user.uid,
            action: 'login_google',
            entityType: 'user',
            details: `Connexion réussie avec Google pour ${result.user.email}`,
          }).catch(console.error);

          if (typeof window !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true');
          }
          return result.user;
      } catch (error: any) {
          console.error('Erreur de connexion Google:', error.code, error.message);
          let errorMessage = 'Erreur lors de la connexion avec Google.';
          if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'Un compte existe déjà avec cet email mais une méthode de connexion différente.';
          } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'La fenêtre de connexion Google a été fermée.';
          } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'Plusieurs fenêtres de connexion ouvertes. Veuillez n\'en utiliser qu\'une.';
          }
          throw new Error(errorMessage);
      }
  };

  const logout = async () => {
    try {
      const userId = user?.uid; // Garder l'ID avant déconnexion
      await firebaseSignOut(auth);
      setUser(null); // Mettre à jour l'état local immédiatement
      setUserData(null);

      // Log activity (si on a l'ID)
      if (userId) {
        await addActivityLog({
          userId: userId,
          action: 'logout',
          entityType: 'user',
          details: `Déconnexion réussie`,
        }).catch(console.error);
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw new Error('Erreur lors de la déconnexion.');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Erreur de réinitialisation MDP:', error.code, error.message);
      let errorMessage = 'Erreur lors de la réinitialisation du mot de passe.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun utilisateur trouvé avec cet email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide.';
      }
      throw new Error(errorMessage);
    }
  };

  // Valeur du contexte
  const value = {
    user,
    userData,
    isLoggedIn,
    isVIP,
    isLoading,
    isAdmin,
    isSuperAdmin,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshUserData,
  };

  // Le Provider qui enveloppe l'application
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}