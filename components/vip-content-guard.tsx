'use client';

import { useState, useEffect } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface VipContentGuardProps {
  children: React.ReactNode;
  isVIPContent: boolean;
  contentTitle: string;
  contentType: 'film' | 'série' | 'épisode';
}

export default function VipContentGuard({ 
  children, 
  isVIPContent, 
  contentTitle,
  contentType
}: VipContentGuardProps) {
  const { isVIP, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  
  // Si ce n'est pas du contenu VIP ou si l'utilisateur est VIP, afficher le contenu normalement
  if (!isVIPContent || isVIP) {
    return <>{children}</>;
  }
  
  // Si l'authentification est en cours de chargement, afficher un indicateur
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Afficher la garde pour le contenu VIP
  return (
    <div className="rounded-lg border border-amber-600/30 bg-gradient-to-b from-amber-950/20 to-amber-900/10 p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-amber-600/20 p-3 rounded-full">
          <Lock className="h-8 w-8 text-amber-500" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Contenu VIP exclusif</h2>
      <p className="text-gray-300 mb-6">
        Ce {contentType} fait partie de notre contenu exclusif VIP. 
        Abonnez-vous pour débloquer <strong>{contentTitle}</strong> et des centaines d'autres titres premium.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          onClick={() => router.push('/vip')}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Devenir membre VIP
        </Button>
        
        {!isLoggedIn && (
          <Button 
            variant="outline" 
            onClick={() => router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))}
          >
            Se connecter
          </Button>
        )}
      </div>
    </div>
  );
}