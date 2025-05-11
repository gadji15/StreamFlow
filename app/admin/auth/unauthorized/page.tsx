'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function UnauthorizedPage() {
  const { isLoggedIn } = useSupabaseAuth();
  const router = useRouter();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center">
          <Shield className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="mb-3 text-3xl font-bold">Accès non autorisé</h1>
        <p className="mb-8 max-w-md text-gray-400">
          Vous n'avez pas les droits nécessaires pour accéder à cette section 
          d'administration. Veuillez contacter un administrateur si vous pensez 
          que cette restriction est une erreur.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Button>
          
          {!isLoggedIn ? (
            <Button
              size="lg"
              onClick={() => router.push('/admin/auth/login')}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Se connecter
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}