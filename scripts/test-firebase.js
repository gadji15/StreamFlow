// Ce script permet de tester la connexion à Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
const { getStorage } = require('firebase/storage');

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

async function testFirebase() {
  try {
    console.log('Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log('Firebase initialisé avec succès!');
    
    // Tester Firestore
    console.log('Test de connexion à Firestore...');
    const db = getFirestore(app);
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    console.log('Connexion à Firestore réussie!');
    
    // Tester Auth
    console.log('Test de connexion à Authentication...');
    const auth = getAuth(app);
    console.log('Auth initialisé:', auth ? 'Oui' : 'Non');
    
    // Tester Storage
    console.log('Test de connexion à Storage...');
    const storage = getStorage(app);
    console.log('Storage initialisé:', storage ? 'Oui' : 'Non');
    
    console.log('\n✅ Tous les tests ont réussi! Firebase est correctement configuré.');
  } catch (error) {
    console.error('\n❌ Erreur lors du test de Firebase:');
    console.error(error);
    console.log('\nVérifiez que:');
    console.log('1. Vos clés Firebase dans .env.local sont correctes');
    console.log('2. Vous avez activé Firestore, Authentication et Storage dans votre projet Firebase');
    console.log('3. Vous avez les règles adéquates pour accéder à vos services Firebase');
  }
}

testFirebase();