'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Mail, User as UserIcon, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation and feedback
  const [fieldError, setFieldError] = useState<{ [k: string]: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validation helpers
  function validateAll() {
    const errors: { [k: string]: string } = {};
    if (!fullName.trim()) errors.fullName = "Nom requis";
    if (!email.trim()) errors.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Format email invalide";
    if (!password) errors.password = "Mot de passe requis";
    else if (password.length < 6) errors.password = "6 caractères min.";
    if (!confirmPwd) errors.confirmPwd = "Confirmation requise";
    else if (confirmPwd !== password) errors.confirmPwd = "Les mots de passe ne correspondent pas";
    return errors;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);

    const errors = validateAll();
    setFieldError(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("Corrigez les champs en erreur.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) {
        if (error.message && /already/i.test(error.message)) {
          setFormError("Cet email est déjà utilisé. Essayez de vous connecter.");
        } else {
          setFormError(error.message || "Erreur lors de l'inscription.");
        }
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.replace('/login');
      }, 2400);
    } catch (e: any) {
      setFormError(e.message || 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="w-full max-w-md bg-gray-900/95 rounded-xl shadow-xl p-8 border border-gray-800">
        <h1 className="text-2xl font-bold text-center mb-2 flex items-center gap-2 justify-center">
          <UserIcon className="w-6 h-6 text-primary" /> Créer un compte
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Profitez de tout le catalogue StreamFlow gratuitement.
        </p>

        {success ? (
          <div className="bg-green-900/85 border border-green-700 text-green-200 rounded px-3 py-6 text-center mb-6 flex flex-col items-center">
            <CheckCircle2 className="w-10 h-10 mb-2 text-green-400" />
            <div className="text-lg font-bold mb-1">Inscription réussie !</div>
            <div>Vérifiez votre boîte email pour activer votre compte.</div>
            <Button
              className="mt-6 w-full"
              onClick={() => router.replace('/login')}
            >
              Se connecter
            </Button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleRegister} autoComplete="off" noValidate>
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="fullname">
                Nom complet
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Votre nom ou prénom"
                  className={`pl-10 ${fieldError.fullName ? 'border-red-500' : ''}`}
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setFieldError(f => ({ ...f, fullName: '' })); }}
                  disabled={loading}
                  required
                  autoComplete="name"
                />
              </div>
              {fieldError.fullName && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {fieldError.fullName}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className={`pl-10 ${fieldError.email ? 'border-red-500' : ''}`}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFieldError(f => ({ ...f, email: '' })); }}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
              {fieldError.email && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {fieldError.email}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Créer un mot de passe"
                  className={`pl-10 pr-12 ${fieldError.password ? 'border-red-500' : ''}`}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldError(f => ({ ...f, password: '' })); }}
                  disabled={loading}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-2 text-gray-400 hover:text-primary focus:outline-none"
                  onClick={() => setShowPwd(v => !v)}
                  disabled={loading}
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldError.password && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {fieldError.password}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="confirm-pwd">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="confirm-pwd"
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="Répétez votre mot de passe"
                  className={`pl-10 pr-12 ${fieldError.confirmPwd ? 'border-red-500' : ''}`}
                  value={confirmPwd}
                  onChange={e => { setConfirmPwd(e.target.value); setFieldError(f => ({ ...f, confirmPwd: '' })); }}
                  disabled={loading}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-2 text-gray-400 hover:text-primary focus:outline-none"
                  onClick={() => setShowConfirmPwd(v => !v)}
                  disabled={loading}
                  aria-label={showConfirmPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldError.confirmPwd && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {fieldError.confirmPwd}</div>}
            </div>
            {formError && (
              <div className="bg-red-900/85 border border-red-700 text-red-200 rounded px-3 py-2 text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> {formError}
              </div>
            )}
            <Button
              type="submit"
              className="w-full justify-center font-semibold"
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
              S'inscrire
            </Button>
          </form>
        )}

        <div className="text-center mt-6 text-sm text-gray-400">
          Déjà inscrit ?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
