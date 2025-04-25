// Ce script initialise les collections principales dans Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Chargez les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

async function setupCollections() {
  try {
    console.log('Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Créer un document initial dans la collection statistics
    console.log('Création des statistiques initiales...');
    await setDoc(doc(db, "statistics", "global"), {
      totalUsers: 0,
      activeUsers: 0,
      vipUsers: 0,
      totalMovies: 0,
      publishedMovies: 0,
      totalSeries: 0,
      publishedSeries: 0,
      totalViews: 0,
      topGenres: {},
      lastUpdated: new Date().toISOString()
    });

    // Créer un film exemple
    console.log('Ajout d\'un film exemple...');
    await setDoc(doc(db, "movies", "example-movie"), {
      title: "Exemple de film",
      description: "Ceci est un exemple de film pour tester la base de données.",
      releaseYear: 2023,
      duration: 120,
      genre: "Exemple",
      genres: ["Exemple", "Test"],
      vipOnly: false,
      status: "published",
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "system"
    });

    console.log('\n✅ Initialisation des collections terminée !');
    console.log('Vous pouvez maintenant vérifier dans la console Firebase que les collections ont été créées.');
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation des collections:');
    console.error(error);
  }
}

setupCollections();