'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 shadow-xl rounded-2xl px-8 py-10 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
          <Lock className="w-6 h-6 text-primary" /> Connexion
        </h1>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-300 mb-1 font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
          />
        </div>
        <div className="mb-2">
          <label htmlFor="password" className="block text-gray-300 mb-1 font-medium">
            Mot de passe
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-200"
              tabIndex={-1}
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? "Cacher" : "Afficher"}
            >
              {showPwd
                ? <svg width="20" height="20" fill="none" stroke="currentColor"><path d="M13.875 18.825a10.05 10.05 0 01-3.875.675C4.6 19.5 1 13 1 13s1.95-3.45 5.4-6.075M6.125 5.175a10.05 10.05 0 013.875-.675C15.4 4.5 19 11 19 11s-1.95 3.45-5.4 6.075" strokeWidth="1.5" /><path d="M1 1l18 18" strokeWidth="1.5"/></svg>
                : <svg width="20" height="20" fill="none" stroke="currentColor"><ellipse cx="10" cy="10" rx="8" ry="5" strokeWidth="1.5"/><circle cx="10" cy="10" r="2" strokeWidth="1.5"/></svg>
              }
            </button>
          </div>
        </div>
        <div className="mb-2 flex justify-end">
          <a href="/reset-password" className="text-xs text-primary hover:underline">
            Mot de passe oublié ?
          </a>
        </div>
        {errorMsg && (
          <div className="bg-red-900/80 text-red-300 rounded p-2 mb-3 text-sm">{errorMsg}</div>
        )}
        <Button
          type="submit"
          className="w-full font-semibold flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          Se connecter
        </Button>
        <p className="text-center text-gray-400 text-sm mt-6">
          Pas encore de compte ?{" "}
          <a href="/inscription" className="text-primary font-medium hover:underline">
            S’inscrire
          </a>
        </p>
      </form>
    </main>
  );
}
