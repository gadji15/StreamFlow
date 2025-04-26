'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  signIn, 
  signInWithGoogle, 
  signOut, 
  register, 
  resetPassword,
  onAuthChange,
  getUserData,
  UserData
} from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isVIP: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<boolean>;
  signup: (email: string, password: string, displayName: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVIP, setIsVIP] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Observer l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setLoading(true);
      setUser(user);
      
      if (user) {
        try {
          // Récupérer les données utilisateur
          const userData = await getUserData(user.uid);
          setUserData(userData);
          
          // Vérifier les rôles
          if (userData) {
            setIsAdmin(userData.role === 'admin' || userData.role === 'super_admin');
            setIsVIP(userData.role === 'vip' && userData.vipUntil && userData.vipUntil.toDate() > new Date());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
        setIsVIP(false);
      }
      
      setLoading(false);
    });
    
    // Nettoyage
    return () => unsubscribe();
  }, []);

  // Fonctions d'authentification
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Échec de connexion",
          description: result.error,
          variant: "destructive"
        });
        return false;
      }
      
      // Authentification réussie
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur StreamFlow!"
      });
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Échec de connexion",
          description: result.error,
          variant: "destructive"
        });
        return false;
      }
      
      // Authentification réussie
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur StreamFlow!"
      });
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur StreamFlow!"
      });
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await register(email, password, displayName);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Échec d'inscription",
          description: result.error,
          variant: "destructive"
        });
        return false;
      }
      
      // Inscription réussie
      toast({
        title: "Inscription réussie",
        description: "Bienvenue sur StreamFlow! Vous pouvez maintenant vous connecter."
      });
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await resetPassword(email);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Échec",
          description: result.error,
          variant: "destructive"
        });
        return false;
      }
      
      // Email envoyé avec succès
      toast({
        title: "Email envoyé",
        description: "Veuillez vérifier votre boîte de réception pour réinitialiser votre mot de passe."
      });
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir les données utilisateur
  const refreshUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      const userData = await getUserData(user.uid);
      setUserData(userData);
      
      // Mettre à jour les rôles
      if (userData) {
        setIsAdmin(userData.role === 'admin' || userData.role === 'super_admin');
        setIsVIP(userData.role === 'vip' && userData.vipUntil && userData.vipUntil.toDate() > new Date());
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [user]);

  // Valeurs du context
  const value = {
    user,
    userData,
    loading,
    error,
    isAdmin,
    isVIP,
    login,
    loginWithGoogle,
    logout,
    signup,
    forgotPassword,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}