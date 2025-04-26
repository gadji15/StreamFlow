'use client';

import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminUnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <Shield className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          Accès non autorisé
        </h1>
        
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          Vous n'avez pas les permissions nécessaires pour accéder à cette section de l'administration.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au site
            </Button>
          </Link>
          
          <Link href="/admin/auth/login">
            <Button>
              Se connecter avec un autre compte
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}