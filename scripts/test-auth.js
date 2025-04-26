// Test d'authentification Firebase
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut
} = require('firebase/auth');
const {
  getFirestore,
  doc,
  getDoc
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

// Informations d'authentification
const email = "admin@streamflow.com";
const password = "Admin123!";

async function testAuthentication() {
  try {
    console.log('\n🔍 TEST D\'AUTHENTIFICATION FIREBASE 🔍\n');
    
    console.log('Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    // Test de connexion
    console.log(`Tentative de connexion avec ${email}...`);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Connexion réussie!');
    console.log(`UID: ${user.uid}`);
    console.log(`Email: ${user.email}`);
    
    // Vérifier si l'utilisateur est un administrateur
    console.log('\nVérification des droits d\'administration...');
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);
    
    if (adminSnap.exists()) {
      console.log('✅ L\'utilisateur est bien un administrateur');
      console.log(`Nom: ${adminSnap.data().name}`);
      console.log(`Rôle: ${adminSnap.data().role}`);
      console.log(`Statut: ${adminSnap.data().isActive ? 'Actif' : 'Inactif'}`);
    } else {
      console.log('❌ L\'utilisateur n\'est PAS un administrateur');
      console.log('Vous devez ajouter ce utilisateur à la collection "admins"');
    }
    
    // Déconnexion
    console.log('\nDéconnexion...');
    await signOut(auth);
    console.log('✅ Déconnexion réussie');
    
    console.log('\n✅ TEST D\'AUTHENTIFICATION TERMINÉ');
    console.log('Vous pouvez maintenant vous connecter à l\'interface d\'administration avec:');
    console.log(`Email: ${email}`);
    console.log(`Mot de passe: ${password}`);
    
  } catch (error) {
    console.error('\n❌ ERREUR lors du test d\'authentification:');
    console.error(error);
    
    // Conseils de dépannage basés sur le type d'erreur
    if (error.code === 'auth/invalid-credential') {
      console.log('\n⚠️ Identifiants incorrects. Vérifiez que:');
      console.log('1. L\'utilisateur admin@streamflow.com existe dans Firebase Authentication');
      console.log('2. Le mot de passe est correct');
      console.log('\nExécutez scripts/create-admin.js pour créer l\'administrateur');
    } else if (error.code === 'auth/network-request-failed') {
      console.log('\n⚠️ Problème de connexion réseau. Vérifiez votre connexion internet');
    } else if (error.code === 'auth/user-disabled') {
      console.log('\n⚠️ Ce compte utilisateur a été désactivé');
    } else if (error.code === 'auth/configuration-not-found') {
      console.log('\n⚠️ Problème de configuration Firebase. Vérifiez vos clés dans .env.local');
    }
  }
}

testAuthentication();