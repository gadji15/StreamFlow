import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';

// Cache des genres pour éviter des appels répétés à Firestore
let genresCache: { id: string; name: string }[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 heure en millisecondes

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    
    // Utiliser le cache si disponible et pas trop ancien
    if (genresCache && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json(genresCache);
    }
    
    // Récupérer les genres depuis Firestore
    const genresCollection = collection(firestore, 'genres');
    const snapshot = await getDocs(genresCollection);
    
    // Transformer les documents en objets plus simples
    const genres = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));
    
    // Trier les genres par nom
    genres.sort((a, b) => a.name.localeCompare(b.name));
    
    // Mettre à jour le cache
    genresCache = genres;
    lastFetchTime = now;
    
    return NextResponse.json(genres);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des genres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur: ' + (error.message || 'Erreur inconnue') },
      { status: 500 }
    );
  }
}