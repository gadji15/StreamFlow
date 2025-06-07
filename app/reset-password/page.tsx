'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Lire le token dans l'URL (Supabase passe access_token)
  const access_token = searchParams.get('access_token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirige si pas de token
  useEffect(() => {
    if (!access_token) {
      setError("Lien invalide ou expiré.");
    }
  }, [access_token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!access_token) {
      setError("Lien invalide ou expiré.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      // On doit se connecter temporairement avec le token de reset
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token: access_token,
      });
      if (sessionError) throw sessionError;

      // On met à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setDone(true);
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.",
      });
      setTimeout(() => router.replace('/login'), 1800);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la réinitialisation.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-4">Définir un nouveau mot de passe</h1>
        {!access_token ? (
          <div className="text-red-400 text-center">{error || "Lien invalide ou expiré."}</div>
        ) : done ? (
          <div className="text-green-500 text-center py-8">
            ✅ Mot de passe modifié avec succès&nbsp;!<br />
            Redirection vers la connexion...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Nouveau mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={8}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                minLength={8}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm text-center" aria-live="polite">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Changement en cours..." : "Changer mon mot de passe"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}