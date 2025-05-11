'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { signInWithEmail } from '@/lib/supabaseAuth';

type AuthContextType = {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fonction login exposée au context
  const login = async (email: string, password: string) => {
    const { data, error } = await signInWithEmail(email, password);
    // Ajout du log pour diagnostic
    console.log('LOGIN RESULT', { data, error });
    if (error || !data.session) {
      throw error || new Error('Aucune session');
    }
    // Synchronise le context d'auth immédiatement après login
    const sessionResult = await supabase.auth.getSession();
    setUser(sessionResult.data.session?.user ?? null);
    return data.user;
  };

  useEffect(() => {
    let ignore = false;

    // Initial session load
    supabase.auth.getSession().then(({ data }) => {
      if (!ignore) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });

    // Listen for session changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ignore) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
}

// Nouveau hook conseillé pour l'usage dans la page de login
export function useAuth() {
  return useContext(AuthContext);
}

// Compatibilité si d'autres parties du code utilisent useAuthContext
export function useAuthContext() {
  return useContext(AuthContext);
}