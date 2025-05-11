'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre email et mot de passe.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Authentification Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.user) {
        toast({
          title: "Erreur d'authentification",
          description: "Email ou mot de passe incorrect.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Vérifier le rôle admin dans user_roles_flat
      const { user } = data;
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles_flat')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        toast({
          title: "Erreur",
          description: "Impossible de vérifier le rôle utilisateur.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const roleNames = (roles || []).map(r => r.role);
      const isAdmin = roleNames.includes('admin') || roleNames.includes('super_admin');

      if (!isAdmin) {
        await supabase.auth.signOut();
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits administrateur.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue, accès admin autorisé.",
      });

      router.push('/admin/dashboard');
    } catch (error) {
      toast({
        title: "Erreur d'authentification",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            StreamFlow <span className="text-indigo-500">Admin</span>
          </h1>
          <p className="mt-2 text-gray-400">
            Interface d'administration
          </p>
        </div>
        
        <div className="bg-gray-800 shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="admin@streamflow.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => 
                    setRememberMe(checked === true)
                  }
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Se souvenir de moi
                </label>
              </div>
              
              <div className="text-sm">
                <Link href="/admin/auth/forgot-password" className="text-indigo-400 hover:text-indigo-300">
                  Mot de passe oublié?
                </Link>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Retour au site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}