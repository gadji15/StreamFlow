'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, LogIn, Mail } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // For Google button loading state
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Erreur lors de la connexion.");
    } else {
      router.push('/');
    }
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900/95 shadow-2xl p-8 border border-gray-800">
        <h1 className="text-2xl font-bold mb-1 text-center flex items-center gap-2 justify-center">
          <LogIn className="w-6 h-6 text-primary" /> Connexion
        </h1>
        <p className="text-center text-gray-400 mb-6">Connectez-vous à votre compte StreamFlow</p>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-700 bg-gray-800 py-2.5 text-sm font-semibold text-gray-100 hover:bg-gray-700 transition mb-5 shadow-sm"
          disabled={googleLoading}
          aria-label="Connexion avec Google"
        >
          <FcGoogle className="w-6 h-6" />
          {googleLoading ? "Connexion..." : "Se connecter avec Google"}
        </button>

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
    </main>
  );
}
