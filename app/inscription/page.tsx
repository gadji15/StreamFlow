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

  // Inline validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [confirmPwdError, setConfirmPwdError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  // Email format validation
  function validateEmail(val: string) {
    if (!val) return "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Format d'email invalide";
    return null;
  }
  // Password validation
  function validatePassword(val: string) {
    if (!val) return 'Le mot de passe est requis';
    if (val.length < 6) return '6 caractères minimum';
    return null;
  }
  // Confirm password
  function validateConfirmPwd(val: string) {
    if (!val) return 'Veuillez confirmer le mot de passe';
    if (val !== password) return 'Les mots de passe ne correspondent pas';
    return null;
  }
  // Name validation
  function validateName(val: string) {
    if (!val.trim()) return 'Votre nom ou prénom est requis';
    return null;
  }

  function handleBlurEmail() {
    setEmailError(validateEmail(email));
  }
  function handleBlurPassword() {
    setPwdError(validatePassword(password));
  }
  function handleBlurConfirmPwd() {
    setConfirmPwdError(validateConfirmPwd(confirmPwd));
  }
  function handleBlurName() {
    setNameError(validateName(fullName));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);

    // Validate all fields before submit
    const nameE = validateName(fullName);
    const emailE = validateEmail(email);
    const pwdE = validatePassword(password);
    const confirmE = validateConfirmPwd(confirmPwd);

    setNameError(nameE);
    setEmailError(emailE);
    setPwdError(pwdE);
    setConfirmPwdError(confirmE);

    if (nameE || emailE || pwdE || confirmE) {
      setFormError("Veuillez corriger les champs en erreur.");
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
        // Friendly error for common auth issues
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
                  className={`pl-10 ${nameError ? 'border-red-500' : ''}`}
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setNameError(null); }}
                  onBlur={handleBlurName}
                  disabled={loading}
                  required
                  autoComplete="name"
                />
              </div>
              {nameError && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {nameError}</div>}
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
                  className={`pl-10 ${emailError ? 'border-red-500' : ''}`}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(null); }}
                  onBlur={handleBlurEmail}
                  disabled={loading}
                  required
                  autoComplete="email"
                  ref={emailRef}
                />
              </div>
              {emailError && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {emailError}</div>}
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
                  className={`pl-10 pr-12 ${pwdError ? 'border-red-500' : ''}`}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPwdError(null); }}
                  onBlur={handleBlurPassword}
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
              {pwdError && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {pwdError}</div>}
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
                  className={`pl-10 pr-12 ${confirmPwdError ? 'border-red-500' : ''}`}
                  value={confirmPwd}
                  onChange={e => { setConfirmPwd(e.target.value); setConfirmPwdError(null); }}
                  onBlur={handleBlurConfirmPwd}
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
              {confirmPwdError && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {confirmPwdError}</div>}
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
