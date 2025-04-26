'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LoginForm from '@/components/auth/login-form';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  
  // Rediriger si déjà connecté
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            StreamFlow
          </h1>
          <p className="text-gray-400">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}