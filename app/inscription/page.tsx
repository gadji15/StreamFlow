'use client';

import { useState, useEffect, useRef } from 'react';

// Hook utilitaire pour détecter la largeur de l'écran
function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpointPx);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpointPx]);
  return isMobile;
}
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Mail, User, Lock, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from "@/lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";

function MobileRegisterForm(props: any) {
  // On reprend toute la logique du formulaire principal mais on compacte le rendu.
  // On passe les props du parent si besoin (sinon, duplique la logique ici).
  // Pour la démonstration, on réutilise le code du formulaire (on pourrait factoriser).
  // On peut aussi extraire la logique dans un hook partagé si le fichier grossit.

  // --- Copie de toute la logique d'état et validation du formulaire principal ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordStrength, setPasswordStrength] = useState<'faible' | 'moyen' | 'fort' | ''>('');
  const { toast } = useToast();
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name) newErrors.name = "Veuillez saisir votre nom.";
    if (!email) newErrors.email = "Veuillez saisir votre adresse email.";
    if (password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    if (!agreedToTerms) newErrors.terms = "Vous devez accepter les conditions d'utilisation.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({ title: "Erreur", description: Object.values(newErrors)[0], variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (error) {
        setErrors({ global: error.message || "Une erreur est survenue lors de l'inscription." });
        toast({
          title: "Erreur d'inscription",
          description: error.message || "Une erreur est survenue lors de l'inscription.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé. Vérifiez vos emails pour activer votre compte.",
      });
      router.replace(`/confirmation-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      setErrors({ global: error.message || "Une erreur est survenue lors de l'inscription." });
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (!password) setPasswordStrength('');
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) setPasswordStrength('faible');
    else if (score === 3 || score === 4) setPasswordStrength('moyen');
    else setPasswordStrength('fort');
  }, [password]);

  // Google Sign Up
  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/mon-compte` }
    });
    if (error) {
      toast({
        title: "Erreur Google",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 px-2">
      <div className="w-[95vw] max-w-xs bg-gray-900/95 rounded-2xl shadow-xl p-3 border border-gray-800 mx-auto">
        <div className="mb-3 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 justify-center">
            <UserPlus className="w-6 h-6 text-primary" /> Inscription
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-gray-200 border-gray-700 hover:bg-gray-700/70 transition mb-4"
          onClick={handleGoogleSignup}
          disabled={isSubmitting}
        >
          <FcGoogle className="h-5 w-5 mr-2" />
          Google
        </Button>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-1">
              Nom
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="pl-9 py-2 text-sm"
                placeholder="Nom"
                required
                disabled={isSubmitting}
                autoComplete="name"
                ref={nameInputRef}
                aria-invalid={!!errors.name}
              />
            </div>
            {errors.name && (
              <div className="text-red-500 text-xs mt-1">{errors.name}</div>
            )}
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-9 py-2 text-sm"
                placeholder="Email"
                required
                disabled={isSubmitting}
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && (
              <div className="text-red-500 text-xs mt-1">{errors.email}</div>
            )}
          </div>
          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-9 pr-9 py-2 text-sm"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={isSubmitting}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
                tabIndex={-1}
                disabled={isSubmitting}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {/* Barre de force du mot de passe */}
            {password && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-full h-1 rounded bg-gray-700 overflow-hidden">
                  <div
                    className={
                      "h-full transition-all duration-300 " +
                      (passwordStrength === "faible"
                        ? "bg-red-500 w-1/3"
                        : passwordStrength === "moyen"
                        ? "bg-yellow-400 w-2/3"
                        : passwordStrength === "fort"
                        ? "bg-green-500 w-full"
                        : "")
                    }
                  ></div>
                </div>
                <span className={
                  "text-xs ml-2 " +
                  (passwordStrength === "faible"
                    ? "text-red-500"
                    : passwordStrength === "moyen"
                    ? "text-yellow-400"
                    : passwordStrength === "fort"
                    ? "text-green-500"
                    : "")
                }>
                  {passwordStrength && ("Mot de passe " + passwordStrength)}
                </span>
              </div>
            )}
            {errors.password && (
              <div className="text-red-500 text-xs mt-1">{errors.password}</div>
            )}
          </div>
          {/* Confirmer mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-300 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="pl-9 pr-9 py-2 text-sm"
                placeholder="••••••••"
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
                tabIndex={-1}
                disabled={isSubmitting}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {/* Correspondance des mots de passe */}
            {confirmPassword && (
              <div className="flex items-center gap-2 mt-1">
                {password === confirmPassword ? (
                  <span className="text-green-500 text-xs flex items-center gap-1">
                    <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Ok
                  </span>
                ) : (
                  <span className="text-red-500 text-xs flex items-center gap-1">
                    <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    Non
                  </span>
                )}
              </div>
            )}
            {errors.confirmPassword && (
              <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>
            )}
          </div>
          {/* Conditions */}
          <div className="flex items-center space-x-2 mt-1 mb-1">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={checked => setAgreedToTerms(checked === true)}
              required
              disabled={isSubmitting}
              aria-invalid={!!errors.terms}
            />
            <label htmlFor="terms" className="text-xs text-gray-400">
              J'accepte les{" "}
              <Link href="/conditions-utilisation" className="text-indigo-400 hover:text-indigo-300 underline">
                conditions
              </Link>
              {" "}et la{" "}
              <Link href="/confidentialite" className="text-indigo-400 hover:text-indigo-300 underline">
                politique
              </Link>
            </label>
          </div>
          {errors.terms && (
            <div className="text-red-500 text-xs mb-2">{errors.terms}</div>
          )}
          <Button
            type="submit"
            className="w-full font-semibold mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Création...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Créer un compte
              </>
            )}
          </Button>
          {errors.global && (
            <div className="text-red-500 text-xs mt-2 text-center">{errors.global}</div>
          )}
          <div className="text-center mt-2 text-xs text-gray-400">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const isMobile = useIsMobile(768);
  if (isMobile) return <MobileRegisterForm />;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ajout état pour erreurs inline
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordStrength, setPasswordStrength] = useState<'faible' | 'moyen' | 'fort' | ''>('');
  
  const router = useRouter();
  const { toast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Optionally, redirect if user is already logged in
    // if (isLoggedIn) router.push('/');
    // Focus auto sur le champ nom
    nameInputRef.current?.focus();
  }, [router]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name) {
      newErrors.name = "Veuillez saisir votre nom.";
    }
    if (!email) {
      newErrors.email = "Veuillez saisir votre adresse email.";
    }
    if (password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
    if (!agreedToTerms) {
      newErrors.terms = "Vous devez accepter les conditions d'utilisation.";
    }
    setErrors(newErrors);

    // Toast général en cas d'erreur
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Erreur",
        description: Object.values(newErrors)[0],
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });

      if (error) {
        setErrors({ global: error.message || "Une erreur est survenue lors de l'inscription." });
        toast({
          title: "Erreur d'inscription",
          description: error.message || "Une erreur est survenue lors de l'inscription.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé. Vérifiez vos emails pour activer votre compte.",
      });

      // Redirection immédiate vers la page de confirmation avec l'email
      router.replace(`/confirmation-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      setErrors({ global: error.message || "Une erreur est survenue lors de l'inscription." });
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Barre de force du mot de passe
  useEffect(() => {
    if (!password) {
      setPasswordStrength('');
      return;
    }
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) setPasswordStrength('faible');
    else if (score === 3 || score === 4) setPasswordStrength('moyen');
    else setPasswordStrength('fort');
  }, [password]);

  // Google Sign Up
  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/mon-compte` }
    });
    if (error) {
      toast({
        title: "Erreur Google",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 px-2">
      <div className="w-[95vw] max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-gray-900/95 rounded-2xl shadow-2xl p-0 border border-gray-800 flex flex-col md:flex-row overflow-hidden mx-auto">
        {/* Section gauche : Formulaire */}
        <div className="flex-1 p-3 md:p-8 overflow-visible">
          <div className="mb-4 flex flex-col items-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour à l'accueil
            </Link>
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2 justify-center">
              <UserPlus className="w-7 h-7 text-primary" /> Créer un compte
            </h1>
            <p className="text-center text-gray-400 text-base">
              Profitez de tout le catalogue StreamFlow gratuitement.
            </p>
          </div>

          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-gray-200 border-gray-700 hover:bg-gray-700/70 transition mb-6"
            onClick={handleGoogleSignup}
            disabled={isSubmitting}
          >
            <FcGoogle className="h-5 w-5 mr-2" />
            Continuer avec Google
          </Button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Nom */}
              <div className="flex-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Votre nom"
                    required
                    disabled={isSubmitting}
                    autoComplete="name"
                    ref={nameInputRef}
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && (
                  <div className="text-red-500 text-xs mt-1">{errors.name}</div>
                )}
              </div>
              {/* Email */}
              <div className="flex-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="votre@email.com"
                    required
                    disabled={isSubmitting}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <div className="text-red-500 text-xs mt-1">{errors.email}</div>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Mot de passe */}
              <div className="flex-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
                    tabIndex={-1}
                    disabled={isSubmitting}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {/* Barre de force du mot de passe */}
                {password && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full h-1 rounded bg-gray-700 overflow-hidden">
                      <div
                        className={
                          "h-full transition-all duration-300 " +
                          (passwordStrength === "faible"
                            ? "bg-red-500 w-1/3"
                            : passwordStrength === "moyen"
                            ? "bg-yellow-400 w-2/3"
                            : passwordStrength === "fort"
                            ? "bg-green-500 w-full"
                            : "")
                        }
                      ></div>
                    </div>
                    <span className={
                      "text-xs ml-2 " +
                      (passwordStrength === "faible"
                        ? "text-red-500"
                        : passwordStrength === "moyen"
                        ? "text-yellow-400"
                        : passwordStrength === "fort"
                        ? "text-green-500"
                        : "")
                    }>
                      {passwordStrength && ("Mot de passe " + passwordStrength)}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                )}
              </div>
              {/* Confirmer mot de passe */}
              <div className="flex-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {/* Bouton show/hide identique au champ principal */}
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
                    tabIndex={-1}
                    disabled={isSubmitting}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {/* Correspondance des mots de passe */}
                {confirmPassword && (
                  <div className="flex items-center gap-2 mt-1">
                    {password === confirmPassword ? (
                      <span className="text-green-500 text-xs flex items-center gap-1">
                        <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Les mots de passe correspondent
                      </span>
                    ) : (
                      <span className="text-red-500 text-xs flex items-center gap-1">
                        <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        Les mots de passe ne correspondent pas
                      </span>
                    )}
                  </div>
                )}
                {errors.confirmPassword && (
                  <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>
                )}
              </div>
            </div>
            {/* Conditions */}
            <div className="flex items-center space-x-2 mt-1 mb-1">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={checked => setAgreedToTerms(checked === true)}
                required
                disabled={isSubmitting}
                aria-invalid={!!errors.terms}
              />
              <label htmlFor="terms" className="text-sm text-gray-400">
                J'accepte les{' '}
                <Link href="/conditions-utilisation" className="text-indigo-400 hover:text-indigo-300 underline">
                  conditions d'utilisation
                </Link>
                {' '}et la{' '}
                <Link href="/confidentialite" className="text-indigo-400 hover:text-indigo-300 underline">
                  politique de confidentialité
                </Link>
              </label>
            </div>
            {errors.terms && (
              <div className="text-red-500 text-xs mb-2">{errors.terms}</div>
            )}

            <Button
              type="submit"
              className="w-full font-semibold mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Création du compte...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Créer un compte
                </>
              )}
            </Button>
            {errors.global && (
              <div className="text-red-500 text-xs mt-2 text-center">{errors.global}</div>
            )}

            <div className="text-center mt-4 text-sm text-gray-400">
              Vous avez déjà un compte ?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Se connecter
              </Link>
            </div>
          </form>
        </div>
        {/* Section droite : Illustration ou informations */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-gray-800 p-6 lg:p-10 flex-1">
          <div className="max-w-xs mx-auto text-center">
            <UserPlus className="w-16 h-16 text-primary mx-auto mb-4" />
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
    </div>
  );
}