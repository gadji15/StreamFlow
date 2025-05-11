'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Mail, User, Lock, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from "@/lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Optionally, redirect if user is already logged in
    // if (isLoggedIn) router.push('/');
  }, [router]);

  const validateForm = () => {
    if (!name) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre nom.",
        variant: "destructive",
      });
      return false;
    }
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre adresse email.",
        variant: "destructive",
      });
      return false;
    }
    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return false;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return false;
    }
    if (!agreedToTerms) {
      toast({
        title: "Erreur",
        description: "Vous devez accepter les conditions d'utilisation.",
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

      setTimeout(() => router.replace('/login'), 2000);
    } catch (error: any) {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-900/95 rounded-2xl shadow-2xl p-8 border border-gray-800">
        <div className="mb-6 flex flex-col items-center">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom */}
          <div>
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
              />
            </div>
          </div>
          {/* Email */}
          <div>
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
              />
            </div>
          </div>
          {/* Mot de passe */}
          <div>
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
          </div>
          {/* Confirmer mot de passe */}
          <div>
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
                className="pl-10"
                placeholder="••••••••"
                required
                disabled={isSubmitting}
                autoComplete="new-password"
              />
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

          <div className="text-center mt-4 text-sm text-gray-400">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}