'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Clock, Heart, Settings, Edit, LogOut, 
  Sparkles, AlertTriangle, Shield, Activity, Film, Tv, Dices
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useWatchHistory } from '@/hooks/use-watch-history';
import { useToast } from "@/components/ui/use-toast";
import { useRef } from "react";

// Utilise le type WatchHistoryItem du hook pour rester aligné avec la source
import type { WatchHistoryItem } from '@/hooks/use-watch-history';

export default function MonComptePage() {
  const { userData, isVIP, isLoggedIn, isLoading, logout } = useSupabaseAuth();
  const { history, loading: historyLoading } = useWatchHistory();
  const router = useRouter();
  const { toast: showToast } = useToast();

  // Redirige vers /login si l'utilisateur n'est pas connecté,
  // mais attend que l'état d'auth soit déterminé
  useEffect(() => {
    if (!isLoading && isLoggedIn === false) {
      router.replace('/login?redirect=/mon-compte');
    }
  }, [isLoading, isLoggedIn, router]);
  
  // Affiche un loader tant que l'état d'auth n'est pas déterminé
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="text-gray-400">Chargement...</span>
      </div>
    );
  }
  if (isLoggedIn === false) {
    return null;
  }
  
  // Formatage de la date d'expiration VIP
  const formatExpiryDate = () => {
    if (!userData?.vipExpiry) return "Aucune date d'expiration";
    
    const expiryDate = new Date(userData.vipExpiry);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(expiryDate);
  };
  
  // Derniers éléments regardés
  const lastWatched = historyLoading ? [] : history.slice(0, 3);

  // Générer une couleur à partir d'un nom (simple hash)
  function stringToColor(str: string = "") {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  }

  // Badge VIP animé
  function AnimatedVIPBadge() {
    return (
      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400/20 text-amber-400 animate-pulse shadow animate-glow relative">
        <Sparkles className="w-3 h-3 mr-1 animate-spin-slow" />
        VIP
        <span className="absolute inset-0 rounded-full border-2 border-amber-400/50 animate-ping pointer-events-none" />
      </span>
    );
  }

  // Header dynamique StreamFlow
  function AccountHeader({ userName, isVIP }: { userName?: string, isVIP?: boolean }) {
    return (
      <div className="relative overflow-hidden rounded-lg mb-8">
        <div className="absolute inset-0 z-0 animate-gradient-x bg-gradient-to-r from-fuchsia-600 via-indigo-800 to-violet-900 opacity-70" />
        <div className="relative z-10 flex flex-col items-center justify-center py-10 text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-lg mb-2">
            {isVIP ? "👑 Bienvenue VIP" : "Bienvenue"}
            {userName ? `, ${userName.split(' ')[0]}` : ""}
          </h1>
          <p className="text-base sm:text-lg text-gray-200 font-medium">
            Gérez votre profil, abonnement et retrouvez tout votre univers StreamFlow.
          </p>
        </div>
      </div>
    );
  }

  // Refactor affichage d'un item d'historique (badge progression animée)
  function HistoryItem({ item }: { item: WatchHistoryItem }) {
    const progress = Math.round(item.progress ?? 0);
    const status = progress >= 98 ? "Terminé" : "En cours";
    const statusColor = progress >= 98 ? "bg-green-600/30 text-green-500" : "bg-blue-600/30 text-blue-400";
    const posterSrc = item.poster_url || ""; // Utilisez uniquement poster_url
    return (
      <div key={item.id} className="flex items-center gap-3 group">
        <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center relative">
          {posterSrc ? (
            <img 
              src={posterSrc}
              alt={item.title || "Affiche"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={e => { (e.currentTarget as HTMLImageElement).src = "/placeholder-poster.png"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              {item.content_type === 'movie' ? <Film className="w-6 h-6" /> : <Tv className="w-6 h-6" />}
            </div>
          )}
          {/* Cercle de progression dynamique */}
          <span className={`absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow ${statusColor} animate-bounce`}>
            {status}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {item.title || 'Contenu'}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {new Intl.DateTimeFormat('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            }).format(new Date(item.watched_at))}
            {' • '}
            {item.content_type === 'movie' ? 'Film' : item.content_type === 'series' ? 'Série' : 'Épisode'}
            {' • '}
            {progress}% terminé
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header dynamique StreamFlow */}
      <AccountHeader userName={userData?.displayName} isVIP={isVIP ?? undefined} />

      {/* Profil utilisateur */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-20 w-20 shadow-lg ring-2 ring-primary/30">
              <AvatarImage
                src={userData?.photoURL || ''}
                alt={userData?.displayName || 'Utilisateur'}
                onError={e => { (e.currentTarget as HTMLImageElement).src = "/placeholder-avatar.png"; }}
              />
              <AvatarFallback
                className="text-2xl"
                style={{
                  background: stringToColor(userData?.displayName),
                  color: "#fff"
                }}
              >
                {userData?.displayName
                  ? userData.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                  : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl flex items-center gap-1">
                {userData?.displayName || 'Utilisateur'}
                {isVIP && <AnimatedVIPBadge />}
              </CardTitle>
              <CardDescription>{userData?.email}</CardDescription>
              
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  aria-label="Modifier le profil"
                >
                  <Link href="/mon-compte/edit">
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier le profil
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Se déconnecter"
                  onClick={() => {
                    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
                      logout();
                      showToast({ title: "Déconnexion réussie", description: "Vous avez été déconnecté.", variant: "default" });
                    }
                  }}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Statut VIP */}
      <Card className={isVIP ? "border-amber-500/30 bg-gradient-to-b from-amber-950/10 to-transparent" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Sparkles className={`w-5 h-5 mr-2 ${isVIP ? 'text-amber-400' : 'text-gray-400'}`} />
            Statut VIP
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isVIP ? (
            <div>
              <p className="text-amber-400 font-semibold">Membre VIP actif</p>
              <p className="text-sm text-gray-400 mt-1">
                Votre abonnement expire le {formatExpiryDate()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Vous n&apos;êtes pas encore membre VIP. Accédez à du contenu exclusif et profitez de tous les avantages.
            </p>
          )}
        </CardContent>
        <CardFooter>
          {isVIP ? (
            <Button variant="outline" asChild>
              <Link href="/mon-compte/abonnement">Gérer mon abonnement</Link>
            </Button>
          ) : (
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" asChild>
              <Link href="/vip">
                <Sparkles className="w-4 h-4 mr-2" />
                Devenir VIP
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Historique récent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="w-5 h-5 mr-2 animate-pulse text-primary" />
            Historique récent
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-800 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : lastWatched.length > 0 ? (
            <div className="space-y-3">
              {lastWatched.map(item => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Vous n&apos;avez pas encore regardé de contenu.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto animate-bounce"
            aria-label="Voir tout l'historique"
          >
            <Link href="/mon-compte/historique">Voir tout l&apos;historique</Link>
          </Button>
        </CardFooter>
      </Card>
      
      {/* Navigation rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:bg-gray-800/50 transition-colors">
          <Link href="/mon-compte/favoris" className="block p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Mes favoris</h3>
                <p className="text-sm text-gray-400">Films et séries sauvegardés</p>
              </div>
            </div>
          </Link>
        </Card>
        
        <Card className="hover:bg-gray-800/50 transition-colors">
          <Link href="/mon-compte/appareils" className="block p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-full">
                <Dices className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium">Appareils connectés</h3>
                <p className="text-sm text-gray-400">Gérer vos connexions</p>
              </div>
            </div>
          </Link>
        </Card>
        
        <Card className="hover:bg-gray-800/50 transition-colors">
          <Link href="/mon-compte/mot-de-passe" className="block p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/10 p-2 rounded-full">
                <Shield className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-medium">Sécurité</h3>
                <p className="text-sm text-gray-400">Mot de passe et authentification</p>
              </div>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  );
}