import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';
import { useAuth } from './use-auth';
import { serverTimestamp } from 'firebase/firestore';

interface WatchHistoryItem {
  id: string;
  contentId: string;
  contentType: 'movie' | 'series' | 'episode';
  title: string;
  posterUrl?: string;
  progress: number; // pourcentage de visionnage
  duration: number; // durée en secondes
  watchedAt: Date;
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isLoggedIn } = useAuth();
  
  // Charger l'historique de visionnage
  useEffect(() => {
    async function loadWatchHistory() {
      if (!isLoggedIn || !user?.uid) {
        setHistory([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const historyQuery = query(
          collection(firestore, 'users', user.uid, 'watchHistory'),
          orderBy('watchedAt', 'desc'),
          limit(50)
        );
        
        const snapshot = await getDocs(historyQuery);
        const historyItems: WatchHistoryItem[] = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          historyItems.push({
            id: doc.id,
            contentId: data.contentId,
            contentType: data.contentType,
            title: data.title,
            posterUrl: data.posterUrl,
            progress: data.progress,
            duration: data.duration,
            watchedAt: data.watchedAt.toDate()
          });
        });
        
        setHistory(historyItems);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'historique:', err);
        setError('Impossible de charger l\'historique de visionnage');
      } finally {
        setLoading(false);
      }
    }
    
    loadWatchHistory();
  }, [user, isLoggedIn]);
  
  // Ajouter une entrée à l'historique
  const addToHistory = async (item: Omit<WatchHistoryItem, 'id' | 'watchedAt'>) => {
    if (!isLoggedIn || !user?.uid) {
      return false;
    }
    
    try {
      // ID unique basé sur le contenu pour éviter les doublons
      const historyId = `${item.contentType}_${item.contentId}`;
      
      await setDoc(
        doc(firestore, 'users', user.uid, 'watchHistory', historyId),
        {
          ...item,
          watchedAt: serverTimestamp()
        }
      );
      
      // Rafraîchir l'historique local
      setHistory(prev => {
        // Filtrer l'élément existant s'il est déjà présent
        const filtered = prev.filter(h => h.id !== historyId);
        
        // Ajouter le nouvel élément au début
        return [
          { 
            ...item, 
            id: historyId, 
            watchedAt: new Date() 
          },
          ...filtered
        ];
      });
      
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout à l\'historique:', err);
      return false;
    }
  };
  
  // Récupérer la progression d'un contenu
  const getProgress = async (contentType: 'movie' | 'series' | 'episode', contentId: string) => {
    if (!isLoggedIn || !user?.uid) {
      return 0;
    }
    
    try {
      const historyId = `${contentType}_${contentId}`;
      const docRef = doc(firestore, 'users', user.uid, 'watchHistory', historyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().progress;
      }
      
      return 0;
    } catch (err) {
      console.error('Erreur lors de la récupération de la progression:', err);
      return 0;
    }
  };
  
  return { 
    history,
    loading,
    error,
    addToHistory,
    getProgress
  };
}