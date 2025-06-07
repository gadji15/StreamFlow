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

    setLoading(true); // Toujours loading avant le verdict

    // 1. Restaure la session à froid
    supabase.auth.getSession().then(({ data, error }) => {
      // LOG pour diagnostic de session et du localStorage
      console.log('SESSION INIT', {
        data,
        error,
        token: typeof window !== 'undefined' ? localStorage.getItem(Object.keys(localStorage).find(k => k.startsWith('sb-') && k.includes('-auth-token')) || '') : undefined,
        allStorage: typeof window !== 'undefined' ? {...localStorage} : undefined,
      });
      if (ignore) return;
      setUser(data.session?.user ?? null);
      setLoading(false); // On ne passe loading à false qu'après la restauration initiale
    });

    // 2. Met à jour la session à chaud (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (ignore) return;
      setUser(session?.user ?? null);
      // NE PAS mettre setLoading(false) ici : on laisse loading géré uniquement par l'init
    });

    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {/* Bloque le rendu des enfants tant que loading est true */}
      {loading ? null : children}
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