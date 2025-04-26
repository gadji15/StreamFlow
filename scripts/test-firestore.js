// Test de Firestore
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc,
  query,
  getDocs,
  doc,
  deleteDoc
} = require('firebase/firestore');

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

async function testFirestore() {
  try {
    console.log('Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('\n🔍 TEST FIRESTORE 🔍');
    
    // 1. Ajouter un document test
    console.log('\n1. Ajout d\'un document test...');
    const testCollection = collection(db, 'test_collection');
    const testData = {
      name: 'Test Document',
      createdAt: new Date().toISOString(),
      value: Math.random().toString(36).substring(7)
    };
    
    const docRef = await addDoc(testCollection, testData);
    console.log(`✅ Document ajouté avec ID: ${docRef.id}`);
    
    // 2. Lire des documents
    console.log('\n2. Lecture des documents...');
    const q = query(testCollection);
    const querySnapshot = await getDocs(q);
    
    console.log(`✅ ${querySnapshot.size} document(s) trouvé(s)`);
    querySnapshot.forEach(doc => {
      console.log(`- Document ${doc.id}: ${JSON.stringify(doc.data())}`);
    });
    
    // 3. Supprimer le document de test
    console.log('\n3. Suppression du document test...');
    await deleteDoc(doc(db, 'test_collection', docRef.id));
    console.log(`✅ Document ${docRef.id} supprimé`);
    
    console.log('\n✅ TEST FIRESTORE RÉUSSI!');
    console.log('Firebase Firestore est correctement configuré et fonctionne.');
    
  } catch (error) {
    console.error('\n❌ ERREUR lors du test Firestore:');
    console.error(error);
    
    if (error.code === 'permission-denied') {
      console.log('\n⚠️ Erreur de permission - Vérifiez vos règles de sécurité Firestore');
    } else if (error.code === 'not-found') {
      console.log('\n⚠️ Collection ou document non trouvé');
    } else if (error.message && error.message.includes('projectId')) {
      console.log('\n⚠️ Problème avec l\'ID du projet - Vérifiez NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    }
  }
}

testFirestore();