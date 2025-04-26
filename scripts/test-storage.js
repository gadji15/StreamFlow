// Ce script teste le téléchargement vers Firebase Storage
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadString, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
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

async function testStorage() {
  try {
    console.log('Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    
    console.log('Téléchargement d\'un fichier test...');
    
    // Créer une référence au fichier de test
    const testRef = ref(storage, 'test/test-file.txt');
    
    // Télécharger une chaîne simple comme test
    await uploadString(testRef, 'Ce fichier est un test de Firebase Storage');
    
    // Obtenir l'URL de téléchargement
    const url = await getDownloadURL(testRef);
    
    console.log('\n✅ Test de Storage réussi!');
    console.log('URL du fichier téléchargé:', url);
    console.log('\nVous pouvez vérifier dans la console Firebase Storage que le fichier a été créé.');
  } catch (error) {
    console.error('\n❌ Erreur lors du test de Firebase Storage:');
    console.error(error);
    
    if (error.code === 'storage/unauthorized') {
      console.log('\nERREUR D\'AUTORISATION: Vérifiez que vos règles de sécurité permettent l\'écriture.');
    }
    else if (error.code === 'storage/unknown') {
      console.log('\nERREUR INCONNUE: Vérifiez que votre bucket Storage est bien configuré.');
      console.log('Assurez-vous que storageBucket dans .env.local est correct.');
    }
  }
}

testStorage();