// Script de diagnostic pour Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');
const { getAuth } = require('firebase/auth');

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

// Fonction de diagnostic
async function diagnoseFbConfig() {
  try {
    console.log('\n🔍 DIAGNOSTIC FIREBASE 🔍\n');
    
    console.log('Configuration Firebase détectée:');
    console.log(`apiKey: ${firebaseConfig.apiKey ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`authDomain: ${firebaseConfig.authDomain ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`projectId: ${firebaseConfig.projectId ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`storageBucket: ${firebaseConfig.storageBucket ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`messagingSenderId: ${firebaseConfig.messagingSenderId ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`appId: ${firebaseConfig.appId ? '✅ Définie' : '❌ Manquante'}`);
    
    console.log('\nInitialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase App initialisée');
    
    console.log('\nTest des services Firebase:');
    
    // Test Firestore
    try {
      const db = getFirestore(app);
      console.log('✅ Firestore initialisé');
    } catch (error) {
      console.log('❌ Erreur Firestore:', error.message);
    }
    
    // Test Auth
    try {
      const auth = getAuth(app);
      console.log('✅ Authentication initialisé');
    } catch (error) {
      console.log('❌ Erreur Authentication:', error.message);
    }
    
    // Test Storage
    try {
      const storage = getStorage(app);
      console.log('✅ Storage initialisé');
      
      // Vérifiez si le bucket est correctement défini
      if (storage.bucket) {
        console.log(`✅ Bucket Storage configuré: ${storage.bucket}`);
      } else {
        console.log('⚠️ Bucket Storage non défini dans l\'objet storage');
      }
    } catch (error) {
      console.log('❌ Erreur Storage:', error.message);
      console.log('\nCeci est probablement le problème que vous rencontrez.');
      console.log('Assurez-vous que:');
      console.log('1. Votre projet Firebase a le service Storage activé');
      console.log('2. Votre storageBucket dans .env.local est correct');
      console.log('3. Vous avez sélectionné une région compatible avec le plan gratuit');
    }
    
    console.log('\n🔍 DIAGNOSTIC TERMINÉ 🔍');
  } catch (error) {
    console.error('\n❌ Erreur générale:', error);
  }
}

diagnoseFbConfig();