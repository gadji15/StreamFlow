'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, LogIn, Mail } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  // Handle email/password login via context/provider
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (error: any) {
      setErrorMsg(error.message || "Erreur lors de la connexion.");
    }
    setLoading(false);
  };

  // Handle Google OAuth login
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    setGoogleLoading(false);
    if (error) {
      setErrorMsg(error.message || "Erreur lors de la connexion avec Google.");
    }
    // Redirection automatique gérée par Supabase si nécessaire
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 px-2 mt-8 md:mt-12">
      <div className="w-[95vw] max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-gray-900/95 rounded-2xl shadow-2xl p-0 border border-gray-800 flex flex-col md:flex-row overflow-hidden mx-auto">
        {/* Section gauche : Connexion */}
        <div className="flex-1 p-4 md:p-8 flex flex-col justify-center">
          <h1 className="text-2xl font-bold mb-1 text-center flex items-center gap-2 justify-center">
            <LogIn className="w-6 h-6 text-primary" /> Connexion
          </h1>
          <p className="text-center text-gray-400 mb-6">Connectez-vous à votre compte StreamFlow</p>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 text-gray-200 border-gray-700 hover:bg-gray-700/70 transition mb-5"
            disabled={googleLoading}
            aria-label="Connexion avec Google"
          >
            <FcGoogle className="h-5 w-5 mr-2" />
            {googleLoading ? "Connexion..." : "Se connecter avec Google"}
          </Button>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="px-3 text-gray-500 text-xs">Ou avec votre email</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            autoComplete="off"
          >
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1 text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  required
                  placeholder="Adresse email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1 text-gray-300">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                  tabIndex={-1}
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  disabled={loading || googleLoading}
                >
                  {showPwd ? (
                    // EyeOff icon
                    <svg width="20" height="20" fill="none" stroke="currentColor"><path d="M13.875 18.825a10.05 10.05 0 01-3.875.675C4.6 19.5 1 13 1 13s1.95-3.45 5.4-6.075M6.125 5.175a10.05 10.05 0 013.875-.675C15.4 4.5 19 11 19 11s-1.95 3.45-5.4 6.075" strokeWidth="1.5" /><path d="M1 1l18 18" strokeWidth="1.5"/></svg>
                  ) : (
                    // Eye icon
                    <svg width="20" height="20" fill="none" stroke="currentColor"><ellipse cx="10" cy="10" rx="8" ry="5" strokeWidth="1.5"/><circle cx="10" cy="10" r="2" strokeWidth="1.5"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-2 flex justify-end">
              <a href="/mot-de-passe-oublie" className="text-xs text-primary hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            {errorMsg && (
              <div className="bg-red-900/80 text-red-300 rounded p-2 mb-3 text-sm">{errorMsg}</div>
            )}

            <Button
              type="submit"
              className="w-full flex items-center justify-center font-semibold"
              disabled={loading || googleLoading}
            >
              {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
              Se connecter
            </Button>

            <div className="text-center text-sm text-gray-400 mt-4">
              Pas encore de compte ?{" "}
              <a href="/inscription" className="text-primary hover:underline font-semibold">
                S'inscrire
              </a>
            </div>
          </form>
        </div>
        {/* Section droite : Informations (desktop uniquement) */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-gray-800 p-6 lg:p-10 flex-1">
          <div className="max-w-xs mx-auto text-center">
            <LogIn className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-white">Bienvenue sur StreamFlow !</h2>
            <p className="text-gray-300 mb-6">
              Créez un compte pour accéder à :
            </p>
            <ul className="text-left text-gray-400 space-y-2 mb-6 mx-auto max-w-[260px]">
              <li>• Le catalogue complet de films et séries</li>
              <li>• Vos favoris et historique de visionnage</li>
              <li>• Les avantages VIP exclusifs</li>
              <li>• Une expérience sans publicité</li>
            </ul>
            <div className="text-xs text-gray-500">
              Votre inscription est 100% gratuite et sans engagement.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}